import { useEffect, useState, useCallback } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import FavoriteCard from "@/components/IdeiaCard/FavoriteCard";
import { favoriteService } from "@/services/favoriteService";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { useTheme } from "@/hooks/useTheme";
import { cn } from "@/lib/utils";

export default function FavoritesPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  const { darkMode } = useTheme();

  // 🔥 Carrega favoritos ao montar
  useEffect(() => {
    (async () => {
      const data = await favoriteService.getFavorites();
      setIdeas(data);
      setLoading(false);
    })();
  }, []);

  // 🔥 Desfavoritar (remove do backend + remove da lista)
  const handleUnfavorite = useCallback(async (id: string) => {
    try {
      await favoriteService.removeFavorite(id);
      setIdeas(prev => prev.filter(idea => idea.id !== id));
    } catch (err) {
      console.error("Erro ao desfavoritar:", err);
    }
  }, []);

  // UI Helpers
  const renderLoading = () => (
    <SectionContainer
      className={cn(
        "rounded-2xl p-12 text-center animate-fadeIn border",
        darkMode ? "bg-slate-900 border-slate-800" : "bg-gray-50 border-gray-200"
      )}
    >
      <p className={cn("font-light", darkMode ? "text-slate-200" : "text-gray-600")}>
        Carregando favoritos...
      </p>
    </SectionContainer>
  );

  const renderEmpty = () => (
    <SectionContainer
      className={cn(
        "rounded-2xl p-12 text-center animate-fadeIn border",
        darkMode ? "bg-slate-900 border-slate-800" : "bg-gray-50 border-gray-200"
      )}
    >
      <p className={cn("font-light", darkMode ? "text-slate-200" : "text-gray-600")}>
        Nenhuma ideia favorita ainda
      </p>
    </SectionContainer>
  );

  const renderList = () => (
    <div className="mt-6 grid gap-y-4 sm:gap-y-4 md:gap-y-6 lg:gap-y-8">
      {ideas.map((idea) => (
        <FavoriteCard
          key={idea.id}
          idea={idea}
          onToggleFavorite={handleUnfavorite}
        />
      ))}
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
