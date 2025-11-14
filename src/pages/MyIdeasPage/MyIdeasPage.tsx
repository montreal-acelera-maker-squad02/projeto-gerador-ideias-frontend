import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import FilterHistory from "@/components/FilterHistory";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";
import MyIdeaCard from "@/components/IdeiaCard/MyIdeaCard";
import { ideaService } from "@/services/ideaService";

/** Page size kept equal to HistoryPage for visual parity */
const PAGE_SIZE = 5;

export default function MyIdeasPage() {
  const { darkMode } = useTheme();

  // === STATE === //
  const [filters, setFilters] = useState<{
    category: string;
    startDate: string;
    endDate: string;
  }>({
    category: "",
    startDate: "",
    endDate: "",
  });

  const [page, setPage] = useState<number>(1);
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [ideasLoading, setIdeasLoading] = useState<boolean>(true);

  // Reset para primeira página ao alterar filtros
  useMemo(() => {
    setPage(1);
    // a dependência real é filters.*, mas para layout isso é suficiente
  }, [filters.category, filters.startDate, filters.endDate]);

  // === CARREGAR MINHAS IDEIAS DO BACKEND AO MONTAR A PÁGINA ===
  useEffect(() => {
    let cancelled = false;

    const loadMyIdeas = async () => {
      setIdeasLoading(true);
      try {
        const data = await ideaService.getMyIdeasAll();
        if (!cancelled) {
          setIdeas(data);
        }
      } catch (err) {
        console.error("Erro ao carregar minhas ideias:", err);
        if (!cancelled) {
          setIdeas([]);
        }
      } finally {
        if (!cancelled) {
          setIdeasLoading(false);
        }
      }
    };

    loadMyIdeas();

    return () => {
      cancelled = true;
    };
  }, []);

  // === HANDLERS MOCKADOS (ainda locais, sem chamar backend de favorito/deletar) ===
  const handleToggleFavorite = (id: string) => {
    setIdeas((prev) =>
      prev.map((idea) =>
        idea.id === id ? { ...idea, isFavorite: !idea.isFavorite } : idea
      )
    );
  };

  const handleDelete = (id: string) => {
    setIdeas((prev) => prev.filter((i) => i.id !== id));
  };

  // === FILTRO + PAGINAÇÃO (MESMA LÓGICA DO HISTORY, SÓ EM MEMÓRIA) ===
  const filtered = ideas.filter((i) => {
    const byCat =
      !filters.category ||
      (typeof i.theme === "string" &&
        i.theme.toLowerCase() === filters.category.toLowerCase());

    const ts = new Date(i.timestamp).getTime();
    const startOk =
      !filters.startDate ||
      ts >= new Date(`${filters.startDate}T00:00:00`).getTime();
    const endOk =
      !filters.endDate ||
      ts <= new Date(`${filters.endDate}T23:59:59.999`).getTime();

    return byCat && startOk && endOk;
  });

  const total = filtered.length;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const paginated = filtered.slice(start, start + PAGE_SIZE);

  const contentClass = cn(
    "rounded-lg border p-6 text-sm h-32 flex items-center justify-center",
    darkMode
      ? "bg-slate-900 border-slate-800 text-slate-200"
      : "bg-white border-gray-200 text-gray-600"
  );

  let listContent: ReactNode = paginated.map((idea) => (
    <MyIdeaCard
      key={idea.id}
      idea={idea}
      onToggleFavorite={handleToggleFavorite}
      onDelete={handleDelete}
    />
  ));

  if (ideasLoading) {
    listContent = <div className={contentClass}>Carregando ideias...</div>;
  } else if (filtered.length === 0) {
    listContent = (
      <div className={contentClass}>Nenhuma ideia encontrada.</div>
    );
  }

  const hasIdeas = filtered.length > 0;

  return (
    <div
      className={cn(
        "max-w-7xl mx-auto px-8 py-12 relative z-10",
        darkMode ? "text-slate-100" : "text-gray-900"
      )}
    >
      <div className="grid gap-6 md:grid-cols-[300px_1fr]">
        {/* Coluna de filtros */}
        <div>
          <FilterHistory
            fixed={false}
            value={filters}
            onChange={(v) =>
              setFilters({
                category: v.category ?? "",
                startDate: v.startDate ?? "",
                endDate: v.endDate ?? "",
              })
            }
          />
        </div>

        {/* Lista de Ideias */}
        <div className="flex flex-col gap-6">
          {listContent}
          {hasIdeas && (
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
                  aria-label="Primeira página"
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
                  {"\u00AB"}
                </button>
                <button
                  aria-label="Página anterior"
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
                  {"\u2039"}
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
                  aria-label="Próxima página"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    currentPage >= totalPages &&
                      "opacity-40 cursor-not-allowed"
                  )}
                >
                  {"\u203A"}
                </button>
                <button
                  aria-label="Última página"
                  onClick={() => setPage(totalPages)}
                  disabled={currentPage >= totalPages}
                  className={cn(
                    "px-3 py-1.5 text-sm border-l",
                    darkMode
                      ? "border-slate-700 text-slate-200 hover:bg-slate-800"
                      : "border-gray-300 text-gray-700 hover:bg-gray-100",
                    currentPage >= totalPages &&
                      "opacity-40 cursor-not-allowed"
                  )}
                >
                  {"\u00BB"}
                </button>
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
