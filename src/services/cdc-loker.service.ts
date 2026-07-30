import { cache } from 'react'
import {
  CDC_API_BASE,
  getCdcApiKey,
  CDC_MAX_PER_PAGE,
  REVALIDATE_JOBS,
  REVALIDATE_CATEGORIES,
} from '@/config/api'
import { slugifyKeyword } from '@/lib/seo-urls'
import type { Job, Category, Location, TipeKerja } from '@/types'

// ─── Raw API shapes ─────────────────────────────────────────────────────────────

interface RawLoker {
  id_loker: string
  id_kategori_loker: string
  id_prov: string
  id_kab: string
  nama_perusahaan: string
  posisi: string
  no_telp: string
  email: string
  link_web: string
  pendidikan: string
  disabilitas: string
  softskill: string
  hardskill: string
  persyaratan: string | null
  pengalaman: string | null
  jenis_kerja: string | null
  gaji: string | null
  gaji_max: string | null
  deskripsi: string | null
  img: string | null
  tanggal: string
  tanggal_kadaluarsa: string | null
  updated_at: string | null
  status: string
  // Joined display names — new in the v1 API, saves a client-side lookup table.
  kategori_loker: string | null
  nama_prov: string | null
  nama_kab: string | null
}

interface Meta {
  total: number
  page: number
  per_page: number
  total_pages: number
}

interface Paged<T> {
  data: T[]
  meta: Meta
}

interface RawKategori {
  id_kategori_loker: string
  kategori_loker: string
  kategori_loker_link: string
  jumlah_loker: number
}

interface RawWilayah {
  id_prov: string
  nama: string
  kabupaten: { id_kab: string; nama: string; jumlah_loker: number }[]
}

interface RawJenisKerja {
  jenis_kerja: string
  jumlah_loker: number
}

export interface SitemapEntry {
  id_loker: string
  posisi: string
  tanggal: string
  updated_at: string | null
}

// ─── Placeholders for fields the API does not provide ────────────────────────────

const DESC_PLACEHOLDER =
  'Hubungi perusahaan melalui kontak yang tersedia untuk informasi lengkap mengenai lowongan ini, termasuk deskripsi pekerjaan, gaji, dan persyaratan.'

// ─── Fetch helper ────────────────────────────────────────────────────────────────

const EMPTY_META: Meta = { total: 0, page: 1, per_page: 0, total_pages: 0 }

// BLOCKER: the origin returns 403 to Vercel's IPs regardless of these headers.
//
// Measured from a residential IP, every variant returns 200 — with or without a
// User-Agent, with or without an Origin header. An invalid key returns 401 with
// a JSON body from the PHP app, and no key returns 401 too, so the API's own auth
// never emits 403. Vercel gets 403 on *both* cdc.stekom.ac.id and toploker.com
// (different hosts, different keys, identical failure), which only an IP-based
// block explains.
//
// These headers therefore do NOT fix the deploy; they are kept because they cost
// nothing and are required if the block is later narrowed to a UA check. The real
// fix is server-side: the backend must allowlist the deployment egress IPs or
// trust X-API-Key alone (API-REQUIREMENTS.md §0.4).
const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36',
  Accept: 'application/json, text/plain, */*',
  'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
  Referer: 'https://cdc.stekom.ac.id/',
} as const

// Tracks whether any request has ever succeeded. If a whole build runs without a
// single success, the fallbacks would bake an empty site into static HTML and
// still exit 0 — so `assertApiReachable()` turns that into a failed build.
let anySuccess = false
let lastFailure = ''

async function attempt(url: string, apiKey: string, revalidate: number): Promise<Response> {
  const res = await fetch(url, {
    headers: { ...BROWSER_HEADERS, 'X-API-Key': apiKey },
    next: { revalidate },
    signal: AbortSignal.timeout(30_000),
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res
}

// Every endpoint is GET + X-API-Key. A failure must never crash a live page:
// return the caller's fallback so the page renders and self-heals on the next
// revalidation. Build-time totals are policed by assertApiReachable() instead.
async function getJson<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  revalidate: number,
  fallback: T,
): Promise<T> {
  const qs = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') qs.set(k, String(v))
  }
  const url = `${CDC_API_BASE}/${path}${qs.toString() ? `?${qs}` : ''}`

  // Resolve the key outside the try: a misconfigured environment must surface as
  // a hard error, not get swallowed by the network fallback below and quietly
  // render every page empty.
  const apiKey = getCdcApiKey()

  // One retry: the Cloudflare edge in front of the origin rejects some requests
  // intermittently, and a single 403 should not blank a whole page.
  for (let i = 0; i < 2; i++) {
    try {
      const res = await attempt(url, apiKey, revalidate)
      anySuccess = true
      return (await res.json()) as T
    } catch (err) {
      lastFailure = `${path} → ${err instanceof Error ? err.message : String(err)}`
      if (i === 0) continue
      console.error(`[cdc-loker] ${lastFailure}, using fallback`)
    }
  }
  return fallback
}

