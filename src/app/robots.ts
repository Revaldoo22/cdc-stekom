import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/api'

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
    // is no /sitemap.xml index route, so list each segment explicitly.
    // 0=static, 1=jobs, 2=taxonomy, 3=events
    sitemap: [0, 1, 2, 3].map((id) => `${SITE_URL}/sitemap/${id}.xml`),
  }
}
