'use client'

import { useState, useCallback, useTransition, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search, MapPin, X, ChevronDown, Building2, BadgeDollarSign,
  Briefcase, Clock, CheckCircle2, Wrench, ArrowUpRight,
  Bookmark, BookmarkCheck, SlidersHorizontal, Calendar,
} from 'lucide-react'
import type { Job, Category, Location, TipeKerja } from '@/types'
import { SALARY_RANGES } from '@/config/filters'
import { buildJobsUrl } from '@/lib/seo-urls'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { NoResults } from '@/components/shared/NoResults'
import { Pagination } from '@/components/shared/Pagination'
import { ApplyButton } from '@/features/jobs/ApplyButton'
import { FilterSheet, type FilterGroup, type FilterValues } from '@/features/jobs/FilterSheet'
import { PER_PAGE } from '@/config/api'

// ── helpers ───────────────────────────────────────────────────────────────────

function relativeTime(dateStr?: string): string {
  // Zero-dated rows arrive as undefined — see cleanDate() in cdc-loker.service.
  if (!dateStr) return 'Tanggal tidak tertera'
  const d = new Date(dateStr)
  const posted = Date.UTC(d.getFullYear(), d.getMonth(), d.getDate())
  const now = new Date()
  const today = Date.UTC(now.getFullYear(), now.getMonth(), now.getDate())
  const days = Math.floor((today - posted) / 86_400_000)
  // Samakan dengan JobCard: loker hari ini menampilkan tanggalnya, bukan "Baru".
  if (days <= 0) return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
  if (days < 7) return `${days} hari yang lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu yang lalu`
  if (days < 365) return `${Math.floor(days / 30)} bulan yang lalu`
  return `${Math.floor(days / 365)} tahun yang lalu`
}

const TYPE_BADGE: Record<string, { bg: string; text: string }> = {
  'full-time': { bg: 'bg-blue-50',    text: 'text-blue-700'   },
  'part-time': { bg: 'bg-purple-50',  text: 'text-purple-700' },
  magang:      { bg: 'bg-emerald-50', text: 'text-emerald-700'},
  freelance:   { bg: 'bg-orange-50',  text: 'text-orange-700' },
  kontrak:     { bg: 'bg-yellow-50',  text: 'text-yellow-800' },
}

const EXPERIENCE_LABEL: Record<string, string> = {
  'fresh-graduate': 'Fresh Graduate',
  junior: '1–3 thn',
  mid:    '3–5 thn',
  senior: '5+ thn',
}

// ── FilterPill ─────────────────────────────────────────────────────────────────

interface FilterPillProps {
  label: string
  icon?: React.ReactNode
  options: { value: string; label: string }[]
  value: string
  onChange: (v: string) => void
  dark?: boolean
  /**
   * Teks opsi "kosongkan filter" di puncak daftar, mis. "Semua Gaji".
   * Beda dengan tombol "Hapus filter" yang hanya muncul saat filter aktif dan
   * ikut hilang saat user mengetik pencarian — opsi ini selalu terlihat, jadi
   * jalan keluarnya konsisten seperti dropdown Tanggal yang punya "Semua".
   */
  allLabel?: string
}

// Di atas ambang ini, dropdown pill dapat input pencarian.
const PILL_SEARCH_THRESHOLD = 10

