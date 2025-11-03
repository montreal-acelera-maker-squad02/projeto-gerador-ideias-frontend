import { useCallback, useEffect, useMemo, useState } from 'react'
import IdeaHistoryCard from './components/IdeiaCard/IdeaHistoryCard'
import FilterHistory from './components/FilterHistory'
import type { Idea } from './components/IdeiaCard/BaseIdeiaCard'
import { useIdeas } from './hooks/useIdeas'
import { useCategories } from './hooks/useCategories'

function App() {
  const [filters, setFilters] = useState<{ category: string; startDate: string; endDate: string }>({ category: '', startDate: '', endDate: '' })

  // Dados das ideias vindos do hook (fetch comentado até backend estar pronto)
  const [ideas, setIdeas] = useState<Idea[]>([])
  const { data: ideasData, loading: ideasLoading } = useIdeas(filters)

  useEffect(() => {
    if (Array.isArray(ideasData)) {
      setIdeas(ideasData)
    }
  }, [ideasData])

  // Categorias vindas do hook (fallback: derivar dos temas existentes)
  const { data: categoriesData } = useCategories()
  const categories = useMemo(() => {
    if (Array.isArray(categoriesData)) return categoriesData
    const uniq = Array.from(new Set(ideas.map((i) => i.theme)))
    return uniq.map((label) => ({ label, value: label }))
  }, [categoriesData, ideas])

  const handleToggleFavorite = useCallback((id: string) => {
    setIdeas((prev) => prev.map((i) => (i.id === id ? { ...i, isFavorite: !i.isFavorite } : i)))
  }, [])

  const handleDelete = useCallback((id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id))
  }, [])

  const filtered = ideas.filter((i) => {
    const byCat = !filters.category || i.theme === filters.category
    const ts = new Date(i.timestamp).getTime()
    const startOk = !filters.startDate || ts >= new Date(`${filters.startDate}T00:00:00`).getTime()
    const endOk = !filters.endDate || ts <= new Date(`${filters.endDate}T23:59:59.999`).getTime()
    return byCat && startOk && endOk
  })

  return (
    <main className="min-h-screen p-6">
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        <div>
          <FilterHistory
            fixed={false}
            categories={[{ label: 'Todas', value: '' }, ...categories]}
            value={filters}
            onChange={(v) => setFilters({
              category: v.category ?? '',
              startDate: v.startDate ?? '',
              endDate: v.endDate ?? ''
            })}
          />
        </div>
        <div className="flex flex-col gap-6">
          {ideasLoading ? (
            <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-600 h-32 flex items-center justify-center">
              Carregando ideias...
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-lg border border-gray-200 p-6 text-sm text-gray-600 h-32 flex items-center justify-center">
              Nenhuma ideia encontrada.
            </div>
          ) : (
            filtered.map((idea) => (
              <IdeaHistoryCard
                key={idea.id}
                idea={idea}
                onToggleFavorite={handleToggleFavorite}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </div>
    </main>
  )
}

export default App
