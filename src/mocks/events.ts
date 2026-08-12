import type { RecruitmentEvent } from '@/types'
import { mockJobs } from './jobs'

export const mockEvents: RecruitmentEvent[] = [
  // ── VJF ──────────────────────────────────────────────────────────────────
  {
    id: 'vjf-batch-3',
    slug: 'virtual-job-fair-stekom-batch-3-juli-2026',
    title: 'Virtual Job Fair STEKOM Batch 3',
    type: 'vjf',
    batch: 3,
    status: 'upcoming',
    description:
      'VJF Batch 3 menghadirkan 20+ perusahaan teknologi dan kreatif untuk fresh graduate dan profesional. Sesi one-on-one dengan rekruter via Zoom, open untuk seluruh jurusan.',
    date: '2026-07-10T09:00:00Z',
    endDate: '2026-07-12T17:00:00Z',
    location: 'Online (Zoom + Virtual Booth)',
    organizer: 'CDC Universitas Stekom',
    registrationDeadline: '2026-07-07T23:59:00Z',
    jobs: mockJobs.slice(0, 4),
  },
  {
    id: 'vjf-batch-2',
    slug: 'virtual-job-fair-stekom-batch-2-januari-2026',
    title: 'Virtual Job Fair STEKOM Batch 2',
    type: 'vjf',
    batch: 2,
    status: 'past',
    description:
      'VJF Batch 2 diikuti oleh 15 perusahaan mitra dengan total 80+ lowongan tersedia. Berlangsung selama 3 hari penuh via platform virtual interaktif.',
    date: '2026-01-20T09:00:00Z',
    endDate: '2026-01-22T17:00:00Z',
    location: 'Online (Zoom + Virtual Booth)',
    organizer: 'CDC Universitas Stekom',
    registrationDeadline: '2026-01-17T23:59:00Z',
    jobs: mockJobs.slice(2, 6),
  },
  {
    id: 'vjf-batch-1',
    slug: 'virtual-job-fair-stekom-batch-1-agustus-2025',
    title: 'Virtual Job Fair STEKOM Batch 1',
    type: 'vjf',
    batch: 1,
    status: 'past',
    description:
      'VJF perdana CDC Universitas Stekom dengan 10 perusahaan pilihan. Dihadiri 300+ pencari kerja, menghasilkan 45+ penawaran kerja.',
    date: '2025-08-05T09:00:00Z',
    endDate: '2025-08-07T17:00:00Z',
    location: 'Online (Zoom)',
    organizer: 'CDC Universitas Stekom',
    registrationDeadline: '2025-08-02T23:59:00Z',
    jobs: mockJobs.slice(0, 3),
  },

  // ── Rekrutmen Offline ────────────────────────────────────────────────────
  // Hanya satu batch aktif — batch terbaru saja, sesuai pengumuman Instagram CDC.
  // Waktu di poster WIB (UTC+7): 08.30–12.00 WIB → 01:30Z–05:00Z.
  //
  // CATATAN: field `status` di bawah TIDAK dipakai — events.service.ts selalu
  // menghitung ulang dari `date`/`endDate` (lihat computeEventStatus). Cukup
  // perbarui tanggalnya; status ikut menyesuaikan sendiri.
  {
    id: 'offline-batch-23',
    slug: 'walk-in-interview-pt-artha-abadi-batch-23',
    title: 'Walk In Interview PT ARTHA ABADI — Batch 23',
    type: 'offline',
    batch: 23,
    status: 'upcoming',
    description:
      'PELUANG KERJA EKSKLUSIF DARI MITRA INDUSTRI UNIVSTEKOM. Walk In Interview bersama PT ARTHA ABADI — bertemu langsung dan berkenalan dengan HRD perusahaan besar.\n\nTERBUKA UNTUK UMUM\nMinimal lulusan SMK/SMA/MA/sederajat/D3/S1.',
    date: '2026-08-11T01:30:00Z',
    endDate: '2026-08-11T05:00:00Z',
    location: 'Ruang Serbaguna Lt. 3, Universitas STEKOM (Jl. Majapahit No. 605, Semarang)',
    organizer: 'CDC Universitas Stekom',
    instagramUrl: 'https://www.instagram.com/p/DbsE_8RJUCG/',
    positions: [
      'Sosial Media Specialist (SMA/SMK)',
      'Leader Event Organizer (D3/S1)',
      'Design Grafis (SMA/SMK)',
      'Tukang Kayu HPL (SMA/SMK)',
      'Staff Pajak (D3/S1)',
      'Manager Operasional/Logistik (D3/S1)',
      'Sales Advisor (SMA/SMK)',
      'Team Leader Sales (D3/S1)',
      'Export Import (D3/S1)',
    ],
    registrationLinks: [
      { label: 'Daftar Hadir Offline', url: 'https://bit.ly/daftar-offlinebatch23' },
      { label: 'Daftar Hadir Online', url: 'https://bit.ly/daftar-onlinebatch23' },
    ],
  },
]
