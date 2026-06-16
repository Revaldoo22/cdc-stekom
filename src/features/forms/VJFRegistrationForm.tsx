'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VJFRegistrationSchema, type VJFRegistrationData } from '@/lib/validators'
import { submitForm } from '@/services/forms.service'

interface VJFRegistrationFormProps {
  eventId: string
  eventTitle: string
}

export function VJFRegistrationForm({ eventId, eventTitle }: VJFRegistrationFormProps) {
  const [success, setSuccess] = useState(false)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<VJFRegistrationData>({
    resolver: zodResolver(VJFRegistrationSchema),
    defaultValues: { eventId },
  })

  async function onSubmit(data: VJFRegistrationData) {
    await submitForm({
      formType: 'vjf',
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        universityOrCompany: data.universityOrCompany,
        eventId: data.eventId,
      },
    })
    setSuccess(true)
  }

  if (success) {
    return (
      <div className="flex flex-col items-center gap-3 py-8 text-center">
        <CheckCircle2 className="h-12 w-12 text-cta" aria-hidden="true" />
        <h3 className="text-lg font-semibold text-brand-text">Pendaftaran Berhasil!</h3>
        <p className="text-sm text-brand-muted">
          Anda telah terdaftar untuk <strong>{eventTitle}</strong>. Kami akan mengirimkan detail acara ke email Anda.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
      <input type="hidden" {...register('eventId')} />

      <div>
        <Label htmlFor="vjf-name">Nama Lengkap *</Label>
        <Input
          id="vjf-name"
          {...register('name')}
          placeholder="Budi Santoso"
          aria-invalid={!!errors.name}
          className="mt-1"
        />
        {errors.name && <p role="alert" className="mt-1 text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div>
        <Label htmlFor="vjf-email">Email *</Label>
        <Input
          id="vjf-email"
          type="email"
          {...register('email')}
          placeholder="budi@email.com"
          aria-invalid={!!errors.email}
          className="mt-1"
        />
        {errors.email && <p role="alert" className="mt-1 text-xs text-destructive">{errors.email.message}</p>}
      </div>

      <div>
        <Label htmlFor="vjf-phone">Nomor Telepon *</Label>
        <Input
          id="vjf-phone"
          type="tel"
          {...register('phone')}
          placeholder="08123456789"
          aria-invalid={!!errors.phone}
          className="mt-1"
        />
        {errors.phone && <p role="alert" className="mt-1 text-xs text-destructive">{errors.phone.message}</p>}
      </div>

      <div>
        <Label htmlFor="vjf-institution">Universitas / Perusahaan *</Label>
        <Input
          id="vjf-institution"
          {...register('universityOrCompany')}
          placeholder="Universitas STEKOM"
          aria-invalid={!!errors.universityOrCompany}
          className="mt-1"
        />
        {errors.universityOrCompany && (
          <p role="alert" className="mt-1 text-xs text-destructive">{errors.universityOrCompany.message}</p>
        )}
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
