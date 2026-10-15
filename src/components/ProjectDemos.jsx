import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { projects } from '../data/projects'
import { clamp, pad, place } from '../lib/stage'
import { useI18n } from '../i18n'

// Small, self-contained demos for the case studies, picked by id in a project's `demos` list.
// They're sketches of an idea with made-up data, and say so.

function Frame({ title, note, children }) {
  return (
    <figure className="rounded-[8px] border border-line bg-surface p-4 sm:p-6">
      <figcaption className="mb-5">
        <p className="font-display text-2xl leading-snug text-fg rtl:leading-[1.5]">{title}</p>
        {note && <p className="mt-1 text-sm text-muted">{note}</p>}
      </figcaption>
      {children}
    </figure>
  )
}

const pill = (active) =>
  `rounded-full border px-3.5 py-1.5 text-sm transition-colors duration-200 ${
    active ? 'border-fg bg-fg text-ink' : 'border-line text-fg hover:border-fg/40'
  }`

const button =
  'inline-flex items-center justify-center rounded-full border border-line px-4 py-2 text-sm font-medium text-fg transition-colors duration-200 hover:border-fg/30 disabled:opacity-40'
const primary =
  'inline-flex items-center justify-center rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-accent hover:text-on-accent disabled:opacity-40'

/* Saliba Polyclinic: the same request, with the role checked in the interface only vs on the server */
function AccessDemo() {
  const { t } = useI18n()
  const d = t.demos.access
  const [role, setRole] = useState('patient')
  const allowed = role !== 'patient'
  const RECORDS = 42

  const column = (server) => {
    const ok = allowed || !server
    const leaked = !allowed && !server
    return (
      <div className={`rounded-[8px] border p-4 transition-colors duration-300 ${leaked ? 'border-accent/60' : 'border-line'}`}>
        <p className="text-sm font-medium text-fg">{server ? d.after : d.before}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="text-muted">{d.button}</dt>
            <dd className="text-fg">{allowed ? d.shown : d.hidden}</dd>
          </div>
        </dl>
        <div key={`${role}-${server}`} className="snake-in mt-3 rounded-[6px] bg-ink p-3 font-mono text-xs leading-relaxed" dir="ltr">
          <p className="text-muted">GET /api/patients</p>
          <p className={leaked ? 'text-accent' : 'text-fg'}>{ok ? d.ok(RECORDS) : d.denied}</p>
        </div>
        <p className={`mt-3 flex gap-2 text-sm leading-snug ${leaked ? 'text-accent' : 'text-muted'}`}>
          <span aria-hidden="true">{leaked ? '⚠' : '✓'}</span>
          {leaked ? d.leak : allowed ? d.allowed : d.safe}
        </p>
      </div>
    )
  }

  return (
    <Frame title={d.title} note={t.project.demoNote}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="me-1 text-sm text-muted">{d.role}</span>
        {['admin', 'doctor', 'patient'].map((r) => (
          <button key={r} type="button" aria-pressed={role === r} onClick={() => setRole(r)} className={pill(role === r)}>
            {d.roles[r]}
          </button>
        ))}
      </div>
      <p className="mt-4 text-sm text-muted">
        {d.request}: <span className="text-fg">{d.requestText}</span>
      </p>
      <div className="mt-4 grid gap-3 md:grid-cols-2" aria-live="polite">
        {column(false)}
        {column(true)}
      </div>
    </Frame>
  )
}

/* Iverse: a tiny store, from the product list to a placed order that needs an account */
const PRICES = [39, 24, 58]
const TONES = ['#e9e2d4', '#dcd6c8', '#f1e2d9']

