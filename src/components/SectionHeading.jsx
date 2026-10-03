export default function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mb-12 md:mb-16" data-aos="fade-up">
      <p className="font-mono text-sm text-accent">{eyebrow}</p>
      <h2 className="mt-2 text-3xl font-bold tracking-tight text-fg md:text-4xl">{title}</h2>
      {subtitle && <p className="mt-4 max-w-2xl text-muted">{subtitle}</p>}
    </div>
  )
}
