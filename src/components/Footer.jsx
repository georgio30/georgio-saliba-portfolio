import Icon from './Icons'
import { profile } from '../data/resume'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="border-t border-fg/10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-subtle sm:flex-row sm:px-6">
        <p>
          © {year} {profile.name}. Built with React, Tailwind CSS & AOS.
        </p>
        <div className="flex items-center gap-6">
          <a href={profile.github} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 transition hover:text-accent">
            <Icon name="github" className="size-4" /> GitHub
          </a>
          <a href="#home" className="flex items-center gap-1 transition hover:text-accent">
            Back to top <Icon name="up" className="size-4" />
          </a>
        </div>
      </div>
    </footer>
  )
}
