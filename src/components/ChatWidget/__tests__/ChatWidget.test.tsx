import { beforeAll, describe, expect, it, vi, beforeEach } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ChatWidget } from '../ChatWidget'
import { renderWithProviders } from '@/test/test-utils'
import { chatService } from '@/services/chatService'
import type { ChatSession } from '@/types/chat'

vi.mock('@/services/chatService')

const mockChatService = vi.mocked(chatService)

beforeAll(() => {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    configurable: true,
  })
})

const mockFreeSession: ChatSession = {
  sessionId: 1,
  chatType: 'FREE',
  ideaId: null,
  ideaSummary: null,
  tokensInput: 0,
  tokensOutput: 0,
  totalTokens: 0,
  tokensRemaining: 10000,
  lastResetAt: null,
  messages: [
    {
      id: '1',
      role: 'assistant',
      content: 'Oi! Sou seu assistente. Fale comigo sobre qualquer assunto e eu respondo de forma clara e direta.',
      createdAt: new Date().toISOString(),
    },
  ],
  hasMoreMessages: false,
}

const mockIdeaSession: ChatSession = {
  sessionId: 2,
  chatType: 'IDEAS',
  ideaId: '10',
  ideaSummary: 'uma ideia',
  tokensInput: 0,
  tokensOutput: 0,
  totalTokens: 0,
  tokensRemaining: 900,
  lastResetAt: null,
  messages: [
    {
      id: 'idea-1',
      role: 'assistant',
      content: 'Resposta da ideia',
      createdAt: new Date().toISOString(),
    },
  ],
  hasMoreMessages: false,
}

const mockIdeas = [
  {
    ideaId: '444',
    title: 'Teste ideia',
    summary: 'Resumo rápido',
    createdAt: new Date().toISOString(),
  },
]

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockChatService.startChat.mockImplementation(async (ideaId?: number) =>
      ideaId ? mockIdeaSession : mockFreeSession
    )
    mockChatService.sendMessage.mockResolvedValue({
      id: '2',
      role: 'assistant',
      content: 'Ainda estou em modo preview, mas em breve vou responder com ideias reais conectadas ao gerador ??',
      createdAt: new Date().toISOString(),
      tokensRemaining: 9999,
    })
    mockChatService.getIdeasSummary.mockResolvedValue(mockIdeas)
  })

  it('renderiza layout completo com mensagem inicial', async () => {
    renderWithProviders(<ChatWidget defaultOpen />)

    expect(screen.getByText(/Aiko/i)).toBeInTheDocument()
    expect(screen.getByText(/chat livre/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(
        screen.getByText(/Oi! Sou seu assistente\. Fale comigo sobre qualquer assunto/i)
      ).toBeInTheDocument()
    })
  })

  it('simula resposta local ao enviar mensagem', async () => {
    renderWithProviders(<ChatWidget defaultOpen />)
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/escreva sua mensagem/i)).toBeInTheDocument()
    })
    
    const textarea = screen.getByPlaceholderText(/escreva sua mensagem/i)
    const user = userEvent.setup()

    await user.type(textarea, 'Ol�, tudo bem?')
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i })
    await user.click(sendButton)

    expect(await screen.findByText('Ol�, tudo bem?', { timeout: 3000 })).toBeInTheDocument()
    expect(await screen.findByText(/em breve vou responder/i, { timeout: 3000 })).toBeInTheDocument()
  })

  it('carrega o painel de ideias e seleciona uma conversa de ideia', async () => {
    renderWithProviders(<ChatWidget defaultOpen />)
    await waitFor(() => expect(screen.getByText(/chat livre/i)).toBeInTheDocument())

    const user = userEvent.setup()
    await user.click(screen.getByRole('button', { name: /chat ideias/i }))

    await waitFor(() => expect(screen.getByText(/suas ideias/i)).toBeInTheDocument())
    expect(mockChatService.getIdeasSummary).toHaveBeenCalled()

    const ideaButton = screen
      .getAllByRole('button')
      .find((btn) => btn.textContent?.includes('Teste ideia'))
    expect(ideaButton).toBeDefined()
    if (ideaButton) {
      await user.click(ideaButton)
    }

    await waitFor(() => {
      expect(mockChatService.startChat).toHaveBeenCalledWith(444)
    })

    expect(screen.getByText(/conversando sobre:/i)).toBeInTheDocument()
    expect(
      screen.getByText('Teste ideia', { selector: 'span.font-semibold.text-purple-600' })
    ).toBeInTheDocument()
  })
})
