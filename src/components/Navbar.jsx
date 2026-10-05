import { useEffect, useRef, useState } from 'react'
import Icon from './Icons'
import ThemeToggle from './ThemeToggle'
import LanguageSwitcher from './LanguageSwitcher'
import { profile } from '../data/resume'
import { useI18n } from '../i18n'

const links = [
  { id: 'work' },
  { id: 'experience' },
  { id: 'about' },
  { id: 'github', href: profile.github },
  { id: 'contact' },
]
const sections = ['home', 'work', 'experience', 'about', 'contact']

function NavLink({ link, active, className, onClick, tabIndex }) {
  const { t } = useI18n()
  const external = Boolean(link.href)
  return (
    <a
      href={link.href ?? `#${link.id}`}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      aria-current={active ? 'true' : undefined}
      onClick={onClick}
      tabIndex={tabIndex}
      className={className}
    >
      {t.nav[link.id]}
      {external && (
        <span aria-hidden="true" className="ms-0.5 inline-block text-[0.8em] text-muted rtl:-scale-x-100">
          ↗
        </span>
      )}
    </a>
  )
}

export default function Navbar() {
  const { t } = useI18n()
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState('')
  const progressRef = useRef(null)

  // Header background + the thin reading-progress line along its bottom edge
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      setScrolled(window.scrollY > 20)
      progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
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
    sections.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
    return () => observer.disconnect()
  }, [])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled || open ? 'bg-ink/90 backdrop-blur-sm' : ''
      }`}
    >
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <a href="#home" dir="ltr" className="font-display text-2xl text-fg">
          Georgio<span className="text-accent-soft">.</span>
        </a>

        <div className="flex items-center gap-2 md:gap-8">
          <ul className="hidden items-center gap-7 md:flex">
            {links.map((link) => (
              <li key={link.id}>
                <NavLink
                  link={link}
                  active={!link.href && active === link.id}
                  className={`relative text-sm transition-colors duration-200 after:absolute after:-bottom-2 after:left-1/2 after:size-1 after:-translate-x-1/2 after:rounded-full after:bg-accent after:transition-opacity after:duration-300 ${
                    !link.href && active === link.id ? 'text-fg after:opacity-100' : 'text-muted after:opacity-0 hover:text-fg'
                  }`}
                />
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>

          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="rounded-full p-2 text-fg transition-colors hover:bg-fg/5 md:hidden"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            aria-expanded={open}
          >
            <Icon name={open ? 'close' : 'menu'} className="size-5" />
          </button>
        </div>
      </nav>

      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-out md:hidden ${
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <ul className="min-h-0 overflow-hidden px-5 sm:px-8">
          {links.map((link) => (
            <li key={link.id} className="border-t border-line first:border-t-0">
              <NavLink
                link={link}
                active={!link.href && active === link.id}
                onClick={() => setOpen(false)}
                tabIndex={open ? undefined : -1}
                className={`flex items-center py-3.5 font-display text-2xl ${
                  !link.href && active === link.id ? 'text-accent' : 'text-fg'
                }`}
              />
            </li>
          ))}
        </ul>
      </div>

      <div
        className={`h-px transition-colors duration-300 ${scrolled || open ? 'bg-line' : 'bg-transparent'}`}
        aria-hidden="true"
      >
        <div ref={progressRef} className="h-px origin-left scale-x-0 bg-accent rtl:origin-right" />
      </div>
    </header>
  )
}
