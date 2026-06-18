import type { RecruitmentEvent } from '@/types'
import { mockEvents } from '@/mocks/events'

// The CDC API exposes no events endpoint — VJF / offline-recruitment events are
// curated locally, so these always use mock data regardless of USE_MOCK.
export async function fetchEvents(): Promise<RecruitmentEvent[]> {
  return mockEvents
}

export async function fetchEventBySlug(slug: string): Promise<RecruitmentEvent | null> {
  return mockEvents.find((e) => e.slug === slug) ?? null
}
