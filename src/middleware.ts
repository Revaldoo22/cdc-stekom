import { NextResponse, type NextRequest } from 'next/server'

/**
 * Redirect URL warisan frontend CodeIgniter.
 *
 * Situs ini dulu dilayani CI dengan pola URL yang berbeda. Setelah pindah ke
 * Next.js, URL lama itu masih terindeks Google — pengunjung mengkliknya dari
 * hasil pencarian dan mendarat di 404, sehingga otoritas SEO-nya hangus.
 *
 * Ditangani di middleware, bukan sebagai route: nama folder seperti
 * `loker-[daerah]` diperlakukan Next sebagai teks literal, sehingga bagian
 * dinamisnya tidak pernah sampai ke params (terverifikasi — params hanya berisi
 * id). Middleware membaca pathname mentah, jadi pola campuran begini bisa
 * dicocokkan dengan regex biasa.
 */

/**
 * `/loker-{daerah}/daftar` dan `/loker-{daerah}/daftar/{id}` → halaman loker
 * daerah tersebut. Id-nya opsional: CI memakai kedua bentuk, dan varian tanpa
 * angka justru yang muncul di hasil pencarian Google ("cdc.stekom.ac.id › daftar").
 */
const LOKER_DAERAH = /^\/loker-([a-z0-9-]+)\/daftar(?:\/\d+)?\/?$/i

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const daerah = LOKER_DAERAH.exec(pathname)?.[1]
  if (daerah) {
    // Angka di ujung URL lama adalah id halaman daftar CI, bukan id lowongan,
    // jadi tidak ada lowongan spesifik yang bisa dituju — halaman loker daerah
    // itu adalah tujuan terdekat yang masih bermakna bagi pengunjung.
    //
    // Slug daerahnya sudah cocok dengan slug wilayah kita (mis.
    // "kabupaten-lampung-tengah"), dan slug asing pun tetap aman: halaman
    // tujuan memperlakukannya sebagai kata kunci lalu menampilkan hasil
    // relevan, bukan 404.
    const url = req.nextUrl.clone()
    url.pathname = `/jobs/in-${daerah}`
    url.search = ''
    // 308: pemindahannya permanen, dan status inilah yang membuat mesin pencari
    // mengalihkan peringkat URL lama ke URL baru.
    return NextResponse.redirect(url, 308)
  }

  // `/daftar` polos — indeks daftar CI, tanpa petunjuk daerah sama sekali.
  // Halaman semua loker adalah padanan terdekatnya.
  if (/^\/daftar\/?$/i.test(pathname)) {
    const url = req.nextUrl.clone()
    url.pathname = '/loker'
    url.search = ''
    return NextResponse.redirect(url, 308)
  }

  return NextResponse.next()
}

export const config = {
  // Hanya jalan pada pola yang benar-benar ditangani, supaya tiap request lain
  // tidak perlu melewati middleware sama sekali. Dua entri karena `:id*`
  // ternyata tidak mencakup bentuk tanpa segmen id sama sekali.
  matcher: ['/daftar', '/loker-:daerah/daftar', '/loker-:daerah/daftar/:id*'],
}
