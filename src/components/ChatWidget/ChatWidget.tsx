import { useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Chat } from './Chat'
import type { ChatMessage } from '@/types/chat'

type ChatWidgetProps = {
  defaultOpen?: boolean
}

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content: 'O chatbot está em desenvolvimento. Em breve teremos conversas reais por aqui!',
  },
]

export function ChatWidget({ defaultOpen = false }: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [isSending, setIsSending] = useState(false)

  const handleSend = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    setMessages((prev) => [...prev, userMessage])

    setIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 450))

    const assistantReply: ChatMessage = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: 'Integração oficial chegando em breve. Obrigado pela paciência!',
    }
    setMessages((prev) => [...prev, assistantReply])
    setIsSending(false)
  }

  return (
    <>
      {open ? (
        <div
          className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:bg-transparent"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
      ) : null}

      <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-[420px] flex-col items-end gap-3 px-4 md:px-0">
        {open ? (
          <div className="flex h-[70vh] w-full overflow-hidden rounded-3xl border border-[#d9d4ff] bg-white shadow-[0_24px_60px_rgba(99,102,241,0.16)]">
            <div className="flex min-w-0 flex-1 flex-col bg-white">
              <header className="flex items-start justify-between gap-4 border-b border-[#eceafd] px-6 py-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">ChatDuo</p>
                  <p className="text-xs text-slate-500">Preview sem integração</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Fechar chat"
                  className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </header>

              <div className="flex-1 overflow-hidden">
                <Chat
                  messages={messages}
                  disabled={false}
                  isLoading={false}
                  isSending={isSending}
                  showTyping={isSending}
                  notice="O chatbot está sem integração no momento."
                  error={null}
                  onSend={handleSend}
                  placeholder="Digite sua mensagem"
                />
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label={open ? 'Fechar chat' : 'Abrir chat'}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white shadow-[0_16px_40px_rgba(99,102,241,0.35)] transition hover:shadow-[0_20px_44px_rgba(99,102,241,0.42)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a855f7] ${open ? 'scale-95' : ''}`}
        >
          {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>
    </>
  )
}
