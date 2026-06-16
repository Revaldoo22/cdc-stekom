export interface Job {
  id: string
  slug: string
  title: string
  company: string
  companyLogo?: string
  location: string
  locationSlug: string
  category: string
  categorySlug: string
  employmentType: string
  employmentTypeSlug: string
  salary?: string
  description: string
  requirements: string[]
  skills: string[]
  applyUrl?: string
  postedAt: string
  expiresAt?: string
}

export interface JobsResponse {
  jobs: Job[]
  total: number
  page: number
  perPage: number
}

export interface JobsParams {
  page?: number
  perPage?: number
  keyword?: string
  category?: string
  location?: string
  employmentType?: string
}

export interface Category {
  slug: string
  name: string
  count: number
}

export interface Location {
  slug: string
  name: string
  count: number
}

export interface TipeKerja {
  slug: string
  name: string
  count: number
}

export type EventType = 'vjf' | 'offline'

export interface RecruitmentEvent {
  id: string
  slug: string
  title: string
  type: EventType
  description: string
  date: string
  endDate?: string
  location: string
  organizer: string
  banner?: string
  jobs?: Job[]
  registrationDeadline?: string
}

export interface EventsResponse {
  events: RecruitmentEvent[]
  total: number
}

export interface FormSubmitPayload {
  formType: 'job-application' | 'vjf' | 'offline'
  data: Record<string, string>
}

export interface Crumb {
  label: string
  href: string
}
