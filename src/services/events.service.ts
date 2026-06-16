import { USE_MOCK, REVALIDATE_EVENTS } from '@/config/api'
import type { RecruitmentEvent } from '@/types'
import { apiFetch } from './api-client'
import { mockEvents } from '@/mocks/events'

export async function fetchEvents(): Promise<RecruitmentEvent[]> {
  if (USE_MOCK) return mockEvents
  return apiFetch<RecruitmentEvent[]>('/events', { revalidate: REVALIDATE_EVENTS })
}

export async function fetchEventBySlug(slug: string): Promise<RecruitmentEvent | null> {
  if (USE_MOCK) return mockEvents.find((e) => e.slug === slug) ?? null
  try {
    return await apiFetch<RecruitmentEvent>(`/events/${slug}`, {
      revalidate: REVALIDATE_EVENTS,
    })
  } catch {
    return null
  }
}
