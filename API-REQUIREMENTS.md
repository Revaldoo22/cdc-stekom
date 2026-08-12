# Kebutuhan API Backend — Frontend Baru CDC Stekom

Dokumen ini mendata **API apa saja yang dibutuhkan** frontend Next.js ini untuk
menggantikan `https://cdc.stekom.ac.id`. Ditujukan untuk tim backend (CodeIgniter 3).

Status tiap endpoint:

| Simbol | Arti |
|---|---|
| ✅ | Sudah ada & sudah dipakai frontend |
| ⚠️ | Sudah ada tapi bermasalah / perlu diperbaiki |
| ❌ | Belum ada, **perlu dibuat** |

Ringkasan: **3 endpoint sudah jalan, 4 perlu perbaikan, 8 perlu dibuat baru.**

---

## 0. Konvensi Umum

**Base URL loker:** `https://cdc.stekom.ac.id/curl_loker`
**Auth:** field `kode` di body POST (shared secret, saat ini hardcoded di controller).

Semua endpoint baru sebaiknya mengikuti aturan ini:

1. **`Content-Type: application/json`** untuk response (sekarang sudah JSON, tapi lewat `echo json_encode`).
2. **Jangan `addslashes()` + `htmlentities()`** pada field teks.
   Sekarang backend melakukan double/triple-encoding sehingga `&` menjadi `&amp;amp;amp;`.
   Frontend terpaksa punya fungsi `clean()` yang men-decode berulang 5x —
   lihat [cdc-loker.service.ts:112-134](src/services/cdc-loker.service.ts#L112-L134).
   **Kirim UTF-8 mentah**, biarkan frontend yang meng-escape.
3. **Bentuk response konsisten:**
   ```json
   { "data": [...], "meta": { "total": 1234, "page": 1, "per_page": 20 } }
   ```
   Sekarang formatnya `{"dx": [...]}` dan kalau kosong malah balas angka `0`
   (bukan array) — ini bikin frontend harus defensive.
4. **CORS + tanpa User-Agent gate.** Saat ini server balas **403** kalau request
   tidak membawa `User-Agent` browser dan `Referer`. Frontend harus memalsukan
   header — lihat [cdc-loker.service.ts:48-53](src/services/cdc-loker.service.ts#L48-L53).
   Ini harus dimatikan untuk IP server (Vercel/VPS), atau ganti dengan API key.
5. **HTTP status yang benar** (200/400/404/500), jangan selalu 200.

---

## 1. Lowongan Kerja (Loker) — Inti

### 1.1 ⚠️ List loker — `POST /curl_loker/datalokercdc`

Sudah ada, tapi **belum bisa dipakai produksi**. Masalah:

- **Tidak ada pagination.** Endpoint mengembalikan *seluruh* baris yang cocok
  sekaligus. Untuk menghindari server crash, frontend memakai trik cursor
  `LOKER_CURSOR = 1812879` agar hanya menarik ±60 loker terbaru —
  lihat [config/api.ts:16-21](src/config/api.ts#L16-L21). Artinya **loker lama tidak bisa diakses sama sekali.**
- **Tidak ada filter kategori / keyword / jenis kerja / gaji.** Frontend
  menarik semua lalu memfilter di memory — lihat [jobs.service.ts:22-56](src/services/jobs.service.ts#L22-L56).
  Tidak akan sanggup kalau data puluhan ribu.
- **Tidak ada sorting.** Frontend sort manual by `tanggal`.
- **Filter `status` tidak ada.** Frontend menarik semua lalu buang yang `status != '0'`
  — boros bandwidth.
- Response bulk ±1MB, butuh timeout 30 detik.

**Yang dibutuhkan** — endpoint list dengan query params:

| Param | Tipe | Keterangan |
|---|---|---|
| `page` | int | default 1 |
| `per_page` | int | default 20, max 100 |
| `q` | string | cari di `posisi`, `nama_perusahaan`, skill |
| `id_kategori_loker` | int | filter kategori |
| `id_prov` / `id_kab` | int | filter wilayah |
| `jenis_kerja` | string | full-time / part-time / magang / freelance |
| `gaji_min` / `gaji_max` | int | rentang gaji |
| `pendidikan` | string | SMA/SMK, D3, S1, … |
| `disabilitas` | 0/1 | ramah disabilitas |
| `status` | int | default hanya yang aktif (`0`) |
| `sort` | string | `terbaru` (default) / `gaji_tertinggi` |

Response:

```json
{
  "data": [ { /* objek loker, lihat 1.2 */ } ],
  "meta": { "total": 1234, "page": 1, "per_page": 20, "total_pages": 62 }
}
```

### 1.2 ❌ Detail loker — `GET /api/loker/{id_loker}`

**Belum ada.** Saat ini halaman detail [job/[slug]](src/app/job/[slug]/page.tsx)
mengambil seluruh list lalu mencari satu item di memory. Tidak masuk akal untuk
puluhan ribu loker dan bikin halaman detail lambat.

Field yang dibutuhkan (yang sudah ada di `tb_loker` ditandai ✓):

```json
{
  "id_loker": "1812940",              // ✓
  "posisi": "Staff Admin",            // ✓
  "nama_perusahaan": "PT Contoh",     // ✓
  "id_kategori_loker": "12",          // ✓
  "kategori_loker": "Administrasi",   // ❌ ikutkan nama, jangan cuma id
  "id_prov": "33", "id_kab": "3374",  // ✓
  "nama_prov": "Jawa Tengah",         // ❌ ikutkan nama wilayah
  "nama_kab": "Kota Semarang",        // ❌   (lihat bagian 3)
  "jenis_kerja": "Full Time",         // ✓ (hanya di datalokercdc)
  "gaji": "3500000",                  // ✓ (hanya di datalokercdc)
  "gaji_max": "5000000",              // ❌ sekarang cuma 1 kolom
  "deskripsi": "...",                 // ✓ (hanya di datalokercdc)
  "persyaratan": "...",               // ❌ belum ada kolomnya
  "pendidikan": "S1",                 // ✓
  "pengalaman": "Min 1 tahun",        // ❌ belum ada
  "softskill": "Teliti,Komunikatif",  // ✓
  "hardskill": "Excel,SAP",           // ✓
  "disabilitas": "0",                 // ✓
  "no_telp": "08123...",              // ✓
  "email": "hrd@contoh.com",          // ✓
  "link_web": "https://...",          // ✓
  "img": "logo.png",                  // ✓ (butuh URL absolut, lihat catatan)
  "tanggal": "2026-07-20",            // ✓
  "tanggal_kadaluarsa": "2026-08-20", // ❌ belum ada — penting untuk auto-expire
  "status": "0"                       // ✓
}
```

Catatan penting:

- **`deskripsi` & `gaji` hanya terisi di sebagian kecil data.** Frontend memakai
  strategi merge dua endpoint (`dataloker` bulk + `datalokercdc?deskripsi=ada`)
  supaya listing tetap kaya — lihat [cdc-loker.service.ts:267-298](src/services/cdc-loker.service.ts#L267-L298).
  Kalau backend sudah mengisi kolom ini konsisten, workaround-nya bisa dihapus.
- **`img` harus URL absolut** (`https://cdc.stekom.ac.id/upload/loker/xxx.png`),
  bukan nama file. Sekarang frontend tidak menampilkan logo sama sekali karena
  path-nya tidak jelas.
- **`tanggal_kadaluarsa` wajib.** Tanpa ini, loker lama tidak pernah hilang dan
  Google akan mengindeks lowongan mati (buruk untuk SEO Google Jobs).

### 1.3 ❌ Loker terkait — `GET /api/loker/{id}/terkait?limit=5`

Loker satu kategori / satu wilayah. Sekarang dihitung di frontend dari data yang
sudah ditarik.

### 1.4 ❌ Sitemap feed — `GET /api/loker/sitemap?updated_since=YYYY-MM-DD`

Hanya `id_loker`, `posisi`, `tanggal`, `updated_at`. Dipakai
[sitemap.ts](src/app/sitemap.ts) supaya bisa mendaftarkan semua loker ke Google
tanpa menarik payload penuh. **Ini yang paling menentukan SEO.**

---

## 2. Master Data / Filter

### 2.1 ✅ Kategori loker — `GET /curl_loker/kategori_loker_harian`

Sudah jalan. Response `{"dx":[{id_kategori_loker, kategori_loker, kategori_loker_link, delete_data}]}`.

**Perlu tambahan:** field `jumlah_loker` (count loker aktif per kategori).
Sekarang frontend mengisi `count: 0` karena tidak ada datanya —
lihat [cdc-loker.service.ts:95](src/services/cdc-loker.service.ts#L95).
Halaman [/kategori](src/app/kategori/page.tsx) jadi tidak bisa menampilkan jumlah.

### 2.2 ❌ Provinsi & Kabupaten — `GET /api/wilayah`

**Belum ada.** Backend hanya mengirim `id_prov` / `id_kab` berupa angka, tanpa nama.
Frontend terpaksa **membundel tabel wilayah statis** di
[src/data/wilayah.ts](src/data/wilayah.ts) untuk menerjemahkan kode → nama.
Kalau backend menambah wilayah baru, frontend akan menampilkan lokasi kosong.

Dibutuhkan:
```json
{ "data": [ { "id_prov": "33", "nama": "Jawa Tengah",
              "kabupaten": [ { "id_kab": "3374", "nama": "Kota Semarang", "jumlah_loker": 87 } ] } ] }
```

Alternatif lebih sederhana: cukup ikutkan `nama_prov` dan `nama_kab` di setiap
objek loker (lihat 1.2) — file statis bisa dihapus.

### 2.3 ❌ Jenis kerja — `GET /api/jenis-kerja`

Daftar nilai `jenis_kerja` yang valid + jumlah loker. Dipakai
[/tipe-pekerjaan/[slug]](src/app/tipe-pekerjaan/[slug]/page.tsx).
Sekarang daftarnya hardcoded di frontend.

---

## 3. Event & Job Fair

### 3.1 ✅ Virtual Job Fair — `POST https://toploker.com/curl/virtual_jobfair`

Sudah jalan (host & key berbeda dari API loker) — lihat [vjf.service.ts](src/services/vjf.service.ts).

Masalah: field `description` berisi **HTML kotor** (atribut `xss=removed`,
fragmen `style` kosong). Frontend membuang semua tag dan menampilkan teks polos —
lihat [vjf.service.ts:41-52](src/services/vjf.service.ts#L41-L52).
Sebaiknya backend menyimpan HTML bersih atau Markdown.

### 3.2 ❌ Rekrutmen Offline — `GET /api/event/offline`

**Belum ada API sama sekali.** Data event offline saat ini **hardcoded** di
[src/mocks/events.ts](src/mocks/events.ts) — lihat
[events.service.ts:10](src/services/events.service.ts#L10). Setiap ada event baru
harus deploy ulang.

Dibutuhkan: `id`, `slug`, `judul`, `deskripsi`, `tanggal_mulai`, `tanggal_selesai`,
`lokasi`, `alamat`, `banner` (URL absolut), `penyelenggara`, `batas_daftar`,
`daftar_perusahaan[]`, `status`.

---

## 4. Form & Pendaftaran

### 4.1 ⚠️ Submit form — sekarang ke Google Sheets

Tiga form (lamaran kerja, pendaftaran VJF, rekrutmen offline) dikirim ke
**Google Sheets webhook**, bukan ke backend —
lihat [api/form-submit/route.ts](src/app/api/form-submit/route.ts).

Ini sementara. Yang dibutuhkan:

- ❌ `POST /api/lamaran` — simpan lamaran ke DB (nama, email, no_wa, id_loker, CV).
- ❌ `POST /api/event/{id}/daftar` — pendaftaran peserta event.
- ❌ **Upload CV** — endpoint multipart, balas URL file. Sekarang tidak ada,
  jadi form hanya menampung link Google Drive.

Catatan: alur lamaran saat ini adalah **redirect ke WhatsApp** perusahaan dengan
pesan terisi otomatis (commit `4cd04af`), memakai `no_telp` dari data loker.
Selama belum ada `/api/lamaran`, alur ini tetap dipakai dan **tidak ada rekap
pelamar di sistem.**

### 4.2 ❌ Verifikasi mahasiswa (opsional, fase 2)

Backend lama punya OTP WhatsApp (`get_otp`, `get_cek_otp` di `Model_pm.php`) dan
CV Online. Kalau fitur CV Online mau dibawa ke frontend baru, perlu:
`POST /api/auth/otp/kirim`, `POST /api/auth/otp/verifikasi`,
`GET/PUT /api/cv/{nim}` (profil, pendidikan, pengalaman, skill, bahasa, hobi).

**Rekomendasi: keluarkan dari scope v1.** Fitur ini besar dan pemakaiannya rendah.

---

## 5. Konten Statis (fase 2)

Halaman berikut ada di situs lama tapi **belum dibuat** di frontend baru. Semua
butuh endpoint baru karena backend lama merender langsung ke view PHP, tanpa API:

| Halaman | Endpoint yang dibutuhkan | Sumber lama |
|---|---|---|
| Berita | `GET /api/berita`, `GET /api/berita/{slug}` | `Berita.php` |
| Agenda | `GET /api/agenda` | `Agenda.php` |
| Konseling Karier | `GET /api/konseling` | `Konsling.php` |
| Tips Karier | `GET /api/tips` | `Tips.php` |
| Galeri | `GET /api/galeri` | `Galeri.php` |
| Layanan Karier | `GET /api/layanan-karier` | `model_pm::get_layanan_karier()` |
| Mitra / Kerjasama | `GET /api/partner` | `model_pm::get_partner()` |
| Kontak & Footer | `GET /api/kontak` | `model_pm::get_contact()` |
| Magang | `GET /api/magang` (struktur mirip loker) | `Magang.php` |

Situs lama juga punya versi **Bahasa Inggris** untuk sebagian konten
(`get_berita_en`, `get_konsling_en`, dst). Kalau bilingual tetap dibutuhkan,
tambahkan param `?lang=id|en` — jangan duplikasi endpoint seperti sekarang.

---

## 6. Prioritas Pengerjaan

**Wajib sebelum go-live (v1):**

1. List loker ber-pagination + filter server-side (1.1) — *blocker terbesar*
2. Detail loker by id (1.2)
3. `tanggal_kadaluarsa` + `img` URL absolut (1.2)
4. Nama wilayah di response loker (2.2)
5. Matikan 403 User-Agent gate + hentikan double-encoding (bagian 0)
6. Sitemap feed (1.4) — SEO

**Menyusul (v1.1):**

7. Jumlah loker per kategori / wilayah / jenis kerja (2.1, 2.2, 2.3)
8. API event offline (3.2)
9. `POST /api/lamaran` + upload CV (4.1)
10. Loker terkait (1.3)

**Fase 2:**

11. Konten statis: berita, agenda, tips, galeri, mitra, kontak (bagian 5)
12. Magang
13. CV Online + OTP (4.2)

---

## 7. Utang Teknis Frontend yang Bisa Dihapus

Kalau backend sudah memenuhi poin di atas, kode workaround berikut bisa dibuang:

| File | Workaround | Dihapus setelah |
|---|---|---|
| [cdc-loker.service.ts:112-134](src/services/cdc-loker.service.ts#L112-L134) | `clean()` decode entity 5x | backend berhenti double-encode |
| [cdc-loker.service.ts:48-53](src/services/cdc-loker.service.ts#L48-L53) | Header User-Agent palsu | 403 gate dimatikan |
| [cdc-loker.service.ts:272-291](src/services/cdc-loker.service.ts#L272-L291) | Merge 2 endpoint | `deskripsi`/`gaji` konsisten terisi |
| [config/api.ts:16-21](src/config/api.ts#L16-L21) | `LOKER_CURSOR` hardcoded | ada pagination |
| [src/data/wilayah.ts](src/data/wilayah.ts) | Tabel wilayah statis | nama wilayah ikut di response |
| [jobs.service.ts:22-56](src/services/jobs.service.ts#L22-L56) | Filter in-memory | filter server-side |
| [src/mocks/events.ts](src/mocks/events.ts) | Event offline hardcoded | API event offline ada |
