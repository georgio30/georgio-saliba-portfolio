import { useEffect, useReducer, useState } from 'react'
import Reveal from './Reveal'
import Section from './Section'
import { useI18n } from '../i18n'

// Eight pairs, named after the tools this site and its projects are built with
const TECH = ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'JWT', 'Tailwind', 'Vite']
const MISMATCH_MS = 800

function shuffled() {
  const deck = [...TECH, ...TECH]
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

const clock = (seconds) => `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

function loadBest() {
  try {
    const best = Number(localStorage.getItem('memory-best'))
    return best > 0 ? best : null
  } catch {
    return null
  }
}

const fresh = () => ({ deck: shuffled(), faceUp: [], matched: [], moves: 0, started: false, last: null })

// All the rules in one place, so two quick taps can never act on stale state
function reducer(state, action) {
  const { deck, faceUp, matched } = state
  switch (action.type) {
    case 'flip': {
      const i = action.index
      if (faceUp.length === 2 || matched.length === TECH.length || faceUp.includes(i) || matched.includes(deck[i])) return state
      if (faceUp.length === 0) return { ...state, faceUp: [i], started: true, last: null }

      const first = faceUp[0]
      const moves = state.moves + 1
      if (deck[first] !== deck[i]) {
        return { ...state, faceUp: [first, i], moves, last: { type: 'noMatch', a: deck[first], b: deck[i] } }
      }
      const nextMatched = [...matched, deck[i]]
      const type = nextMatched.length === TECH.length ? 'won' : 'match'
      return { ...state, faceUp: [], matched: nextMatched, moves, last: { type, tech: deck[i] } }
    }
    case 'hide':
      return { ...state, faceUp: [] }
    case 'restart':
      return fresh()
    default:
      return state
  }
}

export default function Play() {
  const { t } = useI18n()
  const [state, dispatch] = useReducer(reducer, undefined, fresh)
  const [seconds, setSeconds] = useState(0)
  const [saved, setSaved] = useState(loadBest)
  const { deck, faceUp, matched, moves, started, last } = state
  const won = matched.length === TECH.length
  // The best score includes the game just won, before it is saved
  const best = won && (!saved || moves < saved) ? moves : saved

  // Two cards that don't match are turned back after a moment
  useEffect(() => {
    if (faceUp.length !== 2) return
    const timer = setTimeout(() => dispatch({ type: 'hide' }), MISMATCH_MS)
    return () => clearTimeout(timer)
  }, [faceUp])

  useEffect(() => {
    if (!started || won) return
    const timer = setInterval(() => setSeconds((n) => n + 1), 1000)
    return () => clearInterval(timer)
  }, [started, won])

  useEffect(() => {
    if (!won) return
    try {
      localStorage.setItem('memory-best', String(best))
    } catch {
      // Storage unavailable — the best score just isn't remembered
    }
  }, [won, best])

  const restart = () => {
    setSaved(best)
    dispatch({ type: 'restart' })
    setSeconds(0)
  }

  const message =
    last?.type === 'won'
      ? t.play.won(moves)
      : last?.type === 'match'
        ? t.play.match(last.tech)
        : last?.type === 'noMatch'
          ? t.play.noMatch(last.a, last.b)
          : ''

  return (
    <Section id="play" label={t.play.label} title={t.play.title}>
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <Reveal>
          <ul className="mx-auto grid max-w-md grid-cols-4 gap-2 sm:gap-3 lg:mx-0" aria-label={t.play.board}>
            {deck.map((tech, i) => {
              const done = matched.includes(tech)
              const up = done || faceUp.includes(i)
              return (
                <li key={i} className="aspect-square [perspective:600px]">
                  <button
                    type="button"
                    onClick={() => dispatch({ type: 'flip', index: i })}
                    aria-disabled={done || undefined}
                    aria-label={done ? t.play.cardMatched(tech) : up ? tech : t.play.cardHidden(i + 1)}
                    className={`relative size-full transition-transform duration-500 [transform-style:preserve-3d] ${up ? '[transform:rotateY(180deg)]' : ''}`}
                  >
                    <span
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center rounded-lg border border-line bg-surface font-display text-2xl text-accent-soft transition-colors duration-200 [backface-visibility:hidden] hover:border-fg/30"
                    >
                      ?
                    </span>
                    <span
                      aria-hidden="true"
                      dir="ltr"
                      className={`absolute inset-0 flex items-center justify-center rounded-lg border px-1 text-center text-[11px] font-medium leading-tight transition-colors duration-300 [backface-visibility:hidden] [transform:rotateY(180deg)] sm:text-sm ${
                        done ? 'border-accent bg-accent/10 text-fg' : 'border-fg/30 bg-surface text-fg'
                      }`}
                    >
                      {tech}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal delay={100} className="lg:pt-2">
          <p className="max-w-sm leading-relaxed text-muted">{t.play.intro}</p>

          <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-5">
            {[
              [t.play.moves, moves],
              [t.play.time, clock(seconds)],
              [t.play.best, best ?? '–'],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="mt-1 font-display text-3xl tabular-nums text-fg">{value}</dd>
              </div>
            ))}
          </dl>

          <p role="status" className="mt-5 min-h-12 leading-relaxed text-fg">
            {message}
          </p>

          <button
            type="button"
            onClick={restart}
            className="mt-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30 hover:bg-fg/5"
          >
            {won ? t.play.again : t.play.restart}
          </button>
        </Reveal>
      </div>
    </Section>
  )
}
