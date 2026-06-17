'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Cari Lowongan', href: '/loker' },
  { label: 'Kategori', href: '/kategori' },
  { label: 'Lokasi', href: '/daerah' },
  { label: 'Rekrutmen Offline', href: '/event/offline-recruitment' },
  { label: 'Virtual Job Fair', href: '/event/vjf' },
]

function isActive(pathname: string, href: string) {
  if (href.includes('#')) return false
  if (href === '/') return pathname === '/'
  return pathname.startsWith(href)
}

export function Navbar() {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center cursor-pointer shrink-0"
          aria-label="CDC Universitas Stekom, Halaman Utama"
        >
          <Image
            src="/logo.png"
            alt="STEKOM Career Development"
            width={180}
            height={44}
            className="h-9 w-auto object-contain"
            priority
            unoptimized
          />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden lg:flex items-center gap-0.5" aria-label="Navigasi utama">
          {NAV_LINKS.map(({ label, href }) => {
            const active = isActive(pathname, href)
            return (
              <Link
                key={label}
                href={href}
                className={`relative px-3 py-2 text-[13px] font-medium rounded-md transition-colors duration-150 ${
                  active
                    ? 'text-primary'
                    : 'text-brand-muted hover:text-brand-text hover:bg-muted'
                }`}
              >
                {label}
                {active && (
                  <span className="absolute bottom-0 left-3 right-3 h-0.5 rounded-full bg-primary" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <Link
            href="/event"
            className="hidden sm:inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-[13px] font-semibold text-white transition-colors hover:bg-primary/90 cursor-pointer"
          >
            Untuk Perusahaan
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="lg:hidden flex items-center justify-center h-9 w-9 rounded-lg text-brand-muted hover:bg-muted transition-colors cursor-pointer"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="lg:hidden border-t border-border bg-white">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-0.5" aria-label="Navigasi mobile">
            {NAV_LINKS.map(({ label, href }) => {
              const active = isActive(pathname, href)
              return (
                <Link
                  key={label}
                  href={href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                    active
                      ? 'bg-primary/8 text-primary'
                      : 'text-brand-muted hover:text-brand-text hover:bg-muted'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
            <div className="mt-2 pt-3 border-t border-border">
              <Link
                href="/event"
                onClick={() => setOpen(false)}
                className="flex items-center justify-center w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary/90 transition-colors cursor-pointer"
              >
                Untuk Perusahaan
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
