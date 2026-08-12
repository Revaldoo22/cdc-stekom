'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Loader2, CheckCircle2, User, Mail, Phone, Link2, MessageSquare, Send,
  ExternalLink, ArrowLeft, ArrowRight, MapPin,
} from 'lucide-react'
import { SITE_URL } from '@/config/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { JobApplicationSchema, type JobApplicationData } from '@/lib/validators'
import { submitForm } from '@/services/forms.service'

interface JobApplicationFormProps {
  jobId: string
  jobTitle: string
  company?: string
  whatsappUrl?: string
  /** `mailto:` loker yang hanya menyediakan email — diperlakukan seperti WhatsApp. */
  emailUrl?: string
  onSuccess?: () => void
}

const STEPS = ['Data Diri', 'CV & Pesan'] as const
// Fields validated before advancing past each step.
const STEP_FIELDS: (keyof JobApplicationData)[][] = [
  ['name', 'email', 'phone', 'address'],
  ['cvLink', 'message'],
]

// Kolom "job id" di sheet diisi link loker yang bisa langsung diklik, bukan
// angka mentah — supaya tim rekrutmen tinggal klik dari spreadsheet.
function jobLink(jobId: string) {
  return `${SITE_URL}/loker?jobId=${encodeURIComponent(jobId)}`
}