/**
 * Fail the build when the API was never reachable. Without this the fallbacks
 * make a total outage look like a clean build: `next build` exits 0 and ships
 * static pages with zero jobs, an empty sitemap and mock events.
 */
export function assertApiReachable(): void {
  if (anySuccess) return
  throw new Error(
    `CDC API unreachable during build — every request failed (last: ${lastFailure || 'none attempted'}).\n` +
      `A 403 here means the origin is blocking this IP rather than rejecting the key ` +
      `(a bad key returns 401). Refusing to publish an empty site.`,
  )
}

// ─── Text cleanup ────────────────────────────────────────────────────────────────

// The API still runs addslashes() + htmlentities() on text fields — sometimes
// more than once, producing "&amp;amp;amp;". Reverse both, decoding entities
// repeatedly until the string stops changing.
// TODO: remove once the backend stops double-encoding (see API-REQUIREMENTS.md §0.2).
function decodeEntitiesOnce(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&') // do & last so it doesn't re-expand the others
}

function clean(v?: string | null): string {
  if (!v) return ''
  let s = v.replace(/\\(.)/g, '$1')
  for (let i = 0; i < 5; i++) {
    const next = decodeEntitiesOnce(s)
    if (next === s) break
    s = next
  }
  s = s.trim()
  // Backend sometimes stores the literal string "null"/"undefined" — treat as empty.
  if (s === 'null' || s === 'undefined') return ''
  return s
}

// Region names arrive ALL CAPS ("KAB. ACEH SELATAN"). Expand the abbreviation and
// title-case for display; slugs are derived from the same normalised string so
// they stay stable regardless of how the backend cases its data.
const LOWER_WORDS = new Set(['dan', 'ke', 'dari'])
// Region acronyms that must stay upper-case rather than being title-cased into
// "Dki Jakarta" / "Di Yogyakarta".
const ACRONYMS = new Set(['DKI', 'DI', 'NTB', 'NTT', 'DIY'])

