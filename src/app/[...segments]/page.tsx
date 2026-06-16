import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { ChevronRight } from 'lucide-react'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { breadcrumbSchema, itemListSchema, faqPageSchema } from '@/lib/schema'
import { generateListingMetadata } from '@/lib/seo'
import { seoUrl } from '@/lib/seo-urls'
import { SITE_URL } from '@/config/api'
import {
  fetchJobs,
  fetchCategories,
  fetchLocations,
  fetchTipeKerja,
} from '@/services/jobs.service'
import type { Job, Category, Location, TipeKerja } from '@/types'

export const revalidate = 3600

// ─── URL Parser ─────────────────────────────────────────────────────────────

const TIPE_SLUGS = ['full-time', 'part-time', 'magang', 'freelance', 'kontrak']

type PageCtx =
  | { kind: 'category'; slug: string }
  | { kind: 'location'; slug: string }
  | { kind: 'employment-type'; slug: string }
  | { kind: 'combined'; categorySlug: string; locationSlug: string }
  | { kind: 'combined-type'; typeSlug: string; categorySlug: string; locationSlug: string }

function parseSegments(segs: string[]): PageCtx | null {
  const [a, b] = segs

  if (segs.length === 1) {
    if (a.startsWith('in-')) return { kind: 'location', slug: a.slice(3) }
    if (!a.endsWith('-jobs')) return null
    const inner = a.slice(0, -5)
    if (TIPE_SLUGS.includes(inner)) return { kind: 'employment-type', slug: inner }
    return { kind: 'category', slug: inner }
  }

  if (segs.length === 2 && a.endsWith('-jobs') && b?.startsWith('in-')) {
    const inner = a.slice(0, -5)
    const locationSlug = b.slice(3)
    const tipe = TIPE_SLUGS.find((t) => inner.startsWith(t + '-'))
    if (tipe) {
      return { kind: 'combined-type', typeSlug: tipe, categorySlug: inner.slice(tipe.length + 1), locationSlug }
    }
    if (TIPE_SLUGS.includes(inner)) {
      return { kind: 'combined-type', typeSlug: inner, categorySlug: '', locationSlug }
    }
    return { kind: 'combined', categorySlug: inner, locationSlug }
  }

  return null
}

// ─── Static params ────────────────────────────────────────────────────────────

export async function generateStaticParams() {
  const [categories, locations, tipeKerja, { jobs: allJobs }] = await Promise.all([
    fetchCategories(),
    fetchLocations(),
    fetchTipeKerja(),
    fetchJobs({ perPage: 500 }),
  ])

  const now = new Date()
  const activeJobs = allJobs.filter((j) => !j.expiresAt || new Date(j.expiresAt) > now)

  const params: { segments: string[] }[] = []

  // /{category}-jobs
  for (const cat of categories) {
    if (activeJobs.some((j) => j.categorySlug === cat.slug)) {
      params.push({ segments: [`${cat.slug}-jobs`] })
    }
  }

  // /in-{location}
  for (const loc of locations) {
    if (activeJobs.some((j) => j.locationSlug === loc.slug)) {
      params.push({ segments: [`in-${loc.slug}`] })
    }
  }

  // /{type}-jobs
  for (const t of tipeKerja) {
    if (activeJobs.some((j) => j.employmentTypeSlug === t.slug)) {
      params.push({ segments: [`${t.slug}-jobs`] })
    }
  }

  // /{category}-jobs/in-{location}
  for (const cat of categories) {
    for (const loc of locations) {
      if (activeJobs.some((j) => j.categorySlug === cat.slug && j.locationSlug === loc.slug)) {
        params.push({ segments: [`${cat.slug}-jobs`, `in-${loc.slug}`] })
      }
    }
  }

  // /{type}-{category}-jobs/in-{location}
  for (const t of tipeKerja) {
    for (const cat of categories) {
      for (const loc of locations) {
        if (activeJobs.some((j) =>
          j.employmentTypeSlug === t.slug &&
          j.categorySlug === cat.slug &&
          j.locationSlug === loc.slug
        )) {
          params.push({ segments: [`${t.slug}-${cat.slug}-jobs`, `in-${loc.slug}`] })
        }
      }
    }
  }

  return params
}

