import { useId, useRef, useState } from 'react'
import Minesweeper from './Minesweeper'
import Section from './Section'
import Snake from './Snake'
import { useI18n } from '../i18n'

// Only the chosen game is mounted, so switching away stops the other one
const GAMES = { snake: Snake, mines: Minesweeper }
const IDS = Object.keys(GAMES)

function loadGame() {
  try {
    const saved = localStorage.getItem('play-game')
    return IDS.includes(saved) ? saved : IDS[0]
  } catch {
    return IDS[0]
  }
}

export default function Play() {
  const { t, dir } = useI18n()
  const uid = useId()
  const [current, setCurrent] = useState(loadGame)
  const tabRefs = useRef({})
  const Game = GAMES[current]

  const choose = (id) => {
    setCurrent(id)
    try {
      localStorage.setItem('play-game', id)
    } catch {
      // Storage unavailable — the choice just isn't remembered
    }
  }

  // Arrow keys move between tabs in reading order, so ← is "next" in Arabic
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    const jump = { Home: 0, End: IDS.length - 1 }[e.key]
    if (!step && jump === undefined) return
    e.preventDefault()
    const i = IDS.indexOf(current)
    const next = IDS[jump ?? (i + step * (dir === 'rtl' ? -1 : 1) + IDS.length) % IDS.length]
    choose(next)
    tabRefs.current[next]?.focus()
  }

  return (
    <Section id="play" label={t.play.label} title={t.play.title}>
      <div role="tablist" aria-label={t.play.tabs.label} onKeyDown={onKeyDown} className="mb-10 flex gap-1 border-b border-line">
        {IDS.map((id) => {
          const selected = id === current
          return (
            <button
              key={id}
              ref={(el) => (tabRefs.current[id] = el)}
              id={`${uid}-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => choose(id)}
              className={`relative -mb-px border-b-2 px-3 py-2.5 text-sm transition-colors duration-200 sm:px-4 ${
                selected ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {t.play.tabs[id]}
            </button>
          )
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${current}`}>
        <Game key={current} />
      </div>
    </Section>
  )
}
