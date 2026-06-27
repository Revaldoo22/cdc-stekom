import { USE_MOCK, PER_PAGE } from '@/config/api'
import { SALARY_RANGES } from '@/config/filters'
import type { Job, JobsResponse, JobsParams, Category, Location, TipeKerja } from '@/types'
import { getCdcJobs, getCdcCategories } from './cdc-loker.service'
import {
  mockJobs,
  mockCategories,
  mockLocations,
  mockTipeKerja,
} from '@/mocks/jobs'

function parseSalaryMin(salary?: string): number {
  if (!salary) return 0
  const match = salary.match(/[\d.]+/)
  if (!match) return 0
  return parseInt(match[0].replace(/\./g, ''), 10)
}

// The CDC API has no server-side filtering, so we filter/paginate the fetched
// batch here — the same logic that drives the mock data.
function filterJobs(jobs: Job[], params: JobsParams): JobsResponse {
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
  if (params.salaryRange) {
    const range = SALARY_RANGES.find((r) => r.slug === params.salaryRange)
    if (range) {
      filtered = filtered.filter((j) => {
        const min = parseSalaryMin(j.salary)
        return min >= range.min && min < range.max
      })
    }
  }
  if (params.experienceLevel) {
    filtered = filtered.filter((j) => j.experienceLevel === params.experienceLevel)
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

async function allJobs(): Promise<Job[]> {
  return USE_MOCK ? mockJobs : getCdcJobs()
}

export async function fetchJobs(params: JobsParams = {}): Promise<JobsResponse> {
  return filterJobs(await allJobs(), params)
}

export async function fetchJobBySlug(slug: string): Promise<Job | null> {
  const jobs = await allJobs()
  return jobs.find((j) => j.slug === slug) ?? null
}

// Resolve a single job by id from the full batch — used for ?jobId= deep links,
// where the selected job may not be on the current page's slice.
export async function fetchJobById(id: string): Promise<Job | null> {
  if (!id) return null
  const jobs = await allJobs()
  return jobs.find((j) => j.id === id) ?? null
}

export async function fetchCategories(): Promise<Category[]> {
  if (USE_MOCK) return mockCategories
  // Show only categories that actually have jobs in the current batch, with counts.
  const [cats, jobs] = await Promise.all([getCdcCategories(), getCdcJobs()])
  const counts = new Map<string, number>()
  for (const j of jobs) counts.set(j.categorySlug, (counts.get(j.categorySlug) ?? 0) + 1)
  return cats
    .map((c) => ({ ...c, count: counts.get(c.slug) ?? 0 }))
    .filter((c) => c.count > 0)
    .sort((a, b) => b.count - a.count)
}

// Build a {slug,name,count} list from whatever values the current job batch
// actually has — keeps dropdowns in sync with real data, biggest first.
function deriveFacet(jobs: Job[], slugOf: (j: Job) => string, nameOf: (j: Job) => string) {
  const map = new Map<string, { name: string; count: number }>()
  for (const j of jobs) {
    const slug = slugOf(j)
    const name = nameOf(j)
    if (!slug || !name) continue
    const e = map.get(slug)
    if (e) e.count++
    else map.set(slug, { name, count: 1 })
  }
  return [...map.entries()]
    .map(([slug, { name, count }]) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count)
}

export async function fetchLocations(): Promise<Location[]> {
  if (USE_MOCK) return mockLocations
  const jobs = await getCdcJobs()
  return deriveFacet(jobs, (j) => j.locationSlug, (j) => j.location)
}

export async function fetchTipeKerja(): Promise<TipeKerja[]> {
  if (USE_MOCK) return mockTipeKerja
  const jobs = await getCdcJobs()
  return deriveFacet(jobs, (j) => j.employmentTypeSlug, (j) => j.employmentType)
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
