import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import Section from './Section'
import { challenges, craftPoints } from '../data/craft'
import { useReducedMotion, useTheme } from '../lib/hooks'
import { useI18n } from '../i18n'

// Real numbers from this visit, read from the browser's own timing data
function usePageStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint')
      const scripts = performance
        .getEntriesByType('resource')
        .filter((r) => r.name.startsWith(location.origin) && r.name.split('?')[0].endsWith('.js'))
      const bytes = scripts.reduce((sum, r) => sum + r.encodedBodySize, 0)
      setStats({
        paint: paint ? Math.round(paint.startTime) : null,
        load: nav?.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : null,
        // Compressed size of the scripts, the same whether or not they came from the cache
        scriptKb: bytes > 0 ? Math.round(bytes / 1024) : null,
      })
    }
    if (document.readyState === 'complete') {
      read()
      return
    }
    const onLoad = () => setTimeout(read, 0)
    window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return stats
}

function useViewportWidth() {
  const [width, setWidth] = useState(() => window.innerWidth)
  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])
  return width
}

function LiveReadout() {
  const { t, lang, dir } = useI18n()
  const [dark] = useTheme()
  const reduced = useReducedMotion()
  const width = useViewportWidth()
  const stats = usePageStats()
  const dash = '–'

  const rows = [
    [t.craft.live.viewport, `${width}px`],
    [t.craft.live.language, `${lang.toUpperCase()} · ${dir.toUpperCase()}`],
    [t.craft.live.theme, dark ? t.craft.live.dark : t.craft.live.light],
    [t.craft.live.motion, reduced ? t.craft.live.reduced : t.craft.live.full],
    [t.craft.live.paint, stats?.paint != null ? `${stats.paint} ms` : dash],
    [t.craft.live.loaded, stats?.load != null ? `${stats.load} ms` : dash],
    [t.craft.live.scripts, stats?.scriptKb != null ? `${stats.scriptKb} KB` : dash],
  ]

  return (
    <div className="rounded-[10px] border border-line bg-surface p-5 sm:p-6">
      <h3 className="text-sm text-muted">{t.craft.live.title}</h3>
      <dl className="mt-4 divide-y divide-line text-sm">
        {rows.map(([label, value]) => (
          <div key={label} className="flex items-baseline justify-between gap-4 py-2.5">
            <dt className="text-muted">{label}</dt>
            <dd dir="ltr" className="tabular-nums text-fg">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-4 text-xs leading-relaxed text-muted">{t.craft.live.note}</p>
    </div>
  )
}

export default function Craft() {
  const { t, pick } = useI18n()

  return (
    <Section id="craft" label={t.craft.label} title={t.craft.title}>
      <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr] lg:gap-16">
        <Reveal>
          <dl className="divide-y divide-line border-y border-line">
            {craftPoints.map((point) => (
              <div key={point.id} className="grid gap-2 py-6 xl:grid-cols-[10rem_1fr] xl:gap-8">
                <dt className="font-display text-2xl leading-tight text-fg">{pick(point.title)}</dt>
                <dd className="leading-relaxed text-muted">{pick(point.text)}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal delay={100} className="lg:sticky lg:top-24 lg:self-start">
          <LiveReadout />
        </Reveal>
      </div>

      <Reveal className="mt-16 md:mt-20">
        <h3 className="text-sm text-muted">{t.craft.challenges}</h3>
        <div className="mt-4 divide-y divide-line border-y border-line">
          {challenges.map((c) => (
            <details key={pick(c.title)} className="group py-1">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-display text-2xl leading-snug text-fg transition-colors duration-200 hover:text-accent [&::-webkit-details-marker]:hidden">
                {pick(c.title)}
                <span
                  aria-hidden="true"
                  className="font-sans text-xl text-muted transition-transform duration-300 group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <dl className="grid gap-5 pb-6 sm:grid-cols-2 sm:gap-10">
                <div>
                  <dt className="text-sm text-muted">{t.craft.problem}</dt>
                  <dd className="mt-1 leading-relaxed text-fg">{pick(c.problem)}</dd>
                </div>
                <div>
                  <dt className="text-sm text-muted">{t.craft.solution}</dt>
                  <dd className="mt-1 leading-relaxed text-fg">{pick(c.solution)}</dd>
                </div>
              </dl>
            </details>
          ))}
        </div>
      </Reveal>
    </Section>
  )
}