function FilterPill({ label, icon, options, value, onChange, dark = false, allLabel }: FilterPillProps) {
  const [open, setOpen]       = useState(false)
  const [query, setQuery]     = useState('')
  const [rect, setRect]       = useState<DOMRect | null>(null)
  const [mounted, setMounted] = useState(false)
  const btnRef   = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)
  const active   = !!value

  useEffect(() => { setMounted(true) }, [])

  useEffect(() => {
    if (!open) return
    function onOutside(e: MouseEvent) {
      const target = e.target as Node
      // The panel is portaled to <body>, so it's outside btnRef — must check it
      // explicitly or clicking an option would close the menu before selecting.
      if (!btnRef.current?.contains(target) && !panelRef.current?.contains(target)) {
        setOpen(false)
        setQuery('')
      }
    }
    document.addEventListener('mousedown', onOutside)
    return () => document.removeEventListener('mousedown', onOutside)
  }, [open])

  // Query selalu dibersihkan saat panel ditutup, supaya sisa pencarian lama
  // tidak menyembunyikan opsi ketika dropdown dibuka lagi.
  function close() {
    setOpen(false)
    setQuery('')
  }

  function handleToggle() {
    if (open) { close(); return }
    if (btnRef.current) setRect(btnRef.current.getBoundingClientRect())
    setOpen(true)
  }

  // Pencarian hanya muncul untuk daftar panjang (Lokasi ~320, Bidang ~19);
  // untuk Gaji/Jenis yang cuma 4-5 opsi, input pencarian jadi gangguan.
  // Semua opsi tetap ditampilkan — daftarnya discroll, tidak dipotong.
  const searchable = options.length > PILL_SEARCH_THRESHOLD
  const q = query.trim().toLowerCase()
  const visible = q ? options.filter((o) => o.label.toLowerCase().includes(q)) : options

  const dropdown =
    mounted && open && rect
      ? createPortal(
          <div
            ref={panelRef}
            style={{ position: 'fixed', top: rect.bottom + 6, left: rect.left, zIndex: 9999 }}
            className="w-64 overflow-hidden rounded-2xl border border-border bg-white shadow-lg"
          >
            {searchable && (
              <div className="border-b border-border p-2">
                <div className="flex items-center gap-2 rounded-lg bg-muted px-2.5">
                  <Search className="h-3.5 w-3.5 shrink-0 text-brand-muted" aria-hidden />
                  <input
                    type="text"
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        if (visible.length > 0) { onChange(visible[0].value); close() }
                      }
                      if (e.key === 'Escape') close()
                    }}
                    placeholder={`Cari ${label.toLowerCase()}...`}
                    aria-label={`Cari ${label}`}
                    className="w-full bg-transparent py-2 text-sm text-brand-text outline-none placeholder:text-brand-muted"
                  />
                </div>
              </div>
            )}

            <div className="max-h-80 overflow-y-auto overscroll-contain py-2">
              {/* Opsi "Semua …" — selalu ada (kecuali saat mengetik pencarian,
                  di mana daftar hasil yang relevan). Ini jalan keluar utama; tombol
                  "Hapus filter" merah di bawahnya jadi penegas saat filter aktif. */}
              {allLabel && !q && (
                <button
                  type="button"
                  onClick={() => { onChange(''); close() }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    !active
                      ? 'bg-primary/[0.07] text-primary font-semibold'
                      : 'text-brand-muted hover:bg-slate-50 hover:text-brand-text'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{allLabel}</span>
                  {!active && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                </button>
              )}
              {allLabel && !q && <div className="my-1 border-t border-border" />}
              {active && !q && (
                <button
                  type="button"
                  onClick={() => { onChange(''); close() }}
                  className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-red-50 transition-colors cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" /> Hapus filter
                </button>
              )}
              {visible.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => { onChange(opt.value); close() }}
                  className={`flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm transition-colors cursor-pointer ${
                    value === opt.value
                      ? 'bg-primary/[0.07] text-primary font-semibold'
                      : 'text-brand-text hover:bg-slate-50'
                  }`}
                >
                  <span className="min-w-0 flex-1 truncate">{opt.label}</span>
                  {value === opt.value && <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />}
                </button>
              ))}
              {visible.length === 0 && (
                <p className="px-4 py-6 text-center text-sm text-brand-muted">Tidak ditemukan.</p>
              )}
            </div>

            {q && visible.length > 0 && (
              <p className="border-t border-border bg-brand-bg px-4 py-2 text-[11px] text-brand-muted">
                {visible.length} hasil
              </p>
            )}
          </div>,
          document.body,
        )
      : null

  return (
    <div className="shrink-0">
      <button
        ref={btnRef}
        type="button"
        onClick={handleToggle}
        className={`flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-[13px] font-medium transition-all duration-150 cursor-pointer whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-1 ${
          dark
            ? active
              ? 'border-white bg-white text-primary'
              : 'border-white/30 bg-transparent text-white hover:border-white/70 hover:bg-white/10'
            : active
              ? 'border-primary bg-primary text-white'
              : 'border-border bg-white text-brand-text hover:border-primary/50 hover:text-primary hover:bg-primary/4'
        }`}
      >
        {icon && <span className="opacity-70">{icon}</span>}
        <span>{selected ? selected.label : label}</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-150 opacity-60 ${open ? 'rotate-180' : ''}`} />
      </button>
      {dropdown}
    </div>
  )
}

// ── CompactJobCard ─────────────────────────────────────────────────────────────

interface CompactJobCardProps {
  job: Job
  isSelected: boolean
  onSelect: (job: Job) => void
}

function CompactJobCard({ job, isSelected, onSelect }: CompactJobCardProps) {
  const router = useRouter()
  const { toggleSave, isSaved } = useSavedJobs()
  const saved  = isSaved(job.id)
  const badge  = TYPE_BADGE[job.employmentTypeSlug] ?? { bg: 'bg-slate-100', text: 'text-slate-600' }

  function handleClick() {
    if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
      onSelect(job)
    } else {
      router.push(`/job/${job.slug}`)
    }
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={(e) => e.key === 'Enter' && handleClick()}
      aria-pressed={isSelected}
      className={`group relative flex gap-3.5 px-5 py-4 border-b border-border/70 transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary border-l-[3px] ${
        isSelected
          ? 'bg-sky-50/70 border-l-primary'
          : 'bg-white border-l-transparent hover:bg-slate-50/80'
      }`}
    >
      {/* Company icon */}
      <div className="shrink-0 mt-0.5">
        <span className={`flex h-11 w-11 items-center justify-center rounded-xl border ${
          isSelected ? 'border-primary/30 bg-primary/10 text-primary' : 'border-border/60 bg-slate-100 text-slate-400'
        }`}>
          <Building2 className="h-5 w-5" aria-hidden />
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-7">
        <p className={`font-semibold text-[13.5px] leading-snug line-clamp-2 transition-colors ${
          isSelected ? 'text-primary' : 'text-brand-text group-hover:text-primary'
        }`}>
          {job.title}
        </p>

        <p className="text-[12.5px] text-brand-muted mt-0.5 truncate font-medium">{job.company}</p>

        <div className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3 shrink-0 text-brand-muted/60" aria-hidden />
          <p className="text-[12px] text-brand-muted/80 truncate">{job.location}</p>
        </div>

        <div className="flex items-center gap-2 mt-2.5 flex-wrap">
          <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badge.bg} ${badge.text}`}>
            {job.employmentType}
          </span>
          {job.salary && (
            <span className="text-[11px] text-brand-muted font-medium">{job.salary}</span>
          )}
          <span className="ml-auto text-[11px] text-brand-muted/50 font-medium">{relativeTime(job.postedAt)}</span>
        </div>
      </div>

      {/* Bookmark button */}
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); toggleSave(job.id) }}
        aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan lowongan'}
        className={`absolute top-3.5 right-3.5 p-1.5 rounded-lg transition-colors duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
          saved
            ? 'text-primary'
            : 'text-border hover:text-primary hover:bg-primary/5'
        }`}
      >
        {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
      </button>
    </div>
  )
}

