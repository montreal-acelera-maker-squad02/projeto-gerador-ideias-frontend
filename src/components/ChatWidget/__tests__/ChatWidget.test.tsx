import { describe, it, expect } from 'vitest'
import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWidget } from '../ChatWidget'
import { renderWithProviders, createChatContextValue } from '@/test/test-utils'

describe('ChatWidget', () => {
  it('desabilita Chat Ideas quando nao ha historico', async () => {
    renderWithProviders(<ChatWidget defaultOpen />, {
      chatContext: createChatContextValue({
        summaries: [],
        summariesLoading: false,
      }),
    })

    const tab = screen.getByRole('button', { name: /chat ideas/i })
    expect(tab).toBeDisabled()
    expect(screen.getByText(/gere uma ideia primeiro/i)).toBeInTheDocument()
  })

  it('bloqueia interacoes quando os tokens acabam', async () => {
    renderWithProviders(<ChatWidget defaultOpen />, {
      chatContext: createChatContextValue({
        summaries: [{ ideaId: '1', title: 'tech', summary: 'app' }],
        tokensRemaining: 0,
        sessionId: 'session-limit',
      }),
    })

    const input = screen.getByPlaceholderText(/tokens indisponiveis/i) as HTMLTextAreaElement
    expect(input).toBeDisabled()
    await userEvent.click(screen.getByRole('button', { name: /chat livre/i }))
    expect(screen.getByText(/seus tokens acabaram/i)).toBeInTheDocument()
  })
})

