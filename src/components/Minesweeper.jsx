import { useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import { useI18n } from '../i18n'

// Minesweeper where the mines are bugs: clear every safe cell without shipping one
const SIZE = 9
const BUGS = 10
const HOLD = 400 // ms a touch has to stay down to plant a flag

// Each count gets its own colour, readable on both themes
const COUNT_COLORS = [
  '',
  'text-sky-700 dark:text-sky-300',
  'text-emerald-700 dark:text-emerald-400',
  'text-accent',
  'text-violet-700 dark:text-violet-300',
  'text-amber-700 dark:text-amber-300',
  'text-teal-700 dark:text-teal-300',
  'text-fg',
  'text-muted',
]

function neighbours(i) {
  const r = Math.floor(i / SIZE)
  const c = i % SIZE
  const out = []
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      const nr = r + dr
      const nc = c + dc
      if ((dr || dc) && nr >= 0 && nc >= 0 && nr < SIZE && nc < SIZE) out.push(nr * SIZE + nc)
    }
  return out
}

function empty() {
  return Array.from({ length: SIZE * SIZE }, () => ({ bug: false, count: 0, open: false, flag: false }))
}

// Bugs are placed on the first click, away from it, so the opening move is always safe
function plant(cells, safe) {
  const keepClear = new Set([safe, ...neighbours(safe)])
  const spots = cells.map((_, i) => i).filter((i) => !keepClear.has(i))
  for (let n = 0; n < BUGS; n++) {
    const pick = Math.floor(Math.random() * spots.length)
    cells[spots[pick]].bug = true
    spots.splice(pick, 1)
  }
  cells.forEach((cell, i) => (cell.count = neighbours(i).filter((j) => cells[j].bug).length))
}

// Opens a cell, and spreads through every empty area it touches
function flood(cells, start) {
  const todo = [start]
  while (todo.length) {
    const i = todo.pop()
    const cell = cells[i]
    if (cell.open || cell.flag) continue
    cell.open = true
    if (!cell.bug && cell.count === 0) todo.push(...neighbours(i))
  }
}

function loadBest() {
  try {
    return Number(localStorage.getItem('mines-best')) || 0
  } catch {
    return 0
  }
}

