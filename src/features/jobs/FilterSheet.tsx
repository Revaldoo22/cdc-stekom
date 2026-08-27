'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, ChevronDown, Search } from 'lucide-react'

export interface FilterGroup {
  key: string
  label: string
  options: { value: string; label: string }[]
}

export type FilterValues = Record<string, string>

interface FilterSheetProps {
  open: boolean
  onClose: () => void
  groups: FilterGroup[]
  /** Nilai filter yang sedang aktif (dari URL). */
  value: FilterValues
  /** Dipanggil saat user menekan Terapkan. */
  onApply: (next: FilterValues) => void
}

/**
 * Bottom sheet filter untuk mobile.
 *
 * Pilihan ditahan di state lokal (`draft`) dan baru dikirim saat "Terapkan"
 * ditekan — bukan tiap tap. Tanpa ini setiap pilihan memicu navigasi + refetch,
 * jadi user tidak bisa menyusun beberapa filter sekaligus.
 */
export function FilterSheet({ open, onClose, groups, value, onApply }: FilterSheetProps) {
  // Sheet hanya dirender saat open, dan open selalu berasal dari event klik —
  // jadi tidak ada risiko mismatch hydration dan tidak butuh guard `mounted`.
  if (!open) return null
  // key = nilai filter aktif: React me-remount panel (dan mereset draft) tiap
  // sheet dibuka atau filter berubah dari luar, tanpa perlu useEffect.
  return <SheetPanel key={JSON.stringify(value)} {...{ onClose, groups, value, onApply }} />
}

// Di atas ambang ini grup dapat input pencarian; di bawahnya (Gaji, Jenis,
// Pengalaman) semua opsi langsung ditampilkan.
const GROUP_SEARCH_THRESHOLD = 10

interface AccordionGroupProps {
  group: FilterGroup
  value: string
  expanded: boolean
  onToggle: () => void
  onSelect: (value: string) => void
}

