import type { FieldEvent, SessionIn, Swipe, Tap, ScreenVisit, TextField } from './api'

// The SDK part of Innate, running in the demo wallet: records PIN-key press/release times, where the finger landed
// relative to the key, touch size, swipes and how long each screen sat idle. Times are ms since the session began.
export const MAX_SWIPES = 30 // backend/app/schemas.py
export const MAX_POINTS = 200

const r1 = (n: number) => Math.round(n * 10) / 10

export class Recorder {
  private t0 = performance.now()
  taps: Tap[] = []
  swipes: Swipe[] = []
  screens: ScreenVisit[] = []
  fields: TextField[] = []
  private down = new Map<number, Omit<Tap, 't_up'>>()
  private stroke: Swipe['points'] | null = null

  now() { return r1(performance.now() - this.t0) }

  screen(name: string) { this.screens.push({ name, t_enter: this.now(), t_first_touch: null }) }

  private touched() {
    const s = this.screens[this.screens.length - 1]
    if (s && s.t_first_touch === null) s.t_first_touch = this.now()
  }

  keyDown(e: PointerEvent, key: string, el: Element) {
    const r = el.getBoundingClientRect()
    this.touched()
    this.down.set(e.pointerId, {
      key, t_down: this.now(), x: r1(e.clientX), y: r1(e.clientY), w: r1(e.width || 0), h: r1(e.height || 0),
      key_cx: r1(r.left + r.width / 2), key_cy: r1(r.top + r.height / 2), key_w: r1(r.width), key_h: r1(r.height),
    })
  }

  keyUp(e: PointerEvent) {
    const d = this.down.get(e.pointerId)
    if (!d) return
    this.down.delete(e.pointerId)
    this.taps.push({ ...d, t_up: Math.max(d.t_down, this.now()) })
  }

  clearTaps() { this.taps = []; this.down.clear() }

  /** one change in a typed field (account number): when and what kind, never which digit */
  field(name: TextField['name'], kind: FieldEvent['kind']) {
    this.touched()
    let f = this.fields.find((x) => x.name === name)
    if (!f) { f = { name, events: [] }; this.fields.push(f) }
    f.events.push(kind === 'key' ? { t: this.now(), kind, n: 1, cls: 'digit' } : { t: this.now(), kind, n: 1 })
  }

  swipeStart(e: PointerEvent) { this.touched(); this.stroke = [{ t: this.now(), x: r1(e.clientX), y: r1(e.clientY) }] }
  swipeMove(e: PointerEvent) {
    if (!this.stroke || this.stroke.length >= MAX_POINTS) return
    this.stroke.push({ t: this.now(), x: r1(e.clientX), y: r1(e.clientY) })
  }
  /** returns the vertical travel in px (negative = upwards) */
  swipeEnd(): number {
    const pts = this.stroke
    this.stroke = null
    if (!pts || pts.length < 2) return 0
    const dy = pts[pts.length - 1].y - pts[0].y
    if (Math.abs(dy) > 20 && this.swipes.length < MAX_SWIPES) this.swipes.push({ points: pts })
    return dy
  }

  payload(userId: string): SessionIn {
    return { user_id: userId, device_id: deviceId(), pin_taps: this.taps, swipes: this.swipes, screens: this.screens,
      ...(this.fields.length ? { fields: this.fields } : {}) }
  }
}

export function deviceId(): string {
  try {
    let id = localStorage.getItem('innate.device')
    if (!id) { id = `web_${Math.random().toString(36).slice(2, 10)}`; localStorage.setItem('innate.device', id) }
    return id
  } catch { return 'web_private' }
}
