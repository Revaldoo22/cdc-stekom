import type { Metadata } from 'next'
import { MapPin, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { generateListingMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { OfflineRecruitmentForm } from '@/features/forms/OfflineRecruitmentForm'
import { fetchEvents } from '@/services/events.service'
import { eventSchema, breadcrumbSchema } from '@/lib/schema'
export const revalidate = 3600

export const metadata: Metadata = generateListingMetadata({
  title: 'Rekrutmen Offline Kampus Stekom | Daftar Gratis',
  description:
    'Ikuti Rekrutmen Offline di kampus Stekom — temui rekruter langsung dan jalani seleksi on the spot. Daftar sekarang, gratis.',
  path: '/event/offline-recruitment',
})

const crumbs = [
  { label: 'Beranda', href: '/' },
  { label: 'Event', href: '/event' },
]

export default async function OfflineRecruitmentPage() {
  const events = await fetchEvents()
  const offlineEvents = events.filter((e) => e.type === 'offline')
  const nextEvent = offlineEvents[0]

  return (
    <>
      {nextEvent && <JsonLd schema={eventSchema(nextEvent)} />}
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: 'Rekrutmen Offline', href: '/event/offline-recruitment' }])} />

      {/* Hero */}
      <section className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel="Rekrutmen Offline" />
          <Badge className="mt-4 bg-cta/10 text-cta hover:bg-cta/10">
            Rekrutmen Offline
          </Badge>
          <h1 className="mt-2 text-3xl font-bold text-brand-text sm:text-4xl">
            {nextEvent?.title ?? 'Rekrutmen Offline Kampus Stekom'}
          </h1>
          <p className="mt-3 text-brand-muted max-w-2xl">
            {nextEvent?.description ?? 'Rekrutmen langsung di kampus Stekom. Temui rekruter dan jalani proses seleksi on the spot.'}
          </p>

          {nextEvent && (
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-cta" aria-hidden="true" />
                {new Date(nextEvent.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-cta" aria-hidden="true" />
                {nextEvent.location}
              </span>
              {nextEvent.jobs && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-cta" aria-hidden="true" />
                  {nextEvent.jobs.length} perusahaan hadir
                </span>
              )}
            </div>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-10 lg:flex-row">
          {/* Jobs from event */}
          <div className="flex-1 min-w-0">
            {nextEvent?.jobs && nextEvent.jobs.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-brand-text mb-5">
                  Perusahaan yang Hadir
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {nextEvent.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Registration form */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-20 rounded-lg border border-border bg-background p-6">
              <h2 className="text-lg font-bold text-brand-text mb-1">Daftar Rekrutmen</h2>
              <p className="text-sm text-brand-muted mb-5">Gratis untuk mahasiswa dan alumni Stekom</p>
              {nextEvent ? (
                <OfflineRecruitmentForm
                  eventId={nextEvent.id}
                  eventTitle={nextEvent.title}
                />
              ) : (
                <p className="text-sm text-brand-muted">Belum ada rekrutmen offline yang dijadwalkan.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
