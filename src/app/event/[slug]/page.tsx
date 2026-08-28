import { notFound } from 'next/navigation'
import Image from 'next/image'
import type { Metadata } from 'next'
import { CalendarDays, MapPin, Clock, Users, Building2, Briefcase, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { generateEventMetadata } from '@/lib/seo'
import { eventSchema, breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { InstagramEmbed } from '@/components/shared/InstagramEmbed'
import { VJFRegistrationForm } from '@/features/forms/VJFRegistrationForm'
import { fetchEventBySlug, fetchEvents } from '@/services/events.service'
export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
}

// Waktu event disimpan UTC tapi selalu ditampilkan dalam WIB — dipaksa lewat
// timeZone agar tidak ikut zona server (container deploy jalan di UTC).
const WIB = 'Asia/Jakarta'

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('id-ID', {
    hour: '2-digit', minute: '2-digit', timeZone: WIB,
  })
}

function isSameDay(a: string, b: string) {
  const day = (iso: string) =>
    new Date(iso).toLocaleDateString('en-CA', { timeZone: WIB })
  return day(a) === day(b)
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  if (!event) return { title: 'Event tidak ditemukan' }
  return generateEventMetadata(event)
}

export async function generateStaticParams() {
  const events = await fetchEvents()
  return events.map((e) => ({ slug: e.slug }))
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params
  const event = await fetchEventBySlug(slug)
  if (!event) notFound()

  const crumbs = [
    { label: 'Beranda', href: '/' },
    { label: 'Event', href: '/event' },
    {
      label: event.type === 'vjf' ? 'Virtual Job Fair' : 'Rekrutmen Offline',
      href: event.type === 'vjf' ? '/event/vjf' : '/event/offline-recruitment',
    },
  ]

  return (
    <>
      <JsonLd schema={eventSchema(event)} />
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: event.title, href: `/event/${event.slug}` }])} />

      {/* Header */}
      <section className="border-b border-border bg-brand-bg">
        <div className="site-container py-8">
          <Breadcrumbs crumbs={crumbs} currentLabel={event.title} />
          <Badge
            className={`mt-4 ${event.type === 'vjf' ? 'bg-primary/10 text-primary hover:bg-primary/10' : 'bg-cta/10 text-cta hover:bg-cta/10'}`}
          >
            {event.type === 'vjf' ? 'Virtual Job Fair' : 'Rekrutmen Offline'}
          </Badge>
          <h1 className="mt-2 text-3xl font-bold text-brand-text sm:text-4xl">{event.title}</h1>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric', timeZone: WIB })}
              {/* Event sehari (mis. walk-in interview) menampilkan rentang jam;
                  event multi-hari menampilkan tanggal akhir. */}
              {event.endDate && (
                isSameDay(event.date, event.endDate)
                  ? `, ${fmtTime(event.date)}–${fmtTime(event.endDate)} WIB`
                  : ` s.d. ${new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', timeZone: WIB })}`
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
              {event.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Building2 className="h-4 w-4 text-primary" aria-hidden="true" />
              {event.organizer}
            </span>
            {event.jobs && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                {event.jobs.length} perusahaan
              </span>
            )}
          </div>

          {event.registrationDeadline && (
            <p className="mt-3 text-sm font-medium text-cta">
              Pendaftaran hingga {new Date(event.registrationDeadline).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
        </div>
      </section>

      <div className="site-container py-10">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Jobs */}
          <div className="flex-1 min-w-0">
            {event.banner && (
              <div className="relative mb-8 aspect-4/3 w-full overflow-hidden rounded-xl border border-border bg-muted sm:aspect-video">
                <Image
                  src={event.banner}
                  alt={`Poster ${event.title}`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain"
                />
              </div>
            )}

            {event.description && (
              <div className="mb-8">
                <h2 className="text-xl font-bold text-brand-text mb-3">Tentang Event</h2>
                <p className="whitespace-pre-line text-sm leading-relaxed text-brand-muted">
                  {event.description}
                </p>
              </div>
            )}

            {/* Pengumuman IG + posisi/link berdampingan: embed kolomnya sempit
                (max 540px dari Instagram), jadi sisa ruang dipakai konten teks
                daripada dibiarkan kosong. */}
            {(event.instagramUrl || (event.positions && event.positions.length > 0)) && (
              <div className="mb-8 grid items-start gap-6 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)]">
                {event.instagramUrl && (
                  <div>
                    <h2 className="mb-3 text-xl font-bold text-brand-text">Pengumuman Resmi</h2>
                    <div className="overflow-hidden rounded-2xl border border-border">
                      <InstagramEmbed url={event.instagramUrl} />
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {event.positions && event.positions.length > 0 && (
                    <div>
                      <h2 className="mb-3 flex items-center gap-2 text-xl font-bold text-brand-text">
                        <Briefcase className="h-5 w-5 text-cta" aria-hidden="true" />
                        Posisi Tersedia
                        <span className="rounded-full bg-cta/10 px-2 py-0.5 text-xs font-semibold text-cta">
                          {event.positions.length}
                        </span>
                      </h2>
                      <ol className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-white">
                        {event.positions.map((pos, i) => {
                          // Poster menulis posisi sebagai "Nama (Jenjang)" — jenjang
                          // dipisah agar bisa ditampilkan sebagai badge.
                          const m = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(pos)
                          const name = m ? m[1] : pos
                          const level = m?.[2]
                          return (
                            <li key={pos} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-cta/10 text-[11px] font-bold text-cta">
                                {i + 1}
                              </span>
                              <span className="min-w-0 flex-1 font-medium text-brand-text">{name}</span>
                              {level && (
                                <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[11px] font-medium text-brand-muted">
                                  {level}
                                </span>
                              )}
                            </li>
                          )
                        })}
                      </ol>
                    </div>
                  )}

                </div>
              </div>
            )}

            {event.jobs && event.jobs.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-brand-text mb-5 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                  Lowongan dalam Event
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {event.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
                <Separator className="mt-10" />
              </>
            )}
          </div>

          {/* Sidebar: VJF pakai form sendiri; rekrutmen offline mendaftar lewat
              link resmi di poster, jadi tidak ada form di sini. */}
          <div className="w-full lg:w-96 shrink-0">
            {event.type === 'vjf' ? (
              <div className="sticky top-20 rounded-lg border border-border bg-background p-6">
                <h2 className="text-lg font-bold text-brand-text mb-1">Daftar Sekarang</h2>
                <p className="text-sm text-brand-muted mb-5">Gratis untuk semua peserta</p>
                <VJFRegistrationForm eventId={event.id} eventTitle={event.title} />
              </div>
            ) : (
              <div className="sticky top-20 space-y-4">
                {event.registrationLinks && event.registrationLinks.length > 0 && (
                  <div className="rounded-lg border border-border bg-background p-6">
                    <h2 className="text-lg font-bold text-brand-text">Daftar Kehadiran</h2>
                    <p className="mt-1 mb-5 text-sm text-brand-muted">
                      Gratis untuk semua peserta. Pilih sesuai cara kamu menghadiri.
                    </p>
                    <div className="space-y-2.5">
                      {event.registrationLinks.map((link) => (
                        <a
                          key={link.url}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-2 rounded-lg bg-cta px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-cta-dark"
                        >
                          {link.label}
                          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
                <div className="rounded-lg border border-border bg-brand-bg p-5 text-sm text-brand-muted">
                  <p className="font-semibold text-brand-text">Yang perlu dibawa</p>
                  <p className="mt-1.5 leading-relaxed">
                    Bawa CV, fotokopi ijazah, dan kartu identitas. Datang 30 menit
                    sebelum acara dimulai.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
