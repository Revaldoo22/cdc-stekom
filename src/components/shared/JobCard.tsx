'use client'
import Link from 'next/link'
import Image from 'next/image'
import { MapPin, BadgeDollarSign, Bookmark, BookmarkCheck, Building2 } from 'lucide-react'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import type { Job } from '@/types'

interface JobCardProps {
  job: Job
}

const EXPERIENCE_LABEL: Record<string, string> = {
  'fresh-graduate': 'Fresh Graduate',
  junior: 'Junior',
  mid: 'Mid Level',
  senior: 'Senior',
}

const TIPE_COLOR: Record<string, string> = {
  'full-time':  'bg-blue-50 text-blue-700',
  'part-time':  'bg-purple-50 text-purple-700',
  magang:       'bg-emerald-50 text-emerald-700',
  freelance:    'bg-orange-50 text-orange-700',
  kontrak:      'bg-yellow-50 text-yellow-700',
}


function relativeTime(dateStr: string): string {
  const days = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000)
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Kemarin'
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  return `${Math.floor(days / 30)} bulan lalu`
}

function isNew(dateStr: string): boolean {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000) <= 3
}

export function JobCard({ job }: JobCardProps) {
  const { toggleSave, isSaved } = useSavedJobs()
  const badgeClass = TIPE_COLOR[job.employmentTypeSlug] ?? 'bg-muted text-brand-muted'
  const isExpired  = job.expiresAt ? new Date(job.expiresAt) < new Date() : false
  const fresh      = !isExpired && isNew(job.postedAt)
  const saved      = isSaved(job.id)

  return (
    <Link
      href={`/job/${job.slug}`}
      className="group relative flex flex-col rounded-xl border border-border bg-white p-5 transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer"
    >
      {/* Top row: logo + bookmark */}
      <div className="flex items-start justify-between mb-4">
        {job.companyLogo ? (
          <Image
            src={job.companyLogo}
            alt={`Logo ${job.company}`}
            width={48}
            height={48}
            className="h-12 w-12 rounded-xl object-cover shrink-0"
          />
        ) : (
          <span
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-brand-bg"
            aria-hidden="true"
          >
            <Building2 className="h-5 w-5 text-brand-muted" />
          </span>
        )}

        <button
          onClick={(e) => { e.preventDefault(); toggleSave(job.id) }}
          aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan lowongan'}
          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
            saved
              ? 'text-primary bg-primary/8'
              : 'text-border hover:text-primary hover:bg-primary/5'
          }`}
        >
          {saved
            ? <BookmarkCheck className="h-4 w-4" />
            : <Bookmark className="h-4 w-4" />}
        </button>
      </div>

      {/* Title + BARU badge */}
      <div className="flex items-start gap-2 mb-1">
        <h3 className="flex-1 text-[15px] font-semibold text-brand-text group-hover:text-primary transition-colors leading-snug line-clamp-2">
          {job.title}
        </h3>
        {fresh && (
          <span className="shrink-0 mt-0.5 rounded-md bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-600 tracking-wide uppercase">
            Baru
          </span>
        )}
        {isExpired && (
          <span className="shrink-0 mt-0.5 rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-brand-muted uppercase">
            Ditutup
          </span>
        )}
      </div>

      {/* Company */}
      <p className="text-sm text-brand-muted truncate">{job.company}</p>

      {/* Meta */}
      <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs text-brand-muted">
        <span className="flex items-center gap-1">
          <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
          {job.location}
        </span>
        {job.salary && (
          <span className="flex items-center gap-1">
            <BadgeDollarSign className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            {job.salary}
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${badgeClass}`}>
            {job.employmentType}
          </span>
          {job.experienceLevel && (
            <span className="shrink-0 rounded-full border border-border px-2.5 py-0.5 text-[11px] text-brand-muted">
              {EXPERIENCE_LABEL[job.experienceLevel]}
            </span>
          )}
        </div>
        <span className="text-[11px] text-brand-muted/60 shrink-0">
          {relativeTime(job.postedAt)}
        </span>
      </div>
    </Link>
  )
}
