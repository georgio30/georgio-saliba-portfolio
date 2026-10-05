import { profile } from '../data/resume'
import { useI18n } from '../i18n'

const year = new Date().getFullYear()

export default function Footer() {
  const { t, pick } = useI18n()

  return (
    <footer className="mx-auto max-w-6xl px-5 sm:px-8">
      <div className="flex flex-col justify-between gap-4 border-t border-line py-8 text-sm text-muted sm:flex-row">
        <p>
          © {year} {pick(profile.name)}. {t.footer.rights}
        </p>
        <a href="#home" className="transition-colors duration-200 hover:text-accent">
          {t.footer.top} ↑
        </a>
      </div>
    </footer>
  )
}
