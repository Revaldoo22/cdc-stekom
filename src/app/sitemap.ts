import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/api'
import { fetchJobs, fetchCategories, fetchLocations, fetchTipeKerja } from '@/services/jobs.service'
import { fetchEvents } from '@/services/events.service'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date()

  const [{ jobs }, categories, locations, tipeKerja, events] = await Promise.all([
    fetchJobs({ perPage: 500 }),
    fetchCategories(),
    fetchLocations(),
    fetchTipeKerja(),
    fetchEvents(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'daily', priority: 1.0 },
    { url: `${SITE_URL}/loker`, lastModified: now, changeFrequency: 'hourly', priority: 0.9 },
    { url: `${SITE_URL}/event`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/event/vjf`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/event/offline-recruitment`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
  ]

  const jobRoutes: MetadataRoute.Sitemap = jobs
    .filter((j) => !j.expiresAt || new Date(j.expiresAt) > now)
    .map((j) => ({
      url: `${SITE_URL}/job/${j.slug}`,
      lastModified: new Date(j.postedAt),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  const categoryRoutes: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE_URL}/kategori/${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const locationRoutes: MetadataRoute.Sitemap = locations.map((l) => ({
    url: `${SITE_URL}/daerah/${l.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const tipeRoutes: MetadataRoute.Sitemap = tipeKerja.map((t) => ({
    url: `${SITE_URL}/tipe-pekerjaan/${t.slug}`,
    lastModified: now,
    changeFrequency: 'daily' as const,
    priority: 0.7,
  }))

  const eventRoutes: MetadataRoute.Sitemap = events.map((e) => ({
    url: `${SITE_URL}/event/${e.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.75,
  }))

  return [...staticRoutes, ...jobRoutes, ...categoryRoutes, ...locationRoutes, ...tipeRoutes, ...eventRoutes]
}
