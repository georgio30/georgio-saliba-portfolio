import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import { useReducedMotion, useTheme } from '../lib/hooks'
import { useI18n } from '../i18n'
import {
  COUNTDOWN,
  LEVEL_IDS,
  TECH,
  advance,
  burst,
  confetti,
  drawBoard,
  drawFx,
  fresh,
  popup,
  readPalette,
  sound,
  tickMs,
  turn,
  updateFx,
} from '../lib/snake'

const KEYS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
}

// Classic keeps the original key so earlier best scores carry over
const bestKey = (level) => (level === 'classic' ? 'snake-best' : `snake-best-${level}`)

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
  const saved = load('snake-level', 'classic')
  return LEVEL_IDS.includes(saved) ? saved : 'classic'
}
const loadBests = () => Object.fromEntries(LEVEL_IDS.map((id) => [id, Number(load(bestKey(id), 0)) || 0]))

export default function Snake() {
  const { t } = useI18n()
  const uid = useId()
  const [dark] = useTheme()
  const reduced = useReducedMotion()
  const [status, setStatusState] = useState('idle') // idle | running | paused | over
  const [level, setLevel] = useState(loadLevel)
  const [score, setScore] = useState(0)
  const [bests, setBests] = useState(loadBests)
  const [result, setResult] = useState(null) // { points, isBest } of the last game
  const [message, setMessage] = useState('')
  const [muted, setMuted] = useState(() => load('snake-sound', 'off') !== 'on')

  // The board changes every frame, so it lives in refs rather than in React state
  const game = useRef(null)
  if (game.current === null) game.current = fresh(level)
  const statusRef = useRef('idle')
  const boardRef = useRef(null)
  const fxRef = useRef(null)
  const wrapRef = useRef(null)
  const swipe = useRef(null)
  const frame = useRef(0)
  const palette = useRef(null)
  // What the animation loop needs from the latest render
  const live = useRef({ t, reduced, muted, bests })
  useLayoutEffect(() => {
    live.current = { t, reduced, muted, bests }
  })

  const best = Math.max(bests[level], status === 'running' || status === 'paused' ? score : 0)

  const setStatus = useCallback((next) => {
    statusRef.current = next
    setStatusState(next)
  }, [])

  const paint = useCallback((now = performance.now()) => {
    palette.current ??= readPalette()
    drawBoard(boardRef.current, game.current, palette.current, now, live.current.reduced)
    drawFx(fxRef.current, game.current, palette.current)
  }, [])

  const react = useCallback(
    (event, now) => {
      if (!event) return
      const g = game.current
      const { t, reduced, muted, bests } = live.current
      const before = bests[g.level]
      const play = (name) => !muted && sound(name)

      if (event.type === 'crash') {
        g.dead = now
        g.animUntil = now + 450
        const isBest = g.points > before
        if (isBest) {
          store(bestKey(g.level), g.points)
          setBests((prev) => ({ ...prev, [g.level]: g.points }))
          if (!reduced) confetti(g)
        }
        setResult({ points: g.points, isBest })
        setStatus('over')
        setMessage(isBest ? t.play.overBest(g.points) : t.play.over(g.points))
        play(isBest ? 'best' : 'crash')
        return
      }

      setScore(g.points)
      if (!reduced) {
        burst(g, event.x, event.y, event.type === 'bonus' ? ['accent', 'accentSoft', 'fg'] : ['accent', 'accentSoft'], event.type === 'bonus' ? 18 : 10, 5)
        popup(g, event.x, event.y, `+${event.gain}`)
      }
      if (before > 0 && !g.passed && g.points > before) {
        g.passed = true
        setMessage(t.play.passed)
        if (!reduced) popup(g, event.x, event.y - 0.9, t.play.newBestShort, 'fg', 0.7)
        play('passed')
        return
      }
      setMessage(event.type === 'bonus' ? t.play.bonus(event.gain) : t.play.ate(TECH[event.tech]))
      play(event.type)
    },
    [setStatus],
  )

  // One requestAnimationFrame loop: fixed-length game steps, drawing in between them.
  // It stops by itself once nothing is moving
  const run = useCallback(() => {
    if (frame.current) return
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min(now - last, 100) // a stalled tab doesn't fast-forward the game
      last = now
      const g = game.current
      if (statusRef.current === 'running') {
        if (g.countdown > 0) {
          g.countdown = Math.max(g.countdown - dt, 0)
        } else {
          g.acc += dt
          while (statusRef.current === 'running' && g.acc >= tickMs(g)) {
            g.acc -= tickMs(g)
            react(advance(g), now)
          }
        }
      }
      updateFx(g, dt)
      paint(now)
      const busy = statusRef.current === 'running' || g.fx.length > 0 || now < g.animUntil
      frame.current = busy ? requestAnimationFrame(tick) : 0
    }
    frame.current = requestAnimationFrame(tick)
  }, [paint, react])

  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  // Colours come from the theme; read them again when it flips
  useEffect(() => {
    palette.current = readPalette()
    if (boardRef.current.width) paint()
  }, [dark, paint])

  // Keep both canvases as sharp as the screen they're on
  useEffect(() => {
    const board = boardRef.current
    const observer = new ResizeObserver(([entry]) => {
      const px = Math.round(entry.contentRect.width * Math.min(window.devicePixelRatio || 1, 2))
      if (!px || board.width === px) return
      for (const canvas of [board, fxRef.current]) canvas.width = canvas.height = px
      paint()
    })
    observer.observe(board)
    return () => observer.disconnect()
  }, [paint])

  const focusBoard = () => wrapRef.current?.focus({ preventScroll: true })

  const pause = useCallback(() => {
    if (statusRef.current !== 'running') return
    game.current.countdown = 0
    setStatus('paused')
    setMessage(live.current.t.play.paused)
    paint()
  }, [paint, setStatus])

  // The game never keeps running out of sight
  useEffect(() => {
    if (status !== 'running') return
    const observer = new IntersectionObserver(([entry]) => !entry.isIntersecting && pause(), { threshold: 0.35 })
    observer.observe(wrapRef.current)
    const onVisibility = () => document.hidden && pause()
    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pagehide', pause)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pagehide', pause)
    }
  }, [status, pause])

  const start = () => {
    if (!muted) sound()
    game.current = fresh(level)
    setScore(0)
    setResult(null)
    setMessage('')
    setStatus('running')
    run()
    focusBoard()
  }

  // Coming back from a pause gives a short count-in, so the snake doesn't move off before you're ready
  const resume = () => {
    if (!muted) sound()
    game.current.countdown = COUNTDOWN
    setMessage(t.play.resuming)
    setStatus('running')
    run()
    focusBoard()
  }

  const toggle = () => {
    if (status === 'running') pause()
    else if (status === 'paused') resume()
    else start()
  }

  const press = (name) => {
    if (status === 'idle' || status === 'over') start()
    else if (status === 'paused') resume()
    // A fresh game starts heading right, so a turn is judged against that
    turn(game.current, name)
  }

  const chooseLevel = (id) => {
    setLevel(id)
    store('snake-level', id)
  }

  const toggleSound = () => {
    const next = !muted
    setMuted(next)
    store('snake-sound', next ? 'off' : 'on')
    if (!next) sound('eat')
  }

  const onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    // The difficulty radios use the arrow keys themselves
    if (e.target.tagName === 'INPUT') return
    const onBoard = e.target === e.currentTarget
    if (KEYS[e.key]) {
      e.preventDefault()
      if (!e.repeat || status === 'running') press(KEYS[e.key])
    } else if ((e.key === ' ' || e.key === 'Enter') && onBoard) {
      e.preventDefault()
      if (!e.repeat) toggle()
    } else if ((e.key === 'Escape' || e.key === 'p' || e.key === 'P') && status === 'running') {
      e.preventDefault()
      pause()
    } else if ((e.key === 'r' || e.key === 'R') && status !== 'running') {
      e.preventDefault()
      start()
    }
  }

  // Swipe on the board to steer; each swipe counts as soon as it's long enough, and one
  // gesture can hold several turns. A tap on a touch screen starts or pauses
  const onPointerDown = (e) => {
    if (e.target.closest('button, input, label')) return
    swipe.current = { x: e.clientX, y: e.clientY, moved: false }
    e.currentTarget.setPointerCapture?.(e.pointerId)
    focusBoard()
  }
  const onPointerMove = (e) => {
    const s = swipe.current
    if (!s) return
    const dx = e.clientX - s.x
    const dy = e.clientY - s.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 18) return
    press(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
    swipe.current = { x: e.clientX, y: e.clientY, moved: true }
  }
  const onPointerUp = (e) => {
    const s = swipe.current
    swipe.current = null
    if (s && !s.moved && e.pointerType !== 'mouse') toggle()
  }

  const action = status === 'running' ? t.play.pause : status === 'paused' ? t.play.resume : status === 'over' ? t.play.again : t.play.start
  const primary =
    'rounded-full bg-accent px-6 py-2.5 text-sm font-medium text-on-accent shadow-sm transition-[transform,opacity] duration-200 hover:opacity-90 active:scale-[0.97]'
  const secondary =
    'rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30 hover:bg-fg/5'
  const hint = 'text-xs text-muted pointer-coarse:hidden'

  const levelPicker = (
    <fieldset className="w-full max-w-[19rem]">
      <legend className="sr-only">{t.play.level}</legend>
      <div className="grid grid-cols-3 gap-1 rounded-full border border-line bg-surface/70 p-1">
        {LEVEL_IDS.map((id) => (
          <label key={id} className="block">
            <input
              type="radio"
              name={`${uid}-level`}
              value={id}
              checked={level === id}
              onChange={() => chooseLevel(id)}
              className="peer sr-only"
            />
            <span className="block cursor-pointer rounded-full px-2 py-1.5 text-center text-sm text-muted transition-colors duration-200 select-none peer-checked:bg-fg peer-checked:text-ink peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent hover:text-fg peer-checked:hover:text-ink">
              {t.play.levels[id]}
            </span>
          </label>
        ))}
      </div>
      <p className="mt-2 min-h-8 text-xs leading-snug text-muted">{t.play.levelHints[level]}</p>
    </fieldset>
  )

  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
      <Reveal>
        <div
          ref={wrapRef}
          tabIndex={0}
          role="group"
          aria-label={t.play.board}
          onKeyDown={onKeyDown}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (swipe.current = null)}
          className="relative mx-auto aspect-square w-full max-w-md touch-none overflow-hidden rounded-[14px] border border-line bg-surface shadow-[0_1px_0_rgb(0_0_0/0.02),0_12px_32px_-18px_rgb(0_0_0/0.25)] select-none lg:mx-0"
        >
          <canvas ref={boardRef} aria-hidden="true" className="absolute inset-0 size-full" />

          {status !== 'running' && (
            <div
              key={status}
              className="snake-in absolute inset-0 flex flex-col items-center justify-center gap-3 bg-surface/75 p-5 text-center backdrop-blur-[3px] sm:gap-4"
            >
              {status === 'idle' && (
                <>
                  <p className="font-display text-5xl leading-none text-fg">{t.play.tabs.snake}</p>
                  {levelPicker}
                  <button type="button" onClick={start} className={primary}>
                    {t.play.start}
                  </button>
                  <p className={hint}>{t.play.startHint}</p>
                </>
              )}

              {status === 'paused' && (
                <>
                  <p className="font-display text-5xl leading-none text-fg">{t.play.pausedTitle}</p>
                  <p className="text-sm text-muted">{t.play.scoreSoFar(score)}</p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <button type="button" onClick={resume} className={primary}>
                      {t.play.resume}
                    </button>
                    <button type="button" onClick={start} className={secondary}>
                      {t.play.restart}
                    </button>
                  </div>
                  <p className={hint}>{t.play.resumeHint}</p>
                </>
              )}

              {status === 'over' && result && (
                <>
                  <p className={`text-xs font-medium tracking-[0.18em] uppercase ${result.isBest ? 'text-accent' : 'text-muted'}`}>
                    {result.isBest ? t.play.newBest : t.play.overTitle}
                  </p>
                  <p className={`font-display text-7xl leading-none tabular-nums text-fg ${result.isBest ? 'snake-pop' : ''}`}>
                    {result.points}
                  </p>
                  <p className="text-sm text-muted">{t.play.bestLine(bests[level], t.play.levels[level])}</p>
                  {levelPicker}
                  <button type="button" onClick={start} className={primary}>
                    {t.play.again}
                  </button>
                  <p className={hint}>{t.play.againHint}</p>
                </>
              )}
            </div>
          )}

          <canvas ref={fxRef} aria-hidden="true" className="pointer-events-none absolute inset-0 size-full" />
        </div>

        <div role="group" aria-label={t.play.pad} className="mx-auto mt-5 hidden max-w-[13rem] grid-cols-3 gap-2 pointer-coarse:grid">
          {[
            ['up', 'col-start-2', '↑'],
            ['left', 'col-start-1 row-start-2', '←'],
            ['down', 'col-start-2 row-start-2', '↓'],
            ['right', 'col-start-3 row-start-2', '→'],
          ].map(([name, place, arrow]) => (
            <button
              key={name}
              type="button"
              aria-label={t.play[name]}
              // Steers on touch-down rather than on release; keyboard presses still come through click
              onPointerDown={(e) => {
                e.preventDefault()
                press(name)
              }}
              onClick={(e) => e.detail === 0 && press(name)}
              className={`${place} flex h-14 touch-manipulation items-center justify-center rounded-xl border border-line bg-surface text-xl text-fg transition-[transform,background-color] duration-100 select-none active:scale-95 active:bg-fg/10`}
            >
              {arrow}
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={100} className="lg:pt-2">
        <p className="max-w-sm leading-relaxed text-muted">{t.play.intro}</p>

        <dl className="mt-8 grid grid-cols-2 gap-4 border-y border-line py-5">
          {[
            [t.play.score, score, 'score'],
            [`${t.play.best} · ${t.play.levels[level]}`, best || '–', 'best'],
          ].map(([label, value, id]) => (
            <div key={id}>
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="mt-1 font-display text-3xl tabular-nums text-fg">
                <span key={value} className={value && id === 'score' ? 'snake-pop' : undefined}>
                  {value}
                </span>
              </dd>
            </div>
          ))}
        </dl>

        <p role="status" className="mt-5 min-h-12 leading-relaxed text-fg">
          {message}
        </p>

        <div className="mt-2 flex flex-wrap gap-2">
          <button type="button" onClick={toggle} className={secondary}>
            {action}
          </button>
          <button type="button" aria-pressed={!muted} onClick={toggleSound} className={secondary}>
            {t.play.sound}: {muted ? t.play.off : t.play.on}
          </button>
        </div>

        <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">{t.play.controls}</p>
      </Reveal>
    </div>
  )
}
