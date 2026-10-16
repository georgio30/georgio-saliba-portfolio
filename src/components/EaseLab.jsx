import { useEffect, useRef, useState } from 'react'
import { ease } from '../lib/motion'
import { useReducedMotion } from '../lib/hooks'
import { useI18n } from '../i18n'

const RATES = [30, 60, 120, 144]
// The naive version is tuned to match at 60 fps, which is exactly why it looks fine on the developer's screen
const naiveShare = (ms) => ease(1000 / 60, ms)

// Two dots chase the same target at a chosen frame rate: one eases per frame, one by elapsed time
export default function EaseLab() {
  const { t } = useI18n()
  const reduced = useReducedMotion()
  const [fps, setFps] = useState(60)
  const [ms, setMs] = useState(110)
  const [result, setResult] = useState(null)
  const naiveRef = useRef(null)
  const timedRef = useRef(null)
  const run = useRef(0)

  const place = (el, p) => el && (el.style.insetInlineStart = `calc(${(p * 100).toFixed(2)}% - ${p * 1.25}rem)`)

  const start = () => {
    cancelAnimationFrame(run.current)
    const step = 1000 / fps
    const share = naiveShare(ms)
    let naive = 0
    let timed = 0
    let clock = 0
    let acc = 0
    let then = 0
    const hit = { naive: null, timed: null }
    setResult(null)

    // With reduced motion, work it out without animating
    if (reduced) {
      while (clock < 3000 && (hit.naive === null || hit.timed === null)) {
        clock += step
        naive += (1 - naive) * share
        timed += (1 - timed) * ease(step, ms)
        if (hit.naive === null && naive > 0.95) hit.naive = clock
        if (hit.timed === null && timed > 0.95) hit.timed = clock
      }
      place(naiveRef.current, 1)
      place(timedRef.current, 1)
      setResult(hit)
      return
    }

    const tick = (now) => {
      const real = then ? now - then : 0
      then = now
      acc += real
      // Only move on the simulated screen's frames
      while (acc >= step) {
        acc -= step
        clock += step
        naive += (1 - naive) * share
        timed += (1 - timed) * ease(step, ms)
        if (hit.naive === null && naive > 0.95) hit.naive = clock
        if (hit.timed === null && timed > 0.95) hit.timed = clock
      }
      place(naiveRef.current, naive)
      place(timedRef.current, timed)
      if (hit.naive !== null && hit.timed !== null && clock > 600) setResult({ ...hit })
      else run.current = requestAnimationFrame(tick)
    }
    place(naiveRef.current, 0)
    place(timedRef.current, 0)
    run.current = requestAnimationFrame(tick)
  }

  useEffect(() => () => cancelAnimationFrame(run.current), [])

  const share = naiveShare(ms)
  const frameDt = 1000 / fps
  const fmt = (n) => `${Math.round(n)} ms`

  return (
    <div className="rounded-[10px] border border-line bg-surface p-5 sm:p-7">
      <h3 className="font-display text-2xl leading-snug text-fg md:text-3xl">{t.craft.lab.title}</h3>
      <p className="mt-3 max-w-2xl leading-relaxed text-muted">{t.craft.lab.intro}</p>

      <div className="mt-6 flex flex-wrap items-end gap-x-8 gap-y-4">
        <div role="radiogroup" aria-label={t.craft.lab.rate} className="flex flex-col gap-2">
          <span className="text-xs text-muted">{t.craft.lab.rate}</span>
          <div className="flex gap-1.5">
            {RATES.map((r) => (
              <button
                key={r}
                type="button"
                role="radio"
                aria-checked={fps === r}
                onClick={() => setFps(r)}
                className={`rounded-full border px-3 py-1 text-sm tabular-nums transition-colors duration-200 ${
                  fps === r ? 'border-fg bg-fg text-ink' : 'border-line text-muted hover:border-fg/30 hover:text-fg'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
        <label className="flex min-w-48 flex-1 flex-col gap-2 text-xs text-muted">
          <span>
            {t.craft.lab.smoothing} <span className="tabular-nums text-fg" dir="ltr">{ms} ms</span>
          </span>
          <input type="range" min="40" max="300" step="10" value={ms} onChange={(e) => setMs(Number(e.target.value))} className="accent-[var(--color-accent)]" />
        </label>
        <button
          type="button"
          onClick={start}
          className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-ink transition-colors duration-200 hover:bg-accent hover:text-on-accent"
        >
          {t.craft.lab.run}
        </button>
      </div>

      <div className="mt-7 space-y-5">
        {[
          ['naive', naiveRef, t.craft.lab.naive, 'bg-muted'],
          ['timed', timedRef, t.craft.lab.timed, 'bg-accent'],
        ].map(([id, ref, label, color]) => (
          <div key={id}>
            <div className="flex items-baseline justify-between gap-4 text-sm">
              <span className="text-fg">{label}</span>
              <span className="tabular-nums text-muted" dir="ltr">
                {result ? t.craft.lab.arrived(fmt(result[id])) : '–'}
              </span>
            </div>
            <div className="relative mt-2 h-5 rounded-full bg-ink">
              <span aria-hidden="true" className="absolute inset-y-0 end-0 w-0.5 bg-line" />
              <span ref={ref} aria-hidden="true" className={`absolute top-0 start-0 size-5 rounded-full ${color}`} />
            </div>
          </div>
        ))}
      </div>

      <pre dir="ltr" className="mt-7 overflow-x-auto rounded-[8px] bg-ink p-4 text-left text-[0.8rem] leading-relaxed text-muted">
        <code>
          <span className="opacity-70">{'// '}{t.craft.lab.codeNaive}</span>
          {'\n'}p += (target - p) * <span className="text-fg">{share.toFixed(3)}</span>
          {'\n\n'}
          <span className="opacity-70">{'// '}{t.craft.lab.codeTimed}</span>
          {'\n'}const ease = (dt, ms) =&gt; 1 - Math.exp(-dt / ms)
          {'\n'}p += (target - p) * ease(<span className="text-fg">{frameDt.toFixed(1)}</span>, <span className="text-accent">{ms}</span>)
          <span className="opacity-70">{'  // = '}{ease(frameDt, ms).toFixed(3)}</span>
        </code>
      </pre>

      <p className="mt-4 text-sm leading-relaxed text-muted" aria-live="polite">
        {result ? (Math.abs(result.naive - result.timed) < 20 ? t.craft.lab.same : t.craft.lab.differ(fps)) : t.craft.lab.hint}
      </p>
    </div>
  )
}
