import Reveal from './Reveal'
import Section from './Section'
import { education, languages, profile, toolbox } from '../data/resume'
import { useBeirutTime } from '../lib/hooks'
import { useI18n } from '../i18n'

const year = (period) => period.slice(-4)

export default function About() {
  const { t, pick } = useI18n()
  const time = useBeirutTime()

  const facts = [
    {
      label: t.about.basedIn,
      value: (
        <>
          {pick(profile.location)} <span className="text-muted">· {t.about.timeHere(time)}</span>
        </>
      ),
    },
    { label: t.about.studied, value: t.about.degree(education.period.slice(3, 7), year(education.period)) },
    { label: t.about.speaks, value: languages.map((l) => pick(l.name)).join(t.comma) },
  ]

  return (
    <Section id="about" label={t.about.label}>
      <div className="grid gap-14 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <Reveal>
          <p className="font-display text-3xl leading-[1.25] text-fg md:text-4xl rtl:leading-[1.5]">{t.about.intro}</p>

          <h3 className="mt-12 text-sm text-muted">{t.about.enjoy}</h3>
          <ul className="mt-4 space-y-3 text-fg">
            {t.about.enjoyList.map((item) => (
              <li key={item} className="flex gap-3">
                <span aria-hidden="true" className="mt-[0.7em] h-px w-3 shrink-0 bg-accent-soft" />
                {item}
              </li>
            ))}
          </ul>

          {profile.learning?.length > 0 && (
            <>
              <h3 className="mt-10 text-sm text-muted">{t.about.learning}</h3>
              <p className="mt-3 text-fg">{profile.learning.map(pick).join(t.comma)}</p>
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

          <h3 className="mt-10 text-sm text-muted">{t.about.toolbox}</h3>
          <p className="mt-3 leading-relaxed text-fg">
            {toolbox.map(pick).join(' · ')}
          </p>
        </Reveal>
      </div>
    </Section>
  )
}
