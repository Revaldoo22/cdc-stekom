export const SALARY_RANGES = [
  { slug: 'under-3jt',  label: '< Rp 3 juta',  min: 0,           max: 3_000_000  },
  { slug: '3-6jt',      label: 'Rp 3–6 juta',  min: 3_000_000,   max: 6_000_000  },
  { slug: '6-10jt',     label: 'Rp 6–10 juta', min: 6_000_000,   max: 10_000_000 },
  { slug: 'above-10jt', label: '> Rp 10 juta', min: 10_000_000,  max: Infinity   },
] as const

export const EXPERIENCE_LEVELS = [
  { slug: 'fresh-graduate', label: 'Fresh Graduate', desc: '0 tahun'   },
  { slug: 'junior',         label: 'Junior',          desc: '1–3 tahun' },
  { slug: 'mid',            label: 'Mid Level',       desc: '3–5 tahun' },
  { slug: 'senior',         label: 'Senior',          desc: '5+ tahun'  },
] as const

export type SalaryRangeSlug    = (typeof SALARY_RANGES)[number]['slug']
export type ExperienceLevelSlug = (typeof EXPERIENCE_LEVELS)[number]['slug']