function titleCase(s: string): string {
  return s
    .split(/\s+/)
    .map((word, i) => {
      const upper = word.toUpperCase()
      if (ACRONYMS.has(upper)) return upper
      const lower = word.toLowerCase()
      if (i > 0 && LOWER_WORDS.has(lower)) return lower
      // Capitalise after a separator too: "kota-x" → "Kota-X".
      return lower.replace(/(^|[-(/])([a-z])/g, (_, p, c: string) => p + c.toUpperCase())
    })
    .join(' ')
}

function normalizeRegionName(s: string): string {
  const t = clean(s).replace(/^KAB\.\s*/i, 'Kabupaten ').replace(/\s+/g, ' ')
  return titleCase(t)
}

// ─── Markdown → HTML ─────────────────────────────────────────────────────────────

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

// ─── Field mapping ───────────────────────────────────────────────────────────────

function formatRupiah(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`
}

// Gaji comes as a raw number string ("2000000") or free text. The API now also
// exposes gaji_max, so render a range when both ends are present.
function formatGaji(min?: string | null, max?: string | null): string | undefined {
  const lo = clean(min)
  const hi = clean(max)
  const num = (v: string) => {
    const digits = v.replace(/[.\s]/g, '')
    return /^\d+$/.test(digits) ? Number(digits) : null
  }
  const loN = lo ? num(lo) : null
  const hiN = hi ? num(hi) : null

  if (loN !== null && hiN !== null && hiN > loN) return `${formatRupiah(loN)} - ${formatRupiah(hiN)}`
  if (loN !== null) return formatRupiah(loN)
  if (hiN !== null) return formatRupiah(hiN)
  // Non-numeric free text ("UMK Semarang") — pass through whichever end has it.
  return lo || hi || undefined
}

function splitList(v?: string | null): string[] {
  return clean(v)
    .split(/[,\n•]/)
    .map((s) => clean(s))
    .filter(Boolean)
}

function toSkills(soft?: string | null, hard?: string | null): string[] {
  return [...splitList(soft), ...splitList(hard)]
}

// A location is the regency when the row carries a real one, else the province.
// ~46% of listings are province-level only (id_kab === id_prov), so falling back
// keeps them visible instead of dropping half the corpus.
function resolveLocation(raw: RawLoker): { name: string; slug: string } {
  const prov = raw.nama_prov ? normalizeRegionName(raw.nama_prov) : ''
  const kabRaw = raw.nama_kab ? normalizeRegionName(raw.nama_kab) : ''
  const isProvinceLevel = raw.id_kab === raw.id_prov || kabRaw.toLowerCase() === prov.toLowerCase()

  if (!isProvinceLevel && kabRaw) {
    return { name: prov ? `${kabRaw}, ${prov}` : kabRaw, slug: slugifyKeyword(kabRaw) }
  }
  return { name: prov, slug: prov ? slugifyKeyword(prov) : '' }
}

// link_web is frequently a phone number or bare email rather than a URL — the
// backend reuses the column. Only treat it as a link when it really looks like one.
function applyUrlFrom(raw: RawLoker): string | undefined {
  const web = clean(raw.link_web)
  const looksLikeUrl = /^(https?:\/\/|www\.)/i.test(web) || /^[\w-]+(\.[\w-]+)+(\/|$)/.test(web)
  const isEmailish = web.includes('@')

  if (web && looksLikeUrl && !isEmailish) {
    return web.startsWith('http') ? web : `https://${web}`
  }

  const phone = clean(raw.no_telp)
  if (phone) {
    const digits = phone.replace(/[^\d]/g, '').replace(/^0/, '62')
    if (digits.length >= 9) return `https://wa.me/${digits}`
  }

  const email = clean(raw.email)
  if (email.includes('@')) return `mailto:${email}`
  return undefined
}

function mapLoker(raw: RawLoker): Job {
  const posisi = clean(raw.posisi)
  const slugBase = slugifyKeyword(posisi) || 'loker'
  const jenisKerja = clean(raw.jenis_kerja)
  const deskripsi = clean(raw.deskripsi)
  const kategori = clean(raw.kategori_loker)
  const loc = resolveLocation(raw)
  const img = clean(raw.img)

  return {
    id: raw.id_loker,
    slug: `${slugBase}-${raw.id_loker}`,
    title: posisi,
    company: clean(raw.nama_perusahaan),
    // img is an absolute URL in the v1 API, so real logos can render now.
    companyLogo: img.startsWith('http') ? img : undefined,
    location: loc.name,
    locationSlug: loc.slug,
    category: kategori || 'Lainnya',
    categorySlug: kategori ? slugifyKeyword(kategori) : 'lainnya',
    employmentType: jenisKerja,
    employmentTypeSlug: jenisKerja ? slugifyKeyword(jenisKerja) : '',
    salary: formatGaji(raw.gaji, raw.gaji_max),
    education: clean(raw.pendidikan) || undefined,
    disabilityFriendly: raw.disabilitas === '1',
    description: deskripsi ? mdToHtml(deskripsi) : `<p>${DESC_PLACEHOLDER}</p>`,
    requirements: splitList(raw.persyaratan),
    skills: toSkills(raw.softskill, raw.hardskill),
    applyUrl: applyUrlFrom(raw),
    postedAt: raw.tanggal,
    expiresAt: clean(raw.tanggal_kadaluarsa) || undefined,
  }
}

// ─── Taxonomy ────────────────────────────────────────────────────────────────────

export const getCdcCategories = cache(async (): Promise<Category[]> => {
  const res = await getJson<{ data: RawKategori[] }>('kategori-loker', {}, REVALIDATE_CATEGORIES, {
    data: [],
  })
  return res.data
    .map((c) => ({
      slug: slugifyKeyword(clean(c.kategori_loker)),
      name: clean(c.kategori_loker),
      count: c.jumlah_loker ?? 0,
    }))
    .filter((c) => c.slug && c.name)
    .sort((a, b) => b.count - a.count)
})

