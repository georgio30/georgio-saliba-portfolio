import { useEffect, useRef, useState } from 'react'
import { usePageStats, useReducedMotion, useSeen } from '../lib/hooks'
import { useI18n } from '../i18n'

// Counts up to a whole number the first time it's seen; anything else is shown as is
function Figure({ value }) {
  const ref = useRef(null)
  const seen = useSeen(ref)
  const reduced = useReducedMotion()
  const numeric = /^\d+$/.test(String(value))
  const [shown, setShown] = useState(numeric && !reduced ? 0 : value)

  useEffect(() => {
    if (!numeric || reduced || !seen) return
    const target = Number(value)
    const start = performance.now()
    let frame = requestAnimationFrame(function tick(now) {
      const k = Math.min((now - start) / 900, 1)
      setShown(Math.round(target * (1 - (1 - k) ** 3)))
      if (k < 1) frame = requestAnimationFrame(tick)
    })
    return () => cancelAnimationFrame(frame)
  }, [numeric, reduced, seen, value])

  return (
    <span ref={ref} className="tabular-nums">
      {/* Screen readers get the final number straight away */}
      <span aria-hidden="true">{shown}</span>
      <span className="sr-only">{value}</span>
    </span>
  )
}

// This site only: numbers read from the visitor's own browser while they're here
function Measured() {
  const { t } = useI18n()
  const stats = usePageStats()
  const dash = '–'
  const rows = [
    [t.project.stats.paint, stats?.paint != null ? `${stats.paint} ms` : dash],
    [t.project.stats.load, stats?.load != null ? `${stats.load} ms` : dash],
    [t.project.stats.scripts, stats?.scriptKb != null ? `${stats.scriptKb} KB` : dash],
  ]
  return (
    <div className="mt-4 rounded-[8px] border border-line p-4 sm:p-5">
      <p className="flex items-center gap-2 text-xs text-muted">
        <span aria-hidden="true" className="relative flex size-2">
          <span className="absolute inset-0 animate-ping rounded-full bg-accent-soft opacity-60" />
          <span className="relative size-2 rounded-full bg-accent" />
        </span>
        {t.project.stats.live}
      </p>
      <dl className="mt-3 grid grid-cols-3 gap-4">
        {rows.map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs text-muted">{label}</dt>
            <dd dir="ltr" className="mt-1 font-display text-2xl text-fg tabular-nums rtl:text-end">
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

// "At a glance": counts taken from the project's own data, plus its checkable facts
export default function ProjectStats({ project }) {
  const { t, pick } = useI18n()
  const tiles = [
    { value: project.technologies.length, label: t.project.stats.technologies },
    project.layers && { value: project.layers.length, label: t.project.stats.layers },
    ...(project.facts ?? []).map((f) => ({ value: f.value, label: pick(f.label) })),
  ].filter(Boolean)

  return (
    <section aria-labelledby={`stats-${project.slug}`} className="mt-12 md:mt-14">
      <h3 id={`stats-${project.slug}`} className="sr-only">
        {t.project.stats.title}
      </h3>
      <dl className="grid grid-cols-2 overflow-hidden rounded-[8px] border border-line bg-line [gap:1px] md:grid-cols-4">
        {tiles.map((tile, i) => (
          <div key={i} className="flex flex-col-reverse justify-end gap-2 bg-surface p-4 sm:p-5">
            <dt className="text-sm leading-snug text-muted">{tile.label}</dt>
            <dd className="font-display text-4xl leading-none text-fg md:text-5xl">
              <Figure value={tile.value} />
            </dd>
          </div>
        ))}
      </dl>
      {project.measured && <Measured />}
    </section>
  )
}
