import { useEffect, useRef, useState } from 'react'
import ProjectCard from './ProjectCard'
import ProjectModal from './ProjectModal'
import { projects } from '../data/projects'
import { useMediaQuery, useReducedMotion } from '../lib/hooks'

const pad = (n) => String(n).padStart(2, '0')
const clamp = (v, min, max) => Math.min(max, Math.max(min, v))

// Scroll length per project and the pause before the first / after the last, in screen heights
const STEP = 0.9
const DWELL = 0.35
const LAST = projects.length - 1
const TOTAL = LAST * STEP + 2 * DWELL

// Where a card sits in the scene, from its distance to the front of the stage.
// d > 0: still ahead, waiting further back and a little higher.
// d < 0: already passed, drifting back and off to one side.
function place(d, side, compact) {
  const k = compact ? 0.5 : 1
  if (d >= 0) {
    const z = -d * 620 * k
    return {
      z,
      transform: `translate3d(0, ${-d * 130 * k}px, ${z}px) rotateX(${compact ? 0 : d * 3}deg)`,
      opacity: d < 1.2 ? 1 : clamp(1 - (d - 1.2) * 0.8, 0, 1),
    }
  }
  const a = -d
  // Sinks back fast, so it drops behind the card that is taking its place
  const z = -a * 1100 * k
  return {
    z,
    transform: `translate3d(${side * a * (compact ? 30 : 40)}vw, ${a * 30}px, ${z}px) rotateY(${-side * a * (compact ? 6 : 16)}deg)`,
    opacity: clamp(1 - (a - 0.4) * 1.8, 0, 1),
  }
}

function sectionScroll(section) {
  const range = section.offsetHeight - window.innerHeight
  const top = section.getBoundingClientRect().top + window.scrollY
  return { range, top }
}

export default function ProjectShowcase() {
  const reduced = useReducedMotion()
  const compact = !useMediaQuery('(min-width: 768px)')
  const [open, setOpen] = useState(null)

  const sectionRef = useRef(null)
  const cardRefs = useRef([])
  const counterRef = useRef(null)
  const barRef = useRef(null)
  const hintRef = useRef(null)

  useEffect(() => {
    if (reduced) return
    let frame = 0

    const update = () => {
      frame = 0
      const section = sectionRef.current
      const { range } = sectionScroll(section)
      const u = clamp(-section.getBoundingClientRect().top / range, 0, 1) * TOTAL
      const p = clamp((u - DWELL) / STEP, 0, LAST)

      cardRefs.current.forEach((el, i) => {
        const d = i - p
        const { z, transform, opacity } = place(d, i % 2 ? 1 : -1, compact)
        el.style.transform = transform
        el.style.opacity = opacity
        // Nearer cards on top, even where the browser doesn't depth-sort 3D layers
        el.style.zIndex = String(Math.round(2000 + z))
        // Only the card at the front shows its title underneath
        el.style.setProperty('--meta', clamp(1 - Math.abs(d) * 3, 0, 1))
        el.style.pointerEvents = Math.abs(d) < 0.3 ? 'auto' : 'none'
      })
      counterRef.current.textContent = pad(Math.round(p) + 1)
      barRef.current.style.transform = `scaleX(${LAST ? p / LAST : 1})`
      hintRef.current.style.opacity = p < 0.15 ? 1 : 0
    }

    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
    }
  }, [reduced, compact])

  // Tabbing to a card that's still in the distance brings it to the front
  const bringForward = (i) => (e) => {
    if (reduced || !e.currentTarget.matches(':focus-visible')) return
    const { range, top } = sectionScroll(sectionRef.current)
    window.scrollTo({ top: top + ((DWELL + i * STEP) / TOTAL) * range, behavior: 'smooth' })
  }

  const modal = open !== null && (
    <ProjectModal
      projects={projects}
      index={open}
      onIndexChange={setOpen}
      onClose={() => setOpen(null)}
    />
  )

  if (reduced) {
    return (
      <section id="work" aria-label="Selected work" className="mx-auto max-w-4xl px-5 py-24 sm:px-8">
        <p className="mb-12 text-sm text-muted">Selected work</p>
        <ol className="space-y-20">
          {projects.map((project, i) => (
            <li key={project.slug}>
              <ProjectCard project={project} number={pad(i + 1)} onOpen={() => setOpen(i)} eager={i === 0} />
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
      aria-label="Selected work"
      className="relative"
      style={{ height: `${100 + TOTAL * 100}vh` }}
    >
      <div className="sticky top-0 h-[100svh] overflow-clip">
        <div className="absolute inset-x-0 top-20 z-[3000] mx-auto flex max-w-6xl items-baseline justify-between px-5 text-sm text-muted sm:px-8 md:top-24">
          <span>Selected work</span>
          <span className="tabular-nums" aria-hidden="true">
            <span ref={counterRef} className="text-fg">
              01
            </span>{' '}
            / {pad(projects.length)}
          </span>
        </div>

        <ol
          className={`pointer-events-none grid h-full place-items-center pt-10 md:pt-24 ${
            compact ? '[perspective:900px]' : '[perspective:1400px]'
          } [perspective-origin:50%_35%] [transform-style:preserve-3d]`}
        >
          {projects.map((project, i) => (
            <li
              key={project.slug}
              ref={(el) => (cardRefs.current[i] = el)}
              className="w-[min(88vw,calc((100svh-15rem)*0.8))] [grid-area:1/1] md:w-[min(880px,88vw,calc((100svh-15rem)*1.6))] [transform-style:preserve-3d] will-change-transform"
            >
              <ProjectCard
                project={project}
                number={pad(i + 1)}
                onOpen={() => setOpen(i)}
                onFocus={bringForward(i)}
                eager={i < 2}
              />
            </li>
          ))}
        </ol>

        <div className="absolute inset-x-0 bottom-8 z-[3000] mx-auto flex max-w-6xl items-center gap-6 px-5 sm:px-8">
          <div className="relative h-px flex-1 bg-line">
            <div ref={barRef} className="absolute inset-0 origin-left scale-x-0 bg-accent" />
          </div>
          <span ref={hintRef} aria-hidden="true" className="text-xs text-muted transition-opacity duration-500">
            Keep scrolling
          </span>
        </div>
      </div>
      {modal}
    </section>
  )
}
