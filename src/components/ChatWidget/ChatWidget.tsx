import { useCallback, useEffect, useMemo, useState } from 'react'
import { Chat } from './Chat'
import { MessageSquare, X } from 'lucide-react'
import type { ChatIdeaSummary } from '@/types/chat'
import { cn } from '@/lib/utils'
import { useChatContext } from '@/context/ChatContext'

const CHAT_STORAGE_KEY = 'ideas-lab-chat-mode'

const MODES = [
  { id: 'chatlivre' as const, label: 'Chat Livre' },
  { id: 'chatIdeas' as const, label: 'Chat Ideas' },
]

type ChatModes = (typeof MODES)[number]['id']

type ChatWidgetProps = {
  defaultOpen?: boolean
}

export function ChatWidget({ defaultOpen = false }: ChatWidgetProps) {
  const [open, setOpen] = useState(defaultOpen)
  const [mode, setMode] = useState<ChatModes>('chatlivre')
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)

  const {
    summaries,
    summariesLoading: loadingSummaries,
    summariesError,
    ensureSummaries,
    sessionId,
    ideaId,
    tokensRemaining,
    messages,
    isLoading,
    isStarting,
    isSending,
    sessionError,
    notice,
    startFreeChat,
    startIdeaChat,
    sendMessage,
  } = useChatContext()
  const limitReached = tokensRemaining !== null && tokensRemaining <= 0

  useEffect(() => {
    try {
      const persisted = localStorage.getItem(CHAT_STORAGE_KEY) as ChatModes | null
      if (persisted && MODES.some((item) => item.id === persisted)) {
        setMode(persisted)
      }
    } catch (error) {
      console.warn('Nao foi possivel carregar a configuracao do chat', error)
    }
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_STORAGE_KEY, mode)
    } catch (error) {
      console.warn('Nao foi possivel salvar a configuracao do chat', error)
    }
  }, [mode])

  useEffect(() => {
    if (!open) {
      setSelectedIdeaId(null)
      return
    }

    if (limitReached) return

    if (mode === 'chatlivre' && !sessionId && !isStarting) {
      void startFreeChat()
      return
    }

    if (mode === 'chatIdeas' && !isStarting) {
      void ensureSummaries()
    }
  }, [open, mode, sessionId, startFreeChat, ensureSummaries, limitReached, isStarting])

  useEffect(() => {
    if (mode !== 'chatIdeas' || limitReached || isStarting) {
      return
    }

    if (summaries.length === 0) {
      setSelectedIdeaId(null)
      return
    }

    if (!selectedIdeaId || !summaries.some((item) => item.ideaId === selectedIdeaId)) {
      const first = summaries[0]
      setSelectedIdeaId(first.ideaId)
      void startIdeaChat(first.ideaId)
      return
    }

    if (ideaId !== selectedIdeaId) {
      void startIdeaChat(selectedIdeaId)
    }
  }, [mode, summaries, selectedIdeaId, ideaId, startIdeaChat, limitReached])

  const handleSwitch = useCallback(
    (nextMode: ChatModes) => {
      if (limitReached) return
      if (nextMode === mode) return
      setMode(nextMode)
      if (nextMode === 'chatlivre') {
        setSelectedIdeaId(null)
        if (!sessionId) {
          setTimeout(() => void startFreeChat(), 0)
        }
      } else {
        void ensureSummaries()
      }
      setOpen(true)
    },
    [limitReached, mode, sessionId, startFreeChat, ensureSummaries]
  )

  const handleIdeaClick = useCallback(
    (summary: ChatIdeaSummary) => {
      if (limitReached) return
      setSelectedIdeaId(summary.ideaId)
      void startIdeaChat(summary.ideaId)
    },
    [limitReached, startIdeaChat]
  )

  const placeholder = useMemo(() => {
    if (limitReached) {
      return 'Tokens indisponiveis. Aguarde 24 horas para tentar novamente.'
    }
    if (mode === 'chatIdeas') {
      if (!selectedIdeaId) {
        return 'Selecione uma ideia para comecar a conversa...'
      }
      const summary = summaries.find((item) => item.ideaId === selectedIdeaId)
      if (summary) {
        return `Faca uma pergunta sobre "${summary.title}"...`
      }
      return 'Faca uma pergunta sobre a ideia selecionada...'
    }
    return 'Escreva sua mensagem...'
  }, [mode, selectedIdeaId, summaries, limitReached])

  const recentEntries = useMemo(() => {
    if (mode !== 'chatIdeas') return []
    return summaries
  }, [mode, summaries])
  const lowTokens = tokensRemaining !== null && tokensRemaining > 0 && tokensRemaining <= 5
  const showRecent = mode === 'chatIdeas' && (loadingSummaries || recentEntries.length > 0)
  const noticeMessage = limitReached
    ? 'Seus tokens acabaram. Tente novamente em 24 horas.'
    : lowTokens
    ? 'Voce esta com poucos tokens disponiveis. Uma nova solicitacao pode nao ser processada.'
    : notice ?? null
  const canUseIdeasTab = recentEntries.length > 0

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
          <div className="flex h-[70vh] w-full overflow-hidden rounded-3xl border border-[#d9d4ff] bg-white shadow-[0_24px_60px_rgba(99,102,241,0.16)]">
            {showRecent ? (
              <div className="hidden h-full w-[260px] shrink-0 items-stretch md:flex">
                <aside className="ml-4 mr-2 flex flex-1 flex-col gap-4 overflow-hidden rounded-2xl border border-[#ebe7ff] bg-white px-4 py-5">
                  <RecentIdeasHeading loading={loadingSummaries} error={summariesError} />
                  <RecentIdeasList
                    ideas={recentEntries}
                    loading={loadingSummaries}
                    selectedIdeaId={selectedIdeaId}
                    onSelect={handleIdeaClick}
                    disabled={limitReached}
                  />
                </aside>
              </div>
            ) : null}

            <div className="flex min-w-0 flex-1 flex-col bg-white">
              <header className="flex items-start justify-between gap-4 border-b border-[#eceafd] px-6 py-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">ChatDuo</p>
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

              <nav className="flex gap-6 border-b border-[#eceafd] px-6 pt-3 text-sm font-semibold text-slate-400">
                {MODES.map(({ id, label }) => {
                  const active = id === mode
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => handleSwitch(id)}
                      aria-pressed={active}
                      disabled={limitReached}
                      className={cn(
                        'pb-3 transition-colors disabled:cursor-not-allowed disabled:text-slate-300',
                        active ? 'relative pb-3 text-slate-900' : 'hover:text-slate-600'
                      )}
                    >
                      {label}
                      {active ? <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" /> : null}
                    </button>
                  )
                })}
              </nav>
              {!canUseIdeasTab && mode === 'chatlivre' ? (
                <p className="px-6 pb-3 text-xs text-slate-500">
                  Gere uma ideia primeiro para liberar o Chat Ideas.
                </p>
              ) : null}

              {mode === 'chatIdeas' ? (
                <div className="border-b border-[#eceafd] px-6 py-4 md:hidden">
                  <RecentIdeasHeading loading={loadingSummaries} error={summariesError} />
                  {canUseIdeasTab ? (
                    <RecentIdeasList
                      ideas={recentEntries}
                      loading={loadingSummaries}
                      selectedIdeaId={selectedIdeaId}
                      onSelect={handleIdeaClick}
                      disabled={limitReached}
                    />
                  ) : (
                    <p className="text-sm text-slate-500">
                      Nenhuma ideia gerada ainda. Gere uma ideia antes de usar o chat.
                    </p>
                  )}
                </div>
              ) : null}

              <div className="flex-1 overflow-hidden">
                <Chat
                  messages={messages}
                  disabled={
                    limitReached
                      ? true
                      : mode === 'chatIdeas'
                      ? !canUseIdeasTab ||
                        !selectedIdeaId ||
                        !sessionId ||
                        loadingSummaries ||
                        summariesError !== null
                      : !sessionId
                  }
                  isLoading={isLoading}
                  isSending={isSending}
                  showTyping={
                    limitReached ? false : mode === 'chatIdeas' ? isSending && !!selectedIdeaId : isSending
                  }
                  notice={noticeMessage}
                  error={sessionError}
                  onSend={sendMessage}
                  placeholder={placeholder}
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

