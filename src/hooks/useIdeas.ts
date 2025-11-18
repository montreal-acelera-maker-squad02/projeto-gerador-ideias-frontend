import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { apiFetch } from '@/lib/api'

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
  const enabled = import.meta.env.VITE_USE_IDEAS_API !== 'false'

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

  const refetch = useCallback((options?: { ignoreCache?: boolean; silent?: boolean }) => {
    abortRef.current?.abort()
    abortRef.current = new AbortController()
    void fetchIdeas(abortRef.current.signal, {
      silent: options?.silent ?? false,
      force: options?.ignoreCache,
    })
  }, [fetchIdeas])

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

export function pushIdeaToCache(idea: Idea, query: string = CACHE_KEY_EMPTY) {
  ensureCacheEntry(query)
  const entry = ideasCache.get(query)!
  const deduped = entry.data.filter((i) => i.id !== idea.id)
  entry.data = [idea, ...deduped]
  entry.fetchedAt = Date.now()
}

function ensureCacheEntry(query: string) {
  if (!ideasCache.has(query)) {
    ideasCache.set(query, { data: [], fetchedAt: 0 })
  }
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
      const rawJson: unknown = await res.json()
      const items = extractArrayPayload(rawJson)
      const parsed: Idea[] = items.map((payload) => mapCommunityIdeaPayload(payload))
      ideasCache.set(key, { data: parsed, fetchedAt: Date.now() })
      return parsed
    } finally {
      pendingFetches.delete(key)
    }
  })()

  pendingFetches.set(key, fetchPromise)
  return fetchPromise
}

function mapCommunityIdeaPayload(payload: Record<string, any>): Idea {
  const sourceTs = payload.timestamp ?? payload.createdAt ?? payload.created_at ?? Date.now()
  return {
    id: ensureIdeaId(payload),
    theme: normalizeThemeLabel(payload.theme),
    content: sanitizeQuotedText(payload.content),
    context: sanitizeQuotedText(payload.context),
    timestamp: parseTimestamp(sourceTs),
    isFavorite: Boolean(payload.isFavorite),
    responseTime: pickNumericValue(
      payload.executionTimeMs,
      payload.execution_time_ms,
      payload.responseTime,
      payload.durationMs,
      payload.metrics?.executionTime,
      payload.stats?.executionTime
    ),
    author: pickAuthorFromPayload(payload),
    tokens: pickNumericValue(
      payload.tokens,
      payload.tokenCount,
      payload.tokensUsed,
      payload.token_usage,
      payload.usage?.totalTokens,
      payload.tokenStats?.total,
      payload.stats?.tokens,
      payload.metadata?.tokens
    ),
    modelUsed: pickModelFromPayload(payload),
  }
}

function ensureIdeaId(payload: Record<string, any>): string {
  const candidates = [payload.id, payload.ideaId, payload.idea_id, payload.uuid, payload._id]
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue
    const str = String(candidate).trim()
    if (str) {
      return str
    }
  }
  return generateSecureIdeaId()
}

function generateSecureIdeaId() {
  const cryptoObj = globalThis.crypto ?? (globalThis as any).msCrypto
  if (cryptoObj?.randomUUID) {
    return cryptoObj.randomUUID()
  }

  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(16)
    cryptoObj.getRandomValues(bytes)
    return Array.from(bytes)
      .map((value) => value.toString(16).padStart(2, "0"))
      .join("")
  }

  throw new Error("Unable to generate secure idea ID")
}

function pickAuthorFromPayload(payload: Record<string, any>): string | undefined {
  const candidates: Array<unknown> = [
    payload.userName,
    payload.username,
    payload.user_name,
    payload.author,
    payload.owner,
    payload.createdBy,
    payload.user?.name,
    payload.user?.username,
    payload.user?.fullName,
    payload.metadata?.author,
    payload.metadata?.userName,
  ]
  for (const candidate of candidates) {
    if (candidate === undefined || candidate === null) continue
    if (typeof candidate === 'string') {
      const trimmed = candidate.trim()
      if (trimmed) return trimmed
      continue
    }
    if (typeof candidate === 'number' || typeof candidate === 'boolean') {
      return String(candidate)
    }
  }
  return undefined
}

