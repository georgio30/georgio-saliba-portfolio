import Icon from './Icons'
import { useTheme } from '../lib/hooks'

export default function ThemeToggle() {
  const [dark, setDark] = useTheme()

  return (
    <button
      type="button"
      onClick={() => setDark(!dark)}
      aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={dark ? 'Lights on' : 'Lights off'}
      className="relative flex size-9 items-center justify-center rounded-full text-muted transition-colors duration-200 hover:bg-fg/5 hover:text-fg"
    >
      <span className={`absolute transition-opacity duration-300 ${dark ? 'opacity-100' : 'opacity-0'}`}>
        <Icon name="sun" className="size-[18px]" />
      </span>
      <span className={`absolute transition-opacity duration-300 ${dark ? 'opacity-0' : 'opacity-100'}`}>
        <Icon name="moon" className="size-[18px]" />
      </span>
    </button>
  )
}
