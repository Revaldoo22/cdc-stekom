'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'cdc_saved_jobs'
const MAX_SAVED = 50

function readStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useSavedJobs() {
  const [savedIds, setSavedIds] = useState<string[]>([])

  useEffect(() => {
    setSavedIds(readStorage())
  }, [])

  const toggleSave = useCallback((jobId: string) => {
    setSavedIds((prev) => {
      const next = prev.includes(jobId)
        ? prev.filter((id) => id !== jobId)
        : [jobId, ...prev].slice(0, MAX_SAVED)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  const isSaved = useCallback((jobId: string) => savedIds.includes(jobId), [savedIds])

  return { savedIds, toggleSave, isSaved }
}
