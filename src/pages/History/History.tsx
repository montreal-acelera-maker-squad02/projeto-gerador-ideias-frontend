import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import IdeaHistoryCard from '@/components/IdeiaCard/IdeaHistoryCard'
import FilterHistory from '@/components/FilterHistory'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { useIdeas } from '@/hooks/useIdeas'
import { THEMES } from '@/constants/themes'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { ideaService } from '@/services/ideaService'
import { HISTORY_CACHE_KEY } from '@/constants/storageKeys'
import { subscribeHistoryRefresh } from '@/events/historyEvents'
import {
  fetchFavoriteIds,
  updateFavoriteCache,
} from './favoritesCache'

const HISTORY_POLL_INTERVAL = Number(import.meta.env.VITE_HISTORY_POLL_INTERVAL ?? 20_000)


export default function HistoryPage() {
  const [filters, setFilters] = useState<{ category: string; startDate: string; endDate: string }>({
    category: '',
    startDate: '',
    endDate: '',
  })
  const [page, setPage] = useState<number>(1)
  const pageSize = 5

  const initialIdeas = useMemo(() => {
    if (typeof window === 'undefined') return []
    try {
      const raw = window.localStorage.getItem(HISTORY_CACHE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Array<Omit<Idea, 'timestamp'> & { timestamp: string }>
      return parsed.map((idea) => ({
        ...idea,
        timestamp: new Date(idea.timestamp),
      }))
    } catch (error) {
      console.warn('Falha ao carregar cache do histï¿½rico', error)
      return []
    }
  }, [])

  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const { data: ideasData, loading: ideasLoading, refetch } = useIdeas(filters)
  const { darkMode } = useTheme()

  useEffect(() => {
    if (!Array.isArray(ideasData)) return
    setIdeas((current) => mergeIdeas(ideasData, current))

    let cancelled = false

    async function syncFavorites() {
      try {
        const favoriteIds = await fetchFavoriteIds()
        if (cancelled) return
        setIdeas((current) =>
          current.map((idea) => ({
            ...idea,
            isFavorite: favoriteIds.has(idea.id),
          }))
        )
      } catch (err) {
        if (!cancelled) {
          console.error('Erro ao sincronizar favoritos:', err)
        }
      }
    }

    void syncFavorites()

    return () => {
      cancelled = true
    }
  }, [ideasData])

  useEffect(() => {
    setPage(1)
  }, [filters.category, filters.startDate, filters.endDate])

  useEffect(() => {
    if (typeof window === 'undefined' || !Number.isFinite(HISTORY_POLL_INTERVAL) || HISTORY_POLL_INTERVAL <= 0) {
      return
    }
    const intervalId = window.setInterval(() => {
      refetch({ ignoreCache: true, silent: true })
    }, HISTORY_POLL_INTERVAL)
    return () => window.clearInterval(intervalId)
  }, [refetch])

  useEffect(() => {
    if (typeof document === 'undefined') {
      return
    }
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refetch({ ignoreCache: true, silent: true })
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refetch])

  useEffect(() => {
    refetch({ ignoreCache: true, silent: initialIdeas.length > 0 })
  }, [initialIdeas.length, refetch])

  useEffect(() => {
    const unsubscribe = subscribeHistoryRefresh(() => {
      refetch({ ignoreCache: true })
    })
    return unsubscribe
  }, [refetch])

  const handleToggleFavorite = useCallback(async (id: string) => {
    let optimisticValue: boolean | null = null
    setIdeas((prev) =>
      prev.map((idea) => {
        if (idea.id !== id) return idea
        optimisticValue = !idea.isFavorite
        return { ...idea, isFavorite: optimisticValue }
      })
    )
    if (optimisticValue === null) return

    try {
      await ideaService.toggleFavorite(id, optimisticValue)
      updateFavoriteCache(id, optimisticValue)
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err)
      const revertValue = !(optimisticValue ?? false)
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === id ? { ...idea, isFavorite: revertValue } : idea))
      )
    }
  }, [])

  const handleDelete = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const filtered = ideas.filter((i) => {
    const byCat =
      !filters.category ||
      (typeof i.theme === 'string' && i.theme.toLowerCase() === filters.category.toLowerCase())
    const ts = new Date(i.timestamp).getTime()
    const startOk = !filters.startDate || ts >= new Date(`${filters.startDate}T00:00:00`).getTime()
    const endOk =
      !filters.endDate || ts <= new Date(`${filters.endDate}T23:59:59.999`).getTime()
    return byCat && startOk && endOk
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const contentClass = cn(
    'rounded-lg border p-6 text-sm h-32 flex items-center justify-center',
    darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-gray-200 text-gray-600'
  )

  let listContent: ReactNode = paginated.map((idea) => (
    <IdeaHistoryCard key={idea.id} idea={idea} onToggleFavorite={handleToggleFavorite} onDelete={handleDelete} />
  ))

  if (ideasLoading) {
    listContent = <div className={contentClass}>Carregando ideias...</div>
  } else if (filtered.length === 0) {
    listContent = <div className={contentClass}>Nenhuma ideia encontrada.</div>
  }

  const hasIdeas = filtered.length > 0

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const serializable = ideas.map((idea) => ({
        ...idea,
        timestamp: idea.timestamp instanceof Date ? idea.timestamp.toISOString() : idea.timestamp,
      }))
      window.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(serializable))
    } catch (error) {
      console.warn('Falha ao salvar cache do histï¿½rico', error)
    }
  }, [ideas])

  return (
    <div
      className={cn(
        'max-w-7xl mx-auto px-8 py-12 relative z-10',
        darkMode ? 'text-slate-100' : 'text-gray-900'
      )}
    >
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <FilterHistory
            fixed={false}
            categories={[{ label: 'Todas', value: '' }, ...THEMES]}
            value={filters}
            onChange={(v) =>
              setFilters({
                category: v.category ?? '',
                startDate: v.startDate ?? '',
                endDate: v.endDate ?? '',
              })
            }
          />
        </div>

        <div className="flex flex-col gap-6">
          {listContent}

          {hasIdeas && (
            <div className="flex items-center justify-center pt-2">
              <nav
                aria-label="Paginacao"
                className={cn(
                  'inline-flex items-stretch rounded-lg overflow-hidden',
                  darkMode ? 'border border-slate-700 bg-slate-900' : 'border border-gray-300 bg-white shadow-sm'
                )}
              >
                <button
                  aria-label="Primeira pagina"
                  onClick={() => setPage(1)}
                  disabled={currentPage <= 1}
                  className={cn(
                    'px-3 py-1.5 text-sm transition-colors',
                    darkMode ? 'text-slate-200 hover:bg-slate-800' : 'text-gray-700 hover:bg-gray-100',
                    currentPage <= 1 && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {'ï¿½'}
                </button>
                <button
                  aria-label="Pagina anterior"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className={cn(
                    'px-3 py-1.5 text-sm border-l',
                    darkMode
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100',
                    currentPage <= 1 && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {'ï¿½'}
                </button>
                <span
                  className={cn(
                    'px-4 py-1.5 text-sm font-semibold border-l',
                    darkMode ? 'bg-slate-700 text-white border-slate-700' : 'bg-blue-50 text-blue-700 border-gray-300'
                  )}
                >
                  {currentPage}
                </span>
                <button
                  aria-label="Proxima pagina"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'px-3 py-1.5 text-sm border-l',
                    darkMode
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100',
                    currentPage >= totalPages && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {'ï¿½'}
                </button>
                <button
                  aria-label="Ultima pagina"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    'px-3 py-1.5 text-sm border-l',
                    darkMode
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-100',
                    currentPage >= totalPages && 'opacity-40 cursor-not-allowed'
                  )}
                >
                  {'ï¿½'}
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function mergeIdeas(incoming: Idea[], current: Idea[]): Idea[] {
  if (current.length === 0) return incoming

  const currentMap = new Map(current.map((idea) => [idea.id, idea]))
  const incomingMap = new Map(incoming.map((idea) => [idea.id, idea]))

  let hasUpdates = false
  const updatedCurrent = current.map((idea) => {
    const fresh = incomingMap.get(idea.id)
    if (!fresh) return idea

    const needsUpdate =
      fresh.content !== idea.content ||
      fresh.context !== idea.context ||
      fresh.theme !== idea.theme ||
      new Date(fresh.timestamp).getTime() !== new Date(idea.timestamp).getTime()

    if (!needsUpdate) {
      return idea
    }

    hasUpdates = true
    return {
      ...fresh,
      isFavorite: idea.isFavorite,
    }
  })

  const newIdeas: Idea[] = []
  incoming.forEach((idea) => {
    if (!currentMap.has(idea.id)) {
      newIdeas.push(idea)
    }
  })

  if (newIdeas.length === 0 && !hasUpdates) {
    return current
  }

  return newIdeas.length > 0 ? [...newIdeas, ...updatedCurrent] : updatedCurrent
}














