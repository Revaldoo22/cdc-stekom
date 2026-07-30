'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Briefcase, MapPin, Search, X } from 'lucide-react'
import { seoUrl } from '@/lib/seo-urls'

// Shared browser for the /kategori and /daerah index pages: both render the same
// count-annotated grid over a full taxonomy list, so filtering lives here once.
//
// The list is already in the page payload (both routes are static), so filtering
// is client-side — instant, no requests, and the server-rendered HTML still
// contains every link for crawlers.

export interface TaxonomyItem {
  slug: string
  name: string
  count: number
}

interface TaxonomyBrowserProps {
  items: TaxonomyItem[]
  /**
   * Which taxonomy this is. Drives the tile glyph and the URL builder — passed
   * as a string rather than a `hrefFor` callback because function props cannot
   * cross the server/client boundary.
   */
  kind: 'category' | 'location'
  searchPlaceholder: string
  searchLabel: string
  /** Noun for result counts, e.g. "kategori" / "lokasi". */
  noun: string
}

// Fold accents and punctuation so "D.I. Yogyakarta" matches "di yogyakarta".
function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

export function TaxonomyBrowser({
  items,
  kind,
  searchPlaceholder,
  searchLabel,
  noun,
}: TaxonomyBrowserProps) {
  const [query, setQuery] = useState('')

  // Precompute the haystack so typing doesn't re-normalise all 300+ names per keystroke.
  const indexed = useMemo(
    () => items.map((item) => ({ item, haystack: normalize(item.name) })),
    [items],
  )

  const filtered = useMemo(() => {
    const q = normalize(query)
    if (!q) return items
    // Every whitespace-separated term must appear, so "kota jawa" narrows rather
    // than widens — matching how people refine a search.
    const terms = q.split(' ')
    return indexed.filter(({ haystack }) => terms.every((t) => haystack.includes(t))).map((e) => e.item)
  }, [indexed, items, query])

  const Icon = kind === 'category' ? Briefcase : MapPin
  const hrefFor = kind === 'category' ? seoUrl.category : seoUrl.location
  const totalJobs = useMemo(() => filtered.reduce((sum, i) => sum + i.count, 0), [filtered])

  return (
    <>
      {/* ── Search ── */}
      <div className="mb-5 max-w-xl">
        <div className="group flex items-center rounded-xl border border-border bg-white transition-all duration-200 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20">
          <span className="pl-4 pr-1 text-slate-400">
            <Search className="h-4.5 w-4.5" aria-hidden="true" />
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchLabel}
            className="flex-1 bg-transparent py-3 pr-2 text-sm text-brand-text placeholder:text-slate-400 outline-none [&::-webkit-search-cancel-button]:hidden"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              aria-label="Hapus pencarian"
              className="mr-2 flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors duration-150 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Result summary — announced so screen readers hear the count change. */}
        <p className="mt-2 text-xs text-brand-muted" aria-live="polite">
          {query
            ? `${filtered.length.toLocaleString('id-ID')} ${noun} cocok · ${totalJobs.toLocaleString('id-ID')} lowongan`
            : `${items.length.toLocaleString('id-ID')} ${noun}, ${totalJobs.toLocaleString('id-ID')} total lowongan tersedia`}
        </p>
      </div>

      {/* ── Grid ── */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item) => (
            <Link
              key={item.slug}
              href={hrefFor(item.slug)}
              className="group flex items-center justify-between rounded-xl border border-border bg-white px-5 py-4 transition-all duration-200 hover:border-primary/50 hover:shadow-sm cursor-pointer"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/8 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-brand-text truncate group-hover:text-primary transition-colors">
                    {item.name}
                  </p>
                  <p className="text-xs text-brand-muted">
                    {item.count.toLocaleString('id-ID')} lowongan
                  </p>
                </div>
              </div>
              <ArrowRight
                className="h-4 w-4 shrink-0 text-brand-muted/40 transition-all duration-200 group-hover:translate-x-0.5 group-hover:text-primary"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-border bg-brand-bg px-6 py-12 text-center">
          <p className="text-sm font-medium text-brand-text">
            Tidak ada {noun} yang cocok dengan &ldquo;{query}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setQuery('')}
            className="mt-3 text-sm font-semibold text-primary hover:underline cursor-pointer"
          >
            Tampilkan semua {noun}
          </button>
        </div>
      )}
    </>
  )
}
