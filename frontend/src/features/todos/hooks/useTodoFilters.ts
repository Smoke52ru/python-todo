import type { TodoStatusFilter } from '../types/todo'

export function readFiltersFromUrl(): { q: string; status: TodoStatusFilter } {
  const params = new URLSearchParams(window.location.search)
  const q = params.get('q') ?? ''
  const statusParam = params.get('status')
  const status: TodoStatusFilter =
    statusParam === 'active' || statusParam === 'completed' ? statusParam : 'all'
  return { q, status }
}

export function writeFiltersToUrl(q: string, status: TodoStatusFilter) {
  const params = new URLSearchParams()
  if (q.trim()) params.set('q', q.trim())
  if (status !== 'all') params.set('status', status)
  const search = params.toString()
  window.history.replaceState(null, '', search ? `?${search}` : window.location.pathname)
}
