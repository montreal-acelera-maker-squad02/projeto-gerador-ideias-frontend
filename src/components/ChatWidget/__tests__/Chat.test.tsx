import { describe, expect, it, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Chat } from '../Chat'

const messages = [
  { id: '1', role: 'assistant', content: 'Olá! Como posso ajudar?' },
  { id: '2', role: 'user', content: 'Quero uma ideia.' },
]

beforeAll(() => {
  Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
    value: vi.fn(),
    configurable: true,
  })
})

describe('Chat', () => {
  let onSend: ReturnType<typeof vi.fn>

  beforeEach(() => {
    onSend = vi.fn().mockResolvedValue(undefined)
  })

  it('renderiza mensagens e informações de tokens livres', () => {
    render(
      <Chat
        messages={messages}
        onSend={onSend}
        placeholder="Escreva sua mensagem"
        tokensRemaining={7000}
        chatType="free"
      />
    )

    expect(screen.getByText(/Olá! Como posso ajudar\?/i)).toBeInTheDocument()
    expect(screen.getByText(/Quero uma ideia\./i)).toBeInTheDocument()
    expect(screen.getByText(/Cada chat possui um limite de 10\.000 tokens\./i)).toBeInTheDocument()
    expect(screen.getByText('7.000 / 10.000')).toBeInTheDocument()
  })

  it('envia mensagem ao clicar no botão e ao pressionar Enter', async () => {
    const user = userEvent.setup({ delay: null })

    render(
      <Chat
        messages={[]}
        onSend={onSend}
        placeholder="Escreva sua mensagem"
      />
    )

    const textarea = screen.getByPlaceholderText(/escreva sua mensagem/i)
    await user.type(textarea, ' Teste ')
    const sendButton = screen.getByRole('button', { name: /enviar mensagem/i })

    await user.click(sendButton)
    expect(onSend).toHaveBeenCalledWith('Teste')
    expect(textarea).toHaveValue('')

    await user.type(textarea, 'Outro')
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false })
    expect(onSend).toHaveBeenNthCalledWith(2, 'Outro')
  })

  it('mostra avisos e erros quando fornecidos', () => {
    render(
      <Chat
        messages={[]}
        onSend={onSend}
        placeholder="Escreva sua mensagem"
        notice="Aviso importante"
        error="Falha ao enviar"
        tokensRemaining={200}
        chatType="ideas"
      />
    )

    expect(screen.getByText(/Aviso importante/i)).toBeInTheDocument()
    expect(screen.getByText(/Falha ao enviar/i)).toBeInTheDocument()
    expect(screen.getByText(/Limite de 10\.000 tokens\. Ao atingir,/i)).toBeInTheDocument()
    expect(screen.getByText('200 / 10.000')).toBeInTheDocument()
  })
})
