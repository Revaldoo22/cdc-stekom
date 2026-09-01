# CDC Universitas STEKOM — Portal Karir

Portal lowongan kerja Career Development Center Universitas STEKOM. Data loker
diambil dari API CDC, submission form dikirim ke Google Sheets. Tanpa database
dan tanpa autentikasi.

## Teknologi

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
shadcn/ui · Zod + React Hook Form

## Menjalankan

Prasyarat: Node.js 20+.

```bash
npm install
cp .env.example .env.local   # isi kredensialnya
npm run dev
```

Buka http://localhost:3000.

| Perintah | Aksi |
|---|---|
| `npm run dev` | Dev server di `:3000` |
| `npm run build` | Build produksi |
| `npm run start` | Jalankan hasil build |
| `npm run lint` | ESLint |

## Environment

Daftar lengkap beserta keterangannya ada di [`.env.example`](.env.example);
salin ke `.env.local` (tidak ikut ter-commit).

Yang perlu diisi:

| Variabel | Keterangan |
|---|---|
| `CDC_API_KEY` | Kunci API loker. Wajib — request gagal tanpa ini. Server-side, jangan beri prefix `NEXT_PUBLIC_` |
| `VJF_API_KEY` | Kunci API Virtual Job Fair. Wajib untuk halaman event; host dan kuncinya berbeda dari API loker |
| `NEXT_PUBLIC_SITE_URL` | Base URL situs untuk metadata dan sitemap. Ada default, tapi set eksplisit saat deploy ke domain lain |

Selebihnya opsional dan sudah punya default di
[`src/config/api.ts`](src/config/api.ts).

Untuk mengembangkan tanpa akses API, set `USE_MOCK=true` — data diambil dari
[`src/mocks/`](src/mocks/).

## Struktur

```
src/
├── app/          Route (App Router), sitemap, robots, OG image
├── components/   Komponen bersama + shadcn/ui
├── features/     Modul per fitur: jobs, forms
├── services/     Pengambilan data & pemetaan respons API
├── lib/          URL SEO, JSON-LD, validator
├── config/       Env dan konstanta
├── hooks/        State sisi klien
├── mocks/        Data contoh untuk USE_MOCK
└── types/        Tipe bersama
```

Titik masuk yang perlu dibaca lebih dulu saat mengubah perilaku:

- [`src/lib/seo-urls.ts`](src/lib/seo-urls.ts) — satu-satunya sumber kebenaran
  untuk membangun dan mengurai URL halaman listing. Jangan menulis path listing
  secara manual di tempat lain; gunakan helper di sini agar URL yang dihasilkan
  selalu bisa diurai balik.
- [`src/services/jobs.service.ts`](src/services/jobs.service.ts) — fasad data
  loker. Komponen tidak memanggil service API secara langsung, sehingga sumber
  data bisa diganti dari satu tempat.
- [`src/config/api.ts`](src/config/api.ts) — env, base URL, dan durasi
  revalidasi.

## Deployment

Build menghasilkan output `standalone`, jadi bisa dijalankan sebagai proses
Node biasa di belakang reverse proxy.

```bash
npm install
npm run build     # wajib — `next start` menjalankan hasil build, bukan sumber
npm run start
```

Dua hal yang mudah terlewat saat pertama kali menyiapkan server:

- Variabel berprefiks `NEXT_PUBLIC_` dibaca **saat build**. Menambahkannya ke
  `.env` lalu sekadar me-restart proses tidak berpengaruh — perlu build ulang.
- Bila berbagi domain dengan aplikasi lain, pastikan reverse proxy meneruskan
  seluruh path yang dilayani aplikasi ini, termasuk `/sitemap/` dan
  `/robots.txt`.

## Catatan

- Sebagian kolom di API sumber berupa teks bebas dan tidak selalu terisi.
  Pembersihannya terpusat di
  [`src/services/cdc-loker.service.ts`](src/services/cdc-loker.service.ts) —
  tambahkan penanganan baru di sana, bukan di komponen.
- Filter level pengalaman disembunyikan karena API belum menyediakan
  parameternya; nilai dari URL lama tetap diterima.

---

_Career Development Center Universitas STEKOM._
