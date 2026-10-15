import { memo, useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import { useReducedMotion } from '../lib/hooks'
import { useI18n } from '../i18n'
import { LEVELS, LEVEL_IDS, confetti, empty, exposeBugs, flaggedRight, flood, isCleared, neighbours, plant, sound } from '../lib/minesweeper'

// Minesweeper where the mines are bugs: clear every safe cell without shipping one
const HOLD = 350 // ms a touch has to stay down to plant a flag
const SLOP = 10 // px a finger can drift before a press counts as a scroll instead

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
// Bigger boards get smaller numbers
const TEXT = { beginner: 'text-xl sm:text-2xl', intermediate: 'text-lg sm:text-xl', expert: 'text-sm sm:text-lg' }
const HIDDEN =
  'bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_15%)] hover:bg-[color-mix(in_oklab,var(--color-surface),var(--color-fg)_22%)] active:scale-[0.9]'

// Best times are kept in milliseconds, one key per board size
const bestKey = (level) => `mines-best-${level}`

function load(key, fallback) {
  try {
    return localStorage.getItem(key) ?? fallback
  } catch {
    return fallback
  }
}

function store(key, value) {
  try {
    localStorage.setItem(key, String(value))
  } catch {
    // Storage unavailable — the setting just isn't remembered
  }
}

const loadLevel = () => {
  const saved = load('mines-level', 'beginner')
  return LEVEL_IDS.includes(saved) ? saved : 'beginner'
}

// The old single 9 × 9 board saved whole seconds under 'mines-best'; that carries over to Beginner
const loadBests = () =>
  Object.fromEntries(
    LEVEL_IDS.map((id) => {
      const saved = Number(load(bestKey(id), 0)) || 0
      const older = id === 'beginner' ? (Number(load('mines-best', 0)) || 0) * 1000 : 0
      return [id, saved || older]
    }),
  )

function FlagIcon({ wrong }) {
  return (
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
      <path d="M7 21V3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 4h10l-2.6 4.2L18 12.5H8z" fill="var(--color-accent)" />
      {wrong && <path d="M4 4l16 16M20 4L4 20" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />}
    </svg>
  )
}

function BugIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-full" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden="true">
      <path d="M7.5 10.5 4 8.5M7 14.5H3.5M7.8 18 5 20.5M16.5 10.5l3.5-2M17 14.5h3.5M16.2 18l2.8 2.5M10.6 5.2 9.2 3M13.4 5.2 14.8 3" />
      <circle cx="12" cy="7.4" r="2.6" fill="currentColor" stroke="none" />
      <ellipse cx="12" cy="14.6" rx="5" ry="6" fill="currentColor" stroke="none" />
      <path d="M12 9.8v10.6" stroke="var(--color-ink)" strokeWidth="1.2" />
    </svg>
  )
}

// One cell. Memoised so the ticking clock doesn't redraw the whole board
const Cell = memo(function Cell({ i, cell, tabbable, hit, over, holding, label, delay, text }) {
  const { open, flag, bug, count } = cell
  const style = delay ? { animationDelay: `${delay}ms` } : undefined
  let face = null
  if (flag && !open)
    face = (
      <span className="mine-flag block size-[58%]">
        <FlagIcon wrong={over && !bug} />
      </span>
    )
  else if (open && bug)
    face = (
      <span className={`${hit ? 'mine-hit' : 'mine-bug'} block size-[60%]`} style={hit ? undefined : style}>
        <BugIcon />
      </span>
    )
  else if (open && count) face = count

  return (
    <button
      data-i={i}
      type="button"
      role="gridcell"
      tabIndex={tabbable ? 0 : -1}
      aria-label={label}
      className={`relative flex items-center justify-center font-display leading-none tabular-nums transition-[background-color,transform] duration-150 focus-visible:z-10 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-accent ${text} ${
        hit ? 'bg-accent text-on-accent' : open ? `mine-open bg-ink ${bug ? 'text-fg' : COUNT_COLORS[count]}` : `${HIDDEN} text-fg`
      } ${holding ? 'mine-holding' : ''}`}
      style={open && !hit ? style : undefined}
    >
      <span aria-hidden="true" className="contents">
        {face}
      </span>
    </button>
  )
})

