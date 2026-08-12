import type { RecruitmentEvent } from '@/types'

/**
 * Status event dihitung dari tanggal, bukan disimpan.
 *
 * Sebelumnya event offline menyimpan `status` sebagai literal di mocks, jadi
 * badge "Pendaftaran Dibuka" tetap tampil walau acaranya sudah lewat. Status
 * yang ditulis tangan pasti basi begitu tanggalnya berlalu — satu-satunya
 * sumber kebenaran yang tidak bisa basi adalah tanggalnya sendiri.
 *
 * Perbandingan memakai batas HARI di zona WIB, bukan jam persis: acara jam
 * 08.30–12.00 tetap dianggap 'ongoing' sepanjang hari itu, sehingga peserta
 * yang membuka halaman jam 13.00 tidak melihatnya sudah "selesai".
 */
export function computeEventStatus(
  start: string,
  end?: string,
): RecruitmentEvent['status'] {
  const startDay = wibDay(start)
  if (!startDay) return 'past'
  const endDay = wibDay(end || start) ?? startDay
  const today = wibDay(new Date().toISOString())!

  if (today < startDay) return 'upcoming'
  if (today <= endDay) return 'ongoing'
  return 'past'
}

/**
 * Tanggal dalam WIB sebagai "YYYY-MM-DD" — bisa dibandingkan sebagai string.
 * Zona dipaksa Asia/Jakarta karena container deploy jalan di UTC; tanpa itu
 * event sore hari bisa dihitung mundur satu hari.
 */
function wibDay(iso: string): string | null {
  // Data dari API kadang "YYYY-MM-DD HH:mm:ss" (spasi, bukan "T").
  const d = new Date(iso.replace(' ', 'T'))
  if (Number.isNaN(d.getTime())) return null
  // en-CA memberi format YYYY-MM-DD.
  return d.toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' })
}

/** True kalau pendaftaran masih terbuka (batas daftar belum terlewat). */
export function isRegistrationOpen(event: RecruitmentEvent): boolean {
  if (event.status === 'past') return false
  if (!event.registrationDeadline) return true
  const deadline = wibDay(event.registrationDeadline)
  const today = wibDay(new Date().toISOString())!
  return deadline ? today <= deadline : true
}
