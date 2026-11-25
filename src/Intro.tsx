import { useEffect, useState } from 'react'
import { Mark } from './App'
import { useT } from './i18n'

// Plays on every load of the home page, then drops into the landing hero, which carries the demo and app CTAs.
// A deep link (#/#how) skips it.
const isHome = () => ['', '#', '#/'].includes(window.location.hash)

// The landing hero starts Movora's entrance (wordmark, container drop) when the intro begins to lift away.
export const INTRO_DONE = 'innate:intro-done'
let running = isHome()
export const introRunning = () => running
const finish = () => {
  if (!running) return
  running = false
  window.dispatchEvent(new Event(INTRO_DONE))
}

export default function Intro() {
  const { t } = useT()
  const [show, setShow] = useState(isHome)
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    if (!show) { finish(); return }
    document.documentElement.style.overflow = 'hidden'
    const skip = (event: KeyboardEvent) => { if (event.key === 'Escape') setLeaving(true) }
    window.addEventListener('keydown', skip)
    const done = window.setTimeout(() => setLeaving(true), 3000) // after the slogan has landed
    return () => {
      window.clearTimeout(done)
      window.removeEventListener('keydown', skip)
      document.documentElement.style.overflow = ''
    }
  }, [show])

  // animationend can be skipped (background tab, animations off), so never leave the overlay covering the page
  useEffect(() => {
    if (!leaving) return
    finish()
    const id = window.setTimeout(() => setShow(false), 700)
    return () => window.clearTimeout(id)
  }, [leaving])

  if (!show) return null

  return (
    <div
      className={`intro ${leaving ? 'leaving' : ''}`}
      role="dialog"
      aria-modal="true"
      aria-label="Innate"
      onClick={() => setLeaving(true)}
      onAnimationEnd={(event) => {
        if (event.target === event.currentTarget && event.animationName === 'intro-skip') setShow(false)
      }}
    >
      <div className="intro-stage">
        <div className="intro-brand" aria-hidden="true">
          <Mark className="intro-mark" />
          <div className="intro-word-wrap">
            <div className="intro-word">
              {/* P·IN → IN·NATE: the PIN loses its P, what is left is innate */}
              <span className="intro-group"><span className="intro-drop">P</span><span>IN</span></span>
              <span className="intro-group">NATE</span>
            </div>
          </div>
        </div>
        <p className="intro-slogan">{t('slogan')}</p>

      </div>
    </div>
  )
}
