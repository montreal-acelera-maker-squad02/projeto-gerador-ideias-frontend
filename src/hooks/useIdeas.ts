import { useEffect, useMemo, useRef, useState } from 'react'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { apiFetch } from '@/lib/api'
import { THEMES } from '@/constants/themes'

export type IdeasFilters = {
  category?: string
  startDate?: string
  endDate?: string
}

const CACHE_KEY_EMPTY = '__all__'
const CACHE_TTL_MS = Number(import.meta.env.VITE_IDEAS_CACHE_TTL ?? 2 * 60 * 1000)

const ideasCache = new Map<
  string,
  {
    data: Idea[]
    fetchedAt: number
  }
>()
const pendingFetches = new Map<string, Promise<Idea[]>>()

export function useIdeas(filters: IdeasFilters) {
  const [data, setData] = useState<Idea[] | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<unknown>(null)
  const abortRef = useRef<AbortController | null>(null)
  const enabled = import.meta.env.VITE_USE_IDEAS_API === 'true'

  const query = useMemo(() => buildQuery(filters), [filters.category, filters.startDate, filters.endDate])
  const cacheKey = query || CACHE_KEY_EMPTY

  const fetchIdeas = useMemo(() => {
    return async (
      signal?: AbortSignal,
      options: { silent?: boolean; force?: boolean } = {}
    ) => {
      if (!options.silent) {
        setLoading(true)
      }
      setError(null)
      try {
        const result = await prefetchIdeasInternal({ query, signal, force: options.force })
        setData(result)
      } catch (e) {
        // @ts-expect-error narrow
        if (e?.name === 'AbortError') return
        setError(e)
      } finally {
        if (!options.silent) {
          setLoading(false)
        }
      }
    }
  }, [query])

  function refetch(options?: { ignoreCache?: boolean; silent?: boolean }) {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    void fetchIdeas(abortRef.current.signal, {
      silent: options?.silent ?? false,
      force: options?.ignoreCache,
    })
  }

  useEffect(() => {
    if (!enabled) {
      setData(null)
      setLoading(false)
      return
    }

    const cached = ideasCache.get(cacheKey)
    if (cached) {
      setData(cached.data)
      setLoading(false)
    }

    const isFresh = cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS
    if (isFresh) {
      return
    }

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller
    void fetchIdeas(controller.signal, { silent: Boolean(cached) })
    return () => controller.abort()
  }, [cacheKey, enabled, fetchIdeas])

  return { data, loading, error, refetch }
}

export async function prefetchIdeas(filters: IdeasFilters = {}) {
  await prefetchIdeasInternal({ query: buildQuery(filters) }).catch((error) => {
    if (error?.name === 'AbortError') return
    console.warn('Não foi possível pré-carregar o histórico', error)
  })
}

function buildQuery(filters: IdeasFilters): string {
  const params = new URLSearchParams()
  if (filters.category) params.set('theme', filters.category)
  if (filters.startDate) params.set('startDate', `${filters.startDate}T00:00:00`)
  if (filters.endDate) params.set('endDate', `${filters.endDate}T23:59:59`)
  return params.toString()
}

async function prefetchIdeasInternal({
  query,
  signal,
  force = false,
}: {
  query: string
  signal?: AbortSignal
  force?: boolean
}): Promise<Idea[]> {
  const key = query || CACHE_KEY_EMPTY

  if (!force) {
    const cached = ideasCache.get(key)
    if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
      return cached.data
    }
  } else {
    ideasCache.delete(key)
  }

  if (pendingFetches.has(key)) {
    return pendingFetches.get(key)!
  }

  const fetchPromise = (async () => {
    try {
      const url = '/api/ideas/history' + (query ? `?${query}` : '')
      const res = await apiFetch(url, { signal })
      if (res.status === 404) {
        const empty: Idea[] = []
        ideasCache.set(key, { data: empty, fetchedAt: Date.now() })
        return empty
      }
      if (!res.ok) throw new Error(`Erro ${res.status}`)
      const json = (await res.json()) as Array<Record<string, any>>
      const parsed: Idea[] = json.map((it) => {
        const sourceTs = (it as any).timestamp ?? (it as any).createdAt ?? (it as any).created_at
        return {
          ...it,
          theme: normalizeThemeLabel(it.theme),
          content: sanitizeQuotedText(it.content),
          context: sanitizeQuotedText(it.context),
          timestamp: parseTimestamp(sourceTs),
        } as Idea
      })
      ideasCache.set(key, { data: parsed, fetchedAt: Date.now() })
      return parsed
    } finally {
      pendingFetches.delete(key)
    }
  })()

  pendingFetches.set(key, fetchPromise)
  return fetchPromise
}

function parseTimestamp(input: unknown): Date {
  if (input instanceof Date) return input

  if (typeof input === 'number') {
    const ms = input > 1e12 ? input : input * 1000
    return new Date(ms)
  }

  if (typeof input === 'string') {
    let s = input.trim().replace(',', '.')

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
        return new Date(y, mo, d, H, Mi, S, frac)
      }

      let utcMs = Date.UTC(y, mo, d, H, Mi, S, frac)
      if (tz !== 'Z') {
        const sign = tz.startsWith('-') ? -1 : 1
        const [tzh, tzm] = tz.slice(1).split(':').map((v) => Number(v))
        const offsetMin = sign * (tzh * 60 + tzm)
        utcMs -= offsetMin * 60_000
      }
      return new Date(utcMs)
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00')

    const dflt = new Date(s)
    if (!isNaN(dflt.getTime())) return dflt
  }

  return new Date(0)
}

function sanitizeQuotedText(text: unknown): string {
  if (typeof text !== 'string') return String(text ?? '')
  const t = text.trim()
  const pairs: Array<[string, string]> = [
    ['"', '"'],
    ['�?o', '�??'],
    ["'", "'"],
  ]
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
