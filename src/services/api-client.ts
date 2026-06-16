import { API_BASE_URL } from '@/config/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

interface ApiFetchOptions extends Omit<RequestInit, 'signal'> {
  timeout?: number
  retries?: number
  revalidate?: number
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function apiFetch<T>(
  path: string,
  { timeout = 10000, retries = 3, revalidate, ...init }: ApiFetchOptions = {},
): Promise<T> {
  const url = `${API_BASE_URL}${path}`
  const nextOptions = revalidate !== undefined ? { next: { revalidate } } : { cache: 'force-cache' as RequestCache }

  let lastError: Error = new ApiError(0, 'Unknown error')

  for (let attempt = 0; attempt < retries; attempt++) {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeout)

    try {
      const res = await fetch(url, {
        ...nextOptions,
        ...init,
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...init.headers,
        },
      })

      clearTimeout(timer)

      if (!res.ok) {
        throw new ApiError(res.status, `HTTP ${res.status}: ${res.statusText}`)
      }

      return res.json() as Promise<T>
    } catch (err) {
      clearTimeout(timer)
      lastError = err instanceof Error ? err : new Error(String(err))

      if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
        throw lastError
      }

      if (attempt < retries - 1) {
        await delay(300 * Math.pow(2, attempt))
      }
    }
  }

  throw lastError
}