function pickNumericValue(...values: Array<unknown>): number | undefined {
  for (const value of values) {
    if (typeof value === 'number' && Number.isFinite(value)) {
      return value
    }
    if (typeof value === 'string' && value.trim() !== '') {
      const parsed = Number(value)
      if (!Number.isNaN(parsed)) {
        return parsed
      }
    }
    if (typeof value === 'object' && value !== null) {
      const maybeNumber = (value as { total?: number; value?: number; amount?: number }).total ??
        (value as { value?: number }).value ??
        (value as { amount?: number }).amount
      if (typeof maybeNumber === 'number' && Number.isFinite(maybeNumber)) {
        return maybeNumber
      }
    }
  }
  return undefined
}

function pickModelFromPayload(payload: Record<string, any>): string | undefined {
  const candidates = [payload.modelUsed, payload.model_used, payload.model]
  for (const candidate of candidates) {
    if (typeof candidate !== 'string') continue
    const trimmed = candidate.trim()
    if (trimmed) {
      return trimmed
    }
  }
  return undefined
}

function parseTimestamp(input: unknown): Date {
  if (input instanceof Date) return input

  if (typeof input === 'number') {
    const ms = input > 1e12 ? input : input * 1000
    return new Date(ms)
  }

  if (typeof input === 'string') {
    let s = input.trim().replace(',', '.')

    // Handle plain YYYY-MM-DD early
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return new Date(s + 'T00:00:00')

    // Try to parse ISO-like date/time by splitting components to keep regex simple
    const datePart = s.slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(datePart) && (s.length === 10 || s[10] === 'T' || s[10] === ' ')) {
      const ymd = datePart.split('-')
      const y = Number(ymd[0])
      const mo = Number(ymd[1]) - 1
      const d = Number(ymd[2])

      const rest = s.length === 10 ? '' : s.slice(11) // skip 'T' or space
      // Extract timezone if present at the end
      const tzMatch = rest.match(/(Z|[+-]\d{2}:\d{2})$/)
      const tz = tzMatch ? tzMatch[1] : ''
      const timeStr = tzMatch ? rest.slice(0, -tzMatch[0].length) : rest

      if (!timeStr) {
        // date only -> local midnight
        return new Date(y, mo, d, 0, 0, 0, 0)
      }

      // timeStr like "HH:MM", "HH:MM:SS" or "HH:MM:SS.sss"
      const [hPart, mPart, sPart = '0'] = timeStr.split(':')
      const H = Number(hPart || 0)
      const Mi = Number(mPart || 0)

      let S = 0
      let frac = 0
      if (sPart) {
        const [secRaw, fracRaw] = sPart.split('.')
        S = Number(secRaw || 0)
        frac = fracRaw ? Number(String(fracRaw).slice(0, 3).padEnd(3, '0')) : 0
      }

      if (!tz) {
        // no timezone -> treat as local time
        return new Date(y, mo, d, H, Mi, S, frac)
      }

      // timezone present -> compute UTC ms manually
      let utcMs = Date.UTC(y, mo, d, H, Mi, S, frac)
      if (tz !== 'Z') {
        const sign = tz.startsWith('-') ? -1 : 1
        const [tzh, tzm] = tz.slice(1).split(':').map((v) => Number(v))
        const offsetMin = sign * (tzh * 60 + tzm)
        utcMs -= offsetMin * 60_000
      }
      return new Date(utcMs)
    }

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
  return capitalizeFirst(input.trim().toLowerCase())
}

function capitalizeFirst(s: string): string {
  if (!s) return s
  return s.charAt(0).toUpperCase() + s.slice(1)
}

function extractArrayPayload(raw: unknown): Array<Record<string, any>> {
  if (Array.isArray(raw)) {
    return raw as Array<Record<string, any>>
  }
  if (raw && typeof raw === 'object') {
    const candidateKeys = ['data', 'items', 'results', 'history', 'ideas']
    const obj = raw as Record<string, any>
    for (const key of candidateKeys) {
      if (Array.isArray(obj[key])) {
        return obj[key] as Array<Record<string, any>>
      }
    }
    for (const value of Object.values(obj)) {
      if (Array.isArray(value)) {
        return value as Array<Record<string, any>>
      }
    }
  }
  console.warn('Resposta inesperada ao buscar o histórico', raw)
  return []
}

