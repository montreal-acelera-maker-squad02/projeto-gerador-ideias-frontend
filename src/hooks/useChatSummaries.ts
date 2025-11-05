import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'
import type { ChatIdeaSummary } from '@/types/chat'

type State = {
  data: ChatIdeaSummary[]
  loading: boolean
  error: string | null
}

const initialState: State = {
  data: [],
  loading: false,
  error: null,
}

function normalizeSummary(item: any): ChatIdeaSummary | null {
  const ideaId = item?.ideaId ?? item?.id ?? item?.ideaID ?? item?.idea_id
  if (!ideaId) return null

  const rawTitle =
    item?.title ??
    item?.label ??
    item?.name ??
    item?.theme ??
    item?.summary ??
    `Ideia ${ideaId}`

  const rawSummary =
    item?.summary ??
    item?.description ??
    item?.shortDescription ??
    item?.resume ??
    rawTitle

  return {
    ideaId: String(ideaId),
    title: String(rawTitle ?? '').trim() || 'Ideia',
    summary: String(rawSummary ?? '').trim(),
    createdAt: item?.createdAt ?? item?.created_at ?? null,
  }
}

export function useChatSummaries(enabled: boolean) {
  const [{ data, loading, error }, setState] = useState(initialState)

  const fetchSummaries = useCallback(
    async (force = false) => {
      if (!enabled && !force) return
      setState((prev) => ({ ...prev, loading: true, error: null }))

      try {
        const response = await apiFetch('/api/chat/ideas/summary')
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`)
        }

        const payload = await response.json()
        const parsed = Array.isArray(payload)
          ? payload
              .map(normalizeSummary)
              .filter((item): item is ChatIdeaSummary => Boolean(item))
          : []

        setState({ data: parsed, loading: false, error: null })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Não foi possível carregar os resumos das ideias.'
      setState((prev) => ({ ...prev, loading: false, error: message }))
    }
    },
    [enabled]
  )

  useEffect(() => {
    if (!enabled) return
    void fetchSummaries()
  }, [enabled, fetchSummaries])

  const refresh = useCallback(() => fetchSummaries(true), [fetchSummaries])

  return {
    summaries: data,
    loading,
    error,
    refresh,
  }
}
