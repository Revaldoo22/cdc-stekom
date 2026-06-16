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

  if (job.applyUrl) {
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
            onSuccess={() => setTimeout(() => setOpen(false), 2000)}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