// ─── Metadata ────────────────────────────────────────────────────────────────

interface PageProps { params: Promise<{ segments: string[] }> }

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { segments } = await params
  const ctx = parseSegments(segments)
  if (!ctx) return { title: 'Halaman tidak ditemukan' }

  const [categories, locations, tipeKerja] = await Promise.all([
    fetchCategories(), fetchLocations(), fetchTipeKerja(),
  ])

  switch (ctx.kind) {
    case 'category': {
      const cat = categories.find((c) => c.slug === ctx.slug)
      if (!cat) return { title: 'Kategori tidak ditemukan' }
      return generateListingMetadata({
        title: `${cat.name} Jobs in Indonesia | Lowongan Terbaru 2026`,
        description: `Temukan ${cat.count} lowongan ${cat.name} terbaru dari perusahaan terpercaya di Indonesia. Lamar sekarang di CDC Universitas Stekom.`,
        path: seoUrl.category(ctx.slug),
      })
    }
    case 'location': {
      const loc = locations.find((l) => l.slug === ctx.slug)
      if (!loc) return { title: 'Lokasi tidak ditemukan' }
      return generateListingMetadata({
        title: `Lowongan Kerja di ${loc.name} | Jobs Terbaru 2026`,
        description: `Temukan ${loc.count} lowongan kerja di ${loc.name} dari perusahaan terverifikasi. Full time, part time, dan magang tersedia.`,
        path: seoUrl.location(ctx.slug),
      })
    }
    case 'employment-type': {
      const tipe = tipeKerja.find((t) => t.slug === ctx.slug)
      if (!tipe) return { title: 'Tipe tidak ditemukan' }
      return generateListingMetadata({
        title: `Lowongan ${tipe.name} Terbaru 2026 | CDC Universitas Stekom`,
        description: `Cari lowongan ${tipe.name} terbaru dari perusahaan terpercaya di seluruh Indonesia. Daftar dan lamar sekarang.`,
        path: seoUrl.employmentType(ctx.slug),
      })
    }
    case 'combined': {
      const cat = categories.find((c) => c.slug === ctx.categorySlug)
      const loc = locations.find((l) => l.slug === ctx.locationSlug)
      if (!cat || !loc) return { title: 'Halaman tidak ditemukan' }
      return generateListingMetadata({
        title: `${cat.name} Jobs in ${loc.name} | Lowongan Terbaru 2026`,
        description: `Temukan lowongan ${cat.name} di ${loc.name}. Daftar lengkap dari perusahaan terverifikasi — lamar langsung tanpa perantara.`,
        path: seoUrl.combined(ctx.categorySlug, ctx.locationSlug),
      })
    }
    case 'combined-type': {
      const cat = categories.find((c) => c.slug === ctx.categorySlug)
      const loc = locations.find((l) => l.slug === ctx.locationSlug)
      const tipe = tipeKerja.find((t) => t.slug === ctx.typeSlug)
      if (!loc || !tipe) return { title: 'Halaman tidak ditemukan' }
      const label = cat ? `${tipe.name} ${cat.name}` : tipe.name
      return generateListingMetadata({
        title: `Lowongan ${label} di ${loc.name} | Terbaru 2026`,
        description: `Temukan lowongan ${label} di ${loc.name}. Perusahaan terverifikasi, lamar langsung dan gratis.`,
        path: cat
          ? seoUrl.combinedWithType(ctx.typeSlug, ctx.categorySlug, ctx.locationSlug)
          : `/in-${ctx.locationSlug}`,
      })
    }
  }
}

// ─── FAQ generation ───────────────────────────────────────────────────────────

