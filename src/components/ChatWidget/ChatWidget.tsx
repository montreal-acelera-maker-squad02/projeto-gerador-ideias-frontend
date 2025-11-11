import { useCallback, useEffect, useMemo, useState } from 'react'
import { MessageSquare, X } from 'lucide-react'
import { Chat } from './Chat'
import type { ChatMessage } from '@/types/chat'
import type { Idea } from '@/components/IdeiaCard/BaseIdeiaCard'
import { HISTORY_CACHE_KEY } from '@/constants/storageKeys'
import { subscribeHistoryRefresh } from '@/events/historyEvents'

const INITIAL_MESSAGES: ChatMessage[] = [
  {
    id: 'assistant-welcome',
    role: 'assistant',
    content:
      'Oi! Sou seu assistente. Fale comigo sobre qualquer assunto e eu respondo de forma clara e direta.',
  },
]

const RECENT_LIMIT = 6

type ChatWidgetProps = {
  defaultOpen?: boolean
}

type TabKey = 'free' | 'ideas'

function loadRecentIdeas(): Idea[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_CACHE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Array<Idea & { timestamp: string }>
    return parsed
      .map((idea) => ({
        ...idea,
        timestamp: idea.timestamp ? new Date(idea.timestamp) : new Date(),
      }))
      .slice(0, RECENT_LIMIT)
  } catch (error) {
    console.warn('Não foi possível carregar o histórico do chat', error)
    return []
  }
}

