import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Briefcase, CalendarDays, Clock, MapPin,
  Coins, ShieldCheck, Zap, Video,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JobCard } from '@/components/shared/JobCard'
import { HeroSearch } from '@/features/jobs/HeroSearch'
import { PaperPlane } from '@/features/jobs/PaperPlane'
import { fetchJobs, fetchCategories, fetchLocations } from '@/services/jobs.service'
import { fetchEvents } from '@/services/events.service'
import { seoUrl } from '@/lib/seo-urls'

export const revalidate = 3600


const QUICK_FILTERS = [
  { label: 'Fresh Graduate', href: seoUrl.employmentType('full-time') },
  { label: 'Magang', href: seoUrl.employmentType('magang') },
  { label: 'Full Time', href: seoUrl.employmentType('full-time') },
  { label: 'Part Time', href: seoUrl.employmentType('part-time') },
  { label: 'Freelance', href: seoUrl.employmentType('freelance') },
]

const VALUES = [
  {
    icon: Coins,
    title: 'Gratis Selamanya',
    desc: 'Tidak ada biaya pendaftaran. Semua fitur tersedia gratis untuk semua pencari kerja.',
  },
  {
    icon: ShieldCheck,
    title: 'Perusahaan Terverifikasi',
    desc: 'Semua lowongan berasal dari perusahaan terverifikasi yang telah bermitra dengan Universitas STEKOM.',
  },
  {
    icon: Zap,
    title: 'Rekrutmen Cepat',
    desc: 'Lamar langsung tanpa perantara. Terhubung langsung dengan HRD perusahaan pilihan.',
  },
]

const TESTIMONIALS = [
  {
    photo: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&h=96&fit=crop&q=80',
    name: 'Sari Dewi',
    role: 'Frontend Developer @ Tokopedia',
    quote: 'Berkat CDC Universitas Stekom, saya berhasil mendapatkan pekerjaan impian hanya 2 minggu setelah lulus.',
  },
  {
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=96&h=96&fit=crop&q=80',
    name: 'Budi Santoso',
    role: 'Data Analyst @ Gojek',
    quote: 'Event VJF mempertemukan saya langsung dengan HRD. Prosesnya cepat dan sangat profesional.',
  },
  {
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=96&h=96&fit=crop&q=80',
    name: 'Rina Kusuma',
    role: 'Digital Marketing @ Shopee',
    quote: 'Platform ini gratis dan semua lowongannya terverifikasi. Saya sangat merekomendasikan untuk semua pencari kerja.',
  },
]

