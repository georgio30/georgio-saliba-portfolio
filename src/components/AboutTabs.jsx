import { useId, useRef, useState } from 'react'
import { aboutTabs, enjoyedTech } from '../data/now'
import { projects } from '../data/projects'
import { experience } from '../data/resume'
import { useI18n } from '../i18n'

// Where a technology shows up: the projects that list it, and the jobs that tag it
function usedIn(tech, pick) {
  const fromProjects = projects.filter((p) => p.technologies.includes(tech)).map((p) => pick(p.title))
  const fromJobs = experience.filter((job) => job.tags.map(pick).includes(tech)).map((job) => job.company)
  return [...fromProjects, ...fromJobs]
}

// Three tabs: what I'm building, what I'm experimenting with, and the technologies I enjoy
export default function AboutTabs() {
  const { t, pick, dir } = useI18n()
  const uid = useId()
  const tabs = [...aboutTabs.map((tab) => tab.id), 'tech']
  const [current, setCurrent] = useState(tabs[0])
  const [tech, setTech] = useState(enjoyedTech[0])
  const tabRefs = useRef({})

  // Arrow keys move between tabs in reading order, so ← is "next" in Arabic
  const onKeyDown = (e) => {
    const step = { ArrowRight: 1, ArrowLeft: -1 }[e.key]
    const jump = { Home: 0, End: tabs.length - 1 }[e.key]
    if (!step && jump === undefined) return
    e.preventDefault()
    const i = tabs.indexOf(current)
    const next = jump ?? (i + step * (dir === 'rtl' ? -1 : 1) + tabs.length) % tabs.length
    setCurrent(tabs[next])
    tabRefs.current[tabs[next]]?.focus()
  }

  const items = aboutTabs.find((tab) => tab.id === current)?.items
  const places = usedIn(tech, pick)

  return (
    <div className="mt-12">
      <div role="tablist" aria-label={t.about.tabs.label} onKeyDown={onKeyDown} className="flex gap-1 border-b border-line">
        {tabs.map((id) => {
          const selected = id === current
          return (
            <button
              key={id}
              ref={(el) => (tabRefs.current[id] = el)}
              id={`${uid}-tab-${id}`}
              role="tab"
              type="button"
              aria-selected={selected}
              aria-controls={`${uid}-panel`}
              tabIndex={selected ? 0 : -1}
              onClick={() => setCurrent(id)}
              className={`relative -mb-px border-b-2 px-3 py-2.5 text-sm transition-colors duration-200 sm:px-4 ${
                selected ? 'border-accent text-fg' : 'border-transparent text-muted hover:text-fg'
              }`}
            >
              {t.about.tabs[id]}
            </button>
          )
        })}
      </div>

      <div id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${current}`} tabIndex={0} className="pt-6">
        {items ? (
          <ul className="space-y-5">
            {items.map((item) => (
              <li key={pick(item.title)}>
                <p className="font-display text-2xl leading-tight text-fg">{pick(item.title)}</p>
                <p className="mt-1 max-w-md leading-relaxed text-muted">{pick(item.text)}</p>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <ul className="flex flex-wrap gap-2">
              {enjoyedTech.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    aria-pressed={name === tech}
                    onClick={() => setTech(name)}
                    className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
                      name === tech
                        ? 'border-fg bg-fg text-ink'
                        : 'border-line text-fg hover:border-fg/40'
                    }`}
                  >
                    {name}
                  </button>
                </li>
              ))}
            </ul>
            <p aria-live="polite" className="mt-5 max-w-md leading-relaxed text-muted">
              <span className="text-fg">{tech}</span>
              {' · '}
              {places.length > 0 ? t.about.usedIn(places.join(t.comma)) : t.about.notYet}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
