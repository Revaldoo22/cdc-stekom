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

async function postForm<T>(path: string, body: Record<string, string>, revalidate: number): Promise<T> {
  const res = await fetch(`${CDC_API_BASE}/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
    next: { revalidate },
  })
  if (!res.ok) throw new Error(`CDC ${path} → HTTP ${res.status}`)
  return res.json() as Promise<T>
}

async function getJson<T>(path: string, revalidate: number): Promise<T> {
  const res = await fetch(`${CDC_API_BASE}/${path}`, { next: { revalidate } })
  if (!res.ok) throw new Error(`CDC ${path} → HTTP ${res.status}`)
  return res.json() as Promise<T>
}

// ─── Categories (id → {name, slug}) ──────────────────────────────────────────────

export const getCdcCategories = cache(async (): Promise<Category[]> => {
  const data = await getJson<{ dx: RawKategori[] }>('kategori_loker_harian', REVALIDATE_CATEGORIES)
  return data.dx
    .filter((c) => c.delete_data === '0')
    .map((c) => ({ slug: c.kategori_loker_link, name: c.kategori_loker.trim(), count: 0 }))
})

const getCategoryMap = cache(async (): Promise<Map<string, { name: string; slug: string }>> => {
  const data = await getJson<{ dx: RawKategori[] }>('kategori_loker_harian', REVALIDATE_CATEGORIES)
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
    postForm<{ dx: RawLoker[] }>('dataloker', { idloker: String(LOKER_CURSOR), kode: CDC_KODE }, REVALIDATE_JOBS),
    getCategoryMap(),
  ])
  return data.dx
    .filter((r) => r.status === '0') // active listings only
    .map((r) => mapLoker(r, catMap.get(r.id_kategori_loker)))
    .sort((a, b) => Number(b.id) - Number(a.id)) // newest first
})
