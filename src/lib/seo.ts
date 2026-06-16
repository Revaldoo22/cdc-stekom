import type { Metadata } from 'next'
import type { Job, RecruitmentEvent } from '@/types'
import { SITE_URL } from '@/config/api'

const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`

export function generateJobMetadata(job: Job): Metadata {
  const title = `${job.title} di ${job.company} | CDC Stekom`
  const description = `Lamar ${job.title} di ${job.company}, ${job.location}${job.salary ? ` — Gaji ${job.salary}` : ''}. Lowongan ${job.employmentType} terbaru ${new Date().getFullYear()}.`
  const url = `${SITE_URL}/job/${job.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [DEFAULT_OG_IMAGE],
    },
    robots: job.expiresAt && new Date(job.expiresAt) < new Date()
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function generateListingMetadata(opts: {
  title: string
  description: string
  path: string
  noIndex?: boolean
}): Metadata {
  const url = `${SITE_URL}${opts.path}`
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url,
      type: 'website',
      images: [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
    },
    robots: opts.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true },
  }
}

export function generateEventMetadata(event: RecruitmentEvent): Metadata {
  const title = `${event.title} | CDC Stekom`
  const description = `Daftarkan diri ke ${event.title} — ${event.location}. ${event.description.slice(0, 120)}...`
  const url = `${SITE_URL}/event/${event.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      images: event.banner
        ? [{ url: event.banner, width: 1200, height: 630 }]
        : [{ url: DEFAULT_OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}
