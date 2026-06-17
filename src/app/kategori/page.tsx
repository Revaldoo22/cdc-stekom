import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Briefcase } from 'lucide-react'
import { generateListingMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { fetchCategories } from '@/services/jobs.service'
import { seoUrl } from '@/lib/seo-urls'

export const revalidate = 86400

export const metadata: Metadata = generateListingMetadata({
  title: 'Kategori Pekerjaan | CDC Universitas Stekom',
  description:
    'Jelajahi lowongan kerja berdasarkan kategori bidang pekerjaan. Temukan peluang karir sesuai keahlian dan minat Anda.',
  path: '/kategori',
})

export default async function KategoriPage() {
  const categories = await fetchCategories()
  const totalJobs = categories.reduce((sum, c) => sum + c.count, 0)

  return (
    <>
      <JsonLd schema={breadcrumbSchema([{ label: 'Beranda', href: '/' }, { label: 'Kategori', href: '/kategori' }])} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs crumbs={[{ label: 'Beranda', href: '/' }]} currentLabel="Kategori" />

        <header className="mt-5 mb-8">
          <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">Kategori Pekerjaan</h1>
          <p className="mt-2 text-sm text-brand-muted">
            {categories.length} kategori, {totalJobs.toLocaleString('id-ID')} total lowongan tersedia
          </p>
        </header>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={seoUrl.category(cat.slug)}
              className="group flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4 transition-all duration-200 hover:border-primary/50 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                  <Briefcase className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-brand-text truncate group-hover:text-primary transition-colors">{cat.name}</p>
                  <p className="text-xs text-brand-muted">{cat.count.toLocaleString('id-ID')} lowongan</p>
                </div>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-brand-muted/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </>
  )
}
