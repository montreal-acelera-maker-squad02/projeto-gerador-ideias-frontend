import { describe, it, expect, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import FavoritesPage from '../FavoritesPage'
import { ideaService } from '@/services/ideaService'

vi.mock('@/services/ideaService', () => ({
  ideaService: {
    getFavorites: vi.fn(),
    toggleFavorite: vi.fn(),
  },
}))

const mockGetFavorites = vi.mocked(ideaService.getFavorites)
const mockToggleFavorite = vi.mocked(ideaService.toggleFavorite)

const sampleIdeas = [
  {
    id: 'idea-1',
    theme: 'Tecnologia',
    context: 'Marketing',
    content: 'IA que cria campanhas personalizadas.',
    timestamp: new Date('2025-01-01T10:00:00Z'),
    isFavorite: true,
    responseTime: 1200,
  },
  {
    id: 'idea-2',
    theme: 'Saúde',
    context: 'Wellness',
    content: 'Plataforma de monitoramento remoto.',
    timestamp: new Date('2025-02-01T12:00:00Z'),
    isFavorite: true,
    responseTime: 900,
  },
]

describe('FavoritesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('mostra estado de carregamento e depois renderiza os favoritos', async () => {
    mockGetFavorites.mockResolvedValueOnce(sampleIdeas)

    renderWithProviders(<FavoritesPage />)

    expect(screen.getByText(/carregando favoritos/i)).toBeInTheDocument()
    expect(await screen.findByText(sampleIdeas[0].content)).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.queryByText(/carregando favoritos/i)).not.toBeInTheDocument()
    })
  })

  it('exibe mensagem vazia quando não existem favoritos', async () => {
    mockGetFavorites.mockResolvedValueOnce([])

    renderWithProviders(<FavoritesPage />)

    expect(await screen.findByText(/nenhuma ideia favorita ainda/i)).toBeInTheDocument()
  })

  it('remove a ideia da lista ao desfavoritar', async () => {
    mockGetFavorites.mockResolvedValueOnce(sampleIdeas)
    mockToggleFavorite.mockResolvedValueOnce()

    renderWithProviders(<FavoritesPage />)
    await screen.findByText(sampleIdeas[0].content)

    const unfavoriteButton = screen.getAllByRole('button', { name: /desfavoritar/i })[0]
    await userEvent.click(unfavoriteButton)

    expect(mockToggleFavorite).toHaveBeenCalledWith('idea-1', false)
    await waitFor(() => {
      expect(screen.queryByText(sampleIdeas[0].content)).not.toBeInTheDocument()
    })
  })
})
