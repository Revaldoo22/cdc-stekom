import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowRight, Briefcase, CalendarDays, Clock, MapPin,
  Monitor, Megaphone, Palette, DollarSign, GraduationCap,
  Truck, Coins, ShieldCheck, Zap, Video,
} from 'lucide-react'
import type { LucideProps } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { JobCard } from '@/components/shared/JobCard'
import { HeroSearch } from '@/features/jobs/HeroSearch'
import { fetchJobs, fetchCategories, fetchLocations } from '@/services/jobs.service'
import { fetchEvents } from '@/services/events.service'

export const revalidate = 3600

type IconComponent = React.FC<LucideProps>

const CITY_PHOTOS: Record<string, string> = {
  semarang:   'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=600&q=75',
  jakarta:    'https://images.unsplash.com/photo-1555899434-94d1368aa7af?auto=format&fit=crop&w=600&q=75',
  surabaya:   'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?auto=format&fit=crop&w=600&q=75',
  yogyakarta: 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?auto=format&fit=crop&w=600&q=75',
  bandung:    'https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=75',
}

const CITY_FALLBACK = 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=600&q=75'

const CATEGORY_ICONS: Record<string, IconComponent> = {
  teknologi: Monitor,
  marketing: Megaphone,
  desain: Palette,
  keuangan: DollarSign,
  pendidikan: GraduationCap,
  logistik: Truck,
}

const QUICK_FILTERS = [
  { label: 'Fresh Graduate', href: '/tipe-pekerjaan/full-time' },
  { label: 'Magang', href: '/tipe-pekerjaan/magang' },
  { label: 'Full Time', href: '/tipe-pekerjaan/full-time' },
  { label: 'Part Time', href: '/tipe-pekerjaan/part-time' },
  { label: 'Freelance', href: '/tipe-pekerjaan/freelance' },
]

const VALUES = [
  {
    icon: Coins,
    title: 'Gratis Selamanya',
    desc: 'Tidak ada biaya pendaftaran. Semua fitur tersedia gratis untuk mahasiswa dan alumni Stekom.',
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
    quote: 'Berkat CDC Stekom, saya berhasil mendapatkan pekerjaan impian hanya 2 minggu setelah lulus.',
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
    quote: 'Platform ini gratis dan semua lowongannya terverifikasi. Saya sangat merekomendasikan untuk teman Stekom.',
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
      <section className="bg-primary border-b border-primary">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

            {/* Left: text + search */}
            <div className="flex-1 min-w-0">
              <Badge className="mb-4 bg-white/20 text-white hover:bg-white/20 border-0">
                Portal Karir Resmi Stekom
              </Badge>
              <h1 className="text-3xl font-bold text-white sm:text-4xl lg:text-[2.75rem]">
                Temukan Pekerjaan yang
                <br /> Tepat untuk Anda
              </h1>
              <p className="mt-3 text-base text-white/75 max-w-lg">
                Ratusan lowongan dari perusahaan terpercaya, khusus mahasiswa &amp; alumni Universitas STEKOM.
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

            {/* Right: Unsplash hero image */}
            <div className="hidden lg:flex flex-col gap-3 w-[400px] shrink-0">
              <div className="relative rounded-2xl overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80"
                  alt="Tim profesional bekerja bersama di kantor modern"
                  width={800}
                  height={500}
                  className="w-full h-[300px] object-cover"
                  priority
                />
              </div>
              {/* Stat pills below image */}
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
            { label: 'Full Time', href: '/tipe-pekerjaan/full-time' },
            { label: 'Magang', href: '/tipe-pekerjaan/magang' },
            { label: 'Part Time', href: '/tipe-pekerjaan/part-time' },
            { label: 'Freelance', href: '/tipe-pekerjaan/freelance' },
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
            {categories.map((cat) => {
              const Icon: IconComponent = CATEGORY_ICONS[cat.slug] ?? Briefcase
              return (
                <Link
                  key={cat.slug}
                  href={`/kategori/${cat.slug}`}
                  className="group flex flex-col items-center rounded-xl border border-border bg-white p-4 text-center transition-all duration-200 hover:border-primary hover:shadow-md cursor-pointer"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-2 group-hover:bg-primary transition-all duration-200">
                    <Icon className="h-5 w-5 text-primary group-hover:text-white transition-colors duration-200" />
                  </span>
                  <span className="text-sm font-medium text-brand-text group-hover:text-primary transition-colors">{cat.name}</span>
                  <span className="text-xs text-brand-muted mt-0.5">{cat.count} loker</span>
                </Link>
              )
            })}
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
              href="/daerah"
              className="hidden sm:flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Lihat semua kota <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {locations.map((loc) => {
              const photo = CITY_PHOTOS[loc.slug] ?? CITY_FALLBACK
              return (
                <Link
                  key={loc.slug}
                  href={`/daerah/${loc.slug}`}
                  className="group relative overflow-hidden rounded-xl h-40 sm:h-48 cursor-pointer block"
                >
                  <Image
                    src={photo}
                    alt={`Loker di ${loc.name}`}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Dark overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {/* Text */}
                  <div className="absolute bottom-0 left-0 right-0 p-3">
                    <p className="text-white font-bold text-sm leading-tight">{loc.name}</p>
                    <p className="text-white/70 text-[11px] mt-0.5">{loc.count} lowongan</p>
                  </div>
                </Link>
              )
            })}
          </div>

          <div className="mt-4 sm:hidden flex justify-center">
            <Link
              href="/daerah"
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
          <p className="text-center text-sm text-brand-muted mb-10">Mereka menemukan karir impian melalui CDC Stekom</p>
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

      {/* ── Kenapa CDC Stekom ── */}
      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold text-brand-text text-center mb-10">Kenapa CDC Stekom?</h2>
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
