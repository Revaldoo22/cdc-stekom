import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/config/api'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/loker', '/job/', '/kategori/', '/daerah/', '/tipe-pekerjaan/', '/event/'],
        disallow: ['/api/', '/*?*'],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
