'use client'

import { Filter } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import type { Category, Location, TipeKerja } from '@/types'

interface FilterSidebarProps {
  categories: Category[]
  locations: Location[]
  tipeKerja: TipeKerja[]
  selectedCategory: string
  selectedLocation: string
  selectedTipe: string
  onCategoryChange: (v: string) => void
  onLocationChange: (v: string) => void
  onTipeChange: (v: string) => void
  onReset: () => void
}

export function FilterSidebar({
  categories,
  locations,
  tipeKerja,
  selectedCategory,
  selectedLocation,
  selectedTipe,
  onCategoryChange,
  onLocationChange,
  onTipeChange,
  onReset,
}: FilterSidebarProps) {
  const hasFilter = selectedCategory || selectedLocation || selectedTipe

  return (
    <aside
      aria-label="Filter lowongan"
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-brand-text">
          <Filter className="h-4 w-4" aria-hidden="true" />
          Filter
        </h2>
        {hasFilter && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="cursor-pointer text-xs text-brand-muted h-7 px-2"
          >
            Reset
          </Button>
        )}
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor="filter-category" className="mb-1 block text-xs font-medium text-brand-muted">
            Kategori
          </label>
          <Select value={selectedCategory || 'all'} onValueChange={(v) => onCategoryChange(!v || v === 'all' ? '' : v)}>
            <SelectTrigger id="filter-category" className="cursor-pointer">
              <SelectValue placeholder="Semua kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua kategori</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.slug} value={c.slug} className="cursor-pointer">
                  {c.name} ({c.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="filter-location" className="mb-1 block text-xs font-medium text-brand-muted">
            Daerah
          </label>
          <Select value={selectedLocation || 'all'} onValueChange={(v) => onLocationChange(!v || v === 'all' ? '' : v)}>
            <SelectTrigger id="filter-location" className="cursor-pointer">
              <SelectValue placeholder="Semua daerah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua daerah</SelectItem>
              {locations.map((l) => (
                <SelectItem key={l.slug} value={l.slug} className="cursor-pointer">
                  {l.name} ({l.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label htmlFor="filter-tipe" className="mb-1 block text-xs font-medium text-brand-muted">
            Tipe Pekerjaan
          </label>
          <Select value={selectedTipe || 'all'} onValueChange={(v) => onTipeChange(!v || v === 'all' ? '' : v)}>
            <SelectTrigger id="filter-tipe" className="cursor-pointer">
              <SelectValue placeholder="Semua tipe" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua tipe</SelectItem>
              {tipeKerja.map((t) => (
                <SelectItem key={t.slug} value={t.slug} className="cursor-pointer">
                  {t.name} ({t.count})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </aside>
  )
}