export default function Minesweeper() {
  const { t } = useI18n()
  const m = t.play.mines
  const [cells, setCells] = useState(empty)
  const [status, setStatus] = useState('idle') // idle | running | won | lost
  const [hit, setHit] = useState(null)
  const [startedAt, setStartedAt] = useState(0)
  const [now, setNow] = useState(0)
  const [best, setBest] = useState(loadBest)
  const [flagMode, setFlagMode] = useState(false)
  const [focus, setFocus] = useState(0)
  const cellRefs = useRef([])
  const hold = useRef(null)

  const flags = cells.filter((c) => c.flag).length
  const seconds = status === 'idle' ? 0 : Math.floor((now - startedAt) / 1000)

  useEffect(() => {
    if (status !== 'running') return
    const timer = setInterval(() => setNow(Date.now()), 250)
    return () => clearInterval(timer)
  }, [status])

  const finish = (next, won, begun) => {
    const end = Date.now()
    setNow(end)
    if (won) {
      next.forEach((c) => c.bug && (c.flag = true))
      const time = Math.max(1, Math.floor((end - begun) / 1000))
      if (!best || time < best) {
        setBest(time)
        try {
          localStorage.setItem('mines-best', String(time))
        } catch {
          // Storage unavailable — the best time just isn't remembered
        }
      }
      setStatus('won')
    } else {
      next.forEach((c) => c.bug && (c.open = true))
      setStatus('lost')
    }
  }

  const open = (i) => {
    if (status === 'won' || status === 'lost') return
    const next = cells.map((c) => ({ ...c }))
    const cell = next[i]
    if (cell.flag) return

    let begun = startedAt
    if (status === 'idle') {
      plant(next, i)
      begun = Date.now()
      setStartedAt(begun)
      setNow(begun)
      setStatus('running')
    }

    let targets = [i]
    // Clicking a number whose bugs are all flagged opens the rest of its neighbours
    if (cell.open) {
      const around = neighbours(i)
      if (cell.count === 0 || around.filter((j) => next[j].flag).length !== cell.count) return
      targets = around.filter((j) => !next[j].open && !next[j].flag)
    }

    const bug = targets.find((j) => next[j].bug)
    if (bug !== undefined) {
      setHit(bug)
      finish(next, false, begun)
    } else {
      targets.forEach((j) => flood(next, j))
      if (next.every((c) => c.bug || c.open)) finish(next, true, begun)
    }
    setCells(next)
  }

  const toggleFlag = (i) => {
    if (status === 'won' || status === 'lost' || cells[i].open) return
    setCells(cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)))
  }

  const reset = () => {
    setCells(empty())
    setStatus('idle')
    setHit(null)
    setNow(0)
  }

  const act = (i) => (flagMode && !cells[i].open ? toggleFlag(i) : open(i))

  const move = (i) => {
    setFocus(i)
    cellRefs.current[i]?.focus()
  }

  // The board is always laid out left to right, so the arrows match what you see
  const onKeyDown = (e, i) => {
    const r = Math.floor(i / SIZE)
    const c = i % SIZE
    const to = {
      ArrowUp: r > 0 ? i - SIZE : i,
      ArrowDown: r < SIZE - 1 ? i + SIZE : i,
      ArrowLeft: c > 0 ? i - 1 : i,
      ArrowRight: c < SIZE - 1 ? i + 1 : i,
      Home: r * SIZE,
      End: r * SIZE + SIZE - 1,
    }[e.key]
    if (to !== undefined) {
      e.preventDefault()
      move(to)
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault()
      toggleFlag(i)
    }
  }

  // A long press on a touch screen plants a flag instead of opening the cell
  const onPointerDown = (e, i) => {
    if (e.pointerType === 'mouse') return
    hold.current = {
      fired: false,
      timer: setTimeout(() => {
        hold.current.fired = true
        toggleFlag(i)
        navigator.vibrate?.(15)
      }, HOLD),
    }
  }
  const endHold = () => hold.current && clearTimeout(hold.current.timer)
  const onClick = (i) => {
    const held = hold.current?.fired
    hold.current = null
    if (!held) act(i)
  }

  const describe = (cell) => {
    if (cell.flag && !cell.open) return m.flagged
    if (!cell.open) return m.hidden
    if (cell.bug) return m.bug
    return cell.count ? m.near(cell.count) : m.clear
  }

  const message = status === 'won' ? m.won(seconds) : status === 'lost' ? m.lost : status === 'idle' ? m.ready : ''

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
      <Reveal>
        <div
          role="grid"
          aria-label={m.board}
          dir="ltr"
          className="mx-auto grid aspect-square w-full max-w-md select-none gap-px overflow-hidden rounded-[10px] border border-line bg-line lg:mx-0"
          style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
          onContextMenu={(e) => e.preventDefault()}
        >
          {cells.map((cell, i) => {
            const shown = cell.open
            const isHit = i === hit
            return (
              <button
                key={i}
                ref={(el) => (cellRefs.current[i] = el)}
                type="button"
                role="gridcell"
                tabIndex={i === focus ? 0 : -1}
                aria-label={`${m.cell(Math.floor(i / SIZE) + 1, (i % SIZE) + 1)}, ${describe(cell)}`}
                onFocus={() => setFocus(i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                onClick={() => onClick(i)}
                onContextMenu={(e) => {
                  e.preventDefault()
                  toggleFlag(i)
                }}
                onPointerDown={(e) => onPointerDown(e, i)}
                onPointerUp={endHold}
                onPointerLeave={endHold}
                onPointerCancel={endHold}
                className={`flex items-center justify-center font-display text-xl tabular-nums transition-colors duration-150 focus-visible:relative focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent sm:text-2xl ${
                  isHit
                    ? 'bg-accent text-on-accent'
                    : shown
                      ? `bg-ink ${COUNT_COLORS[cell.count]}`
                      : 'bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_11%)] hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_17%)]'
                }`}
                style={{ WebkitTouchCallout: 'none' }}
              >
                <span aria-hidden="true">
                  {cell.flag && !shown ? '🚩' : shown && cell.bug ? '🐞' : shown && cell.count ? cell.count : ''}
                </span>
              </button>
            )
          })}
        </div>

        <div className="mx-auto mt-5 hidden max-w-md justify-center pointer-coarse:flex lg:mx-0">
          <button
            type="button"
            aria-pressed={flagMode}
            onClick={() => setFlagMode((on) => !on)}
            className={`rounded-full border px-5 py-2.5 text-sm font-medium transition-colors duration-200 ${
              flagMode ? 'border-fg bg-fg text-ink' : 'border-line text-fg'
            }`}
          >
            🚩 {m.flagMode}
          </button>
        </div>
      </Reveal>

      <Reveal delay={100} className="lg:pt-2">
        <p className="max-w-sm leading-relaxed text-muted">{m.intro}</p>

        <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-5">
          {[
            [m.left, BUGS - flags],
            [m.time, m.seconds(seconds)],
            [m.best, best ? m.seconds(best) : '–'],
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
          onClick={reset}
          className="mt-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30 hover:bg-fg/5"
        >
          {m.newGame}
        </button>

        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">{m.controls}</p>
      </Reveal>
    </div>
  )
}
