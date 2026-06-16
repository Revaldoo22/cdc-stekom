import { USE_MOCK, REVALIDATE_JOBS, REVALIDATE_CATEGORIES, PER_PAGE } from '@/config/api'
import type { Job, JobsResponse, JobsParams, Category, Location, TipeKerja } from '@/types'
import { apiFetch } from './api-client'
import {
  mockJobs,
  mockCategories,
  mockLocations,
  mockTipeKerja,
} from '@/mocks/jobs'

function filterMockJobs(jobs: Job[], params: JobsParams): JobsResponse {
  let filtered = [...jobs]

  if (params.keyword) {
    const kw = params.keyword.toLowerCase()
    filtered = filtered.filter(
      (j) =>
        j.title.toLowerCase().includes(kw) ||
        j.company.toLowerCase().includes(kw) ||
        j.skills.some((s) => s.toLowerCase().includes(kw)),
    )
  }
  if (params.category) {
    filtered = filtered.filter((j) => j.categorySlug === params.category)
  }
  if (params.location) {
    filtered = filtered.filter((j) => j.locationSlug === params.location)
  }
  if (params.employmentType) {
    filtered = filtered.filter((j) => j.employmentTypeSlug === params.employmentType)
  }

  const page = params.page ?? 1
  const perPage = params.perPage ?? PER_PAGE
  const start = (page - 1) * perPage
  return {
    jobs: filtered.slice(start, start + perPage),
    total: filtered.length,
    page,
    perPage,
  }
}

export async function fetchJobs(params: JobsParams = {}): Promise<JobsResponse> {
  if (USE_MOCK) return filterMockJobs(mockJobs, params)

  const qs = new URLSearchParams()
  if (params.page) qs.set('page', String(params.page))
  if (params.perPage) qs.set('per_page', String(params.perPage))
  if (params.keyword) qs.set('keyword', params.keyword)
  if (params.category) qs.set('category', params.category)
  if (params.location) qs.set('location', params.location)
  if (params.employmentType) qs.set('employment_type', params.employmentType)

  return apiFetch<JobsResponse>(`/jobs?${qs}`, { revalidate: REVALIDATE_JOBS })
}

export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  if (USE_MOCK) return mockJobs.find((j) => j.slug === slug) ?? null
  try {
    return await apiFetch<Job>(`/jobs/${slug}`, { revalidate: REVALIDATE_JOBS })
  } catch {
    return null
  }
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return mockCategories
  return apiFetch<Category[]>('/categories', { revalidate: REVALIDATE_CATEGORIES })
}

export async function fetchLocations(): Promise<Location[]> {
  if (USE_MOCK) return mockLocations
  return apiFetch<Location[]>('/locations', { revalidate: REVALIDATE_CATEGORIES })
}

export async function fetchTipeKerja(): Promise<TipeKerja[]> {
  if (USE_MOCK) return mockTipeKerja
  return apiFetch<TipeKerja[]>('/employment-types', { revalidate: REVALIDATE_CATEGORIES })
}

export async function fetchRelatedJobs(job: Job, limit = 5): Promise<Job[]> {
  const { jobs: byCategory } = await fetchJobs({ category: job.categorySlug, perPage: limit + 1 })
  const same = byCategory.filter((j) => j.id !== job.id).slice(0, limit)
  return same
}

export async function fetchJobsByLocation(locationSlug: string, params: JobsParams = {}): Promise<JobsResponse> {
  return fetchJobs({ ...params, location: locationSlug })
}

export async function fetchJobsByCategory(categorySlug: string, params: JobsParams = {}): Promise<JobsResponse> {
  return fetchJobs({ ...params, category: categorySlug })
}

export async function fetchJobsByTipe(tipeSlug: string, params: JobsParams = {}): Promise<JobsResponse> {
  return fetchJobs({ ...params, employmentType: tipeSlug })
}
