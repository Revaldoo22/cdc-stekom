import type { RecruitmentEvent } from '@/types'
import { mockEvents } from '@/mocks/events'
import { fetchVjfEvents } from './vjf.service'

// VJF batches come from the live TopLoker API; offline-recruitment events are
// still curated locally (no API yet).
export async function fetchEvents(): Promise<RecruitmentEvent[]> {
  const [vjf] = await Promise.all([fetchVjfEvents()])
  const offline = mockEvents.filter((e) => e.type === 'offline')
  // Fall back to mock VJF only if the API returned nothing.
  const vjfEvents = vjf.length > 0 ? vjf : mockEvents.filter((e) => e.type === 'vjf')
  return [...vjfEvents, ...offline]
}

export async function fetchEventBySlug(slug: string): Promise<RecruitmentEvent | null> {
  const all = await fetchEvents()
  return all.find((e) => e.slug === slug) ?? null
}
