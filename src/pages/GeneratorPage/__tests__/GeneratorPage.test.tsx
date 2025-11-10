import { describe, it, expect, vi, afterEach } from 'vitest'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { renderWithProviders } from '@/test/test-utils'
import { GeneratorPage } from '../GeneratorPage'

type User = ReturnType<typeof userEvent.setup>

async function createIdea(user: User) {
  const generateButton = screen.getByRole('button', { name: /gerar ideia/i })
  expect(generateButton).not.toBeDisabled()
  await user.click(generateButton)
  await screen.findByText(/ia que aprende/i)
}

describe('GeneratorPage', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('exibe estado inicial com CTA desabilitado', () => {
    renderWithProviders(<GeneratorPage disableChatWidget />)
    expect(
      screen.getByText(/Digite um tema e contexto para gerar sua primeira ideia/i)
    ).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /gerar ideia/i })).toBeDisabled()
  })

  it('gera uma ideia quando tema e contexto são preenchidos', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderWithProviders(
      <GeneratorPage defaultTheme="Tecnologia" defaultContext="Pitch para app" disableChatWidget />
    )

    const user = userEvent.setup()
    await createIdea(user)

    const ideasCard = screen.getByText(/ideias geradas/i).closest('section')!
    expect(within(ideasCard).getByText('1')).toBeInTheDocument()

    const favoritesCard = screen.getByText(/favoritas/i).closest('section')!
    expect(within(favoritesCard).getByText('0')).toBeInTheDocument()
  })

  it('permite favoritar a ideia atual e atualiza os indicadores', async () => {
    vi.spyOn(Math, 'random').mockReturnValue(0)
    renderWithProviders(
      <GeneratorPage defaultTheme="Tecnologia" defaultContext="Pitch para app" disableChatWidget />
    )

    const user = userEvent.setup()
    await createIdea(user)

    const favoriteButton = screen.getByRole('button', { name: /favoritar/i })
    await user.click(favoriteButton)
    expect(favoriteButton).toHaveAttribute('aria-pressed', 'true')

    const favoritesCard = screen.getByText(/favoritas/i).closest('section')!
    expect(within(favoritesCard).getByText('1')).toBeInTheDocument()
  })

  it('o botão "Surpreenda-me" preenche tema/contexto e gera uma ideia', async () => {
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(0.3) // tema -> Viagem
      .mockReturnValueOnce(0.0) // contexto -> primeiro item
      .mockReturnValue(0)

    renderWithProviders(<GeneratorPage disableChatWidget />)

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /surpreenda-me/i }))

    expect(await screen.findByText(/app que conecta viajantes/i)).toBeInTheDocument()
    const textarea = screen.getByPlaceholderText(/descreva o contexto/i) as HTMLTextAreaElement
    expect(textarea.value).not.toEqual('')
  })
})
