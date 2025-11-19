import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react"
import { MessageSquare, X, Sparkles, MessageCircle, Clock } from "lucide-react"
import { Chat } from "./Chat"
import { TokenNotification } from "./TokenNotification"
import type { ChatMessage, ChatSession, ChatIdeaSummary } from "@/types/chat"
import { chatService } from "@/services/chatService"

type ChatWidgetProps = Readonly<{
  defaultOpen?: boolean
}>

type TabKey = "free" | "ideas"
type ChatWidgetStateReturn = ReturnType<typeof useChatWidgetState>

export function ChatWidget({ defaultOpen = false }: ChatWidgetProps) {
  const widgetState = useChatWidgetState(defaultOpen)
  const { activeTab, freeTokensRemaining, ideaTokensRemaining, open, setOpen } = widgetState

  return (
    <>
      {freeTokensRemaining !== null && activeTab === "free" && open && (
        <TokenNotification tokensRemaining={freeTokensRemaining} />
      )}
      {ideaTokensRemaining !== null && activeTab === "ideas" && open && (
        <TokenNotification tokensRemaining={ideaTokensRemaining} />
      )}

      <Backdrop open={open} onClose={() => setOpen(false)} />

      <div
        className={`fixed bottom-6 right-6 z-50 flex w-full flex-col items-end gap-3 px-4 md:px-0 ${
          open && activeTab === "ideas" ? "max-w-[900px]" : "max-w-[800px]"
        }`}
      >
        {open ? <ChatPanel state={widgetState} setOpen={setOpen} /> : <ChatClosedPrompt />}

        {!open && (
          <div className="mb-2 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
            <span className="text-sm font-medium text-slate-700">Fale com Aiko AI</span>
          </div>
        )}
        <ChatToggleButton open={open} onToggle={() => setOpen((prev) => !prev)} />
      </div>
    </>
  )
}

type BackdropProps = Readonly<{
  open: boolean
  onClose: () => void
}>

function Backdrop({ open, onClose }: BackdropProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-sm md:bg-transparent"
      onClick={onClose}
      aria-hidden="true"
    />
  )
}

const CHAT_PANEL_CLASS =
  "flex h-[700px] w-full flex-col overflow-hidden rounded-[32px] border border-[#d9d4ff] bg-white shadow-[0_28px_70px_rgba(99,102,241,0.2)]"

type ChatPanelProps = Readonly<{
  state: ChatWidgetStateReturn
  setOpen: (value: boolean | ((prev: boolean) => boolean)) => void
}>

