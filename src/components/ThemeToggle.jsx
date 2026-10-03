import { useState } from 'react'
import Icon from './Icons'

export default function ThemeToggle() {
  // The initial class is set by the inline script in index.html
  const [dark, setDark] = useState(() => document.documentElement.classList.contains('dark'))

  const toggle = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // Storage unavailable (private mode etc.) — the theme still applies for this visit
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Light mode' : 'Dark mode'}
      className="relative flex size-10 items-center justify-center overflow-hidden rounded-lg text-body transition hover:bg-fg/5 hover:text-accent"
    >
      <span className={`absolute transition-all duration-500 ${dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`}>
        <Icon name="sun" className="size-5" />
      </span>
      <span className={`absolute transition-all duration-500 ${dark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`}>
        <Icon name="moon" className="size-5" />
      </span>
    </button>
  )
}
