import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { JsonLd } from '@/components/shared/JsonLd'
import { JobListingClient } from '@/features/jobs/JobListingClient'
import { breadcrumbSchema, itemListSchema, faqPageSchema } from '@/lib/schema'
import { generateListingMetadata } from '@/lib/seo'
import { buildJobsUrl, parseJobsSegments, deslugify } from '@/lib/seo-urls'
import { SITE_URL, PER_PAGE } from '@/config/api'
import {
  fetchJobs,
  fetchJobById,
  fetchCategories,
  fetchLocations,
  fetchTipeKerja,
} from '@/services/jobs.service'
import type { Category, Location, TipeKerja } from '@/types'

export const revalidate = 3600

// ─── Resolve a parsed filter against real taxonomy data ─────────────────────────

interface Resolved {
  keyword: string
  category: string; catName?: string
  location: string; locName?: string
  tipe: string;     tipeName?: string
}

function resolve(
  f: ReturnType<typeof parseJobsSegments>,
  categories: Category[], locations: Location[], tipeKerja: TipeKerja[],
): Resolved | null {
  if (!f) return null
  const category = f.category ?? ''
  const location = f.location ?? ''
  const tipe     = f.tipe ?? ''

  const catName  = category ? categories.find((c) => c.slug === category)?.name : undefined
  const locName  = location ? locations.find((l) => l.slug === location)?.name : undefined
  const tipeName = tipe ? tipeKerja.find((t) => t.slug === tipe)?.name : undefined

  // A taxonomy slug present in the path but unknown in data is a 404.
  if ((category && !catName) || (location && !locName) || (tipe && !tipeName)) return null

  return {
    keyword: f.keyword ? deslugify(f.keyword) : '',
    category, catName,
    location, locName,
    tipe, tipeName,
  }
}

function buildLabel(r: Resolved): string {
  const kw = r.keyword ? `"${r.keyword}"` : ''
  return [r.tipeName, kw, r.catName, r.locName && `di ${r.locName}`].filter(Boolean).join(' ') || 'Lowongan Kerja'
}

// ─── Static params (common single-dimension + category×location pages) ──────────

export async function generateStaticParams() {
  const [categories, locations, tipeKerja, { jobs: allJobs }] = await Promise.all([
    fetchCategories(), fetchLocations(), fetchTipeKerja(), fetchJobs({ perPage: 500 }),
  ])

  const now = new Date()
  const active = allJobs.filter((j) => !j.expiresAt || new Date(j.expiresAt) > now)
  const params: { segments: string[] }[] = []
  const seg = (url: string) => url.replace(/^\//, '').split('?')[0].split('/')

  for (const c of categories) {
    if (active.some((j) => j.categorySlug === c.slug)) params.push({ segments: seg(buildJobsUrl({ category: c.slug })) })
  }
  for (const l of locations) {
    if (active.some((j) => j.locationSlug === l.slug)) params.push({ segments: seg(buildJobsUrl({ location: l.slug })) })
  }
  for (const t of tipeKerja) {
    if (active.some((j) => j.employmentTypeSlug === t.slug)) params.push({ segments: seg(buildJobsUrl({ tipe: t.slug })) })
  }
  for (const c of categories) {
    for (const l of locations) {
      if (active.some((j) => j.categorySlug === c.slug && j.locationSlug === l.slug)) {
        params.push({ segments: seg(buildJobsUrl({ category: c.slug, location: l.slug })) })
      }
    }
  }

  return params
}

// ─── Metadata ────────────────────────────────────────────────────────────────

interface PageProps {
  params: Promise<{ segments: string[] }>
  searchParams: Promise<Record<string, string>>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segments } = await params
  const parsed = parseJobsSegments(segments)
  const [categories, locations, tipeKerja] = await Promise.all([
    fetchCategories(), fetchLocations(), fetchTipeKerja(),
  ])
  const r = resolve(parsed, categories, locations, tipeKerja)
  if (!r) return { title: 'Halaman tidak ditemukan' }

  const label = buildLabel(r)
  const path = buildJobsUrl({ keyword: r.keyword, category: r.category, location: r.location, tipe: r.tipe })
  return generateListingMetadata({
    title: `Lowongan ${label} Terbaru 2026 | CDC Universitas Stekom`,
    description: `Temukan lowongan ${label} dari perusahaan terverifikasi di CDC Universitas Stekom. Lamar langsung, gratis, tanpa perantara.`,
    path,
  })
}

// ─── FAQ (SEO JSON-LD) ──────────────────────────────────────────────────────────

function buildFaqs(label: string, total: number): { q: string; a: string }[] {
  return [
    {
      q: `Apa saja lowongan ${label} yang tersedia?`,
      a: `Saat ini terdapat ${total} lowongan aktif untuk ${label}. Gunakan filter untuk mempersempit berdasarkan gaji, tipe, dan lokasi.`,
    },
    {
      q: `Bagaimana cara melamar ${label}?`,
      a: `Pilih lowongan, lalu tekan "Lamar Sekarang". Anda akan diarahkan ke form lamaran atau halaman perusahaan. Semua proses gratis di CDC Universitas Stekom.`,
    },
    {
      q: `Apakah ada biaya untuk melamar?`,
      a: `Tidak. Semua layanan CDC Universitas Stekom sepenuhnya gratis untuk semua pelamar.`,
    },
  ]
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TaxonomyPage({ params, searchParams }: PageProps) {
  const { segments } = await params
  const sp = await searchParams
  const parsed = parseJobsSegments(segments)

  const [categories, locations, tipeKerja] = await Promise.all([
    fetchCategories(), fetchLocations(), fetchTipeKerja(),
  ])
  const r = resolve(parsed, categories, locations, tipeKerja)
  if (!r) notFound()

  const page       = Number(sp.page ?? 1)
  const salary     = sp.salary ?? ''
  const experience = sp.experience ?? ''
  const jobId      = sp.jobId ?? ''

  const [{ jobs, total }, selectedJob] = await Promise.all([
    fetchJobs({
      page, perPage: PER_PAGE, keyword: r.keyword,
      category: r.category, location: r.location, employmentType: r.tipe,
      salaryRange: salary, experienceLevel: experience,
    }),
    fetchJobById(jobId),
  ])

  const label = buildLabel(r)
  const canonicalPath = buildJobsUrl({ keyword: r.keyword, category: r.category, location: r.location, tipe: r.tipe })
  const pageUrl = `${SITE_URL}${canonicalPath}`
  const faqs = buildFaqs(label, total)

  return (
    <>
      <JsonLd
        schema={breadcrumbSchema([
          { label: 'Beranda', href: '/' },
          { label: 'Lowongan Kerja', href: '/loker' },
          { label, href: canonicalPath },
        ])}
      />
      {jobs.length > 0 && <JsonLd schema={itemListSchema(jobs, pageUrl)} />}
      <JsonLd schema={faqPageSchema(faqs)} />

      <JobListingClient
        jobs={jobs}
        total={total}
        categories={categories}
        locations={locations}
        tipeKerja={tipeKerja}
        initialPage={page}
        initialKeyword={r.keyword}
        initialCategory={r.category}
        initialLocation={r.location}
        initialTipe={r.tipe}
        initialSalary={salary}
        initialExperience={experience}
        initialJobId={jobId}
        initialSelectedJob={selectedJob}
      />
    </>
  )
}