// slug → id_kategori_loker, so a /jobs-in-{slug} route can filter server-side.
const getCategoryIdBySlug = cache(async (): Promise<Map<string, string>> => {
  const res = await getJson<{ data: RawKategori[] }>('kategori-loker', {}, REVALIDATE_CATEGORIES, {
    data: [],
  })
  const map = new Map<string, string>()
  for (const c of res.data) {
    const slug = slugifyKeyword(clean(c.kategori_loker))
    if (slug) map.set(slug, c.id_kategori_loker)
  }
  return map
})

// A location slug may refer to either a regency or a province — resolveLocation
// falls back to the province name for province-level rows, so both must resolve.
interface LocationRef {
  slug: string
  name: string
  count: number
  id_prov?: string
  id_kab?: string
}

const getWilayah = cache(async (): Promise<LocationRef[]> => {
  const res = await getJson<{ data: RawWilayah[] }>('wilayah', {}, REVALIDATE_CATEGORIES, { data: [] })
  const out: LocationRef[] = []

  for (const prov of res.data) {
    const provName = normalizeRegionName(prov.nama)
    const provSlug = slugifyKeyword(provName)
    // The province's own bucket: rows whose id_kab mirrors id_prov.
    const provinceLevel = prov.kabupaten.find((k) => k.id_kab === prov.id_prov)

    if (provSlug) {
      out.push({
        slug: provSlug,
        name: provName,
        count: provinceLevel?.jumlah_loker ?? 0,
        id_prov: prov.id_prov,
      })
    }

    for (const kab of prov.kabupaten) {
      if (kab.id_kab === prov.id_prov) continue // already counted as the province
      const kabName = normalizeRegionName(kab.nama)
      const kabSlug = slugifyKeyword(kabName)
      if (!kabSlug || kabSlug === provSlug) continue
      out.push({
        slug: kabSlug,
        name: provName ? `${kabName}, ${provName}` : kabName,
        count: kab.jumlah_loker ?? 0,
        id_kab: kab.id_kab,
        id_prov: prov.id_prov,
      })
    }
  }
  return out
})

export const getCdcLocations = cache(async (): Promise<Location[]> => {
  const all = await getWilayah()
  return all
    .filter((l) => l.count > 0)
    .map(({ slug, name, count }) => ({ slug, name, count }))
    .sort((a, b) => b.count - a.count)
})

const getLocationRefBySlug = cache(async (): Promise<Map<string, LocationRef>> => {
  const all = await getWilayah()
  const map = new Map<string, LocationRef>()
  for (const l of all) {
    // Keep the busiest entry when two regions normalise to the same slug.
    const prev = map.get(l.slug)
    if (!prev || l.count > prev.count) map.set(l.slug, l)
  }
  return map
})

// jenis_kerja is dirty free text (33 variants incl. the literal "null" and
// casing/spacing dupes). Group by slug so "Full-time"/"Full Time"/"Fulltime"
// collapse into one facet, and keep every raw spelling for server-side filtering.
interface TipeRef {
  slug: string
  name: string
  count: number
  raw: string[]
}

const getJenisKerja = cache(async (): Promise<TipeRef[]> => {
  const res = await getJson<{ data: RawJenisKerja[] }>('jenis-kerja', {}, REVALIDATE_CATEGORIES, {
    data: [],
  })
  const map = new Map<string, TipeRef>()

  for (const j of res.data) {
    const name = clean(j.jenis_kerja)
    if (!name) continue
    // Normalise separators so "Full-time"/"Full Time"/"Fulltime" share a slug.
    const slug = slugifyKeyword(name.replace(/[\s-]+/g, ' '))
    if (!slug) continue
    const entry = map.get(slug)
    if (entry) {
      entry.count += j.jumlah_loker ?? 0
      entry.raw.push(j.jenis_kerja)
    } else {
      map.set(slug, { slug, name, count: j.jumlah_loker ?? 0, raw: [j.jenis_kerja] })
    }
  }
  return [...map.values()].sort((a, b) => b.count - a.count)
})

export const getCdcTipeKerja = cache(async (): Promise<TipeKerja[]> => {
  const all = await getJenisKerja()
  return all.filter((t) => t.count > 0).map(({ slug, name, count }) => ({ slug, name, count }))
})

// ─── Loker queries ───────────────────────────────────────────────────────────────

export interface CdcJobsQuery {
  page?: number
  perPage?: number
  keyword?: string
  categorySlug?: string
  locationSlug?: string
  tipeSlug?: string
  gajiMin?: number
  gajiMax?: number
  pendidikan?: string
  disabilitas?: boolean
  sort?: 'terbaru' | 'gaji_tertinggi'
}

