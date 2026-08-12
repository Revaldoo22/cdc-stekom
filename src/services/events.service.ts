import type { RecruitmentEvent } from '@/types'
import { mockEvents } from '@/mocks/events'
import { computeEventStatus } from '@/lib/events'
import { fetchVjfEvents } from './vjf.service'

// Status pada data lokal ditulis tangan, jadi pasti basi begitu tanggalnya
// lewat. Selalu hitung ulang dari tanggal supaya badge "Pendaftaran Dibuka"
// dan pemisahan Mendatang/Riwayat ikut waktu sekarang.
function withLiveStatus(e: RecruitmentEvent): RecruitmentEvent {
  return { ...e, status: computeEventStatus(e.date, e.endDate) }
}

// VJF batches come from the live TopLoker API; offline-recruitment events are
// still curated locally (no API yet).
export async function fetchEvents(): Promise<RecruitmentEvent[]> {
  const [vjf] = await Promise.all([fetchVjfEvents()])
  const offline = mockEvents.filter((e) => e.type === 'offline').map(withLiveStatus)
  // Fall back to mock VJF only if the API returned nothing.
  const vjfEvents = vjf.length > 0 ? vjf : mockEvents.filter((e) => e.type === 'vjf').map(withLiveStatus)
  return [...vjfEvents, ...offline]
}

export async function fetchEventBySlug(slug: string): Promise<RecruitmentEvent | null> {
  const all = await fetchEvents()
  return all.find((e) => e.slug === slug) ?? null
}
