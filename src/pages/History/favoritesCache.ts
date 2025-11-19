import { ideaService } from '@/services/ideaService'

const FAVORITES_CACHE_TTL = Number(import.meta.env.VITE_FAVORITES_CACHE_TTL ?? 20_000)

export type FavoriteIdsCache = {
  ids: Set<string>
  fetchedAt: number
}

let favoriteIdsCache: FavoriteIdsCache | null = null

export function resetFavoritesCache() {
  favoriteIdsCache = null
}

export async function fetchFavoriteIds() {
  const now = Date.now()
  if (favoriteIdsCache && now - favoriteIdsCache.fetchedAt < FAVORITES_CACHE_TTL) {
    return favoriteIdsCache.ids
  }
  const favorites = await ideaService.getFavorites()
  favoriteIdsCache = {
    ids: new Set(favorites.map((f) => f.id)),
    fetchedAt: now,
  }
  return favoriteIdsCache.ids
}

export function updateFavoriteCache(id: string, isFavorite: boolean) {
  if (!favoriteIdsCache) {
    favoriteIdsCache = {
      ids: new Set(isFavorite ? [id] : []),
      fetchedAt: Date.now(),
    }
    return
  }

  const updated = new Set(favoriteIdsCache.ids)
  if (isFavorite) {
    updated.add(id)
  } else {
    updated.delete(id)
  }
  favoriteIdsCache = {
    ids: updated,
    fetchedAt: Date.now(),
  }
}
