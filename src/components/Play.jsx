import { useCallback, useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import Section from './Section'
import { useTheme } from '../lib/hooks'
import { useI18n } from '../i18n'

// Every bite is one of the tools this site and its projects are built with
const TECH = ['React', 'TypeScript', 'Node.js', 'Express', 'MySQL', 'JWT', 'Tailwind', 'Vite']
const CELLS = 16
const PX = 40 // canvas pixels per cell; CSS scales the canvas to fit

const DIRS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}
const KEYS = {
  ArrowUp: 'up', w: 'up', W: 'up',
  ArrowDown: 'down', s: 'down', S: 'down',
  ArrowLeft: 'left', a: 'left', A: 'left',
  ArrowRight: 'right', d: 'right', D: 'right',
}

function spawnFood(snake) {
  const free = []
  for (let x = 0; x < CELLS; x++) for (let y = 0; y < CELLS; y++) if (!snake.some((c) => c.x === x && c.y === y)) free.push({ x, y })
  return free[Math.floor(Math.random() * free.length)]
}

function fresh() {
  const snake = [{ x: 8, y: 8 }, { x: 7, y: 8 }, { x: 6, y: 8 }]
  // `queue` holds turns waiting for the next steps, so quick double taps aren't lost
  return { snake, dir: DIRS.right, queue: [], food: spawnFood(snake) }
}

function loadBest() {
  try {
    return Number(localStorage.getItem('snake-best')) || 0
  } catch {
    return 0
  }
}

