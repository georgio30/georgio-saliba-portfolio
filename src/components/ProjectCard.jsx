import { useRef } from 'react'
import Screenshot from './Screenshot'
import { ProjectCover } from './ProjectCover'

// The project's face: its first screenshot, or a generated cover
export function ProjectVisual({ project, number, eager }) {
  const shot = project.screenshots[0]
  return shot ? (
    <Screenshot
      shot={shot}
      phone={project.screenshots.find((s) => s.phone)}
      eager={eager}
      sizes="(min-width: 768px) 880px, 90vw"
    />
  ) : (
    <ProjectCover project={project} number={number} />
  )
}

export default function ProjectCard({ project, number, onOpen, onFocus, eager = false, interactive = true }) {
  const tiltRef = useRef(null)
  const pillRef = useRef(null)

  // Depth on hover: tilt a few degrees toward the pointer and drift the image
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse' || !interactive) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    tiltRef.current.style.setProperty('--rx', `${(-y * 5).toFixed(2)}deg`)
    tiltRef.current.style.setProperty('--ry', `${(x * 6).toFixed(2)}deg`)
    tiltRef.current.style.setProperty('--mx', `${(-x * 14).toFixed(1)}px`)
    tiltRef.current.style.setProperty('--my', `${(-y * 10).toFixed(1)}px`)
    pillRef.current.style.translate = `${e.clientX - rect.left}px ${e.clientY - rect.top}px`
  }

  const onPointerLeave = () => {
    for (const prop of ['--rx', '--ry', '--mx', '--my']) tiltRef.current.style.removeProperty(prop)
  }

  return (
    <button
      type="button"
      onClick={onOpen}
      onFocus={onFocus}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      aria-label={`Open project ${number}: ${project.title}`}
      className="group block w-full cursor-pointer text-left [perspective:1200px] focus-visible:outline-offset-8"
    >
      <div
        ref={tiltRef}
        className="relative transition-transform duration-500 ease-out [transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))] group-hover:[transform:rotateX(var(--rx,0deg))_rotateY(var(--ry,0deg))_translateZ(14px)]"
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[6px] md:aspect-[16/10] border border-line bg-surface shadow-[0_1px_2px_rgb(0_0_0/0.04),0_24px_48px_-28px_rgb(60_40_20/0.28)]">
          <div className="absolute -inset-4 transition-transform duration-700 ease-out [transform:translate(var(--mx,0px),var(--my,0px))]">
            <ProjectVisual project={project} number={number} eager={eager} />
          </div>
        </div>

        {/* Follows the cursor on desktop */}
        <span
          ref={pillRef}
          aria-hidden="true"
          className="pointer-events-none absolute top-0 left-0 hidden -translate-x-1/2 -translate-y-1/2 scale-75 rounded-full bg-fg px-4 py-2 text-xs font-medium whitespace-nowrap text-ink opacity-0 transition-[opacity,scale] duration-300 ease-out group-hover:scale-100 group-hover:opacity-100 pointer-fine:block"
        >
          View project
        </span>
      </div>

      <span className="mt-5 flex flex-wrap items-baseline [opacity:var(--meta,1)] justify-between gap-x-6 gap-y-2 md:mt-6">
        <div className="flex items-baseline gap-4">
          <span className="text-sm tabular-nums text-muted">{number}</span>
          <span className="font-display text-2xl leading-tight text-fg md:text-3xl">{project.title}</span>
          {project.note && (
            <span className="hidden rounded-full border border-line px-2.5 py-0.5 text-xs text-muted sm:inline">
              {project.note}
            </span>
          )}
        </div>
        <span className="inline-flex items-center gap-2 text-sm font-medium text-fg">
          Explore
          <span aria-hidden="true" className="text-accent transition-transform duration-300 ease-out group-hover:translate-x-1">
            →
          </span>
        </span>
      </span>
      <span className="mt-2 block pl-8 [opacity:var(--meta,1)] text-sm text-muted md:pl-9">{project.technologies.join(' · ')}</span>
    </button>
  )
}