function buildFaqs(ctx: PageCtx, label: string, total: number): { q: string; a: string }[] {
  const base = [
    {
      q: `Bagaimana cara melamar ${label}?`,
      a: `Klik lowongan yang sesuai, lalu tekan tombol "Lamar Sekarang". Anda akan diarahkan ke form lamaran atau halaman perusahaan. Semua proses gratis di CDC Universitas Stekom.`,
    },
    {
      q: `Apakah ada biaya untuk melamar ${label}?`,
      a: `Tidak. Semua layanan CDC Universitas Stekom sepenuhnya gratis untuk semua pelamar. Tidak ada biaya pendaftaran atau premi.`,
    },
  ]

  if (ctx.kind === 'category' || ctx.kind === 'combined' || ctx.kind === 'combined-type') {
    base.unshift({
      q: `Apa saja lowongan ${label} yang tersedia?`,
      a: `Saat ini terdapat ${total} lowongan aktif. Posisi mencakup berbagai level — fresh graduate hingga senior. Gunakan filter untuk mempersempit pencarian.`,
    })
    base.push({
      q: `Apa skill yang dibutuhkan untuk ${label}?`,
      a: `Persyaratan bervariasi per perusahaan. Baca detail setiap lowongan untuk mengetahui skill spesifik yang dibutuhkan.`,
    })
  }

  if (ctx.kind === 'location' || ctx.kind === 'combined') {
    base.unshift({
      q: `Perusahaan apa yang membuka lowongan di ${label}?`,
      a: `Ratusan perusahaan dari berbagai industri membuka lowongan di wilayah ini. Semua telah diverifikasi oleh tim CDC Universitas Stekom.`,
    })
  }

  return base.slice(0, 5)
}

// ─── Content block ────────────────────────────────────────────────────────────

