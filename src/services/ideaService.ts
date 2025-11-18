import { apiFetch } from "@/lib/api";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";
import { emitHistoryRefreshRequest } from "@/events/historyEvents";

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

function mapResponseToIdea(response: IdeaApiResponse): Idea {
  return {
    id: String(response.id),
    theme: response.theme,
    content: response.content,
    timestamp: new Date(response.createdAt || Date.now()),
    isFavorite: response.isFavorite ?? false,
    responseTime: response.executionTimeMs,
    context: response.context || "",
  };
}

export const ideaService = {
  
   
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

    const data = await response.json();
    emitHistoryRefreshRequest();
    return mapResponseToIdea(data);
  },

  
   
  async generateSurpriseIdea(): Promise<Idea> {
    const response = await apiFetch("/api/ideas/surprise-me", {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error((await response.text()) || "Erro ao gerar ideia surpresa");
    }

    const data = await response.json();
    emitHistoryRefreshRequest();
    return mapResponseToIdea(data);
  },

  
   
  async toggleFavorite(ideaId: string, isFavorite: boolean): Promise<void> {
    const method = isFavorite ? "POST" : "DELETE";
    const res = await apiFetch(`/api/ideas/${ideaId}/favorite`, { method });

    if (!res.ok) {
      throw new Error((await res.text()) || "Erro ao atualizar favorito");
    }

    emitHistoryRefreshRequest();
  },

  async getFavorites(): Promise<Idea[]> {
    const res = await apiFetch("/api/ideas/favorites");

    if (!res.ok) throw new Error("Erro ao buscar favoritos");

    const page = (await res.json()) as PageResponse<IdeaApiResponse>;
    return page.content.map(mapResponseToIdea);
  },

 
  async getMyIdeas(page: number, size: number) {
    const res = await apiFetch(`/api/ideas/my-ideas?page=${page}&size=${size}`);

    if (!res.ok) {
      throw new Error("Erro ao carregar ideias do usuário");
    }

    const data = (await res.json()) as PageResponse<IdeaApiResponse>;

    return {
      ideas: data.content.map(mapResponseToIdea),
      totalPages: data.totalPages,
      totalElements: data.totalElements,
      page: data.number,
    };
  },
};
