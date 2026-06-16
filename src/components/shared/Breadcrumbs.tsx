import { Fragment } from 'react'
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
          <Fragment key={c.href}>
            <BreadcrumbItem>
              <BreadcrumbLink render={<Link href={c.href} className="cursor-pointer" />}>
                {c.label}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
          </Fragment>
        ))}
        <BreadcrumbItem>
          <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  )
}
