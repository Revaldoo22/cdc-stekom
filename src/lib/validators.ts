import { z } from 'zod'

export const JobApplicationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15),
  cvLink: z.string().url('Link CV harus berupa URL yang valid'),
  jobId: z.string().min(1),
  message: z.string().max(500).optional(),
})

export const VJFRegistrationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15),
  universityOrCompany: z.string().min(2, 'Institusi minimal 2 karakter'),
  eventId: z.string().min(1),
})

export const OfflineRecruitmentSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15),
  eventId: z.string().min(1),
})

export type JobApplicationData = z.infer<typeof JobApplicationSchema>
export type VJFRegistrationData = z.infer<typeof VJFRegistrationSchema>
export type OfflineRecruitmentData = z.infer<typeof OfflineRecruitmentSchema>