// ── JobDetailPanel ─────────────────────────────────────────────────────────────

function JobDetailPanel({ job }: { job: Job }) {
  const { toggleSave, isSaved } = useSavedJobs()
  const [reportOpen, setReportOpen] = useState(false)
  const [showSticky, setShowSticky] = useState(false)
  const headerRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const saved     = isSaved(job.id)
  const isExpired = job.expiresAt ? new Date(job.expiresAt) < new Date() : false
  const daysLeft  = job.expiresAt
    ? Math.ceil((new Date(job.expiresAt).getTime() - Date.now()) / 86_400_000)
    : null

  // Hide sticky bar whenever job changes, then re-observe the new header
  useEffect(() => {
    setShowSticky(false)
    const header    = headerRef.current
    const container = scrollRef.current
    if (!header || !container) return
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { root: container, threshold: 0 },
    )
    observer.observe(header)
    return () => observer.disconnect()
  }, [job.id])

  return (
    <div className="relative flex flex-col h-full overflow-hidden">

      {/* ── Sticky bar — overlays the scroll area (absolute) so it never pushes
           content or interrupts scrolling. Slides down on appear. ── */}
      <div
        aria-hidden={!showSticky}
        className={`absolute inset-x-0 top-0 z-10 bg-white/95 backdrop-blur border-b border-border/70 transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none ${
          showSticky
            ? 'translate-y-0 opacity-100'
            : '-translate-y-full opacity-0 pointer-events-none'
        }`}
      >
        <div className="px-5 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="font-bold text-[13px] text-brand-text truncate leading-tight">{job.title}</p>
            <p className="text-[11.5px] text-brand-muted truncate mt-0.5">{job.company}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ApplyButton job={job} disabled={isExpired} className="text-[13px] py-2 px-4 h-auto" />
            <button
              type="button"
              onClick={() => toggleSave(job.id)}
              aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan'}
              className={`flex items-center gap-1.5 rounded-xl border px-3.5 py-2 text-[13px] font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                saved
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-border text-brand-muted hover:border-primary/40 hover:text-primary hover:bg-primary/4'
              }`}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              Simpan
            </button>
          </div>
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto">
        <div className="px-7 pt-7 pb-10 max-w-2xl">

          {/* Job header — observed by IntersectionObserver */}
          <div ref={headerRef} className="flex items-start gap-4 mb-5">
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-border/60 bg-slate-100 text-slate-400">
              <Building2 className="h-6 w-6" aria-hidden />
            </span>
            <div className="flex-1 min-w-0 pt-0.5">
              <h2 className="text-[19px] font-bold text-brand-text leading-snug">{job.title}</h2>
              <p className="text-sm text-brand-muted mt-1 font-medium">{job.company}</p>
            </div>
            <Link
              href={`/job/${job.slug}`}
              className="shrink-0 mt-0.5 p-2 rounded-xl border border-border/60 hover:border-primary/40 hover:bg-primary/4 text-brand-muted hover:text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              title="Buka halaman penuh"
            >
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>

          {/* Meta grid */}
          <div className="grid grid-cols-2 gap-2 mb-5">
            {[
              { icon: <MapPin className="h-3.5 w-3.5 text-primary" />,          label: job.location || 'Lokasi tidak tertera' },
              { icon: <Briefcase className="h-3.5 w-3.5 text-primary" />,       label: job.employmentType || 'Tipe kerja tidak tertera' },
              { icon: <BadgeDollarSign className="h-3.5 w-3.5 text-primary" />, label: job.salary || 'Gaji tidak tertera' },
              // Only shown when present — the live API never sets it, so a
              // permanent "Pengalaman tidak tertera" tile was pure noise.
              ...(job.experienceLevel
                ? [{ icon: <Clock className="h-3.5 w-3.5 text-primary" />, label: EXPERIENCE_LABEL[job.experienceLevel] ?? job.experienceLevel }]
                : []),
              { icon: <Calendar className="h-3.5 w-3.5 text-primary" />, label: job.postedAt
                  ? `Diposting ${new Date(job.postedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
                  : 'Tanggal tidak tertera' },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-2 rounded-xl border border-border/60 bg-slate-50 px-3 py-2.5">
                {item.icon}
                <span className="text-[12.5px] font-medium text-brand-text truncate">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Deadline badge */}
          {job.expiresAt && (
            <div className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold mb-6 ${
              isExpired
                ? 'bg-red-50 text-red-600 border border-red-200'
                : daysLeft !== null && daysLeft <= 7
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'bg-slate-100 text-brand-muted border border-border/60'
            }`}>
              <Clock className="h-3 w-3" />
              {isExpired
                ? 'Lowongan telah ditutup'
                : daysLeft !== null && daysLeft <= 7
                  ? `Ditutup dalam ${daysLeft} hari`
                  : `Hingga ${new Date(job.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}`
              }
            </div>
          )}

          {/* Apply / Save — above the description */}
          <div className="flex items-center gap-2 mb-6">
            <ApplyButton job={job} disabled={isExpired} className="flex-1" />
            <button
              type="button"
              onClick={() => toggleSave(job.id)}
              aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan'}
              className={`flex items-center gap-1.5 rounded-xl border px-4 py-2 text-[13px] font-semibold transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                saved
                  ? 'border-primary/30 bg-primary/5 text-primary'
                  : 'border-border text-brand-muted hover:border-primary/40 hover:text-primary hover:bg-primary/4'
              }`}
            >
              {saved ? <BookmarkCheck className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
              Simpan
            </button>
          </div>

          {/* Content sections */}
          <div className="space-y-8">

            {job.description && (
              <section>
                <h3 className="text-[13px] font-bold text-brand-text uppercase tracking-wider mb-3.5">
                  Deskripsi Pekerjaan
                </h3>
                <div
                  className="text-[13.5px] leading-relaxed text-brand-muted [&_p]:mb-2.5 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5 [&_strong]:font-semibold [&_strong]:text-brand-text"
                  dangerouslySetInnerHTML={{ __html: job.description }}
                />
              </section>
            )}

            {job.requirements && job.requirements.length > 0 && (
              <section>
                <h3 className="text-[13px] font-bold text-brand-text uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" /> Persyaratan
                </h3>
                <ul className="space-y-2.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-[13.5px] text-brand-muted">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {job.skills && job.skills.length > 0 && (
              <section>
                <h3 className="text-[13px] font-bold text-brand-text uppercase tracking-wider mb-3.5 flex items-center gap-2">
                  <Wrench className="h-4 w-4 text-primary" /> Keahlian
                </h3>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-primary/20 bg-primary/6 text-primary px-3 py-1 text-[12px] font-semibold"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Report section */}
            <section className="border-t border-border/60 pt-6">
              <button
                type="button"
                onClick={() => setReportOpen((v) => !v)}
                className="flex items-center gap-1.5 text-[13px] font-semibold text-brand-muted underline underline-offset-4 cursor-pointer hover:text-primary transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
              >
                Laporkan iklan lowongan ini
                <ChevronDown className={`h-4 w-4 transition-transform duration-150 ${reportOpen ? 'rotate-180' : ''}`} />
              </button>
              {reportOpen && (
                <div className="mt-3 grid grid-cols-1 gap-1.5">
                  {['Informasi menyesatkan', 'Dugaan penipuan', 'Konten tidak pantas', 'Lowongan sudah tidak aktif'].map((reason) => (
                    <button
                      key={reason}
                      type="button"
                      onClick={() => setReportOpen(false)}
                      className="text-left rounded-xl border border-border/60 px-4 py-2.5 text-[13px] text-brand-text hover:border-primary/40 hover:bg-primary/4 hover:text-primary transition-all duration-150 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      {reason}
                    </button>
                  ))}
                </div>
              )}
            </section>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Skeleton ───────────────────────────────────────────────────────────────────

function CardSkeleton() {
  return (
    <div className="flex gap-3.5 px-5 py-4 border-b border-border/70 animate-pulse">
      <div className="h-11 w-11 shrink-0 rounded-xl bg-slate-100" />
      <div className="flex-1 space-y-2 pt-0.5">
        <div className="h-3.5 w-3/4 rounded-full bg-slate-100" />
        <div className="h-3 w-1/2 rounded-full bg-slate-100" />
        <div className="h-3 w-1/3 rounded-full bg-slate-100" />
        <div className="flex gap-2 pt-1">
          <div className="h-5 w-16 rounded-full bg-slate-100" />
          <div className="h-5 w-20 rounded-full bg-slate-100" />
        </div>
      </div>
    </div>
  )
}

// ── JobListingClient ───────────────────────────────────────────────────────────

interface JobListingClientProps {
  jobs: Job[]
  total: number
  categories: Category[]
  locations: Location[]
  tipeKerja: TipeKerja[]
  initialPage: number
  initialKeyword: string
  initialCategory: string
  initialLocation: string
  initialTipe: string
  initialSalary: string
  initialExperience: string
  initialJobId?: string
  initialSelectedJob?: Job | null
}

export function JobListingClient({
  jobs, total, categories, locations, tipeKerja,
  initialPage, initialKeyword, initialCategory,
  initialLocation, initialTipe, initialSalary, initialExperience,
  initialJobId = '', initialSelectedJob = null,
}: JobListingClientProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  // Selection is driven by ?jobId= so it is deep-linkable (shareable / refresh-safe).
  // Filter/page/search changes are real navigations that remount with a fresh
  // initialJobId; a card click only updates this state + the URL (no reload).
  const [selectedId, setSelectedId] = useState(initialJobId)
  const [keyword, setKeyword]       = useState(initialKeyword)
  const [sheetOpen, setSheetOpen]   = useState(false)

  // Prefer the job in the current page slice; fall back to the server-resolved
  // deep-link job (which may live on another page of the full batch).
  const selectedJob =
    jobs.find((j) => j.id === selectedId)
    ?? (initialSelectedJob?.id === selectedId ? initialSelectedJob : null)

  // Open a job in the right panel and reflect it in the URL (?jobId=) without a
  // full navigation — exactly like JobStreet's listing → detail interaction.
  const selectJob = useCallback((job: Job) => {
    setSelectedId(job.id)
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('jobId', job.id)
      window.history.replaceState(null, '', url.toString())
    }
  }, [])

  // Current full filter state. A taxonomy change rebuilds the canonical URL
  // (category/location/tipe → path, salary/experience → query) so the address
  // bar always reflects the active filters — same behaviour as JobStreet.
  const currentFilter = useCallback(
    (): Parameters<typeof buildJobsUrl>[0] => ({
      category:   initialCategory,
      location:   initialLocation,
      tipe:       initialTipe,
      salary:     initialSalary,
      experience: initialExperience,
      keyword:    initialKeyword,
      // selectedId, not initialJobId — it tracks the panel the user actually has
      // open, so filtering or paging keeps that listing visible instead of
      // dropping back to the empty "Pilih lowongan kerja" placeholder.
      jobId:      selectedId,
    }),
    [initialCategory, initialLocation, initialTipe, initialSalary, initialExperience, initialKeyword, selectedId],
  )

  // Arriving from another page (mis. "Lihat semua" di beranda) must land at the
  // top. The Suspense fallback wrapping this component is only h-64 tall, so the
  // browser restores/keeps a scroll offset against that short page and ends up
  // mid-listing once the real content expands it. Back/forward is left alone —
  // there the restored position is the wanted behaviour.
  useEffect(() => {
    const isRestore =
      typeof window !== 'undefined' &&
      (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming | undefined)?.type === 'back_forward'
    if (!isRestore) window.scrollTo(0, 0)
  }, [])

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      // page always resets to 1 on any filter change (omitted → page 1)
      const next = { ...currentFilter(), ...updates }
      startTransition(() => router.push(buildJobsUrl(next)))
    },
    [router, currentFilter],
  )

  const handleSearch = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault()
      // keyword and category are independent slots (JobStreet style) — a search
      // sets the keyword and keeps any active category/location/tipe refinement.
      startTransition(() => router.push(buildJobsUrl({ ...currentFilter(), keyword })))
    },
    [keyword, currentFilter, router],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      startTransition(() => router.push(buildJobsUrl({ ...currentFilter(), page })))
    },
    [router, currentFilter],
  )

  // Gaji TIDAK diurut A–Z: urutan aslinya sudah bermakna (rendah→tinggi),
  // mengurut alfabetis justru mengacaukannya.
  const salaryOptions     = SALARY_RANGES.map((r) => ({ value: r.slug, label: r.label }))
  const tipeOptions       = tipeKerja.map((t) => ({ value: t.slug, label: t.name }))
  // Lokasi & bidang diurut A–Z — daftarnya panjang (~320 & ~19), jadi urutan
  // alfabetis jauh lebih mudah dipindai daripada urutan jumlah loker.
  const byName = (a: { label: string }, b: { label: string }) =>
    a.label.localeCompare(b.label, 'id')
  const locationOptions = locations
    .map((l) => ({ value: l.slug, label: l.name }))
    .sort(byName)
  const categoryOptions = categories
    .map((c) => ({ value: c.slug, label: c.name }))
    .sort(byName)

  // Two counts, because they answer different questions. The mobile sheet badge
  // may only count what the sheet itself can change; Reset also clears the
  // keyword, so it must count that too — otherwise searching without any filter
  // left no way to clear the search, and "Reset (2)" silently cleared 3 things.
  const activeCount = [initialCategory, initialLocation, initialTipe, initialSalary, initialExperience].filter(Boolean).length
  const resetCount  = activeCount + (initialKeyword ? 1 : 0)

  // Bottom sheet mobile. Key harus sama dengan nama param di updateParams.
  //
  // "Level Pengalaman" is deliberately absent: the API exposes no query param for
  // it and mapLoker never populates job.experienceLevel, so selecting it lit up
  // the pill and changed nothing. An existing ?experience= in a shared URL is
  // still accepted and passed through — only the control is hidden. Restore this
  // group once the backend normalises its free-text `pengalaman` column.
  const sheetGroups: FilterGroup[] = [
    { key: 'salary',     label: 'Kisaran Gaji',     options: salaryOptions },
    { key: 'tipe',       label: 'Jenis Pekerjaan',  options: tipeOptions },
    { key: 'location',   label: 'Lokasi',           options: locationOptions },
    { key: 'category',   label: 'Bidang',           options: categoryOptions },
  ]
  const sheetValue: FilterValues = {
    salary:     initialSalary,
    tipe:       initialTipe,
    experience: initialExperience,
    location:   initialLocation,
    category:   initialCategory,
  }

  // Filter bar: search row ~78px + pills row ~62px = ~140px. Navbar = 64px. Total = 204px.
  const stickyTop    = 'top-[204px]'
  const stickyHeight = 'h-[calc(100vh-204px)]'

  return (
    <div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        groups={sheetGroups}
        value={sheetValue}
        onApply={(next) => updateParams(next)}
      />

      {/* ── Sticky filter bar ── */}
      <div className="sticky top-16 z-20 bg-primary shadow-md">
        <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">

          {/* Search row */}
          <form onSubmit={handleSearch} className="flex gap-2.5 pt-6 pb-4">
            <div className="group flex flex-1 items-center rounded-xl bg-white ring-1 ring-white/10 transition-all duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:shadow-[0_4px_20px_-4px_rgba(29,78,216,0.5)]">
              <span className="pl-4 pr-1 text-slate-400">
                <Search className="h-[18px] w-[18px]" aria-hidden />
              </span>
              <input
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Cari posisi, keahlian, atau perusahaan..."
                className="flex-1 bg-transparent py-3 pr-2 text-sm text-brand-text placeholder:text-slate-400 outline-none"
                aria-label="Cari lowongan"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => { setKeyword(''); updateParams({ keyword: '' }) }}
                  aria-label="Hapus pencarian"
                  className="mr-1 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150 cursor-pointer"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl bg-cta px-7 text-sm font-bold text-white hover:bg-cta-dark active:scale-[0.98] transition-all duration-150 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-primary"
            >
              <Search className="h-4 w-4 sm:hidden" aria-hidden />
              <span className="hidden sm:inline">Cari</span>
            </button>
          </form>

          {/* Filter pills row */}
          <div className="flex items-center gap-2.5 pb-6">
            {/* Mobile: tombol pembuka bottom sheet. Dropdown per-pill terlalu
                sempit di layar kecil, jadi semua filter dikumpulkan di sheet. */}
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-full border border-white/30 px-3.5 py-1.5 text-[12.5px] font-semibold text-white transition-colors hover:bg-white/10 lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Filter
              {activeCount > 0 && (
                <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-primary">
                  {activeCount}
                </span>
              )}
            </button>

            {/* Desktop: label statis + pills */}
            <span className="hidden shrink-0 items-center gap-1.5 text-[12px] font-semibold uppercase tracking-wide text-white/45 lg:flex">
              <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
              Filter
            </span>
            <span className="hidden h-4 w-px shrink-0 bg-white/15 lg:block" aria-hidden />
            <div className="hidden items-center gap-2 flex-1 overflow-x-auto scrollbar-none lg:flex">
              <FilterPill dark label="Gaji"   icon={<BadgeDollarSign className="h-3.5 w-3.5" />} options={salaryOptions}   value={initialSalary}   allLabel="Semua Gaji"   onChange={(v) => updateParams({ salary: v })} />
              <FilterPill dark label="Jenis"  icon={<Briefcase className="h-3.5 w-3.5" />}       options={tipeOptions}     value={initialTipe}     allLabel="Semua Jenis"     onChange={(v) => updateParams({ tipe: v })} />
              <FilterPill dark label="Lokasi" icon={<MapPin className="h-3.5 w-3.5" />}          options={locationOptions} value={initialLocation} allLabel="Semua Lokasi" onChange={(v) => updateParams({ location: v })} />
              <FilterPill dark label="Bidang"                                                    options={categoryOptions} value={initialCategory} allLabel="Semua Bidang" onChange={(v) => updateParams({ category: v })} />
              {resetCount > 0 && (
                <button
                  type="button"
                  onClick={() => { setKeyword(''); startTransition(() => router.push('/loker')) }}
                  className="flex items-center gap-1 rounded-full px-3 py-1.5 text-[12.5px] font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                >
                  <X className="h-3 w-3" />
                  Reset ({resetCount})
                </button>
              )}
            </div>
            <p className="ml-auto shrink-0 text-[12.5px] font-medium text-white/55 lg:ml-2">
              <span className="font-bold text-white">{total.toLocaleString('id-ID')}</span> lowongan
            </p>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="mx-auto flex max-w-7xl">

        {/* Left: job list — own scroll column (independent from the detail panel) */}
        <div className="w-full lg:w-100 xl:w-110 shrink-0 border-r border-border/70 min-h-screen lg:min-h-0 lg:sticky lg:top-[204px] lg:h-[calc(100vh-204px)] lg:overflow-y-auto">
          {isPending ? (
            Array.from({ length: 10 }).map((_, i) => <CardSkeleton key={i} />)
          ) : jobs.length === 0 ? (
            <div className="p-10"><NoResults /></div>
          ) : (
            <>
              {jobs.map((job) => (
                <CompactJobCard
                  key={job.id}
                  job={job}
                  isSelected={selectedJob?.id === job.id}
                  onSelect={selectJob}
                />
              ))}
              <div className="px-5 py-5 border-t border-border/60">
                <Pagination
                  page={initialPage}
                  total={total}
                  perPage={PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>

        {/* Right: sticky detail panel */}
        <div className={`hidden lg:flex flex-1 flex-col sticky ${stickyTop} ${stickyHeight} bg-white overflow-hidden`}>
          {selectedJob ? (
            <JobDetailPanel job={selectedJob} />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-8 text-center select-none">
              <div className="relative flex h-40 w-40 items-center justify-center rounded-full bg-primary/8">
                <svg viewBox="0 0 160 160" className="h-40 w-40" aria-hidden>
                  {/* Card container */}
                  <rect x="24" y="36" width="112" height="88" rx="10" fill="white" stroke="#E2E8F0" strokeWidth="1.5" />
                  {/* Top bar */}
                  <rect x="24" y="36" width="112" height="18" rx="10" fill="#0B2C48" />
                  <rect x="24" y="46" width="112" height="8" fill="#0B2C48" />
                  {/* Divider */}
                  <line x1="88" y1="54" x2="88" y2="124" stroke="#E2E8F0" strokeWidth="1" />
                  {/* Left: selected card */}
                  <rect x="32" y="60" width="48" height="26" rx="5" fill="#EFF6FF" stroke="#0369A1" strokeWidth="1.5" />
                  <rect x="38" y="66" width="26" height="3" rx="1.5" fill="#93C5FD" />
                  <rect x="38" y="72" width="18" height="2" rx="1" fill="#BFDBFE" />
                  <rect x="38" y="77" width="22" height="2" rx="1" fill="#BFDBFE" />
                  {/* Left: idle card */}
                  <rect x="32" y="92" width="48" height="24" rx="5" fill="#F8FAFC" stroke="#E2E8F0" strokeWidth="1" />
                  <rect x="38" y="98" width="24" height="2.5" rx="1.5" fill="#CBD5E1" />
                  <rect x="38" y="103" width="16" height="2" rx="1" fill="#E2E8F0" />
                  <rect x="38" y="108" width="20" height="2" rx="1" fill="#E2E8F0" />
                  {/* Right: detail lines */}
                  <rect x="96" y="62" width="32" height="3" rx="1.5" fill="#94A3B8" />
                  <rect x="96" y="69" width="24" height="2" rx="1" fill="#CBD5E1" />
                  <rect x="96" y="75" width="32" height="2" rx="1" fill="#E2E8F0" />
                  <rect x="96" y="81" width="28" height="2" rx="1" fill="#E2E8F0" />
                  <rect x="96" y="87" width="32" height="2" rx="1" fill="#E2E8F0" />
                  <rect x="96" y="93" width="20" height="2" rx="1" fill="#E2E8F0" />
                  <rect x="96" y="108" width="32" height="8" rx="4" fill="#0369A1" opacity="0.8" />
                  {/* Cursor arrow */}
                  <g transform="translate(70, 73)">
                    <path d="M0 0 L0 13 L3 9.5 L5.5 15 L7.5 14 L5 8.5 L9 8.5 Z" fill="#0369A1" />
                    <path d="M0 0 L0 13 L3 9.5 L5.5 15 L7.5 14 L5 8.5 L9 8.5 Z" fill="none" stroke="white" strokeWidth="0.8" />
                  </g>
                </svg>
              </div>
              <div>
                <p className="text-[17px] font-bold text-brand-text">Pilih lowongan kerja</p>
                <p className="text-[13.5px] text-brand-muted mt-1">Tampilkan detail di sini</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
