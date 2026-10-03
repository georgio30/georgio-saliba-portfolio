import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ProjectGallery from './ProjectGallery'
import { gallerySlides } from '../lib/gallery'
import { useReducedMotion } from '../lib/hooks'

const pad = (n) => String(n).padStart(2, '0')

export default function ProjectModal({ projects, index, onIndexChange, onClose }) {
  const project = projects[index]
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(false)
  const [slide, setSlide] = useState(0)
  // Read once, before anything inside the modal takes focus
  const [returnTo] = useState(() => document.activeElement)
  const closeRef = useRef(null)
  const panelRef = useRef(null)
  const duration = reduced ? 0 : 380

  // Open: lock the page behind (keeping its scroll position), make it inert, move focus in
  useEffect(() => {
    const root = document.getElementById('root')
    const scrollY = window.scrollY
    document.documentElement.style.overflow = 'hidden'
    root.inert = true
    closeRef.current.focus({ preventScroll: true })
    const frame = requestAnimationFrame(() => setShown(true))

    return () => {
      cancelAnimationFrame(frame)
      document.documentElement.style.overflow = ''
      root.inert = false
      window.scrollTo({ top: scrollY, behavior: 'instant' })
      returnTo?.focus?.({ preventScroll: true })
    }
  }, [returnTo])

  const close = useCallback(() => {
    setShown(false)
    setTimeout(onClose, duration)
  }, [onClose, duration])

  const slides = gallerySlides(project).length

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') close()
      else if (e.key === 'ArrowRight' && slides > 1) setSlide((s) => (s + 1) % slides)
      else if (e.key === 'ArrowLeft' && slides > 1) setSlide((s) => (s - 1 + slides) % slides)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, slides])

  const showProject = (i) => {
    onIndexChange(i)
    setSlide(0)
    panelRef.current.parentElement.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }
  const next = (index + 1) % projects.length

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      className="fixed inset-0 z-[300] overflow-y-auto overscroll-contain"
    >
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-[#1b1a18]/40 backdrop-blur-[3px] transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Clicking the space around the panel closes it */}
      <div
        className="relative flex min-h-full items-center justify-center px-3 py-6 sm:px-6 sm:py-10"
        onMouseDown={(e) => e.target === e.currentTarget && close()}
      >
        <article
          ref={panelRef}
          className={`w-full max-w-[1080px] rounded-[10px] border border-line bg-ink p-4 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.45)] transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] sm:p-8 ${
            shown ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-6 scale-[0.97] opacity-0'
          }`}
        >
          <header className="mb-5 flex items-center justify-between sm:mb-6">
            <p className="text-sm text-muted">
              Project <span className="tabular-nums text-fg">{pad(index + 1)}</span>{' '}
              <span className="tabular-nums">/ {pad(projects.length)}</span>
            </p>
            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label="Close project"
              className="flex size-10 items-center justify-center rounded-full border border-line text-xl leading-none text-fg transition-colors duration-200 hover:border-fg/30 hover:bg-fg/5"
            >
              ×
            </button>
          </header>

          <div className="mx-auto max-w-[calc(64svh*1.6)]">
            <ProjectGallery key={project.slug} project={project} number={pad(index + 1)} index={slide} onChange={setSlide} />
          </div>

          <div className="mt-10 grid gap-10 md:mt-12 md:grid-cols-[1fr_17rem] md:gap-16">
            <div>
              <h2 id="project-title" className="font-display text-4xl leading-tight text-fg md:text-5xl">
                {project.title}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{project.description}</p>
            </div>

            <div className="space-y-8">
              <dl className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-muted">Year</dt>
                  <dd className="tabular-nums text-fg">{project.year}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-muted">Type</dt>
                  <dd className="text-fg">{project.type}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-12 shrink-0 text-muted">Stack</dt>
                  <dd className="leading-relaxed text-fg">{project.technologies.join(' · ')}</dd>
                </div>
              </dl>

              {project.live || project.github ? (
                <div className="flex flex-col gap-2.5">
                  {project.live && (
                    <a
                      href={project.live}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-full bg-fg px-5 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-accent hover:text-on-accent"
                    >
                      Live website
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  )}
                  {project.github && (
                    <a
                      href={project.github}
                      target="_blank"
                      rel="noreferrer"
                      className="group flex items-center justify-between rounded-full border border-line px-5 py-3 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30"
                    >
                      View source on GitHub
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="border-t border-line pt-4 text-sm leading-relaxed text-muted">
                  No public repository or live link for this one yet. Happy to walk you through it.
                </p>
              )}
            </div>
          </div>

          <footer className="mt-12 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => showProject(next)}
              className="group flex w-full items-baseline justify-between gap-4 text-left"
            >
              <span className="text-sm text-muted">Next project</span>
              <span className="font-display text-2xl text-fg transition-colors duration-200 group-hover:text-accent">
                {projects[next].title}{' '}
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </button>
          </footer>
        </article>
      </div>
    </div>,
    document.body,
  )
}
