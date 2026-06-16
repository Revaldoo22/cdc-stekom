import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import { generateListingMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { NoResults } from '@/components/shared/NoResults'
import { SkeletonJobGrid } from '@/components/shared/SkeletonJobCard'
import { fetchJobsByTipe, fetchTipeKerja } from '@/services/jobs.service'
export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const tipes = await fetchTipeKerja()
  const tipe = tipes.find((t) => t.slug === slug)
  if (!tipe) return { title: 'Tipe tidak ditemukan' }
  return generateListingMetadata({
    title: `Lowongan ${tipe.name} Terbaru 2026 | CDC Stekom`,
    description: `Temukan ${tipe.count} lowongan ${tipe.name} dari perusahaan terpercaya di seluruh Indonesia.`,
    path: `/tipe-pekerjaan/${slug}`,
  })
}

export async function generateStaticParams() {
  const tipes = await fetchTipeKerja()
  return tipes.map((t) => ({ slug: t.slug }))
}

export default async function TipePage({ params }: PageProps) {
  const { slug } = await params
  const [{ jobs, total }, tipes] = await Promise.all([
    fetchJobsByTipe(slug),
    fetchTipeKerja(),
  ])

  const tipe = tipes.find((t) => t.slug === slug)
  if (!tipe) notFound()

  const crumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Lowongan Kerja', href: '/loker' },
  ]

  return (
    <>
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: tipe.name, href: `/tipe-pekerjaan/${slug}` }])} />

      <div className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel={`Loker ${tipe.name}`} />
          <h1 className="mt-2 text-2xl font-bold text-brand-text sm:text-3xl">
            Lowongan {tipe.name}
          </h1>
          <p className="mt-1 text-sm text-brand-muted">{total} lowongan tersedia</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<SkeletonJobGrid />}>
          {jobs.length === 0 ? (
            <NoResults title={`Belum ada lowongan ${tipe.name}`} />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {jobs.map((job) => (
                <JobCard key={job.id} job={job} />
              ))}
            </div>
          )}
        </Suspense>
      </div>
    </>
  )
}
