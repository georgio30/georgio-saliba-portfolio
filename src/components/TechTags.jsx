import { useId, useState } from 'react'
import { projects } from '../data/projects'
import { useI18n } from '../i18n'

// The project's technologies as tags: pick one to see the other projects that use it,
// jump to one of them, or filter the gallery down to it
export default function TechTags({ project, onSelect, onFilter }) {
  const { t, pick } = useI18n()
  const uid = useId()
  const [tech, setTech] = useState(null)
  const others = tech ? projects.filter((p) => p.slug !== project.slug && p.technologies.includes(tech)) : []

  return (
    <div className="mt-3">
      <ul className="flex flex-wrap gap-2">
        {project.technologies.map((name) => {
          const count = projects.filter((p) => p.technologies.includes(name)).length
          const selected = name === tech
          return (
            <li key={name}>
              <button
                type="button"
                aria-expanded={selected}
                aria-controls={`${uid}-panel`}
                onClick={() => setTech(selected ? null : name)}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition-[color,background-color,border-color,transform] duration-200 hover:-translate-y-px ${
                  selected ? 'border-fg bg-fg text-ink' : 'border-line text-fg hover:border-fg/40'
                }`}
              >
                {name}
                {count > 1 && (
                  <span aria-hidden="true" className={`text-xs tabular-nums ${selected ? 'text-ink/60' : 'text-muted'}`}>
                    {count}
                  </span>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <div id={`${uid}-panel`} aria-live="polite" className="mt-3 min-h-6 text-sm">
        {!tech && <p className="text-muted">{t.project.tags.hint}</p>}
        {tech && (
          <div key={tech} className="snake-in flex flex-wrap items-center gap-x-3 gap-y-2">
            {others.length > 0 ? (
              <>
                <span className="text-muted">{t.project.tags.alsoIn}</span>
                {others.map((p) => (
                  <button
                    key={p.slug}
                    type="button"
                    onClick={() => onSelect(p.slug)}
                    className="link font-medium text-fg"
                  >
                    {pick(p.title)}
                  </button>
                ))}
                <span aria-hidden="true" className="text-line">
                  |
                </span>
                <button type="button" onClick={() => onFilter(tech)} className="link text-muted">
                  {t.project.tags.filter(tech)}
                </button>
              </>
            ) : (
              <span className="text-muted">{t.project.tags.onlyHere(tech)}</span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
