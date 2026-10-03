import Reveal from './Reveal'
import Section from './Section'
import { education, languages, profile, toolbox } from '../data/resume'
import { useBeirutTime } from '../lib/hooks'

const year = (period) => period.slice(-4)

export default function About() {
  const time = useBeirutTime()

  const facts = [
    {
      label: 'Based in',
      value: (
        <>
          {profile.location} <span className="text-muted">· it's {time} here</span>
        </>
      ),
    },
    { label: 'Studied', value: `B.Sc. Computer Science, AUL (${education.period.slice(3, 7)}–${year(education.period)})` },
    { label: 'Speaks', value: languages.map((l) => l.name).join(', ') },
  ]

  return (
    <Section id="about" label="About">
      <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <Reveal>
          <p className="font-display text-3xl leading-[1.25] text-fg md:text-4xl">
            I'm Georgio, a developer from Lebanon who likes owning the whole thing: the tables, the API, and the last
            hover state.
          </p>

          <h3 className="mt-12 text-sm text-muted">What I enjoy building</h3>
          <ul className="mt-4 space-y-3 text-fg">
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-accent-soft" />
              Complete apps, from the database schema up to the interface
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-accent-soft" />
              Secure sign-in: JWT authentication and role-based access
            </li>
            <li className="flex gap-3">
              <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-accent-soft" />
              Interfaces that hold up on every screen size
            </li>
          </ul>

          {profile.learning?.length > 0 && (
            <>
              <h3 className="mt-10 text-sm text-muted">Currently learning</h3>
              <p className="mt-3 text-fg">{profile.learning.join(', ')}</p>
            </>
          )}
        </Reveal>

        <Reveal delay={100}>
          <dl className="border-t border-line">
            {facts.map((f) => (
              <div key={f.label} className="grid grid-cols-[7rem_1fr] gap-4 border-b border-line py-4 text-sm sm:text-base">
                <dt className="text-muted">{f.label}</dt>
                <dd className="text-fg">{f.value}</dd>
              </div>
            ))}
          </dl>

          <h3 className="mt-10 text-sm text-muted">Usually reaching for</h3>
          <p className="mt-3 leading-relaxed text-fg">
            {toolbox.join(' · ')}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
