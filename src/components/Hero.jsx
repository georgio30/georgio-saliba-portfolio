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
      <div className="relative mx-auto grid w-full max-w-6xl items-center gap-12 px-4 py-20 sm:px-6 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <h1
            data-aos="fade-up"
            data-aos-delay="100"
            className="text-4xl font-extrabold tracking-tight text-fg sm:text-6xl lg:text-7xl"
          >
            Hi, I'm <span className="text-accent">{profile.name}</span>
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
              className="group inline-flex items-center gap-2 rounded-xl bg-accent px-6 py-3 font-semibold text-on-accent transition hover:opacity-90"
            >
              View my work
              <Icon name="arrow" className="size-4 transition-transform group-hover:translate-x-1" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-6 py-3 font-semibold text-fg transition hover:border-muted/40"
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
            <span className="h-px w-12 bg-line" />
            <span className="flex items-center gap-1.5 text-sm">
              <Icon name="pin" className="size-4" /> {profile.location}
            </span>
          </div>
        </div>

        {/* Code-editor style card */}
        <div data-aos="zoom-in" data-aos-delay="300" className="hidden lg:block">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface text-fg">
            <div className="flex items-center gap-2 border-b border-line px-4 py-3">
              <span className="size-3 rounded-full bg-line" />
              <span className="size-3 rounded-full bg-line" />
              <span className="size-3 rounded-full bg-line" />
              <span className="ml-3 font-mono text-xs text-muted">georgio.ts</span>
            </div>
            <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
              <code>
                <span className="text-accent">const</span> <span className="font-medium">developer</span> = {'{'}
                {'\n'}  name: <span className="text-muted">'Georgio Saliba'</span>,
                {'\n'}  role: <span className="text-muted">'Full-Stack Developer'</span>,
                {'\n'}  frontend: [<span className="text-muted">'React'</span>, <span className="text-muted">'TypeScript'</span>],
                {'\n'}  backend: [<span className="text-muted">'Node.js'</span>, <span className="text-muted">'Express'</span>],
                {'\n'}  database: <span className="text-muted">'MySQL'</span>,
                {'\n'}  auth: [<span className="text-muted">'JWT'</span>, <span className="text-muted">'RBAC'</span>],
                {'\n'}  cleanCode: <span className="text-accent">true</span>,
                {'\n'}  coffee: <span className="text-accent">Infinity</span>,
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
