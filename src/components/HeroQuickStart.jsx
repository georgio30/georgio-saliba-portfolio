import { projects } from '../data/projects'
import { profile } from '../data/resume'
import { useBeirutTime } from '../lib/hooks'
import { openProject } from '../lib/island'
import { pad } from '../lib/motion'
import { useI18n } from '../i18n'

// Where the archipelago isn't shown (phones, tablets, touch screens): a few quick facts,
// then the projects as a row of cards to swipe through, each opening its case study
export default function HeroQuickStart() {
  const { t, pick } = useI18n()
  const time = useBeirutTime()
  const chip = 'inline-flex items-center gap-2 rounded-full border border-line px-3 py-1.5 text-xs text-muted'

  return (
    <div className="mt-10">
      <ul className="flex flex-wrap gap-2">
        <li className={chip}>
          {pick(profile.location)} · {t.about.timeHere(time)}
        </li>
        <li className={chip}>
          <span aria-hidden="true" className="size-1.5 rounded-full bg-accent" />
          {t.hero.open}
        </li>
        <li className={chip} dir="ltr">
          React · TypeScript · Node.js · MySQL
        </li>
      </ul>

      <p id="hero-start" className="mt-10 text-sm text-muted">
        {t.hero.start}
      </p>
      <ol
        aria-labelledby="hero-start"
        className="chip-row -mx-5 mt-3 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 [scrollbar-width:none] sm:-mx-8 sm:scroll-px-8 sm:px-8"
      >
        {projects.map((project, i) => (
          <li key={project.slug} className="w-[72%] max-w-72 shrink-0 snap-start">
            <button
              type="button"
              onClick={() => openProject(project.slug, 'hero')}
              aria-label={t.work.openProject(pad(i + 1), pick(project.title))}
              className="group flex h-full w-full flex-col overflow-hidden rounded-[10px] border border-line bg-surface text-start transition-colors duration-200 hover:border-fg/30"
            >
              <span aria-hidden="true" className="block h-1.5 w-full" style={{ background: project.tone }} />
              <span className="flex flex-1 flex-col p-4">
                <span className="text-xs tabular-nums text-muted" dir="ltr">
                  {pad(i + 1)}
                </span>
                <span className="mt-1 font-display text-2xl leading-tight text-fg">{pick(project.title)}</span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{pick(project.summary)}</span>
                <span aria-hidden="true" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
                  {t.world.open} <span className="inline-block rtl:-scale-x-100">→</span>
                </span>
              </span>
            </button>
          </li>
        ))}
      </ol>
    </div>
  )
}
