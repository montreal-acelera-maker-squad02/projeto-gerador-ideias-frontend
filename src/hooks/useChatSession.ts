import { useCallback, useRef, useState } from 'react'
import { apiFetch } from '@/lib/api'
import type { ChatMessage } from '@/types/chat'

type ChatType = 'FREE' | 'IDEA_BASED' | string

type SessionState = {
  sessionId: string
  chatType: ChatType
  ideaId?: string | null
  tokensUsed?: number | null
  tokensRemaining?: number | null
}

type SendMessageResult = {
  tokensUsed?: number | null
  tokensRemaining?: number | null
}

function normalizeMessage(payload: any): ChatMessage | null {
  if (!payload) return null

  const role = String(payload?.role ?? '').toLowerCase()
  if (role !== 'user' && role !== 'assistant') return null

  const randomId =
    typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Date.now().toString()
  const id = payload?.id ?? payload?.messageId ?? payload?.uuid ?? `${role}-${randomId}`
  const content = String(payload?.content ?? '').trim()

  if (!content) return null

  const createdAt = payload?.createdAt ?? payload?.created_at ?? payload?.timestamp ?? null

  return {
    id: String(id),
    role: role as ChatMessage['role'],
    content,
    createdAt,
  }
}

export function useChatSession() {
  const [session, setSession] = useState<SessionState | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [loading, setLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [starting, setStarting] = useState(false)
  const startingRef = useRef(false)
  const queuedPayloadRef = useRef<{ ideaId?: string | null } | null>(null)

  const resetSession = useCallback(() => {
    setSession(null)
    setMessages([])
    setError(null)
    setNotice(null)
    setLoading(false)
    setSending(false)
  }, [])

  const loadSession = useCallback(
    async (sessionId: string) => {
      setLoading(true)
      setError(null)

      try {
        const response = await apiFetch(`/api/chat/sessions/${sessionId}`)
        if (!response.ok) {
          throw new Error(`Erro ${response.status}`)
        }

        const payload = await response.json()
        const parsedMessages = Array.isArray(payload?.messages)
          ? payload.messages
              .map(normalizeMessage)
              .filter((item): item is ChatMessage => Boolean(item))
          : []

        setMessages(parsedMessages)
        setSession((prev) => ({
          sessionId,
          chatType: payload?.chatType ?? prev?.chatType ?? 'FREE',
          ideaId:
            payload?.ideaId != null
              ? String(payload.ideaId)
              : payload?.idea != null
              ? String(payload.idea)
              : prev?.ideaId ?? null,
          tokensUsed: payload?.tokensUsed ?? prev?.tokensUsed ?? null,
          tokensRemaining: payload?.tokensRemaining ?? prev?.tokensRemaining ?? null,
        }))
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível carregar a sessão do chat.'
        setError(message)
        throw err
      } finally {
        setLoading(false)
      }
    },
    []
  )

  const startSession = useCallback(
    async (payload: { ideaId?: string | null }) => {
      if (startingRef.current) {
        queuedPayloadRef.current = payload
        return
      }
      startingRef.current = true
      setStarting(true)
      setLoading(true)
      setError(null)
      setNotice(null)
      setMessages([])

      try {
        const response = await apiFetch('/api/chat/start', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload?.ideaId ? { ideaId: payload.ideaId } : {}),
        })

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`)
        }

        const json = await response.json()
        const sessionId = String(json?.sessionId ?? json?.id)
        const chatType: ChatType = json?.chatType ?? (payload?.ideaId ? 'IDEA_BASED' : 'FREE')

        setSession({
          sessionId,
          chatType,
          ideaId: payload?.ideaId != null ? String(payload.ideaId) : null,
          tokensUsed: json?.tokensUsed ?? null,
          tokensRemaining: json?.tokensRemaining ?? null,
        })

        await loadSession(sessionId)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível iniciar a conversa.'
        setError(message)
        setLoading(false)
        throw err
      } finally {
        startingRef.current = false
        setStarting(false)
        const next = queuedPayloadRef.current
        queuedPayloadRef.current = null
        if (next) {
          void startSession(next)
        }
      }
    },
    [loadSession]
  )

  const startFreeChat = useCallback(async () => {
    if (session?.chatType === 'FREE' && session.sessionId) {
      await loadSession(session.sessionId)
      return
    }
    await startSession({ ideaId: null })
  }, [session, startSession, loadSession])

  const startIdeaChat = useCallback(
    async (ideaId: string) => {
      if (!ideaId) return
      const normalizedId = String(ideaId)
      if (
        session?.chatType === 'IDEA_BASED' &&
        session?.ideaId === normalizedId &&
        session?.sessionId
      ) {
        await loadSession(session.sessionId)
        return
      }
      await startSession({ ideaId: normalizedId })
    },
    [session, startSession, loadSession]
  )

  const applyTokens = useCallback(
    (result?: SendMessageResult) => {
      if (!session) return
      setSession((prev) =>
        prev
          ? {
              ...prev,
              tokensRemaining: result?.tokensRemaining ?? prev.tokensRemaining ?? null,
              tokensUsed: result?.tokensUsed ?? prev.tokensUsed ?? null,
            }
          : prev
      )
    },
    [session]
  )

  const sendMessage = useCallback(
    async (message: string) => {
      if (!session?.sessionId || !message.trim()) return

      setSending(true)
      setError(null)
      setNotice(null)

       const optimistic: ChatMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        content: message.trim(),
      }
      setMessages((prev) => [...prev, optimistic])

      try {
        const response = await apiFetch(`/api/chat/sessions/${session.sessionId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ message }),
        })

        if (response.status === 400) {
          const payload = await response.json().catch(() => ({}))
          const warning =
            payload?.message ??
            payload?.error ??
            'Mensagem rejeitada. Verifique o conteúdo ou tente novamente mais tarde.'
          setNotice(warning)
          await loadSession(session.sessionId)
          return
        }

        if (!response.ok) {
          throw new Error(`Erro ${response.status}`)
        }

        const payload = await response.json().catch(() => null)
        applyTokens({
          tokensRemaining: payload?.tokensRemaining ?? payload?.tokens_left ?? null,
          tokensUsed: payload?.tokensUsed ?? payload?.tokens ?? null,
        })

        await loadSession(session.sessionId)
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Não foi possível enviar a mensagem.'
        setError(message)
        setMessages((prev) => prev.filter((item) => item.id !== optimistic.id))
        throw err
      } finally {
        setSending(false)
      }
    },
    [session, loadSession, applyTokens]
  )

  return {
    sessionId: session?.sessionId ?? null,
    chatType: session?.chatType ?? null,
    ideaId: session?.ideaId ?? null,
    tokensRemaining: session?.tokensRemaining ?? null,
    tokensUsed: session?.tokensUsed ?? null,
    messages,
    isLoading: loading,
    isStarting: starting,
    isSending: sending,
    error,
    notice,
    startFreeChat,
    startIdeaChat,
    sendMessage,
    resetSession,
    reloadSession: loadSession,
  }
}
