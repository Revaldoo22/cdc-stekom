import { redirect } from 'next/navigation'

interface Props { params: Promise<{ slug: string }> }

export default async function DaerahRedirect({ params }: Props) {
  const { slug } = await params
  redirect(`/in-${slug}`)
}
