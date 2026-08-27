'use client'

import { useCallback, useMemo, useSyncExternalStore } from 'react'

const STORAGE_KEY = 'cdc_applicant_profile'

/**
 * Field yang diisi ulang otomatis saat pelamar melamar loker berikutnya.
 *
 * Sengaja tidak memuat `message` (isinya spesifik per lowongan) dan `jobId`
 * (ditentukan oleh loker yang sedang dibuka, bukan oleh pelamar).
 */
export interface ApplicantProfile {
  name?: string
  email?: string
  phone?: string
  address?: string
  education?: string
  educationOther?: string
  graduationYear?: string
  interestedKuliahKerja?: string
  cvLink?: string
}

const FIELDS: (keyof ApplicantProfile)[] = [
  'name', 'email', 'phone', 'address',
  'education', 'educationOther', 'graduationYear',
  'interestedKuliahKerja', 'cvLink',
]

function parseProfile(raw: string | null): ApplicantProfile {
  if (!raw) return {}
  try {
    const data = JSON.parse(raw)
    // Nilai tersimpan berasal dari versi form yang mungkin berbeda, jadi ambil
    // hanya field yang dikenal dan benar-benar berupa string.
    if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
    const out: ApplicantProfile = {}
    for (const f of FIELDS) {
      if (typeof data[f] === 'string' && data[f]) out[f] = data[f]
    }
    return out
  } catch {
    return {}
  }
}

// ─── Store (localStorage sebagai sumber eksternal) ──────────────────────────

const listeners = new Set<() => void>()
// Cache snapshot supaya getSnapshot mengembalikan referensi yang sama selama
// nilainya tidak berubah — useSyncExternalStore akan looping tanpa ini.
let snapshot: string | null = null
let snapshotRead = false

function subscribe(onChange: () => void): () => void {
  listeners.add(onChange)
  // Tab lain yang menyimpan profil ikut memperbarui tab ini.
  const onStorage = (e: StorageEvent) => {
    if (e.key !== null && e.key !== STORAGE_KEY) return
    snapshotRead = false
    onChange()
  }
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(onChange)
    window.removeEventListener('storage', onStorage)
  }
}

function getSnapshot(): string | null {
  if (!snapshotRead) {
    try {
      // "{}" (bukan null) menandai pembacaan sudah terjadi walau datanya kosong.
      snapshot = localStorage.getItem(STORAGE_KEY) ?? '{}'
    } catch {
      snapshot = '{}'
    }
    snapshotRead = true
  }
  return snapshot
}

// Di server tidak ada localStorage: kembalikan null agar markup awal konsisten.
function getServerSnapshot(): string | null {
  return null
}

function writeStorage(value: string | null) {
  try {
    if (value === null) localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, value)
  } catch {
    // Storage penuh atau mode privat — prefill hanya kenyamanan, jangan sampai
    // menggagalkan lamaran yang sudah terkirim. Nilai in-memory tetap dipakai.
  }
  snapshot = value ?? '{}'
  snapshotRead = true
  for (const l of listeners) l()
}

/**
 * Menyimpan identitas pelamar di perangkatnya sendiri supaya lamaran kedua dan
 * seterusnya tidak perlu mengetik ulang data yang tidak berubah.
 *
 * Hanya localStorage — tidak pernah dikirim ke server selain sebagai isi form
 * yang memang disubmit pelamar.
 */
export function useApplicantProfile() {
  // useSyncExternalStore, bukan useState+useEffect: localStorage adalah sumber
  // di luar React, dan API ini memang dirancang untuk itu — snapshot server
  // dibedakan secara eksplisit sehingga tidak ada hydration mismatch, dan tidak
  // perlu setState di dalam effect.
  const raw = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
  const profile = useMemo(() => parseProfile(raw), [raw])
  // Snapshot server selalu null; begitu bernilai string (termasuk "{}"), berarti
  // pembacaan di klien sudah terjadi dan form boleh mengisi.
  const loaded = raw !== null

  const saveProfile = useCallback((data: ApplicantProfile) => {
    const next: ApplicantProfile = {}
    for (const f of FIELDS) {
      const v = data[f]
      if (typeof v === 'string' && v.trim()) next[f] = v.trim()
    }
    writeStorage(JSON.stringify(next))
  }, [])

  const clearProfile = useCallback(() => writeStorage(null), [])

  return { profile, loaded, saveProfile, clearProfile }
}
