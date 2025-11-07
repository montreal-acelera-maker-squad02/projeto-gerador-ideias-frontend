import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { useChatSummaries } from '@/hooks/useChatSummaries'
import { useChatSession } from '@/hooks/useChatSession'
import type { ChatIdeaSummary, ChatMessage } from '@/types/chat'
import { getAuthToken } from '@/lib/api'

export type ChatContextValue = {
  summaries: ChatIdeaSummary[]
  summariesLoading: boolean
  summariesError: string | null
  refreshSummaries: () => Promise<void>
  ensureSummaries: () => Promise<void>

  sessionId: string | null
  chatType: string | null
  ideaId: string | null
  tokensUsed: number | null
  tokensRemaining: number | null
  messages: ChatMessage[]
  isLoading: boolean
  isStarting: boolean
  isSending: boolean
  sessionError: string | null
  notice: string | null

  startFreeChat: () => Promise<void>
  startIdeaChat: (ideaId: string) => Promise<void>
  sendMessage: (message: string) => Promise<void>
  resetSession: () => void
  preload: () => Promise<void>
  preloading: boolean
}

export const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [summariesEnabled, setSummariesEnabled] = useState(false)
  const [preloading, setPreloading] = useState(false)

  const {
    summaries,
    loading: summariesLoading,
    error: summariesError,
    refresh: refreshSummaries,
  } = useChatSummaries(summariesEnabled)

  const {
    sessionId,
    chatType,
    ideaId,
    tokensRemaining,
    tokensUsed,
    messages,
    isLoading,
    isStarting,
    isSending,
    error: sessionError,
    notice,
    startFreeChat,
    startIdeaChat,
    sendMessage,
    resetSession,
  } = useChatSession()

  const ensureSummaries = useCallback(async () => {
    if (!summariesEnabled) {
      setSummariesEnabled(true)
      await refreshSummaries()
      return
    }
    if (summaries.length === 0 && !summariesLoading) {
      await refreshSummaries()
    }
  }, [summariesEnabled, refreshSummaries, summaries, summariesLoading])

  const preload = useCallback(async () => {
    if (preloading) return
    setPreloading(true)
    try {
      setSummariesEnabled(true)
      await Promise.all([
        refreshSummaries().catch(() => {}),
        sessionId ? Promise.resolve() : startFreeChat().catch(() => {}),
      ])
    } finally {
      setPreloading(false)
    }
  }, [preloading, refreshSummaries, sessionId, startFreeChat])

  useEffect(() => {
    if (getAuthToken()) {
      void preload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const value = useMemo<ChatContextValue>(
    () => ({
      summaries,
      summariesLoading,
      summariesError,
      refreshSummaries,
      ensureSummaries,
      sessionId,
      chatType,
      ideaId,
      tokensRemaining,
      tokensUsed,
      messages,
      isLoading,
      isStarting,
      isSending,
      sessionError,
      notice,
      startFreeChat,
      startIdeaChat,
      sendMessage,
      resetSession,
      preload,
      preloading,
    }),
    [
      summaries,
      summariesLoading,
      summariesError,
      refreshSummaries,
      ensureSummaries,
      sessionId,
      chatType,
      ideaId,
      tokensRemaining,
      tokensUsed,
      messages,
      isLoading,
      isStarting,
      isSending,
      sessionError,
      notice,
      startFreeChat,
      startIdeaChat,
      sendMessage,
      resetSession,
      preload,
      preloading,
    ]
  )

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const ctx = useContext(ChatContext)
  if (!ctx) {
    throw new Error('useChatContext deve ser usado dentro de ChatProvider')
  }
  return ctx
}
