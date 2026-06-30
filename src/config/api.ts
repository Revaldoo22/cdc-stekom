export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? ''
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://cdc.stekom.ac.id'
export const GOOGLE_SHEET_WEBHOOK = process.env.GOOGLE_SHEET_WEBHOOK_URL ?? ''

export const REVALIDATE_JOBS = 3600
export const REVALIDATE_CATEGORIES = 86400
export const REVALIDATE_EVENTS = 3600

export const PER_PAGE = 12
export const RELATED_JOBS_COUNT = 5

// ─── CDC Stekom loker API ──────────────────────────────────────────────────────
// The dataloker endpoint is cursor-based: it returns every job with
// id_loker > LOKER_CURSOR (no limit param). A low cursor returns hundreds of
// thousands of rows and crashes the server, so we keep the cursor high to pull
// only a recent batch. Bump LOKER_CURSOR down to widen the window.
export const CDC_API_BASE = 'https://cdc.stekom.ac.id/curl_loker'
// Loker list endpoint. `datalokercdc` returns jenis_kerja, gaji, deskripsi and
// supports a `deskripsi=ada` filter that returns only listings with a real
// description (small, rich result set). That's our source of truth.
export const CDC_LOKER_ENDPOINT = process.env.CDC_LOKER_ENDPOINT ?? 'datalokercdc'
export const CDC_KODE = process.env.CDC_LOKER_KODE ?? 'klashdioasfiosabiobhioobd873546769743663769736463769'
export const LOKER_CURSOR = Number(process.env.CDC_LOKER_CURSOR ?? 1812879) // ~60 most-recent jobs

// ─── Virtual Job Fair API (TopLoker) ─────────────────────────────────────────
// Returns all VJF batches. Note: different host + different key than the loker API.
export const VJF_API_URL = 'https://toploker.com/curl/virtual_jobfair'
export const VJF_KEY = process.env.VJF_API_KEY ?? 'klashdioasfiosabiobh231rd873546769743663769736463769'

// Use the real CDC API unless explicitly forced to mock
export const USE_MOCK = process.env.USE_MOCK === 'true'
