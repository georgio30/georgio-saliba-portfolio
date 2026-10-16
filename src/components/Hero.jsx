import { useEffect, useRef, useState } from 'react'
import Reveal from './Reveal'
import Words from './Words'
import HeroWorld from './HeroWorld'
import { hasWebGL } from '../lib/island'
import { profile } from '../data/resume'
import { useReducedMotion } from '../lib/hooks'
import { useI18n } from '../i18n'

const wordCount = (text) => text.split(/\s+/).filter(Boolean).length

export default function Hero() {
  const { t, pick } = useI18n()
  const reduced = useReducedMotion()
  const innerRef = useRef(null)
  const worldRef = useRef(null)
  // Decided before first paint, so the layout doesn't jump when the world arrives
  const [world] = useState(hasWebGL)

  // The hero eases back as the work comes up behind it
  useEffect(() => {
    const el = innerRef.current
    const worldEl = worldRef.current
    if (reduced) return
    const wide = window.matchMedia('(min-width: 1024px)')
    let frame = 0
    const update = () => {
      frame = 0
      const t = Math.min(1, window.scrollY / (window.innerHeight * 0.85))
      el.style.opacity = 1 - t
      el.style.transform = `translateY(${t * -40}px) scale(${1 - t * 0.04})`
      // On phones the world sits below the text, so it only fades with it on wide screens
      if (worldEl && wide.matches) worldEl.style.opacity = 1 - t * 0.9
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
      if (worldEl) worldEl.style.opacity = ''
    }
  }, [reduced])

  const before = wordCount(t.hero.before)
  const em = wordCount(t.hero.em)

  return (
    // overflow-x-clip: a translated headline can push the handwritten note past the edge; clip it, don't scroll
    <section id="home" className="relative flex min-h-[100svh] flex-col overflow-x-clip lg:flex-row lg:items-center">
      <div
        ref={innerRef}
        className={`relative z-10 mx-auto w-full max-w-6xl origin-top px-5 pt-28 sm:px-8 ${world ? 'pb-6 lg:pointer-events-none lg:pb-20' : 'pb-20'}`}
      >
        <Reveal className={world ? 'lg:pointer-events-auto lg:max-w-[42%]' : ''}>
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
            <span className="font-medium text-fg">{pick(profile.name)}</span>
            <span aria-hidden="true" className="h-px w-6 bg-line" />
            <span>{pick(profile.role)}</span>
          </p>

          <h1
            className={`rise mt-8 max-w-4xl font-display text-[2.75rem] leading-[1.05] tracking-[-0.01em] text-fg sm:text-6xl md:text-7xl rtl:leading-[1.3] rtl:tracking-normal ${
              world ? 'lg:text-7xl xl:text-[5rem]' : 'lg:text-[5.5rem]'
            }`}
          >
            <Words text={t.hero.before} />
            <em className="text-accent">
              <Words text={t.hero.em} start={before} />
            </em>
            <span className="relative">
              <Words text={t.hero.last} start={before + em} />
              {/* The one handwritten note on the site; beside the world it moves under the headline */}
              {!world && (
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
              )}
            </span>
          </h1>

          {world && (
            <p aria-hidden="true" className="mt-5 hidden -rotate-2 font-display text-xl text-muted italic lg:block rtl:rotate-2">
              {t.hero.note[0]} {t.hero.note[1]}
            </p>
          )}

          <p className="mt-8 max-w-md text-lg leading-relaxed text-muted">{world ? t.hero.introWorld : t.hero.intro}</p>

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

      {world && (
        <div ref={worldRef} className="relative h-[min(64svh,32rem)] w-full lg:absolute lg:inset-x-0 lg:top-0 lg:h-[100svh]">
          <HeroWorld className="absolute inset-0" />
        </div>
      )}
    </section>
  )
}
