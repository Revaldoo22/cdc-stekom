'use client'

import { useCallback, useTransition } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { JobCard } from '@/components/shared/JobCard'
import { FilterSidebar } from '@/components/shared/FilterSidebar'
import { SearchBar } from '@/components/shared/SearchBar'
import { Pagination } from '@/components/shared/Pagination'
import { NoResults } from '@/components/shared/NoResults'
import { SkeletonJobGrid } from '@/components/shared/SkeletonJobCard'
import type { Job, Category, Location, TipeKerja } from '@/types'
import { PER_PAGE } from '@/config/api'

interface JobListingClientProps {
  jobs: Job[]
  total: number
  categories: Category[]
  locations: Location[]
  tipeKerja: TipeKerja[]
  initialPage: number
  initialKeyword: string
  initialCategory: string
  initialLocation: string
  initialTipe: string
}

export function JobListingClient({
  jobs,
  total,
  categories,
  locations,
  tipeKerja,
  initialPage,
  initialKeyword,
  initialCategory,
  initialLocation,
  initialTipe,
}: JobListingClientProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  const updateParams = useCallback(
    (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      params.delete('page')
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [router, pathname, searchParams],
  )

  const handlePageChange = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set('page', String(page))
      startTransition(() => router.push(`${pathname}?${params.toString()}`))
    },
    [router, pathname, searchParams],
  )

  const handleReset = useCallback(() => {
    startTransition(() => router.push(pathname))
  }, [router, pathname])

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Mobile search */}
      <div className="mb-6 lg:hidden">
        <SearchBar
          value={initialKeyword}
          onChange={(v) => updateParams({ keyword: v })}
        />
      </div>

      <div className="flex flex-col gap-6 lg:flex-row">
        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64">
          <div className="hidden lg:block mb-6">
            <SearchBar
              value={initialKeyword}
              onChange={(v) => updateParams({ keyword: v })}
            />
          </div>
          <FilterSidebar
            categories={categories}
            locations={locations}
            tipeKerja={tipeKerja}
            selectedCategory={initialCategory}
            selectedLocation={initialLocation}
            selectedTipe={initialTipe}
            onCategoryChange={(v) => updateParams({ category: v })}
            onLocationChange={(v) => updateParams({ location: v })}
            onTipeChange={(v) => updateParams({ tipe: v })}
            onReset={handleReset}
          />
        </aside>

        {/* Results */}
        <div className="flex-1 min-w-0">
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-brand-muted">
              {total > 0 ? (
                <>Ditemukan <strong className="text-brand-text">{total}</strong> lowongan</>
              ) : (
                'Tidak ada lowongan'
              )}
            </p>
          </div>

          {isPending ? (
            <SkeletonJobGrid count={6} />
          ) : jobs.length === 0 ? (
            <NoResults />
          ) : (
            <>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {jobs.map((job) => (
                  <JobCard key={job.id} job={job} />
                ))}
              </div>
              <div className="mt-8">
                <Pagination
                  page={initialPage}
                  total={total}
                  perPage={PER_PAGE}
                  onPageChange={handlePageChange}
                />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
