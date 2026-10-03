import Reveal from './Reveal'
import Section from './Section'
import { experience } from '../data/resume'

const year = (period) => period.slice(-4)
const monthName = (mm) => new Date(2000, Number(mm) - 1).toLocaleString('en', { month: 'short' })

// "06/2026 – 09/2026" → "Jun – Sep"
const span = (period) =>
  period
    .split(' – ')
    .map((date) => monthName(date.slice(0, 2)))
    .join(' – ')

export default function Experience() {
  return (
    <Section id="experience" label="Experience" title="Two summers, two teams.">
      <ol className="border-t border-line">
        {experience.map((job, i) => (
          <Reveal as="li" key={job.company} delay={i * 80} className="border-b border-line">
            <article className="grid gap-x-12 gap-y-5 py-10 md:grid-cols-[9rem_1fr] md:py-14">
              <div className="flex items-baseline gap-4 md:block">
                <p className="font-display text-5xl leading-none text-fg/20 tabular-nums md:text-6xl">
                  {year(job.period)}
                </p>
                <p className="text-sm text-muted md:mt-3">{span(job.period)}</p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  <span className="font-medium text-fg">{job.company}</span> · {job.title} · {job.location}
                </p>
                <h3 className="mt-4 max-w-2xl text-balance font-display text-3xl leading-[1.15] text-fg md:text-4xl">
                  {job.headline}
                </h3>
                <p className="mt-4 max-w-2xl leading-relaxed text-muted">{job.story}</p>
                <p className="mt-5 text-sm text-muted">{job.tags.join(' · ')}</p>
              </div>
            </article>
          </Reveal>
        ))}
      </ol>
    </Section>
  )
}
