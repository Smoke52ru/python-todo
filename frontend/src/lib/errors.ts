import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'
import type { SerializedError } from '@reduxjs/toolkit'

export function getErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  fallback = 'Something went wrong',
): string {
  if (!error) return fallback

  if ('status' in error) {
    const data = error.data
    if (typeof data === 'object' && data && 'detail' in data) {
      const detail = (data as { detail: unknown }).detail
      if (typeof detail === 'string') return detail
    }
    return `${fallback} (${String(error.status)})`
  }

  if ('message' in error && error.message) {
    return error.message
  }

  return fallback
}
