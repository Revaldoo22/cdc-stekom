'use client'

import { useState, useEffect, useCallback } from 'react'

const STORAGE_KEY = 'cdc_recent_jobs'
const MAX_RECENT = 10

function readStorage(): string[] {
  if (typeof window === 'undefined') return []
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')
  } catch {
    return []
  }
}

export function useRecentJobs() {
  const [recentIds, setRecentIds] = useState<string[]>([])

  useEffect(() => {
    setRecentIds(readStorage())
  }, [])

  const addRecent = useCallback((jobId: string) => {
    setRecentIds((prev) => {
      const next = [jobId, ...prev.filter((id) => id !== jobId)].slice(0, MAX_RECENT)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      return next
    })
  }, [])

  return { recentIds, addRecent }
}
