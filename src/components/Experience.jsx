import Icon from './Icons'
import SectionHeading from './SectionHeading'
import { experience } from '../data/resume'

export default function Experience() {
  return (
    <section id="experience" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="02. Experience" title="Where I've worked" />

      <ol className="relative space-y-10 border-l border-fg/10 pl-6 sm:pl-10">
        {experience.map((job, i) => (
          <li key={job.company} data-aos="fade-up" data-aos-delay={i * 100} className="relative">
            <span className="absolute -left-[33px] top-6 flex size-4 items-center justify-center sm:-left-[49px]">
              {job.current && <span className="absolute size-4 animate-ping rounded-full bg-accent/50" />}
              <span className="relative size-3 rounded-full border-2 border-ink bg-accent ring-4 ring-accent/20" />
            </span>

            <article className="card p-6 sm:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-semibold text-fg">{job.title}</h3>
                  <p className="mt-1 flex items-center gap-2 text-accent">
                    <Icon name="briefcase" className="size-4" />
                    {job.company}
                  </p>
                </div>
                <div className="text-right text-sm">
                  <p className="font-mono text-body">{job.period}</p>
                  <p className="mt-1 flex items-center justify-end gap-1 text-subtle">
                    <Icon name="pin" className="size-3.5" /> {job.location}
                  </p>
                </div>
              </div>

              <ul className="mt-5 space-y-3">
                {job.points.map((point) => (
                  <li key={point} className="flex gap-3 text-muted">
                    <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-accent" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-6 flex flex-wrap gap-2">
                {job.tags.map((tag) => (
                  <span key={tag} className="rounded-full bg-accent/10 px-3 py-1 font-mono text-xs text-accent">
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  )
}
