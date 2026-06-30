import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  MapPin, Briefcase, Clock, BadgeDollarSign,
  ExternalLink, CheckCircle2, Wrench, Calendar,
  Building2, CalendarClock, GraduationCap, Accessibility,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { generateJobMetadata } from '@/lib/seo'
import { jobPostingSchema, breadcrumbSchema } from '@/lib/schema'
import { fetchJobBySlug, fetchRelatedJobs, fetchJobs } from '@/services/jobs.service'
import { seoUrl } from '@/lib/seo-urls'
import { RELATED_JOBS_COUNT } from '@/config/api'
import { ApplyButton } from '@/features/jobs/ApplyButton'
import { JobDetailActions } from '@/features/jobs/JobDetailActions'

export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const job = await fetchJobBySlug(slug)
  if (!job) return { title: 'Lowongan tidak ditemukan' }
  return generateJobMetadata(job)
}

export async function generateStaticParams() {
  const { jobs } = await fetchJobs({ perPage: 100 })
  return jobs.map((j) => ({ slug: j.slug }))
}

const TYPE_STYLE: Record<string, string> = {
  'full-time':  'bg-blue-50 text-blue-700 border-blue-200',
  'part-time':  'bg-purple-50 text-purple-700 border-purple-200',
  magang:       'bg-emerald-50 text-emerald-700 border-emerald-200',
  freelance:    'bg-orange-50 text-orange-700 border-orange-200',
  kontrak:      'bg-yellow-50 text-yellow-700 border-yellow-200',
}

