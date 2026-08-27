'use client'
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Layers, ChevronDown, Check } from 'lucide-react'
import type { Category, Location } from '@/types'
import { buildJobsUrl } from '@/lib/seo-urls'

const TYPING_KEYWORDS = [
  'Frontend Developer',
  'Data Analyst',
  'Marketing Manager',
  'UI/UX Designer',
  'Akuntansi',
  'Software Engineer',
  'Content Creator',
  'Fresh Graduate',
  'Desain Grafis',
  'Business Development',
]

function useTypingPlaceholder() {
  const [text, setText] = useState('')
  const [kidx, setKidx] = useState(0)
  const [cidx, setCidx] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = TYPING_KEYWORDS[kidx]

    if (!deleting) {
      if (cidx < word.length) {
        const t = setTimeout(() => { setText(word.slice(0, cidx + 1)); setCidx(c => c + 1) }, 70)
        return () => clearTimeout(t)
      }
      const t = setTimeout(() => setDeleting(true), 1800)
      return () => clearTimeout(t)
    } else {
      if (cidx > 0) {
        const t = setTimeout(() => { setText(word.slice(0, cidx - 1)); setCidx(c => c - 1) }, 35)
        return () => clearTimeout(t)
      }
      setDeleting(false)
      setKidx(i => (i + 1) % TYPING_KEYWORDS.length)
    }
  }, [cidx, deleting, kidx])

  return text
}

interface Props {
  locations: Location[]
  categories: Category[]
}

interface DropdownOption { value: string; label: string }

interface DropdownSelectProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  /** Teks di tombol saat belum ada pilihan — dijaga pendek agar tidak terpotong. */
  placeholder: string
  /** Label opsi "semua" di dalam panel; boleh lebih panjang dari placeholder. */
  allLabel?: string
  icon: React.ReactNode
  /** Label input pencarian, mis. "Cari kota". */
  searchLabel: string
}

