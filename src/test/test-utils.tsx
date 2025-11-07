import type { ReactElement } from 'react'
import { render } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { ChatContext, type ChatContextValue } from '@/context/ChatContext'

export function createChatContextValue(overrides: Partial<ChatContextValue> = {}): ChatContextValue {
  return {
    summaries: [],
    summariesLoading: false,
    summariesError: null,
    refreshSummaries: vi.fn().mockResolvedValue(undefined),
    ensureSummaries: vi.fn().mockResolvedValue(undefined),
    sessionId: 'session-test',
    chatType: 'FREE',
    ideaId: null,
    tokensRemaining: 10,
    tokensUsed: null,
    messages: [],
    isLoading: false,
    isStarting: false,
    isSending: false,
    sessionError: null,
    notice: null,
    startFreeChat: vi.fn().mockResolvedValue(undefined),
    startIdeaChat: vi.fn().mockResolvedValue(undefined),
    sendMessage: vi.fn().mockResolvedValue(undefined),
    resetSession: vi.fn(),
    preload: vi.fn().mockResolvedValue(undefined),
    preloading: false,
    ...overrides,
  }
}

type RenderOptions = {
  route?: string
  chatContext?: ChatContextValue
}

export function renderWithProviders(ui: ReactElement, options?: RenderOptions) {
  const { route = '/', chatContext = createChatContextValue() } = options ?? {}
  return render(
    <ChatContext.Provider value={chatContext}>
      <MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>
    </ChatContext.Provider>
  )
}

