import type { Metadata } from 'next'
import { generateListingMetadata } from '@/lib/seo'
import { breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { TaxonomyBrowser } from '@/features/taxonomy/TaxonomyBrowser'
import { fetchLocations } from '@/services/jobs.service'

export const revalidate = 86400

export const metadata: Metadata = generateListingMetadata({
  title: 'Lowongan Kerja per Lokasi | CDC Universitas Stekom',
  description:
    'Jelajahi lowongan kerja berdasarkan kota dan daerah. Temukan peluang karir terbaik di lokasi yang Anda inginkan.',
  path: '/daerah',
})

export default async function DaerahPage() {
  const locations = await fetchLocations()

  return (
    <>
      <JsonLd schema={breadcrumbSchema([{ label: 'Beranda', href: '/' }, { label: 'Lokasi', href: '/daerah' }])} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Breadcrumbs crumbs={[{ label: 'Beranda', href: '/' }]} currentLabel="Lokasi" />

        <header className="mt-5 mb-5">
          <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">Lowongan Kerja per Lokasi</h1>
        </header>

        <TaxonomyBrowser
          items={locations}
          kind="location"
          noun="lokasi"
          searchPlaceholder="Cari kota atau kabupaten..."
          searchLabel="Cari kota atau kabupaten"
        />
      </div>
    </>
  )
}
