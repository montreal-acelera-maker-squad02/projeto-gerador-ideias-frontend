import { apiFetch } from "@/lib/api";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { emitHistoryRefreshRequest } from "@/events/historyEvents";
import { pushIdeaToCache } from "@/hooks/useIdeas";
import { updateFavoriteCache } from "@/pages/History/favoritesCache";

type IdeaApiResponse = {
  id: string | number;
  theme: string;
  content: string;
  createdAt?: string;
  executionTimeMs?: number;
  context?: string;
  isFavorite?: boolean;
};

type PageResponse<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number; 
};

// Converte backend -> modelo do front
function mapResponseToIdea(response: IdeaApiResponse): Idea {
  return {
    id: String(response.id),
    theme: response.theme,
    content: response.content,
    timestamp: new Date(response.createdAt || Date.now()),
    isFavorite: response.isFavorite ?? false,
    responseTime: response.executionTimeMs,
    context: response.context || "",
    author: response.userName?.trim() || response.author?.trim() || undefined,
  };
}

export const ideaService = {
  
  //   Gera nova ideia usando /generate
   
  async generateIdea(
    themeId: number,
    context: string,
    skipCache: boolean = false
  ): Promise<Idea> {
    const url = new URL("/api/ideas/generate", window.location.origin);
    if (skipCache) url.searchParams.set("skipCache", "true");

    const response = await apiFetch(url.pathname + url.search, {
      method: "POST",
      body: JSON.stringify({ theme: themeId, context }),
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Erro ao gerar ideia");
    }

    const responseData = await response.json();
    const newIdea = mapResponseToIdea(responseData);

    pushIdeaToCache(newIdea)
    emitHistoryRefreshRequest({ idea: newIdea });

    return newIdea;
  },

  
  //  * Gera ideia aleatória usando /surprise-me
   
  async generateSurpriseIdea(): Promise<Idea> {
    const response = await apiFetch("/api/ideas/surprise-me", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Erro ao gerar ideia surpresa");
    }

    const responseData = await response.json();
    const newIdea = mapResponseToIdea(responseData);

    pushIdeaToCache(newIdea)
    emitHistoryRefreshRequest({ idea: newIdea });

    return newIdea;
  },

  
    // Favoritar / desfavoritar
   
  async toggleFavorite(ideaId: string, isFavorite: boolean): Promise<void> {
    const method = isFavorite ? "POST" : "DELETE";
    const res = await apiFetch(`/api/ideas/${ideaId}/favorite`, { method });

    if (!res.ok) {
      throw new Error((await res.text()) || "Erro ao atualizar favorito");
    }

    // Centraliza a atualização do cache de favoritos
    updateFavoriteCache(ideaId, isFavorite);

    emitHistoryRefreshRequest();
  },

  async getFavorites(): Promise<Idea[]> {
    const res = await apiFetch("/api/ideas/favorites")
    if (!res.ok) throw new Error("Erro ao buscar favoritos")
    return await res.json()
  }
}