function ChatPanel({ state, setOpen }: ChatPanelProps) {
  const {
    activeTab,
    handleTabChange,
    ideasList,
    isLoadingIdeas,
    ideaError,
    selectedIdea,
    selectedIdeaId,
    loadIdeas,
    handleIdeaSelect,
    handleFreeSend,
    handleIdeaSend,
    freeMessages,
    isSendingFree,
    isLoadingFree,
    freeError,
    freeTokensRemaining,
    loadOlderFreeMessages,
    hasMoreFreeMessages,
    isLoadingOlderFree,
    ideaMessages,
    isSendingIdea,
    isLoadingIdea,
    ideaTokensRemaining,
    isLoadingOlderIdea,
    hasMoreIdeaMessages,
    loadOlderIdeaMessages,
  } = state

  let ideaNotice: string | null
  if (!selectedIdea) {
    ideaNotice = "Selecione uma ideia na coluna ao lado para liberar o chat."
  } else if (ideaTokensRemaining !== null && ideaTokensRemaining < 1000) {
    ideaNotice = `Restam apenas ${formatTokensRemaining(ideaTokensRemaining)} tokens.`
  } else {
    ideaNotice = null
  }

  return (
    <div className={CHAT_PANEL_CLASS}>
      <header className="border-b border-[#eceafd]">
        <div className="flex items-center justify-between px-5 py-4 pb-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white font-bold">
              <span className="text-xs">AI</span>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Aiko AI</p>
              <p className="text-xs text-slate-500">Assistente Inteligente</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fechar chat"
            className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 transition-all hover:bg-slate-100 hover:text-slate-700 active:bg-slate-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex px-5">
          <ChatTabButton
            active={activeTab === "free"}
            onClick={() => handleTabChange("free")}
            icon={<MessageCircle className="h-4 w-4" />}
          >
            Chat Livre
          </ChatTabButton>
          <ChatTabButton
            active={activeTab === "ideas"}
            onClick={() => handleTabChange("ideas")}
            icon={<Sparkles className="h-4 w-4" />}
          >
            Chat Ideias
          </ChatTabButton>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        <IdeasSidebar
          activeTab={activeTab}
          ideasList={ideasList}
          isLoading={isLoadingIdeas}
          error={ideaError}
          selectedIdeaId={selectedIdeaId}
          onRetry={loadIdeas}
          onSelect={handleIdeaSelect}
        />

        <div className="flex min-w-0 flex-1 flex-col bg-white overflow-hidden">
          {activeTab === "ideas" && selectedIdea && (
            <div className="px-5 py-3 bg-purple-50 border-b border-[#eceafd] flex items-center gap-2 text-sm">
              <Sparkles className="h-4 w-4 text-purple-600" />
              <span className="text-slate-600">Conversando sobre:</span>
              <span className="font-semibold text-purple-600">{selectedIdea.title}</span>
            </div>
          )}

          <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
            {activeTab === "free" ? (
              <Chat
                messages={freeMessages}
                disabled={isSendingFree || isLoadingFree}
                error={freeError}
                isLoading={isLoadingFree}
                isSending={isSendingFree}
                showTyping={isSendingFree}
                notice={
                  freeTokensRemaining !== null && freeTokensRemaining < 1000
                    ? `Atenção: Restam apenas ${formatTokensRemaining(freeTokensRemaining)} tokens.`
                    : null
                }
                onLoadOlderMessages={loadOlderFreeMessages}
                onSend={handleFreeSend}
                placeholder="Escreva sua mensagem..."
                hasMoreMessages={hasMoreFreeMessages}
                isLoadingOlder={isLoadingOlderFree}
                tokensRemaining={freeTokensRemaining}
                chatType="free"
              />
            ) : (
              <Chat
                messages={selectedIdea ? ideaMessages : []}
                disabled={!selectedIdea || isSendingIdea || isLoadingIdea}
                error={ideaError}
                isLoading={isLoadingIdea}
                isSending={isSendingIdea}
                showTyping={isSendingIdea}
                notice={ideaNotice}
                onLoadOlderMessages={loadOlderIdeaMessages}
                onSend={handleIdeaSend}
                placeholder={
                  selectedIdea
                    ? `Escreva sua pergunta sobre "${selectedIdea.title || "a ideia"}"...`
                    : "Selecione uma ideia para conversar..."
                }
                hasMoreMessages={hasMoreIdeaMessages}
                isLoadingOlder={isLoadingOlderIdea}
                tokensRemaining={ideaTokensRemaining}
                chatType="ideas"
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

type ChatTabButtonProps = Readonly<{
  active: boolean
  onClick: () => void
  icon: ReactNode
  children: ReactNode
}>

function ChatTabButton({ active, onClick, icon, children }: ChatTabButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-4 py-3 font-medium border-b-2 transition-all",
        active ? "border-purple-600 text-purple-600" : "border-transparent text-slate-500 hover:text-slate-700"
      )}
    >
      {icon}
      <span>{children}</span>
    </button>
  )
}

type IdeasSidebarProps = Readonly<{
  activeTab: TabKey
  ideasList: ChatIdeaSummary[]
  isLoading: boolean
  error: string | null
  selectedIdeaId: string | null
  onRetry: () => Promise<void>
  onSelect: (idea: ChatIdeaSummary) => void
}>

function IdeasSidebar({
  activeTab,
  ideasList,
  isLoading,
  error,
  selectedIdeaId,
  onRetry,
  onSelect,
}: IdeasSidebarProps) {
  return (
    <aside
      className={`flex-shrink-0 flex flex-col border-r border-[#eceafd] bg-gray-50 text-slate-700 transition-all duration-300 ease-in-out overflow-hidden ${
        activeTab === "ideas" ? "w-64" : "w-0"
      }`}
    >
      <div className="w-64 flex flex-col h-full">
        <div className="px-4 py-3.5 bg-white">
          <h3 className="font-semibold text-slate-800 text-sm">Suas Ideias</h3>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <IdeasList
            ideas={ideasList}
            isLoading={isLoading}
            error={error}
            selectedIdeaId={selectedIdeaId}
            onRetry={onRetry}
            onSelect={onSelect}
          />
        </div>
      </div>
    </aside>
  )
}

function ChatClosedPrompt() {
  return (
    <div className="mb-2 flex items-center gap-2 rounded-full bg-white px-4 py-2 shadow-lg">
      <span className="text-sm font-medium text-slate-700">Fale com Aiko AI</span>
    </div>
  )
}

type ChatToggleButtonProps = Readonly<{
  open: boolean
  onToggle: () => void
}>

function ChatToggleButton({ open, onToggle }: ChatToggleButtonProps) {
  return (
    <button
      type="button"
      aria-label={open ? "Fechar chat" : "Abrir chat"}
      aria-expanded={open}
      onClick={onToggle}
      className="group relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white shadow-[0_16px_40px_rgba(99,102,241,0.35)] transition-all duration-300 hover:scale-110 hover:shadow-[0_20px_44px_rgba(99,102,241,0.42)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#a855f7]"
    >
      {open ? <X className="h-6 w-6 transition-transform group-hover:rotate-90" /> : <MessageSquare className="h-6 w-6" />}
    </button>
  )
}

function useChatWidgetState(defaultOpen: boolean) {
  const free = useFreeChatState()
  const idea = useIdeaChatState()
  const [open, setOpen] = useState(defaultOpen)
  const [activeTab, setActiveTab] = useState<TabKey>("free")
  const [selectedIdeaId, setSelectedIdeaId] = useState<string | null>(null)

  const selectedIdea = useMemo(
    () => idea.ideasList.find((entry) => entry.ideaId === selectedIdeaId) ?? null,
    [idea.ideasList, selectedIdeaId]
  )

  const handleIdeaSelect = useCallback(
    (ideaSummary: ChatIdeaSummary) => {
      if (!ideaSummary.ideaId) return
      const id = String(ideaSummary.ideaId)
      setSelectedIdeaId(id)
      idea.loadIdeaChat(Number(ideaSummary.ideaId))
    },
    [idea]
  )

  const handleTabChange = useCallback(
    (tab: TabKey) => {
      setActiveTab(tab)
      free.clearError()
      idea.clearError()
    },
    [free, idea]
  )

  useEffect(() => {
    if (open && activeTab === "ideas") {
      idea.loadIdeas()
    }
  }, [open, activeTab, idea])

  useEffect(() => {
    if (open && activeTab === "free" && !free.session) {
      free.loadChat()
    }
  }, [open, activeTab, free])

  useEffect(() => {
    if (open && activeTab === "ideas" && selectedIdeaId && !idea.session) {
      idea.loadIdeaChat(Number(selectedIdeaId))
    }
  }, [open, activeTab, selectedIdeaId, idea])

  return {
    activeTab,
    freeMessages: free.messages,
    freeError: free.error,
    freeTokensRemaining: free.tokensRemaining,
    hasMoreFreeMessages: free.hasMoreMessages,
    handleFreeSend: free.handleSend,
    handleIdeaSend: idea.handleSend,
    handleIdeaSelect,
    handleTabChange,
    ideaError: idea.error,
    ideaMessages: idea.messages,
    ideaTokensRemaining: idea.tokensRemaining,
    ideasList: idea.ideasList,
    isLoadingFree: free.isLoading,
    isLoadingIdeas: idea.isLoadingIdeas,
    isLoadingIdea: idea.isLoading,
    isLoadingOlderFree: free.isLoadingOlder,
    isLoadingOlderIdea: idea.isLoadingOlder,
    isLoadingIdeasSidebar: idea.isLoadingIdeas,
    isSendingFree: free.isSending,
    isSendingIdea: idea.isSending,
    loadIdeas: idea.loadIdeas,
    loadOlderFreeMessages: free.loadOlderMessages,
    loadOlderIdeaMessages: idea.loadOlderMessages,
    open,
    selectedIdea,
    selectedIdeaId,
    setOpen,
    hasMoreIdeaMessages: idea.hasMoreMessages,
  }
}

function useFreeChatState() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokensRemaining, setTokensRemaining] = useState<number | null>(null)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const loadChat = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await chatService.startChat()
      setSession(response)
      setMessages(response.messages || [])
      setTokensRemaining(response.tokensRemaining)
      setHasMoreMessages(response.hasMoreMessages ?? false)
    } catch (err) {
      console.error("Erro ao carregar chat livre:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar chat")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadOlderMessages = useCallback(async () => {
    if (!session || isLoadingOlder || !hasMoreMessages) return

    const oldestMessage = messages[0]
    if (!oldestMessage?.createdAt) {
      setHasMoreMessages(false)
      return
    }

    setIsLoadingOlder(true)
    try {
      const result = await chatService.getOlderMessages(
        session.sessionId,
        typeof oldestMessage.createdAt === "string"
          ? oldestMessage.createdAt
          : new Date(oldestMessage.createdAt).toISOString(),
        20
      )

      if (result.messages.length === 0) {
        setHasMoreMessages(false)
      } else {
        setMessages((prev) => [...result.messages, ...prev])
        setHasMoreMessages(result.hasMore)
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens antigas:", err)
      setHasMoreMessages(false)
    } finally {
      setIsLoadingOlder(false)
    }
  }, [session, messages, hasMoreMessages, isLoadingOlder])

  const handleSend = useCallback(
    async (message: string) => {
      if (!session) return

      const userMessage: ChatMessage = {
        id: `user-${Date.now()}`,
        role: "user",
        content: message,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)
      setError(null)

      try {
        const response = await chatService.sendMessage(session.sessionId, message)
        setMessages((prev) => [...prev, response])

        if (response.tokensRemaining != null) {
          setTokensRemaining(response.tokensRemaining)
        }
      } catch (err) {
        console.error("Erro ao enviar mensagem:", err)
        setError(err instanceof Error ? err.message : "Erro ao enviar mensagem")
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      } finally {
        setIsSending(false)
      }
    },
    [session]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    session,
    messages,
    isLoading,
    isSending,
    error,
    tokensRemaining,
    isLoadingOlder,
    hasMoreMessages,
    loadChat,
    loadOlderMessages,
    handleSend,
    clearError,
  }
}

function useIdeaChatState() {
  const [session, setSession] = useState<ChatSession | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [tokensRemaining, setTokensRemaining] = useState<number | null>(null)
  const [ideasList, setIdeasList] = useState<ChatIdeaSummary[]>([])
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false)
  const [isLoadingOlder, setIsLoadingOlder] = useState(false)
  const [hasMoreMessages, setHasMoreMessages] = useState(true)

  const loadIdeas = useCallback(async () => {
    setIsLoadingIdeas(true)
    setIdeasError(null)
    try {
      const ideas = await chatService.getIdeasSummary()
      setIdeasList(ideas)
    } catch (err) {
      console.error("Erro ao carregar ideias:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar ideias")
    } finally {
      setIsLoadingIdeas(false)
    }
  }, [])

  const loadIdeaChat = useCallback(async (ideaId: number) => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await chatService.startChat(ideaId)
      setSession(response)
      setMessages(response.messages || [])
      setTokensRemaining(response.tokensRemaining)
      setHasMoreMessages(response.hasMoreMessages ?? false)
    } catch (err) {
      console.error("Erro ao carregar chat de ideia:", err)
      setError(err instanceof Error ? err.message : "Erro ao carregar chat")
    } finally {
      setIsLoading(false)
    }
  }, [])

  const loadOlderMessages = useCallback(async () => {
    if (!session || isLoadingOlder || !hasMoreMessages) return

    const oldestMessage = messages[0]
    if (!oldestMessage?.createdAt) {
      setHasMoreMessages(false)
      return
    }

    setIsLoadingOlder(true)
    try {
      const result = await chatService.getOlderMessages(
        session.sessionId,
        typeof oldestMessage.createdAt === "string"
          ? oldestMessage.createdAt
          : new Date(oldestMessage.createdAt).toISOString(),
        20
      )

      if (result.messages.length === 0) {
        setHasMoreMessages(false)
      } else {
        setMessages((prev) => [...result.messages, ...prev])
        setHasMoreMessages(result.hasMore)
      }
    } catch (err) {
      console.error("Erro ao carregar mensagens antigas:", err)
      setHasMoreMessages(false)
    } finally {
      setIsLoadingOlder(false)
    }
  }, [session, messages, hasMoreMessages, isLoadingOlder])

  const handleSend = useCallback(
    async (message: string) => {
      if (!session) return

      const userMessage: ChatMessage = {
        id: `idea-user-${Date.now()}`,
        role: "user",
        content: message,
      }

      setMessages((prev) => [...prev, userMessage])
      setIsSending(true)
      setError(null)

      try {
        const response = await chatService.sendMessage(session.sessionId, message)
        setMessages((prev) => [...prev, response])

        if (response.tokensRemaining != null) {
          setTokensRemaining(response.tokensRemaining)
        }
      } catch (err) {
        console.error("Erro ao enviar mensagem:", err)
        setError(err instanceof Error ? err.message : "Erro ao enviar mensagem")
        setMessages((prev) => prev.filter((msg) => msg.id !== userMessage.id))
      } finally {
        setIsSending(false)
      }
    },
    [session]
  )

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    session,
    messages,
    isLoading,
    isSending,
    error,
    tokensRemaining,
    ideasList,
    isLoadingIdeas,
    isLoadingOlder,
    hasMoreMessages,
    loadIdeas,
    loadIdeaChat,
    loadOlderMessages,
    handleSend,
    clearError,
  }
}

