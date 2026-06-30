import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GOOGLE_SHEET_WEBHOOK } from '@/config/api'
import { JobApplicationSchema, VJFRegistrationSchema, OfflineRecruitmentSchema } from '@/lib/validators'

const RequestSchema = z.object({
  formType: z.enum(['job-application', 'vjf', 'offline']),
  data: z.record(z.string(), z.string()),
  utm: z.record(z.string(), z.string()).optional(),
})

const SCHEMA_MAP = {
  'job-application': JobApplicationSchema,
  vjf: VJFRegistrationSchema,
  offline: OfflineRecruitmentSchema,
} as const

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = RequestSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { message: 'Invalid request body', errors: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { formType, data, utm } = parsed.data
    const schema = SCHEMA_MAP[formType]
    const validated = schema.safeParse(data)

    if (!validated.success) {
      return NextResponse.json(
        { message: 'Form validation failed', errors: validated.error.flatten() },
        { status: 422 },
      )
    }

    const sheetPayload = { formType, ...validated.data, ...(utm ?? {}) }

    if (!GOOGLE_SHEET_WEBHOOK) {
      // Dev fallback — log to console, return success
      console.log('[form-submit] Google Sheets webhook not configured. Received:', sheetPayload)
      return NextResponse.json({ success: true, dev: true })
    }

    const sheetRes = await fetch(GOOGLE_SHEET_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(sheetPayload),
    })

    if (!sheetRes.ok) {
      console.error('[form-submit] Google Sheets error:', sheetRes.status)
      return NextResponse.json({ message: 'Failed to save submission' }, { status: 502 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[form-submit] Unexpected error:', err)
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 })
  }
}
