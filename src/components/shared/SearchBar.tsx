'use client'

import { useCallback, useRef } from 'react'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function SearchBar({
  value,
  onChange,
  placeholder = 'Cari lowongan, perusahaan, atau skill...',
  className,
}: SearchBarProps) {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value
      if (debounceRef.current) clearTimeout(debounceRef.current)
      debounceRef.current = setTimeout(() => onChange(v), 300)
    },
    [onChange],
  )

  return (
    <div className={`relative flex items-center ${className ?? ''}`}>
      <Search className="absolute left-3 h-4 w-4 text-brand-muted pointer-events-none" aria-hidden="true" />
      <Input
        type="search"
        defaultValue={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-9 pr-9"
        aria-label="Cari lowongan kerja"
      />
      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange('')}
          className="absolute right-1 h-7 w-7 p-0 cursor-pointer"
          aria-label="Hapus pencarian"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      )}
    </div>
  )
}
