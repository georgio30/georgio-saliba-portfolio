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

// Real numbers from this visit, read from the browser's own timing data
export function usePageStats() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    const read = () => {
      const nav = performance.getEntriesByType('navigation')[0]
      const paint = performance.getEntriesByType('paint').find((e) => e.name === 'first-contentful-paint')
      const scripts = performance
        .getEntriesByType('resource')
        .filter((r) => r.name.startsWith(location.origin) && r.name.split('?')[0].endsWith('.js'))
      const bytes = scripts.reduce((sum, r) => sum + r.encodedBodySize, 0)
      setStats({
        paint: paint ? Math.round(paint.startTime) : null,
        load: nav?.loadEventEnd > 0 ? Math.round(nav.loadEventEnd) : null,
        // Compressed size of the scripts, the same whether or not they came from the cache
        scriptKb: bytes > 0 ? Math.round(bytes / 1024) : null,
      })
    }
    if (document.readyState === 'complete') {
      read()
      return
    }
    const onLoad = () => setTimeout(read, 0)
    window.addEventListener('load', onLoad, { once: true })
    return () => window.removeEventListener('load', onLoad)
  }, [])

  return stats
}

// True once the element has scrolled into view (and stays true)
export function useSeen(ref, rootMargin = '0px 0px -10% 0px') {
  // Without IntersectionObserver, everything counts as seen
  const [seen, setSeen] = useState(() => !('IntersectionObserver' in window))
  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { rootMargin })
    observer.observe(el)
    return () => observer.disconnect()
  }, [ref, rootMargin, seen])
  return seen
}

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
