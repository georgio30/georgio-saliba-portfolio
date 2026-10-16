import { useEffect, useState } from 'react'
import { useI18n } from '../i18n'

// The project's layers, top to bottom. "Trace a request" walks down to the last layer and
// back up again, lighting each one as it passes.
export default function ProjectArchitecture({ project }) {
  const { t, pick } = useI18n()
  const layers = project.layers
  // Down through every layer, then back up: 0, 1, 2, 1, 0
  const path = [...layers.keys(), ...[...layers.keys()].reverse().slice(1)]
  const [step, setStep] = useState(-1)
  const running = step >= 0 && step < path.length
  const at = running ? path[step] : -1
  const goingUp = step >= layers.length

  useEffect(() => {
    if (!running) return
    const timer = setTimeout(() => setStep((s) => s + 1), 650)
    return () => clearTimeout(timer)
  }, [running, step])

  const status = running
    ? (goingUp ? t.project.architecture.up : t.project.architecture.down)(pick(layers[at].name))
    : step >= path.length
      ? t.project.architecture.done
      : ''

  return (
    <div>
      <p className="max-w-xl leading-relaxed text-muted">{t.project.architecture.hint}</p>

      <ol className="mt-6 max-w-2xl">
        {layers.map((layer, i) => {
          const lit = i === at
          // The link above this layer carries the request down, then the response back up
          const linkLit = running && ((!goingUp && at === i) || (goingUp && at === i - 1))
          return (
            <li key={i}>
              {i > 0 && (
                <div aria-hidden="true" className="flex h-8 items-center ps-8">
                  <span className={`relative h-full w-px transition-colors duration-300 ${linkLit ? 'bg-accent' : 'bg-line'}`}>
                    {linkLit && (
                      <span
                        className={`absolute start-1/2 size-2 -translate-x-1/2 rounded-full bg-accent rtl:translate-x-1/2 ${
                          goingUp ? 'bottom-0 animate-[layer-up_0.6s_ease-in-out_forwards]' : 'top-0 animate-[layer-down_0.6s_ease-in-out_forwards]'
                        }`}
                      />
                    )}
                  </span>
                </div>
              )}
              <div
                key={lit ? `lit-${step}` : 'idle'}
                className={`flex flex-wrap items-baseline gap-x-6 gap-y-2 rounded-[8px] border px-5 py-4 transition-colors duration-300 ${
                  lit ? 'layer-ping border-accent bg-accent/[0.06]' : 'border-line bg-surface'
                }`}
              >
                <span className="w-28 shrink-0 font-display text-2xl leading-none text-fg">{pick(layer.name)}</span>
                <ul className="flex flex-wrap gap-1.5">
                  {layer.items.map((item, j) => (
                    <li key={j} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">
                      {pick(item)}
                    </li>
                  ))}
                </ul>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button
          type="button"
          disabled={running}
          onClick={() => setStep(0)}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30 disabled:opacity-50"
        >
          <span aria-hidden="true" className="text-accent">
            ↓↑
          </span>
          {step >= path.length ? t.project.architecture.again : t.project.architecture.trace}
        </button>
        <p aria-live="polite" className="text-sm text-muted">
          {status}
        </p>
      </div>
    </div>
  )
}