export function JobApplicationForm({ jobId, jobTitle, company, whatsappUrl, emailUrl, onSuccess }: JobApplicationFormProps) {
  const [step, setStep] = useState(0)
  const [success, setSuccess] = useState(false)
  // Tautan lanjutan setelah form terkirim: WhatsApp atau email perusahaan.
  const [handoff, setHandoff] = useState<{ kind: 'wa' | 'email'; url: string } | null>(null)
  const {
    register,
    handleSubmit,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<JobApplicationData>({
    resolver: zodResolver(JobApplicationSchema),
    defaultValues: { jobId: jobLink(jobId) },
    mode: 'onTouched',
  })

  const isLastStep = step === STEPS.length - 1
  // The Lanjut and Kirim buttons share the same slot. After advancing, the submit
  // button renders under the cursor and a stray mouseup/click can fire it. We
  // "arm" submit only a short moment after the last step is shown.
  const [armed, setArmed] = useState(false)

  async function next() {
    const valid = await trigger(STEP_FIELDS[step])
    if (!valid) return
    const target = Math.min(step + 1, STEPS.length - 1)
    if (target === STEPS.length - 1) {
      setArmed(false)
      setTimeout(() => setArmed(true), 350)
    }
    setStep(target)
  }

  // Pressing Enter must advance the wizard, never submit early from step 1.
  function onKeyDown(e: React.KeyboardEvent<HTMLFormElement>) {
    if (e.key === 'Enter' && !isLastStep) {
      e.preventDefault()
      void next()
    }
  }

  async function onSubmit(data: JobApplicationData) {
    // Guard: ignore submits that aren't on the (armed) last step. Protects
    // against the Lanjut→Kirim button occupying the same spot and a stray
    // click/Enter landing on the freshly-rendered submit button.
    if (!isLastStep || !armed) {
      if (!isLastStep) void next()
      return
    }
    await submitForm({
      formType: 'job-application',
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        cvLink: data.cvLink ?? '',
        jobId: data.jobId,
        message: data.message ?? '',
      },
    })
    // Isi pesan sama untuk WhatsApp maupun email — hanya wadahnya beda.
    const lines = [
      `Halo, saya ${data.name} ingin melamar posisi ${jobTitle}${company ? ` di ${company}` : ''}.`,
      '',
      `Nama: ${data.name}`,
      `Telepon: ${data.phone}`,
      `Email: ${data.email}`,
      `Alamat: ${data.address}`,
    ]
    if (data.cvLink) lines.push(`Link CV: ${data.cvLink}`)
    if (data.message) lines.push('', `Pesan: ${data.message}`)
    const body = lines.join('\n')

    if (whatsappUrl) {
      const base = whatsappUrl.split('?')[0]
      const link = `${base}?text=${encodeURIComponent(body)}`
      setHandoff({ kind: 'wa', url: link })
      window.open(link, '_blank', 'noopener,noreferrer')
    } else if (emailUrl) {
      // mailto: butuh subject+body sebagai query, dan alamatnya dipertahankan
      // apa adanya (bisa memuat beberapa penerima dipisah koma).
      const to = emailUrl.replace(/^mailto:/i, '').split('?')[0]
      const subject = `Lamaran ${jobTitle}${company ? ` — ${company}` : ''} (${data.name})`
      const link = `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
      setHandoff({ kind: 'email', url: link })
      // Jangan pakai window.open untuk mailto: sebagian browser meninggalkan
      // tab kosong. assign() menyerahkan ke klien email tanpa efek itu.
      window.location.assign(link)
    }
    setSuccess(true)
    onSuccess?.()
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-4 py-6 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-cta/10 ring-8 ring-cta/5">
          <CheckCircle2 className="h-9 w-9 text-cta" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-lg font-bold text-brand-text">Lamaran Terkirim!</h3>
          {handoff ? (
            <p className="mt-1 text-sm text-brand-muted">
              Satu langkah lagi — lanjutkan ke{' '}
              {handoff.kind === 'wa' ? 'WhatsApp' : 'email'} perusahaan untuk mengirim
              lamaran <strong className="text-brand-text">{jobTitle}</strong>.
            </p>
          ) : (
            <p className="mt-1 text-sm text-brand-muted">
              Lamaran Anda untuk posisi <strong className="text-brand-text">{jobTitle}</strong> telah
              diterima. Tim rekrutmen akan menghubungi Anda.
            </p>
          )}
        </div>
        {handoff && (
          <>
            <Button
              render={
                handoff.kind === 'wa'
                  ? <a href={handoff.url} target="_blank" rel="noopener noreferrer" />
                  : <a href={handoff.url} />
              }
              className="w-full cursor-pointer bg-cta hover:bg-cta-dark text-white"
            >
              {handoff.kind === 'wa' ? 'Lanjut ke WhatsApp' : 'Buka Aplikasi Email'}
              <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
            </Button>
            {handoff.kind === 'email' && (
              // Webmail-only user tidak punya klien email default, jadi mailto:
              // bisa tidak melakukan apa pun — tampilkan alamatnya agar bisa disalin.
              <p className="text-xs text-brand-muted">
                Tidak terbuka otomatis? Kirim manual ke{' '}
                <strong className="text-brand-text break-all">
                  {decodeURIComponent(handoff.url.replace(/^mailto:/i, '').split('?')[0])}
                </strong>
              </p>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} onKeyDown={onKeyDown} noValidate className="space-y-4">
      <input type="hidden" {...register('jobId')} />

      {/* Stepper */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-primary">
            Langkah {step + 1} dari {STEPS.length}
          </p>
          <p className="text-xs font-medium text-brand-muted">{STEPS[step]}</p>
        </div>
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={step + 1} aria-valuemin={1} aria-valuemax={STEPS.length}>
          {STEPS.map((label, i) => (
            <span
              key={label}
              className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step 1: Data diri */}
      {step === 0 && (
        <div key="step-0" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <Field id="app-name" label="Nama Lengkap" required icon={User} error={errors.name?.message}>
            <Input id="app-name" {...register('name')} placeholder="Budi Santoso" aria-invalid={!!errors.name} className="pl-9" />
          </Field>
          <Field id="app-email" label="Email" required icon={Mail} error={errors.email?.message}>
            <Input id="app-email" type="email" {...register('email')} placeholder="budi@email.com" aria-invalid={!!errors.email} className="pl-9" />
          </Field>
          <Field id="app-phone" label="Nomor Telepon" required icon={Phone} error={errors.phone?.message}>
            <Input id="app-phone" type="tel" {...register('phone')} placeholder="08123456789" aria-invalid={!!errors.phone} className="pl-9" />
          </Field>
          <Field id="app-address" label="Alamat" required icon={MapPin} error={errors.address?.message}>
            <Input id="app-address" {...register('address')} placeholder="Jl. Majapahit No. 605, Semarang" aria-invalid={!!errors.address} className="pl-9" />
          </Field>
        </div>
      )}

      {/* Step 2: CV & pesan */}
      {step === 1 && (
        <div key="step-1" className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-200">
          <Field id="app-cv" label="Link CV / Portfolio" optional icon={Link2} error={errors.cvLink?.message}>
            <Input
              id="app-cv"
              type="url"
              {...register('cvLink')}
              placeholder="Link CV publik, jangan private"
              aria-invalid={!!errors.cvLink}
              aria-describedby="app-cv-hint"
              className="pl-9"
            />
          </Field>
          {/* Panduan ini sengaja tetap tampil walau ada error validasi: justru saat
              user sedang memperbaiki link, penjelasan private/publik paling dibutuhkan
              (dan aria-describedby di atas menunjuk ke sini). */}
          <div id="app-cv-hint" className="rounded-lg bg-muted/60 px-3 py-2 text-xs leading-relaxed text-brand-muted">
            <p>
              <strong className="font-semibold text-brand-text">
                Link CV tidak boleh private.
              </strong>{' '}
              Rekruter tidak bisa membuka CV yang masih terkunci, dan lamaran Anda
              berisiko dilewati.
            </p>
            <ul className="mt-1.5 space-y-0.5">
              <li>
                <span className="font-medium">Google Drive:</span> klik Bagikan → ubah
                &ldquo;Dibatasi&rdquo; menjadi <em>Siapa saja yang memiliki link</em>.
              </li>
              <li>
                <span className="font-medium">LinkedIn:</span> pakai URL profil publik
                (linkedin.com/in/nama-anda), bukan link hasil pencarian.
              </li>
              <li>
                <span className="font-medium">Dropbox / OneDrive:</span> buat
                &ldquo;shared link&rdquo; yang bisa diakses tanpa login.
              </li>
            </ul>
            <p className="mt-1.5">
              Tips: coba buka link Anda di mode incognito — kalau minta izin akses,
              berarti masih private.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="app-message" className="text-[13px] font-semibold text-brand-text">
              Pesan <span className="font-normal text-brand-muted">(opsional)</span>
            </Label>
            <div className="relative">
              <MessageSquare className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-slate-400" aria-hidden="true" />
              <Textarea id="app-message" {...register('message')} placeholder="Ceritakan singkat mengapa Anda tertarik dengan posisi ini..." rows={3} className="pl-9" />
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <div className="flex gap-2 pt-1">
        {step > 0 && (
          <Button
            type="button"
            variant="outline"
            onClick={() => setStep((s) => s - 1)}
            className="cursor-pointer"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" aria-hidden="true" />
            Kembali
          </Button>
        )}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={next} className="flex-1 cursor-pointer bg-primary text-white hover:bg-primary/90">
            Lanjut
            <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" />
          </Button>
        ) : (
          <Button type="submit" disabled={isSubmitting || !armed} className="h-11 flex-1 cursor-pointer bg-cta font-semibold text-white hover:bg-cta-dark">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Mengirim...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" aria-hidden="true" />Kirim Lamaran</>
            )}
          </Button>
        )}
      </div>
    </form>
  )
}

// ─── Small field wrapper: label + left-icon input + error ─────────────────────
function Field({
  id, label, required, optional, icon: Icon, error, children,
}: {
  id: string
  label: string
  required?: boolean
  optional?: boolean
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-[13px] font-semibold text-brand-text">
        {label}{' '}
        {required && <span className="text-cta">*</span>}
        {optional && <span className="font-normal text-brand-muted">(opsional)</span>}
      </Label>
      <div className="relative">
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" aria-hidden={true} />
        {children}
      </div>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  )
}
