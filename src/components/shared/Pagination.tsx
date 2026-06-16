'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PaginationProps {
  page: number
  total: number
  perPage: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, total, perPage, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(total / perPage)
  if (totalPages <= 1) return null

  const pages = buildPageList(page, totalPages)

  return (
    <nav
      aria-label="Navigasi halaman"
      className="flex items-center justify-center gap-1"
    >
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1}
        aria-label="Halaman sebelumnya"
        className="cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-sm text-brand-muted">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="sm"
            onClick={() => onPageChange(p as number)}
            aria-label={`Halaman ${p}`}
            aria-current={p === page ? 'page' : undefined}
            className="cursor-pointer min-w-[36px]"
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(page + 1)}
        disabled={page >= totalPages}
        aria-label="Halaman berikutnya"
        className="cursor-pointer"
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </nav>
  )
}

function buildPageList(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]
  if (current > 3) pages.push('...')
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    pages.push(i)
  }
  if (current < total - 2) pages.push('...')
  pages.push(total)
  return pages
}