function DropdownSelect({ options, value, onChange, placeholder, allLabel, icon, searchLabel }: DropdownSelectProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const selected = options.find((o) => o.value === value)

  // Semua hasil ditampilkan; panel dibatasi tingginya dan discroll.
  const q = query.trim().toLowerCase()
  const visible = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options

  function close() {
    setOpen(false)
    setQuery('')
  }

  return (
    <div ref={ref} className="relative flex items-center gap-2.5 flex-1 min-w-0">
      <span className="shrink-0 text-primary">{icon}</span>
      <button
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        aria-haspopup="listbox"
        aria-expanded={open}
        className="flex flex-1 items-center justify-between gap-1 min-w-0 cursor-pointer group py-4"
      >
        <span className={`text-sm font-medium truncate ${value ? 'text-brand-text' : 'text-brand-muted'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          className={`h-4 w-4 text-brand-muted shrink-0 transition-transform duration-150 ${open ? 'rotate-180' : ''}`}
          aria-hidden="true"
        />
      </button>

      {open && (
        <div className="absolute top-full left-0 z-50 mt-1 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-white shadow-xl">
          {/* Pencarian */}
          <div className="border-b border-border p-2">
            <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-brand-muted" aria-hidden="true" />
              <input
                type="text"
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                // Enter di dalam panel tidak boleh men-submit form pencarian hero.
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    if (visible.length > 0) { onChange(visible[0].value); close() }
                  }
                  if (e.key === 'Escape') close()
                }}
                placeholder={searchLabel}
                aria-label={searchLabel}
                className="w-full bg-transparent py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted"
              />
            </div>
          </div>

          <div role="listbox" className="max-h-80 overflow-y-auto overscroll-contain py-1.5">
            {/* Opsi "semua" hanya relevan saat tidak sedang mencari. */}
            {!q && (
              <>
                <button
                  type="button"
                  role="option"
                  aria-selected={value === ''}
                  onClick={() => { onChange(''); close() }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                    value === '' ? 'bg-primary/8 text-primary font-semibold' : 'text-brand-muted hover:bg-muted hover:text-brand-text'
                  }`}
                >
                  <span>{allLabel ?? placeholder}</span>
                  {value === '' && <Check className="h-3.5 w-3.5 shrink-0" />}
                </button>
                <div className="my-1 border-t border-border" />
              </>
            )}

            {visible.map((opt) => (
              <button
                type="button"
                key={opt.value}
                role="option"
                aria-selected={value === opt.value}
                onClick={() => { onChange(opt.value); close() }}
                className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm cursor-pointer transition-colors ${
                  value === opt.value ? 'bg-primary/8 text-primary font-semibold' : 'text-brand-text hover:bg-muted'
                }`}
              >
                <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
              </button>
            ))}

            {visible.length === 0 && (
              <p className="px-4 py-6 text-center text-sm text-brand-muted">
                Tidak ditemukan.
              </p>
            )}
          </div>

          {q && visible.length > 0 && (
            <p className="border-t border-border bg-brand-bg px-4 py-2 text-[11px] text-brand-muted">
              {visible.length} hasil
            </p>
          )}
        </div>
      )}
    </div>
  )
}

export function HeroSearch({ locations, categories }: Props) {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [inputFocused, setInputFocused] = useState(false)
  const [location, setLocation] = useState('')
  const typingText = useTypingPlaceholder()
  const [category, setCategory] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    // Build the canonical JobStreet-style URL (keyword/category/location → path)
    // via the single source of truth so the home search matches /loker exactly.
    router.push(buildJobsUrl({ keyword: keyword.trim(), category, location }))
  }

  // Diurutkan A–Z supaya mudah dipindai; service-nya mengurutkan per jumlah
  // loker (dipakai halaman /kategori & /daerah), jadi urutan diatur di sini saja.
  // localeCompare 'id' agar huruf beraksen/kapital tidak tersortir aneh.
  const byName = (a: { label: string }, b: { label: string }) =>
    a.label.localeCompare(b.label, 'id')

  const locationOptions: DropdownOption[] = locations
    .map((l) => ({ value: l.slug, label: l.name }))
    .sort(byName)
  const categoryOptions: DropdownOption[] = categories
    .map((c) => ({ value: c.slug, label: c.name }))
    .sort(byName)

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-lg border border-white/20"
    >
      {/* Keyword dapat porsi dua kali dropdown: isinya nama posisi panjang
          ("Business Development"), sementara dropdown hanya memuat label satu
          kata. Ruang sisa mengalir ke sini, tapi tidak sampai menggencet
          dropdown di bawah lebar minimumnya. */}
      <label className="relative flex flex-2 items-center gap-2.5 px-4 min-w-0 cursor-text border-b sm:border-b-0 sm:border-r border-border">
        <Search className="h-4.5 w-4.5 text-primary shrink-0" aria-hidden="true" />
        <div className="relative flex-1 min-w-0">
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onFocus={() => setInputFocused(true)}
            onBlur={() => setInputFocused(false)}
            aria-label="Posisi atau kata kunci"
            className="w-full min-w-0 py-4 bg-transparent text-sm font-medium text-brand-text outline-none"
          />
          {/* Animated placeholder — shown only when empty and not focused */}
          {!keyword && !inputFocused && (
            <span
              aria-hidden="true"
              // whitespace-nowrap: tanpa ini kata kunci dua suku kata seperti
              // "Frontend Developer" pecah jadi dua baris dan menaikkan tinggi
              // form. Kelebihannya dipotong, bukan dibungkus.
              className="pointer-events-none absolute inset-y-0 left-0 flex items-center whitespace-nowrap overflow-hidden text-sm font-medium text-brand-muted select-none"
            >
              {typingText}
              <span className="ml-0.5 inline-block w-px h-4 bg-brand-muted animate-[blink_1s_step-end_infinite]" />
            </span>
          )}
        </div>
      </label>

      {/* Location — sm:min-w-36 menjamin ikon + label + panah selalu muat.
          Dengan min-w-0 kolom ini bisa menyusut tanpa batas saat kolom kata
          kunci melebar, dan "Bidang" pun terpotong jadi "Bida…". */}
      <div className="flex-1 min-w-0 sm:min-w-36 px-4 border-b sm:border-b-0 sm:border-r border-border">
        {/* Placeholder sependek mungkin; opsi "semua" di dalam panel tetap
            memakai label lengkap lewat allLabel. */}
        <DropdownSelect
          options={locationOptions}
          value={location}
          onChange={setLocation}
          placeholder="Kota"
          allLabel="Semua Kota"
          searchLabel="Cari kota atau provinsi"
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      {/* Category */}
      <div className="flex-1 min-w-0 sm:min-w-36 px-4">
        <DropdownSelect
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          placeholder="Bidang"
          allLabel="Semua Bidang"
          searchLabel="Cari bidang pekerjaan"
          icon={<Layers className="h-4 w-4" />}
        />
      </div>

      {/* Submit */}
      <div className="p-2 shrink-0">
        <button
          type="submit"
          className="flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-cta px-6 py-2.5 text-sm font-bold text-white hover:bg-cta-dark transition-colors cursor-pointer h-full sm:h-auto"
        >
          <Search className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>Cari Kerja</span>
        </button>
      </div>
    </form>
  )
}
