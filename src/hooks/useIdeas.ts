import { useEffect, useMemo, useRef, useState } from 'react'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { apiFetch } from '@/lib/api'
import { THEMES } from '@/constants/themes'

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
      const res = await apiFetch(url, { signal })
      if (res.status === 404) { setData([]); return }
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = (await res.json()) as Array<Record<string, any>>
      const parsed: Idea[] = json.map((it) => {
        const sourceTs = (it as any).timestamp ?? (it as any).createdAt ?? (it as any).created_at
        return {
          ...it,
          theme: normalizeThemeLabel(it.theme),
          content: sanitizeQuotedText(it.content),
          timestamp: parseTimestamp(sourceTs),
        } as Idea
      })
      setData(parsed)
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

function parseTimestamp(input: unknown): Date {
  // Already a Date
  if (input instanceof Date) return input

  // Epoch seconds/ms
  if (typeof input === 'number') {
    const ms = input > 1e12 ? input : input * 1000
    return new Date(ms)
  }

  if (typeof input === 'string') {
    let s = input.trim().replace(',', '.')

    // Regex: YYYY-MM-DD [T ] hh:mm:ss(.fraction)? (Z|±hh:mm)?
    const m = s.match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?)?(Z|[+-]\d{2}:\d{2})?$/
    )
    if (m) {
      const [_, yy, MM, dd, hh, mm, ss, fracRaw, tz] = m
      const y = Number(yy)
      const mo = Number(MM) - 1
      const d = Number(dd)
      const H = hh ? Number(hh) : 0
      const Mi = mm ? Number(mm) : 0
      const S = ss ? Number(ss) : 0
      const frac = fracRaw ? Number(String(fracRaw).slice(0, 3).padEnd(3, '0')) : 0

      if (!tz || tz === '') {
        // Sem timezone: interpretar como horário local
        return new Date(y, mo, d, H, Mi, S, frac)
      }

      // Com timezone
      // Base UTC
      let utcMs = Date.UTC(y, mo, d, H, Mi, S, frac)
      if (tz !== 'Z') {
        const sign = tz.startsWith('-') ? -1 : 1
        const [tzh, tzm] = tz.slice(1).split(':').map((v) => Number(v))
        const offsetMin = sign * (tzh * 60 + tzm)
        utcMs -= offsetMin * 60_000
      }
      return new Date(utcMs)
    }

    // Date only
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00')

    // Última tentativa usando o parser nativo
    const dflt = new Date(s)
    if (!isNaN(dflt.getTime())) return dflt
  }

  // Fallback seguro: retorna epoch 0 (evita Invalid Date no render)
  return new Date(0)
}

function sanitizeQuotedText(text: unknown): string {
  if (typeof text !== 'string') return String(text ?? '')
  const t = text.trim()
  const pairs: Array<[string, string]> = [["\"","\""], ['“','”'], ["'","'"]]
  for (const [start, end] of pairs) {
    if (t.startsWith(start) && t.endsWith(end) && t.length >= 2) {
      return t.slice(1, -1)
    }
  }
  return t
}

function normalizeThemeLabel(input: unknown): string {
  if (typeof input !== 'string') return String(input ?? '')
  const raw = input.trim().toLowerCase()
  const found = THEMES.find((t) => t.value.toLowerCase() === raw || t.label.toLowerCase() === raw)
  return found ? found.label : capitalizeFirst(raw)
}

function capitalizeFirst(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}
