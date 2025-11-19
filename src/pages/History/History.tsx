import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react'
import FilterHistory, { type FilterHistoryOption } from '@/components/FilterHistory'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { useIdeas } from '@/hooks/useIdeas'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import { ideaService } from '@/services/ideaService'
import { subscribeHistoryRefresh } from '@/events/historyEvents'
import { fetchFavoriteIds } from './favoritesCache'
import CommunityIdeaCard, { type CommunityIdea } from '@/components/IdeiaCard/CommunityIdeaCard'
import { themeService, type Theme } from '@/services/themeService'

const HISTORY_POLL_INTERVAL = Number(import.meta.env.VITE_HISTORY_POLL_INTERVAL ?? 20_000)
const HISTORY_CACHE_KEY = 'history_cached_ideas'
const FALLBACK_THEME_OPTIONS: FilterHistoryOption[] = [
  { label: 'Todas', value: '' },
  { label: 'Tecnologia', value: 'tecnologia' },
  { label: 'Educacao', value: 'educacao' },
  { label: 'Marketing', value: 'marketing' },
  { label: 'Viagem', value: 'viagem' },
  { label: 'Saude', value: 'saude' },
  { label: 'Negocio', value: 'negocio' },
]

export default function HistoryPage() {
  const [filters, setFilters] = useState<{ category: string; startDate: string; endDate: string }>({
    category: '',
    startDate: '',
    endDate: '',
  })
  const [page, setPage] = useState<number>(1)
  const pageSize = 6

  const [themeOptions, setThemeOptions] = useState<FilterHistoryOption[]>(FALLBACK_THEME_OPTIONS)
  const initialIdeas = useMemo(() => {
    if (typeof globalThis === 'undefined') return []
    try {
      const raw = globalThis.localStorage?.getItem(HISTORY_CACHE_KEY)
      if (!raw) return []
      const parsed = JSON.parse(raw) as Array<Omit<Idea, 'timestamp'> & { timestamp: string }>
      return parsed.map((idea) => ({
        ...idea,
        timestamp: new Date(idea.timestamp),
      }))
    } catch (error) {
      console.warn('Falha ao carregar cache do historico', error)
      return []
    }
  }, [])
  const [ideas, setIdeas] = useState<Idea[]>(initialIdeas)
  const { data: ideasData, loading: ideasLoading, refetch } = useIdeas(filters)
  const { darkMode } = useTheme()

  const handleFilterChange = useCallback((next: { category?: string; startDate?: string; endDate?: string }) => {
    setFilters({
      category: next.category ?? '',
      startDate: next.startDate ?? '',
      endDate: next.endDate ?? '',
    })
  }, [])

  const handleFilterClear = useCallback(() => {
    setFilters({
      category: '',
      startDate: '',
      endDate: '',
    })
  }, [])

  useEffect(() => {
    let cancelled = false
    const loadThemes = createThemeLoader(setThemeOptions, () => cancelled)

    void loadThemes()
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (!Array.isArray(ideasData)) return
    setIdeas((current) => mergeIdeas(ideasData, current))

    let cancelled = false
    const syncFavorites = createFavoritesSync(setIdeas, () => cancelled)

    void syncFavorites()

    return () => {
      cancelled = true
    }
  }, [ideasData])

  useEffect(() => {
    setPage(1)
  }, [filters.category, filters.startDate, filters.endDate])

  useEffect(() => {
    if (
      typeof globalThis === 'undefined' ||
      !Number.isFinite(HISTORY_POLL_INTERVAL) ||
      HISTORY_POLL_INTERVAL <= 0 ||
      typeof globalThis.setInterval !== 'function' ||
      typeof globalThis.clearInterval !== 'function'
    ) {
      return
    }
    const intervalId = globalThis.setInterval(() => {
      refetch({ ignoreCache: true, silent: true })
    }, HISTORY_POLL_INTERVAL)
    return () => globalThis.clearInterval(intervalId)
  }, [refetch])

  useEffect(() => {
    if (typeof globalThis === 'undefined') return
    const target = globalThis.document
    if (!target) return

    const handleVisibility = () => {
      if (target.visibilityState === 'visible') {
        refetch({ ignoreCache: true, silent: true })
      }
    }

    target.addEventListener('visibilitychange', handleVisibility)
    return () => target.removeEventListener('visibilitychange', handleVisibility)
  }, [refetch])

  useEffect(() => {
    const unsubscribe = subscribeHistoryRefresh((detail) => {
      if (detail.idea) {
        const detailIdea = detail.idea
        setIdeas((current) => mergeIdeas([detailIdea], current))
      }
      refetch({ ignoreCache: true })
    })
    return unsubscribe
  }, [refetch])

  useEffect(() => {
    if (typeof globalThis === 'undefined' || !globalThis.localStorage) return
    try {
      const serializable = ideas.map((idea) => ({
        ...idea,
        timestamp: idea.timestamp instanceof Date ? idea.timestamp.toISOString() : idea.timestamp,
      }))
      globalThis.localStorage.setItem(HISTORY_CACHE_KEY, JSON.stringify(serializable))
    } catch (error) {
      console.warn('Falha ao salvar cache do historico', error)
    }
  }, [ideas])

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
      await ideaService.toggleFavorite(id, optimisticValue);
    } catch (err) {
      console.error('Erro ao atualizar favorito:', err)
      const revertValue = !(optimisticValue ?? false)
      setIdeas((prev) =>
        prev.map((idea) => (idea.id === id ? { ...idea, isFavorite: revertValue } : idea))
      )
    }
  }, [])

  const filtered = ideas.filter((idea) => {
    const byCat =
      !filters.category ||
      (typeof idea.theme === 'string' && idea.theme.toLowerCase() === filters.category.toLowerCase())
    const ts = new Date(idea.timestamp).getTime()
    const startOk = !filters.startDate || ts >= new Date(`${filters.startDate}T00:00:00`).getTime()
    const endOk = !filters.endDate || ts <= new Date(`${filters.endDate}T23:59:59.999`).getTime()
    return byCat && startOk && endOk
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)
  const hasIdeas = filtered.length > 0

  const paginationButtons = [
    {
      key: 'first',
      label: '\u00AB',
      ariaLabel: 'Primeira pagina',
      onClick: () => setPage(1),
      disabled: currentPage <= 1,
      hasBorder: false,
    },
    {
      key: 'prev',
      label: '\u2039',
      ariaLabel: 'Pagina anterior',
      onClick: () => setPage((p) => Math.max(1, p - 1)),
      disabled: currentPage <= 1,
      hasBorder: true,
    },
    {
      key: 'next',
      label: '\u203A',
      ariaLabel: 'Proxima pagina',
      onClick: () => setPage((p) => Math.min(totalPages, p + 1)),
      disabled: currentPage >= totalPages,
      hasBorder: true,
    },
    {
      key: 'last',
      label: '\u00BB',
      ariaLabel: 'Ultima pagina',
      onClick: () => setPage(totalPages),
      disabled: currentPage >= totalPages,
      hasBorder: true,
    },
  ]

  const paginationButtonClass = (hasBorder: boolean, disabled: boolean) => {
    let colorClass: string

    if (darkMode) {
      colorClass = hasBorder
        ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
        : 'text-slate-200 hover:bg-slate-800'
    } else {
      colorClass = hasBorder
        ? 'border-gray-300 text-gray-700 hover:bg-gray-100'
        : 'text-gray-700 hover:bg-gray-100'
    }

    return cn(
      'px-3 py-1.5 text-sm transition-colors',
      hasBorder && 'border-l',
      colorClass,
      disabled && 'opacity-40 cursor-not-allowed'
    )
  }

  const loadingClass = cn(
    'rounded-lg border p-6 text-sm h-32 flex items-center justify-center',
    darkMode ? 'bg-slate-900 border-slate-800 text-slate-200' : 'bg-white border-gray-200 text-gray-600'
  )

  let cardsContent: ReactNode

  if (ideasLoading) {
    cardsContent = <div className={loadingClass}>Carregando ideias da comunidade...</div>
  } else if (hasIdeas) {
    cardsContent = (
      <div className="grid gap-6 justify-items-center sm:grid-cols-[repeat(2,minmax(0,640px))]">
        {paginated.map((idea) => (
          <CommunityIdeaCard key={idea.id} idea={toCommunityIdea(idea)} onToggleFavorite={handleToggleFavorite} />
        ))}
      </div>
    )
  } else {
    cardsContent = (
      <div className={loadingClass}>Nenhuma ideia encontrada para os filtros selecionados.</div>
    )
  }

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
            value={filters}
            onChange={handleFilterChange}
            onClear={handleFilterClear}
            className="w-full"
            categories={themeOptions}
          />
        </div>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h1 className="text-3xl font-semibold">Ideias da Comunidade</h1>
            <p className={cn('text-base', darkMode ? 'text-slate-300' : 'text-gray-600')}>
              Acompanhe as contribuições mais recentes e favorite o que achar interessante.
            </p>
          </div>
          {cardsContent}

          {hasIdeas && (
            <div className="flex items-center justify-center pt-2">
              <nav
                aria-label="Paginacao"
                className={cn(
                  'inline-flex items-stretch rounded-lg overflow-hidden',
                  darkMode ? 'border border-slate-700 bg-slate-900' : 'border border-gray-300 bg-white shadow-sm'
                )}
              >
                {paginationButtons.slice(0, 2).map((button) => (
                  <button
                    key={button.key}
                    aria-label={button.ariaLabel}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    className={paginationButtonClass(button.hasBorder, button.disabled)}
                  >
                    {button.label}
                  </button>
                ))}
                <span
                  className={cn(
                    'px-4 py-1.5 text-sm font-semibold border-l',
                    darkMode ? 'bg-slate-700 text-white border-slate-700' : 'bg-blue-50 text-blue-700 border-gray-300'
                  )}
                >
                  {currentPage}
                </span>
                {paginationButtons.slice(2).map((button) => (
                  <button
                    key={button.key}
                    aria-label={button.ariaLabel}
                    onClick={button.onClick}
                    disabled={button.disabled}
                    className={paginationButtonClass(button.hasBorder, button.disabled)}
                  >
                    {button.label}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

type CancelChecker = () => boolean

function createThemeLoader(
  setThemeOptions: Dispatch<SetStateAction<FilterHistoryOption[]>>,
  isCancelled: CancelChecker
): () => Promise<void> {
  return async () => {
    if (import.meta.env.MODE === 'test') {
      setThemeOptions(FALLBACK_THEME_OPTIONS)
      return
    }

    try {
      const remoteThemes = await themeService.getAll()
      if (isCancelled()) return

      if (Array.isArray(remoteThemes) && remoteThemes.length > 0) {
        const normalized = buildThemeOptions(remoteThemes)
        setThemeOptions([{ label: 'Todas', value: '' }, ...normalized])
      } else {
        setThemeOptions(FALLBACK_THEME_OPTIONS)
      }
    } catch (error) {
      console.error('Erro ao carregar temas:', error)
      if (!isCancelled()) {
        setThemeOptions(FALLBACK_THEME_OPTIONS)
      }
    }
  }
}

function createFavoritesSync(
  setIdeas: Dispatch<SetStateAction<Idea[]>>,
  isCancelled: CancelChecker
): () => Promise<void> {
  return async () => {
    try {
      const favoriteIds = await fetchFavoriteIds()
      if (isCancelled()) return

      setIdeas((current) =>
        current.map((idea) => ({
          ...idea,
          isFavorite: favoriteIds.has(idea.id),
        }))
      )
    } catch (err) {
      if (!isCancelled()) {
        console.error('Erro ao sincronizar favoritos:', err)
      }
    }
  }
}

function toCommunityIdea(idea: Idea): CommunityIdea {
  return {
    ...idea,
    author: idea.author?.trim() || 'Participante desconhecido',
    tokens: idea.tokens,
  }
}

function buildThemeOptions(themes: Theme[]): FilterHistoryOption[] {
  const seen = new Set<string>()
  const normalized: FilterHistoryOption[] = []
  for (const theme of themes) {
    const option = toThemeOption(theme)
    const key = option.value.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    normalized.push(option)
  }
  return normalized
}

function toThemeOption(theme: Theme): FilterHistoryOption {
  const fallbackLabel =
    typeof theme.id === 'number' ? `Tema ${theme.id}` : 'Tema personalizado'
  const label = theme.name?.trim() || fallbackLabel
  return {
    label,
    value: label.toLowerCase(),
  }
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
  for (const idea of incoming) {
    if (!currentMap.has(idea.id)) {
      newIdeas.push(idea)
    }
  }

  if (newIdeas.length === 0 && !hasUpdates) {
    return current
  }

  return newIdeas.length > 0 ? [...newIdeas, ...updatedCurrent] : updatedCurrent
}
