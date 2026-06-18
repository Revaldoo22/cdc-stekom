# CDC Universitas STEKOM — Portal Karir

Portal lowongan kerja untuk **Career Development Center Universitas STEKOM**. Menampilkan lowongan dari API CDC, halaman taxonomy SEO-friendly ala JobStreet, dan event rekrutmen (Virtual Job Fair & Rekrutmen Offline). Tanpa database, tanpa autentikasi — data loker diambil langsung dari API CDC, form submission dikirim ke Google Sheets.

---

## Daftar Isi

- [Fitur](#fitur)
- [Teknologi](#teknologi)
- [Memulai](#memulai)
- [Environment Variables](#environment-variables)
- [Skema URL (JobStreet-style)](#skema-url-jobstreet-style)
- [Integrasi API CDC](#integrasi-api-cdc)
- [Struktur Proyek](#struktur-proyek)
- [Skrip NPM](#skrip-npm)
- [Catatan & Keterbatasan](#catatan--keterbatasan)

---

## Fitur

- **Listing split-pane** ala JobStreet — daftar loker di kiri, panel detail di kanan, deep-linkable via `?jobId=`.
- **URL taxonomy SEO** 5 dimensi: keyword, kategori, lokasi, jenis kerja, gaji.
- **Pencarian & filter** — kata kunci, kategori, dengan pagination (semua di-filter di service layer).
- **Halaman index** kategori (`/kategori`) dan lokasi (`/daerah`).
- **Event rekrutmen** — Virtual Job Fair & Rekrutmen Offline dengan sistem batch.
- **SEO lengkap** — metadata dinamis, JSON-LD (JobPosting, Event, BreadcrumbList, FAQ, ItemList), `sitemap.xml`, `robots.txt`, OpenGraph image.
- **Form** lamaran & pendaftaran event → Google Sheets (via Apps Script webhook).
- **ISR** (Incremental Static Regeneration) — halaman di-cache & di-revalidate otomatis.

---

## Teknologi

| Kategori | Pilihan |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Bahasa | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS v4 |
| Komponen | shadcn/ui (Radix) + [Lucide](https://lucide.dev) icons |
| Validasi | Zod 4 + React Hook Form |
| Data loker | API CDC (`cdc.stekom.ac.id/curl_loker`) |
| Form storage | Google Sheets (Apps Script webhook) |

---

## Memulai

**Prasyarat:** Node.js 20+ dan npm.

```bash
# 1. Install dependencies
npm install

# 2. Siapkan environment (lihat bagian di bawah)
cp .env.example .env.local   # lalu isi sesuai kebutuhan

# 3. Jalankan dev server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

Buat file `.env.local` di root proyek:

```env
# Paksa data mock (true) atau pakai API CDC live (false)
USE_MOCK=false

# URL situs (untuk SEO, sitemap, canonical, OG image)
NEXT_PUBLIC_SITE_URL=https://cdc.stekom.ac.id

# Webhook Google Apps Script untuk submit form (lamaran & event)
GOOGLE_SHEET_WEBHOOK_URL=

# --- API CDC loker (opsional, ada default di src/config/api.ts) ---
# Cursor: endpoint mengembalikan SEMUA loker dengan id_loker > cursor (tanpa
# limit). Cursor terlalu rendah = ratusan ribu baris = server CDC crash.
# Turunkan untuk menarik lebih banyak loker terbaru.
# CDC_LOKER_CURSOR=1812879

# Kode rahasia API CDC (override default jika perlu)
# CDC_LOKER_KODE=
```

| Variabel | Wajib | Default | Keterangan |
|---|---|---|---|
| `USE_MOCK` | – | `false` | `true` = pakai data mock; `false` = API CDC live |
| `NEXT_PUBLIC_SITE_URL` | ✓ | `https://cdc.stekom.ac.id` | Base URL untuk SEO |
| `GOOGLE_SHEET_WEBHOOK_URL` | utk form | – | URL web app Apps Script |
| `CDC_LOKER_CURSOR` | – | `1812879` | Cursor jumlah loker (~60 terbaru) |
| `CDC_LOKER_KODE` | – | (di config) | Kredensial API CDC |

> **Catatan:** `.env.local` tidak di-commit (di-`.gitignore`).

---

## Skema URL (JobStreet-style)

Halaman listing memakai grammar URL 5-dimensi, ditangani oleh route catch-all `[...segments]`:

```
/{keyword}-jobs[-in-{category}][/in-{location}][/{worktype}]?salary=&experience=&jobId=
```

| Dimensi | Posisi | Contoh |
|---|---|---|
| keyword | segmen awal | `/developer-jobs` |
| kategori | sambungan segmen awal | `/jobs-in-teknologi` |
| keyword + kategori | gabungan | `/marketing-jobs-in-teknologi` |
| lokasi | segmen ke-2 | `…/in-semarang` |
| jenis kerja | segmen ke-3 | `…/full-time` |
| gaji / pengalaman | query param | `?salary=6-10jt` |
| loker terpilih | query param | `?jobId=1812880` |

**Contoh lengkap:**
```
/marketing-jobs-in-teknologi/in-semarang/full-time?salary=6-10jt&jobId=1812880
```

Sumber kebenaran tunggal: `buildJobsUrl()` (membangun) dan `parseJobsSegments()` (mengurai) di [`src/lib/seo-urls.ts`](src/lib/seo-urls.ts). Tanpa filter → halaman bersih `/loker`.

---

## Integrasi API CDC

Loker diambil dari API CDC ([`src/services/cdc-loker.service.ts`](src/services/cdc-loker.service.ts)):

| Endpoint | Metode | Keterangan |
|---|---|---|
| `/curl_loker/dataloker` | POST `idloker` (cursor) + `kode` | Mengembalikan semua loker `id_loker > cursor` (tanpa limit) |
| `/curl_loker/kategori_loker_harian` | GET | Daftar kategori |

API **tidak menyediakan** filter server-side, jadi pencarian/filter/pagination dilakukan di service layer ([`src/services/jobs.service.ts`](src/services/jobs.service.ts)). Gambar loker dari `cdc.stekom.ac.id/assets/loker/` (saat ini logo perusahaan diganti ikon gedung).

---

## Struktur Proyek

```
src/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Homepage
│   ├── loker/                # Listing utama (split-pane)
│   ├── [...segments]/        # Taxonomy SEO (kategori/lokasi/tipe/keyword)
│   ├── kategori/ daerah/     # Index kategori & lokasi
│   ├── job/[slug]/           # Detail loker (halaman penuh)
│   ├── event/                # VJF, Rekrutmen Offline, detail event
│   ├── api/form-submit/      # Route handler → Google Sheets
│   ├── sitemap.ts robots.ts  # SEO
│   └── opengraph-image.tsx   # OG image generator
├── components/
│   ├── shared/               # Navbar, Footer, JobCard, Pagination, dll
│   └── ui/                   # shadcn/ui
├── features/
│   ├── jobs/                 # JobListingClient, HeroSearch, ApplyButton
│   └── forms/                # Form lamaran & pendaftaran
├── services/                 # cdc-loker, jobs, events, forms
├── lib/                      # seo, seo-urls, schema, validators
├── config/                   # api.ts (env + konstanta CDC)
├── hooks/                    # useSavedJobs, useRecentJobs
├── mocks/                    # Data mock (jobs, events) + fallback events
└── types/                    # Definisi TypeScript
```

---

## Skrip NPM

| Perintah | Aksi |
|---|---|
| `npm run dev` | Dev server (Turbopack) di `:3000` |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |

---

## Catatan & Keterbatasan

Beberapa field tidak tersedia di API CDC dan ditangani sebagai berikut:

| Fitur | Status | Alasan |
|---|---|---|
| Deskripsi / gaji / persyaratan loker | placeholder | Tidak ada field-nya di API |
| Filter **Lokasi** | nonaktif | API hanya beri kode wilayah (`id_prov`/`id_kab`) tanpa endpoint nama |
| Filter **Jenis Kerja** | nonaktif | `js_loker` hanya kode angka tanpa endpoint nama |
| Filter **Gaji** | nonaktif | Tidak ada data gaji |
| **Event** rekrutmen | data lokal | API tidak punya endpoint event |

Filter Lokasi & Jenis Kerja dapat diaktifkan kembali bila tersedia mapping kode → nama dari API CDC.

---

_Career Development Center Universitas STEKOM — menghubungkan pencari kerja dengan peluang karir terbaik._
