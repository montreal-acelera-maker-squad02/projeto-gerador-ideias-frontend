import { useCallback, useEffect, useState, type ReactNode } from 'react'
import IdeaHistoryCard from '@/components/IdeiaCard/IdeaHistoryCard'
import FilterHistory from '@/components/FilterHistory'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { useIdeas } from '@/hooks/useIdeas'
import { THEMES } from '@/constants/themes'
import { ideaService } from '@/services/ideaService'
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const FAVORITES_CACHE_TTL = Number(import.meta.env.VITE_FAVORITES_CACHE_TTL ?? 60_000)

let favoriteIdsCache: { ids: Set<string>; fetchedAt: number } | null = null

export function __resetHistoryFavoritesCache() {
  favoriteIdsCache = null
}


async function getFavoriteIdsFromCache() {
  const now = Date.now()
  if (favoriteIdsCache && now - favoriteIdsCache.fetchedAt < FAVORITES_CACHE_TTL) {
    return favoriteIdsCache.ids
  }
  const favorites = await ideaService.getFavorites()
  favoriteIdsCache = {
    ids: new Set(favorites.map((f) => f.id)),
    fetchedAt: now,
  }
  return favoriteIdsCache.ids
}

export default function HistoryPage() {
  const [filters, setFilters] = useState<{ category: string; startDate: string; endDate: string }>({
    category: '',
    startDate: '',
    endDate: ''
  })
  const [page, setPage] = useState<number>(1)
  const pageSize = 5

  const [ideas, setIdeas] = useState<Idea[]>([])
  const { data: ideasData, loading: ideasLoading } = useIdeas(filters)

  const { darkMode } = useTheme();

  // Prefetch ideas e sincroniza favoritos sem bloquear o render
  useEffect(() => {
    if (!Array.isArray(ideasData)) return
    setIdeas(ideasData)

    let cancelled = false

    async function syncFavorites() {
      try {
        const favoriteIds = await getFavoriteIdsFromCache()
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

  // resetar pï¿½gina ao alterar filtros
  useEffect(() => {
    setPage(1)
  }, [filters.category, filters.startDate, filters.endDate])

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
      if (favoriteIdsCache) {
        const updated = new Set(favoriteIdsCache.ids)
        if (optimisticValue) {
          updated.add(id)
        } else {
          updated.delete(id)
        }
        favoriteIdsCache = { ids: updated, fetchedAt: Date.now() }
      } else {
        favoriteIdsCache = {
          ids: optimisticValue ? new Set([id]) : new Set(),
          fetchedAt: Date.now(),
        }
      }
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
      (typeof i.theme === 'string' &&
        i.theme.toLowerCase() === filters.category.toLowerCase())
    const ts = new Date(i.timestamp).getTime()
    const startOk =
      !filters.startDate ||
      ts >= new Date(`${filters.startDate}T00:00:00`).getTime()
    const endOk =
      !filters.endDate ||
      ts <= new Date(`${filters.endDate}T23:59:59.999`).getTime()
    return byCat && startOk && endOk
  })

  const total = filtered.length
  const totalPages = Math.max(1, Math.ceil(total / pageSize))
  const currentPage = Math.min(page, totalPages)
  const start = (currentPage - 1) * pageSize
  const paginated = filtered.slice(start, start + pageSize)

  const contentClass = cn(
    "rounded-lg border p-6 text-sm h-32 flex items-center justify-center",
    darkMode
      ? "bg-slate-900 border-slate-800 text-slate-200"
      : "bg-white border-gray-200 text-gray-600"
  )

  let listContent: ReactNode = paginated.map((idea) => (
    <IdeaHistoryCard
      key={idea.id}
      idea={idea}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDelete}
    />
  ))

  if (ideasLoading) {
    listContent = <div className={contentClass}>Carregando ideias...</div>
  } else if (filtered.length === 0) {
    listContent = <div className={contentClass}>Nenhuma ideia encontrada.</div>
  }

  const hasIdeas = filtered.length > 0

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-8 py-12 relative z-10",
        darkMode ? "text-slate-100" : "text-gray-900"
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
                endDate: v.endDate ?? ''
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
                  "inline-flex items-stretch rounded-lg overflow-hidden",
                  darkMode
                    ? "border border-slate-700 bg-slate-900"
                    : "border border-gray-300 bg-white shadow-sm"
                )}
              >
                <button
                  aria-label="Primeira pagina"
                  onClick={() => setPage(1)}
                  disabled={currentPage <= 1}
                  className={cn(
                    "px-3 py-1.5 text-sm transition-colors",
                    darkMode
                      ? "text-slate-200 hover:bg-slate-800"
                      : "text-gray-700 hover:bg-gray-100",
                    currentPage <= 1 && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {'\u00AB'}
                </button>
                <button
                  aria-label="Pagina anterior"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage <= 1}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    currentPage <= 1 && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {'\u2039'}
                </button>
                <span
                  className={cn(
                    "px-4 py-1.5 text-sm font-semibold border-l",
                    darkMode
                      ? "bg-slate-700 text-white border-slate-700"
                      : "bg-blue-50 text-blue-700 border-gray-300"
                  )}
                >
                  {currentPage}
                </span>
                <button
                  aria-label="Proxima pagina"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    currentPage >= totalPages && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {'\u203A'}
                </button>
                <button
                  aria-label="Ultima pagina"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    currentPage >= totalPages && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {'\u00BB'}
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}





