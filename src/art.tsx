// Line art authored for Innate in the Movago style: stroke = currentColor, Lime = the highlighter.
const S = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'square' as const, strokeLinejoin: 'miter' as const }
const LIME = '#C8F65A'
const NAVY = '#0B1F44'

/** Keypad grid used by several pieces: 3 × 4 squares. */
function Pad({ x, y, k = 34, gap = 8, hit = [] as number[], dots = false }: { x: number; y: number; k?: number; gap?: number; hit?: number[]; dots?: boolean }) {
  return (
    <>
      {Array.from({ length: 12 }, (_, i) => {
        if (i === 9) return null
        const cx = x + (i % 3) * (k + gap), cy = y + Math.floor(i / 3) * (k + gap)
        const on = hit.includes(i)
        return (
          <g key={i}>
            <rect x={cx} y={cy} width={k} height={k} {...S} style={on ? { fill: LIME, stroke: NAVY } : undefined} />
            {dots && on && <circle cx={cx + k * 0.66} cy={cy + k * 0.38} r={3} fill={NAVY} />}
          </g>
        )
      })}
    </>
  )
}

/** Hero object: a phone hanging from one line, PIN pad lit where the owner taps. */
export function HeroPhone() {
  return (
    <svg viewBox="0 0 300 560" role="img" aria-label="Phone on a PIN pad, the owner's taps highlighted">
      <path d="M150 0v70" {...S} strokeWidth={2} />
      <rect x="130" y="62" width="40" height="14" {...S} />
      <rect x="40" y="76" width="220" height="440" rx="28" {...S} strokeWidth={2.5} style={{ fill: 'var(--surface)' }} />
      <rect x="120" y="90" width="60" height="10" rx="5" {...S} />
      <path d="M70 150h90" {...S} strokeWidth={3} />
      <g>{[0, 1, 2, 3].map((i) => <circle key={i} cx={104 + i * 30} cy={196} r={7} {...S} style={i < 3 ? { fill: 'currentColor' } : undefined} />)}</g>
      <Pad x={70} y={240} k={46} gap={12} hit={[0, 4, 8, 2]} dots />
      <path d="M124 488h52" {...S} strokeWidth={3} />
    </svg>
  )
}

/** Problem card: the right PIN typed by three different hands. */
export function ArtThreat() {
  return (
    <svg viewBox="0 0 340 300" role="img" aria-label="One PIN pad, three sources of taps: owner, another person, malware">
      <rect x="110" y="40" width="120" height="220" rx="16" {...S} />
      <Pad x={128} y={100} k={24} gap={8} hit={[0, 4, 8, 2]} />
      <circle cx="48" cy="80" r="22" {...S} />
      <path d="M70 84l50 30" {...S} strokeDasharray="4 4" />
      <circle cx="48" cy="220" r="22" {...S} />
      <path d="M70 214l50-30" {...S} strokeDasharray="4 4" />
      <rect x="270" y="130" width="44" height="44" {...S} />
      <path d="M280 152h24M292 140v24" {...S} />
      <path d="M268 152h-38" {...S} strokeDasharray="2 6" strokeWidth={2.5} />
      <rect x="250" y="60" width="78" height="22" fill={LIME} />
      <path d="M258 71h62" stroke={NAVY} strokeWidth={2} />
    </svg>
  )
}

/** Step 1: the SDK records press, release and position on each key. */
export function ArtCapture() {
  return (
    <svg viewBox="0 0 340 300" role="img" aria-label="A key with the finger position marked and a timeline of press and release">
      <rect x="40" y="40" width="130" height="130" {...S} />
      <path d="M105 40v130M40 105h130" {...S} opacity={0.35} />
      <circle cx="122" cy="92" r="16" fill={LIME} />
      <circle cx="122" cy="92" r="3" fill={NAVY} />
      <path d="M40 220h260" {...S} />
      {[[60, 110], [150, 205], [235, 290]].map(([a, b], i) => (
        <g key={i}><rect x={a} y={206} width={b - a - 40} height={14} fill={i === 0 ? LIME : 'currentColor'} opacity={i === 0 ? 1 : 0.5} /></g>
      ))}
      <path d="M200 70h100M200 100h70M200 130h90" {...S} opacity={0.55} />
    </svg>
  )
}

/** Step 2: two models, human-or-machine and owner-or-not. */
export function ArtModels() {
  return (
    <svg viewBox="0 0 340 300" role="img" aria-label="Two gauges: human or machine, owner or not">
      {[70, 220].map((cx, i) => (
        <g key={cx}>
          <path d={`M${cx - 55} 160a55 55 0 0 1 110 0`} {...S} strokeWidth={2} />
          <path d={`M${cx} 160l${i === 0 ? 38 : -30} ${i === 0 ? -28 : -36}`} {...S} strokeWidth={3} />
          <circle cx={cx} cy={160} r={5} fill="currentColor" />
          <rect x={cx - 50} y={190} width={100} height={18} {...S} style={i === 0 ? { fill: LIME, stroke: 'none' } : undefined} />
        </g>
      ))}
      <path d="M40 250h260" {...S} opacity={0.4} />
    </svg>
  )
}

/** Step 3: one decision with three outcomes. */
export function ArtDecide() {
  return (
    <svg viewBox="0 0 340 300" role="img" aria-label="One input branching to allow, step-up check and hold">
      <rect x="30" y="125" width="70" height="50" {...S} />
      <path d="M100 150h50M150 70v160M150 70h60M150 150h60M150 230h60" {...S} />
      <circle cx="232" cy="70" r="18" {...S} />
      <rect x="214" y="132" width="36" height="36" fill={LIME} transform="rotate(45 232 150)" />
      <rect x="214" y="212" width="36" height="36" {...S} strokeDasharray="4 3" />
      <path d="M262 70h50M262 150h50M262 230h50" {...S} opacity={0.5} />
    </svg>
  )
}
