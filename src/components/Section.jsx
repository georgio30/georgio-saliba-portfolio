// Editorial section: a small label in a narrow left column, content on the right
export default function Section({ id, label, title, children }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-5 py-24 sm:px-8 md:py-32">
      <div className="grid gap-y-10 md:grid-cols-[11rem_1fr] md:gap-x-12">
        <p className="text-sm text-muted md:pt-3">{label}</p>
        <div>
          {title && (
            <h2 className="mb-12 max-w-2xl text-balance font-display text-4xl leading-[1.1] text-fg md:mb-16 md:text-5xl">{title}</h2>
          )}
          {children}
        </div>
      </div>
    </section>
  )
}
