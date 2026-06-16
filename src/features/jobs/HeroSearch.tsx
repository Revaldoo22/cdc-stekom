'use client'
import { useState, useRef, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Layers, ChevronDown, Check } from 'lucide-react'
import type { Category, Location } from '@/types'

interface Props {
  locations: Location[]
  categories: Category[]
}

interface DropdownOption { value: string; label: string }

interface DropdownSelectProps {
  options: DropdownOption[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  icon: React.ReactNode
}

function DropdownSelect({ options, value, onChange, placeholder, icon }: DropdownSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [open])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className="relative flex items-center gap-2.5 flex-1 min-w-0">
      <span className="shrink-0 text-primary">{icon}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
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
        <div
          role="listbox"
          className="absolute top-full left-0 z-50 mt-1 min-w-48 w-max rounded-xl border border-border bg-white py-1.5 shadow-xl"
        >
          <button
            type="button"
            role="option"
            aria-selected={value === ''}
            onClick={() => { onChange(''); setOpen(false) }}
            className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
              value === '' ? 'bg-primary/8 text-primary font-semibold' : 'text-brand-muted hover:bg-muted hover:text-brand-text'
            }`}
          >
            <span>{placeholder}</span>
            {value === '' && <Check className="h-3.5 w-3.5 shrink-0" />}
          </button>
          <div className="my-1 border-t border-border" />
          {options.map((opt) => (
            <button
              type="button"
              key={opt.value}
              role="option"
              aria-selected={value === opt.value}
              onClick={() => { onChange(opt.value); setOpen(false) }}
              className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-sm cursor-pointer transition-colors ${
                value === opt.value ? 'bg-primary/8 text-primary font-semibold' : 'text-brand-text hover:bg-muted'
              }`}
            >
              <span>{opt.label}</span>
              {value === opt.value && <Check className="h-3.5 w-3.5 shrink-0 text-primary" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export function HeroSearch({ locations, categories }: Props) {
  const router = useRouter()
  const [keyword, setKeyword] = useState('')
  const [location, setLocation] = useState('')
  const [category, setCategory] = useState('')

  function handleSearch(e: FormEvent) {
    e.preventDefault()
    const params = new URLSearchParams()
    if (keyword.trim()) params.set('q', keyword.trim())
    if (location) params.set('location', location)
    if (category) params.set('category', category)
    router.push(`/loker${params.toString() ? `?${params.toString()}` : ''}`)
  }

  const locationOptions: DropdownOption[] = locations.map((l) => ({ value: l.slug, label: l.name }))
  const categoryOptions: DropdownOption[] = categories.map((c) => ({ value: c.slug, label: c.name }))

  return (
    <form
      onSubmit={handleSearch}
      className="flex flex-col sm:flex-row bg-white rounded-2xl shadow-lg border border-white/20"
    >
      {/* Keyword */}
      <label className="flex flex-1 items-center gap-2.5 px-4 min-w-0 cursor-text border-b sm:border-b-0 sm:border-r border-border">
        <Search className="h-4.5 w-4.5 text-primary shrink-0" aria-hidden="true" />
        <input
          type="text"
          placeholder="Posisi atau kata kunci..."
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          className="flex-1 min-w-0 py-4 bg-transparent text-sm font-medium text-brand-text placeholder:text-brand-muted outline-none"
        />
      </label>

      {/* Location */}
      <div className="flex-1 min-w-0 px-4 border-b sm:border-b-0 sm:border-r border-border">
        <DropdownSelect
          options={locationOptions}
          value={location}
          onChange={setLocation}
          placeholder="Semua Kota"
          icon={<MapPin className="h-4 w-4" />}
        />
      </div>

      {/* Category */}
      <div className="flex-1 min-w-0 px-4">
        <DropdownSelect
          options={categoryOptions}
          value={category}
          onChange={setCategory}
          placeholder="Semua Bidang"
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
