import { useEffect, useRef, useState } from 'react'
import Icon from './Icons'
import { chatQuestions } from '../data/chat'
import { useReducedMotion } from '../lib/hooks'
import { useI18n } from '../i18n'

const TYPING_MS = 700

// A small assistant with ready-written answers about Georgio (see src/data/chat.js). Not AI.
export default function Chat() {
  const { t, pick } = useI18n()
  const reduced = useReducedMotion()
  const [open, setOpen] = useState(false)
  // Stored as ids, not text, so the conversation follows a language switch
  const [messages, setMessages] = useState([{ from: 'bot', id: 'greeting' }])
  const [typing, setTyping] = useState(false)
  const toggleRef = useRef(null)
  const panelRef = useRef(null)
  const logRef = useRef(null)
  const timer = useRef(0)

  const asked = messages.filter((m) => m.from === 'user').map((m) => m.id)
  const remaining = chatQuestions.filter((q) => !asked.includes(q.id))

  useEffect(() => () => clearTimeout(timer.current), [])

  useEffect(() => {
    const log = logRef.current
    log.scrollTo({ top: log.scrollHeight, behavior: reduced ? 'auto' : 'smooth' })
  }, [messages, typing, reduced])

  const close = (returnFocus = true) => {
    setOpen(false)
    if (returnFocus) toggleRef.current.focus({ preventScroll: true })
  }

  const toggle = () => {
    if (open) return close()
    setOpen(true)
  }

  // Focus moves into the panel once it is visible
  useEffect(() => {
    if (open) panelRef.current.focus({ preventScroll: true })
  }, [open])

  const ask = (id) => {
    if (typing) return
    setMessages((m) => [...m, { from: 'user', id }])
    setTyping(true)
    timer.current = setTimeout(
      () => {
        setMessages((m) => [...m, { from: 'bot', id }])
        setTyping(false)
      },
      reduced ? 0 : TYPING_MS,
    )
  }

  const restart = () => setMessages([{ from: 'bot', id: 'greeting' }])

  const bubble = (m, i) => {
    const question = chatQuestions.find((q) => q.id === m.id)
    if (m.from === 'user') {
      return (
        <li key={i} className="flex justify-end">
          <p className="max-w-[85%] rounded-2xl rounded-ee-sm bg-fg px-4 py-2.5 text-sm leading-relaxed text-ink">
            <span className="sr-only">{t.chat.you}: </span>
            {pick(question.q)}
          </p>
        </li>
      )
    }
    return (
      <li key={i} className="flex">
        <div className="max-w-[90%] rounded-2xl rounded-es-sm border border-line bg-surface px-4 py-2.5 text-sm leading-relaxed text-fg">
          <span className="sr-only">{t.chat.bot}: </span>
          {question ? pick(question.a) : t.chat.greeting}
          {question?.action && (
            <a
              href={question.action.href}
              onClick={() => question.action.href.startsWith('#') && close(false)}
              className="mt-3 flex w-fit items-center gap-1.5 rounded-full border border-line px-3.5 py-1.5 text-xs font-medium text-fg transition-colors duration-200 hover:border-accent hover:text-accent"
            >
              {pick(question.action.label)}
              <span aria-hidden="true" className="rtl:-scale-x-100">
                →
              </span>
            </a>
          )}
        </div>
      </li>
    )
  }

  return (
    <div className="fixed bottom-4 end-4 z-40 sm:bottom-6 sm:end-6">
      <div
        ref={panelRef}
        role="dialog"
        aria-label={t.chat.title}
        tabIndex={-1}
        inert={!open}
        onKeyDown={(e) => e.key === 'Escape' && close()}
        className={`absolute bottom-16 end-0 flex max-h-[min(34rem,calc(100svh-7rem))] w-[calc(100vw-2rem)] max-w-sm origin-bottom-right flex-col overflow-hidden rounded-[10px] border border-line bg-ink shadow-[0_30px_60px_-30px_rgb(0_0_0/0.45)] outline-none transition-[opacity,transform] duration-300 ease-out rtl:origin-bottom-left sm:w-96 ${
          open ? 'translate-y-0 scale-100 opacity-100' : 'pointer-events-none translate-y-3 scale-95 opacity-0'
        }`}
      >
        <header className="flex items-center justify-between border-b border-line px-4 py-3">
          <div>
            <h2 className="font-display text-xl leading-tight text-fg">{t.chat.title}</h2>
            <p className="text-xs text-muted">{t.chat.subtitle}</p>
          </div>
          <button
            type="button"
            onClick={() => close()}
            aria-label={t.chat.close}
            className="flex size-9 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-fg/5 hover:text-fg"
          >
            <Icon name="close" className="size-[18px]" />
          </button>
        </header>

        <ol ref={logRef} role="log" aria-live="polite" aria-label={t.chat.log} className="flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4">
          {messages.map(bubble)}
          {typing && (
            <li className="flex">
              <p className="flex items-center gap-1 rounded-2xl rounded-es-sm border border-line bg-surface px-4 py-3.5">
                <span className="sr-only">{t.chat.typing}</span>
                {[0, 1, 2].map((dot) => (
                  <span
                    key={dot}
                    aria-hidden="true"
                    style={{ animationDelay: `${dot * 150}ms` }}
                    className="size-1.5 animate-pulse rounded-full bg-muted"
                  />
                ))}
              </p>
            </li>
          )}
        </ol>

        <div className="border-t border-line px-4 py-3">
          <p className="mb-2 text-xs text-muted">{t.chat.suggested}</p>
          <ul className="flex flex-wrap gap-2">
            {remaining.map((q) => (
              <li key={q.id}>
                <button
                  type="button"
                  disabled={typing}
                  onClick={() => ask(q.id)}
                  className="rounded-full border border-line px-3.5 py-1.5 text-sm text-fg transition-colors duration-200 hover:border-fg/40 disabled:opacity-50"
                >
                  {pick(q.q)}
                </button>
              </li>
            ))}
            {remaining.length === 0 && (
              <li>
                <button
                  type="button"
                  onClick={restart}
                  className="rounded-full border border-line px-3.5 py-1.5 text-sm text-fg transition-colors duration-200 hover:border-fg/40"
                >
                  {t.chat.again}
                </button>
              </li>
            )}
            <li>
              <a
                href="#contact"
                onClick={() => close(false)}
                className="inline-block rounded-full px-3.5 py-1.5 text-sm text-accent underline decoration-accent/40 underline-offset-4 transition-colors duration-200 hover:decoration-accent"
              >
                {t.chat.else}
              </a>
            </li>
          </ul>
        </div>
      </div>

      <button
        ref={toggleRef}
        type="button"
        onClick={toggle}
        aria-expanded={open}
        aria-label={open ? t.chat.close : t.chat.open}
        className="flex size-13 items-center justify-center rounded-full bg-fg text-ink shadow-[0_10px_30px_-10px_rgb(0_0_0/0.5)] transition-colors duration-200 hover:bg-accent hover:text-on-accent"
      >
        <Icon name={open ? 'close' : 'chat'} className="size-6" />
      </button>
    </div>
  )
}
