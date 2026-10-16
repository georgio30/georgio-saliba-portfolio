import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import { pad } from '../lib/motion'
import { useMediaQuery, useReducedMotion, useTheme } from '../lib/hooks'
import { openProject } from '../lib/island'
import { useI18n } from '../i18n'

const KEYS = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
}

const themeColors = () => {
  const css = getComputedStyle(document.documentElement)
  const v = (name) => css.getPropertyValue(`--color-${name}`).trim()
  return { surface: v('surface'), line: v('line'), fg: v('fg'), muted: v('muted'), accent: v('accent') }
}

// The hero's island: roll a ball to a project's landmark and open it from there
export default function HeroWorld({ className = '' }) {
  const { t, pick, dir } = useI18n()
  const [dark] = useTheme()
  const reduced = useReducedMotion()
  const wide = useMediaQuery('(min-width: 1024px)')
  const finePointer = useMediaQuery('(pointer: fine)')
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const labelRefs = useRef([])
  const worldRef = useRef(null)
  const nearRef = useRef(-1)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [near, setNear] = useState(-1)

  // Load three.js and build the world once the browser has a quiet moment after first paint
  useEffect(() => {
    let world = null
    let cancelled = false
    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200))
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout
    const handle = idle(() => {
      import('../lib/world')
        .then(({ createWorld }) => {
          if (cancelled) return
          world = createWorld(canvasRef.current, {
            count: projects.length,
            tones: projects.map((p) => p.tone ?? '#e5e3dc'),
            reduced,
            onNear: (i) => {
              nearRef.current = i
              setNear(i)
            },
            onPick: (i) => (nearRef.current === i ? openProject(projects[i].slug) : world.goTo(i)),
            onFrame: (points) =>
              points.forEach((p, i) => {
                const el = labelRefs.current[i]
                if (el) el.style.translate = `${p.x.toFixed(1)}px ${p.y.toFixed(1)}px`
              }),
          })
          worldRef.current = world
          setReady(true)
        })
        .catch(() => !cancelled && setFailed(true))
    })
    return () => {
      cancelled = true
      cancelIdle(handle)
      world?.dispose()
      worldRef.current = null
      setReady(false)
    }
    // Rebuilt when reduced motion changes; everything else is updated in place below
  }, [reduced])

  // Colours follow the theme
  useEffect(() => {
    if (ready) worldRef.current.setTheme(themeColors(), dark)
    worldRef.current?.start()
  }, [ready, dark])

  // On wide screens the island sits beside the headline, on the side away from the text
  useEffect(() => {
    if (!ready) return
    worldRef.current.setFrame(wide ? { focusX: dir === 'rtl' ? 0.3 : 0.7, width: 0.44 } : { focusX: 0.5, width: 0.98 })
  }, [ready, wide, dir])

  // Size, and only running while it's on screen and the tab is visible
  useEffect(() => {
    if (!ready) return
    const world = worldRef.current
    const wrap = wrapRef.current
    let visible = true
    const resize = () => world.resize(wrap.clientWidth, wrap.clientHeight)
    const sync = () => (visible && !document.hidden ? world.start() : world.stop())
    const ro = new ResizeObserver(resize)
    ro.observe(wrap)
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      sync()
    })
    io.observe(wrap)
    document.addEventListener('visibilitychange', sync)
    resize()
    sync()
    return () => {
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', sync)
    }
  }, [ready])

  // Pointer: a click or tap rolls the ball there; the camera leans toward the mouse
  useEffect(() => {
    if (!ready) return
    const world = worldRef.current
    const canvas = canvasRef.current
    let down = null
    const local = (e) => {
      const r = canvas.getBoundingClientRect()
      return [e.clientX - r.left, e.clientY - r.top, r]
    }
    const onDown = (e) => (down = { x: e.clientX, y: e.clientY })
    const onUp = (e) => {
      // A drag or a scroll swipe isn't a tap
      if (!down || Math.hypot(e.clientX - down.x, e.clientY - down.y) > 10) return
      down = null
      const [x, y] = local(e)
      world.pick(x, y)
    }
    const onMove = (e) => {
      if (e.pointerType !== 'mouse') return
      const [x, y, r] = local(e)
      if (!reduced) world.setPointer(x / r.width - 0.5, y / r.height - 0.5)
      canvas.style.cursor = world.pick(x, y, false) ? 'pointer' : ''
    }
    const onLeave = () => world.setPointer(0, 0)
    canvas.addEventListener('pointerdown', onDown)
    canvas.addEventListener('pointerup', onUp)
    canvas.addEventListener('pointermove', onMove)
    canvas.addEventListener('pointerleave', onLeave)
    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      canvas.removeEventListener('pointerup', onUp)
      canvas.removeEventListener('pointermove', onMove)
      canvas.removeEventListener('pointerleave', onLeave)
    }
  }, [ready, reduced])

  // Keyboard: arrows or WASD roll the ball while the island has focus, Enter opens the landmark it's at
  const held = useRef(new Set())
  const applyKeys = () => {
    let x = 0
    let z = 0
    held.current.forEach((code) => {
      x += KEYS[code][0]
      z += KEYS[code][1]
    })
    const len = Math.hypot(x, z) || 1
    worldRef.current?.setInput(x / len, z / len)
  }
  const onKeyDown = (e) => {
    if (e.altKey || e.ctrlKey || e.metaKey) return
    if (KEYS[e.code]) {
      e.preventDefault()
      held.current.add(e.code)
      applyKeys()
    } else if (e.key === 'Enter' && e.target === wrapRef.current && nearRef.current >= 0) {
      e.preventDefault()
      openProject(projects[nearRef.current].slug)
    }
  }
  const onKeyUp = (e) => {
    if (!held.current.delete(e.code)) return
    applyKeys()
  }
  const release = () => {
    held.current.clear()
    applyKeys()
  }

  if (failed) return null

  const nearProject = projects[near]

  return (
    <div
      ref={wrapRef}
      role="group"
      tabIndex={0}
      aria-roledescription={t.world.role}
      aria-label={t.world.label}
      aria-describedby="world-hint"
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
      onBlur={release}
      className={`group/world focus-visible:rounded-[10px] focus-visible:outline-offset-[-10px] ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`absolute inset-0 h-full w-full touch-pan-y transition-opacity duration-1000 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Labels float over the landmarks; they're real buttons, so Tab walks the island too */}
      <ol className={`transition-opacity delay-500 duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        {projects.map((project, i) => {
          const here = near === i
          return (
            <li
              key={project.slug}
              ref={(el) => (labelRefs.current[i] = el)}
              // Physical left/top: the position comes from the canvas, which doesn't mirror
              className="pointer-events-none absolute top-0 left-0"
            >
              <button
                type="button"
                onClick={() => (here ? openProject(project.slug) : worldRef.current?.goTo(i))}
                onFocus={(e) => e.currentTarget.matches(':focus-visible') && worldRef.current?.goTo(i)}
                aria-label={here ? t.work.openProject(pad(i + 1), pick(project.title)) : t.work.goTo(pad(i + 1), pick(project.title))}
                className={`pointer-events-auto flex -translate-x-1/2 -translate-y-full items-center gap-2 rounded-full border px-3 py-1.5 text-xs whitespace-nowrap shadow-sm backdrop-blur-sm transition-[background-color,color,border-color,scale] duration-300 ease-out ${
                  here
                    ? 'scale-105 border-accent bg-accent text-on-accent'
                    : 'border-line bg-ink/80 text-fg hover:border-fg/30'
                }`}
              >
                <span className="tabular-nums opacity-60" dir="ltr">
                  {pad(i + 1)}
                </span>
                {pick(project.title)}
                {here && (
                  <span aria-hidden="true" className="font-medium">
                    {t.world.open} <span className="inline-block rtl:-scale-x-100">→</span>
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      <p
        id="world-hint"
        className={`pointer-events-none absolute inset-x-0 bottom-4 text-center text-xs text-muted transition-opacity delay-700 duration-700 lg:bottom-10 ${
          ready ? 'opacity-100' : 'opacity-0'
        } lg:start-auto lg:w-[58%]`}
      >
        {finePointer ? t.world.hintMouse : t.world.hintTouch}
        <span className="mx-2 hidden opacity-50 group-focus-visible/world:inline">·</span>
        <span className="hidden group-focus-visible/world:inline">{t.world.hintKeys}</span>
      </p>

      <p className="sr-only" aria-live="polite">
        {nearProject ? t.world.arrived(pick(nearProject.title)) : ''}
      </p>
    </div>
  )
}
