import { apiFetch } from "@/lib/api"
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard"

function mapResponseToIdea(response: any): Idea {
  const newIdea: Idea = {
    id: String(response.id),
    theme: response.theme,
    content: response.content,
    timestamp: new Date(response.createdAt || Date.now()),
    isFavorite: false,
    responseTime: response.executionTimeMs,
    context: response.context || "",
  };
  return newIdea;
}


export const ideaService = {
  /**
   * Gera uma nova ideia.
   * @param themeId O ID do tema selecionado
   * @param context O contexto fornecido pelo usuário
   * @param skipCache Se true, envia 'skipCache=true' para a API
   */
  async generateIdea(themeId: number, context: string, skipCache: boolean = false): Promise<Idea> {
    const url = new URL('/api/ideas/generate', window.location.origin);
    if (skipCache) {
      url.searchParams.set('skipCache', 'true');
    }

    const requestBody = {
      theme: themeId,
      context: context,
    };

    const response = await apiFetch(url.pathname + url.search, {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao gerar ideia');
    }

    const responseData = await response.json();
    return mapResponseToIdea(responseData);
  },

  /**
     * Gera uma ideia aleatória usando o endpoint /surprise-me
     */
  async generateSurpriseIdea(): Promise<Idea> {
    const response = await apiFetch('/api/ideas/surprise-me', {
      method: 'POST',
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || 'Erro ao gerar ideia surpresa');
    }

    const responseData = await response.json();
    return mapResponseToIdea(responseData);
  },

  async toggleFavorite(ideaId: string, isFavorite: boolean): Promise<void> {
    const method = isFavorite ? "POST" : "DELETE"
    const res = await apiFetch(`/api/ideas/${ideaId}/favorite`, { method })
    if (!res.ok) {
      const msg = await res.text()
      throw new Error(msg || "Erro ao favoritar ideia")
    }
  },

  async getFavorites(): Promise<Idea[]> {
    const res = await apiFetch("/api/ideas/favorites")
    if (!res.ok) throw new Error("Erro ao buscar favoritos")
    return await res.json()
  }
}