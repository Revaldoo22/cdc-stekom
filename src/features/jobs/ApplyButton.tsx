'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { JobApplicationForm } from '@/features/forms/JobApplicationForm'
import type { Job } from '@/types'

interface ApplyButtonProps {
  job: Job
  disabled?: boolean
  className?: string
}

export function ApplyButton({ job, disabled = false, className }: ApplyButtonProps) {
  const [open, setOpen] = useState(false)

  // Ketiga tujuan diperlakukan sama: form dulu, baru diteruskan ke perusahaan.
  // Tidak ada lagi jalur yang melewati form — dulu link web (dan sebelumnya juga
  // `mailto:`) dibuka langsung, sehingga pelamarnya tidak pernah masuk sheet
  // sementara loker bernomor telepon wajib mengisi. Sekarang setiap lamaran
  // tercatat, apa pun kontak yang disediakan perusahaan.
  const isWhatsApp = job.applyUrl?.startsWith('https://wa.me/') ?? false
  const isEmail = job.applyUrl?.startsWith('mailto:') ?? false
  const isWeb = !!job.applyUrl && !isWhatsApp && !isEmail

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={disabled}
        className={`cursor-pointer bg-cta hover:bg-cta-dark text-white ${className ?? ''}`}
      >
        Lamar Sekarang
        <Send className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Lamar Posisi</DialogTitle>
            <DialogDescription>
              {job.title} di {job.company}
            </DialogDescription>
          </DialogHeader>
          <JobApplicationForm
            jobId={job.id}
            jobTitle={job.title}
            company={job.company}
            whatsappUrl={isWhatsApp ? job.applyUrl : undefined}
            emailUrl={isEmail ? job.applyUrl : undefined}
            webUrl={isWeb ? job.applyUrl : undefined}
            // Jalur email menampilkan alamat cadangan untuk disalin (kalau klien
            // email tidak terbuka), dan jalur web masih menyisakan langkah di
            // situs perusahaan — keduanya tidak boleh menutup sendiri.
            onSuccess={isEmail || isWeb ? undefined : () => setTimeout(() => setOpen(false), 3000)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