function CheckoutDemo() {
  const { t, locale } = useI18n()
  const d = t.demos.checkout
  const [step, setStep] = useState('browse')
  const [cart, setCart] = useState({})
  const [signedIn, setSignedIn] = useState(false)
  const [placed, setPlaced] = useState(false)
  const money = useMemo(() => new Intl.NumberFormat(locale, { style: 'currency', currency: 'USD' }), [locale])
  const count = Object.values(cart).reduce((a, b) => a + b, 0)
  const total = Object.entries(cart).reduce((sum, [i, n]) => sum + PRICES[i] * n, 0)
  const steps = ['browse', 'cart', 'checkout']
  const reset = () => {
    setStep('browse')
    setCart({})
    setSignedIn(false)
    setPlaced(false)
  }

  return (
    <Frame title={d.title} note={t.project.demoNote}>
      <ol className="flex items-center gap-2 text-sm">
        {steps.map((s, i) => {
          const done = steps.indexOf(step) > i || placed
          const current = s === step && !placed
          return (
            <li key={s} aria-current={current ? 'step' : undefined} className="flex flex-1 items-center gap-2">
              <span
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border text-xs tabular-nums transition-colors duration-300 ${
                  current ? 'border-accent bg-accent text-on-accent' : done ? 'border-fg bg-fg text-ink' : 'border-line text-muted'
                }`}
              >
                {done ? '✓' : i + 1}
              </span>
              <span className={current || done ? 'text-fg' : 'text-muted'}>{d.steps[s]}</span>
              {i < steps.length - 1 && <span aria-hidden="true" className="h-px flex-1 bg-line" />}
            </li>
          )
        })}
      </ol>

      <div key={placed ? 'placed' : step} className="snake-in mt-5 min-h-56" aria-live="polite">
        {placed ? (
          <div className="flex flex-col items-start gap-4 py-6">
            <p className="font-display text-2xl text-fg">✓ {d.placed}</p>
            <button type="button" onClick={reset} className={button}>
              {d.again}
            </button>
          </div>
        ) : step === 'browse' ? (
          <>
            <ul className="divide-y divide-line">
              {d.products.map((name, i) => (
                <li key={i} className="flex items-center gap-4 py-3">
                  <span aria-hidden="true" className="size-10 shrink-0 rounded-[6px]" style={{ backgroundColor: TONES[i] }} />
                  <span className="flex-1 text-fg">{name}</span>
                  <span className="text-sm text-muted tabular-nums">{money.format(PRICES[i])}</span>
                  <button
                    type="button"
                    onClick={() => setCart((c) => ({ ...c, [i]: (c[i] ?? 0) + 1 }))}
                    className={`${button} min-w-20`}
                  >
                    {cart[i] ? `${d.added} · ${cart[i]}` : d.add}
                  </button>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm text-muted">{count ? d.inCart(count) : d.empty}</p>
              <button type="button" disabled={!count} onClick={() => setStep('cart')} className={primary}>
                {d.toCart}
              </button>
            </div>
          </>
        ) : step === 'cart' ? (
          <>
            {count ? (
              <ul className="divide-y divide-line">
                {Object.entries(cart).map(([i, n]) => (
                  <li key={i} className="flex items-center gap-4 py-3">
                    <span className="flex-1 text-fg">
                      {d.products[i]} <span className="text-muted tabular-nums">× {n}</span>
                    </span>
                    <span className="text-sm text-fg tabular-nums">{money.format(PRICES[i] * n)}</span>
                    <button
                      type="button"
                      aria-label={d.remove(d.products[i])}
                      onClick={() =>
                        setCart((c) => {
                          const next = { ...c }
                          delete next[i]
                          return next
                        })
                      }
                      className="flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-fg/5 hover:text-fg"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="py-3 text-muted">{d.empty}</p>
            )}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <p className="text-fg">
                <span className="text-muted">{d.total}</span> <span className="tabular-nums">{money.format(total)}</span>
              </p>
              <div className="flex gap-2">
                <button type="button" onClick={() => setStep('browse')} className={button}>
                  {d.back}
                </button>
                <button type="button" disabled={!count} onClick={() => setStep('checkout')} className={primary}>
                  {d.toCheckout}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-start gap-4 py-2">
            <p className="text-fg">
              <span className="text-muted">{d.total}</span> <span className="tabular-nums">{money.format(total)}</span>
            </p>
            {signedIn ? (
              <>
                <p className="text-sm text-muted">✓ {d.signedIn}</p>
                <button type="button" onClick={() => setPlaced(true)} className={primary}>
                  {d.place}
                </button>
              </>
            ) : (
              <>
                <p className="max-w-md text-sm leading-relaxed text-muted">{d.signInFirst}</p>
                <button type="button" onClick={() => setSignedIn(true)} className={primary}>
                  {d.signIn}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </Frame>
  )
}

/* Recipe Finder: what the screen shows while waiting, when nothing matches, and when the request fails */
const RECIPES = [
  { minutes: 35, tone: '#d9b98b', name: { en: 'Lentil soup', fr: 'Soupe de lentilles', ar: 'شوربة عدس' } },
  { minutes: 45, tone: '#ead27a', name: { en: 'Lemon garlic chicken', fr: 'Poulet au citron et à l’ail', ar: 'دجاج بالليمون والثوم' } },
  { minutes: 20, tone: '#d9826b', name: { en: 'Tomato basil pasta', fr: 'Pâtes tomate et basilic', ar: 'معكرونة بالطماطم والريحان' } },
  { minutes: 15, tone: '#a9c18c', name: { en: 'Fattoush', fr: 'Fattouche', ar: 'فتوش' } },
  { minutes: 20, tone: '#8fb27c', name: { en: 'Tabbouleh', fr: 'Taboulé', ar: 'تبولة' } },
  { minutes: 25, tone: '#d97a5c', name: { en: 'Shakshuka', fr: 'Chakchouka', ar: 'شكشوكة' } },
  { minutes: 60, tone: '#efd98f', name: { en: 'Lemon drizzle cake', fr: 'Gâteau au citron', ar: 'كعكة الليمون' } },
  { minutes: 30, tone: '#b9a68c', name: { en: 'Mushroom soup', fr: 'Soupe aux champignons', ar: 'شوربة الفطر' } },
  { minutes: 15, tone: '#e8cf9a', name: { en: 'Banana pancakes', fr: 'Pancakes à la banane', ar: 'فطائر الموز' } },
]
const fold = (s) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

function RecipesDemo() {
  const { t, pick } = useI18n()
  const d = t.demos.recipes
  const uid = useId()
  const [query, setQuery] = useState('')
  const [fail, setFail] = useState(false)
  const [state, setState] = useState({ status: 'idle' })
  const [attempt, setAttempt] = useState(0)

  // Wait for typing to pause, then pretend to call the API
  useEffect(() => {
    const q = fold(query)
    if (!q) return
    let loading
    const debounce = setTimeout(() => {
      setState({ status: 'loading' })
      loading = setTimeout(() => {
        if (fail) return setState({ status: 'error' })
        const results = RECIPES.filter((r) => fold(pick(r.name)).includes(q) || fold(r.name.en).includes(q))
        setState({ status: results.length ? 'results' : 'none', results })
      }, 750)
    }, 300)
    return () => {
      clearTimeout(debounce)
      clearTimeout(loading)
    }
  }, [query, fail, attempt, pick])

  // An empty box is always the idle screen, whatever the last search left behind
  const status = fold(query) ? state.status : 'idle'
  const announce = {
    idle: '',
    loading: d.loading,
    results: state.results && d.found(state.results.length),
    none: d.none(query.trim()),
    error: d.error,
  }[status]

  return (
    <Frame title={d.title} note={d.sample}>
      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,20rem)_1fr]">
        {/* A phone-shaped frame, because that's where the app lives */}
        <div className="mx-auto w-full max-w-[20rem] rounded-[2rem] border border-line bg-ink p-3 shadow-[0_24px_48px_-32px_rgb(60_40_20/0.4)]">
          <div aria-hidden="true" className="mx-auto mb-3 h-1.5 w-16 rounded-full bg-line" />
          <label htmlFor={`${uid}-q`} className="sr-only">
            {d.search}
          </label>
          <input
            id={`${uid}-q`}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={d.placeholder}
            autoComplete="off"
            className="w-full rounded-full border border-line bg-surface px-4 py-2.5 text-sm text-fg placeholder:text-muted focus-visible:outline-offset-2"
          />
          <div className="mt-3 h-72 overflow-y-auto rounded-[1.25rem] bg-surface p-3">
            {status === 'idle' && <p className="p-3 text-center text-sm text-muted">{d.idle}</p>}
            {status === 'loading' && (
              <ul aria-hidden="true" className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <li key={i} className="flex animate-pulse items-center gap-3">
                    <span className="size-12 rounded-[10px] bg-line" />
                    <span className="flex-1 space-y-2">
                      <span className="block h-3 w-3/4 rounded bg-line" />
                      <span className="block h-2.5 w-1/3 rounded bg-line" />
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {status === 'results' && (
              <ul className="snake-in space-y-3">
                {state.results.map((r) => (
                  <li key={r.name.en} className="flex items-center gap-3">
                    <span aria-hidden="true" className="size-12 shrink-0 rounded-[10px]" style={{ backgroundColor: r.tone }} />
                    <span>
                      <span className="block text-sm text-fg">{pick(r.name)}</span>
                      <span className="block text-xs text-muted tabular-nums">{d.minutes(r.minutes)}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {status === 'none' && <p className="snake-in p-3 text-center text-sm text-muted">{d.none(query.trim())}</p>}
            {status === 'error' && (
              <div className="snake-in flex flex-col items-center gap-3 p-3 text-center">
                <p className="text-sm text-accent">{d.error}</p>
                <button type="button" onClick={() => setAttempt((a) => a + 1)} className={button}>
                  {d.retry}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <label className="flex cursor-pointer items-center gap-3 text-sm text-fg">
            <input type="checkbox" checked={fail} onChange={(e) => setFail(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
            {d.offline}
          </label>
          <p aria-live="polite" className="text-sm text-muted">
            {announce}
          </p>
        </div>
      </div>
    </Frame>
  )
}

/* This portfolio: the gallery's own placement function, driven by a slider */
const STAGE_W = 1000
const STAGE_H = 600

function DepthDemo() {
  const { t, pick } = useI18n()
  const d = t.demos.depth
  const uid = useId()
  const last = projects.length - 1
  const [p, setP] = useState(0)
  const [compact, setCompact] = useState(false)
  const boxRef = useRef(null)
  const [scale, setScale] = useState(0.6)

  // The scene is laid out at a fixed size and scaled to fit, so the 3D numbers match the real gallery
  useLayoutEffect(() => {
    const el = boxRef.current
    const fit = () => setScale(el.clientWidth / STAGE_W)
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  return (
    <Frame title={d.title} note={d.hint}>
      <div ref={boxRef} className="relative overflow-hidden rounded-[6px] border border-line bg-ink" style={{ height: STAGE_H * scale }}>
        <div
          aria-hidden="true"
          className="absolute top-0 left-0 origin-top-left"
          style={{ width: STAGE_W, height: STAGE_H, transform: `scale(${scale})` }}
        >
          <ol
            className={`grid h-full place-items-center pt-24 [transform-style:preserve-3d] ${compact ? '[perspective:900px]' : '[perspective:1400px]'} [perspective-origin:50%_35%]`}
          >
            {projects.map((project, i) => {
              const dd = i - p
              const { z, transform, opacity, shade } = place(dd, i % 2 ? 1 : -1, compact, '%')
              return (
                <li
                  key={project.slug}
                  className="relative aspect-[16/10] w-[520px] overflow-hidden rounded-[6px] border border-[#1b1a18]/10 shadow-[0_24px_48px_-28px_rgb(60_40_20/0.35)] [grid-area:1/1]"
                  style={{ transform, opacity, zIndex: Math.round(2000 + z), backgroundColor: project.tone }}
                >
                  <div className="flex h-full flex-col justify-end p-8 text-[#1b1a18]">
                    <span className="text-lg text-[#1b1a18]/50 tabular-nums">{pad(i + 1)}</span>
                    <span className="font-display text-5xl leading-tight">{pick(project.title)}</span>
                  </div>
                  <div className="absolute inset-0 bg-ink" style={{ opacity: shade }} />
                </li>
              )
            })}
          </ol>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
        <label htmlFor={`${uid}-p`} className="text-sm text-muted">
          {d.position}
        </label>
        <input
          id={`${uid}-p`}
          type="range"
          min={0}
          max={last}
          step={0.01}
          value={p}
          onChange={(e) => setP(Number(e.target.value))}
          aria-valuetext={`${(p + 1).toFixed(1)} / ${last + 1}`}
          className="min-w-40 flex-1 accent-[var(--color-accent)]"
        />
        <label className="flex cursor-pointer items-center gap-2 text-sm text-fg">
          <input type="checkbox" checked={compact} onChange={(e) => setCompact(e.target.checked)} className="size-4 accent-[var(--color-accent)]" />
          {d.phone}
        </label>
      </div>
    </Frame>
  )
}

/* This portfolio: the original PNG screenshot against the WebP the site actually serves */
// The size of the file the browser actually picked (from its cache, so nothing is downloaded twice)
const sizeOf = async (img) => {
  if (!img?.currentSrc) return null
  try {
    const blob = await (await fetch(img.currentSrc, { cache: 'force-cache' })).blob()
    return blob.size / 1024
  } catch {
    return null
  }
}

function ImagesDemo() {
  const { t } = useI18n()
  const d = t.demos.images
  const uid = useId()
  const [pos, setPos] = useState(50)
  const [sizes, setSizes] = useState({})
  const beforeRef = useRef(null)
  const afterRef = useRef(null)
  const measure = async () => {
    const [before, after] = await Promise.all([sizeOf(beforeRef.current), sizeOf(afterRef.current)])
    setSizes({ before, after })
  }
  const kb = (n) => (n ? `${Math.round(n)} KB` : '–')
  const saved = sizes.before && sizes.after ? Math.round((1 - sizes.after / sizes.before) * 100) : null

  return (
    <Frame title={d.title} note={d.hint}>
      {/* Screenshots are left to right whatever the page language, so the comparison is too */}
      <div
        dir="ltr"
        className="relative aspect-[16/10] overflow-hidden rounded-[6px] border border-line bg-ink select-none has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-4 has-[input:focus-visible]:outline-accent"
      >
        <img
          ref={afterRef}
          src="/images/projects/portfolio-hero-800.webp"
          srcSet="/images/projects/portfolio-hero-800.webp 800w, /images/projects/portfolio-hero-1600.webp 1600w"
          sizes="(min-width: 1100px) 820px, 90vw"
          alt=""
          onLoad={measure}
          className="absolute inset-0 size-full object-cover object-top"
        />
        <img
          ref={beforeRef}
          src="/images/projects/originals/portfolio-hero.png"
          alt=""
          loading="lazy"
          onLoad={measure}
          className="absolute inset-0 size-full object-cover object-top"
          style={{ clipPath: `inset(0 ${100 - pos}% 0 0)` }}
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 w-px bg-accent" style={{ left: `${pos}%` }}>
          <span className="absolute top-1/2 left-1/2 flex size-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-xs text-on-accent shadow-lg">
            ⇆
          </span>
        </div>
        <span className="absolute top-3 left-3 rounded-full bg-[#1b1a18]/75 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {d.before} · {kb(sizes.before)}
        </span>
        <span className="absolute top-3 right-3 rounded-full bg-[#1b1a18]/75 px-3 py-1 text-xs text-white backdrop-blur-sm">
          {d.after} · {kb(sizes.after)}
        </span>
        <label htmlFor={`${uid}-c`} className="sr-only">
          {d.compare}
        </label>
        <input
          id={`${uid}-c`}
          type="range"
          min={0}
          max={100}
          value={pos}
          onChange={(e) => setPos(clamp(Number(e.target.value), 0, 100))}
          className="absolute inset-0 size-full cursor-ew-resize opacity-0"
        />
      </div>
      <p className="mt-4 flex flex-wrap items-baseline gap-x-3 text-sm text-muted">
        {saved != null && <span className="font-display text-2xl text-fg">{d.saved(saved)}</span>}
        {d.measured}
      </p>
    </Frame>
  )
}

const demos = { access: AccessDemo, checkout: CheckoutDemo, recipes: RecipesDemo, depth: DepthDemo, images: ImagesDemo }

export default function ProjectDemos({ project }) {
  return (
    <div className="space-y-6">
      {project.demos.map((id) => {
        const Demo = demos[id]
        return Demo ? <Demo key={id} /> : null
      })}
    </div>
  )
}