// The little boards in the tutorial: o = open, h = hidden, f = flag, digits = counts
const LESSONS = [
  ['o', 'o', '1', 'o', '1', 'h', '1', 'h', 'h'],
  ['h', 'f', 'h', '1', '2', 'h', 'o', '1', 'f'],
  ['h', 'h', 'h', 'h', 'f', 'h', 'h', 'h', 'h'],
]

function Lesson({ pattern }) {
  return (
    <div aria-hidden="true" className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line">
      {pattern.map((k, i) => (
        <span
          key={i}
          className={`flex size-6 items-center justify-center font-display text-sm sm:size-7 sm:text-base ${k === 'h' || k === 'f' ? HIDDEN.split(' ')[0] : 'bg-ink'} ${COUNT_COLORS[Number(k)] ?? ''}`}
        >
          {k === 'f' ? (
            <span className="mine-flag block size-[58%] text-fg">
              <FlagIcon />
            </span>
          ) : Number(k) ? (
            k
          ) : null}
        </span>
      ))}
    </div>
  )
}

export default function Minesweeper() {
  const { t, locale } = useI18n()
  const m = t.play.mines
  const uid = useId()
  const reduced = useReducedMotion()
  const [level, setLevel] = useState(loadLevel)
  const { size, bugs } = LEVELS[level]
  const [cells, setCells] = useState(() => empty(size))
  const [status, setStatus] = useState('menu') // menu | ready | running | paused | won | lost
  const [clock, setClock] = useState({ elapsed: 0, since: 0 }) // ms banked, and when the current run began
  const [now, setNow] = useState(0)
  const [hit, setHit] = useState(null)
  const [result, setResult] = useState(null) // { won, time, correct, isBest }
  const [showResult, setShowResult] = useState(false)
  const [bests, setBests] = useState(loadBests)
  const [muted, setMuted] = useState(() => load('mines-sound', 'off') !== 'on')
  const [flagMode, setFlagMode] = useState(false)
  const [focus, setFocus] = useState(0)
  const [holding, setHolding] = useState(null)
  const [lesson, setLesson] = useState(() => (load('mines-tutorial', '') === 'done' ? null : 0)) // tutorial step, or null
  const [message, setMessage] = useState('')
  const gridRef = useRef(null)
  const boardRef = useRef(null)
  const fxRef = useRef(null)
  const hold = useRef(null)
  const lastPointer = useRef('mouse')
  const later = useRef(0)
  const stopConfetti = useRef(null)
  const latest = useRef({})
  const interacted = useRef(false)
  // Menus take focus when they open, so a keyboard player isn't stranded on the now-hidden board.
  // Not on page load, though: a first-time tutorial shouldn't pull the page down to it
  const grab = useCallback((el) => interacted.current && el?.focus({ preventScroll: true }), [])

  const playing = status === 'ready' || status === 'running'
  const over = status === 'won' || status === 'lost'
  const flags = cells.filter((c) => c.flag).length
  const elapsed = clock.elapsed + (clock.since ? Math.max(0, now - clock.since) : 0)
  const best = bests[level]
  const overlay = lesson !== null || status === 'menu' || status === 'paused' || (over && showResult)

  const decimal = new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 })
  const exact = (ms) => m.seconds(decimal.format(ms / 1000))
  const play = (name) => !muted && sound(name)

  // The clock only ticks the display; the time itself comes from timestamps, so it never drifts
  useEffect(() => {
    if (status !== 'running') return
    const timer = setInterval(() => setNow(performance.now()), 200)
    return () => clearInterval(timer)
  }, [status])

  useEffect(
    () => () => {
      clearTimeout(later.current)
      stopConfetti.current?.()
    },
    [],
  )

  const focusCell = (i) => gridRef.current?.querySelector(`[data-i="${i}"]`)?.focus({ preventScroll: true })

  const newRound = (next = level) => {
    clearTimeout(later.current)
    stopConfetti.current?.()
    const n = LEVELS[next].size
    const centre = Math.floor((n * n) / 2)
    setCells(empty(n))
    setStatus('ready')
    setClock({ elapsed: 0, since: 0 })
    setHit(null)
    setResult(null)
    setShowResult(false)
    setFocus(centre)
    setMessage(m.ready)
    if (!muted) sound()
    requestAnimationFrame(() => focusCell(centre))
  }

  const finish = (next, won, run) => {
    const time = Math.max(1, run.elapsed + (run.since ? performance.now() - run.since : 0))
    if (won) next.forEach((c) => c.bug && (c.flag = true))
    const isBest = won && (!best || time < best)
    if (isBest) {
      store(bestKey(level), Math.round(time))
      setBests((prev) => ({ ...prev, [level]: time }))
    }
    setClock({ elapsed: time, since: 0 })
    setResult({ won, time, correct: flaggedRight(next), total: bugs, isBest })
    setStatus(won ? 'won' : 'lost')
    setMessage(won ? (isBest ? m.wonBest(exact(time)) : m.won(exact(time))) : m.lost)
    play(won ? (isBest ? 'record' : 'win') : 'boom')
    // Let the board finish its reveal before the summary covers it
    later.current = setTimeout(
      () => {
        setShowResult(true)
        if (isBest && !reduced) stopConfetti.current = confetti(fxRef.current)
      },
      won ? 700 : 1200,
    )
  }

  const open = (i) => {
    if (!playing) return
    const next = cells.map((c) => ({ ...c }))
    const cell = next[i]
    if (cell.flag) return

    let run = clock
    if (status === 'ready') {
      plant(next, i, size, bugs)
      run = { elapsed: 0, since: performance.now() }
      setClock(run)
      setNow(run.since)
      setStatus('running')
      setMessage('')
    }

    let targets = [i]
    // Opening a number whose bugs are all flagged opens the rest of its neighbours
    if (cell.open) {
      const around = neighbours(i, size)
      if (!cell.count || around.filter((j) => next[j].flag).length !== cell.count) return
      targets = around.filter((j) => !next[j].open && !next[j].flag)
      if (!targets.length) return
    }

    const bug = targets.find((j) => next[j].bug)
    if (bug !== undefined) {
      exposeBugs(next, bug, size)
      setHit(bug)
      finish(next, false, run)
    } else {
      const opened = targets.reduce((sum, j) => sum + flood(next, j, size), 0)
      if (isCleared(next)) finish(next, true, run)
      else play(opened > 1 ? 'spread' : 'open')
    }
    setCells(next)
  }

  const toggleFlag = (i) => {
    if (!playing || cells[i].open) return
    const flag = !cells[i].flag
    setCells((prev) => prev.map((c, j) => (j === i ? { ...c, flag } : c)))
    play(flag ? 'flag' : 'unflag')
  }

  const pause = () => {
    if (status !== 'running') return
    const at = performance.now()
    setClock((c) => ({ elapsed: c.elapsed + (at - c.since), since: 0 }))
    setStatus('paused')
    setMessage(m.paused)
  }

  const resume = () => {
    const at = performance.now()
    setClock((c) => ({ ...c, since: at }))
    setNow(at)
    setStatus('running')
    setMessage('')
    requestAnimationFrame(() => focusCell(focus))
  }

  const chooseLevel = (id) => {
    setLevel(id)
    store('mines-level', id)
    // A new board size means a fresh board: back to the start screen for it
    if (status !== 'menu') {
      clearTimeout(later.current)
      stopConfetti.current?.()
      setStatus('menu')
      setClock({ elapsed: 0, since: 0 })
      setHit(null)
      setResult(null)
      setShowResult(false)
      setMessage('')
    }
    setCells(empty(LEVELS[id].size))
    setFocus(0)
  }

  const showTutorial = () => {
    interacted.current = true
    pause()
    setLesson(0)
  }

  const closeTutorial = () => {
    setLesson(null)
    store('mines-tutorial', 'done')
  }

  const toggleSound = () => {
    const next = !muted
    setMuted(next)
    store('mines-sound', next ? 'off' : 'on')
    if (!next) sound('flag')
  }

  // Timers and observers call the newest version of these
  useLayoutEffect(() => {
    latest.current = { toggleFlag, pause }
  })

  // The clock never keeps running out of sight
  useEffect(() => {
    if (status !== 'running') return
    const stop = () => latest.current.pause()
    const observer = new IntersectionObserver(([entry]) => !entry.isIntersecting && stop(), { threshold: 0.25 })
    observer.observe(boardRef.current)
    const onVisibility = () => document.hidden && stop()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', stop)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', stop)
    }
  }, [status])

  /* ---------- Input, handled once for the whole board ---------- */

  const cellOf = (e) => {
    const el = e.target.closest?.('[data-i]')
    return el ? Number(el.dataset.i) : null
  }

  const act = (i) => (flagMode && !cells[i].open ? toggleFlag(i) : open(i))

  const onClick = (e) => {
    const i = cellOf(e)
    const held = hold.current?.fired
    hold.current = null
    if (i === null || held) return
    act(i)
  }

  const onContextMenu = (e) => {
    e.preventDefault()
    const i = cellOf(e)
    // On touch screens the long press below plants the flag; the browser's own menu event is ignored
    if (i !== null && lastPointer.current === 'mouse') toggleFlag(i)
  }

  // A long press on a touch screen plants a flag; the cell fills up while you hold
  const onPointerDown = (e) => {
    lastPointer.current = e.pointerType
    const i = cellOf(e)
    if (e.pointerType === 'mouse' || i === null || !playing || cells[i].open) return
    hold.current = {
      x: e.clientX,
      y: e.clientY,
      fired: false,
      timer: setTimeout(() => {
        hold.current.fired = true
        setHolding(null)
        latest.current.toggleFlag(i)
        navigator.vibrate?.(15)
      }, HOLD),
    }
    setHolding(i)
  }
  const cancelHold = () => {
    if (hold.current && !hold.current.fired) {
      clearTimeout(hold.current.timer)
      hold.current = null
    }
    setHolding(null)
  }
  const onPointerMove = (e) => {
    const h = hold.current
    if (h && !h.fired && Math.hypot(e.clientX - h.x, e.clientY - h.y) > SLOP) cancelHold()
  }
  const onPointerUp = () => {
    if (hold.current && !hold.current.fired) clearTimeout(hold.current.timer)
    setHolding(null)
  }

  // The board is always laid out left to right, so the arrows match what you see
  const onKeyDown = (e) => {
    const i = cellOf(e)
    if (i === null || e.ctrlKey || e.metaKey || e.altKey) return
    const r = Math.floor(i / size)
    const c = i % size
    const to = {
      ArrowUp: r > 0 ? i - size : i,
      ArrowDown: r < size - 1 ? i + size : i,
      ArrowLeft: c > 0 ? i - 1 : i,
      ArrowRight: c < size - 1 ? i + 1 : i,
      Home: r * size,
      End: r * size + size - 1,
    }[e.key]
    const key = e.key.toLowerCase()
    if (to !== undefined) {
      e.preventDefault()
      setFocus(to)
      focusCell(to)
    } else if (key === 'f') {
      e.preventDefault()
      toggleFlag(i)
    } else if ((key === 'p' || e.key === 'Escape') && status === 'running') {
      e.preventDefault()
      pause()
    } else if (key === 'n' || key === 'r') {
      e.preventDefault()
      newRound()
    }
  }

  const describe = (cell) => {
    if (cell.flag && !cell.open) return over && !cell.bug ? m.wrongFlag : m.flagged
    if (!cell.open) return m.hidden
    if (cell.bug) return m.bug
    return cell.count ? m.near(cell.count) : m.clear
  }

  /* ---------- Pieces of the menus ---------- */

  const primary =
    'rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-on-accent shadow-sm transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.97]'
  const secondary =
    'rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30 hover:bg-fg/5'

  const levelPicker = (withInfo) => (
    <fieldset className="w-full max-w-[21rem]">
      <legend className="sr-only">{m.level}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-full border border-line bg-surface/70 p-1">
        {LEVEL_IDS.map((id) => (
          <label key={id} className="block">
            <input type="radio" name={`${uid}-level`} value={id} checked={level === id} onChange={() => chooseLevel(id)} className="peer sr-only" />
            <span className="block cursor-pointer truncate rounded-full px-1.5 py-1.5 text-center text-[13px] text-muted transition-colors duration-200 select-none peer-checked:bg-fg peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:text-fg peer-checked:hover:text-ink sm:text-sm">
              {m.levels[id]}
            </span>
          </label>
        ))}
      </div>
      {withInfo && <p className="mt-2 text-xs text-muted">{m.levelInfo(size, bugs)}</p>}
    </fieldset>
  )

  let screen = null
  if (lesson !== null) {
    const step = m.tutorial[lesson]
    const last = lesson === m.tutorial.length - 1
    screen = (
      <div role="group" aria-label={m.howTo} className="flex flex-col items-center gap-2" onKeyDown={(e) => e.key === 'Escape' && closeTutorial()}>
        <p className="text-xs font-medium tracking-[0.18em] text-muted uppercase">
          {m.howTo} · {m.step(lesson + 1, m.tutorial.length)}
        </p>
        <Lesson key={lesson} pattern={LESSONS[lesson]} />
        <p className="font-display text-2xl leading-tight text-fg sm:text-3xl">{step.title}</p>
        <p className="max-w-[19rem] text-[13px] leading-snug text-muted sm:text-sm sm:leading-relaxed">{step.body}</p>
        <div className="mt-1 flex items-center gap-2">
          {!last && (
            <button type="button" onClick={closeTutorial} className="px-2 text-xs text-muted underline-offset-4 hover:text-fg hover:underline">
              {m.skip}
            </button>
          )}
          {lesson > 0 && (
            <button type="button" onClick={() => setLesson(lesson - 1)} className={secondary}>
              {m.back}
            </button>
          )}
          <button type="button" onClick={() => (last ? closeTutorial() : setLesson(lesson + 1))} className={primary} ref={grab}>
            {last ? m.gotIt : m.next}
          </button>
        </div>
      </div>
    )
  } else if (status === 'menu') {
    screen = (
      <>
        <p className="font-display text-5xl leading-none text-fg">{t.play.tabs.mines}</p>
        <p className="max-w-[18rem] text-sm text-muted">{m.startHint}</p>
        {levelPicker(true)}
        <button type="button" onClick={() => newRound()} className={primary}>
          {m.start}
        </button>
        <button type="button" onClick={() => setLesson(0)} className="text-xs text-muted underline-offset-4 hover:text-fg hover:underline">
          {m.howTo}
        </button>
      </>
    )
  } else if (status === 'paused') {
    screen = (
      <>
        <p className="font-display text-5xl leading-none text-fg">{m.pausedTitle}</p>
        <p className="text-sm text-muted">
          {m.time}: {m.seconds(Math.floor(elapsed / 1000))}
        </p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={resume} className={primary} ref={grab}>
            {m.resume}
          </button>
          <button type="button" onClick={() => newRound()} className={secondary}>
            {m.restart}
          </button>
        </div>
        <p className="max-w-[17rem] text-xs text-muted">{m.pausedHint}</p>
      </>
    )
  } else if (over && showResult && result) {
    screen = (
      <>
        <p className={`text-xs font-medium tracking-[0.18em] uppercase ${result.isBest ? 'text-accent' : 'text-muted'}`}>
          {result.won ? (result.isBest ? m.newRecord : m.wonTitle) : m.lostTitle}
        </p>
        <p className={`font-display text-6xl leading-none text-fg tabular-nums ${result.isBest ? 'mine-pop' : ''}`}>{exact(result.time)}</p>
        <dl className="grid grid-cols-2 gap-x-6 text-sm">
          <dt className="text-muted">{m.best}</dt>
          <dt className="text-muted">{m.flaggedRight}</dt>
          <dd className="font-medium text-fg tabular-nums">{best ? exact(best) : '–'}</dd>
          <dd className="font-medium text-fg tabular-nums">{m.flaggedOf(result.correct, result.total)}</dd>
        </dl>
        {levelPicker(false)}
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={() => newRound()} className={primary} ref={grab}>
            {m.again}
          </button>
          <button type="button" onClick={() => setShowResult(false)} className={secondary}>
            {m.viewBoard}
          </button>
        </div>
      </>
    )
  }

  const rows = Array.from({ length: size }, (_, r) => r)
  const action =
    status === 'menu' ? [m.start, () => newRound()] : status === 'running' ? [m.pause, pause] : status === 'paused' ? [m.resume, resume] : over ? [m.again, () => newRound()] : null

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
      <Reveal>
        <div
          ref={boardRef}
          onPointerDownCapture={() => (interacted.current = true)}
          onKeyDownCapture={() => (interacted.current = true)}
          className={`relative mx-auto aspect-square w-full max-w-md overflow-hidden rounded-[14px] border bg-line shadow-[0_12px_32px_-18px_rgb(0_0_0/0.25)] transition-colors duration-500 lg:mx-0 ${
            status === 'won' ? 'border-accent' : flagMode && playing ? 'border-accent/60' : 'border-line'
          } ${status === 'lost' ? 'mine-shake' : ''}`}
        >
          <div
            ref={gridRef}
            role="grid"
            aria-label={m.board}
            aria-rowcount={size}
            aria-colcount={size}
            dir="ltr"
            inert={overlay}
            className="grid size-full touch-manipulation gap-px select-none"
            style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`, WebkitTouchCallout: 'none' }}
            onClick={onClick}
            onContextMenu={onContextMenu}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={cancelHold}
            onPointerLeave={cancelHold}
            onKeyDown={onKeyDown}
          >
            {rows.map((r) => (
              <div key={r} role="row" className="contents">
                {rows.map((c) => {
                  const i = r * size + c
                  const cell = cells[i]
                  return (
                    <Cell
                      key={i}
                      i={i}
                      cell={cell}
                      tabbable={i === focus}
                      hit={i === hit}
                      over={over}
                      holding={i === holding}
                      label={`${m.cell(r + 1, c + 1)}, ${describe(cell)}`}
                      delay={reduced ? 0 : Math.min(cell.wave * (status === 'lost' ? 45 : 28), 700)}
                      text={TEXT[level]}
                    />
                  )
                })}
              </div>
            ))}
          </div>

          {screen && (
            <div
              key={lesson !== null ? `lesson-${lesson}` : status}
              className="mine-in absolute inset-0 flex flex-col items-center justify-center-safe gap-3 overflow-y-auto bg-surface/80 p-3 text-center backdrop-blur-[3px] sm:gap-4 sm:p-4 [&>*]:shrink-0"
            >
              {screen}
            </div>
          )}

          <canvas ref={fxRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        </div>

        <div className="mx-auto mt-5 hidden max-w-md justify-center pointer-coarse:flex lg:mx-0">
          <button
            type="button"
            aria-pressed={flagMode}
            onClick={() => setFlagMode((on) => !on)}
            className={`flex items-center gap-2 rounded-full border px-5 py-3 text-sm font-medium transition-colors duration-200 ${
              flagMode ? 'border-fg bg-fg text-ink' : 'border-line text-fg'
            }`}
          >
            <span className="block size-4">
              <FlagIcon />
            </span>
            {m.flagMode}
          </button>
        </div>
      </Reveal>

      <Reveal delay={100} className="lg:pt-2">
        <p className="max-w-sm leading-relaxed text-muted">{m.intro}</p>

        <dl className="mt-8 grid grid-cols-3 gap-4 border-y border-line py-5">
          {[
            [m.left, status === 'won' ? 0 : bugs - flags, 'left'],
            [m.time, over ? exact(elapsed) : m.seconds(Math.floor(elapsed / 1000)), 'time'],
            [m.best, best ? exact(best) : '–', 'best', m.levels[level]],
          ].map(([label, value, id, note]) => (
            <div key={id} className="min-w-0">
              <dt className="truncate text-sm text-muted">{label}</dt>
              <dd className="mt-1 font-display text-3xl text-fg tabular-nums">{value}</dd>
              {note && <dd className="mt-1 truncate text-xs text-muted">{note}</dd>}
            </div>
          ))}
        </dl>

        <p role="status" className="mt-5 min-h-12 leading-relaxed text-fg">
          {message}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          {action && (
            <button type="button" onClick={action[1]} className={secondary}>
              {action[0]}
            </button>
          )}
          {status !== 'menu' && !over && (
            <button type="button" onClick={() => newRound()} className={secondary}>
              {m.newGame}
            </button>
          )}
          <button type="button" aria-pressed={!muted} onClick={toggleSound} className={secondary}>
            {m.sound}: {muted ? m.off : m.on}
          </button>
        </div>

        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">
          {m.controls}{' '}
          <button type="button" onClick={showTutorial} className="link text-fg">
            {m.howTo}
          </button>
        </p>
      </Reveal>
    </div>
  )
}
