import { redirect } from 'next/navigation'
import { seoUrl } from '@/lib/seo-urls'

interface Props { params: Promise<{ slug: string }> }

// "/{slug}-jobs" parses as a free-text KEYWORD, not a worktype facet — the page
// then merely searched for the words "full time" instead of filtering by them.
// seoUrl.employmentType() emits the facet URL the parser understands.
export default async function TipePekerjaanRedirect({ params }: Props) {
  const { slug } = await params
  redirect(seoUrl.employmentType(slug))
}
