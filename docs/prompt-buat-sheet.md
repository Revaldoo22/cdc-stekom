# Prompt untuk Menyiapkan Google Spreadsheet (Form CDC)

Salin blok di bawah ini, tempel ke asisten AI. Ini meminta **struktur spreadsheet**
(tab + kolom + format), BUKAN kode Apps Script.

---

Bantu saya menyiapkan struktur sebuah Google Spreadsheet untuk menampung submission
dari 3 form di website. Berikan langkah membuat tab, daftar kolom per tab beserta
urutannya, dan rekomendasi format kolom. Jangan tulis kode — cukup struktur dan
instruksi manual.

**Konteks**: Tiap submission akan ditulis sebagai satu baris. Ada 3 jenis form
(dibedakan field `formType`). Selain field form, sebagian submission membawa parameter
UTM (`utm_source`, `utm_medium`, `utm_campaign`, dan kadang `utm_term`, `utm_content`)
yang dipakai melacak asal pengunjung. Kolom pertama setiap tab adalah `timestamp`
(waktu submit, zona Asia/Jakarta).

**Field tiap form**:

- **vjf** (pendaftaran Virtual Job Fair):
  `name`, `email`, `phone`, `interestedKuliahKerja` (isi: `ya` / `tidak`), `eventId`,
  lalu kolom UTM.
- **offline** (pendaftaran Rekrutmen Offline):
  `name`, `email`, `phone`, `eventId`.
- **job-application** (lamaran lowongan):
  `name`, `email`, `phone`, `address` (alamat pelamar),
  `education` (isi: `sma-smk` / `d3` / `d4-s1` / `s2` / `s3` / `lainnya`),
  `educationOther` (teks bebas, hanya terisi kalau `education` = `lainnya`),
  `graduationYear` (4 digit, mis. `2024`),
  `interestedKuliahKerja` (isi: `ya` / `tidak` — sama seperti tab vjf),
  `cvLink` (URL, **wajib**),
  `jobId` (**URL loker penuh**, mis. `https://cdc.stekom.ac.id/loker?jobId=1827124`),
  `message` (boleh kosong).

**Yang saya butuhkan**:
1. **3 tab terpisah**, beri nama persis: `vjf`, `offline`, `job-application`.
2. Untuk tiap tab, daftar **header baris 1** lengkap dengan urutannya. Kolom A selalu
   `timestamp`. Untuk tab `vjf`, sertakan kolom UTM di ujung kanan
   (`utm_source`, `utm_medium`, `utm_campaign`, `utm_term`, `utm_content`).
3. **Rekomendasi format kolom**: `timestamp` sebagai Date time; `phone` sebagai Plain
   text (agar `08...` tidak jadi angka & nol depan tidak hilang); `email`/`cvLink`/
   `jobId`/`address` sebagai teks; `interestedKuliahKerja` boleh pakai Data Validation
   dropdown (ya/tidak).
4. Saran agar **baris header di-freeze** dan **di-bold**, serta lebar kolom yang nyaman
   untuk `message`, `address`, `cvLink`, dan `jobId`.
5. Saran opsional: tab ringkasan/`Dashboard` sederhana (mis. jumlah pendaftar per
   `eventId`, atau jumlah per `utm_source`) — sebutkan cara membuatnya dengan rumus
   (COUNTIF/QUERY), tanpa kode.

Tampilkan hasilnya sebagai tabel header per tab + langkah setup manual yang ringkas.

---

## Catatan

Header di atas harus **sama persis** dengan key yang dikirim website (case-sensitive),
khususnya `interestedKuliahKerja`, `eventId`, `jobId`, `cvLink`, `address`, dan `utm_*`
— supaya Apps Script bisa mencocokkan field ke kolom yang benar. Catatan: `jobId` berisi
URL loker (bukan angka ID) dan ditulis script sebagai `=HYPERLINK(...)` agar bisa diklik. Untuk skrip pengisiannya, lihat
[google-sheet-setup.md](google-sheet-setup.md).
