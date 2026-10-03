import Icon from './Icons'
import SectionHeading from './SectionHeading'
import { profile } from '../data/resume'

const channels = [
  { icon: 'mail', label: 'Email', value: profile.email, href: `mailto:${profile.email}` },
  { icon: 'phone', label: 'Phone', value: profile.phone, href: profile.phoneHref },
  { icon: 'github', label: 'GitHub', value: 'github.com/georgio30', href: profile.github, external: true },
  { icon: 'linkedin', label: 'LinkedIn', value: 'Georgio Saliba', href: profile.linkedin, external: true },
]

export default function Contact() {
  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        eyebrow="06. Contact"
        title="Let's work together"
        subtitle="Have a role, a project or just want to say hi? Reach out through any of these."
      />

      <div data-aos="fade-up" className="card p-6 sm:p-10">
        <div className="flex flex-col gap-1">
          <p className="text-2xl font-bold text-fg sm:text-3xl">{profile.name}</p>
          <p className="text-gradient font-mono text-sm font-medium">{profile.role}</p>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4">
          {channels.map((c, i) => (
            <li key={c.label} data-aos="fade-up" data-aos-delay={100 + i * 100}>
              {/* Phones: compact icon + label tile; sm and up: full row with the value */}
              <a
                href={c.href}
                target={c.external ? '_blank' : undefined}
                rel={c.external ? 'noreferrer' : undefined}
                aria-label={`${c.label}: ${c.value}`}
                className="group flex h-full flex-col items-center gap-3 rounded-xl border border-fg/10 bg-fg/[0.03] p-4 text-center transition hover:-translate-y-0.5 hover:border-accent/50 sm:flex-row sm:gap-4 sm:text-left"
              >
                <span className="rounded-xl bg-accent/10 p-3 text-accent transition group-hover:bg-accent group-hover:text-ink">
                  <Icon name={c.icon} className="size-5" />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-fg sm:font-normal sm:text-subtle">{c.label}</span>
                  <span className="hidden truncate text-fg sm:block">{c.value}</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