export interface CdcJobsResult {
  jobs: Job[]
  total: number
  page: number
  perPage: number
}

/**
 * Server-side list. Taxonomy slugs are resolved to the numeric ids the API
 * expects; an unknown slug yields an empty result rather than silently
 * returning unfiltered data.
 */
export async function getCdcJobs(query: CdcJobsQuery = {}): Promise<CdcJobsResult> {
  const page = Math.max(1, query.page ?? 1)
  const perPage = Math.min(query.perPage ?? 20, CDC_MAX_PER_PAGE)

  const [catIds, locRefs, tipeRefs] = await Promise.all([
    query.categorySlug ? getCategoryIdBySlug() : Promise.resolve(null),
    query.locationSlug ? getLocationRefBySlug() : Promise.resolve(null),
    query.tipeSlug ? getJenisKerja() : Promise.resolve(null),
  ])

  const empty: CdcJobsResult = { jobs: [], total: 0, page, perPage }

  let idKategori: string | undefined
  if (query.categorySlug) {
    idKategori = catIds?.get(query.categorySlug)
    if (!idKategori) return empty
  }

  let idProv: string | undefined
  let idKab: string | undefined
  if (query.locationSlug) {
    const ref = locRefs?.get(query.locationSlug)
    if (!ref) return empty
    idKab = ref.id_kab
    // Province-level slug: filter by province only so both province-tagged and
    // regency-tagged rows in that province are included.
    if (!idKab) idProv = ref.id_prov
  }

  let jenisKerja: string | undefined
  if (query.tipeSlug) {
    const ref = tipeRefs?.find((t) => t.slug === query.tipeSlug)
    if (!ref) return empty
    // The API matches one exact string; use the most common raw spelling.
    jenisKerja = ref.raw[0]
  }

  const res = await getJson<Paged<RawLoker>>(
    'loker',
    {
      page,
      per_page: perPage,
      q: query.keyword,
      id_kategori_loker: idKategori,
      id_prov: idProv,
      id_kab: idKab,
      jenis_kerja: jenisKerja,
      gaji_min: query.gajiMin,
      gaji_max: query.gajiMax,
      pendidikan: query.pendidikan,
      disabilitas: query.disabilitas ? 1 : undefined,
      sort: query.sort,
    },
    REVALIDATE_JOBS,
    { data: [], meta: { ...EMPTY_META, page, per_page: perPage } },
  )

  return {
    jobs: (res.data ?? []).map(mapLoker),
    total: res.meta?.total ?? 0,
    page: res.meta?.page ?? page,
    perPage: res.meta?.per_page ?? perPage,
  }
}

/** Detail by numeric id — one row, no scanning. */
export const getCdcJobById = cache(async (id: string): Promise<Job | null> => {
  if (!/^\d+$/.test(id)) return null
  const res = await getJson<{ data: RawLoker | null }>(
    `loker/${id}`,
    {},
    REVALIDATE_JOBS,
    { data: null },
  )
  return res.data ? mapLoker(res.data) : null
})

/** Related jobs (same category & province), computed by the backend. */
export const getCdcRelatedJobs = cache(async (id: string, limit = 6): Promise<Job[]> => {
  if (!/^\d+$/.test(id)) return []
  const res = await getJson<{ data: RawLoker[] }>(
    `loker/${id}/terkait`,
    { limit: Math.min(limit, 20) },
    REVALIDATE_JOBS,
    { data: [] },
  )
  return (res.data ?? []).map(mapLoker)
})

/** Lightweight feed for sitemap generation — 4 fields per row. */
export async function getCdcSitemapEntries(
  page = 1,
  perPage = 5000,
  updatedSince?: string,
): Promise<{ entries: SitemapEntry[]; total: number; totalPages: number }> {
  const res = await getJson<Paged<SitemapEntry>>(
    'loker/sitemap',
    { page, per_page: perPage, updated_since: updatedSince },
    REVALIDATE_JOBS,
    { data: [], meta: EMPTY_META },
  )
  return {
    entries: res.data ?? [],
    total: res.meta?.total ?? 0,
    totalPages: res.meta?.total_pages ?? 0,
  }
}

/** Build the canonical /job/{slug} path for a sitemap row. */
export function sitemapSlug(e: SitemapEntry): string {
  return `${slugifyKeyword(clean(e.posisi)) || 'loker'}-${e.id_loker}`
}
