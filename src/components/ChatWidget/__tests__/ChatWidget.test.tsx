import { beforeAll, describe, expect, it, vi } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWidget } from '../ChatWidget'
import { renderWithProviders } from '@/test/test-utils'

beforeAll(() => {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    configurable: true,
  })
})

describe('ChatWidget', () => {
  it('renderiza layout completo com mensagem inicial', () => {
    renderWithProviders(<ChatWidget defaultOpen />)

    expect(screen.getByText(/Aiko/i)).toBeInTheDocument()
    expect(screen.getByText(/chat livre/i)).toBeInTheDocument()
    expect(
      screen.getByText(/Sou seu assistente\. Fale comigo sobre qualquer assunto/i)
    ).toBeInTheDocument()
  })

  it('simula resposta local ao enviar mensagem', async () => {
    renderWithProviders(<ChatWidget defaultOpen />)
    const textarea = screen.getByPlaceholderText(/escreva sua mensagem/i)

    await userEvent.type(textarea, 'Olá, tudo bem?')
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(screen.getByText('Olá, tudo bem?')).toBeInTheDocument()
    expect(await screen.findByText(/modo preview/i)).toBeInTheDocument()
  })
})
