'use client'

import { X, SlidersHorizontal, MapPin, Layers, Clock, Banknote, GraduationCap } from 'lucide-react'
import type { Category, Location, TipeKerja } from '@/types'
import { SALARY_RANGES, EXPERIENCE_LEVELS } from '@/config/filters'

interface FilterSidebarProps {
  categories: Category[]
  locations: Location[]
  tipeKerja: TipeKerja[]
  selectedCategory: string
  selectedLocation: string
  selectedTipe: string
  selectedSalary: string
  selectedExperience: string
  onCategoryChange: (v: string) => void
  onLocationChange: (v: string) => void
  onTipeChange: (v: string) => void
  onSalaryChange: (v: string) => void
  onExperienceChange: (v: string) => void
  onReset: () => void
}

export function FilterSidebar({
  categories,
  locations,
  tipeKerja,
  selectedCategory,
  selectedLocation,
  selectedTipe,
  selectedSalary,
  selectedExperience,
  onCategoryChange,
  onLocationChange,
  onTipeChange,
  onSalaryChange,
  onExperienceChange,
  onReset,
}: FilterSidebarProps) {
  const activeCount = [selectedCategory, selectedLocation, selectedTipe, selectedSalary, selectedExperience].filter(Boolean).length

  return (
    <aside aria-label="Filter lowongan" className="rounded-xl border border-border bg-white overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-brand-bg">
        <span className="flex items-center gap-2 text-sm font-semibold text-brand-text">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden="true" />
          Filter
          {activeCount > 0 && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-white">
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-brand-muted hover:text-destructive transition-colors cursor-pointer"
          >
            <X className="h-3 w-3" /> Reset
          </button>
        )}
      </div>

      <div className="divide-y divide-border">
        {/* Kategori */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted mb-3">
            <Layers className="h-3.5 w-3.5" aria-hidden="true" />
            Kategori
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onCategoryChange('')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                !selectedCategory
                  ? 'bg-primary/8 text-primary font-semibold'
                  : 'text-brand-muted hover:bg-muted hover:text-brand-text'
              }`}
            >
              <span>Semua Kategori</span>
            </button>
            {categories.map((c) => (
              <button
                key={c.slug}
                onClick={() => onCategoryChange(c.slug === selectedCategory ? '' : c.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                  selectedCategory === c.slug
                    ? 'bg-primary/8 text-primary font-semibold'
                    : 'text-brand-text hover:bg-muted'
                }`}
              >
                <span>{c.name}</span>
                <span className={`text-xs ${selectedCategory === c.slug ? 'text-primary/60' : 'text-brand-muted/60'}`}>
                  {c.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Lokasi */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted mb-3">
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
            Lokasi
          </p>
          <div className="space-y-1">
            <button
              onClick={() => onLocationChange('')}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                !selectedLocation
                  ? 'bg-primary/8 text-primary font-semibold'
                  : 'text-brand-muted hover:bg-muted hover:text-brand-text'
              }`}
            >
              <span>Semua Kota</span>
            </button>
            {locations.map((l) => (
              <button
                key={l.slug}
                onClick={() => onLocationChange(l.slug === selectedLocation ? '' : l.slug)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                  selectedLocation === l.slug
                    ? 'bg-primary/8 text-primary font-semibold'
                    : 'text-brand-text hover:bg-muted'
                }`}
              >
                <span>{l.name}</span>
                <span className={`text-xs ${selectedLocation === l.slug ? 'text-primary/60' : 'text-brand-muted/60'}`}>
                  {l.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tipe Pekerjaan */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted mb-3">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" />
            Tipe Pekerjaan
          </p>
          <div className="flex flex-wrap gap-2">
            {tipeKerja.map((t) => {
              const active = selectedTipe === t.slug
              return (
                <button
                  key={t.slug}
                  onClick={() => onTipeChange(active ? '' : t.slug)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'border-primary bg-primary text-white'
                      : 'border-border text-brand-muted hover:border-primary hover:text-primary'
                  }`}
                >
                  {t.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Gaji */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted mb-3">
            <Banknote className="h-3.5 w-3.5" aria-hidden="true" />
            Kisaran Gaji
          </p>
          <div className="flex flex-wrap gap-2">
            {SALARY_RANGES.map((r) => {
              const active = selectedSalary === r.slug
              return (
                <button
                  key={r.slug}
                  onClick={() => onSalaryChange(active ? '' : r.slug)}
                  className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors cursor-pointer ${
                    active
                      ? 'border-cta bg-cta text-white'
                      : 'border-border text-brand-muted hover:border-cta hover:text-cta'
                  }`}
                >
                  {r.label}
                </button>
              )
            })}
          </div>
        </div>

        {/* Level Pengalaman */}
        <div className="px-4 py-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-brand-muted mb-3">
            <GraduationCap className="h-3.5 w-3.5" aria-hidden="true" />
            Level Pengalaman
          </p>
          <div className="space-y-1">
            {EXPERIENCE_LEVELS.map((e) => {
              const active = selectedExperience === e.slug
              return (
                <button
                  key={e.slug}
                  onClick={() => onExperienceChange(active ? '' : e.slug)}
                  className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors cursor-pointer ${
                    active
                      ? 'bg-primary/8 text-primary font-semibold'
                      : 'text-brand-text hover:bg-muted'
                  }`}
                >
                  <span>{e.label}</span>
                  <span className={`text-xs ${active ? 'text-primary/60' : 'text-brand-muted/60'}`}>
                    {e.desc}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </aside>
  )
}
