import Link from 'next/link'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import type { Crumb } from '@/types'

interface BreadcrumbsProps {
  crumbs: Crumb[]
  currentLabel: string
}

export function Breadcrumbs({ crumbs, currentLabel }: BreadcrumbsProps) {
  return (
    <Breadcrumb aria-label="Navigasi halaman">
      <BreadcrumbList>
        {crumbs.map((c) => (
          <BreadcrumbItem key={c.href}>
            <BreadcrumbLink render={<Link href={c.href} className="cursor-pointer" />}>
              {c.label}
            </BreadcrumbLink>
            <BreadcrumbSeparator />
          </BreadcrumbItem>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
