import { useEffect, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'

export function useCategories() {
  const [data, setData] = useState<Array<{ label: string; value: string }> | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const abortRef = useRef<AbortController | null>(null)

  const enabled = import.meta.env.VITE_USE_CATEGORIES_API === 'true'

  async function fetchCategories(signal?: AbortSignal) {
    setLoading(true)
    setError(null)
    try {
      
      const res = await apiFetch('/api/categories', { signal })
      if (res.status === 404) { setData([]); return }
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = (await res.json()) as Array<{ label: string; value: string }>
      setData(json)
    } catch (e) {
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
    void fetchCategories(abortRef.current.signal)
  }

  useEffect(() => {
    if (!enabled) return
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    void fetchCategories(abortRef.current.signal)
    return () => abortRef.current?.abort()
  }, [enabled])

  return { data, loading, error, refetch }
}