type RecentIdeasHeadingProps = {
  loading: boolean
  error: string | null
}

function RecentIdeasHeading({ loading, error }: RecentIdeasHeadingProps) {
  if (loading) {
    return <div className="mb-4 h-4 w-32 animate-pulse rounded-full bg-slate-200" />
  }
  if (error) {
    return <p className="mb-4 text-xs font-medium text-rose-500">Erro ao carregar ideias</p>
  }
  return <h4 className="mb-4 text-sm font-semibold text-slate-600">Ultimas ideias</h4>
}

type RecentIdeasListProps = {
  ideas: ChatIdeaSummary[]
  loading: boolean
  selectedIdeaId: string | null
  onSelect: (idea: ChatIdeaSummary) => void
  disabled?: boolean
}

function RecentIdeasList({ ideas, loading, selectedIdeaId, onSelect, disabled }: RecentIdeasListProps) {
  if (loading) {
    return (
      <ul className="flex-1 space-y-4 overflow-hidden pr-1">
        {Array.from({ length: 4 }).map((_, index) => (
          <li key={index} className="space-y-2">
            <div className="h-3 w-32 animate-pulse rounded-full bg-slate-200" />
            <div className="h-3 w-40 animate-pulse rounded-full bg-slate-100" />
          </li>
        ))}
      </ul>
    )
  }

  if (!ideas.length) {
    return <p className="text-sm text-slate-400">Nenhuma ideia gerada ainda.</p>
  }

  return (
    <ul className="flex-1 space-y-3 overflow-y-auto pr-1 text-sm">
      {ideas.map((idea) => {
        const active = idea.ideaId === selectedIdeaId
        return (
          <li key={idea.ideaId} className="px-1">
            <button
              type="button"
              onClick={() => onSelect(idea)}
              className={cn(
                'w-full overflow-hidden rounded-2xl border border-transparent px-3 py-2 text-left transition hover:border-[#cfb5ff] hover:bg-[#f6f1ff] focus:outline-none focus:ring-2 focus:ring-[#a855f7]/40 disabled:cursor-not-allowed disabled:opacity-60',
                active && 'border-[#cbb4ff] bg-[#f3f0ff] text-slate-900 shadow-sm'
              )}
              disabled={disabled}
            >
              <span className="mb-0.5 block truncate text-sm font-semibold text-slate-800">{idea.title}</span>
              <span className="block truncate text-xs leading-tight text-slate-500">
                Ideias rapidas para: {idea.summary}
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}