export default async function JobDetailPage({ params }: PageProps) {
  const { slug } = await params
  const job = await fetchJobBySlug(slug)
  if (!job) notFound()

  const [related, sameLocation] = await Promise.all([
    fetchRelatedJobs(job, RELATED_JOBS_COUNT),
    fetchJobs({ location: job.locationSlug, perPage: RELATED_JOBS_COUNT + 1 }).then(
      (r) => r.jobs.filter((j) => j.id !== job.id).slice(0, RELATED_JOBS_COUNT),
    ),
  ])

  const isExpired = job.expiresAt ? new Date(job.expiresAt) < new Date() : false
  const daysLeft = job.expiresAt
    ? Math.ceil((new Date(job.expiresAt).getTime() - Date.now()) / 86_400_000)
    : null

  const crumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Lowongan Kerja', href: '/loker' },
  ]

  const typeStyle = TYPE_STYLE[job.employmentTypeSlug] ?? 'bg-muted text-brand-muted border-border'

  return (
    <>
      <JsonLd schema={jobPostingSchema(job)} />
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: job.title, href: `/job/${job.slug}` }])} />

      {/* ── Breadcrumb bar ── */}
      <div className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel={job.title} />
        </div>
      </div>

      {/* ── Job header ── */}
      <div className="border-b border-border bg-white">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

            {/* Left: logo + info */}
            <div className="flex gap-5 min-w-0">
              {/* Company logo */}
              <div className="shrink-0 flex h-16 w-16 items-center justify-center rounded-2xl border-2 border-border bg-brand-bg">
                <Building2 className="h-7 w-7 text-brand-muted" aria-hidden="true" />
              </div>

              {/* Title block */}
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">{job.title}</h1>
                  {isExpired && (
                    <span className="rounded-lg bg-muted px-2.5 py-1 text-xs font-semibold text-brand-muted uppercase tracking-wide">
                      Ditutup
                    </span>
                  )}
                  {!isExpired && daysLeft !== null && daysLeft <= 7 && (
                    <span className="rounded-lg bg-orange-50 border border-orange-200 px-2.5 py-1 text-xs font-semibold text-orange-600">
                      {daysLeft <= 0 ? 'Hari terakhir!' : `${daysLeft} hari lagi`}
                    </span>
                  )}
                </div>

                <Link
                  href={seoUrl.category(job.categorySlug)}
                  className="mt-1 block text-lg font-medium text-brand-muted hover:text-primary transition-colors"
                >
                  {job.company}
                </Link>

                {/* Meta row */}
                <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm text-brand-muted">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <Link href={seoUrl.location(job.locationSlug)} className="hover:text-primary transition-colors">
                      {job.location}
                    </Link>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Briefcase className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    <Link href={seoUrl.category(job.categorySlug)} className="hover:text-primary transition-colors">
                      {job.category}
                    </Link>
                  </span>
                  {job.salary && (
                    <span className="flex items-center gap-1.5">
                      <BadgeDollarSign className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {job.salary}
                    </span>
                  )}
                  {job.education && (
                    <span className="flex items-center gap-1.5">
                      <GraduationCap className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      {job.education}
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    Diposting {new Date(job.postedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Badges */}
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${typeStyle}`}>
                    <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                    {job.employmentType}
                  </span>
                  {job.disabilityFriendly && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-cta/30 bg-cta/10 px-3 py-1 text-xs font-semibold text-cta">
                      <Accessibility className="h-3.5 w-3.5" aria-hidden="true" />
                      Ramah Disabilitas
                    </span>
                  )}
                  {job.expiresAt && !isExpired && (
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-3 py-1 text-xs font-medium text-brand-muted">
                      <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
                      Deadline: {new Date(job.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Right: CTA */}
            <div className="flex items-center gap-2 shrink-0">
              <JobDetailActions job={job} />
              <ApplyButton job={job} disabled={isExpired} />
            </div>

          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 lg:flex-row">

          {/* Main content */}
          <article className="flex-1 min-w-0 space-y-5">

            {/* Description */}
            <section className="rounded-xl border border-border bg-white p-6">
              <h2 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                <span className="h-1 w-4 rounded-full bg-primary inline-block" />
                Deskripsi Pekerjaan
              </h2>
              <div
                className="prose prose-sm max-w-none text-brand-muted leading-relaxed [&_h3]:text-brand-text [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:mt-4 [&_h3]:mb-2 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1.5 [&_p]:mb-3"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </section>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <section className="rounded-xl border border-border bg-white p-6">
                <h2 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-4.5 w-4.5 text-cta shrink-0" aria-hidden="true" />
                  Persyaratan
                </h2>
                <ul className="space-y-2.5">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-brand-muted">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                        {i + 1}
                      </span>
                      {req}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <section className="rounded-xl border border-border bg-white p-6">
                <h2 className="text-base font-bold text-brand-text mb-4 flex items-center gap-2">
                  <Wrench className="h-4.5 w-4.5 text-primary shrink-0" aria-hidden="true" />
                  Skills Dibutuhkan
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg border border-border bg-brand-bg px-3 py-1.5 text-sm font-medium text-brand-text"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0">
            <div className="sticky top-20 space-y-5">

              {/* Apply card */}
              <div className="rounded-xl border border-border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-brand-bg">
                    <Building2 className="h-5 w-5 text-brand-muted" aria-hidden="true" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-text truncate">{job.title}</p>
                    <p className="text-xs text-brand-muted truncate">{job.company}</p>
                  </div>
                </div>

                <ApplyButton job={job} disabled={isExpired} className="w-full justify-center text-sm py-3" />

                {!isExpired && job.expiresAt && (
                  <div className={`mt-3 flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-xs font-medium ${
                    daysLeft !== null && daysLeft <= 7
                      ? 'bg-orange-50 text-orange-600'
                      : 'bg-muted text-brand-muted'
                  }`}>
                    <CalendarClock className="h-3.5 w-3.5 shrink-0" />
                    Deadline: {new Date(job.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                )}
                {isExpired && (
                  <p className="mt-3 text-center text-xs text-brand-muted bg-muted rounded-lg py-2">
                    Lowongan ini sudah ditutup
                  </p>
                )}
              </div>

              {/* Related jobs */}
              {related.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-brand-text mb-3 flex items-center gap-2">
                    <span className="h-1 w-3 rounded-full bg-primary inline-block" />
                    Loker Serupa
                  </h3>
                  <div className="space-y-3">
                    {related.map((j) => (
                      <JobCard key={j.id} job={j} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>

        {/* Same location */}
        {sameLocation.length > 0 && (
          <section className="mt-12">
            <Separator className="mb-8" />
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-brand-text">
                Loker Lain di {job.location}
              </h2>
              <Link
                href={seoUrl.location(job.locationSlug)}
                className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Lihat semua <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sameLocation.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  )
}
