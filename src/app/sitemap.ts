import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/api'
import { fetchJobs, fetchCategories, fetchLocations, fetchTipeKerja } from '@/services/jobs.service'
import { fetchEvents } from '@/services/events.service'
import { seoUrl } from '@/lib/seo-urls'

// 0 = static, 1 = jobs, 2 = taxonomy (categories/locations/types/combined), 3 = events
export async function generateSitemaps() {
  return [{ id: 0 }, { id: 1 }, { id: 2 }, { id: 3 }]
}

export default async function sitemap({ id }: { id: number }): Promise<MetadataRoute.Sitemap> {
  const now = new Date()
  const sid = Number(id) // Next may pass the id as a string ("0"); normalise to number

  if (sid === 0) {
    return [
      { url: SITE_URL,                                   lastModified: now, changeFrequency: 'daily',  priority: 1.0 },
      { url: `${SITE_URL}/loker`,                        lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
      { url: `${SITE_URL}/event`,                        lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/event/vjf`,                    lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
      { url: `${SITE_URL}/event/offline-recruitment`,    lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    ]
  }

  if (sid === 1) {
    const { jobs } = await fetchJobs({ perPage: 500 })
    return jobs
      .filter((j) => !j.expiresAt || new Date(j.expiresAt) > now)
      .map((j) => ({
        url: `${SITE_URL}/job/${j.slug}`,
        lastModified: new Date(j.postedAt),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
  }

  if (sid === 2) {
    const [{ jobs }, categories, locations, tipeKerja] = await Promise.all([
      fetchJobs({ perPage: 500 }),
      fetchCategories(),
      fetchLocations(),
      fetchTipeKerja(),
    ])
    const activeJobs = jobs.filter((j) => !j.expiresAt || new Date(j.expiresAt) > now)

    const categoryRoutes: MetadataRoute.Sitemap = categories
      .filter((c) => activeJobs.some((j) => j.categorySlug === c.slug))
      .map((c) => ({ url: `${SITE_URL}${seoUrl.category(c.slug)}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 }))

    const locationRoutes: MetadataRoute.Sitemap = locations
      .filter((l) => activeJobs.some((j) => j.locationSlug === l.slug))
      .map((l) => ({ url: `${SITE_URL}${seoUrl.location(l.slug)}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 }))

    const tipeRoutes: MetadataRoute.Sitemap = tipeKerja
      .filter((t) => activeJobs.some((j) => j.employmentTypeSlug === t.slug))
      .map((t) => ({ url: `${SITE_URL}${seoUrl.employmentType(t.slug)}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7 }))

    const combinedRoutes: MetadataRoute.Sitemap = []
    for (const cat of categories) {
      for (const loc of locations) {
        if (activeJobs.some((j) => j.categorySlug === cat.slug && j.locationSlug === loc.slug)) {
          combinedRoutes.push({ url: `${SITE_URL}${seoUrl.combined(cat.slug, loc.slug)}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.65 })
        }
      }
    }

    return [...categoryRoutes, ...locationRoutes, ...tipeRoutes, ...combinedRoutes]
  }

  if (sid === 3) {
    const events = await fetchEvents()
    return events.map((e) => ({
      url: `${SITE_URL}/event/${e.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.75,
    }))
  }

  return []
}
