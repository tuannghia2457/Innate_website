import { useEffect, useState } from 'react'
import { LangContext, dict, useT, type Lang } from './i18n'
import Footer from './Footer'
import Intro from './Intro'
import Landing from './Landing'
import { scrollToEl, scrollToY, startSmoothScroll } from './smooth'
import { demo } from './links'
import { ArrowBtn, Glyph, T } from './ui'

const store = {
  get: (k: string) => { try { return localStorage.getItem(k) } catch { return null } },
  set: (k: string, v: string) => { try { localStorage.setItem(k, v) } catch { /* private mode */ } },
}
export { store }

type Theme = 'dark' | 'light'

// Only #/ and in-page anchors (#/#how); demo routes live on the demo site (links.ts).
function useHash() {
  const [hash, setHash] = useState(window.location.hash)
  useEffect(() => {
    const on = () => { setHash(window.location.hash); if (!window.location.hash.includes('#how')) scrollToY(0, false) }
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return hash
}

export function Mark({ className = 'brand-mark' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="#0B1F44" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="7.5" fill="none" stroke="rgba(234,242,255,0.18)" />
      <g fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
        <path d="M9.5 20.5a6.5 6.5 0 0 1 13 0" />
        <path d="M6 20.5a10 10 0 0 1 20 0" opacity="0.55" />
        <path d="M13 20.5a3 3 0 0 1 6 0" />
      </g>
      <circle cx="16" cy="25" r="2.4" fill="#2878FF" />
    </svg>
  )
}

const L = {
  how: { en: 'How it works', vi: 'Cách hoạt động' },
  menu: { en: 'Menu', vi: 'Menu' },
  closeMenu: { en: 'Close menu', vi: 'Đóng menu' },
  toLight: { en: 'Switch to light theme', vi: 'Chuyển sang giao diện sáng' },
  toDark: { en: 'Switch to dark theme', vi: 'Chuyển sang giao diện tối' },
  skip: { en: 'Skip to content', vi: 'Bỏ qua tới nội dung' },
}

function LangSwitch() {
  return (
    <LangContext.Consumer>
      {({ lang, setLang }) => (
        <div className="lang" role="group" aria-label="Language">
          <button aria-pressed={lang === 'en'} onClick={() => setLang('en')}>EN</button>
          <button aria-pressed={lang === 'vi'} onClick={() => setLang('vi')}>VI</button>
        </div>
      )}
    </LangContext.Consumer>
  )
}

function ThemeSwitch({ theme, setTheme }: { theme: Theme; setTheme: (t: Theme) => void }) {
  const { lang } = useT()
  const next: Theme = theme === 'dark' ? 'light' : 'dark'
  const label = theme === 'dark' ? L.toLight[lang] : L.toDark[lang]
  return (
    <button className="icon-btn theme-btn" onClick={() => setTheme(next)} aria-label={label} title={label}>
      <Glyph name={theme === 'dark' ? 'sun' : 'moon'} />
    </button>
  )
}

function Nav({ path, theme, setTheme }: { path: string; theme: Theme; setTheme: (t: Theme) => void }) {
  const { t, lang } = useT()
  const [open, setOpen] = useState(false)
  useEffect(() => { setOpen(false) }, [path])

  // Movora's nav slides away while scrolling down and returns on the way up.
  const [tucked, setTucked] = useState(false)
  useEffect(() => {
    let last = window.scrollY
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const y = window.scrollY
        if (Math.abs(y - last) < 6) return
        setTucked(y > 160 && y > last)
        last = y
      })
    }
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    document.documentElement.style.overflow = 'hidden'
    return () => { window.removeEventListener('keydown', onKey); document.documentElement.style.overflow = '' }
  }, [open])

  const other: Lang = lang === 'en' ? 'vi' : 'en'
  const links = [
    { href: '#/#how', label: L.how[lang], alt: L.how[other], current: false },
    { href: demo('#/ops'), label: t('navOps'), alt: dict.navOps[other], current: false },
  ]

  return (
    <header className={`nav-bar ${tucked && !open ? 'tucked' : ''}`}>
      <a className="skip" href="#content" onClick={(e) => { e.preventDefault(); document.getElementById('content')?.focus() }}>{L.skip[lang]}</a>
      <nav className="nav" aria-label="Main">
        <a className="brand" href="#/" aria-label="Innate"><Mark /><span className="brand-word">Innate</span></a>
        <div className="nav-right">
          <div className="nav-links">
            {links.map((l) => (
              <a key={l.href} href={l.href} aria-current={l.current ? 'page' : undefined}>
                <span className="nl">{l.label}</span>
                {/* the other language's label holds the width, so switching language never moves the links */}
                <span className="nl-ghost" aria-hidden="true">{l.alt}</span>
              </a>
            ))}
          </div>
          <div className="nav-tools">
            <LangSwitch />
            <ThemeSwitch theme={theme} setTheme={setTheme} />
            <ArrowBtn href={demo('#/demo?choose=1')}><T k="navDemo" /></ArrowBtn>
            <button className="icon-btn burger" aria-expanded={open} aria-controls="menu-sheet" aria-label={open ? L.closeMenu[lang] : L.menu[lang]} onClick={() => setOpen(!open)}>
              <Glyph name={open ? 'close' : 'menu'} />
            </button>
          </div>
        </div>
      </nav>
      {open && (
        <div className="menu-sheet" id="menu-sheet">
          {links.map((l) => <a key={l.href} className="m-link" href={l.href} onClick={() => setOpen(false)}>{l.label}</a>)}
          <a className="m-link" href={demo('#/demo?choose=1')} onClick={() => setOpen(false)}><T k="navDemo" /></a>
          <div className="menu-tools"><LangSwitch /><ThemeSwitch theme={theme} setTheme={setTheme} /></div>
        </div>
      )}
    </header>
  )
}

export default function App() {
  const [lang, setLangState] = useState<Lang>(() => (store.get('innate.lang') === 'en' ? 'en' : 'vi'))
  const setLang = (l: Lang) => { setLangState(l); store.set('innate.lang', l) }
  useEffect(() => { document.documentElement.lang = lang }, [lang])
  useEffect(() => { startSmoothScroll() }, [])

  // dark by default (DEMO_DESIGN_RULES.md); index.html applies the stored choice before first paint
  const [theme, setThemeState] = useState<Theme>(() => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark'))
  const setTheme = (next: Theme) => { setThemeState(next); store.set('innate.theme', next) }
  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#071431' : '#EAF2FF')
  }, [theme])

  const hash = useHash()
  const path = hash.replace(/^#/, '').split('?')[0]

  useEffect(() => {
    if (hash.includes('#how')) scrollToEl(document.getElementById('how'))
  }, [hash])

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      <Intro />
      <Nav path={path} theme={theme} setTheme={setTheme} />
      <main id="content" tabIndex={-1} style={{ outline: 'none' }}><Landing /></main>
      <Footer />
    </LangContext.Provider>
  )
}