export default async function HomePage() {
  const [{ jobs: latestJobs }, categories, locations, events] = await Promise.all([
    fetchJobs({ perPage: 6 }),
    fetchCategories(),
    fetchLocations(),
    fetchEvents(),
  ])

  const offlineEvents = events.filter((e) => e.type === 'offline')
  const vjfEvents = events.filter((e) => e.type === 'vjf')

  return (
    <>
      {/* ── Hero Search ── */}
      <section className="relative bg-primary border-b border-primary">
        {/* Decorative layer — overflow clipped here, not on section, so dropdown can escape */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Right: hero image */}
          <div className="hidden lg:block absolute inset-y-0 right-0 w-[44%]">
            <div className="absolute inset-y-0 left-0 w-40 bg-gradient-to-r from-primary to-transparent z-10" />
            <Image
              src="/images/hero/hero.png"
              alt="Mahasiswa siap berkarir bersama CDC Universitas Stekom"
              fill
              sizes="44vw"
              quality={100}
              className="object-cover object-center brightness-[1.03] contrast-[1.08] saturate-[1.18] [image-rendering:high-quality]"
              priority
            />
          </div>
          {/* Paper plane animation */}
          <div className="hidden lg:block absolute top-6 z-20" style={{ right: 'calc(44% + 8px)' }}>
            <PaperPlane />
          </div>
        </div>

        {/* Left: text + search — constrained to max-w-7xl */}
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-12 lg:py-14 lg:max-w-[58%]">
            <Badge className="mb-4 bg-white/20 text-white hover:bg-white/20 border-0">
              Portal Karir Resmi Universitas STEKOM
            </Badge>
            <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem] leading-tight">
              Temukan Pekerjaan yang
              <br /> Tepat untuk Anda
            </h1>
            <p className="mt-3 text-base text-white/75 max-w-lg">
              Ratusan lowongan dari perusahaan terpercaya. Daftar gratis, lamar langsung tanpa perantara.
            </p>

            <div className="mt-7">
              <HeroSearch locations={locations} categories={categories} />
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {QUICK_FILTERS.map(({ label, href }) => (
                <Link
                  key={label}
                  href={href}
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-1.5 text-xs font-medium text-white/80 transition-colors hover:bg-white/20 hover:text-white cursor-pointer"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Lowongan Terbaru ── */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold text-brand-text">Lowongan Terbaru</h2>
            <p className="mt-1 text-sm text-brand-muted">Diperbarui setiap hari dari perusahaan terverifikasi</p>
          </div>
          <Link
            href="/loker"
            className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline cursor-pointer"
          >
            Lihat semua <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>

        {/* Filter chips */}
        <div className="mt-5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {[
            { label: 'Semua', href: '/loker' },
            { label: 'Full Time', href: seoUrl.employmentType('full-time') },
            { label: 'Magang', href: seoUrl.employmentType('magang') },
            { label: 'Part Time', href: seoUrl.employmentType('part-time') },
            { label: 'Freelance', href: seoUrl.employmentType('freelance') },
          ].map(({ label, href }, i) => (
            <Link
              key={label}
              href={href}
              className={`shrink-0 rounded-full px-4 py-1.5 text-[13px] font-medium transition-colors cursor-pointer ${
                i === 0
                  ? 'bg-primary text-white'
                  : 'border border-border bg-white text-brand-muted hover:border-primary hover:text-primary'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Grid */}
        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/loker"
            className="inline-flex items-center gap-2 rounded-lg border border-border px-7 py-2.5 text-sm font-medium text-brand-muted transition-all hover:border-primary hover:text-primary cursor-pointer"
          >
            Lihat Semua Lowongan
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </section>

      {/* ── Kategori Pekerjaan ── */}
      <section className="bg-brand-bg border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-text">Kategori Pekerjaan</h2>
            <Button variant="ghost" render={<Link href="/loker" />} className="cursor-pointer text-primary gap-1">
              Semua kategori <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={seoUrl.category(cat.slug)}
                className="group rounded-xl border border-border bg-white px-4 py-5 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
              >
                <p className="font-semibold text-brand-text group-hover:text-primary transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Lokasi Populer ── */}
      <section className="bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Berdasarkan Kota</p>
              <h2 className="text-2xl font-bold text-brand-text">Loker di Kota Populer</h2>
            </div>
            <Link
              href="/loker"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Lihat semua kota <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {locations.map((loc) => (
              <Link
                key={loc.slug}
                href={seoUrl.location(loc.slug)}
                className="group rounded-xl border border-border bg-white px-4 py-5 hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer"
              >
                <p className="font-semibold text-brand-text group-hover:text-primary transition-colors">{loc.name}</p>
              </Link>
            ))}
          </div>

          <div className="mt-4 sm:hidden flex justify-center">
            <Link
              href="/loker"
              className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Lihat semua kota <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Event Rekrutmen — promo banners ── */}
      {(offlineEvents.length > 0 || vjfEvents.length > 0) && (
        <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-brand-text">Event Rekrutmen</h2>
            <Button variant="ghost" render={<Link href="/event" />} className="cursor-pointer text-primary gap-1">
              Semua event <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* VJF — solid primary blue */}
            <div className="relative rounded-2xl overflow-hidden bg-primary flex min-h-[220px]">
              <div className="flex-1 flex flex-col justify-center gap-4 p-8 z-10">
                <Badge className="w-fit bg-white/20 text-white border-0 hover:bg-white/20 text-xs">
                  Virtual Job Fair
                </Badge>
                <h3 className="text-xl font-bold text-white leading-snug max-w-[260px]">
                  Bertemu ratusan rekruter langsung dari rumah
                </h3>
                {vjfEvents[0] && (
                  <p className="text-sm text-white/70 flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {new Date(vjfEvents[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <Button
                  render={<Link href="/event/vjf" />}
                  className="cursor-pointer w-fit bg-white text-primary hover:bg-white/90 font-semibold px-6"
                >
                  Daftar Sekarang
                </Button>
              </div>
              {/* Right image */}
              <div className="hidden sm:block w-[42%] relative shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?auto=format&fit=crop&w=600&q=80"
                  alt="Virtual Job Fair — interview online"
                  fill
                  className="object-cover"
                />
                {/* dark-to-transparent overlay so text stays readable at small widths */}
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-primary to-transparent" />
              </div>
            </div>

            {/* Rekrutmen Offline — light bg + orange */}
            <div className="relative rounded-2xl overflow-hidden bg-brand-bg border border-border flex min-h-[220px]">
              <div className="flex-1 flex flex-col justify-center gap-4 p-8 z-10">
                <Badge className="w-fit bg-orange-100 text-orange-700 border-0 hover:bg-orange-100 text-xs">
                  Rekrutmen Offline
                </Badge>
                <h3 className="text-xl font-bold text-brand-text leading-snug max-w-[260px]">
                  Hadir langsung dan jalani seleksi on-the-spot
                </h3>
                {offlineEvents[0] && (
                  <p className="text-sm text-brand-muted flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                    {new Date(offlineEvents[0].date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </p>
                )}
                <Button
                  render={<Link href="/event/offline-recruitment" />}
                  className="cursor-pointer w-fit bg-orange-500 hover:bg-orange-600 text-white font-semibold px-6"
                >
                  Daftar Rekrutmen
                </Button>
              </div>
              {/* Right image */}
              <div className="hidden sm:block w-[42%] relative shrink-0">
                <Image
                  src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=600&q=80"
                  alt="Rekrutmen Offline — interview tatap muka"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-brand-bg to-transparent" />
              </div>
            </div>

          </div>
        </section>
      )}

      {/* ── Testimoni Alumni ── */}
      <section className="bg-brand-bg border-y border-border">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-brand-text text-center mb-2">Alumni yang Berhasil</h2>
          <p className="text-center text-sm text-brand-muted mb-10">Mereka menemukan karir impian melalui CDC Universitas Stekom</p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {TESTIMONIALS.map(({ photo, name, role, quote }) => (
              <div key={name} className="rounded-xl border border-border bg-white p-6 flex flex-col gap-4">
                <p className="text-sm text-brand-muted leading-relaxed italic flex-1">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="flex items-center gap-3">
                  <Image
                    src={photo}
                    alt={name}
                    width={48}
                    height={48}
                    className="rounded-full object-cover w-12 h-12 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-brand-text truncate">{name}</p>
                    <p className="text-xs text-brand-muted truncate">{role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Kenapa CDC Universitas Stekom ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-brand-text text-center mb-10">Kenapa CDC Universitas Stekom?</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {VALUES.map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex flex-col items-center text-center rounded-xl border border-border bg-background p-6">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 mb-4">
                <Icon className="h-7 w-7 text-primary" aria-hidden="true" />
              </span>
              <h3 className="text-base font-semibold text-brand-text mb-2">{title}</h3>
              <p className="text-sm text-brand-muted leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </>
  )
}
