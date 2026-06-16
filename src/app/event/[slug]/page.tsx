import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { CalendarDays, MapPin, Clock, Users, Building2 } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { generateEventMetadata } from '@/lib/seo'
import { eventSchema, breadcrumbSchema } from '@/lib/schema'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { VJFRegistrationForm } from '@/features/forms/VJFRegistrationForm'
import { OfflineRecruitmentForm } from '@/features/forms/OfflineRecruitmentForm'
import { fetchEventBySlug, fetchEvents } from '@/services/events.service'
export const revalidate = 3600

interface PageProps {
  params: Promise<{ slug: string }>
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
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel={event.title} />
          <Badge
            className={`mt-4 ${event.type === 'vjf' ? 'bg-primary/10 text-primary hover:bg-primary/10' : 'bg-cta/10 text-cta hover:bg-cta/10'}`}
          >
            {event.type === 'vjf' ? 'Virtual Job Fair' : 'Rekrutmen Offline'}
          </Badge>
          <h1 className="mt-2 text-3xl font-bold text-brand-text sm:text-4xl">{event.title}</h1>
          <p className="mt-3 text-brand-muted max-w-2xl">{event.description}</p>

          <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-muted">
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
              {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              {event.endDate && ` s.d. ${new Date(event.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`}
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

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Jobs */}
          <div className="flex-1 min-w-0">
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

          {/* Form */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-20 rounded-lg border border-border bg-background p-6">
              <h2 className="text-lg font-bold text-brand-text mb-1">Daftar Sekarang</h2>
              <p className="text-sm text-brand-muted mb-5">Gratis untuk semua peserta</p>
              {event.type === 'vjf' ? (
                <VJFRegistrationForm eventId={event.id} eventTitle={event.title} />
              ) : (
                <OfflineRecruitmentForm eventId={event.id} eventTitle={event.title} />
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
