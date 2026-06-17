// ─────────────────────────────────────────────────────────────────────────────
// Jobs listing URL grammar (JobStreet-style, 5 dimensions)
//
//   /{keyword}-jobs[-in-{category}][/in-{location}][/{worktype}]?salary=&experience=
//
//   keyword   → free-text search        →  "{kw}-jobs"        (first segment)
//   category  → classification filter   →  "jobs-in-{cat}"    (first segment)
//   keyword+category                    →  "{kw}-jobs-in-{cat}"
//   location  → "/in-{loc}"             (second segment)
//   worktype  → "/{worktype}"           (third segment)
//   salary / experience / page          → query params
//
// No filter at all → "/loker" (the clean landing). Keyword and category are
// independent slots — searching "marketing" and filtering the "Marketing"
// category can coexist, exactly like JobStreet.
// ─────────────────────────────────────────────────────────────────────────────

export interface JobsFilter {
  category?: string
  location?: string
  tipe?: string
  salary?: string
  experience?: string
  keyword?: string
  page?: number
}

// "Data Analyst" → "data-analyst"
export function slugifyKeyword(kw: string): string {
  return kw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

// "data-analyst" → "data analyst"
export function deslugify(slug: string): string {
  return slug.replace(/-/g, ' ').trim()
}

/** Single source of truth for the jobs listing URL. */
export function buildJobsUrl(f: JobsFilter): string {
  const q = new URLSearchParams()
  if (f.salary)             q.set('salary', f.salary)
  if (f.experience)         q.set('experience', f.experience)
  if (f.page && f.page > 1) q.set('page', String(f.page))
  const qs = q.toString() ? `?${q.toString()}` : ''

  const kw  = f.keyword ? slugifyKeyword(f.keyword) : ''
  const cat = f.category || ''
  const loc = f.location || ''
  const wt  = f.tipe || ''

  if (!kw && !cat && !loc && !wt) return `/loker${qs}`

  // Segment 1: keyword + category
  let seg1: string
  if (kw && cat) seg1 = `${kw}-jobs-in-${cat}`
  else if (kw)   seg1 = `${kw}-jobs`
  else if (cat)  seg1 = `jobs-in-${cat}`
  else           seg1 = 'jobs'

  const parts = [seg1]
  if (loc) parts.push(`in-${loc}`)
  if (wt)  parts.push(wt)

  return `/${parts.join('/')}${qs}`
}

/**
 * Parse path segments back into a filter. Returns the structural shape only —
 * the page validates category/location/worktype against real data (404 if not).
 * keyword is returned slugified; de-slugify before using as a search term.
 */
export function parseJobsSegments(segs: string[]): JobsFilter | null {
  if (segs.length === 0 || segs.length > 3) return null

  const [s1] = segs
  let keyword = ''
  let category = ''

  if (s1 === 'jobs') {
    // bare /jobs → no keyword/category (location/worktype may follow)
  } else if (s1.startsWith('jobs-in-')) {
    category = s1.slice('jobs-in-'.length)
  } else {
    const i = s1.indexOf('-jobs-in-')
    if (i > 0) {
      keyword = s1.slice(0, i)
      category = s1.slice(i + '-jobs-in-'.length)
    } else if (s1.endsWith('-jobs')) {
      keyword = s1.slice(0, -'-jobs'.length)
    } else {
      return null
    }
  }

  let location = ''
  let tipe = ''
  for (const seg of segs.slice(1)) {
    if (seg.startsWith('in-')) {
      if (location) return null
      location = seg.slice(3)
    } else {
      if (tipe) return null
      tipe = seg // existence validated by the page against tipeKerja
    }
  }

  return {
    keyword:  keyword  || undefined,
    category: category || undefined,
    location: location || undefined,
    tipe:     tipe     || undefined,
  }
}

// Convenience helpers — all delegate to buildJobsUrl so there is one grammar.
export const seoUrl = {
  category:         (slug: string) => buildJobsUrl({ category: slug }),
  location:         (slug: string) => buildJobsUrl({ location: slug }),
  employmentType:   (slug: string) => buildJobsUrl({ tipe: slug }),
  combined:         (catSlug: string, locSlug: string) => buildJobsUrl({ category: catSlug, location: locSlug }),
  combinedWithType: (typeSlug: string, catSlug: string, locSlug: string) =>
                      buildJobsUrl({ tipe: typeSlug, category: catSlug, location: locSlug }),
}
