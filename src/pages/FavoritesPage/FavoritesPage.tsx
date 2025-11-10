import { useEffect, useState, useCallback } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import FavoriteCard from "@/components/IdeiaCard/FavoriteCard";
import { AppHeader } from "@/components/Header/AppHeader";
import { AppFooter } from "@/components/Footer/AppFooter";
import { ideaService } from "@/services/ideaService";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";

// 🔹 Função externa para evitar nesting excessivo dentro do componente
async function loadFavoritesData(
  setIdeas: React.Dispatch<React.SetStateAction<Idea[]>>,
  setLoading: React.Dispatch<React.SetStateAction<boolean>>
) {
  try {
    const favorites = await ideaService.getFavorites();
    setIdeas(favorites);
  } catch (err) {
    console.error("Erro ao buscar favoritos:", err);
  } finally {
    setLoading(false);
  }
}

export default function FavoritesPage() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  // ✅ Carrega os favoritos na montagem do componente
  useEffect(() => {
    loadFavoritesData(setIdeas, setLoading);
  }, []);

  // ✅ Refatorado para reduzir aninhamento (substituído .then/.catch por async/await)
  const handleUnfavorite = useCallback(async (id: string) => {
    try {
      await ideaService.toggleFavorite(id, false);
      setIdeas((prev) => prev.filter((idea) => idea.id !== id));
    } catch (err) {
      console.error("Erro ao desfavoritar:", err);
    }
  }, []);

  // ✅ Separado para clareza e evitar ternários complexos
  const renderLoading = () => (
    <SectionContainer className="rounded-2xl p-12 text-center animate-fadeIn bg-linear-to-br from-gray-50 to-pink-50/30 border border-gray-200">
      <p className="font-light text-gray-600">Carregando favoritos...</p>
    </SectionContainer>
  );

  const renderEmpty = () => (
    <SectionContainer className="rounded-2xl p-12 text-center animate-fadeIn bg-linear-to-br from-gray-50 to-pink-50/30 border border-gray-200">
      <p className="font-light text-gray-600">Nenhuma ideia favorita ainda</p>
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

  // ✅ Função simples e sem nesting desnecessário
  const renderContent = () => {
    if (loading) return renderLoading();
    if (ideas.length === 0) return renderEmpty();
    return renderList();
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col relative">
      <div className="fixed top-0 left-0 right-0 h-72 pointer-events-none z-0 bg-linear-to-b from-blue-100/40 via-purple-100/30 to-transparent" />

      <AppHeader />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-8 py-12 relative z-10 animate-fadeInUp">
          <h2 className="text-3xl font-light mb-8 text-gray-900">Favoritos</h2>
          {renderContent()}
        </div>
      </main>

      <AppFooter />
    </div>
  );
}