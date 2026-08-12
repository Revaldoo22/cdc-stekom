import { USE_MOCK, PER_PAGE } from '@/config/api'
import { SALARY_RANGES } from '@/config/filters'
import type { Job, JobsResponse, JobsParams, Category, Location, TipeKerja } from '@/types'
import {
  getCdcJobs,
  searchCdcJobs,
  getCdcJobById,
  getCdcRelatedJobs,
  getCdcCategories,
  getCdcLocations,
  getCdcTipeKerja,
} from './cdc-loker.service'
import {
  mockJobs,
  mockCategories,
  mockLocations,
  mockTipeKerja,
} from '@/mocks/jobs'

// ─── Mock-mode filtering (unchanged) ─────────────────────────────────────────────

function parseSalaryMin(salary?: string): number {
  if (!salary) return 0
  const match = salary.match(/[\d.]+/)
  if (!match) return 0
  return parseInt(match[0].replace(/\./g, ''), 10)
}

function filterMockJobs(jobs: Job[], params: JobsParams): JobsResponse {
  let filtered = [...jobs]

  if (params.keyword) {
    // Cocokkan per kata (OR) lalu urutkan berdasarkan jumlah kata yang cocok,
    // meniru perilaku searchCdcJobs: "marketing semarang" tetap memberi hasil
    // walau tidak ada satu baris pun yang memuat kedua kata.
    const words = params.keyword.toLowerCase().split(/\s+/).filter(Boolean)
    const score = (j: Job) => {
      const hay = `${j.title} ${j.company} ${j.location} ${j.skills.join(' ')}`.toLowerCase()
      return words.filter((w) => hay.includes(w)).length
    }
    filtered = filtered
      .map((j) => ({ j, s: score(j) }))
      .filter((x) => x.s > 0)
      .sort((a, b) => b.s - a.s)
      .map((x) => x.j)
  }
  if (params.category) filtered = filtered.filter((j) => j.categorySlug === params.category)
  if (params.location) filtered = filtered.filter((j) => j.locationSlug === params.location)
  if (params.employmentType) filtered = filtered.filter((j) => j.employmentTypeSlug === params.employmentType)
  if (params.salaryRange) {
    const range = SALARY_RANGES.find((r) => r.slug === params.salaryRange)
    if (range) {
      filtered = filtered.filter((j) => {
        const min = parseSalaryMin(j.salary)
        return min >= range.min && min < range.max
      })
    }
  }
  if (params.experienceLevel) filtered = filtered.filter((j) => j.experienceLevel === params.experienceLevel)

  const page = params.page ?? 1
  const perPage = params.perPage ?? PER_PAGE
  const start = (page - 1) * perPage
  return { jobs: filtered.slice(start, start + perPage), total: filtered.length, page, perPage }
}

// ─── Live queries ────────────────────────────────────────────────────────────────

/**
 * Every filter below is applied by the API. The one exception is
 * `experienceLevel`: the backend has a `pengalaman` column but it is free text
 * with no matching query param, so that filter is currently a no-op on live data.
 */
export async function fetchJobs(params: JobsParams = {}): Promise<JobsResponse> {
  if (USE_MOCK) return filterMockJobs(mockJobs, params)

  const range = params.salaryRange ? SALARY_RANGES.find((r) => r.slug === params.salaryRange) : undefined

  const cdcQuery = {
    page: params.page ?? 1,
    perPage: params.perPage ?? PER_PAGE,
    keyword: params.keyword,
    categorySlug: params.category,
    locationSlug: params.location,
    tipeSlug: params.employmentType,
    gajiMin: range?.min || undefined,
    // SALARY_RANGES uses Infinity for the open-ended top bucket — omit it.
    gajiMax: range && Number.isFinite(range.max) ? range.max : undefined,
    // Asking the API to sort by salary would also drop rows with no salary set,
    // so only switch sort when the user actually filtered on salary.
    sort: range ? ('gaji_tertinggi' as const) : ('terbaru' as const),
  }

  // Kueri multi-kata ("marketing semarang") selalu nol hasil di API karena `q`
  // dicocokkan literal — searchCdcJobs memecahnya dan mencoba bertingkat.
  if (params.keyword?.trim()) {
    const res = await searchCdcJobs({ ...cdcQuery, keyword: params.keyword })
    return {
      jobs: res.jobs,
      total: res.total,
      page: res.page,
      perPage: res.perPage,
      appliedKeyword: res.appliedKeyword,
      appliedLocationName: res.appliedLocationName,
      relaxed: res.relaxed,
    }
  }

  const res = await getCdcJobs(cdcQuery)
  return { jobs: res.jobs, total: res.total, page: res.page, perPage: res.perPage }
}

// Job slugs are "{posisi-slug}-{id_loker}" — recover the id from the tail so a
// detail page is a single row fetch instead of a scan over the whole corpus.
function idFromSlug(slug: string): string | null {
  const m = slug.match(/-(\d+)$/)
  return m ? m[1] : null
}

export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  if (USE_MOCK) return mockJobs.find((j) => j.slug === slug) ?? null
  const id = idFromSlug(slug)
  return id ? getCdcJobById(id) : null
}

export async function fetchJobById(id: string): Promise<Job | null> {
  if (!id) return null
  if (USE_MOCK) return mockJobs.find((j) => j.id === id) ?? null
  return getCdcJobById(id)
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return mockCategories
  return getCdcCategories()
}

export async function fetchLocations(): Promise<Location[]> {
  if (USE_MOCK) return mockLocations
  return getCdcLocations()
}

export async function fetchTipeKerja(): Promise<TipeKerja[]> {
  if (USE_MOCK) return mockTipeKerja
  return getCdcTipeKerja()
}

export async function fetchRelatedJobs(job: Job, limit = 5): Promise<Job[]> {
  if (USE_MOCK) {
    const { jobs } = filterMockJobs(mockJobs, { category: job.categorySlug, perPage: limit + 1 })
    return jobs.filter((j) => j.id !== job.id).slice(0, limit)
  }
  const related = await getCdcRelatedJobs(job.id, limit + 1)
  return related.filter((j) => j.id !== job.id).slice(0, limit)
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
