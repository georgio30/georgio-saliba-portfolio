import { profile } from '../data/resume'

const year = new Date().getFullYear()

export default function Footer() {
  return (
    <footer className="mx-auto max-w-6xl px-5 sm:px-8">
      <div className="flex flex-col justify-between gap-4 border-t border-line py-8 text-sm text-muted sm:flex-row">
        <p>
          © {year} {profile.name}. All rights reserved.
        </p>
        <a href="#home" className="transition-colors duration-200 hover:text-accent">
          Back to top ↑
        </a>
      </div>
    </footer>
  )
}
