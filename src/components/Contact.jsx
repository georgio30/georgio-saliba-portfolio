import { useEffect, useState } from 'react'
import Reveal from './Reveal'
import Section from './Section'
import { profile } from '../data/resume'
import { useI18n } from '../i18n'

const elsewhere = (t) => [
  { label: 'GitHub', value: 'github.com/georgio30', href: profile.github },
  { label: 'LinkedIn', value: 'Georgio Saliba', href: profile.linkedin },
  { label: t.contact.phone, value: profile.phone, href: profile.phoneHref, ltr: true },
]

function CopyEmail() {
  const { t } = useI18n()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!copied) return
    const timer = setTimeout(() => setCopied(false), 1800)
    return () => clearTimeout(timer)
  }, [copied])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email)
      setCopied(true)
    } catch {
      // Clipboard blocked: the mailto link right next to it still works
    }
  }

  return (
    <button
      type="button"
      onClick={copy}
      className="rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors duration-200 hover:border-fg/30 hover:text-fg"
    >
      <span aria-live="polite">{copied ? t.contact.copied : t.contact.copy}</span>
    </button>
  )
}

export default function Contact() {
  const { t } = useI18n()

  return (
    <Section id="contact" label="Contact">
      <Reveal>
        <h2 className="max-w-3xl font-display text-5xl leading-[1.05] text-fg md:text-7xl rtl:leading-[1.35]">
          {t.contact.heading}
          <em className="text-accent">{t.contact.headingEm}</em>
        </h2>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <a href={`mailto:${profile.email}`} className="link text-xl font-medium text-fg md:text-2xl">
            {profile.email}
          </a>
          <CopyEmail />
        </div>
        <p className="mt-3 text-sm text-muted">{t.contact.quickest}</p>

        <ul className="mt-16 grid max-w-3xl gap-6 border-t border-line pt-8 sm:grid-cols-3">
          {elsewhere(t).map((c) => {
            const external = c.href.startsWith('http')
            return (
              <li key={c.label}>
                <p className="text-sm text-muted">{c.label}</p>
                <a
                  href={c.href}
                  target={external ? '_blank' : undefined}
                  rel={external ? 'noreferrer' : undefined}
                  dir={c.ltr ? 'ltr' : undefined}
                  className="link mt-1 inline-block text-fg"
                >
                  {c.value}
                </a>
              </li>
            )
          })}
        </ul>
      </Reveal>
    </Section>
  )
}
