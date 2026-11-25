import { useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react'
import type { Score, Tap } from './api'
import { Recorder } from './capture'
import { useT } from './i18n'
import type { Layout } from './synth'

// The demo wallet: a fictional e-wallet with the Innate SDK inside. Home → transfer (swipe up to confirm) → PIN → result.
// In enroll mode it goes straight to the PIN pad. A "ghost" script replays synthetic taps on the real keys (story, bot).
export const DEMO_PIN = '1593'
const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫']
type L = { en: string; vi: string }

export const CONTACTS = [
  { id: 'me', name: { en: 'Mum', vi: 'Mẹ' }, acct: '0901 234 567', known: true },
  { id: 'tuan', name: { en: 'Tuấn (landlord)', vi: 'Anh Tuấn (chủ nhà)' }, acct: '0912 888 120', known: true },
  { id: 'new', name: { en: 'New recipient', vi: 'Người nhận mới' }, acct: '', known: false },
]
export const AMOUNTS = [200_000, 500_000, 2_000_000, 20_000_000]
export interface PayCtx { recipient: string; recipient_is_new: boolean; amount: number }
export type Ghost = { id: number; taps: Tap[]; label: L; pay?: { recipient: string; amount: number } }

type Screen = 'home' | 'transfer' | 'pin' | 'wait' | 'result'

export default function Wallet({ mode, enrollStep, busy, outcome, ghost, onLayout, onPin, onDone }: {
  mode: 'enroll' | 'pay'
  enrollStep: number
  busy: boolean
  outcome: Score | null
  ghost: Ghost | null
  onLayout: (l: Layout) => void
  onPin: (rec: Recorder, ctx: PayCtx) => void
  onDone: () => void
}) {
  const { t, lang, money } = useT()
  const tx = (x: L) => x[lang]
  const [screen, setScreen] = useState<Screen>(mode === 'enroll' ? 'pin' : 'home')
  const [digits, setDigits] = useState('')
  const [shake, setShake] = useState(false)
  const [pressed, setPressed] = useState<string | null>(null)
  const [recipient, setRecipient] = useState(CONTACTS[0].id)
  const [amount, setAmount] = useState(AMOUNTS[1])
  const [note, setNote] = useState<L | null>(null)
  const rec = useRef(new Recorder())
  const keyEls = useRef<Record<string, HTMLButtonElement | null>>({})
  const ctx = (): PayCtx => {
    const c = CONTACTS.find((x) => x.id === recipient)!
    return { recipient: c.name[lang], recipient_is_new: !c.known, amount }
  }

  // a fresh recording for every attempt
  const begin = (s: Screen) => { rec.current = new Recorder(); rec.current.screen(s); setDigits(''); setNote(null); setScreen(s) }
  useEffect(() => { if (mode === 'enroll') begin('pin'); else setScreen('home') }, [mode, enrollStep]) // eslint-disable-line react-hooks/exhaustive-deps
  // pay mode: a result shows the result screen; clearing it goes back home
  useEffect(() => { if (mode === 'pay') setScreen((s) => (outcome ? 'result' : s === 'result' ? 'home' : s)) }, [outcome, mode])
  // while the API works the pad turns into a spinner; afterwards enroll starts a fresh attempt
  const screenRef = useRef(screen)
  screenRef.current = screen
  useEffect(() => {
    if (busy) { setScreen((s) => (s === 'pin' ? 'wait' : s)); return }
    if (screenRef.current !== 'wait') return
    if (mode === 'enroll') begin('pin')
    else { setDigits(''); setScreen(outcome ? 'result' : 'home') } // no result (error, or enrollment just finished): start over
  }, [busy]) // eslint-disable-line react-hooks/exhaustive-deps

  // the real key centres on screen, for synthetic sessions
  useLayoutEffect(() => {
    if (screen !== 'pin') return
    const measure = () => {
      const l: Layout = {}
      for (const k of KEYS) {
        const el = keyEls.current[k]
        if (!k || k === '⌫' || !el) continue
        const r = el.getBoundingClientRect()
        l[k] = { cx: Math.round(r.left + r.width / 2), cy: Math.round(r.top + r.height / 2), w: Math.round(r.width), h: Math.round(r.height) }
      }
      onLayout(l)
    }
    measure()
    window.addEventListener('resize', measure)
    window.addEventListener('scroll', measure, { passive: true })
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure) }
  }, [screen, onLayout])

  // ghost playback: light the keys at the synthetic times
  useEffect(() => {
    if (!ghost) return
    if (ghost.pay) { setRecipient(ghost.pay.recipient); setAmount(ghost.pay.amount) }
    setScreen('pin'); setDigits(''); setNote(null)
    const timers: number[] = []
    const t0 = ghost.taps[0]?.t_down ?? 0
    ghost.taps.forEach((tp, i) => {
      timers.push(window.setTimeout(() => setPressed(tp.key), tp.t_down - t0 + 250))
      timers.push(window.setTimeout(() => { setPressed(null); setDigits((d) => (d + tp.key).slice(0, 4)); if (i === ghost.taps.length - 1) setScreen('wait') }, tp.t_up - t0 + 250))
    })
    return () => timers.forEach((id) => window.clearTimeout(id))
  }, [ghost])

  const press = (k: string) => {
    if (busy || ghost) return
    if (k === '⌫') { setDigits(''); rec.current.clearTaps(); return }
    if (!k) return
    const next = digits + k
    setDigits(next)
    if (next.length < DEMO_PIN.length) return
    if (next !== DEMO_PIN) {
      setShake(true); window.setTimeout(() => { setShake(false); setDigits(''); rec.current.clearTaps() }, 450)
      setNote({ en: `Wrong PIN. The demo PIN is ${DEMO_PIN}.`, vi: `Sai PIN. PIN demo là ${DEMO_PIN}.` })
      return
    }
    // keyboard presses carry no touch position; rhythm needs a finger or mouse on every key
    window.setTimeout(() => {
      if (rec.current.taps.length < DEMO_PIN.length) {
        setDigits(''); rec.current.clearTaps()
        setNote({ en: 'Tap the keys with a finger or mouse; the keyboard leaves no rhythm to measure.', vi: 'Hãy bấm phím bằng ngón tay hoặc chuột; bàn phím không để lại nhịp để đo.' })
        return
      }
      onPin(rec.current, ctx())
    }, 0)
  }

  const keyDown = (e: RPointerEvent<HTMLButtonElement>, k: string) => {
    if (busy || ghost || !k || k === '⌫') return
    rec.current.keyDown(e.nativeEvent, k, e.currentTarget)
    setPressed(k)
  }
  const keyUp = (e: RPointerEvent<HTMLButtonElement>) => { rec.current.keyUp(e.nativeEvent); setPressed(null) }

  const swipe = {
    onPointerDown: (e: RPointerEvent<HTMLDivElement>) => { e.currentTarget.setPointerCapture(e.pointerId); rec.current.swipeStart(e.nativeEvent) },
    onPointerMove: (e: RPointerEvent<HTMLDivElement>) => rec.current.swipeMove(e.nativeEvent),
    onPointerUp: () => { if (rec.current.swipeEnd() < -60) { rec.current.screen('pin'); setScreen('pin') } },
  }

  const c = CONTACTS.find((x) => x.id === recipient)!
  const act = outcome?.action

  return (
    <div className="wallet" aria-label={lang === 'en' ? 'Demo wallet' : 'Ví demo'}>
      <div className="wallet-notch" aria-hidden="true" />
      <div className="wallet-screen">
        <div className="wallet-status"><span>9:41</span><span className="mono">Innate SDK</span></div>

        {screen === 'home' && (
          <div className="w-home">
            <span className="w-hello">{lang === 'en' ? 'Hi, Hà' : 'Chào Hà'}</span>
            <div className="w-balance"><span>{lang === 'en' ? 'Balance' : 'Số dư'}</span><b>{money(12_450_000)}</b></div>
            <div className="w-actions">
              <button className="w-act primary" onClick={() => begin('transfer')}>{lang === 'en' ? 'Transfer' : 'Chuyển tiền'}</button>
              <button className="w-act" disabled>{lang === 'en' ? 'Top up' : 'Nạp tiền'}</button>
              <button className="w-act" disabled>{lang === 'en' ? 'Bills' : 'Hóa đơn'}</button>
            </div>
            <p className="w-foot">{lang === 'en' ? 'Fictional wallet for the Innate demo' : 'Ví giả tưởng cho demo Innate'}</p>
          </div>
        )}

        {screen === 'transfer' && (
          <div className="w-transfer">
            <h3>{lang === 'en' ? 'Send money' : 'Chuyển tiền'}</h3>
            <fieldset><legend>{lang === 'en' ? 'To' : 'Đến'}</legend>
              {CONTACTS.map((x) => (
                <label key={x.id} className={`w-opt ${recipient === x.id ? 'on' : ''}`}>
                  <input type="radio" name="to" checked={recipient === x.id} onChange={() => setRecipient(x.id)} />
                  <b>{tx(x.name)}</b><span>{x.acct || (lang === 'en' ? 'not in your contacts' : 'chưa có trong danh bạ')}</span>
                </label>
              ))}
            </fieldset>
            <fieldset><legend>{lang === 'en' ? 'Amount' : 'Số tiền'}</legend>
              <div className="w-amounts">
                {AMOUNTS.map((a) => (
                  <label key={a} className={`w-chip ${amount === a ? 'on' : ''}`}>
                    <input type="radio" name="amt" checked={amount === a} onChange={() => setAmount(a)} />{money(a)}
                  </label>
                ))}
              </div>
            </fieldset>
            <div className="w-swipe" {...swipe} role="button" tabIndex={0} aria-label={lang === 'en' ? 'Swipe up to continue' : 'Vuốt lên để tiếp tục'}
              onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { rec.current.screen('pin'); setScreen('pin') } }}>
              <span className="w-swipe-arrow" aria-hidden="true">↑</span>
              {lang === 'en' ? 'Swipe up to continue' : 'Vuốt lên để tiếp tục'}
            </div>
          </div>
        )}

        {(screen === 'pin' || screen === 'wait') && (
          <div className="w-pin">
            <h3>{mode === 'enroll'
              ? (lang === 'en' ? `Enroll your rhythm · ${enrollStep}/3` : `Đăng ký nhịp · lần ${enrollStep}/3`)
              : (lang === 'en' ? `Confirm ${money(amount)} to ${tx(c.name)}` : `Xác nhận ${money(amount)} cho ${tx(c.name)}`)}</h3>
            <p className="w-hint">{ghost ? tx(ghost.label) : (lang === 'en' ? `Demo PIN ${DEMO_PIN}` : `PIN demo ${DEMO_PIN}`)}</p>
            <div className={`w-dots ${shake ? 'shake' : ''}`} aria-label={`${digits.length}/4`}>
              {[0, 1, 2, 3].map((i) => <i key={i} className={i < digits.length ? 'on' : ''} />)}
            </div>
            {note && <p className="w-note" role="status">{tx(note)}</p>}
            {screen === 'wait'
              ? <div className="w-wait" role="status"><span className="w-spin" aria-hidden="true" />{lang === 'en' ? 'Innate is scoring…' : 'Innate đang chấm điểm…'}</div>
              : (
                <div className="w-keys">
                  {KEYS.map((k, i) => k === '' ? <span key={i} /> : (
                    <button key={i} ref={(el) => { keyEls.current[k] = el }} className={`w-key ${pressed === k ? 'down' : ''} ${k === '⌫' ? 'del' : ''}`}
                      onPointerDown={(e) => keyDown(e, k)} onPointerUp={keyUp} onPointerCancel={keyUp} onClick={() => press(k)}
                      aria-label={k === '⌫' ? (lang === 'en' ? 'Clear' : 'Xoá') : k}>{k}</button>
                  ))}
                </div>
              )}
          </div>
        )}

        {screen === 'result' && outcome && (
          <div className={`w-result ${act}`}>
            <span className="w-res-ico" aria-hidden="true">{act === 'allow' ? '✓' : act === 'step_up' ? '◎' : '■'}</span>
            <h3>{act === 'allow' ? (lang === 'en' ? 'Sent' : 'Đã chuyển')
              : act === 'step_up' ? (lang === 'en' ? 'Verify your face to continue' : 'Xác thực khuôn mặt để tiếp tục')
              : (lang === 'en' ? 'Transfer on hold' : 'Lệnh đang được tạm giữ')}</h3>
            <p>{act === 'allow' ? `${money(amount)} → ${tx(c.name)}`
              : act === 'step_up' ? (lang === 'en' ? 'This doesn’t look like your usual touch. One quick face check keeps your money safe.' : 'Thao tác không giống thói quen của bạn. Một bước xác thực khuôn mặt giúp giữ tiền an toàn.')
              : (lang === 'en' ? 'We paused this transfer and will contact you. Your account is not locked.' : 'Lệnh chuyển đã tạm dừng và chúng tôi sẽ liên hệ bạn. Tài khoản của bạn không bị khoá.')}</p>
            <span className={`status ${act === 'allow' ? 'matched' : act === 'step_up' ? 'sent' : 'discrepancy'}`}>{t(`act_${act!}`)}</span>
            <button className="w-act primary" onClick={onDone}>{lang === 'en' ? 'Back to home' : 'Về trang chủ'}</button>
          </div>
        )}
      </div>
    </div>
  )
}
