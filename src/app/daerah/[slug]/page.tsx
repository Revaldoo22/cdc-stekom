import { redirect } from 'next/navigation'
import { seoUrl } from '@/lib/seo-urls'

interface Props { params: Promise<{ slug: string }> }

// Go through seoUrl so the target always matches the grammar parseJobsSegments
// accepts. Hand-writing the path here produced "/in-{slug}", which the parser
// rejects outright (first segment must be jobs / jobs-in-* / *-jobs), so every
// city page 404'd.
export default async function DaerahRedirect({ params }: Props) {
  const { slug } = await params
  redirect(seoUrl.location(slug))
}
