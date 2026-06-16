export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cdc.stekom.ac.id'
export const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK_URL ?? ''

export const REVALIDATE_JOBS = 3600
export const REVALIDATE_CATEGORIES = 86400
export const REVALIDATE_EVENTS = 3600

export const PER_PAGE = 12
export const RELATED_JOBS_COUNT = 5

// Set USE_MOCK=true in .env.local to use mock data
export const USE_MOCK =
  process.env.USE_MOCK === 'true' || !process.env.NEXT_PUBLIC_API_URL
