import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import {
  MapPin,
  Briefcase,
  Clock,
  BadgeDollarSign,
  ExternalLink,
  CheckCircle2,
  Wrench,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { generateJobMetadata } from '@/lib/seo'
import { jobPostingSchema, breadcrumbSchema } from '@/lib/schema'
import { fetchJobBySlug, fetchRelatedJobs, fetchJobs } from '@/services/jobs.service'
import { RELATED_JOBS_COUNT } from '@/config/api'
import { ApplyButton } from '@/features/jobs/ApplyButton'

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
  const crumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Lowongan Kerja', href: '/loker' },
  ]

  return (
    <>
      <JsonLd schema={jobPostingSchema(job)} />
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: job.title, href: `/job/${job.slug}` }])} />

      <div className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel={job.title} />
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Main content */}
          <article className="flex-1 min-w-0">
            {/* Header */}
            <div className="rounded-lg border border-border bg-background p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">{job.title}</h1>
                  <p className="mt-1 text-lg text-brand-muted">{job.company}</p>
                </div>
                {isExpired && (
                  <Badge variant="destructive" className="shrink-0">Expired</Badge>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-3 text-sm text-brand-muted">
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <Link href={`/daerah/${job.locationSlug}`} className="hover:text-primary transition-colors cursor-pointer">
                    {job.location}
                  </Link>
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <Link href={`/kategori/${job.categorySlug}`} className="hover:text-primary transition-colors cursor-pointer">
                    {job.category}
                  </Link>
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <Link href={`/tipe-pekerjaan/${job.employmentTypeSlug}`} className="hover:text-primary transition-colors cursor-pointer">
                    {job.employmentType}
                  </Link>
                </span>
                {job.salary && (
                  <span className="flex items-center gap-1.5">
                    <BadgeDollarSign className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                    {job.salary}
                  </span>
                )}
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  Diposting {new Date(job.postedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </span>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <ApplyButton job={job} disabled={isExpired} />
                {!isExpired && (
                  <p className="self-center text-xs text-brand-muted">
                    {job.expiresAt ? `Deadline: ${new Date(job.expiresAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}` : ''}
                  </p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mt-6 rounded-lg border border-border bg-background p-6">
              <h2 className="text-lg font-semibold text-brand-text mb-4">Deskripsi Pekerjaan</h2>
              <div
                className="prose prose-sm max-w-none text-brand-muted [&_h3]:text-brand-text [&_h3]:font-semibold [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mb-1"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>

            {/* Requirements */}
            {job.requirements.length > 0 && (
              <div className="mt-6 rounded-lg border border-border bg-background p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-text mb-4">
                  <CheckCircle2 className="h-5 w-5 text-primary" aria-hidden="true" />
                  Persyaratan
                </h2>
                <ul className="space-y-2">
                  {job.requirements.map((req, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-brand-muted">
                      <span className="mt-0.5 h-4 w-4 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary text-[10px] font-bold">
                        {i + 1}
                      </span>
                      {req}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Skills */}
            {job.skills.length > 0 && (
              <div className="mt-6 rounded-lg border border-border bg-background p-6">
                <h2 className="flex items-center gap-2 text-lg font-semibold text-brand-text mb-4">
                  <Wrench className="h-5 w-5 text-primary" aria-hidden="true" />
                  Skills Dibutuhkan
                </h2>
                <div className="flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <Badge key={skill} variant="secondary" className="text-sm">
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </article>

          {/* Sidebar */}
          <aside className="w-full lg:w-72 shrink-0 space-y-6">
            {/* Quick apply CTA (sticky on desktop) */}
            <div className="sticky top-20 rounded-lg border border-border bg-background p-5">
              <h3 className="font-semibold text-brand-text mb-3">Lamar Sekarang</h3>
              <p className="text-sm text-brand-muted mb-4">{job.title} · {job.company}</p>
              <ApplyButton job={job} disabled={isExpired} className="w-full" />
            </div>

            {/* Related jobs same category */}
            {related.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-brand-text mb-3">Loker Serupa</h3>
                <div className="space-y-3">
                  {related.map((j) => (
                    <JobCard key={j.id} job={j} />
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* Same location jobs */}
        {sameLocation.length > 0 && (
          <section className="mt-12">
            <Separator className="mb-8" />
            <h2 className="text-xl font-bold text-brand-text mb-4">
              Loker Lain di {job.location}
            </h2>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {sameLocation.map((j) => (
                <JobCard key={j.id} job={j} />
              ))}
            </div>
            <div className="mt-4">
              <Button variant="outline" render={<Link href={`/daerah/${job.locationSlug}`} />} className="cursor-pointer">
                Semua loker di {job.location}
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" aria-hidden="true" />
              </Button>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
