import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import en from './en'
import fr from './fr'
import ar from './ar'

export const languages = [
  { code: 'en', label: 'EN', name: 'English', locale: 'en' },
  { code: 'fr', label: 'FR', name: 'Français', locale: 'fr' },
  { code: 'ar', label: 'ع', name: 'العربية', locale: 'ar-LB', dir: 'rtl' },
]
const dictionaries = { en, fr, ar }

// index.html picks the language (saved or from the browser) and sets <html lang dir> before first paint
const initialLang = () => (document.documentElement.lang in dictionaries ? document.documentElement.lang : 'en')

const I18nContext = createContext(null)

export function I18nProvider({ children }) {
  const [lang, setLangState] = useState(initialLang)
  const { dir = 'ltr', locale } = languages.find((l) => l.code === lang)

  useEffect(() => {
    document.documentElement.lang = lang
    document.documentElement.dir = dir
    document.title = dictionaries[lang].meta.title
  }, [lang, dir])

  const setLang = useCallback((next) => {
    setLangState(next)
    try {
      localStorage.setItem('lang', next)
    } catch {
      // Storage unavailable — the language still applies for this visit
    }
  }, [])

  const value = useMemo(
    () => ({
      lang,
      dir,
      locale,
      setLang,
      t: dictionaries[lang],
      // Data fields are either a plain value (same in every language) or { en, fr, ar }
      pick: (v) => (v && typeof v === 'object' && !Array.isArray(v) ? (v[lang] ?? v.en) : v),
    }),
    [lang, dir, locale, setLang],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export const useI18n = () => useContext(I18nContext)
