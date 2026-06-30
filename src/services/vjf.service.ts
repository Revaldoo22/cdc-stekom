import { cache } from 'react'
import { VJF_API_URL, VJF_KEY, REVALIDATE_EVENTS } from '@/config/api'
import type { RecruitmentEvent } from '@/types'

// ─── Raw API shape (toploker.com/curl/virtual_jobfair) ───────────────────────────

interface RawVjf {
  id: string
  slug: string
  title: string
  batch: string
  description: string
  tanggal_mulai: string
  tanggal_selesai: string
  lokasi: string
  banner: string
  batas_daftar: string
  // organizer / jumlah_perusahaan intentionally ignored
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function decodeEntities(s: string): string {
  let prev = ''
  let out = s
  // decode repeatedly to undo double/triple encoding (&amp;amp;)
  for (let i = 0; i < 5 && out !== prev; i++) {
    prev = out
    out = out
      .replace(/&quot;/g, '"')
      .replace(/&#0?39;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
  }
  return out
}

// The description is messy HTML (junk attributes like xss=removed, empty style
// fragments). Strip ALL tags and keep readable text — the detail page can show
// it as a clean paragraph rather than rendering broken markup.
function htmlToText(html: string): string {
  return decodeEntities(html)
    .replace(/<\s*(br|\/p|\/h[1-6]|\/div|\/li)\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '\n• ')
    .replace(/<[^>]*>/g, '')
    .replace(/ /g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .replace(/[ \t]{2,}/g, ' ')
    .trim()
}

function cleanTitle(t: string): string {
  // drop the trailing "#90" batch marker and collapse whitespace
  return decodeEntities(t).replace(/#\d+\s*$/, '').replace(/\s+/g, ' ').trim()
}

// Batch number lives in the title as "#90". Absent on older events → 0.
function batchFromTitle(t: string): number {
  const m = t.match(/#(\d+)\s*$/)
  return m ? Number(m[1]) : 0
}

// JS Date is forbidden in workflow scripts but fine here (server component).
function computeStatus(start: string, end: string): RecruitmentEvent['status'] {
  const now = Date.now()
  const s = new Date(start.replace(' ', 'T')).getTime()
  const e = new Date((end || start).replace(' ', 'T')).getTime()
  if (Number.isNaN(s)) return 'past'
  if (now < s) return 'upcoming'
  if (now <= e) return 'ongoing'
  return 'past'
}

function mapVjf(raw: RawVjf): RecruitmentEvent {
  return {
    id: raw.id,
    slug: raw.slug,
    title: cleanTitle(raw.title),
    type: 'vjf',
    batch: batchFromTitle(raw.title),
    description: htmlToText(raw.description),
    date: raw.tanggal_mulai,
    endDate: raw.tanggal_selesai || undefined,
    location: decodeEntities(raw.lokasi || '').trim() || 'Online',
    organizer: 'CDC Universitas STEKOM & TopLoker.com',
    banner: raw.banner || undefined,
    registrationDeadline: raw.batas_daftar || undefined,
    status: computeStatus(raw.tanggal_mulai, raw.tanggal_selesai),
  }
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

export const fetchVjfEvents = cache(async (): Promise<RecruitmentEvent[]> => {
  try {
    const res = await fetch(VJF_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ key_api: VJF_KEY }).toString(),
      next: { revalidate: REVALIDATE_EVENTS },
    })
    if (!res.ok) throw new Error(`VJF API → HTTP ${res.status}`)
    const data = (await res.json()) as { dx?: RawVjf[] }
    return (data.dx ?? []).map(mapVjf)
  } catch (err) {
    console.error('[vjf] fetch failed, returning empty:', err)
    return []
  }
})
