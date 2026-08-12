import { z } from 'zod'

export const JobApplicationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15),
  // Optional — kandidat boleh melamar tanpa link CV. Jika diisi, harus URL valid.
  cvLink: z
    .string()
    .url('Link CV harus berupa URL yang valid dan bisa diakses publik (contoh: https://drive.google.com/...)')
    .optional()
    .or(z.literal('')),
  address: z.string().min(5, 'Alamat minimal 5 karakter').max(300),
  // Dikirim sebagai URL loker penuh (https://cdc.stekom.ac.id/loker?jobId=…) agar
  // baris di Google Sheet bisa langsung diklik, bukan sekadar angka ID.
  jobId: z.string().url(),
  message: z.string().max(500).optional(),
})

export const VJFRegistrationSchema = z.object({
  name: z.string().min(2, 'Nama minimal 2 karakter'),
  email: z.string().email('Email tidak valid'),
  phone: z.string().min(10, 'Nomor telepon minimal 10 digit').max(15),
  interestedKuliahKerja: z.enum(['ya', 'tidak'], {
    message: 'Silakan pilih salah satu',
  }),
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
