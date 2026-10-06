import Reveal from './Reveal'
import { now, nowUpdated } from '../data/now'
import { useI18n } from '../i18n'

// A small, dated note on what's happening at the moment; edit src/data/now.js to update it
export default function Now() {
  const { t, pick, locale } = useI18n()
  const [year, month] = nowUpdated.split('-').map(Number)
  const updated = new Date(year, month - 1).toLocaleString(locale, { month: 'long', year: 'numeric' })

  return (
    <section id="now" aria-labelledby="now-title" className="mx-auto max-w-6xl px-5 pb-24 sm:px-8 md:pb-32">
      <Reveal className="grid gap-y-6 md:grid-cols-[11rem_1fr] md:gap-x-12">
        <div className="md:pt-1">
          <h2 id="now-title" className="flex items-center gap-2 text-sm text-muted">
            <span aria-hidden="true" className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent-soft opacity-60 motion-reduce:hidden" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            {t.now.label}
          </h2>
          <p className="mt-1 text-sm text-muted/80">{t.now.updated(updated)}</p>
        </div>

        <dl className="divide-y divide-line border-y border-line">
          {now.map((item) => (
            <div key={pick(item.label)} className="grid gap-1 py-4 sm:grid-cols-[8rem_1fr] sm:gap-6">
              <dt className="text-sm text-muted">{pick(item.label)}</dt>
              <dd className="text-fg">{pick(item.text)}</dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  )
}
