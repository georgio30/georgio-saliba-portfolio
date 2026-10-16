import { useEffect, useMemo, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import ProjectCard, { ProjectVisual } from './ProjectCard'
import ProjectModal from './ProjectModal'
import Reveal from './Reveal'
import Words from './Words'
import { categories, projects } from '../data/projects'
import { useMediaQuery, useReducedMotion } from '../lib/hooks'
import { clamp, ease, pad } from '../lib/motion'
import { useI18n } from '../i18n'

// The preview's image and the case study's gallery share this name, so the browser morphs one into the other
const MORPH = 'project-visual'

// 'all', 'category:<id>' or 'tech:<name>'
function matches(project, filter) {
  const [kind, value] = filter.split(/:(.*)/)
  if (kind === 'category') return project.category === value
  if (kind === 'tech') return project.technologies.includes(value)
  return true
}

const number = (project) => pad(projects.indexOf(project) + 1)

function Filters({ filter, onChange, count }) {
  const { t, pick } = useI18n()
  const tech = filter.startsWith('tech:') ? filter.slice(5) : null
  const chip = (active) =>
    `inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition-colors duration-200 sm:px-3 sm:text-sm ${
      active ? 'border-fg bg-fg text-ink' : 'border-line text-muted hover:border-fg/30 hover:text-fg'
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

// One line of the list: number, title, what it is, the stack and the year
function ProjectRow({ project, onOpen, onEnter }) {
  const { t, pick } = useI18n()
  const title = pick(project.title)
  return (
    <button
      type="button"
      onClick={onOpen}
      onPointerEnter={(e) => e.pointerType === 'mouse' && onEnter(e)}
      onFocus={(e) => e.currentTarget.matches(':focus-visible') && onEnter(e)}
      aria-label={t.work.openProject(number(project), title)}
      className="work-row group grid w-full grid-cols-[2.5rem_1fr_auto] items-baseline gap-x-6 border-t border-line py-7 text-start transition-opacity duration-500 lg:grid-cols-[3rem_1fr_15rem_4rem_2rem] lg:py-9"
    >
      <span className="text-sm tabular-nums text-muted" dir="ltr">
        {number(project)}
      </span>
      <span className="min-w-0">
        <span className="flex flex-wrap items-baseline gap-x-4 gap-y-2">
          <span className="font-display text-4xl leading-[1.05] text-fg transition-[translate,color] duration-500 ease-out group-hover:translate-x-2 group-hover:text-accent group-focus-visible:text-accent lg:text-6xl rtl:group-hover:-translate-x-2">
            {title}
          </span>
          {project.note && <span className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">{pick(project.note)}</span>}
        </span>
        <span className="mt-3 block max-w-xl text-sm leading-relaxed text-muted">{pick(project.summary)}</span>
      </span>
      <span className="hidden text-sm leading-relaxed text-muted lg:block">{project.technologies.slice(0, 4).join(' · ')}</span>
      <span className="hidden text-sm tabular-nums text-muted lg:block" dir="ltr">
        {project.year}
      </span>
      <span
        aria-hidden="true"
        className="self-center text-xl text-muted transition-[translate,color] duration-300 ease-out group-hover:translate-x-1 group-hover:text-accent rtl:-scale-x-100 rtl:group-hover:-translate-x-1"
      >
        →
      </span>
    </button>
  )
}

export default function ProjectShowcase() {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  // The list with a floating preview needs a mouse and some width; phones and tablets get cards
  const list = useMediaQuery('(min-width: 768px) and (hover: hover) and (pointer: fine)')
  const [filter, setFilter] = useState('all')
  const [open, setOpen] = useState(null)
  const [hovered, setHovered] = useState(null)
  // Where the open case study came from: 'island' or 'list'
  const [origin, setOrigin] = useState('list')

  const visible = useMemo(() => projects.filter((p) => matches(p, filter)), [filter])

  const listRef = useRef(null)
  const previewRef = useRef(null)
  const cardRefs = useRef({})
  // Where the preview has eased to, and where it's heading
  const motion = useRef({ x: 0, y: 0, tx: 0, ty: 0, tilt: 0, frame: 0, then: 0, placed: false })

  // The preview trails the pointer, leaning a little into the direction it moves
  const follow = (x, y) => {
    const m = motion.current
    const rect = listRef.current.getBoundingClientRect()
    m.tx = x - rect.left
    m.ty = y - rect.top
    if (!m.placed || reduced) {
      m.x = m.tx
      m.y = m.ty
      m.placed = true
    }
    const step = (now) => {
      m.frame = 0
      const dt = m.then ? Math.min(now - m.then, 64) : 16
      m.then = now
      const k = reduced ? 1 : ease(dt, 90)
      const dx = (m.tx - m.x) * k
      m.x += dx
      m.y += (m.ty - m.y) * k
      m.tilt += (clamp(dx * 0.35, -7, 7) - m.tilt) * (reduced ? 1 : ease(dt, 120))
      const el = previewRef.current
      if (el) el.style.transform = `translate(${m.x.toFixed(1)}px, ${m.y.toFixed(1)}px) translate(-50%, -50%) rotate(${m.tilt.toFixed(2)}deg)`
      const settled = Math.abs(m.tx - m.x) < 0.3 && Math.abs(m.ty - m.y) < 0.3 && Math.abs(m.tilt) < 0.05
      if (settled) m.then = 0
      else m.frame = requestAnimationFrame(step)
    }
    if (!m.frame) m.frame = requestAnimationFrame(step)
  }

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), [])

  const onListMove = (e) => {
    if (e.pointerType === 'mouse') follow(e.clientX, e.clientY)
  }
  const onListLeave = () => {
    setHovered(null)
    motion.current.placed = false
  }
  // Keyboard focus puts the preview beside the row instead of under a pointer
  const onRowEnter = (slug) => (e) => {
    setHovered(slug)
    if (e.type === 'focus') {
      const r = e.currentTarget.getBoundingClientRect()
      motion.current.placed = false
      follow(document.dir === 'rtl' ? r.left + r.width * 0.3 : r.left + r.width * 0.7, r.top + r.height / 2)
    }
  }

  // The element the case study morphs from: the preview on desktop, the card's image on phones
  const visualFor = (slug) => {
    if (list) return hovered === slug ? (previewRef.current?.querySelector(`[data-slug="${slug}"]`) ?? null) : null
    return cardRefs.current[slug]?.querySelector('[data-visual]') ?? null
  }

  const canMorph = () => !reduced && typeof document.startViewTransition === 'function'

  // Opening: the image grows into the case study's gallery
  const openProject = (slug) => {
    setOrigin('list')
    const visual = visualFor(slug)
    if (!canMorph() || !visual) return setOpen(slug)
    visual.style.viewTransitionName = MORPH
    const transition = document.startViewTransition(() => {
      visual.style.viewTransitionName = ''
      flushSync(() => setOpen(slug))
    })
    // A skipped transition (a hidden tab, say) still makes the change, just without the morph
    transition.ready.catch(() => {})
  }

  // Closing: shrinks back into its card on phones. On desktop the pointer has usually moved on,
  // so the case study fades out by itself (returning false says so)
  const morphClose = () => {
    // Opened from the island, it fades out by itself
    const visual = origin === 'island' || list ? null : visualFor(open)
    if (!canMorph() || !visual) return false
    const transition = document.startViewTransition(() => {
      flushSync(() => setOpen(null))
      visual.style.viewTransitionName = MORPH
    })
    transition.ready.catch(() => {})
    transition.finished.finally(() => (visual.style.viewTransitionName = ''))
    return true
  }

  // From the hero's island: open the case study straight away, whatever the filter.
  // No morph here: growing a small rounded label into the gallery looks round before it turns square.
  useEffect(() => {
    const onOpen = (e) => {
      const { slug } = e.detail
      if (!visible.some((p) => p.slug === slug)) setFilter('all')
      setOrigin('island')
      setOpen(slug)
    }
    window.addEventListener('open-project', onOpen)
    return () => window.removeEventListener('open-project', onOpen)
  })

  // Leaving a case study for another part of the page: close it at once, then go there
  const leaveTo = (id) => {
    flushSync(() => setOpen(null))
    document.getElementById(id)?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
  }

  // From a technology tag in a case study: close it and show every project that uses it
  const filterByTech = (tech) => {
    // Synchronously, so the case study has put the page's scroll back before the list is scrolled to
    flushSync(() => setOpen(null))
    setFilter(`tech:${tech}`)
    document.getElementById('work')?.scrollIntoView({ behavior: reduced ? 'instant' : 'smooth' })
  }

  return (
    <section id="work" aria-labelledby="work-title" className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <div className="flex flex-wrap items-end justify-between gap-x-10 gap-y-8">
        <div>
          <p className="text-sm text-muted">{t.work.label}</p>
          <Reveal as="h2" id="work-title" className="rise-on mt-6 max-w-2xl text-balance font-display text-4xl leading-[1.1] text-fg md:text-5xl">
            <Words text={t.work.title} />
          </Reveal>
        </div>
        <Filters filter={filter} onChange={setFilter} count={visible.length} />
      </div>

      {list ? (
        <div ref={listRef} onPointerMove={onListMove} onPointerLeave={onListLeave} className="relative mt-14 md:mt-20">
          <ol key={filter} className="work-list border-b border-line">
            {visible.map((project, i) => (
              <li key={project.slug} className="row-in" style={{ '--i': i }}>
                <ProjectRow project={project} onOpen={() => openProject(project.slug)} onEnter={onRowEnter(project.slug)} />
              </li>
            ))}
          </ol>

          {/* Follows the pointer (physical left/top: it's placed from clientX/Y) */}
          <div
            ref={previewRef}
            aria-hidden="true"
            className="pointer-events-none absolute top-0 left-0 z-10 w-[clamp(16rem,26vw,22rem)] will-change-transform"
          >
            <div
              className={`relative aspect-[16/10] overflow-hidden rounded-[6px] border border-line bg-surface shadow-[0_30px_60px_-28px_rgb(40_25_10/0.45)] transition-[opacity,scale] duration-500 ease-out ${
                hovered ? 'scale-100 opacity-100' : 'scale-90 opacity-0'
              }`}
            >
              {visible.map((project) => (
                <div
                  key={project.slug}
                  data-slug={project.slug}
                  className={`absolute inset-0 transition-opacity duration-300 ${hovered === project.slug ? 'opacity-100' : 'opacity-0'}`}
                >
                  <ProjectVisual project={project} number={number(project)} />
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <ol key={filter} className="mt-12 space-y-16">
          {visible.map((project, i) => (
            <li key={project.slug} ref={(el) => (cardRefs.current[project.slug] = el)} className="row-in" style={{ '--i': i }}>
              <ProjectCard project={project} number={number(project)} onOpen={() => openProject(project.slug)} eager={i === 0} />
            </li>
          ))}
        </ol>
      )}

      {open !== null && (
        <ProjectModal
          projects={visible}
          slug={open}
          onSelect={setOpen}
          onClose={() => setOpen(null)}
          morphClose={morphClose}
          morph={canMorph()}
          onFilterTech={filterByTech}
          origin={origin}
          onLeave={leaveTo}
        />
      )}
    </section>
  )
}
