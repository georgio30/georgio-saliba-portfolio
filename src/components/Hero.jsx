import { useEffect, useState } from 'react'
import Icon from './Icons'
import { profile } from '../data/resume'

const roles = ['Full-Stack Developer', 'React & Node.js Developer', 'API & Database Builder']

function useTypewriter(words, speed = 90, pause = 1600) {
  const [text, setText] = useState('')
  const [index, setIndex] = useState(0)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const word = words[index % words.length]
    const done = !deleting && text === word
    const cleared = deleting && text === ''
    const delay = done ? pause : deleting ? speed / 2 : speed

    const timer = setTimeout(() => {
      if (done) setDeleting(true)
      else if (cleared) {
        setDeleting(false)
        setIndex((i) => i + 1)
      } else {
        setText(word.slice(0, text.length + (deleting ? -1 : 1)))
      }
    }, delay)
    return () => clearTimeout(timer)
  }, [text, deleting, index, words, speed, pause])

  return text
}

export default function Hero() {
  const typed = useTypewriter(roles)

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden pt-16">
      <div className="bg-grid absolute inset-0" />
      <div className="animate-blob absolute -left-32 top-1/4 size-96 rounded-full bg-accent/20 blur-3xl" />
      <div
        className="animate-blob absolute -right-32 bottom-1/4 size-96 rounded-full bg-accent-2/20 blur-3xl"
        style={{ animationDelay: '-6s' }}
      />

      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div
            data-aos="fade-down"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-700 dark:text-emerald-300"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
            </span>
            Open to opportunities
          </div>

          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="mt-6 text-4xl font-extrabold tracking-tight text-fg sm:text-6xl lg:text-7xl"
          >
            Hi, I'm <span className="text-gradient">{profile.name}</span>
          </h1>

          <p data-aos="fade-up" data-aos-delay="200" className="mt-4 h-9 font-mono text-xl text-body sm:text-2xl">
            {typed}
            <span className="ml-0.5 inline-block w-0.5 animate-pulse bg-accent align-middle">&nbsp;</span>
          </p>

          <p data-aos="fade-up" data-aos-delay="300" className="mt-6 max-w-xl text-lg leading-relaxed text-muted">
            I build complete web applications end to end — MySQL databases, secure Node.js and Express APIs, and
            fast, responsive React interfaces on top.
          </p>

          <div data-aos="fade-up" data-aos-delay="400" className="mt-10 flex flex-wrap gap-4">
            <a
              href="#projects"
              className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent to-accent-2 px-6 py-3 font-semibold text-ink shadow-lg shadow-accent/20 transition hover:shadow-accent/40"
            >
              View my work
              <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-fg/15 px-6 py-3 font-semibold text-fg transition hover:border-fg/30 hover:bg-fg/5"
            >
              Get in touch
            </a>
          </div>

          <div data-aos="fade-up" data-aos-delay="500" className="mt-10 flex items-center gap-5 text-muted">
            <a href={profile.github} target="_blank" rel="noreferrer" aria-label="GitHub" className="transition hover:text-accent">
              <Icon name="github" className="size-5" />
            </a>
            <a href={profile.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition hover:text-accent">
              <Icon name="linkedin" className="size-5" />
            </a>
            <a href={`mailto:${profile.email}`} aria-label="Email" className="transition hover:text-accent">
              <Icon name="mail" className="size-5" />
            </a>
            <a href={profile.phoneHref} aria-label="Phone" className="transition hover:text-accent">
              <Icon name="phone" className="size-5" />
            </a>
            <span className="h-px w-12 bg-fg/15" />
            <span className="flex items-center gap-1.5 text-sm">
              <Icon name="pin" className="size-4" /> {profile.location}
            </span>
          </div>
        </div>

        {/* Code-editor style card */}
        <div data-aos="zoom-in" data-aos-delay="300" className="hidden lg:block">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-slate-900 text-slate-300 shadow-2xl shadow-black/30">
            <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
              <span className="size-3 rounded-full bg-red-400/80" />
              <span className="size-3 rounded-full bg-yellow-400/80" />
              <span className="size-3 rounded-full bg-green-400/80" />
              <span className="ml-3 font-mono text-xs text-slate-500">georgio.ts</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
              <code>
                <span className="text-indigo-400">const</span> <span className="text-white">developer</span> = {'{'}
                {'\n'}  name: <span className="text-emerald-300">'Georgio Saliba'</span>,
                {'\n'}  role: <span className="text-emerald-300">'Full-Stack Developer'</span>,
                {'\n'}  frontend: [<span className="text-emerald-300">'React'</span>, <span className="text-emerald-300">'TypeScript'</span>],
                {'\n'}  backend: [<span className="text-emerald-300">'Node.js'</span>, <span className="text-emerald-300">'Express'</span>],
                {'\n'}  database: <span className="text-emerald-300">'MySQL'</span>,
                {'\n'}  auth: [<span className="text-emerald-300">'JWT'</span>, <span className="text-emerald-300">'RBAC'</span>],
                {'\n'}  cleanCode: <span className="text-sky-400">true</span>,
                {'\n'}  coffee: <span className="text-amber-300">Infinity</span>,
                {'\n'}{'}'}
              </code>
            </pre>
          </div>
        </div>
      </div>

      <a
        href="#about"
        aria-label="Scroll to about section"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-subtle transition hover:text-accent"
      >
        <Icon name="down" className="size-7" />
      </a>
    </section>
  )
}