export default function Play() {
  const { t } = useI18n()
  const [dark] = useTheme()
  const [status, setStatus] = useState('idle') // idle | running | paused | over
  const [score, setScore] = useState(0)
  const [saved, setSaved] = useState(loadBest)
  const [message, setMessage] = useState('')
  // The board changes every tick, so it lives in a ref rather than in React state
  const game = useRef(null)
  const canvasRef = useRef(null)
  const wrapRef = useRef(null)
  const swipe = useRef(null)
  const best = Math.max(saved, score)
  // Gets quicker as you eat, down to a floor
  const speed = Math.max(70, 140 - score * 4)

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const css = getComputedStyle(document.documentElement)
    const color = (name) => css.getPropertyValue(name).trim()
    const { snake, food } = game.current

    ctx.fillStyle = color('--color-surface')
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = color('--color-accent')
    ctx.beginPath()
    ctx.arc((food.x + 0.5) * PX, (food.y + 0.5) * PX, PX * 0.32, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = color('--color-fg')
    snake.forEach((cell, i) => {
      ctx.globalAlpha = i === 0 ? 1 : 0.8
      ctx.beginPath()
      ctx.roundRect(cell.x * PX + 3, cell.y * PX + 3, PX - 6, PX - 6, 8)
      ctx.fill()
    })
    ctx.globalAlpha = 1
  }, [])

  // Set up the board, paint it, and paint again when the theme flips
  useEffect(() => {
    game.current ??= fresh()
    draw()
  }, [draw, dark])

  const step = useCallback(() => {
    const g = game.current
    if (g.queue.length) g.dir = g.queue.shift()
    const head = { x: g.snake[0].x + g.dir.x, y: g.snake[0].y + g.dir.y }
    const eating = head.x === g.food.x && head.y === g.food.y
    // The tail moves out of the way unless the snake just grew
    const body = eating ? g.snake : g.snake.slice(0, -1)
    const crashed =
      head.x < 0 || head.y < 0 || head.x >= CELLS || head.y >= CELLS || body.some((c) => c.x === head.x && c.y === head.y)

    if (crashed) {
      const eaten = g.snake.length - 3
      setStatus('over')
      setMessage(t.play.over(eaten))
      setSaved((prev) => {
        const next = Math.max(prev, eaten)
        try {
          localStorage.setItem('snake-best', String(next))
        } catch {
          // Storage unavailable — the best score just isn't remembered
        }
        return next
      })
      return
    }

    g.snake.unshift(head)
    if (eating) {
      const eaten = g.snake.length - 3
      g.food = spawnFood(g.snake)
      setScore(eaten)
      setMessage(t.play.ate(TECH[(eaten - 1) % TECH.length]))
    } else {
      g.snake.pop()
    }
    draw()
  }, [draw, t])

  useEffect(() => {
    if (status !== 'running') return
    const timer = setInterval(step, speed)
    return () => clearInterval(timer)
  }, [status, speed, step])

  // The game never keeps running out of sight
  useEffect(() => {
    if (status !== 'running') return
    const pause = () => {
      setStatus('paused')
      setMessage(t.play.paused)
    }
    const observer = new IntersectionObserver(([entry]) => !entry.isIntersecting && pause(), { threshold: 0.2 })
    observer.observe(wrapRef.current)
    const onVisibility = () => document.hidden && pause()
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      observer.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [status, t])

  const start = () => {
    if (status === 'over') {
      game.current = fresh()
      setScore(0)
      draw()
    }
    setStatus('running')
    setMessage('')
  }

  const toggle = () => {
    if (status === 'running') {
      setStatus('paused')
      setMessage(t.play.paused)
    } else {
      start()
    }
  }

  const turn = (name) => {
    const next = DIRS[name]
    const g = game.current
    const last = g.queue.at(-1) ?? g.dir
    const reverse = next.x === -last.x && next.y === -last.y
    const same = next.x === last.x && next.y === last.y
    if (!reverse && !same && g.queue.length < 2) g.queue.push(next)
  }

  const press = (name) => {
    if (status !== 'running') start()
    // A fresh game starts heading right, so a turn is judged against that
    turn(name)
  }

  const onKeyDown = (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return
    if (KEYS[e.key]) {
      e.preventDefault()
      press(KEYS[e.key])
    } else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault()
      toggle()
    }
  }

  // Swipe on the board to steer; a tap on a touch screen starts or pauses
  const onPointerDown = (e) => {
    swipe.current = { x: e.clientX, y: e.clientY }
    wrapRef.current.focus({ preventScroll: true })
  }
  const onPointerUp = (e) => {
    const from = swipe.current
    swipe.current = null
    if (!from) return
    const dx = e.clientX - from.x
    const dy = e.clientY - from.y
    if (Math.max(Math.abs(dx), Math.abs(dy)) < 24) {
      if (e.pointerType !== 'mouse') toggle()
      return
    }
    press(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? 'right' : 'left') : dy > 0 ? 'down' : 'up')
  }

  const overlay = status === 'idle' ? t.play.ready : status === 'running' ? '' : message
  const action = status === 'running' ? t.play.pause : status === 'paused' ? t.play.resume : status === 'over' ? t.play.again : t.play.start

  return (
    <Section id="play" label={t.play.label} title={t.play.title}>
      <div className="grid gap-12 lg:grid-cols-[1fr_20rem] lg:gap-16">
        <Reveal>
          <div
            ref={wrapRef}
            tabIndex={0}
            role="group"
            aria-label={t.play.board}
            onKeyDown={onKeyDown}
            onPointerDown={onPointerDown}
            onPointerUp={onPointerUp}
            className="relative mx-auto aspect-square w-full max-w-md touch-none overflow-hidden rounded-[10px] border border-line lg:mx-0"
          >
            <canvas ref={canvasRef} width={CELLS * PX} height={CELLS * PX} aria-hidden="true" className="size-full" />
            {overlay && (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center bg-ink/70 p-6 text-center font-display text-2xl leading-snug text-fg backdrop-blur-[2px] rtl:leading-[1.6]"
              >
                {overlay}
              </div>
            )}
          </div>

          <div role="group" aria-label={t.play.pad} className="mx-auto mt-5 hidden max-w-[11rem] grid-cols-3 gap-2 pointer-coarse:grid">
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
                onClick={() => press(name)}
                className={`${place} flex h-12 items-center justify-center rounded-lg border border-line text-lg text-fg transition-colors duration-200 active:bg-fg/10`}
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
              [t.play.score, score],
              [t.play.best, best || '–'],
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
            onClick={toggle}
            className="mt-2 rounded-full border border-line px-5 py-2.5 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30 hover:bg-fg/5"
          >
            {action}
          </button>

          <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted">{t.play.controls}</p>
        </Reveal>
      </div>
    </Section>
  )
}
