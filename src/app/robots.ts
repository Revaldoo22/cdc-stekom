import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/api'
import { SITEMAP_IDS } from './sitemap'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/'],
        disallow: [
          '/api/',
          '/search',
          '/*?page=',
          '/*?sort=',
          '/*?salary=',
          '/*?experience=',
          '/*?keyword=',
          '/*?category=',
          '/*?location=',
          '/*?tipe=',
        ],
      },
    ],
    // generateSitemaps() produces segmented sitemaps at /sitemap/[id].xml — there
    // is no /sitemap.xml index route, so list each segment explicitly. The ids
    // come from the sitemap route itself; a hardcoded list here silently went
    // stale when the job corpus was sharded across 20 segments.
    sitemap: SITEMAP_IDS.map((id) => `${SITE_URL}/sitemap/${id}.xml`),
  }
}
