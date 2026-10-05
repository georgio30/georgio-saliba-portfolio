import { useI18n } from '../i18n'

// Generated stand-ins for projects without screenshots. They read like printed
// cards, so they keep their paper colours in dark mode too.

export function ProjectCover({ project, number }) {
  const { pick } = useI18n()
  return (
    <div
      className="@container flex size-full flex-col justify-between p-[6%] text-[#1b1a18]"
      style={{ backgroundColor: project.tone }}
    >
      <div className="flex items-start justify-between gap-4 text-[max(0.6rem,1.6cqw)] text-[#1b1a18]/60">
        <span>{pick(project.type)}</span>
        <span className="tabular-nums">{project.year}</span>
      </div>

      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -top-[0.62em] end-0 font-display text-[22cqw] leading-none text-[#1b1a18]/[0.07]"
        >
          {number}
        </span>
        <p className="relative font-display text-[9cqw] leading-[0.95] rtl:leading-[1.25]">{pick(project.title)}</p>
        <p className="relative mt-[0.8em] max-w-[34ch] text-[max(0.7rem,1.9cqw)] leading-snug text-[#1b1a18]/65">
          {pick(project.summary)}
        </p>
      </div>

      <p className="text-[max(0.6rem,1.6cqw)] text-[#1b1a18]/60">{project.technologies.join('  ·  ')}</p>
    </div>
  )
}

// "How it's built": the project's layers stacked top to bottom
export function ProjectLayers({ project }) {
  const { t, pick } = useI18n()
  return (
    <div
      className="@container flex size-full flex-col justify-center gap-[3%] px-[7%] py-[5%] text-[#1b1a18]"
      style={{ backgroundColor: project.tone }}
    >
      <p className="mb-[2%] text-[max(0.65rem,1.6cqw)] text-[#1b1a18]/60">{t.gallery.layers}</p>
      {project.layers.map((layer, i) => (
        <div key={i}>
          {i > 0 && <div aria-hidden="true" className="mx-auto mb-[3%] h-[2.5cqw] w-px bg-[#1b1a18]/25" />}
          <div className="flex flex-wrap items-baseline gap-x-6 gap-y-1 border-t border-[#1b1a18]/20 pt-[2.5%]">
            <span className="w-[7em] shrink-0 font-display text-[4.5cqw] leading-none">{pick(layer.name)}</span>
            <span className="text-[max(0.7rem,1.9cqw)] text-[#1b1a18]/70">{layer.items.map(pick).join(t.comma)}</span>
          </div>
        </div>
      ))}
    </div>
  )
}
