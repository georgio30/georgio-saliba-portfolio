import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import { categories, projects } from '../data/projects'
import { useMediaQuery, useReducedMotion } from '../lib/hooks'
import { clamp, ease, pad, place } from '../lib/stage'
import { useI18n } from '../i18n'

// Scroll length per project and the pause before the first / after the last, in screen heights
const STEP = 0.9
const DWELL = 0.35
// The card image and the case study's gallery share this name, so the browser morphs one into the other
const MORPH = 'project-visual'
const GLOW =
  'radial-gradient(42rem 30rem at var(--gx, 50%) var(--gy, 42%), color-mix(in oklab, var(--color-accent-soft) 13%, transparent), transparent 70%)'

function sectionScroll(section) {
  const range = section.offsetHeight - window.innerHeight
  const top = section.getBoundingClientRect().top + window.scrollY
  return { range, top }
}

// 'all', 'category:<id>' or 'tech:<name>'
function matches(project, filter) {
  const [kind, value] = filter.split(/:(.*)/)
  if (kind === 'category') return project.category === value
  if (kind === 'tech') return project.technologies.includes(value)
  return true
}

function Filters({ filter, onChange, count }) {
  const { t, pick } = useI18n()
  const tech = filter.startsWith('tech:') ? filter.slice(5) : null
  const chip = (active) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors duration-200 sm:px-3 sm:text-sm ${
      active ? 'border-fg bg-fg text-ink' : 'border-line bg-ink/70 text-muted backdrop-blur-sm hover:border-fg/30 hover:text-fg'
    }`
  const options = [
    { id: 'all', label: t.work.all, n: projects.length },
    ...categories.map((c) => ({
      id: `category:${c.id}`,
      label: pick(c.label),
      n: projects.filter((p) => p.category === c.id).length,
    })),
  ]

  return (
    <>
      <div
        role="group"
        aria-label={t.work.filters}
        className="chip-row -mx-1 flex max-w-full gap-1.5 overflow-x-auto px-1 py-1 [scrollbar-width:none]"
      >
        {options.map((o) => (
          <button key={o.id} type="button" aria-pressed={filter === o.id} onClick={() => onChange(o.id)} className={chip(filter === o.id)}>
            {o.label}
            <span aria-hidden="true" className="hidden tabular-nums opacity-60 min-[400px]:inline">
              {o.n}
            </span>
          </button>
        ))}
        {tech && (
          <button type="button" onClick={() => onChange('all')} aria-label={t.work.clearFilter(tech)} className={chip(true)}>
            {t.work.builtWith(tech)}
            <span aria-hidden="true">×</span>
          </button>
        )}
      </div>
      <p className="sr-only" aria-live="polite">
        {t.work.showing(count)}
      </p>
    </>
  )
}

export default function ProjectShowcase() {
  const { t, pick } = useI18n()
  const reduced = useReducedMotion()
  const compact = !useMediaQuery('(min-width: 768px)')
  const finePointer = useMediaQuery('(pointer: fine)')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)

  const visible = useMemo(() => projects.filter((p) => matches(p, filter)), [filter])
  const last = visible.length - 1
  const total = last * STEP + 2 * DWELL

  const sectionRef = useRef(null)
  const stageRef = useRef(null)
  const sceneRef = useRef(null)
  const cardRefs = useRef([])
  const segmentRefs = useRef([])
  const counterRef = useRef(null)
  const hintRef = useRef(null)
  // Where the gallery has eased to, and where the pointer is (-0.5..0.5), kept across renders
  const motion = useRef({ p: null, mx: 0, my: 0, tx: 0, ty: 0, active: -1 })

  useEffect(() => {
    if (reduced) return
    const m = motion.current
    m.p = null
    m.active = -1
    let frame = 0
    let then = 0

    const update = (now) => {
      frame = 0
      const dt = then ? Math.min(now - then, 64) : 16
      then = now
      const section = sectionRef.current
      const { range } = sectionScroll(section)
      const u = clamp(-section.getBoundingClientRect().top / range, 0, 1) * total
      const target = clamp((u - DWELL) / STEP, 0, last)

      // Glide toward the scroll position instead of jumping to it, for a calmer, filmic move
      m.p = m.p === null ? target : m.p + (target - m.p) * ease(dt, 110)
      if (Math.abs(target - m.p) < 0.0008) m.p = target
      m.mx += (m.tx - m.mx) * ease(dt, 160)
      m.my += (m.ty - m.my) * ease(dt, 160)
      const p = m.p

      cardRefs.current.forEach((el, i) => {
        if (!el) return
        const d = i - p
        const { z, transform, opacity, shade } = place(d, i % 2 ? 1 : -1, compact)
        el.style.transform = transform
        el.style.opacity = opacity
        // Nearer cards on top, even where the browser doesn't depth-sort 3D layers
        el.style.zIndex = String(Math.round(2000 + z))
        // Only the card at the front shows its title underneath
        el.style.setProperty('--meta', clamp(1 - Math.abs(d) * 3, 0, 1))
        el.style.setProperty('--shade', shade)
        el.style.pointerEvents = Math.abs(d) < 0.3 ? 'auto' : 'none'
      })

      // The whole scene leans a little toward the pointer, and the light follows it
      sceneRef.current.style.transform = `rotateX(${(-m.my * 3).toFixed(3)}deg) rotateY(${(m.mx * 4).toFixed(3)}deg)`
      stageRef.current.style.setProperty('--gx', `${(50 + m.mx * 40).toFixed(2)}%`)
      stageRef.current.style.setProperty('--gy', `${(42 + m.my * 30).toFixed(2)}%`)

      const active = Math.round(p)
      segmentRefs.current.forEach((el, i) => {
        if (!el) return
        el.style.setProperty('--fill', clamp(p - i + 1, 0, 1))
        if (active !== m.active) {
          el.dataset.active = String(i === active)
          if (i === active) el.setAttribute('aria-current', 'step')
          else el.removeAttribute('aria-current')
        }
      })
      if (active !== m.active) {
        m.active = active
        counterRef.current.textContent = pad(active + 1)
      }
      hintRef.current.style.opacity = p < 0.15 && last > 0 ? 1 : 0

      const settled = m.p === target && Math.abs(m.tx - m.mx) < 0.001 && Math.abs(m.ty - m.my) < 0.001
      if (!settled) frame = requestAnimationFrame(update)
      else then = 0
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    const onPointer = (e) => {
      if (e.pointerType !== 'mouse') return
      m.tx = e.clientX / window.innerWidth - 0.5
      m.ty = e.clientY / window.innerHeight - 0.5
      schedule()
    }
    const onLeave = () => {
      m.tx = m.ty = 0
      schedule()
    }

    const stage = stageRef.current
    update(performance.now())
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    if (finePointer && !compact) {
      stage.addEventListener('pointermove', onPointer)
      stage.addEventListener('pointerleave', onLeave)
    }
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      stage.removeEventListener('pointermove', onPointer)
      stage.removeEventListener('pointerleave', onLeave)
    }
  }, [reduced, compact, finePointer, last, total])

  const scrollToProject = useCallback(
    (i, behavior = 'smooth') => {
      const { range, top } = sectionScroll(sectionRef.current)
      window.scrollTo({ top: top + ((DWELL + i * STEP) / total) * range, behavior })
    },
    [total],
  )

  // A new filter starts the gallery over at its first project
  const filtered = useRef(false)
  useLayoutEffect(() => {
    if (!filtered.current) return
    filtered.current = false
    const rect = sectionRef.current.getBoundingClientRect()
    if (reduced) {
      if (rect.top < 0) sectionRef.current.scrollIntoView({ behavior: 'instant' })
    } else if (rect.top <= 1) scrollToProject(0, 'instant')
  }, [visible, reduced, scrollToProject])

  const changeFilter = (next) => {
    filtered.current = true
    setFilter(next)
  }

  // Tabbing to a card that's still in the distance brings it to the front
  const bringForward = (i) => (e) => {
    if (reduced || !e.currentTarget.matches(':focus-visible')) return
    scrollToProject(i)
  }

  // The image of the card at the front, if `slug` is that card
  const frontVisual = (slug) => {
    const i = visible.findIndex((p) => p.slug === slug)
    if (i < 0 || (!reduced && Math.abs(i - (motion.current.p ?? 0)) > 0.5)) return null
    return cardRefs.current[i]?.querySelector('[data-visual]') ?? null
  }

  const canMorph = () => !reduced && typeof document.startViewTransition === 'function'

  // Opening: the card's image grows into the case study's gallery
  const openProject = (slug) => {
    const visual = frontVisual(slug)
    if (!canMorph() || !visual) return setOpen(slug)
    visual.style.viewTransitionName = MORPH
    const transition = document.startViewTransition(() => {
      visual.style.viewTransitionName = ''
      flushSync(() => setOpen(slug))
    })
    // A skipped transition (a hidden tab, say) still makes the change, just without the morph
    transition.ready.catch(() => {})
  }

  // Closing: shrinks back into the card when it's still the one at the front.
  // Returns false to let the case study fade out by itself instead.
  const morphClose = () => {
    const visual = frontVisual(open)
    if (!canMorph() || !visual) return false
    const transition = document.startViewTransition(() => {
      flushSync(() => setOpen(null))
      visual.style.viewTransitionName = MORPH
    })
    transition.ready.catch(() => {})
    transition.finished.finally(() => (visual.style.viewTransitionName = ''))
    return true
  }

  // From the hero's island: open a project's case study straight away, whatever the filter
  useEffect(() => {
    const onOpen = (e) => {
      if (!visible.some((p) => p.slug === e.detail)) setFilter('all')
      setOpen(e.detail)
    }
    window.addEventListener('open-project', onOpen)
    return () => window.removeEventListener('open-project', onOpen)
  }, [visible])

  // From a technology tag in a case study: close it and show every project that uses it
  const filterByTech = (tech) => {
    // Synchronously, so the case study has put the page's scroll back before the filter moves it
    flushSync(() => setOpen(null))
    changeFilter(`tech:${tech}`)
  }

  const modal = open !== null && (
    <ProjectModal
      projects={visible}
      slug={open}
      onSelect={setOpen}
      onClose={() => setOpen(null)}
      morphClose={morphClose}
      morph={canMorph()}
      onFilterTech={filterByTech}
    />
  )

  if (reduced) {
    return (
      <section id="work" ref={sectionRef} aria-label={t.work.label} className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <div className="mb-12 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-muted">{t.work.label}</p>
          <Filters filter={filter} onChange={changeFilter} count={visible.length} />
        </div>
        <ol className="space-y-20">
          {visible.map((project, i) => (
            <li key={project.slug}>
              <ProjectCard project={project} number={pad(projects.indexOf(project) + 1)} onOpen={() => setOpen(project.slug)} eager={i === 0} />
            </li>
          ))}
        </ol>
        {modal}
      </section>
    )
  }

  return (
    <section
      id="work"
      ref={sectionRef}
      aria-label={t.work.label}
      className="relative"
      style={{ height: `${100 + total * 100}vh` }}
    >
      <div ref={stageRef} className="sticky top-0 h-[100svh] overflow-clip">
        {/* Soft light behind the cards that drifts with the pointer */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{ background: GLOW }}
        />

        <div className="absolute inset-x-0 top-20 z-[3000] mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 text-sm text-muted sm:px-8 md:top-24">
          <div className="flex min-w-0 items-center gap-4">
            <span className="hidden shrink-0 sm:inline">{t.work.label}</span>
            <Filters filter={filter} onChange={changeFilter} count={visible.length} />
          </div>
          <span className="shrink-0 tabular-nums" aria-hidden="true" dir="ltr">
            <span ref={counterRef} className="text-fg">
              01
            </span>{' '}
            / {pad(visible.length)}
          </span>
        </div>

        <div
          className={`pointer-events-none h-full ${compact ? '[perspective:900px]' : '[perspective:1400px]'} [perspective-origin:50%_35%]`}
        >
          <ol
            key={filter}
            ref={sceneRef}
            className="work-scene grid h-full place-items-center pt-14 pb-12 md:pt-32 md:pb-28 [transform-style:preserve-3d]"
          >
            {visible.map((project, i) => (
              <li
                key={project.slug}
                ref={(el) => (cardRefs.current[i] = el)}
                className="w-[min(88vw,calc((100svh-16rem)*0.8))] [grid-area:1/1] md:w-[min(880px,88vw,calc((100svh-21rem)*1.6))] [transform-style:preserve-3d] will-change-transform"
              >
                <ProjectCard
                  project={project}
                  number={pad(projects.indexOf(project) + 1)}
                  onOpen={() => openProject(project.slug)}
                  onFocus={bringForward(i)}
                  eager={i < 2}
                />
              </li>
            ))}
          </ol>
        </div>

        {/* Progress: one segment per project, filling as it reaches the front; each one jumps there */}
        <div className="absolute inset-x-0 bottom-6 z-[3000] mx-auto flex max-w-6xl items-end gap-6 px-5 sm:px-8 md:bottom-8">
          <ol aria-label={t.work.progress} className="flex flex-1 gap-2 sm:gap-3">
            {visible.map((project, i) => (
              <li key={project.slug} className="min-w-0 flex-1">
                <button
                  ref={(el) => (segmentRefs.current[i] = el)}
                  type="button"
                  onClick={() => scrollToProject(i)}
                  aria-label={t.work.goTo(pad(projects.indexOf(project) + 1), pick(project.title))}
                  className="group block w-full pt-3 pb-1 text-start"
                >
                  <span className="relative block h-0.5 overflow-hidden rounded-full bg-line">
                    <span className="absolute inset-0 origin-left scale-x-[var(--fill,0)] bg-accent rtl:origin-right" />
                  </span>
                  <span className="mt-2 hidden truncate text-xs text-muted transition-colors duration-300 group-hover:text-fg group-data-[active=true]:text-fg md:block">
                    <span className="tabular-nums" dir="ltr">
                      {pad(projects.indexOf(project) + 1)}
                    </span>{' '}
                    {pick(project.title)}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <span ref={hintRef} aria-hidden="true" className="hidden pb-1 text-xs text-muted transition-opacity duration-500 sm:block">
            {t.work.keepScrolling}
          </span>
        </div>
      </div>
      {modal}
    </section>
  )
}
