import { useCallback, useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import ProjectGallery from './ProjectGallery'
import ProjectStats from './ProjectStats'
import ProjectArchitecture from './ProjectArchitecture'
import ProjectDemos from './ProjectDemos'
import TechTags from './TechTags'
import Reveal from './Reveal'
import { projects as allProjects } from '../data/projects'
import { gallerySlides } from '../lib/gallery'
import { useReducedMotion } from '../lib/hooks'
import { pad } from '../lib/motion'
import { useI18n } from '../i18n'

// One part of the case study: a small label on the side, content beside it
function Part({ id, label, children, className = '' }) {
  return (
    <Reveal
      as="section"
      id={id}
      aria-labelledby={`${id}-title`}
      className={`mt-14 scroll-mt-24 border-t border-line pt-8 md:mt-16 ${className}`}
    >
      <div className="grid gap-4 md:grid-cols-[9rem_1fr] md:gap-10">
        <h3 id={`${id}-title`} className="text-sm text-muted">
          {label}
        </h3>
        <div className="min-w-0">{children}</div>
      </div>
    </Reveal>
  )
}

// The case study: gallery, overview, numbers, story, challenges, architecture, demos and result.
// `projects` is the gallery as currently filtered, for "Next project".
export default function ProjectModal({ projects, slug, onSelect, onClose, morphClose, morph, onFilterTech, origin = 'list', onLeave }) {
  const project = allProjects.find((p) => p.slug === slug)
  const study = project.caseStudy
  const { t, pick, dir } = useI18n()
  const reduced = useReducedMotion()
  const [shown, setShown] = useState(false)
  const [slide, setSlide] = useState(0)
  const [current, setCurrent] = useState('overview')
  // Read once, before anything inside the modal takes focus
  const [returnTo] = useState(() => document.activeElement)
  const closeRef = useRef(null)
  const dialogRef = useRef(null)
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
    // The gallery morphs the case study back into its card when it can
    if (morphClose?.()) return
    setShown(false)
    setTimeout(onClose, duration)
  }, [morphClose, onClose, duration])

  const slides = gallerySlides(project).length

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') return close()
      // Arrow keys belong to sliders, text fields and tabs when one of those has focus
      if (e.target.closest?.('input, textarea, select, [role="tablist"], [role="radiogroup"]')) return
      // Arrow keys follow the reading direction: right to left, ← is "next"
      const step = ({ ArrowRight: 1, ArrowLeft: -1 }[e.key] ?? 0) * (dir === 'rtl' ? -1 : 1)
      if (step && slides > 1) setSlide((s) => (s + step + slides) % slides)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [close, slides, dir])

  const sections = [
    { id: 'overview', label: t.project.nav.overview },
    study && { id: 'story', label: t.project.nav.story },
    study?.challenges && { id: 'challenges', label: t.project.nav.challenges },
    project.layers && { id: 'architecture', label: t.project.nav.architecture },
    project.demos?.length && { id: 'demo', label: t.project.nav.demo },
    study && { id: 'result', label: t.project.nav.result },
  ].filter(Boolean)

  // Highlight the section being read in the header
  useEffect(() => {
    const root = dialogRef.current
    const observer = new IntersectionObserver(
      (entries) => {
        const hit = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (hit) setCurrent(hit.target.id.replace('cs-', ''))
      },
      { root, rootMargin: '-25% 0px -65% 0px' },
    )
    root.querySelectorAll('section[id^="cs-"]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [slug])

  const jump = (id) => {
    document.getElementById(`cs-${id}`)?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
  }

  const showProject = (next) => {
    onSelect(next)
    setSlide(0)
    setCurrent('overview')
    dialogRef.current.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }

  const pool = projects.length > 1 ? projects : allProjects
  const next = pool[(pool.findIndex((p) => p.slug === slug) + 1) % pool.length]
  const number = allProjects.indexOf(project) + 1
  const afterButton =
    'rounded-full border border-line px-4 py-2 text-sm text-fg transition-colors duration-200 hover:border-fg/30 hover:text-accent'

  return createPortal(
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="project-title"
      className="fixed inset-0 z-[300] overflow-y-auto overscroll-contain"
    >
      <div
        aria-hidden="true"
        className={`fixed inset-0 bg-[#1b1a18]/45 backdrop-blur-[4px] transition-opacity duration-300 ${shown ? 'opacity-100' : 'opacity-0'}`}
      />

      {/* Clicking the space around the panel closes it */}
      <div
        className="relative flex min-h-full items-start justify-center px-3 py-6 sm:px-6 sm:py-10"
        onMouseDown={(e) => e.target === e.currentTarget && close()}
      >
        <article
          className={`w-full max-w-[1120px] rounded-[10px] border border-line bg-ink px-4 pb-6 shadow-[0_40px_80px_-40px_rgb(0_0_0/0.45)] transition-[opacity,transform] duration-[380ms] ease-[cubic-bezier(0.22,0.61,0.36,1)] sm:px-8 sm:pb-8 ${
            shown ? 'translate-y-0 scale-100 opacity-100' : morph ? 'opacity-0' : 'translate-y-6 scale-[0.97] opacity-0'
          }`}
        >
          {/* Stays at the top while reading: where you are, the sections, and the way out */}
          <header className="sticky top-0 z-10 -mx-4 mb-5 flex items-center justify-between gap-4 rounded-t-[10px] border-b border-transparent bg-ink/90 px-4 py-3 backdrop-blur-md sm:-mx-8 sm:mb-6 sm:px-8 sm:py-4">
            <p className="shrink-0 text-sm text-muted">
              {t.project.project} <span className="tabular-nums text-fg">{pad(number)}</span>{' '}
              <span className="tabular-nums">/ {pad(allProjects.length)}</span>
            </p>

            <nav aria-label={t.project.sections} className="hidden min-w-0 md:block">
              <ul className="flex gap-1">
                {sections.map((s) => (
                  <li key={s.id}>
                    <button
                      type="button"
                      onClick={() => jump(s.id)}
                      aria-current={current === s.id ? 'true' : undefined}
                      className={`rounded-full px-3 py-1.5 text-sm transition-colors duration-200 ${
                        current === s.id ? 'bg-fg/[0.07] text-fg' : 'text-muted hover:text-fg'
                      }`}
                    >
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>

            <button
              ref={closeRef}
              type="button"
              onClick={close}
              aria-label={t.project.close}
              className="flex size-10 shrink-0 items-center justify-center rounded-full border border-line text-xl leading-none text-fg transition-colors duration-200 hover:border-fg/30 hover:bg-fg/5"
            >
              ×
            </button>
          </header>

          <div className="mx-auto max-w-[calc(64svh*1.6)]">
            <ProjectGallery
              key={project.slug}
              project={project}
              number={pad(number)}
              index={slide}
              onChange={setSlide}
              morphName={morph ? 'project-visual' : undefined}
            />
          </div>

          <section id="cs-overview" aria-labelledby="project-title" className="mt-10 grid scroll-mt-24 gap-10 md:mt-12 md:grid-cols-[1fr_17rem] md:gap-16">
            <div>
              <p className="text-sm text-accent">{pick(project.type)}</p>
              <h2 id="project-title" className="mt-2 font-display text-4xl leading-tight text-fg md:text-6xl rtl:leading-[1.3]">
                {pick(project.title)}
              </h2>
              <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{pick(project.description)}</p>

              <h3 className="mt-8 text-sm text-muted">{t.project.caseStudy.stack}</h3>
              <TechTags project={project} onSelect={showProject} onFilter={onFilterTech} />
            </div>

            <div className="space-y-8">
              <dl className="space-y-3 text-sm">
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-muted">{t.project.year}</dt>
                  <dd className="tabular-nums text-fg">{project.year}</dd>
                </div>
                <div className="flex gap-3">
                  <dt className="w-16 shrink-0 text-muted">{t.project.type}</dt>
                  <dd className="text-fg">{pick(project.type)}</dd>
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
                      {t.project.live}
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5">
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
                      {t.project.source}
                      <span aria-hidden="true" className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5">
                        ↗
                      </span>
                    </a>
                  )}
                </div>
              ) : (
                <p className="border-t border-line pt-4 text-sm leading-relaxed text-muted">{t.project.noLinks}</p>
              )}
            </div>
          </section>

          <ProjectStats key={`stats-${project.slug}`} project={project} />

          {study && (
            <Part id="cs-story" label={t.project.caseStudy.problem}>
              <p className="max-w-2xl text-lg leading-relaxed text-fg">{pick(study.problem)}</p>
              <h4 className="mt-10 text-sm text-muted">{t.project.caseStudy.approach}</h4>
              <ol className="relative mt-5 max-w-2xl space-y-6 border-s border-line ps-6">
                {pick(study.approach).map((step, i) => (
                  <li key={i} className="relative leading-relaxed text-fg">
                    <span
                      aria-hidden="true"
                      className="absolute -start-[2.125rem] top-0 flex size-5 items-center justify-center rounded-full border border-line bg-ink text-[0.7rem] text-accent tabular-nums"
                    >
                      {i + 1}
                    </span>
                    {step}
                  </li>
                ))}
              </ol>
            </Part>
          )}

          {study?.challenges && (
            <Part id="cs-challenges" label={t.project.caseStudy.challenges}>
              <ul className="grid gap-4 sm:grid-cols-2">
                {study.challenges.map((c, i) => (
                  <li key={i} className="rounded-[8px] border border-line bg-surface p-5">
                    <span aria-hidden="true" className="font-display text-3xl leading-none text-accent-soft tabular-nums">
                      {pad(i + 1)}
                    </span>
                    <p className="mt-3 font-display text-2xl leading-snug text-fg rtl:leading-[1.5]">{pick(c.title)}</p>
                    <p className="mt-2 leading-relaxed text-muted">{pick(c.text)}</p>
                  </li>
                ))}
              </ul>
            </Part>
          )}

          {project.layers && (
            <Part id="cs-architecture" label={t.project.caseStudy.architecture}>
              <ProjectArchitecture key={project.slug} project={project} />
            </Part>
          )}

          {project.demos?.length > 0 && (
            <Part id="cs-demo" label={t.project.caseStudy.demo}>
              <ProjectDemos key={project.slug} project={project} />
            </Part>
          )}

          {study && (
            <Part id="cs-result" label={t.project.caseStudy.result}>
              <p className="max-w-2xl font-display text-2xl leading-snug text-fg md:text-3xl rtl:leading-[1.6]">{pick(study.result)}</p>
            </Part>
          )}

          <footer className="mt-14 border-t border-line pt-5">
            <button
              type="button"
              onClick={() => showProject(next.slug)}
              className="group flex w-full items-baseline justify-between gap-4 text-start"
            >
              <span className="text-sm text-muted">{t.project.next}</span>
              <span className="font-display text-2xl text-fg transition-colors duration-200 group-hover:text-accent md:text-3xl">
                {pick(next.title)}{' '}
                <span aria-hidden="true" className="inline-block transition-transform duration-300 group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1">
                  →
                </span>
              </span>
            </button>

            {/* Where to go from here: back where they came from, all the projects side by side, or a conversation */}
            <nav aria-label={t.project.after.label} className="mt-8 flex flex-wrap gap-2">
              {origin === 'island' && (
                <button type="button" onClick={close} className={afterButton}>
                  <span aria-hidden="true" className="inline-block rtl:-scale-x-100">
                    ←
                  </span>{' '}
                  {t.project.after.island}
                </button>
              )}
              {onLeave && (
                <>
                  {origin === 'island' && (
                    <button type="button" onClick={() => onLeave('work')} className={afterButton}>
                      {t.project.after.compare}
                    </button>
                  )}
                  <button type="button" onClick={() => onLeave('contact')} className={afterButton}>
                    {t.project.after.contact}
                  </button>
                </>
              )}
            </nav>
          </footer>
        </article>
      </div>
    </div>,
    document.body,
  )
}
