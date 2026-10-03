import { useEffect, useState } from 'react'
import Icon from './Icons'
import ThemeToggle from './ThemeToggle'

const links = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Highlight the nav link of the section currently in view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id)
        })
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    links.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-fg/10 bg-ink/80 backdrop-blur-lg' : 'bg-transparent'
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <a href="#home" className="font-mono text-lg font-semibold text-fg">
          <span className="text-accent">&lt;</span>GS<span className="text-accent"> /&gt;</span>
        </a>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className={`rounded-lg px-3 py-2 text-sm transition-colors ${
                  active === id ? 'text-accent' : 'text-muted hover:text-fg'
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <a
            href="#contact"
            className="hidden rounded-lg border border-accent/50 px-4 py-2 text-sm font-medium text-accent transition hover:bg-accent/10 md:inline-block"
          >
            Hire me
          </a>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-lg p-2 text-body hover:bg-fg/5 md:hidden"
            aria-label={open ? 'Close menu' : 'Open menu'}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} className="size-6" />
          </button>
        </div>
      </nav>

      <div
        className={`grid overflow-hidden transition-all duration-300 md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <ul className="min-h-0 space-y-1 px-4 pb-4">
          {links.map(({ id, label }) => (
            <li key={id}>
              <a
                href={`#${id}`}
                onClick={() => setOpen(false)}
                className={`block rounded-lg px-3 py-2.5 ${
                  active === id ? 'bg-accent/10 text-accent' : 'text-body hover:bg-fg/5'
                }`}
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </header>
  )
}
