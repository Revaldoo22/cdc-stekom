import type { Metadata } from 'next'
import { generateListingMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { TaxonomyBrowser } from '@/features/taxonomy/TaxonomyBrowser'
import { fetchCategories } from '@/services/jobs.service'

export const revalidate = 86400

export const metadata: Metadata = generateListingMetadata({
  title: 'Kategori Pekerjaan | CDC Universitas Stekom',
  description:
    'Jelajahi lowongan kerja berdasarkan kategori bidang pekerjaan. Temukan peluang karir sesuai keahlian dan minat Anda.',
  path: '/kategori',
})

export default async function KategoriPage() {
  const categories = await fetchCategories()

  return (
    <>
      <JsonLd schema={breadcrumbSchema([{ label: 'Beranda', href: '/' }, { label: 'Kategori', href: '/kategori' }])} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs crumbs={[{ label: 'Beranda', href: '/' }]} currentLabel="Kategori" />

        <header className="mt-5 mb-5">
          <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">Kategori Pekerjaan</h1>
        </header>

        <TaxonomyBrowser
          items={categories}
          kind="category"
          noun="kategori"
          searchPlaceholder="Cari kategori pekerjaan..."
          searchLabel="Cari kategori pekerjaan"
        />
      </div>
    </>
  )
}
