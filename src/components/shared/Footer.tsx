import Link from 'next/link'
import { Briefcase, Mail, MapPin, Phone } from 'lucide-react'

export function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="mt-auto bg-[#0F172A]">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-white cursor-pointer">
              <Briefcase className="h-5 w-5" aria-hidden="true" />
              CDC Stekom
            </Link>
            <p className="mt-3 text-sm text-[#CBD5E1] leading-relaxed">
              Career Development Center Universitas STEKOM — menghubungkan mahasiswa dan alumni dengan peluang karir terbaik.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Pencari Kerja</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#CBD5E1]">
              <li><Link href="/loker" className="hover:text-white transition-colors duration-200 cursor-pointer">Semua Lowongan</Link></li>
              <li><Link href="/tipe-pekerjaan/full-time" className="hover:text-white transition-colors duration-200 cursor-pointer">Full Time</Link></li>
              <li><Link href="/tipe-pekerjaan/part-time" className="hover:text-white transition-colors duration-200 cursor-pointer">Part Time</Link></li>
              <li><Link href="/tipe-pekerjaan/magang" className="hover:text-white transition-colors duration-200 cursor-pointer">Magang</Link></li>
              <li><Link href="/tipe-pekerjaan/freelance" className="hover:text-white transition-colors duration-200 cursor-pointer">Freelance</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Event Rekrutmen</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#CBD5E1]">
              <li><Link href="/event" className="hover:text-white transition-colors duration-200 cursor-pointer">Semua Event</Link></li>
              <li><Link href="/event/vjf" className="hover:text-white transition-colors duration-200 cursor-pointer">Virtual Job Fair</Link></li>
              <li><Link href="/event/offline-recruitment" className="hover:text-white transition-colors duration-200 cursor-pointer">Rekrutmen Offline</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-white">Kontak</h3>
            <ul className="mt-3 space-y-2 text-sm text-[#CBD5E1]">
              <li className="flex items-start gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" aria-hidden="true" />
                Jl. Majapahit No.605, Semarang
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                (024) 123456
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                cdc@stekom.ac.id
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-[#CBD5E1]">
          <p>© {year} Career Development Center — Universitas STEKOM. Hak cipta dilindungi.</p>
        </div>
      </div>
    </footer>
  )
}
