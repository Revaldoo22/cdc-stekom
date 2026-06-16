'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Briefcase, Menu, X } from 'lucide-react'

const NAV_LINKS = [
  { label: 'Cari Lowongan', href: '/loker' },
  { label: 'Kategori', href: '/loker#kategori' },
  { label: 'Lokasi', href: '/loker#lokasi' },
  { label: 'Rekrutmen Offline', href: '/event/offline-recruitment' },
  { label: 'Virtual Job Fair', href: '/event/vjf' },
]

function isActive(pathname: string, href: string) {
  const base = href.split('#')[0]
  if (base === '/') return pathname === '/'
  return pathname.startsWith(base)
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
          className="flex items-center gap-2.5 cursor-pointer shrink-0"
          aria-label="CDC Stekom — Halaman Utama"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Briefcase className="h-4 w-4 text-white" aria-hidden="true" />
          </span>
          <span className="text-[15px] font-bold text-brand-text">
            CDC <span className="text-primary">Stekom</span>
          </span>
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
