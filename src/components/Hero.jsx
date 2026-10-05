import { useEffect, useRef } from 'react'
import Reveal from './Reveal'
import { profile } from '../data/resume'
import { useReducedMotion } from '../lib/hooks'
import { useI18n } from '../i18n'

export default function Hero() {
  const { t, pick } = useI18n()
  const reduced = useReducedMotion()
  const innerRef = useRef(null)

  // The hero eases back as the work comes up behind it
  useEffect(() => {
    const el = innerRef.current
    if (reduced) return
    let frame = 0
    const update = () => {
      frame = 0
      const t = Math.min(1, window.scrollY / (window.innerHeight * 0.85))
      el.style.opacity = 1 - t
      el.style.transform = `translateY(${t * -40}px) scale(${1 - t * 0.04})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      el.style.opacity = ''
      el.style.transform = ''
    }
  }, [reduced])

  return (
    // overflow-x-clip: a translated headline can push the handwritten note past the edge; clip it, don't scroll
    <section id="home" className="flex min-h-[100svh] items-center overflow-x-clip">
      <div ref={innerRef} className="mx-auto w-full max-w-6xl origin-top px-5 pt-28 pb-20 sm:px-8">
        <Reveal>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-medium text-fg">{pick(profile.name)}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line" />
            <span>{pick(profile.role)}</span>
          </p>

          <h1 className="mt-8 max-w-4xl font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] text-fg sm:text-6xl md:text-7xl lg:text-[5.5rem] rtl:leading-[1.3] rtl:tracking-normal">
            {t.hero.before}
            <em className="text-accent">{t.hero.em}</em>
            <span className="relative">
              {t.hero.last}
              {/* The one handwritten note on the site */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute start-full top-1/2 ms-6 hidden w-64 -translate-y-1/3 select-none lg:block"
              >
                <svg viewBox="0 0 90 40" className="h-9 w-20 text-accent-soft rtl:-scale-x-100" fill="none">
                  <path
                    d="M86 30 C 64 36, 34 34, 8 12 M8 12 l3 11 M8 12 l11 1"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <span className="ms-10 block -rotate-3 font-display text-xl leading-tight tracking-normal text-muted italic rtl:rotate-3">
                  {t.hero.note[0]}
                  <br />
                  {t.hero.note[1]}
                </span>
              </span>
            </span>
          </h1>

          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">
            {t.hero.intro}
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <a
              href="#work"
              className="group inline-flex items-center gap-2.5 rounded-full bg-fg px-6 py-3 text-sm font-medium text-ink transition-colors duration-200 hover:bg-accent hover:text-on-accent"
            >
              {t.hero.explore}
              <span aria-hidden="true" className="transition-transform duration-300 ease-out group-hover:translate-y-0.5">
                ↓
              </span>
            </a>
            <a
              href={profile.github}
              target="_blank"
              rel="noreferrer"
              className="group inline-flex items-center gap-2.5 rounded-full border border-line px-6 py-3 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30"
            >
              GitHub
              <span
                aria-hidden="true"
                className="transition-transform duration-300 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:-scale-x-100 rtl:group-hover:-translate-x-0.5"
              >
                ↗
              </span>
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
