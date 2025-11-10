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
  it('mostra aviso de preview quando aberto', () => {
    renderWithProviders(<ChatWidget defaultOpen />)

    expect(screen.getByText(/preview sem integração/i)).toBeInTheDocument()
    expect(screen.getByText(/sem integração no momento/i)).toBeInTheDocument()
  })

  it('simula resposta local ao enviar mensagem', async () => {
    renderWithProviders(<ChatWidget defaultOpen />)
    const textarea = screen.getByPlaceholderText(/digite sua mensagem/i)

    await userEvent.type(textarea, 'Olá, tudo bem?')
    await userEvent.click(screen.getByRole('button', { name: /enviar mensagem/i }))

    expect(screen.getByText('Olá, tudo bem?')).toBeInTheDocument()
    expect(await screen.findByText(/integração oficial chegando/i)).toBeInTheDocument()
  })
})
