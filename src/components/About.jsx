import SectionHeading from './SectionHeading'
import { profile, stats } from '../data/resume'

export default function About() {
  return (
    <section id="about" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading eyebrow="01. About" title="A little about me" />

      <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr]">
        <div data-aos="fade-right" className="space-y-5 text-lg leading-relaxed text-muted">
          <p>{profile.summary}</p>
          <p>
            I recently earned my <span className="text-fg">B.Sc. in Computer Science</span> from AUL and I'm
            currently a <span className="text-fg">Frontend Developer Intern at York Press</span>, where I build
            modular React + TypeScript interfaces, connect them to REST APIs and work in a Git-based, Agile team.
          </p>
          <p>
            On my own projects I own the whole stack — designing MySQL schemas, building Express APIs with JWT
            authentication and role-based access, and shipping the React interface on top. Recent builds include a
            clinic management system, an e-commerce store and a cross-platform recipe app.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 self-start lg:grid-cols-1">
          {stats.map((s, i) => (
            <div key={s.label} data-aos="fade-left" data-aos-delay={i * 100} className="card p-5 text-center lg:text-left">
              <p className="text-gradient text-3xl font-extrabold">{s.value}</p>
              <p className="mt-1 text-sm text-muted">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