type IdeasListProps = Readonly<{
  ideas: ChatIdeaSummary[]
  isLoading: boolean
  error: string | null
  selectedIdeaId: string | null
  onSelect: (idea: ChatIdeaSummary) => void
  onRetry: () => Promise<void>
}>

function IdeasList({ ideas, isLoading, error, selectedIdeaId, onSelect, onRetry }: IdeasListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center px-4 py-8">
        <p className="text-xs text-slate-500">Carregando ideias...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-4 py-4">
        <p className="text-xs text-rose-600">{error}</p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-2 text-xs text-slate-600 underline hover:text-slate-900"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  if (ideas.length === 0) {
    return <p className="px-4 py-4 text-xs text-slate-500">Gere uma ideia para vê-la por aqui.</p>
  }

  return (
    <>
      {ideas.map((idea) => (
        <button
          key={idea.ideaId}
          type="button"
          onClick={() => onSelect(idea)}
          className={`w-full px-4 py-3 text-left transition-all ${
            selectedIdeaId === idea.ideaId ? "bg-white border-l-4 border-l-[#6366f1]" : "hover:bg-white/60"
          }`}
        >
          <div className="flex items-start justify-between mb-1">
            <p className="text-sm font-semibold text-slate-800 line-clamp-1 flex-1">{idea.title || "Ideia"}</p>
          </div>
          <p className="text-xs text-slate-500 line-clamp-1 mb-1">{idea.summary || "Sem resumo"}</p>
          <div className="flex items-center gap-1 text-xs text-slate-400">
            <Clock className="h-3 w-3" />
            <span>Recente</span>
          </div>
        </button>
      ))}
    </>
  )
}

function formatTokensRemaining(tokens: number | null) {
  if (tokens === null) return null
  return tokens.toLocaleString("pt-BR")
}
