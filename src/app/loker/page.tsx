import { Suspense } from 'react'
import type { Metadata } from 'next'
import { generateListingMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { SkeletonJobGrid } from '@/components/shared/SkeletonJobCard'
import { JobListingClient } from '@/features/jobs/JobListingClient'
import {
  fetchJobs,
  fetchCategories,
  fetchLocations,
  fetchTipeKerja,
} from '@/services/jobs.service'
import { PER_PAGE } from '@/config/api'

export const revalidate = 3600

interface PageProps {
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const params = await searchParams
  const keyword = params.keyword ?? ''
  const title = keyword
    ? `Lowongan "${keyword}" Terbaru 2026 | CDC Stekom`
    : 'Lowongan Kerja Terbaru 2026 | CDC Stekom'
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

  const [{ jobs, total }, categories, locations, tipeKerja] = await Promise.all([
    fetchJobs({ page, perPage: PER_PAGE, keyword, category, location, employmentType: tipe }),
    fetchCategories(),
    fetchLocations(),
    fetchTipeKerja(),
  ])

  const crumbs = [{ label: 'Beranda', href: '/' }]

  return (
    <>
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: 'Lowongan Kerja', href: '/loker' }])} />

      <div className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel="Lowongan Kerja" />
          <h1 className="mt-2 text-2xl font-bold text-brand-text sm:text-3xl">
            Lowongan Kerja Terbaru
          </h1>
          <p className="mt-1 text-sm text-brand-muted">
            {total} lowongan tersedia · Diperbarui setiap jam
          </p>
        </div>
      </div>

      <Suspense fallback={<div className="mx-auto max-w-7xl px-4 py-8"><SkeletonJobGrid /></div>}>
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
        />
      </Suspense>
    </>
  )
}
