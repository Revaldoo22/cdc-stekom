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
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
