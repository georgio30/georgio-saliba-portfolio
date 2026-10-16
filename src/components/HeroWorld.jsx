import { useEffect, useRef, useState } from 'react'
import { projects } from '../data/projects'
import { profile } from '../data/resume'
import { pad } from '../lib/motion'
import { useReducedMotion, useTheme } from '../lib/hooks'
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

// Which model stands for which project; a new project gets the workshop desk until it has its own
const KIND = {
  'money-planner': 'bank',
  'saliba-polyclinic': 'clinic',
  iverse: 'shop',
  'recipe-finder': 'kitchen',
  portfolio: 'workshop',
}
// One island per project, then the home island's hangar (the games) and shack (about Georgio)
const ARCADE = projects.length
const ABOUT = projects.length + 1
const SPECS = [
  ...projects.map((p) => ({ kind: KIND[p.slug] ?? 'workshop', tone: p.tone ?? '#e5e3dc' })),
  { kind: 'hangar', tone: '#d9c7b8' },
  { kind: 'shack', tone: '#c9a27e' },
]

// The hero's archipelago: fly the plane to a project's island, land, and open it from there
export default function HeroWorld({ className = '' }) {
  const { t, pick, dir } = useI18n()
  const [dark] = useTheme()
  const reduced = useReducedMotion()
  const wrapRef = useRef(null)
  const canvasRef = useRef(null)
  const labelRefs = useRef([])
  const worldRef = useRef(null)
  const nearRef = useRef(-1)
  // The part of the canvas (in px) where labels may show
  const boundsRef = useRef({ lo: 0, hi: Infinity, h: Infinity, top: 0 })
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)
  const [near, setNear] = useState(-1)
  // Landmarks reached on this visit, for the progress dots and the "what next" links
  const [visited, setVisited] = useState(() => new Set())

  const open = (i) => {
    // The shack's card holds its own links
    if (i === ABOUT) return
    setVisited((v) => new Set(v).add(i))
    if (i === ARCADE) document.getElementById('play')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
    else openProject(projects[i].slug)
  }
  // The world is built once, so its click handler reaches the latest `open` through a ref
  const openRef = useRef(open)
  useEffect(() => {
    openRef.current = open
  })

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
            landmarks: SPECS,
            start: ABOUT,
            reduced,
            onNear: (i) => {
              nearRef.current = i
              setNear(i)
              if (i >= 0) setVisited((v) => (v.has(i) ? v : new Set(v).add(i)))
            },
            onPick: (i) => (nearRef.current === i ? openRef.current(i) : world.goTo(i)),
            onFrame: (points) => {
              // Labels fade out where the world is masked away behind the headline, or off the canvas
              const { lo, hi, h, top } = boundsRef.current
              // The open card hangs above its landmark; keep its top edge below the navbar.
              // Measured before this frame's writes so it doesn't force a layout.
              const cardH = labelRefs.current[nearRef.current]?.firstElementChild?.offsetHeight ?? 0
              points.forEach((p, i) => {
                const el = labelRefs.current[i]
                if (!el) return
                const y = i === nearRef.current ? Math.max(p.y, top + cardH) : p.y
                el.style.translate = `${p.x.toFixed(1)}px ${y.toFixed(1)}px`
                const shown = p.x > lo && p.x < hi && p.y > 30 && p.y < h - 20
                el.style.opacity = shown ? '' : '0'
                el.dataset.hidden = String(!shown)
              })
            },
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

  // The world sits beside the headline, on the side away from the text
  useEffect(() => {
    if (!ready) return
    worldRef.current.setFrame({ focusX: dir === 'rtl' ? 0.31 : 0.69, width: 0.54 })
    const measure = () => {
      const w = wrapRef.current.clientWidth
      const h = wrapRef.current.clientHeight
      // Lowest point of the fixed navbar, in the canvas's own coordinates, plus a little air
      const nav = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0
      const top = nav + 12 - wrapRef.current.getBoundingClientRect().top
      // The headline covers one side; the canvas fades out there (.world-mask)
      boundsRef.current = dir === 'rtl' ? { lo: 0, hi: w * 0.6, h, top } : { lo: w * 0.4, hi: w, h, top }
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => {
      window.removeEventListener('resize', measure)
      window.removeEventListener('scroll', measure)
    }
  }, [ready, dir])

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

  // Pointer: a click or tap on an island flies the plane there; the camera leans toward the mouse
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
      const hit = world.pick(x, y, false)
      world.setHover(typeof hit === 'number' ? hit : -1)
      canvas.style.cursor = hit === null ? '' : 'pointer'
    }
    const onLeave = () => {
      world.setPointer(0, 0)
      world.setHover(-1)
    }
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

  // Keyboard: arrows or WASD steer the plane (up is faster, down slower) while the world has focus.
  // Enter opens the landmark the plane is parked at, or lands on the island it's flying over.
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
    // Arrows steer the plane from the world itself or a landmark, not from the links underneath
    const driving = e.target === wrapRef.current || e.target.dataset.landmark !== undefined
    if (KEYS[e.code] && driving) {
      e.preventDefault()
      held.current.add(e.code)
      applyKeys()
    } else if (e.key === 'Enter' && e.target === wrapRef.current) {
      e.preventDefault()
      if (nearRef.current >= 0) open(nearRef.current)
      else worldRef.current?.land()
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

  const titleOf = (i) => (i === ARCADE ? t.world.arcade.title : i === ABOUT ? t.world.about.label : pick(projects[i].title))
  const seen = [...visited].filter((i) => i < ARCADE).length
  const done = seen === projects.length
  const resume = profile.resume ? { href: profile.resume, label: t.world.resume } : { href: '#experience', label: t.nav.experience }
  const link = 'pointer-events-auto link text-fg'

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
      // No focus ring: it would frame the whole first screen and cut through the headline's buttons.
      // Focus shows in the keyboard hint under the world instead.
      className={`group/world focus-visible:outline-none ${className}`}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className={`world-mask absolute inset-0 h-full w-full touch-pan-y transition-opacity duration-1000 ease-out ${ready ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Labels float over the landmarks; they're real buttons, so Tab walks the island too */}
      <ol className={`transition-opacity delay-500 duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}>
        {SPECS.map((spec, i) => {
          const here = near === i
          const arcade = i === ARCADE
          const about = i === ABOUT
          if (about && here) {
            return (
              <li key="about" ref={(el) => (labelRefs.current[i] = el)} className="pointer-events-none absolute top-0 left-0 z-10">
                <div
                  role="region"
                  aria-label={t.world.about.title}
                  className="world-card pointer-events-auto w-72 -translate-x-1/2 -translate-y-full rounded-[10px] border border-accent/60 bg-surface/95 p-4 text-start shadow-[0_18px_40px_-20px_rgb(40_25_10/0.5)] backdrop-blur-sm"
                >
                  <p className="font-display text-xl leading-tight text-fg">{t.world.about.title}</p>
                  <p className="mt-2 text-xs leading-relaxed text-muted">{t.world.about.text}</p>
                  <p className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs font-medium">
                    <a href={resume.href} className="link text-fg" {...(profile.resume ? { target: '_blank', rel: 'noreferrer' } : {})}>
                      {resume.label}
                    </a>
                    <a href="#contact" className="link text-fg">
                      {t.nav.contact}
                    </a>
                    <a href="#work" className="link text-accent">
                      {t.world.about.projects}
                    </a>
                  </p>
                  <p className="mt-3 text-[0.7rem] text-muted">{t.world.about.hint}</p>
                </div>
              </li>
            )
          }
          const label = about
            ? t.world.about.goTo
            : arcade
            ? here
              ? t.world.arcade.play
              : t.world.arcade.goTo
            : here
              ? t.work.openProject(pad(i + 1), titleOf(i))
              : t.work.goTo(pad(i + 1), titleOf(i))
          return (
            <li
              key={about ? 'about' : arcade ? 'arcade' : projects[i].slug}
              ref={(el) => (labelRefs.current[i] = el)}
              // Physical left/top: the position comes from the canvas, which doesn't mirror
              className={`pointer-events-none absolute top-0 left-0 ${here ? 'z-10' : ''}`}
            >
              <button
                type="button"
                data-landmark=""
                onClick={() => (here ? open(i) : worldRef.current?.goTo(i))}
                onFocus={(e) => e.currentTarget.matches(':focus-visible') && worldRef.current?.goTo(i)}
                aria-label={label}
                className={`pointer-events-auto block -translate-x-1/2 -translate-y-full border text-start shadow-sm backdrop-blur-sm transition-[background-color,border-color,border-radius,box-shadow] duration-300 ease-out ${
                  here
                    ? 'rounded-[10px] lg:w-64 border-accent/60 bg-surface/95 p-3.5 shadow-[0_18px_40px_-20px_rgb(40_25_10/0.5)]'
                    : 'rounded-full border-line bg-ink/80 px-3 py-1.5 hover:border-fg/30'
                }`}
              >
                <span className="flex items-center gap-2 text-xs whitespace-nowrap text-fg">
                  {!arcade && !about && (
                    <span className="tabular-nums opacity-60" dir="ltr">
                      {pad(i + 1)}
                    </span>
                  )}
                  <span className={here ? 'font-medium' : ''}>{titleOf(i)}</span>
                  {visited.has(i) && !here && (
                    <span aria-hidden="true" className="text-accent">
                      ✓
                    </span>
                  )}
                </span>
                {here && (
                  <span className="world-card block whitespace-normal">
                    <span className="mt-1.5 block text-xs leading-relaxed text-muted">
                      {arcade ? t.world.arcade.summary : pick(projects[i].summary)}
                    </span>
                    <span aria-hidden="true" className="mt-2.5 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                      {arcade ? t.world.arcade.open : t.world.open} <span className="inline-block rtl:-scale-x-100">{arcade ? '↓' : '→'}</span>
                    </span>
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ol>

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-3 flex flex-col items-center gap-2 px-5 text-center text-xs text-muted transition-opacity delay-700 duration-700 lg:start-auto lg:bottom-8 lg:w-[60%] ${
          ready ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <p id="world-hint">
          {done ? (
            t.world.done
          ) : (
            <>
              {t.world.hint}
              <span className="mx-2 hidden opacity-50 group-focus-visible/world:inline">·</span>
              <span className="hidden group-focus-visible/world:inline">{t.world.hintKeys}</span>
            </>
          )}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-2">
            <span aria-hidden="true" className="flex gap-1">
              {projects.map((p, i) => (
                <span key={p.slug} className={`size-1.5 rounded-full transition-colors duration-500 ${visited.has(i) ? 'bg-accent' : 'bg-line'}`} />
              ))}
            </span>
            <span className="tabular-nums">{t.world.visited(seen, projects.length)}</span>
          </span>
          <a href="#work" className={link}>
            {t.world.skip} <span aria-hidden="true">↓</span>
          </a>
        </div>
        {seen > 0 && (
          <p className="world-card flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            <span>{done ? t.world.nextDone : t.world.next}</span>
            <a href={profile.github} target="_blank" rel="noreferrer" className={link}>
              GitHub <span aria-hidden="true" className="inline-block rtl:-scale-x-100">↗</span>
            </a>
            <a href={resume.href} className={link} {...(profile.resume ? { target: '_blank', rel: 'noreferrer' } : {})}>
              {resume.label}
            </a>
            <a href="#contact" className={link}>
              {t.nav.contact}
            </a>
          </p>
        )}
      </div>

      <p className="sr-only" aria-live="polite">
        {near >= 0 ? (near === ARCADE ? t.world.arcade.arrived : near === ABOUT ? t.world.about.arrived : t.world.arrived(titleOf(near))) : ''}
      </p>
    </div>
  )
}
