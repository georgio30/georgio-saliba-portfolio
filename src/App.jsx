import { useEffect } from 'react'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import ProjectShowcase from './components/ProjectShowcase'
import Experience from './components/Experience'
import About from './components/About'
import Now from './components/Now'
import Play from './components/Play'
import Craft from './components/Craft'
import Contact from './components/Contact'
import Footer from './components/Footer'
import Chat from './components/Chat'
import { profile } from './data/resume'
import { useI18n } from './i18n'

export default function App() {
  const { t } = useI18n()

  // A small hello for anyone who opens the dev tools
  useEffect(() => {
    console.log(
      `%cHey, you opened the console 👋\n%cThe source for this site is on GitHub: ${profile.github}`,
      'font: 600 14px sans-serif',
      'font: 13px sans-serif; color: #6f6f6a',
    )
  }, [])

  return (
    <>
      <a
        href="#main"
        className="fixed start-3 top-3 z-[60] -translate-y-20 rounded-full bg-fg px-4 py-2 text-sm font-medium text-ink transition-transform focus:translate-y-0"
      >
        {t.skip}
      </a>
      <Navbar />
      <main id="main" tabIndex={-1} className="outline-none">
        <Hero />
        <ProjectShowcase />
        <Experience />
        <About />
        <Now />
        <Play />
        <Craft />
        <Contact />
      </main>
      <Footer />
      <Chat />
    </>
  )
}
