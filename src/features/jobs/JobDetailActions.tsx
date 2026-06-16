'use client'

import { useEffect, useState } from 'react'
import { Bookmark, BookmarkCheck, Share2, Check, Link as LinkIcon } from 'lucide-react'
import { useSavedJobs } from '@/hooks/useSavedJobs'
import { useRecentJobs } from '@/hooks/useRecentJobs'
import type { Job } from '@/types'

interface Props {
  job: Job
}

export function JobDetailActions({ job }: Props) {
  const { toggleSave, isSaved } = useSavedJobs()
  const { addRecent } = useRecentJobs()
  const [copied, setCopied] = useState(false)

  // Track as recently viewed on mount
  useEffect(() => {
    addRecent(job.id)
  }, [job.id, addRecent])

  const saved = isSaved(job.id)

  async function handleShare() {
    const url = window.location.href
    const shareData = {
      title: `${job.title} di ${job.company}`,
      text: `${job.title} di ${job.company}, ${job.location}. Lihat di CDC Universitas Stekom!`,
      url,
    }
    if (navigator.share) {
      try { await navigator.share(shareData) } catch { /* user cancelled */ }
    } else {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* Bookmark */}
      <button
        onClick={() => toggleSave(job.id)}
        aria-label={saved ? 'Hapus dari tersimpan' : 'Simpan lowongan'}
        title={saved ? 'Tersimpan' : 'Simpan'}
        className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors cursor-pointer ${
          saved
            ? 'border-primary bg-primary/8 text-primary'
            : 'border-border bg-white text-brand-muted hover:text-primary hover:border-primary'
        }`}
      >
        {saved
          ? <BookmarkCheck className="h-4.5 w-4.5" />
          : <Bookmark className="h-4.5 w-4.5" />}
      </button>

      {/* Share */}
      <button
        onClick={handleShare}
        aria-label="Bagikan lowongan"
        title={copied ? 'Link disalin!' : 'Bagikan'}
        className={`flex items-center justify-center h-10 w-10 rounded-xl border transition-colors cursor-pointer ${
          copied
            ? 'border-cta bg-cta/8 text-cta'
            : 'border-border bg-white text-brand-muted hover:text-primary hover:border-primary'
        }`}
      >
        {copied
          ? <Check className="h-4.5 w-4.5" />
          : <Share2 className="h-4.5 w-4.5" />}
      </button>

      {/* Copied tooltip */}
      {copied && (
        <span className="text-xs text-cta font-medium animate-in fade-in duration-150">
          Link disalin!
        </span>
      )}
    </div>
  )
}
