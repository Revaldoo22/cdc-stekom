import type { RecruitmentEvent } from '@/types'
import { mockJobs } from './jobs'

export const mockEvents: RecruitmentEvent[] = [
  {
    id: 'vjf-2026-1',
    slug: 'virtual-job-fair-stekom-juni-2026',
    title: 'Virtual Job Fair Stekom Juni 2026',
    type: 'vjf',
    description:
      'Virtual Job Fair terbesar dari CDC Stekom menghadirkan ratusan perusahaan terkemuka yang membuka lowongan untuk fresh graduate dan berpengalaman. Bergabunglah dan temukan karir impianmu!',
    date: '2026-07-01T09:00:00Z',
    endDate: '2026-07-03T17:00:00Z',
    location: 'Online (Zoom & Virtual Booth)',
    organizer: 'CDC Stekom',
    registrationDeadline: '2026-06-28T23:59:00Z',
    jobs: mockJobs.slice(0, 4),
  },
  {
    id: 'offline-2026-1',
    slug: 'rekrutmen-offline-kampus-stekom-juli-2026',
    title: 'Rekrutmen Offline Kampus Stekom Juli 2026',
    type: 'offline',
    description:
      'Rekrutmen offline langsung di kampus Stekom. Kesempatan emas untuk bertemu langsung dengan rekruter dari perusahaan-perusahaan terkemuka dan menjalani proses seleksi on the spot.',
    date: '2026-07-15T08:00:00Z',
    endDate: '2026-07-15T16:00:00Z',
    location: 'Gedung Aula Utama, Kampus Stekom Semarang',
    organizer: 'CDC Stekom',
    registrationDeadline: '2026-07-12T23:59:00Z',
    jobs: mockJobs.slice(2, 6),
  },
]
