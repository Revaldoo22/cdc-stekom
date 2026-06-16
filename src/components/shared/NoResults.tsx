import Link from 'next/link'
import { SearchX } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NoResultsProps {
  title?: string
  description?: string
}

export function NoResults({
  title = 'Lowongan tidak ditemukan',
  description = 'Coba ubah filter atau kata kunci pencarian Anda.',
}: NoResultsProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <SearchX className="h-12 w-12 text-brand-muted mb-4" aria-hidden="true" />
      <h2 className="text-lg font-semibold text-brand-text">{title}</h2>
      <p className="mt-1 text-sm text-brand-muted max-w-sm">{description}</p>
      <Button render={<Link href="/loker" />} className="mt-6 cursor-pointer">
        Lihat semua lowongan
      </Button>
    </div>
  )
}
