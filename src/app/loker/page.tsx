import { Suspense } from 'react'
import type { Metadata } from 'next'
import { generateListingMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { JobListingClient } from '@/features/jobs/JobListingClient'
import {
  fetchJobs,
  fetchJobById,
  fetchCategories,
  fetchLocations,
  fetchTipeKerja,
} from '@/services/jobs.service'
import { PER_PAGE, SITE_URL } from '@/config/api'

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const keyword = params.keyword ?? ''
  const title = keyword
    ? `Lowongan "${keyword}" Terbaru 2026 | CDC Universitas Stekom`
    : 'Lowongan Kerja Terbaru 2026 | CDC Universitas Stekom'
  return generateListingMetadata({
    title,
    description:
      'Temukan ratusan lowongan kerja terbaru dari perusahaan terpercaya. Filter berdasarkan kategori, daerah, dan tipe pekerjaan.',
    path: '/loker',
    noIndex: !!params.page && Number(params.page) > 1,
  })
}

export default async function LokerPage({ searchParams }: PageProps) {
  const params = await searchParams
  const page = Number(params.page ?? 1)
  const keyword = params.keyword ?? ''
  const category = params.category ?? ''
  const location = params.location ?? ''
  const tipe = params.tipe ?? ''
  const salary = params.salary ?? ''
  const experience = params.experience ?? ''
  const jobId = params.jobId ?? ''

  const [{ jobs, total }, categories, locations, tipeKerja, selectedJob] = await Promise.all([
    fetchJobs({ page, perPage: PER_PAGE, keyword, category, location, employmentType: tipe, salaryRange: salary, experienceLevel: experience }),
    fetchCategories(),
    fetchLocations(),
    fetchTipeKerja(),
    fetchJobById(jobId),
  ])

  const totalPages = Math.ceil(total / PER_PAGE)
  const baseUrl = `${SITE_URL}/loker`

  // Build prev/next href preserving active filters
  function paginationUrl(p: number) {
    const qs = new URLSearchParams()
    if (keyword)    qs.set('keyword', keyword)
    if (category)   qs.set('category', category)
    if (location)   qs.set('location', location)
    if (tipe)       qs.set('tipe', tipe)
    if (salary)     qs.set('salary', salary)
    if (experience) qs.set('experience', experience)
    if (p > 1)      qs.set('page', String(p))
    const str = qs.toString()
    return str ? `${baseUrl}?${str}` : baseUrl
  }

  return (
    <>
      {page > 1 && <link rel="prev" href={paginationUrl(page - 1)} />}
      {page < totalPages && <link rel="next" href={paginationUrl(page + 1)} />}

      <JsonLd schema={breadcrumbSchema([{ label: 'Beranda', href: '/' }, { label: 'Lowongan Kerja', href: '/loker' }])} />

      <Suspense fallback={<div className="flex items-center justify-center h-64 text-brand-muted text-sm">Memuat lowongan...</div>}>
        <JobListingClient
          jobs={jobs}
          total={total}
          categories={categories}
          locations={locations}
          tipeKerja={tipeKerja}
          initialPage={page}
          initialKeyword={keyword}
          initialCategory={category}
          initialLocation={location}
          initialTipe={tipe}
          initialSalary={salary}
          initialExperience={experience}
          initialJobId={jobId}
          initialSelectedJob={selectedJob}
        />
      </Suspense>
    </>
  )
}

