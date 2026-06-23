import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { MessageCircle, X, Send, Bot, Loader2 } from 'lucide-react'
import { sendChat } from '../../services/api'
import './ChatWidget.css'

const WELCOME = {
  role: 'assistant',
  content:
    '안녕하세요! wjeon Dashboard 도우미입니다. 뉴스, 포트폴리오, SMK Agent, 챗봇 사용법 등 무엇이든 물어보세요.',
}

const SUGGESTIONS = [
  '이 대시보드는 뭘 할 수 있어?',
  '뉴스는 어디서 가져와?',
  '포트폴리오에 어떤 프로젝트가 있어?',
]

export default function ChatWidget() {
  const { pathname } = useLocation()
  const isSmkRoute = pathname.startsWith('/smk')
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bodyRef = useRef(null)

  useEffect(() => {
    const el = bodyRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages, loading, open])

  const submit = async (text) => {
    const message = (text ?? input).trim()
    if (!message || loading) return

    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .filter((m) => m !== WELCOME)
      .map(({ role, content }) => ({ role, content }))

    setMessages((prev) => [...prev, { role: 'user', content: message }])
    setInput('')
    setLoading(true)

    try {
      const res = await sendChat(message, history)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: res.reply,
          sources: res.sources ?? [],
          error: false,
        },
      ])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            err.message ||
            '챗봇 요청에 실패했습니다. 백엔드 실행 및 OPENAI_API_KEY를 확인해 주세요.',
          sources: [],
          error: true,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  const onSubmit = (e) => {
    e.preventDefault()
    submit()
  }

  return createPortal(
    <>
      <button
        className={`chat-fab ${open ? 'is-hidden' : ''} ${isSmkRoute ? 'chat-fab--smk' : ''}`}
        onClick={() => setOpen(true)}
        aria-label="챗봇 열기"
      >
        <MessageCircle size={24} />
      </button>

      <div
        className={`chat-panel ${open ? 'is-open' : ''} ${isSmkRoute ? 'chat-panel--smk' : ''}`}
        role="dialog"
        aria-label="RAG 챗봇"
      >
        <div className="chat-panel__header">
          <div className="chat-panel__brand">
            <span className="chat-panel__avatar">
              <Bot size={18} />
            </span>
            <div>
              <strong>wjeon AI</strong>
              <span className="chat-panel__status">LangChain + OpenAI</span>
            </div>
          </div>
          <button
            className="chat-panel__close"
            onClick={() => setOpen(false)}
            aria-label="닫기"
          >
            <X size={18} />
          </button>
        </div>

        <div className="chat-panel__body" ref={bodyRef}>
          <img
            src="/wj_logo.svg"
            alt=""
            className="chat-panel__watermark"
            aria-hidden="true"
          />
          {messages.map((m, i) => (
            <div
              key={i}
              className={`chat-msg chat-msg--${m.role} ${m.error ? 'chat-msg--error' : ''}`}
            >
              <div className="chat-msg__bubble">{m.content}</div>
              {m.sources?.length > 0 && (
                <div className="chat-msg__sources">
                  {m.sources.map((s, j) => (
                    <span key={j} className="chat-msg__source" title={s.snippet}>
                      {s.title}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="chat-msg chat-msg--assistant">
              <div className="chat-msg__bubble chat-msg__bubble--loading">
                <Loader2 size={16} className="chat-spin" /> 답변 생성 중...
              </div>
            </div>
          )}
        </div>

        {messages.length <= 1 && !loading && (
          <div className="chat-panel__suggestions">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => submit(s)} className="chat-chip">
                {s}
              </button>
            ))}
          </div>
        )}

        <form className="chat-panel__input" onSubmit={onSubmit}>
          <input
            type="text"
            value={input}
            placeholder="메시지를 입력하세요..."
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            aria-label="메시지 입력"
          />
          <button type="submit" disabled={loading || !input.trim()} aria-label="전송">
            <Send size={18} />
          </button>
        </form>
      </div>
    </>,
    document.body,
  )
}
