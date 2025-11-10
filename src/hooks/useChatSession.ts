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

  const fallbackId =
    typeof globalThis !== 'undefined' && globalThis.crypto?.randomUUID
      ? globalThis.crypto.randomUUID()
      : Date.now().toString()

  const id = payload?.id ?? payload?.messageId ?? payload?.uuid ?? `${role}-${fallbackId}`
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

function extractMessagesFromPayload(payload: any): ChatMessage[] {
  if (!payload) return []

  const collected: ChatMessage[] = []
  const seenIds = new Set<string>()

  const pushMessage = (candidate: ChatMessage | null) => {
    if (!candidate) return
    if (seenIds.has(candidate.id)) return
    seenIds.add(candidate.id)
    collected.push(candidate)
  }

  pushMessage(normalizeMessage(payload))

  if (Array.isArray(payload?.messages)) {
    for (const item of payload.messages) {
      pushMessage(normalizeMessage(item))
    }
  }

  if (payload?.message && typeof payload.message === 'object') {
    pushMessage(normalizeMessage(payload.message))
  } else if (typeof payload?.message === 'string') {
    const trimmed = payload.message.trim()
    if (trimmed) {
      pushMessage({
        id: `assistant-message-${Date.now()}-${collected.length}`,
        role: 'assistant',
        content: trimmed,
      })
    }
  }

  const stringFields: Array<'reply' | 'response'> = ['reply', 'response']
  for (const field of stringFields) {
    const value = payload?.[field]
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) {
        pushMessage({
          id: `assistant-${field}-${Date.now()}-${collected.length}`,
          role: 'assistant',
          content: trimmed,
        })
      }
    }
  }

  return collected
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
  const loadingSessionRef = useRef<string | null>(null)

  const resetSession = useCallback(() => {
    setSession(null)
    setMessages([])
    setError(null)
    setNotice(null)
    setLoading(false)
    setSending(false)
    startingRef.current = false
    queuedPayloadRef.current = null
    loadingSessionRef.current = null
    setStarting(false)
  }, [])

  const loadSession = useCallback(
    async (sessionId: string) => {
      if (loadingSessionRef.current === sessionId) return
      loadingSessionRef.current = sessionId
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
          err instanceof Error ? err.message : 'Nao foi possivel carregar a sessao do chat.'
        setError(message)
        throw err
      } finally {
        setLoading(false)
        loadingSessionRef.current = null
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
          headers: { 'Content-Type': 'application/json' },
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
          err instanceof Error ? err.message : 'Nao foi possivel iniciar a conversa.'
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
    if (startingRef.current || loading) return
    if (session?.chatType === 'FREE' && session.sessionId) {
      await loadSession(session.sessionId)
      return
    }
    await startSession({ ideaId: null })
  }, [session, startSession, loadSession, loading])

  const startIdeaChat = useCallback(
    async (ideaId: string) => {
      if (!ideaId || startingRef.current) return
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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message }),
        })

        if (response.status === 400) {
          const payload = await response.json().catch(() => ({}))
          const warning =
            payload?.message ??
            payload?.error ??
            'Mensagem rejeitada. Verifique o conteudo ou tente novamente mais tarde.'
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

        const responseMessages = extractMessagesFromPayload(payload)
        const hasConversationSnapshot = Array.isArray(payload?.messages)

        if (responseMessages.length > 0) {
          setMessages((prev) => {
            if (hasConversationSnapshot) {
              return responseMessages
            }
            const existingIds = new Set(prev.map((item) => item.id))
            const fresh = responseMessages.filter((item) => !existingIds.has(item.id))
            if (fresh.length === 0) {
              return prev
            }
            return [...prev, ...fresh]
          })
        } else {
          await loadSession(session.sessionId)
        }
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Nao foi possivel enviar a mensagem.'
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
