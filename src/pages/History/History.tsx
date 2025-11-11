import { useCallback, useEffect, useState } from 'react'
import IdeaHistoryCard from '@/components/IdeiaCard/IdeaHistoryCard'
import FilterHistory from '@/components/FilterHistory'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { useIdeas } from '@/hooks/useIdeas'
import { THEMES } from '@/constants/themes'
import { ideaService } from '@/services/ideaService'
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

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

  // 🔹 Quando as ideias são carregadas, sincroniza com backend de favoritos
  useEffect(() => {
    async function syncFavorites() {
      try {
        const favorites = await ideaService.getFavorites()
        const favoriteIds = new Set(favorites.map((f) => f.id))
        setIdeas(
          (ideasData || []).map((idea) => ({
            ...idea,
            isFavorite: favoriteIds.has(idea.id)
          }))
        )
      } catch (err) {
        console.error('Erro ao sincronizar favoritos:', err)
        setIdeas(ideasData || [])
      }
    }

    if (Array.isArray(ideasData)) {
      syncFavorites()
    }
  }, [ideasData])

  // resetar página ao alterar filtros
  useEffect(() => {
    setPage(1)
  }, [filters.category, filters.startDate, filters.endDate])

  const handleToggleFavorite = useCallback(
    async (id: string) => {
      setIdeas((prev) =>
        prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
      )
      try {
        const idea = ideas.find((i) => i.id === id)
        if (!idea) return
        await ideaService.toggleFavorite(id, !idea.isFavorite)
      } catch (err) {
        console.error('Erro ao atualizar favorito:', err)
        // rollback visual se falhar
        setIdeas((prev) =>
          prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i))
        )
      }
    },
    [ideas]
  )

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
          {ideasLoading ? (
            <div
              className={cn(
                "rounded-lg border p-6 text-sm h-32 flex items-center justify-center",
                darkMode
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-white border-gray-200 text-gray-600"
              )}
            >
              Carregando ideias...
            </div>
          ) : filtered.length === 0 ? (
            <div
              className={cn(
                "rounded-lg border p-6 text-sm h-32 flex items-center justify-center",
                darkMode
                  ? "bg-slate-900 border-slate-800 text-slate-200"
                  : "bg-white border-gray-200 text-gray-600"
              )}
            >
              Nenhuma ideia encontrada.
            </div>
          ) : (
            paginated.map((idea) => (
              <IdeaHistoryCard
                key={idea.id}
                idea={idea}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))
          )}

          {filtered.length > 0 && (
            <div className="flex items-center justify-center pt-2">
              <nav
                aria-label="Paginação"
                className={cn(
                  "inline-flex items-stretch rounded-lg overflow-hidden",
                  darkMode
                    ? "border border-slate-700 bg-slate-900"
                    : "border border-gray-300 bg-white shadow-sm"
                )}
              >
                <button
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
                  «
                </button>
                <button
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
                  ‹
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
                  ›
                </button>
                <button
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
                  »
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}