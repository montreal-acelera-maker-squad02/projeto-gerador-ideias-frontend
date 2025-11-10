import { describe, it, expect, vi } from 'vitest'
import { ideaService } from '../ideaService'
import { apiFetch } from '@/lib/api'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

const mockApiFetch = vi.mocked(apiFetch)

describe('ideaService', () => {
  it('faz o toggle de favorito enviando o método correto', async () => {
    mockApiFetch.mockResolvedValueOnce(new Response(null, { status: 200 }))

    await ideaService.toggleFavorite('idea-1', true)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/ideas/idea-1/favorite', { method: 'POST' })

    mockApiFetch.mockResolvedValueOnce(new Response(null, { status: 200 }))
    await ideaService.toggleFavorite('idea-1', false)
    expect(mockApiFetch).toHaveBeenCalledWith('/api/ideas/idea-1/favorite', { method: 'DELETE' })
  })

  it('propaga erro quando o toggle falha', async () => {
    mockApiFetch.mockResolvedValueOnce(new Response('erro', { status: 500 }))
    await expect(ideaService.toggleFavorite('idea-2', true)).rejects.toThrow('erro')
  })

  it('retorna a lista de favoritos', async () => {
    const payload: Idea[] = [
      {
        id: 'idea-1',
        theme: 'Tecnologia',
        context: 'Apps',
        content: 'Assistente IA',
        timestamp: '2025-11-10T20:18:52.915Z' as unknown as Date,
        isFavorite: true,
      },
    ]
    mockApiFetch.mockResolvedValueOnce(
      new Response(JSON.stringify(payload), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    )

    const result = await ideaService.getFavorites()
    expect(mockApiFetch).toHaveBeenCalledWith('/api/ideas/favorites')
    expect(result).toEqual(payload)
  })

  it('lança erro quando getFavorites recebe status != 200', async () => {
    mockApiFetch.mockResolvedValueOnce(new Response(null, { status: 500 }))
    await expect(ideaService.getFavorites()).rejects.toThrow('Erro ao buscar favoritos')
  })
})
