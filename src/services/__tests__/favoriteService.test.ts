import { describe, expect, it, vi, beforeEach } from 'vitest'
import { favoriteService } from '../favoriteService'
import { apiFetch } from '@/lib/api'
import { ideaService } from '@/services/ideaService'

vi.mock('@/lib/api', () => ({
  apiFetch: vi.fn(),
}))

vi.mock('@/services/ideaService', () => ({
  ideaService: {
    toggleFavorite: vi.fn(),
  },
}))

const apiFetchMock = vi.mocked(apiFetch)
const ideaServiceMock = vi.mocked(ideaService)

const makeResponse = (body: any, ok = true) =>
  ({
    ok,
    status: ok ? 200 : 400,
    statusText: ok ? 'OK' : 'Bad',
    json: vi.fn(async () => body),
    text: vi.fn(async () => JSON.stringify(body)),
  } as unknown as Response)

beforeEach(() => {
  apiFetchMock.mockReset()
  ideaServiceMock.toggleFavorite.mockReset()
})

describe('favoriteService', () => {
  it('retorna favoritos quando o endpoint responde corretamente', async () => {
    apiFetchMock.mockResolvedValueOnce(
      makeResponse({ content: [{ id: 'fav', theme: 'Teste' }] })
    )

    const result = await favoriteService.getFavorites(1, 5)

    expect(apiFetchMock).toHaveBeenCalledWith('/api/ideas/favorites?page=1&size=5')
    expect(result).toHaveLength(1)
  })

  it('retorna array vazio após erro', async () => {
    apiFetchMock.mockRejectedValueOnce(new Error('falha'))
    const result = await favoriteService.getFavorites()
    expect(result).toEqual([])
  })

  it('remove favorito delegando ao ideaService', async () => {
    await favoriteService.removeFavorite('123')
    expect(ideaServiceMock.toggleFavorite).toHaveBeenCalledWith('123', false)
  })
})
