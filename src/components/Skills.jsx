import Icon from './Icons'
import SectionHeading from './SectionHeading'
import { skills } from '../data/resume'

const marquee = ['Node.js', 'Express', 'MySQL', 'REST APIs', 'JWT', 'React', 'TypeScript', 'JavaScript', 'Tailwind CSS', 'React Native', 'Firebase', 'Git', 'Java', 'Python']

export default function Skills() {
  return (
    <section id="skills" className="py-24">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <SectionHeading eyebrow="04. Skills" title="My toolbox" />

        <div className="grid gap-6 sm:grid-cols-2">
          {skills.map((group, i) => (
            <div key={group.group} data-aos="flip-up" data-aos-delay={i * 100} className="card p-6">
              <div className="flex items-center gap-3">
                <span className="rounded-xl bg-accent/10 p-2.5 text-accent">
                  <Icon name={group.icon} className="size-5" />
                </span>
                <h3 className="text-lg font-semibold text-fg">{group.group}</h3>
              </div>
              <div className="mt-5 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-fg/10 bg-fg/[0.03] px-3 py-1.5 text-sm text-body transition hover:border-accent/50 hover:text-fg"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Infinite tech marquee */}
      <div
        data-aos="fade"
        className="relative mt-16 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]"
      >
        <div className="flex w-max animate-[marquee_30s_linear_infinite] gap-4 motion-reduce:animate-none">
          {[...marquee, ...marquee].map((tech, i) => (
            <span key={i} className="whitespace-nowrap rounded-full border border-fg/10 px-5 py-2 font-mono text-sm text-muted">
              {tech}
            </span>
          ))}
        </div>
      </div>
    </section>
  )
}
