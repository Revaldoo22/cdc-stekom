# Prompt untuk Membuat Apps Script (Form CDC) — Lanjutan

Pakai SETELAH spreadsheet & tab dibuat (lihat [prompt-buat-sheet.md](prompt-buat-sheet.md)).
Salin blok di bawah ini, tempel ke asisten AI untuk menghasilkan kode Apps Script lengkap.

---

Buatkan Google Apps Script (Web App `doPost`) lengkap dan siap pakai untuk menerima
submission form dari website dan menyimpannya ke Google Spreadsheet yang tab-tabnya
sudah saya siapkan. Berikan juga instruksi deploy.

**Konteks**: Website mengirim HTTP POST berisi JSON ke URL Web App. Ada 3 jenis form
yang dibedakan oleh field `formType`. Selain field form, payload BISA membawa parameter
UTM (`utm_source`, `utm_medium`, `utm_campaign`, dll) yang jumlah dan namanya dinamis.

**Contoh payload yang diterima**:

```json
{ "formType": "vjf", "name": "Budi", "email": "budi@mail.com", "phone": "081234567890",
  "interestedKuliahKerja": "ya", "eventId": "90",
  "utm_source": "cdc", "utm_medium": "banner", "utm_campaign": "vjf90" }
```
```json
{ "formType": "offline", "name": "Sari", "email": "sari@mail.com", "phone": "081234567890",
  "eventId": "12" }
```
```json
{ "formType": "job-application", "name": "Andi", "email": "andi@mail.com",
  "phone": "081234567890", "cvLink": "https://drive.google.com/...", "jobId": "1814031",
  "message": "Saya tertarik posisi ini" }
```

**Kebutuhan script**:
1. Tulis baris ke **tab sesuai `formType`** (`vjf`, `offline`, `job-application`).
   Jika tab belum ada, buat otomatis dengan header awal `timestamp`.
2. **Kolom A selalu `timestamp`** (waktu submit, zona `Asia/Jakarta`,
   format `yyyy-MM-dd HH:mm:ss`).
3. **Header tumbuh otomatis**: jika payload membawa field/UTM yang belum ada di header,
   tambahkan kolom baru di ujung kanan — jangan menimpa data lama.
4. Setiap submission jadi **satu baris baru**, nilai diisi sesuai posisi kolom header;
   field yang tidak ada dibiarkan kosong. Jangan tulis field `formType` ke dalam sel
   (cukup dipakai untuk memilih tab).
5. Gunakan **LockService** agar submission bersamaan tidak saling menimpa baris.
6. `doPost` mengembalikan JSON `{ "success": true }` atau
   `{ "success": false, "error": ... }`. Tambahkan `doGet` sederhana untuk health-check.
7. Bungkus respons dengan `ContentService` MIME `application/json`.

**Selain kode, berikan**:
- Langkah deploy: di mana paste kode, cara Deploy sebagai Web App
  (Execute as: **Me**, Who has access: **Anyone**), cara ambil URL `/exec`.
- Cara menghubungkan ke website: URL itu dipakai sebagai env
  `GOOGLE_SHEET_WEBHOOK_URL`.
- Perintah `curl` untuk menguji tiap `formType`.
- Catatan: saat update script, pakai **Manage deployments → Edit → New version** agar
  URL tidak berubah.

Tulis kode JavaScript Apps Script yang lengkap (bukan potongan).

---

## Catatan

Header yang ditambahkan script harus cocok dengan kolom yang sudah dibuat manual
(case-sensitive). Untuk kode jadi yang sudah ditulis langsung, lihat
[google-sheet-setup.md](google-sheet-setup.md).
