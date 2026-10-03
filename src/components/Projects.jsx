import Icon from './Icons'
import SectionHeading from './SectionHeading'
import { projects } from '../data/resume'

export default function Projects() {
  return (
    <section id="projects" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionHeading
        eyebrow="03. Projects"
        title="Things I've built"
        subtitle="End-to-end applications where I designed the database, built the API and shipped the interface."
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {projects.map((project, i) => (
          <article
            key={project.name}
            data-aos="fade-up"
            data-aos-delay={i * 120}
            className="card group flex flex-col overflow-hidden hover:-translate-y-1"
            style={{ transitionProperty: 'transform, border-color, background-color' }}
          >
            <div className="relative flex h-40 items-center justify-center border-b border-line bg-line/60 dark:bg-ink">
              <div className="relative rounded-2xl border border-line bg-surface p-5 text-accent transition-transform duration-300 group-hover:scale-105">
                <Icon name={project.icon} className="size-10" />
              </div>
              <span className="absolute right-4 top-4 rounded-full border border-line bg-surface px-2.5 py-1 font-mono text-xs text-muted">
                {project.year}
              </span>
            </div>

            <div className="flex flex-1 flex-col p-6">
              <p className="font-mono text-xs uppercase tracking-wider text-accent">{project.type}</p>
              <h3 className="mt-2 text-xl font-semibold text-fg">{project.name}</h3>
              <p className="mt-3 flex-1 text-muted">{project.description}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {project.stack.map((tech) => (
                  <span key={tech} className="rounded-md border border-line px-2 py-1 font-mono text-xs text-body">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
