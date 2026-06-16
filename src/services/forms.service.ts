import type { FormSubmitPayload } from '@/types'

export async function submitForm(payload: FormSubmitPayload): Promise<void> {
  const res = await fetch('/api/form-submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body?.message ?? `Form submit failed: ${res.status}`)
  }
}
