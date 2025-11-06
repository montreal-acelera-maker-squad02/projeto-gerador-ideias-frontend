// src/pages/FavoritesPage/FavoritesPage.tsx
import { useMemo } from "react";
import SectionContainer from "@/components/SectionContainer/SectionContainer";
import FavoriteCard  from '@/components/IdeiaCard/FavoriteCard'
import { AppHeader } from "@/components/Header/AppHeader";

export type Idea = {
  id: string;
  theme: string;
  context: string;
  content: string;
  timestamp: Date;
  isFavorite: boolean;
  responseTime?: number;
};

export type FavoritesPageProps  = {
  ideas?: Idea[];
};

export const FavoritesPage: React.FC<FavoritesPageProps> = ({ ideas = [] }) => {
  const favoriteIdeas = useMemo(
    () => ideas.filter((i) => i.isFavorite),
    [ideas]
  );

  return (
    <div className="min-h-screen bg-white text-gray-900 relative">
      {/* Decorative background gradient */}
      <div className="fixed top-0 left-0 right-0 h-72 pointer-events-none z-0 bg-gradient-to-b from-blue-100/40 via-purple-100/30 to-transparent" />

      <AppHeader />
      <div className="max-w-7xl mx-auto px-8 py-12 relative z-10 animate-fadeInUp">
        <h2 className="text-3xl font-light mb-8 text-gray-900">Favoritos</h2>

        {/* Ideas by Theme */}
        {favoriteIdeas.length === 0 ? (
            <SectionContainer className="rounded-2xl p-12 text-center animate-fadeIn bg-gradient-to-br from-gray-50 to-pink-50/30 border border-gray-200">
                <p className="font-light text-gray-600">Nenhuma ideia favorita ainda</p>
            </SectionContainer>
          
        ) : (
            <div className="mt-6 grid gap-y-4 sm:gap-y-4 md:gap-y-6 lg:gap-y-8">
                {favoriteIdeas.map((idea) => (
                    <FavoriteCard
                        key={idea.id}
                        idea={idea}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
};

export default FavoritesPage;
