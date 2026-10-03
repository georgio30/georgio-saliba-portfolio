import Icon from './Icons'
import SectionHeading from './SectionHeading'
import { education, languages } from '../data/resume'

export default function Education() {
  return (
    <section id="education" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="05. Education" title="Education & languages" />

      <div className="grid gap-6 lg:grid-cols-2">
        <div data-aos="fade-right" className="card p-6 sm:p-8">
          <span className="inline-flex rounded-xl bg-accent/10 p-3 text-accent">
            <Icon name="cap" className="size-7" />
          </span>
          <h3 className="mt-5 text-xl font-semibold text-fg">{education.degree}</h3>
          <p className="mt-2 text-muted">{education.school}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm">
            <span className="rounded-full border border-line bg-ink px-3 py-1 font-mono text-body">{education.period}</span>
            <span className="flex items-center gap-1 text-subtle">
              <Icon name="pin" className="size-4" /> {education.location}
            </span>
          </div>
        </div>

        <div data-aos="fade-left" className="card p-6 sm:p-8">
          <span className="inline-flex rounded-xl bg-accent/10 p-3 text-accent">
            <Icon name="globe" className="size-7" />
          </span>
          <h3 className="mt-5 text-xl font-semibold text-fg">Languages</h3>
          <ul className="mt-6 space-y-5">
            {languages.map((lang, i) => (
              <li key={lang.name}>
                <div className="flex justify-between text-sm">
                  <span className="text-fg">{lang.name}</span>
                  <span className="text-muted">{lang.level}</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-line">
                  <div
                    data-aos="slide-right"
                    data-aos-delay={200 + i * 150}
                    data-aos-duration="1000"
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${lang.value}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
