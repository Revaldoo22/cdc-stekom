'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
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
  // If the job's apply contact is a WhatsApp link, pass it here. After the form
  // is submitted we open WhatsApp prefilled with the applicant's details.
  whatsappUrl?: string
  onSuccess?: () => void
}

export function JobApplicationForm({ jobId, jobTitle, company, whatsappUrl, onSuccess }: JobApplicationFormProps) {
  const [success, setSuccess] = useState(false)
  const [waLink, setWaLink] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobApplicationData>({
    resolver: zodResolver(JobApplicationSchema),
    defaultValues: { jobId },
  })

  async function onSubmit(data: JobApplicationData) {
    await submitForm({
      formType: 'job-application',
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        cvLink: data.cvLink ?? '',
        jobId: data.jobId,
        message: data.message ?? '',
      },
    })
    // If the company accepts applications via WhatsApp, open it prefilled.
    if (whatsappUrl) {
      const lines = [
        `Halo, saya ${data.name} ingin melamar posisi ${jobTitle}${company ? ` di ${company}` : ''}.`,
        '',
        `Nama: ${data.name}`,
        `Telepon: ${data.phone}`,
        `Email: ${data.email}`,
      ]
      if (data.cvLink) lines.push(`Link CV: ${data.cvLink}`)
      if (data.message) lines.push('', `Pesan: ${data.message}`)
      const base = whatsappUrl.split('?')[0]
      const link = `${base}?text=${encodeURIComponent(lines.join('\n'))}`
      setWaLink(link)
      window.open(link, '_blank', 'noopener,noreferrer')
    }

    setSuccess(true)
    onSuccess?.()
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-cta" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-brand-text">Lamaran Terkirim!</h3>
        {waLink ? (
          <>
            <p className="text-sm text-brand-muted">
              Lanjutkan ke WhatsApp perusahaan untuk mengirim lamaran <strong>{jobTitle}</strong>.
            </p>
            <Button
              render={<a href={waLink} target="_blank" rel="noopener noreferrer" />}
              className="mt-1 w-full cursor-pointer bg-cta hover:bg-cta-dark text-white"
            >
              Lanjut ke WhatsApp
            </Button>
          </>
        ) : (
          <p className="text-sm text-brand-muted">
            Lamaran Anda untuk posisi <strong>{jobTitle}</strong> telah diterima. Tim rekrutmen akan menghubungi Anda.
          </p>
        )}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register('jobId')} />

      <div>
        <Label htmlFor="app-name">Nama Lengkap *</Label>
        <Input
          id="app-name"
          {...register('name')}
          placeholder="Budi Santoso"
          aria-describedby={errors.name ? 'app-name-error' : undefined}
          aria-invalid={!!errors.name}
          className="mt-1"
        />
        {errors.name && (
          <p id="app-name-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.name.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="app-email">Email *</Label>
        <Input
          id="app-email"
          type="email"
          {...register('email')}
          placeholder="budi@email.com"
          aria-describedby={errors.email ? 'app-email-error' : undefined}
          aria-invalid={!!errors.email}
          className="mt-1"
        />
        {errors.email && (
          <p id="app-email-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.email.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="app-phone">Nomor Telepon *</Label>
        <Input
          id="app-phone"
          type="tel"
          {...register('phone')}
          placeholder="08123456789"
          aria-describedby={errors.phone ? 'app-phone-error' : undefined}
          aria-invalid={!!errors.phone}
          className="mt-1"
        />
        {errors.phone && (
          <p id="app-phone-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.phone.message}
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="app-cv">Link CV / Portfolio (opsional)</Label>
        <Input
          id="app-cv"
          type="url"
          {...register('cvLink')}
          placeholder="https://drive.google.com/..."
          aria-describedby={errors.cvLink ? 'app-cv-error' : 'app-cv-hint'}
          aria-invalid={!!errors.cvLink}
          className="mt-1"
        />
        {errors.cvLink ? (
          <p id="app-cv-error" role="alert" className="mt-1 text-xs text-destructive">
            {errors.cvLink.message}
          </p>
        ) : (
          <p id="app-cv-hint" className="mt-1 text-xs text-brand-muted">
            Tempel link yang bisa diakses publik: Google Drive, Dropbox, OneDrive,
            LinkedIn, atau portfolio pribadi. Pastikan izin akses &ldquo;siapa saja yang
            memiliki link&rdquo;.
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="app-message">Pesan (opsional)</Label>
        <Textarea
          id="app-message"
          {...register('message')}
          placeholder="Ceritakan singkat mengapa Anda tertarik dengan posisi ini..."
          rows={3}
          className="mt-1"
        />
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer bg-cta hover:bg-cta-dark text-white"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Mengirim...
          </>
        ) : (
          'Kirim Lamaran'
        )}
      </Button>
    </form>
  )
}
