'use client'

import { useState } from 'react'
import { ExternalLink, Send } from 'lucide-react'
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

  // WhatsApp dan email diperlakukan sama: form dulu, baru diteruskan ke kontak
  // perusahaan. Sebelumnya `mailto:` ikut jalur "link langsung" sehingga loker
  // yang hanya punya email melewati form sama sekali — datanya tidak pernah
  // masuk sheet, padahal loker bernomor telepon wajib mengisi.
  const isWhatsApp = job.applyUrl?.startsWith('https://wa.me/') ?? false
  const isEmail = job.applyUrl?.startsWith('mailto:') ?? false
  // Hanya link web perusahaan yang boleh dibuka langsung.
  if (job.applyUrl && !isWhatsApp && !isEmail) {
    return (
      <Button
        render={<a href={job.applyUrl} target="_blank" rel="noopener noreferrer" />}
        disabled={disabled}
        className={`cursor-pointer bg-cta hover:bg-cta-dark text-white ${className ?? ''}`}
      >
        Lamar Sekarang
        <ExternalLink className="ml-2 h-4 w-4" aria-hidden="true" />
      </Button>
    )
  }

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
            // Jalur email menampilkan alamat cadangan untuk disalin (kalau klien
            // email tidak terbuka), jadi dialognya tidak boleh menutup sendiri.
            onSuccess={isEmail ? undefined : () => setTimeout(() => setOpen(false), 3000)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
