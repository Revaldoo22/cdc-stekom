'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { OfflineRecruitmentSchema, type OfflineRecruitmentData } from '@/lib/validators'
import { submitForm } from '@/services/forms.service'

interface OfflineRecruitmentFormProps {
  eventId: string
  eventTitle: string
}

export function OfflineRecruitmentForm({ eventId, eventTitle }: OfflineRecruitmentFormProps) {
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<OfflineRecruitmentData>({
    resolver: zodResolver(OfflineRecruitmentSchema),
    defaultValues: { eventId },
  })

  async function onSubmit(data: OfflineRecruitmentData) {
    await submitForm({
      formType: 'offline',
      data: { name: data.name, email: data.email, phone: data.phone, eventId: data.eventId },
    })
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-cta" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-brand-text">Pendaftaran Berhasil!</h3>
        <p className="text-sm text-brand-muted">
          Anda telah terdaftar untuk <strong>{eventTitle}</strong>. Harap datang 30 menit sebelum acara dimulai.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register('eventId')} />

      <div>
        <Label htmlFor="off-name">Nama Lengkap *</Label>
        <Input
          id="off-name"
          {...register('name')}
          placeholder="Budi Santoso"
          aria-invalid={!!errors.name}
          className="mt-1"
        />
        {errors.name && <p role="alert" className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="off-email">Email *</Label>
        <Input
          id="off-email"
          type="email"
          {...register('email')}
          placeholder="budi@email.com"
          aria-invalid={!!errors.email}
          className="mt-1"
        />
        {errors.email && <p role="alert" className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="off-phone">Nomor Telepon *</Label>
        <Input
          id="off-phone"
          type="tel"
          {...register('phone')}
          placeholder="08123456789"
          aria-invalid={!!errors.phone}
          className="mt-1"
        />
        {errors.phone && <p role="alert" className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full cursor-pointer bg-cta hover:bg-cta-dark text-white"
      >
        {isSubmitting ? (
          <><Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />Mendaftar...</>
        ) : (
          'Daftar Sekarang'
        )}
      </Button>
    </form>
  )
}
