# Google Sheet + Apps Script — Form Submission CDC

Form di website mengirim JSON ke webhook Apps Script. Payload berbeda per `formType`,
plus parameter `utm_*` yang dinamis. Script di bawah membuat **satu tab per formType**
dan **menambah kolom otomatis** kalau ada field baru — jadi aman walau payload berubah.

## 1. Bentuk payload yang dikirim website

```jsonc
// VJF (event/[slug] VJFRegistrationForm)
{ "formType": "vjf", "name": "...", "email": "...", "phone": "...",
  "interestedKuliahKerja": "ya|tidak", "eventId": "...",
  "utm_source": "...", "utm_medium": "...", "utm_campaign": "..." }  // utm opsional

// Rekrutmen Offline
{ "formType": "offline", "name": "...", "email": "...", "phone": "...", "eventId": "..." }

// Lamaran Loker (job-application)
{ "formType": "job-application", "name": "...", "email": "...", "phone": "...",
  "cvLink": "https://...", "jobId": "...", "message": "..." }
```

## 2. Struktur Spreadsheet

Buat 1 Spreadsheet, biarkan kosong — script otomatis membuat tab + header saat
submission pertama masuk. Tab yang akan dibuat:

| Tab | Kolom (urutan dibuat otomatis, kolom A selalu `timestamp`) |
|-----|------------------------------------------------------------|
| `vjf` | timestamp, name, email, phone, interestedKuliahKerja, eventId, utm_source, utm_medium, utm_campaign, … |
| `offline` | timestamp, name, email, phone, eventId |
| `job-application` | timestamp, name, email, phone, cvLink, jobId, message |

Kolom `utm_*` baru muncul saat ada submission yang membawanya, dan ditambahkan
di ujung kanan secara otomatis.

## 3. Apps Script

Buka Spreadsheet → **Extensions → Apps Script** → hapus isi default → paste:

```javascript
// CDC form-submit webhook. Satu tab per formType, header auto-grow.
const LOCK_TIMEOUT_MS = 10000;

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(LOCK_TIMEOUT_MS);
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const formType = String(body.formType || 'unknown');

    // Field yang masuk ke sheet (selain formType).
    const row = {};
    Object.keys(body).forEach(function (k) {
      if (k !== 'formType') row[k] = body[k];
    });

    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(formType);
    if (!sheet) {
      sheet = ss.insertSheet(formType);
      sheet.appendRow(['timestamp']); // kolom A
    }

    // Header sekarang.
    let headers = sheet.getRange(1, 1, 1, sheet.getLastColumn())
      .getValues()[0].filter(String);

    // Tambah kolom untuk key baru yang belum ada.
    const newKeys = Object.keys(row).filter(function (k) {
      return headers.indexOf(k) === -1;
    });
    if (newKeys.length) {
      sheet.getRange(1, headers.length + 1, 1, newKeys.length)
        .setValues([newKeys]);
      headers = headers.concat(newKeys);
    }

    // Susun baris sesuai urutan header.
    const record = headers.map(function (h) {
      if (h === 'timestamp') {
        return Utilities.formatDate(new Date(), 'Asia/Jakarta', 'yyyy-MM-dd HH:mm:ss');
      }
      return row[h] !== undefined ? row[h] : '';
    });
    sheet.appendRow(record);

    return json({ success: true });
  } catch (err) {
    return json({ success: false, error: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return json({ ok: true, info: 'CDC form-submit webhook is live' });
}

function json(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
```

## 4. Deploy

1. Klik **Deploy → New deployment**.
2. Type: **Web app**.
3. **Execute as:** Me. **Who has access:** Anyone.
4. **Deploy** → salin **Web app URL** (berakhiran `/exec`).

## 5. Hubungkan ke website

Tambahkan ke `.env.local` (lalu restart dev / redeploy):

```
GOOGLE_SHEET_WEBHOOK_URL=https://script.google.com/macros/s/XXXXXXXX/exec
```

> Tanpa env ini, submission hanya di-log ke console server (dev fallback) dan tidak
> tersimpan ke sheet — tapi form tetap "berhasil".

## 6. Tes

- Submit form VJF di website → cek tab `vjf` terisi 1 baris dengan timestamp + utm.
- Atau tes manual dari terminal:

```bash
curl -X POST "<WEB_APP_URL>" -H "Content-Type: application/json" \
  -d '{"formType":"vjf","name":"Tes","email":"t@e.com","phone":"081234567890","interestedKuliahKerja":"ya","eventId":"90","utm_source":"cdc","utm_medium":"banner"}'
```

## Catatan
- Re-deploy script **tidak** mengubah URL kalau pakai **Manage deployments → Edit →
  Version: New version**. Kalau "New deployment", URL berubah → update env lagi.
- Kolom UTM hanya terisi kalau user datang via link ber-UTM; submission tanpa UTM
  membiarkan sel itu kosong.
