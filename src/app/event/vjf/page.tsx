import type { Metadata } from 'next'
import { CalendarDays, MapPin, Clock, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { generateListingMetadata } from '@/lib/seo'
import { JsonLd } from '@/components/shared/JsonLd'
import { Breadcrumbs } from '@/components/shared/Breadcrumbs'
import { JobCard } from '@/components/shared/JobCard'
import { VJFRegistrationForm } from '@/features/forms/VJFRegistrationForm'
import { fetchEvents } from '@/services/events.service'
import { eventSchema, breadcrumbSchema } from '@/lib/schema'
export const revalidate = 3600

export const metadata: Metadata = generateListingMetadata({
  title: 'Virtual Job Fair (VJF) Stekom | Daftar Gratis',
  description:
    'Ikuti Virtual Job Fair CDC Stekom — bertemu ratusan rekruter dari rumah. Daftarkan diri sekarang, gratis untuk mahasiswa dan alumni Stekom.',
  path: '/event/vjf',
})

const crumbs = [
  { label: 'Beranda', href: '/' },
  { label: 'Event', href: '/event' },
]

export default async function VJFPage() {
  const events = await fetchEvents()
  const vjfEvents = events.filter((e) => e.type === 'vjf')
  const nextVJF = vjfEvents[0]

  return (
    <>
      {nextVJF && <JsonLd schema={eventSchema(nextVJF)} />}
      <JsonLd schema={breadcrumbSchema([...crumbs, { label: 'Virtual Job Fair', href: '/event/vjf' }])} />

      {/* Hero */}
      <section className="border-b border-border bg-brand-bg">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <Breadcrumbs crumbs={crumbs} currentLabel="Virtual Job Fair" />
          <Badge className="mt-4 bg-primary/10 text-primary hover:bg-primary/10">
            Virtual Job Fair
          </Badge>
          <h1 className="mt-2 text-3xl font-bold text-brand-text sm:text-4xl">
            {nextVJF?.title ?? 'Virtual Job Fair CDC Stekom'}
          </h1>
          <p className="mt-3 text-brand-muted max-w-2xl">
            {nextVJF?.description ?? 'Bergabunglah dengan Virtual Job Fair dan temukan karir impianmu dari kenyamanan rumah.'}
          </p>

          {nextVJF && (
            <div className="mt-5 flex flex-wrap gap-4 text-sm text-brand-muted">
              <span className="flex items-center gap-1.5">
                <Clock className="h-4 w-4 text-primary" aria-hidden="true" />
                {new Date(nextVJF.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-primary" aria-hidden="true" />
                {nextVJF.location}
              </span>
              {nextVJF.jobs && (
                <span className="flex items-center gap-1.5">
                  <Users className="h-4 w-4 text-primary" aria-hidden="true" />
                  {nextVJF.jobs.length} perusahaan hadir
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
            {nextVJF?.jobs && nextVJF.jobs.length > 0 && (
              <>
                <h2 className="text-xl font-bold text-brand-text mb-5 flex items-center gap-2">
                  <CalendarDays className="h-5 w-5 text-primary" aria-hidden="true" />
                  Lowongan dalam Event Ini
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {nextVJF.jobs.map((job) => (
                    <JobCard key={job.id} job={job} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Registration form */}
          <div className="w-full lg:w-96 shrink-0">
            <div className="sticky top-20 rounded-lg border border-border bg-background p-6">
              <h2 className="text-lg font-bold text-brand-text mb-1">Daftar Sekarang</h2>
              <p className="text-sm text-brand-muted mb-5">Gratis untuk mahasiswa dan alumni Stekom</p>
              {nextVJF ? (
                <VJFRegistrationForm
                  eventId={nextVJF.id}
                  eventTitle={nextVJF.title}
                />
              ) : (
                <p className="text-sm text-brand-muted">Belum ada VJF yang dijadwalkan. Pantau terus halaman ini.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
