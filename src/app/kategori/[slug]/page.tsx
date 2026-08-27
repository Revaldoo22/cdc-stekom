import { redirect } from 'next/navigation'
import { seoUrl } from '@/lib/seo-urls'

interface Props { params: Promise<{ slug: string }> }

// "/{slug}-jobs" is the keyword grammar; the category facet is "/jobs-in-{slug}".
// Redirecting to the former turned every category page into a text search.
export default async function KategoriRedirect({ params }: Props) {
  const { slug } = await params
  redirect(seoUrl.category(slug))
}
