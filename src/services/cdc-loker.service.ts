import { cache } from 'react'
import { CDC_API_BASE, CDC_KODE, LOKER_CURSOR, REVALIDATE_JOBS, REVALIDATE_CATEGORIES } from '@/config/api'
import { slugifyKeyword } from '@/lib/seo-urls'
import type { Job, Category } from '@/types'

// ─── Raw API shapes ─────────────────────────────────────────────────────────────

interface RawLoker {
  id_loker: string
  id_kategori_loker: string
  nama_perusahaan: string
  posisi: string
  no_telp: string
  email: string
  link_web: string
  pendidikan: string
  img: string
  tanggal: string
  status: string
  softskill: string
  hardskill: string
  id_prov: string
  id_kab: string
}

interface RawKategori {
  id_kategori_loker: string
  kategori_loker_link: string
  kategori_loker: string
  delete_data: string
}

// ─── Placeholders for fields the API does not provide ────────────────────────────

const DESC_PLACEHOLDER =
  'Hubungi perusahaan melalui kontak yang tersedia untuk informasi lengkap mengenai lowongan ini, termasuk deskripsi pekerjaan, gaji, dan persyaratan.'

// ─── Fetch helpers ───────────────────────────────────────────────────────────────

// Browser-like headers — the CDC server returns 403 to requests without them
// (e.g. from Vercel's build/datacenter IPs).
const CDC_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  Referer: 'https://cdc.stekom.ac.id/',
} as const

// The CDC API is occasionally unreachable or rejects build-server requests with
// a 403. We must never let that crash the build: return a safe fallback so the
// page renders (empty) and self-heals on the next revalidation at runtime.
async function postForm<T>(path: string, body: Record<string, string>, revalidate: number, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${CDC_API_BASE}/${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', ...CDC_HEADERS },
      body: new URLSearchParams(body).toString(),
      next: { revalidate },
    })
    if (!res.ok) throw new Error(`CDC ${path} → HTTP ${res.status}`)
    return (await res.json()) as T
  } catch (err) {
    console.error(`[cdc-loker] ${path} failed, using fallback:`, err)
    return fallback
  }
}

async function getJson<T>(path: string, revalidate: number, fallback: T): Promise<T> {
  try {
    const res = await fetch(`${CDC_API_BASE}/${path}`, { next: { revalidate }, headers: CDC_HEADERS })
    if (!res.ok) throw new Error(`CDC ${path} → HTTP ${res.status}`)
    return (await res.json()) as T
  } catch (err) {
    console.error(`[cdc-loker] ${path} failed, using fallback:`, err)
    return fallback
  }
}

// ─── Categories (id → {name, slug}) ──────────────────────────────────────────────

export const getCdcCategories = cache(async (): Promise<Category[]> => {
  const data = await getJson<{ dx: RawKategori[] }>('kategori_loker_harian', REVALIDATE_CATEGORIES, { dx: [] })
  return data.dx
    .filter((c) => c.delete_data === '0')
    .map((c) => ({ slug: c.kategori_loker_link, name: c.kategori_loker.trim(), count: 0 }))
})

const getCategoryMap = cache(async (): Promise<Map<string, { name: string; slug: string }>> => {
  const data = await getJson<{ dx: RawKategori[] }>('kategori_loker_harian', REVALIDATE_CATEGORIES, { dx: [] })
  const map = new Map<string, { name: string; slug: string }>()
  for (const c of data.dx) {
    map.set(c.id_kategori_loker, { name: c.kategori_loker.trim(), slug: c.kategori_loker_link })
  }
  return map
})

// ─── Map a raw loker → Job ───────────────────────────────────────────────────────

function toSkills(soft: string, hard: string): string[] {
  return [soft, hard]
    .filter(Boolean)
    .flatMap((s) => s.split(','))
    .map((s) => s.trim())
    .filter(Boolean)
}

function applyUrlFrom(raw: RawLoker): string | undefined {
  if (raw.link_web) return raw.link_web.startsWith('http') ? raw.link_web : `https://${raw.link_web}`
  if (raw.no_telp) {
    const digits = raw.no_telp.replace(/[^\d]/g, '').replace(/^0/, '62')
    return `https://wa.me/${digits}`
  }
  return undefined
}

function mapLoker(raw: RawLoker, cat?: { name: string; slug: string }): Job {
  const slugBase = slugifyKeyword(raw.posisi) || 'loker'
  return {
    id: raw.id_loker,
    slug: `${slugBase}-${raw.id_loker}`,
    title: raw.posisi.trim(),
    company: raw.nama_perusahaan.trim(),
    // Logo intentionally omitted — the UI shows a building icon instead.
    // Location names are not exposed by the API (only id_prov/id_kab codes),
    // so leave location blank rather than show a meaningless number.
    location: '',
    locationSlug: '',
    category: cat?.name ?? 'Lainnya',
    categorySlug: cat?.slug ?? 'lainnya',
    // js_loker is a numeric code with no name endpoint → omit employment type.
    employmentType: '',
    employmentTypeSlug: '',
    // No salary / requirements / experience fields in the API → placeholder.
    description: DESC_PLACEHOLDER,
    requirements: [],
    skills: toSkills(raw.softskill, raw.hardskill),
    applyUrl: applyUrlFrom(raw),
    postedAt: raw.tanggal,
  }
}

// ─── Fetch + map the recent batch (cached per request) ───────────────────────────

export const getCdcJobs = cache(async (): Promise<Job[]> => {
  const [data, catMap] = await Promise.all([
    postForm<{ dx: RawLoker[] }>('dataloker', { idloker: String(LOKER_CURSOR), kode: CDC_KODE }, REVALIDATE_JOBS, { dx: [] }),
    getCategoryMap(),
  ])
  return data.dx
    .filter((r) => r.status === '0') // active listings only
    .map((r) => mapLoker(r, catMap.get(r.id_kategori_loker)))
    .sort((a, b) => Number(b.id) - Number(a.id)) // newest first
})
