import { apiFetch } from "@/lib/api"
import type { Idea } from "@/components/IdeiaCard/BaseIdeiaCard"

export const ideaService = {
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