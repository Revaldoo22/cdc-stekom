import { cache } from 'react'
import { CDC_API_BASE, CDC_KODE, CDC_LOKER_ENDPOINT, LOKER_CURSOR, REVALIDATE_JOBS, REVALIDATE_CATEGORIES } from '@/config/api'
import { slugifyKeyword } from '@/lib/seo-urls'
import { PROVINSI, KABUPATEN } from '@/data/wilayah'
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
  // Newer datalokercdc fields (may be absent on older rows)
  jenis_kerja?: string
  gaji?: string
  deskripsi?: string
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

// The API runs addslashes() + htmlentities() on text fields — sometimes more
// than once, producing "&amp;amp;amp;". Reverse both, decoding entities
// repeatedly until the string stops changing.
function decodeEntitiesOnce(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&') // do & last so it doesn't re-expand the others
}

function clean(v?: string): string {
  if (!v) return ''
  let s = v.replace(/\\(.)/g, '$1')
  for (let i = 0; i < 5; i++) {
    const next = decodeEntitiesOnce(s)
    if (next === s) break
    s = next
  }
  return s.trim()
}

// The deskripsi field contains light Markdown (**bold**, *italic*, blank-line
// paragraphs, - bullet lists). The detail page renders description as HTML via
// dangerouslySetInnerHTML, so convert here. Escape first to stay XSS-safe, then
// apply a small, fixed set of formatting rules.
function mdToHtml(md: string): string {
  const esc = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  const lines = esc.split(/\r?\n/)
  const html: string[] = []
  let para: string[] = []
  let inList = false

  const inline = (s: string) =>
    s
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>')

  const flushPara = () => {
    if (para.length) {
      html.push(`<p>${inline(para.join(' '))}</p>`)
      para = []
    }
  }
  const closeList = () => {
    if (inList) {
      html.push('</ul>')
      inList = false
    }
  }

  for (const raw of lines) {
    const line = raw.trim()
    if (!line) {
      flushPara()
      closeList()
      continue
    }
    const bullet = line.match(/^[-*•]\s+(.*)$/)
    if (bullet) {
      flushPara()
      if (!inList) {
        html.push('<ul>')
        inList = true
      }
      html.push(`<li>${inline(bullet[1])}</li>`)
    } else {
      closeList()
      para.push(line)
    }
  }
  flushPara()
  closeList()
  return html.join('')
}

// Gaji comes as a raw number string ("2000000") or free text. Format pure
// numbers as Rupiah; pass through anything that already has non-digit text.
function formatGaji(v?: string): string | undefined {
  const g = clean(v)
  if (!g) return undefined
  const digits = g.replace(/[.\s]/g, '')
  if (/^\d+$/.test(digits)) {
    return `Rp ${Number(digits).toLocaleString('id-ID')}`
  }
  return g
}

function toSkills(soft: string, hard: string): string[] {
  return [soft, hard]
    .filter(Boolean)
    .flatMap((s) => s.split(','))
    .map((s) => s.trim())
    .filter(Boolean)
}

// Resolve id_prov / id_kab codes to a display name using the bundled region
// tables. Prefer "Kabupaten, Provinsi"; fall back to whichever resolves.
function resolveLocation(idProv: string, idKab: string): { name: string; slug: string } {
  const kab = KABUPATEN[idKab]
  const provName = PROVINSI[idProv] ?? (kab ? PROVINSI[kab.prov] : undefined)
  const name = kab ? (provName ? `${kab.name}, ${provName}` : kab.name) : (provName ?? '')
  // Slug keyed on regency when available, else province — used for /lokasi pages.
  const slugSource = kab?.name ?? provName ?? ''
  return { name, slug: slugSource ? slugifyKeyword(slugSource) : '' }
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
  const posisi = clean(raw.posisi)
  const slugBase = slugifyKeyword(posisi) || 'loker'
  const jenisKerja = clean(raw.jenis_kerja)
  const gaji = formatGaji(raw.gaji)
  const deskripsi = clean(raw.deskripsi)
  const loc = resolveLocation(raw.id_prov, raw.id_kab)
  return {
    id: raw.id_loker,
    slug: `${slugBase}-${raw.id_loker}`,
    title: posisi,
    company: clean(raw.nama_perusahaan),
    // Logo intentionally omitted — the UI shows a building icon instead.
    // Location resolved from id_prov/id_kab via the bundled region tables.
    location: loc.name,
    locationSlug: loc.slug,
    category: cat?.name ?? 'Lainnya',
    categorySlug: cat?.slug ?? 'lainnya',
    employmentType: jenisKerja,
    employmentTypeSlug: jenisKerja ? slugifyKeyword(jenisKerja) : '',
    salary: gaji,
    description: deskripsi ? mdToHtml(deskripsi) : `<p>${DESC_PLACEHOLDER}</p>`,
    requirements: [],
    skills: toSkills(raw.softskill, raw.hardskill),
    applyUrl: applyUrlFrom(raw),
    postedAt: raw.tanggal,
  }
}

// ─── Fetch + map the recent batch (cached per request) ───────────────────────────

export const getCdcJobs = cache(async (): Promise<Job[]> => {
  const [data, catMap] = await Promise.all([
    postForm<{ dx: RawLoker[] }>(
      CDC_LOKER_ENDPOINT,
      // deskripsi=ada → only listings that have a real description (rich + small).
      { idloker: String(LOKER_CURSOR), kode: CDC_KODE, id_prov: '', id_kab: '', deskripsi: 'ada' },
      REVALIDATE_JOBS,
      { dx: [] },
    ),
    getCategoryMap(),
  ])
  return data.dx
    .filter((r) => r.status === '0') // active listings only
    .map((r) => mapLoker(r, catMap.get(r.id_kategori_loker)))
    .sort((a, b) => Number(b.id) - Number(a.id)) // newest first
})
