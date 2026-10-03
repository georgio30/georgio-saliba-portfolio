import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'

const beirutTime = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Beirut' })

export function useBeirutTime() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(timer)
  }, [])
  return beirutTime.format(now)
}

export function useMediaQuery(query) {
  const subscribe = useCallback(
    (notify) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', notify)
      return () => mql.removeEventListener('change', notify)
    },
    [query],
  )
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches)
}

export const useReducedMotion = () => useMediaQuery('(prefers-reduced-motion: reduce)')

// The theme lives on <html class="dark">; every toggle reads and writes it there
function subscribeTheme(notify) {
  const observer = new MutationObserver(notify)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

export function useTheme() {
  const dark = useSyncExternalStore(subscribeTheme, () => document.documentElement.classList.contains('dark'))
  const setDark = useCallback((next) => {
    document.documentElement.classList.toggle('dark', next)
    try {
      localStorage.setItem('theme', next ? 'dark' : 'light')
    } catch {
      // Storage unavailable (private mode etc.) — the theme still applies for this visit
    }
  }, [])
  return [dark, setDark]
}