export function ChatWidget({ defaultOpen = false }: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [activeTab, setActiveTab] = useState<TabKey>('free')
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_MESSAGES)
  const [ideaMessages, setIdeaMessages] = useState<ChatMessage[]>([])
  const [isSending, setIsSending] = useState(false)
  const [ideaIsSending, setIdeaIsSending] = useState(false)
  const [recentIdeas, setRecentIdeas] = useState<Idea[]>(loadRecentIdeas())
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)

  const selectedIdea = useMemo(
    () => recentIdeas.find((idea) => idea.id === selectedIdeaId) ?? null,
    [recentIdeas, selectedIdeaId]
  )

  const syncRecentIdeas = useCallback(() => {
    setRecentIdeas(loadRecentIdeas())
  }, [])

  useEffect(() => {
    const unsubscribe = subscribeHistoryRefresh(syncRecentIdeas)
    const storageHandler = (event: StorageEvent) => {
      if (event.key === HISTORY_CACHE_KEY) {
        syncRecentIdeas()
      }
    }
    window.addEventListener('storage', storageHandler)
    return () => {
      unsubscribe()
      window.removeEventListener('storage', storageHandler)
    }
  }, [syncRecentIdeas])

  useEffect(() => {
    if (!selectedIdeaId) return
    const exists = recentIdeas.some((idea) => idea.id === selectedIdeaId)
    if (!exists) {
      setSelectedIdeaId(null)
      setIdeaMessages([])
    }
  }, [recentIdeas, selectedIdeaId])

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
      content:
        'Ainda estou em modo preview, mas em breve vou responder com ideias reais conectadas ao gerador 👀',
    }
    setMessages((prev) => [...prev, assistantReply])
    setIsSending(false)
  }

  const handleIdeaSelect = (idea: Idea) => {
    setSelectedIdeaId(idea.id)
    setIdeaMessages([
      {
        id: `idea-intro-${idea.id}`,
        role: 'assistant',
        content: `Vamos analisar "${idea.theme || 'essa ideia'}". Pergunte como posso melhorar ou adaptar para seu cenário.`,
      },
    ])
  }

  const handleIdeaChatSend = async (message: string) => {
    if (!selectedIdea) return
    const trimmed = message.trim()
    if (!trimmed) return

    const userMessage: ChatMessage = {
      id: `idea-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
    }
    setIdeaMessages((prev) => [...prev, userMessage])

    setIdeaIsSending(true)
    await new Promise((resolve) => setTimeout(resolve, 450))

    const assistantReply: ChatMessage = {
      id: `idea-assistant-${Date.now()}`,
      role: 'assistant',
      content: `Perfeito! Em breve vou usar os dados da ideia "${selectedIdea.theme || 'sem tema'}" para sugerir novas variações automaticamente.`,
    }
    setIdeaMessages((prev) => [...prev, assistantReply])
    setIdeaIsSending(false)
  }

  const renderIdeasList = () => {
    if (recentIdeas.length === 0) {
      return <p className="px-4 text-xs text-slate-500">Gere uma ideia para vê-la por aqui.</p>
    }

    return recentIdeas.map((idea) => (
      <button
        key={idea.id}
        type="button"
        onClick={() => handleIdeaSelect(idea)}
        className={`w-full border-b border-slate-100 px-4 py-3 text-left last:border-none transition ${
          selectedIdeaId === idea.id
            ? 'bg-white shadow-[inset_0_0_0_1px_rgba(99,102,241,0.35)]'
            : 'bg-transparent hover:bg-white/40'
        }`}
      >
        <p className="text-sm font-medium text-slate-800 line-clamp-1">{idea.theme || 'Ideia'}</p>
        <p className="text-xs text-slate-500 line-clamp-1">
          {idea.context || idea.content || 'Sem contexto ainda'}
        </p>
      </button>
    ))
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

      <div className="fixed bottom-6 right-6 z-50 flex w-full max-w-[720px] flex-col items-end gap-3 px-4 md:px-0">
        {open ? (
          <div className="flex h-[700px] w-full overflow-hidden rounded-[32px] border border-[#d9d4ff] bg-white shadow-[0_28px_70px_rgba(99,102,241,0.2)]">
            <aside className="w-52 flex-shrink-0 flex-col border-r border-[#eceafd] bg-[#f8f7ff] text-slate-700">
              <div className="border-b border-[#eceafd] px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Últimas ideias
              </div>
              {activeTab === 'ideas' ? (
                <div className="flex-1 overflow-y-auto">{renderIdeasList()}</div>
              ) : (
                <div className="flex flex-1 items-center justify-center px-4 text-center text-xs text-slate-400">
                  Abra o Chat Ideas para visualizar as mais recentes.
                </div>
              )}
            </aside>

            <div className="flex min-w-0 flex-1 flex-col bg-white">
              <header className="flex items-center justify-between border-b border-[#eceafd] px-5 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Aiko</p>
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

              <nav className="flex items-center gap-6 border-b border-[#eceafd] px-5">
                {[{ key: 'free', label: 'Chat Livre' }, { key: 'ideas', label: 'Chat Ideas' }].map(
                  ({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setActiveTab(key as TabKey)}
                      className={`relative pb-2 text-sm font-medium transition ${
                        activeTab === key
                          ? 'text-slate-900'
                          : 'text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      {label}
                      {activeTab === key ? (
                        <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-slate-900" />
                      ) : null}
                    </button>
                  )
                )}
              </nav>

              <div className="flex flex-1 flex-col min-h-0">
                {activeTab === 'free' ? (
                  <Chat
                    messages={messages}
                    disabled={false}
                    isLoading={false}
                    isSending={isSending}
                    showTyping={isSending}
                    notice="Preview sem conexão com o backend. Aproveite para testar o fluxo."
                    error={null}
                    onSend={handleSend}
                    placeholder="Escreva sua mensagem..."
                  />
                ) : (
                  <Chat
                    messages={selectedIdea ? ideaMessages : []}
                    disabled={!selectedIdea}
                    isLoading={false}
                    isSending={ideaIsSending}
                    showTyping={ideaIsSending}
                    notice={
                      selectedIdea
                        ? `Conversando sobre "${selectedIdea.theme || 'sua ideia'}".`
                        : 'Selecione uma ideia na coluna ao lado para liberar o chat.'
                    }
                    error={null}
                    onSend={handleIdeaChatSend}
                    placeholder={
                      selectedIdea
                        ? `Escreva sua pergunta sobre "${selectedIdea.theme || 'a ideia'}"...`
                        : 'Selecione uma ideia para conversar...'
                    }
                  />
                )}
              </div>
            </div>
          </div>
        ) : null}

        <button
          type="button"
          aria-label={open ? 'Fechar chat' : 'Abrir chat'}
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className={`flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white shadow-[0_16px_40px_rgba(99,102,241,0.35)] transition hover:shadow-[0_20px_44px_rgba(99,102,241,0.42)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a855f7] ${
            open ? 'scale-95' : ''
          }`}
        >
          {open ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
        </button>
      </div>
    </>
  )
}
