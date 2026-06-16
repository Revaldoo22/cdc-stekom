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
import { fetchJobsByCategory, fetchCategories } from '@/services/jobs.service'
export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const categories = await fetchCategories()
  const cat = categories.find((c) => c.slug === slug)
  if (!cat) return { title: 'Kategori tidak ditemukan' }
  return generateListingMetadata({
    title: `Lowongan ${cat.name} Terbaru 2026 | CDC Stekom`,
    description: `Temukan ${cat.count} lowongan pekerjaan kategori ${cat.name} dari perusahaan terpercaya.`,
    path: `/kategori/${slug}`,
  })
}

export async function generateStaticParams() {
  const categories = await fetchCategories()
  return categories.map((c) => ({ slug: c.slug }))
}

export default async function KategoriPage({ params }: PageProps) {
  const { slug } = await params
  const [{ jobs, total }, categories] = await Promise.all([
    fetchJobsByCategory(slug),
    fetchCategories(),
  ])

  const cat = categories.find((c) => c.slug === slug)
  if (!cat) notFound()

  const crumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Lowongan Kerja', href: '/loker' },
  ]

  return (
    <>
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: cat.name, href: `/kategori/${slug}` }])} />

      <div className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel={cat.name} />
          <h1 className="mt-2 text-2xl font-bold text-brand-text sm:text-3xl">
            Lowongan {cat.name}
          </h1>
          <p className="mt-1 text-sm text-brand-muted">{total} lowongan tersedia</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Suspense fallback={<SkeletonJobGrid />}>
          {jobs.length === 0 ? (
            <NoResults title={`Belum ada lowongan ${cat.name}`} />
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
