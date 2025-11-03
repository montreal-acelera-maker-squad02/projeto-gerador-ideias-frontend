import { useEffect, useMemo, useRef, useState } from 'react'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'

export type IdeasFilters = {
  category?: string // UI label; mapeado para 'theme' na API
  startDate?: string // formato UI: YYYY-MM-DD
  endDate?: string   // formato UI: YYYY-MM-DD
}

export function useIdeas(filters: IdeasFilters) {
  const [data, setData] = useState<Idea[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const abortRef = useRef<AbortController | null>(null)
  const enabled = import.meta.env.VITE_USE_IDEAS_API === 'true'

  function toLocalDateTime(date?: string, end?: boolean) {
    if (!date) return undefined
    return end ? `${date}T23:59:59` : `${date}T00:00:00`
  }

  const query = useMemo(() => {
    const params = new URLSearchParams()
    if (filters.category) params.set('theme', filters.category)
    const start = toLocalDateTime(filters.startDate)
    const end = toLocalDateTime(filters.endDate, true)
    if (start) params.set('startDate', start)
    if (end) params.set('endDate', end)
    return params.toString()
  }, [filters.category, filters.startDate, filters.endDate])

  async function fetchIdeas(signal?: AbortSignal) {
    setLoading(true)
    setError(null)
    try {
      // Endpoint real do histórico com filtros opcionais
      const url = '/api/ideas/history' + (query ? `?${query}` : '')
      const res = await fetch(url, { signal })
      if (res.status === 404) { setData([]); return }
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = (await res.json()) as Idea[]
      setData(json)
    } catch (e) {
      // Se for abort, ignore
      // @ts-expect-error narrow
      if (e?.name === 'AbortError') return
      setError(e)
    } finally {
      setLoading(false)
    }
  }

  function refetch() {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    void fetchIdeas(abortRef.current.signal)
  }

  useEffect(() => {
    if (!enabled) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    void fetchIdeas(abortRef.current.signal)
    return () => abortRef.current?.abort()
  }, [query, enabled])

  return { data, loading, error, refetch }
}
