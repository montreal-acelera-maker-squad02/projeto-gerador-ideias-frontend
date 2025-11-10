import { useEffect, useRef, useState } from 'react'
import { Bot, Loader2, Send, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { ChatMessage } from '@/types/chat'

type ChatProps = {
  messages: ChatMessage[]
  disabled?: boolean
  isLoading?: boolean
  isSending?: boolean
  showTyping?: boolean
  notice?: string | null
  error?: string | null
  onSend: (message: string) => Promise<void> | void
  placeholder: string
}

export function Chat({
  messages,
  disabled = false,
  isLoading = false,
  isSending = false,
  showTyping = false,
  notice,
  error,
  onSend,
  placeholder,
}: ChatProps) {
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isSending, showTyping])

  const handleSubmit = async () => {
    const content = input.trim()
    if (!content || disabled) return
    setInput('')
    await onSend(content)
  }

  return (
    <div className="flex h-full flex-col bg-white">
      <div className="flex-1 overflow-y-auto bg-white px-6 py-6">
        {isLoading && messages.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Carregando conversa...
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {showTyping ? <TypingBubble /> : null}
            <div ref={bottomRef} />
          </div>
        )}
      </div>

      <div className="border-t border-[#eceafd] bg-white px-6 py-4">
        {notice ? (
          <p className="mb-2 text-xs font-medium text-amber-600">{notice}</p>
        ) : null}
        {error ? (
          <p className="mb-2 text-xs font-medium text-rose-600">{error}</p>
        ) : null}
        <div className="flex items-end gap-3">
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={async (event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault()
                await handleSubmit()
              }
            }}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="min-h-[48px] max-h-32 flex-1 resize-none rounded-xl border border-[#dfe3ff] bg-slate-50 px-3 py-2 text-sm text-slate-700 shadow-sm transition focus:border-[#a78bfa] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#c4b5fd]/60 disabled:cursor-not-allowed disabled:opacity-70"
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={disabled || isLoading || isSending || input.trim().length === 0}
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#a855f7] to-[#6366f1] text-white shadow-lg transition hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Enviar mensagem"
          >
            {isSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </div>
  )
}

type MessageBubbleProps = { message: ChatMessage }

function MessageBubble({ message }: MessageBubbleProps) {
  const isUser = message.role === 'user'

  return (
    <div className={cn('flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e6ff] bg-[#eef1ff] text-[#4c51bf]',
          isUser && 'border-transparent bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-md'
        )}
      >
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm',
          isUser
            ? 'bg-gradient-to-br from-[#6366f1] to-[#8b5cf6] text-white shadow-lg'
            : 'bg-[#eef4ff] text-slate-900'
        )}
      >
        <p className="whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  )
}

function TypingBubble() {
  ensureTypingStyle()
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e2e6ff] bg-[#eef1ff] text-[#4c51bf]">
        <Bot className="h-4 w-4" />
      </div>
      <div className="flex max-w-[70%] items-center gap-1 rounded-2xl bg-[#eef4ff] px-4 py-3 shadow-sm">
        {[0, 1, 2].map((index) => (
          <span
            key={index}
            className="h-2 w-2 rounded-full bg-slate-400/80"
            style={{
              animation: 'chat-typing 1.1s infinite ease-in-out',
              animationDelay: `${index * 0.18}s`,
            }}
          />
        ))}
      </div>
    </div>
  )
}

const TYPING_STYLE_ID = 'chat-typing-style'

function ensureTypingStyle() {
  if (typeof document === 'undefined') return
  if (document.getElementById(TYPING_STYLE_ID)) return
  const style = document.createElement('style')
  style.id = TYPING_STYLE_ID
  style.textContent = `
@keyframes chat-typing {
  0%, 80%, 100% { opacity: 0.25; transform: translateY(0); }
  40% { opacity: 1; transform: translateY(-2px); }
}`
  document.head.appendChild(style)
}
