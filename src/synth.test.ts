import { describe, expect, it } from 'vitest'
import { reasonText } from './api'
import { FRIEND, OWNER, botSession, humanSession, rng, type Layout } from './synth'

const layout: Layout = Object.fromEntries(
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((k, i) => [k, { cx: 60 + (i % 3) * 100, cy: 400 + Math.floor(i / 3) * 70, w: 90, h: 60 }]),
)

describe('synthetic sessions', () => {
  it('bot taps the exact key centre at a constant rhythm', () => {
    const s = botSession('u', '1593', layout)
    expect(s.pin_taps.map((t) => t.key).join('')).toBe('1593')
    expect(s.pin_taps.every((t) => t.x === t.key_cx && t.y === t.key_cy)).toBe(true)
    const holds = s.pin_taps.map((t) => t.t_up - t.t_down)
    expect(new Set(holds).size).toBe(1)
  })

  it('human sessions are seeded, ordered and off-centre like the persona', () => {
    const a = humanSession('u', '1593', layout, OWNER, rng(7))
    const b = humanSession('u', '1593', layout, OWNER, rng(7))
    expect(a).toEqual(b)
    const taps = a.pin_taps
    expect(taps.every((t, i) => i === 0 || t.t_down > taps[i - 1].t_up)).toBe(true)
    const meanDx = taps.reduce((s, t) => s + (t.x - t.key_cx) / t.key_w, 0) / taps.length
    expect(meanDx).toBeGreaterThan(0.05) // OWNER taps right of centre
    const friend = humanSession('u', '1593', layout, FRIEND, rng(7))
    const meanHold = (s: typeof a) => s.pin_taps.reduce((x, t) => x + t.t_up - t.t_down, 0) / s.pin_taps.length
    expect(meanHold(friend)).toBeGreaterThan(meanHold(a)) // FRIEND holds keys longer
  })
})

describe('reason texts', () => {
  it('renders API reason codes in both languages', () => {
    expect(reasonText('pin_rhythm_slower_40pct', 'vi')).toBe('Nhịp PIN chậm hơn 40%')
    expect(reasonText('tap_exact_center', 'en')).toBe('Taps hit the exact key centre')
    expect(reasonText('something_new', 'vi')).toBe('something_new')
  })
})
