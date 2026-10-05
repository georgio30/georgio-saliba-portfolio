import Reveal from './Reveal'
import Section from './Section'
import { experience } from '../data/resume'
import { useI18n } from '../i18n'

const year = (period) => period.slice(-4)
const monthName = (mm, locale) => new Date(2000, Number(mm) - 1).toLocaleString(locale, { month: 'short' })

// "06/2026 – 09/2026" → "Jun – Sep"
const span = (period, locale) =>
  period
    .split(' – ')
    .map((date) => monthName(date.slice(0, 2), locale))
    .join(' – ')

export default function Experience() {
  const { t, pick, locale } = useI18n()

  return (
    <Section id="experience" label={t.experience.label} title={t.experience.title}>
      <ol className="border-t border-line">
        {experience.map((job, i) => (
          <Reveal as="li" key={job.company} delay={i * 80} className="border-b border-line">
            <article className="grid gap-x-12 gap-y-5 py-10 md:grid-cols-[9rem_1fr] md:py-14">
              <div className="flex items-baseline gap-4 md:block">
                <p className="font-display text-5xl leading-none text-fg/20 tabular-nums md:text-6xl">
                  {year(job.period)}
                </p>
                <p className="text-sm text-muted md:mt-3">{span(job.period, locale)}</p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  <span className="font-medium text-fg">{job.company}</span> · {pick(job.title)} · {pick(job.location)}
                </p>
                <h3 className="mt-4 max-w-2xl text-balance font-display text-3xl leading-[1.15] text-fg md:text-4xl rtl:leading-[1.4]">
                  {pick(job.headline)}
                </h3>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted">{pick(job.story)}</p>
                <p className="mt-5 text-sm text-muted">{job.tags.map(pick).join(' · ')}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