function ContentBlock({ ctx, jobs, label, categories, locations, tipeKerja }: {
  ctx: PageCtx; jobs: Job[]; label: string
  categories: Category[]; locations: Location[]; tipeKerja: TipeKerja[]
}) {
  const topSkills = Object.entries(
    jobs.flatMap((j) => j.skills).reduce<Record<string, number>>((acc, s) => {
      acc[s] = (acc[s] ?? 0) + 1; return acc
    }, {})
  ).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([s]) => s)

  const topCompanies = [...new Set(jobs.map((j) => j.company))].slice(0, 6)

  const faqs = buildFaqs(ctx, label, jobs.length)

  return (
    <div className="mt-12 border-t border-border pt-10 space-y-10">
      {/* About */}
      <section>
        <h2 className="text-xl font-bold text-brand-text mb-4">Tentang Lowongan {label}</h2>
        <div className="prose prose-sm max-w-none text-brand-muted leading-relaxed">
          <p>
            CDC Universitas Stekom menghadirkan {jobs.length > 0 ? `${jobs.length} lowongan aktif` : 'berbagai lowongan'} untuk posisi {label} dari perusahaan-perusahaan terpercaya yang telah bermitra dengan Universitas STEKOM.
            Seluruh lowongan diverifikasi tim kami untuk memastikan keaslian dan relevansinya bagi para pelamar.
          </p>
          <p>
            Mencari pekerjaan {label} yang sesuai kualifikasi? Gunakan filter di halaman ini untuk menyaring berdasarkan gaji, tipe kontrak, dan level pengalaman.
            Proses lamaran sepenuhnya gratis, tidak ada biaya tersembunyi.
          </p>
        </div>
      </section>

      {/* Skills */}
      {topSkills.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-brand-text mb-4">Skill yang Dibutuhkan</h2>
          <div className="flex flex-wrap gap-2">
            {topSkills.map((s) => (
              <span key={s} className="rounded-lg border border-border bg-brand-bg px-3 py-1.5 text-sm font-medium text-brand-text">
                {s}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Companies */}
      {topCompanies.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-brand-text mb-4">Perusahaan yang Membuka Lowongan</h2>
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {topCompanies.map((c) => (
              <li key={c} className="flex items-center gap-2 text-sm text-brand-muted">
                <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {c}
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Cara melamar */}
      <section>
        <h2 className="text-xl font-bold text-brand-text mb-4">Cara Melamar</h2>
        <ol className="space-y-3 text-sm text-brand-muted">
          {[
            'Pilih lowongan yang sesuai dari daftar di atas',
            'Baca deskripsi dan persyaratan pekerjaan secara lengkap',
            'Klik tombol "Lamar Sekarang" dan isi formulir lamaran',
            'Pantau email untuk konfirmasi dan jadwal wawancara',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>
      </section>

      {/* Internal links */}
      <section>
        <h2 className="text-xl font-bold text-brand-text mb-4">Lowongan Terkait</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {ctx.kind !== 'location' && (
            <div>
              <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wide mb-2">Berdasarkan Lokasi</h3>
              <ul className="space-y-1">
                {locations.slice(0, 5).map((l) => (
                  <li key={l.slug}>
                    <Link href={seoUrl.location(l.slug)} className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      Lowongan di {l.name} ({l.count})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {ctx.kind !== 'category' && (
            <div>
              <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wide mb-2">Berdasarkan Kategori</h3>
              <ul className="space-y-1">
                {categories.slice(0, 6).map((c) => (
                  <li key={c.slug}>
                    <Link href={seoUrl.category(c.slug)} className="flex items-center gap-1 text-sm text-primary hover:underline">
                      <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                      {c.name} ({c.count})
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div>
            <h3 className="text-sm font-semibold text-brand-muted uppercase tracking-wide mb-2">Berdasarkan Tipe</h3>
            <ul className="space-y-1">
              {tipeKerja.map((t) => (
                <li key={t.slug}>
                  <Link href={seoUrl.employmentType(t.slug)} className="flex items-center gap-1 text-sm text-primary hover:underline">
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" />
                    {t.name} ({t.count})
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section>
        <h2 className="text-xl font-bold text-brand-text mb-4">FAQ</h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl border border-border bg-white p-5">
              <h3 className="text-sm font-semibold text-brand-text mb-2">{faq.q}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function TaxonomyPage({ params }: PageProps) {
  const { segments } = await params
  const ctx = parseSegments(segments)
  if (!ctx) notFound()

  const [categories, locations, tipeKerja] = await Promise.all([
    fetchCategories(), fetchLocations(), fetchTipeKerja(),
  ])

  // Resolve display names and fetch jobs
  let pageLabel = ''
  let h1 = ''
  let jobs: Job[] = []
  let total = 0
  let breadcrumbLabel = ''
  let canonicalPath = ''

  switch (ctx.kind) {
    case 'category': {
      const cat = categories.find((c) => c.slug === ctx.slug)
      if (!cat) notFound()
      const res = await fetchJobs({ category: ctx.slug, perPage: 100 })
      jobs = res.jobs; total = res.total
      pageLabel = cat.name
      h1 = `Lowongan ${cat.name} Terbaru`
      breadcrumbLabel = `${cat.name} Jobs`
      canonicalPath = seoUrl.category(ctx.slug)
      break
    }
    case 'location': {
      const loc = locations.find((l) => l.slug === ctx.slug)
      if (!loc) notFound()
      const res = await fetchJobs({ location: ctx.slug, perPage: 100 })
      jobs = res.jobs; total = res.total
      pageLabel = loc.name
      h1 = `Lowongan Kerja di ${loc.name}`
      breadcrumbLabel = `Loker di ${loc.name}`
      canonicalPath = seoUrl.location(ctx.slug)
      break
    }
    case 'employment-type': {
      const tipe = tipeKerja.find((t) => t.slug === ctx.slug)
      if (!tipe) notFound()
      const res = await fetchJobs({ employmentType: ctx.slug, perPage: 100 })
      jobs = res.jobs; total = res.total
      pageLabel = tipe.name
      h1 = `Lowongan ${tipe.name} Terbaru`
      breadcrumbLabel = `${tipe.name} Jobs`
      canonicalPath = seoUrl.employmentType(ctx.slug)
      break
    }
    case 'combined': {
      const cat = categories.find((c) => c.slug === ctx.categorySlug)
      const loc = locations.find((l) => l.slug === ctx.locationSlug)
      if (!cat || !loc) notFound()
      const res = await fetchJobs({ category: ctx.categorySlug, location: ctx.locationSlug, perPage: 100 })
      jobs = res.jobs; total = res.total
      pageLabel = `${cat.name} di ${loc.name}`
      h1 = `Lowongan ${cat.name} di ${loc.name}`
      breadcrumbLabel = `${cat.name} — ${loc.name}`
      canonicalPath = seoUrl.combined(ctx.categorySlug, ctx.locationSlug)
      break
    }
    case 'combined-type': {
      const cat = ctx.categorySlug ? categories.find((c) => c.slug === ctx.categorySlug) : null
      const loc = locations.find((l) => l.slug === ctx.locationSlug)
      const tipe = tipeKerja.find((t) => t.slug === ctx.typeSlug)
      if (!loc || !tipe) notFound()
      const res = await fetchJobs({
        category: ctx.categorySlug || undefined,
        location: ctx.locationSlug,
        employmentType: ctx.typeSlug,
        perPage: 100,
      })
      jobs = res.jobs; total = res.total
      const labelParts = [tipe.name, cat?.name, `di ${loc.name}`].filter(Boolean)
      pageLabel = labelParts.join(' ')
      h1 = `Lowongan ${pageLabel}`
      breadcrumbLabel = pageLabel
      canonicalPath = cat
        ? seoUrl.combinedWithType(ctx.typeSlug, ctx.categorySlug, ctx.locationSlug)
        : seoUrl.location(ctx.locationSlug)
      break
    }
  }

  const crumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Lowongan Kerja', href: '/loker' },
  ]
  const pageUrl = `${SITE_URL}${canonicalPath}`
  const faqs = buildFaqs(ctx, pageLabel, total)

  return (
    <>
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: breadcrumbLabel, href: canonicalPath }])} />
      {jobs.length > 0 && <JsonLd schema={itemListSchema(jobs, pageUrl)} />}
      <JsonLd schema={faqPageSchema(faqs)} />

      {/* Header */}
      <div className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 pt-5 pb-6 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel={breadcrumbLabel} />
          <div className="mt-3 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-brand-text sm:text-3xl">{h1}</h1>
              <p className="mt-1 text-sm text-brand-muted">
                {total > 0
                  ? `${total} lowongan aktif · Diperbarui setiap jam`
                  : 'Belum ada lowongan aktif di kategori ini'}
              </p>
            </div>
            {total > 0 && (
              <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-semibold text-primary w-fit">
                {total} lowongan
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Lowongan Terbaru */}
        <h2 className="text-lg font-bold text-brand-text mb-5">Lowongan Terbaru</h2>

        {jobs.length === 0 ? (
          <div className="rounded-xl border border-border bg-brand-bg px-6 py-12 text-center">
            <p className="text-brand-muted font-medium">Belum ada lowongan {pageLabel} saat ini.</p>
            <p className="text-sm text-brand-muted mt-1 mb-5">Coba lihat kategori atau lokasi lain:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {categories.slice(0, 4).map((c) => (
                <Link key={c.slug} href={seoUrl.category(c.slug)}
                  className="rounded-full border border-border bg-white px-4 py-1.5 text-sm font-medium text-brand-muted hover:border-primary hover:text-primary transition-colors">
                  {c.name}
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {jobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))}
          </div>
        )}

        {/* SEO content block */}
        <ContentBlock
          ctx={ctx}
          jobs={jobs}
          label={pageLabel}
          categories={categories}
          locations={locations}
          tipeKerja={tipeKerja}
        />
      </div>
    </>
  )
}
