import type { SessionIn, Tap } from './api'

// Synthetic sessions for the guided story and the in-browser bot. Built on the real key positions of the wallet
// on screen, so the backend scores them exactly like a recorded session. Mirrors backend/tests/synth.py.
export type KeyRect = { cx: number; cy: number; w: number; h: number }
export type Layout = Record<string, KeyRect>

export interface Persona { hold: number; flight: number; dx: number; dy: number; swipeV: number; curve: number }
export const OWNER: Persona = { hold: 95, flight: 180, dx: 0.15, dy: -0.1, swipeV: 2.5, curve: 25 }
export const FRIEND: Persona = { hold: 130, flight: 320, dx: -0.12, dy: 0.14, swipeV: 1.4, curve: 8 }

/** Seeded PRNG (mulberry32) so the story gives the same session every run. */
export function rng(seed: number) {
  let a = seed >>> 0
  const next = () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
  const gauss = (mu: number, sd: number) => {
    const u = Math.max(next(), 1e-9), v = next()
    return mu + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v)
  }
  return { next, gauss, uniform: (lo: number, hi: number) => lo + (hi - lo) * next() }
}
export type Rng = ReturnType<typeof rng>

const r1 = (n: number) => Math.round(n * 10) / 10

function tap(key: string, k: KeyRect, t: number, hold: number, x: number, y: number, w: number, h: number): Tap {
  return { key, t_down: r1(t), t_up: r1(t + hold), x: r1(x), y: r1(y), w, h, key_cx: k.cx, key_cy: k.cy, key_w: k.w, key_h: k.h }
}

/** A human-like PIN entry and one swipe, from a persona's habits. */
export function humanSession(userId: string, pin: string, layout: Layout, p: Persona, g: Rng, t0 = 800): SessionIn {
  const taps: Tap[] = []
  let t = t0
  for (const key of pin) {
    const k = layout[key]
    const hold = Math.max(30, g.gauss(p.hold, p.hold * 0.15))
    taps.push(tap(key, k, t, hold, k.cx + g.gauss(p.dx, 0.06) * k.w, k.cy + g.gauss(p.dy, 0.06) * k.h,
      r1(g.gauss(40, 3)), r1(g.gauss(40, 3))))
    t += hold + Math.max(20, g.gauss(p.flight, p.flight * 0.25))
  }
  const v = Math.max(0.3, g.gauss(p.swipeV, p.swipeV * 0.1))
  const points = Array.from({ length: 6 }, (_, i) => ({ t: i * 20, x: r1(200 + p.curve * (i / 5) ** 2 + g.gauss(0, 1)), y: r1(600 - v * 20 * i) }))
  return { user_id: userId, device_id: 'story_phone', pin_taps: taps, swipes: [{ points }],
    screens: [{ name: 'pin', t_enter: 0, t_first_touch: t0 }] }
}

/** Tactic 1 malware: constant rhythm, exact key centres, fixed touch size, perfectly straight swipe. */
export function botSession(userId: string, pin: string, layout: Layout, t0 = 300): SessionIn {
  const taps = [...pin].map((key, i) => { const k = layout[key]; return tap(key, k, t0 + i * 200, 60, k.cx, k.cy, 1, 1) })
  const points = Array.from({ length: 6 }, (_, i) => ({ t: i * 20, x: 200, y: 600 - 50 * i }))
  return { user_id: userId, device_id: 'story_phone', pin_taps: taps, swipes: [{ points }],
    screens: [{ name: 'pin', t_enter: 0, t_first_touch: t0 }] }
}
