import { useEffect, useState, useCallback, useMemo } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import FavoriteCard from "@/components/IdeiaCard/FavoriteCard";
import { favoriteService } from "@/services/favoriteService";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 5;

export default function FavoritesPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const { darkMode } = useTheme();

  useEffect(() => {
    (async () => {
      const data = await favoriteService.getFavorites();
      setIdeas(data);
      setLoading(false);
    })();
  }, []);

  const handleUnfavorite = useCallback(
    async (id: string) => {
      try {
        await favoriteService.removeFavorite(id);
        setIdeas((prev) => prev.filter((idea) => idea.id !== id));

        setPage((prev) => {
          const totalAfter = ideas.length - 1;
          const maxPage = Math.max(1, Math.ceil(totalAfter / PAGE_SIZE));
          return prev > maxPage ? maxPage : prev;
        });
      } catch (err) {
        console.error("Erro ao desfavoritar:", err);
      }
    },
    [ideas.length]
  );

  // === PAGINAÇÃO === //
  const totalPages = useMemo(
    () => Math.ceil(ideas.length / PAGE_SIZE),
    [ideas]
  );

  const paginatedIdeas = useMemo(
    () => ideas.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [page, ideas]
  );

  const renderLoading = () => (
    <SectionContainer
      className={cn(
        "rounded-2xl p-12 text-center animate-fadeIn border",
        darkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <p
        className={cn(
          "font-light",
          darkMode ? "text-slate-200" : "text-gray-600"
        )}
      >
        Carregando favoritos...
      </p>
    </SectionContainer>
  );

  const renderEmpty = () => (
    <SectionContainer
      className={cn(
        "rounded-2xl p-12 text-center animate-fadeIn border",
        darkMode
          ? "bg-slate-900 border-slate-800"
          : "bg-gray-50 border-gray-200"
      )}
    >
      <p
        className={cn(
          "font-light",
          darkMode ? "text-slate-200" : "text-gray-600"
        )}
      >
        Nenhuma ideia favorita ainda
      </p>
    </SectionContainer>
  );

  const renderList = () => (
    <div className="mt-6">
      <div className="grid gap-y-4 sm:gap-y-4 md:gap-y-6 lg:gap-y-8">
        {paginatedIdeas.map((idea) => (
          <FavoriteCard
            key={idea.id}
            idea={idea}
            onToggleFavorite={handleUnfavorite}
          />
        ))}
      </div>

      {/* ==================== PAGINAÇÃO ESTILO PREMIUM ===================== */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-10">
          <div
            className={cn(
              "flex items-center gap-1 px-3 py-2 rounded-xl shadow-sm border",
              darkMode
                ? "bg-slate-900/70 border-slate-700"
                : "bg-white border-gray-300"
            )}
          >
            {/* PRIMEIRA PÁGINA « */}
            <button
              onClick={() => setPage(1)}
              disabled={page === 1}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium",
                page === 1
                  ? "opacity-30 cursor-not-allowed"
                  : darkMode
                  ? "hover:bg-slate-800"
                  : "hover:bg-gray-100"
              )}
            >
              «
            </button>

            {/* ANTERIOR ‹ */}
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium",
                page === 1
                  ? "opacity-30 cursor-not-allowed"
                  : darkMode
                  ? "hover:bg-slate-800"
                  : "hover:bg-gray-100"
              )}
            >
              ‹
            </button>

            <span
              className={cn(
                "px-4 py-2 rounded-lg font-semibold text-sm",
                darkMode
                  ? "bg-teal-700 text-white"
                  : "bg-teal-700 text-white"
              )}
            >
              {page}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium",
                page === totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : darkMode
                  ? "hover:bg-slate-800"
                  : "hover:bg-gray-100"
              )}
            >
              ›
            </button>

            <button
              onClick={() => setPage(totalPages)}
              disabled={page === totalPages}
              className={cn(
                "px-3 py-2 rounded-lg text-sm font-medium",
                page === totalPages
                  ? "opacity-30 cursor-not-allowed"
                  : darkMode
                  ? "hover:bg-slate-800"
                  : "hover:bg-gray-100"
              )}
            >
              »
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderContent = () => {
    if (loading) return renderLoading();
    if (ideas.length === 0) return renderEmpty();
    return renderList();
  };

  return (
    <div className="max-w-7xl mx-auto px-8 py-12 relative z-10 animate-fadeInUp">
      <h2
        className={cn(
          "text-3xl font-light mb-8",
          darkMode ? "text-white" : "text-gray-900"
        )}
      >
        Favoritos
      </h2>

      {renderContent()}
    </div>
  );
}