function AccordionGroup({ group, value, expanded, onToggle, onSelect }: AccordionGroupProps) {
  const [query, setQuery] = useState('')
  const selected = group.options.find((o) => o.value === value)
  const searchable = group.options.length > GROUP_SEARCH_THRESHOLD

  const q = query.trim().toLowerCase()
  const matches = q
    ? group.options.filter((o) => o.label.toLowerCase().includes(q))
    : group.options

  return (
    <div>
      <h3>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
        >
          <span className="flex-1 text-sm font-bold text-brand-text">{group.label}</span>
          {/* Nilai terpilih ikut ditampilkan di header: saat grup tertutup, ini
              satu-satunya petunjuk filter mana yang aktif. */}
          {selected && (
            <span className="max-w-[45%] truncate rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
              {selected.label}
            </span>
          )}
          <ChevronDown
            className={`h-4 w-4 shrink-0 text-brand-muted transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>
      </h3>

      {expanded && (
        <div className="px-4 pb-4">
          {searchable && (
            <div className="mb-3 flex items-center gap-2 rounded-lg bg-muted px-2.5">
              <Search className="h-3.5 w-3.5 shrink-0 text-brand-muted" aria-hidden="true" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={`Cari ${group.label.toLowerCase()}...`}
                aria-label={`Cari ${group.label}`}
                className="w-full bg-transparent py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted"
              />
            </div>
          )}

          {/* Daftar panjang dibatasi tingginya dan scroll sendiri, supaya grup
              lain tetap terjangkau tanpa scroll jauh. */}
          <div className={`flex flex-wrap gap-2 ${searchable ? 'max-h-56 overflow-y-auto overscroll-contain' : ''}`}>
            {/* Chip "Semua" — cara eksplisit mengosongkan grup ini. Tanpa ini
                satu-satunya jalan adalah tap ulang pilihan aktif, yang tidak
                terlihat sebagai aksi. Disembunyikan saat mencari agar tidak
                mengganggu daftar hasil. */}
            {!q && (
              <button
                type="button"
                aria-pressed={!value}
                onClick={() => onSelect('')}
                className={`rounded-full border px-3.5 py-2 text-[13px] transition-colors ${
                  !value
                    ? 'border-primary bg-primary font-semibold text-white'
                    : 'border-border bg-white text-brand-muted hover:border-primary/50'
                }`}
              >
                Semua
              </button>
            )}
            {matches.map((opt) => {
              const active = value === opt.value
              return (
                <button
                  key={opt.value}
                  type="button"
                  aria-pressed={active}
                  // Tap ulang pada pilihan aktif = batalkan (filter opsional).
                  onClick={() => onSelect(active ? '' : opt.value)}
                  className={`rounded-full border px-3.5 py-2 text-[13px] transition-colors ${
                    active
                      ? 'border-primary bg-primary font-semibold text-white'
                      : 'border-border bg-white text-brand-text hover:border-primary/50'
                  }`}
                >
                  {opt.label}
                </button>
              )
            })}
            {matches.length === 0 && (
              <p className="w-full py-4 text-center text-sm text-brand-muted">Tidak ditemukan.</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function SheetPanel({
  onClose, groups, value, onApply,
}: Omit<FilterSheetProps, 'open'>) {
  const [draft, setDraft] = useState<FilterValues>(value)
  // Satu grup terbuka sekaligus (accordion): dengan 5 grup — salah satunya
  // Lokasi berisi ~320 opsi — semua terbuka membuat sheet sangat panjang.
  // Default: grup pertama yang sudah punya filter aktif ikut terbuka, supaya
  // user langsung lihat pilihannya; kalau belum ada, semua tertutup.
  const [expanded, setExpanded] = useState<string | null>(
    () => groups.find((g) => value[g.key])?.key ?? null,
  )

  // Kunci scroll body selama sheet terbuka + tutup dengan Escape.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  const activeCount = Object.values(draft).filter(Boolean).length

  return createPortal(
    <div className="fixed inset-0 z-9999 lg:hidden" role="dialog" aria-modal="true" aria-label="Filter lowongan">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Tutup filter"
        onClick={onClose}
        className="absolute inset-0 h-full w-full cursor-default bg-black/50 animate-in fade-in duration-200"
      />

      {/* Sheet */}
      <div className="absolute inset-x-0 bottom-0 flex max-h-[88svh] flex-col rounded-t-2xl bg-white animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="relative shrink-0 border-b border-border px-4 py-3.5">
          <p className="text-center text-sm font-bold text-brand-text">Filter</p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-brand-muted transition-colors hover:bg-muted hover:text-brand-text"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Grup filter — area ini yang di-scroll, bukan seluruh sheet, supaya
            tombol Terapkan tetap terlihat. */}
        <div className="min-h-0 flex-1 divide-y divide-border overflow-y-auto overscroll-contain">
          {groups.map((group) => (
            <AccordionGroup
              key={group.key}
              group={group}
              value={draft[group.key] ?? ''}
              expanded={expanded === group.key}
              onToggle={() => setExpanded((e) => (e === group.key ? null : group.key))}
              onSelect={(v) => setDraft((d) => ({ ...d, [group.key]: v }))}
            />
          ))}
        </div>

        {/* Aksi — pb pakai safe-area agar tidak ketutup gesture bar iOS/Android. */}
        <div className="shrink-0 space-y-2.5 border-t border-border px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
          <button
            type="button"
            onClick={() => { onApply(draft); onClose() }}
            className="w-full rounded-full bg-cta py-3 text-sm font-bold text-white transition-colors hover:bg-cta-dark"
          >
            Terapkan{activeCount > 0 ? ` (${activeCount})` : ''}
          </button>
          <button
            type="button"
            // Clear to an explicit '' per group rather than {}. updateParams
            // spreads the draft over the current filter, so an empty object
            // overrides nothing and Reset silently did nothing at all.
            onClick={() => {
              setDraft(Object.fromEntries(groups.map((g) => [g.key, ''])))
              setExpanded(null)
            }}
            className="w-full rounded-full border border-cta py-3 text-sm font-semibold text-cta transition-colors hover:bg-cta/5"
          >
            Reset
          </button>
        </div>
      </div>
    </div>,
    document.body,
  )
}
