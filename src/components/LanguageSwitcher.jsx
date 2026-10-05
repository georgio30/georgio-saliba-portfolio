import { languages, useI18n } from '../i18n'

export default function LanguageSwitcher() {
  const { lang, setLang, t } = useI18n()

  return (
    <div role="group" aria-label={t.nav.language} className="flex items-center rounded-full border border-line p-0.5">
      {languages.map((l) => (
        <button
          key={l.code}
          type="button"
          lang={l.code}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          aria-label={l.name}
          title={l.name}
          className={`h-7 min-w-7 rounded-full px-2 text-xs font-medium transition-colors duration-200 ${
            lang === l.code ? 'bg-fg text-ink' : 'text-muted hover:text-fg'
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  )
}
