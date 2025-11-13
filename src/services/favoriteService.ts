import { apiFetch } from "@/lib/api";
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard";

export const favoriteService = {
  async getFavorites(page = 0, size = 20): Promise<Idea[]> {
    try {
      const response = await apiFetch(`/api/ideas/favorites?page=${page}&size=${size}`);
      const data = await response.json();

      if (Array.isArray(data?.content)) {
        return data.content;
      }

      return [];
    } catch (error) {
      console.error("Erro ao buscar favoritos:", error);
      return [];
    }
  },

  async removeFavorite(id: string): Promise<void> {
    try {
      await apiFetch(`/api/ideas/${id}/favorite`, { method: "DELETE" });
    } catch (error) {
      console.error("Erro ao desfavoritar:", error);
      throw error;
    }
  }
};
