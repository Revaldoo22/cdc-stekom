# BLOCKER: API balas 403 ke IP server (Vercel)

**Untuk:** tim backend CDC (CodeIgniter 3)
**Tanggal:** 2026-07-30
**Status:** frontend baru **tidak bisa deploy** sampai ini beres.

---

## Ringkasan

Frontend Next.js sudah selesai migrasi ke REST API v1 (`/api/loker` dkk) dan
**jalan sempurna dari komputer lokal**. Tapi begitu di-deploy ke server
(Vercel), **semua** request balas `HTTP 403` — jadi situsnya kosong: 0 loker,
sitemap kosong, halaman detail tidak ter-generate.

**Ini bukan masalah API key.** Key-nya benar dan sudah di-set.

---

## Bukti

Diukur dari IP rumah/kantor (Indonesia, residensial) ke
`GET https://cdc.stekom.ac.id/api/loker?per_page=1`:

| Request | Hasil |
|---|---|
| Key valid + User-Agent browser | **200 OK** |
| Key valid, **tanpa** User-Agent | **200 OK** |
| Key valid + `Origin: vercel.app` | **200 OK** |
| Key valid, tanpa `Origin` | **200 OK** |
| **Key salah** | **401** `{"error":"API key tidak valid"}` |
| **Tanpa key** | **401** `{"error":"API key tidak valid"}` |

Dari Vercel (log build, key sama):

```
[cdc-loker] loker → HTTP 403, using fallback
[cdc-loker] wilayah → HTTP 403, using fallback
[cdc-loker] loker/sitemap → HTTP 403, using fallback
[vjf] fetch failed: VJF API → HTTP 403
```

### Kesimpulan dari data di atas

1. **403 tidak pernah dikeluarkan oleh auth API.** Key salah/kosong → `401`
   dengan body JSON dari PHP. Jadi 403 datang dari lapisan **sebelum** kode PHP
   (Cloudflare/WAF/rule server), bukan dari `Api.php`.
2. **Header tidak berpengaruh.** Dari IP yang lolos, request paling "polos"
   sekalipun (tanpa User-Agent) tetap 200. Jadi ini **bukan** gate User-Agent.
3. **`toploker.com` juga 403 dari Vercel.** Host berbeda, key berbeda
   (`VJF_API_KEY`), gagal identik. Dua sistem berbeda tidak mungkin menolak key
   masing-masing dengan cara yang sama persis.

→ Yang membedakan hanya **IP asal request**. Request dari IP datacenter
(Vercel/AWS/GCP) diblokir; IP residensial Indonesia lolos.

---

## Yang perlu dilakukan

Pilih salah satu (urutan preferensi):

### 1. Allowlist IP egress Vercel — paling langsung

Di Cloudflare dashboard domain `cdc.stekom.ac.id`:

- **Security → WAF → Tools → IP Access Rules**, atau
- **Security → Settings**: turunkan Security Level / Bot Fight Mode untuk
  path `/api/*`

Buat rule **Skip / Allow** untuk path `/api/*`. Daftar IP egress Vercel:
<https://api.vercel.com/v1/edge-config/ips> (bisa berubah, jadi lihat opsi 2).

Cek juga rule level server (`.htaccess`, mod_security, firewall hosting) —
kalau Cloudflare bukan sumbernya, kemungkinan besar di situ.

### 2. Buat rule berbasis API key, bukan IP — paling tahan lama

IP Vercel bisa berubah kapan saja. Lebih baik: di Cloudflare buat
**WAF Custom Rule** dengan aksi *Skip all remaining rules* untuk request yang
membawa header `X-API-Key` yang benar ke path `/api/*`.

Ini sekaligus menyelesaikan poin **§0.4 di API-REQUIREMENTS.md** ("matikan gate
403 untuk IP server, atau ganti dengan API key") — yang memang sudah jadi
kesepakatan sejak awal tapi belum dikerjakan.

### 3. Hal yang sama untuk `toploker.com`

Endpoint VJF (`POST https://toploker.com/curl/virtual_jobfair`) kena masalah
identik dan perlu perlakuan sama.

---

## Cara verifikasi setelah diperbaiki

Dari server mana pun **di luar Indonesia / di datacenter**:

```bash
curl -i -H "X-API-Key: <KEY>" "https://cdc.stekom.ac.id/api/loker?per_page=1"
```

Harus `200` dengan body JSON. Kalau masih `403`, rule-nya belum kena.

---

## Catatan status frontend

- Migrasi ke API v1 **sudah selesai dan teruji** — commit `a74e7a6`.
- Build **sengaja dibuat gagal** kalau API tidak terjangkau
  (`assertApiReachable()`), supaya deploy lama yang masih jalan tidak tertimpa
  situs kosong. Jadi selama 403 ini belum beres, produksi tetap memakai versi
  lama.
- Begitu allowlist beres, **tidak ada perubahan kode yang diperlukan** —
  cukup redeploy.

## Terpisah: dua hal lain yang masih terbuka

1. **Double-encoding belum berhenti.** `/api/loker/{id}/terkait` masih
   mengembalikan `S1 Teknik Listrik &amp;amp; S1 ...`. Frontend masih harus
   men-decode entity 5x (API-REQUIREMENTS §0.2).
2. **Key produksi belum dibuat.** Key yang dipakai sekarang masih key dev yang
   tertulis di file handover — anggap sudah bocor. Perlu key baru khusus
   produksi untuk `X-API-Key` maupun `VJF_API_KEY`.
