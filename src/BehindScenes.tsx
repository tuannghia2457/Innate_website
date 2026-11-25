import { useEffect, useRef, useState } from 'react'
import Avatar from './Avatar'
import { Icon, type IconName } from './icons'
import { useT } from './i18n'
import { persona, type PersonaId } from './story'

// "Behind the scenes" picture-in-picture: a looping vignette per story step that shows what happens
// off-screen (the SDK, the fake call, the 2 a.m. malware, the ops review).
// Scenes are drawn on a 320 × 180 canvas; each actor moves along keyframes run by the Web Animations API.
type L = { en: string; vi: string }
/** [offset 0–1, dx px, dy px, opacity, scale] */
type P = [number, number, number, number?, number?]
interface Actor { who?: PersonaId; icon?: IconName; label?: string | L; tone?: 'light' | 'dark' | 'blue'; x: number; y: number; size?: number; path?: P[] }
interface Vignette { place: L; caption: L; seconds: number; set: 'office' | 'port' | 'desk'; actors: Actor[] }

const show = (from: number, to = 1): P[] => [[0, 0, 0, 0], [from, 0, 0, 0], [from + 0.04, 0, 0, 1], [to, 0, 0, 1], [Math.min(1, to + 0.04), 0, 0, 0], [1, 0, 0, 0]]
const pop = (at: number, until = 0.96): P[] => [[0, 0, 6, 0, 0.8], [at, 0, 6, 0, 0.8], [at + 0.06, 0, 0, 1, 1], [until, 0, 0, 1, 1], [1, 0, -4, 0, 1]]
const bob: P[] = [[0, 0, 0], [0.5, 0, -3], [1, 0, 0]]
const api: Actor = { icon: 'laptop', label: 'Innate API', tone: 'dark', x: 230, y: 12 }
const fly = (from: number, dx: number, dy: number): P[] => [[0, 0, 0, 0], [from, 0, 0, 0], [from + 0.04, 0, 0, 1], [from + 0.3, dx, dy, 1], [from + 0.34, dx, dy, 0], [1, dx, dy, 0]]

// one vignette per story step (story.ts STEPS), same order
const VIGNETTES: Vignette[] = [
  {
    set: 'desk', seconds: 9,
    place: { en: 'Demo Wallet · mobile team', vi: 'Ví Demo · đội mobile' },
    caption: { en: 'Vy drops the SDK into the PIN pad. Each session leaves the phone as timings and positions.', vi: 'Vy gắn SDK vào bàn phím PIN. Mỗi phiên rời điện thoại dưới dạng thời điểm và vị trí chạm.' },
    actors: [
      api,
      { who: 'vy', x: 16, y: 94, size: 56, path: bob },
      { icon: 'laptop', label: 'SDK', x: 110, y: 122 },
      { icon: 'phone', label: { en: 'PIN pad', vi: 'Bàn phím PIN' }, tone: 'blue', x: 120, y: 70, path: pop(0.2) },
      { icon: 'table', label: '{ t_down, x, y }', x: 120, y: 70, path: fly(0.5, 110, -56) },
    ],
  },
  {
    set: 'office', seconds: 9,
    place: { en: 'Hà’s desk', vi: 'Bàn làm việc của Hà' },
    caption: { en: 'Three PIN entries become Hà’s template. Then enrollment locks.', vi: 'Ba lần nhập PIN thành mẫu chuẩn của Hà. Sau đó việc đăng ký khoá lại.' },
    actors: [
      api,
      { who: 'ha', x: 16, y: 94, size: 56, path: bob },
      { icon: 'phone', label: '1/3', x: 96, y: 112, path: fly(0.05, 130, -96) },
      { icon: 'phone', label: '2/3', x: 96, y: 112, path: fly(0.3, 130, -96) },
      { icon: 'phone', label: '3/3', x: 96, y: 112, path: fly(0.55, 130, -96) },
      { icon: 'check', label: { en: 'Template locked', vi: 'Đã khoá mẫu chuẩn' }, tone: 'dark', x: 150, y: 60, path: pop(0.85) },
    ],
  },
  {
    set: 'office', seconds: 8,
    place: { en: 'Hà’s desk', vi: 'Bàn làm việc của Hà' },
    caption: { en: 'Her own rhythm, a known recipient: allowed in one step.', vi: 'Đúng nhịp của Hà, người nhận quen: cho qua ngay.' },
    actors: [
      api,
      { who: 'ha', x: 16, y: 94, size: 56, path: bob },
      { icon: 'phone', label: '500.000', tone: 'blue', x: 96, y: 112, path: fly(0.1, 130, -96) },
      { icon: 'check', label: { en: 'Allow', vi: 'Cho qua' }, tone: 'dark', x: 150, y: 60, path: pop(0.5) },
    ],
  },
  {
    set: 'office', seconds: 9,
    place: { en: 'A phone call at night', vi: 'Một cuộc gọi buổi tối' },
    caption: { en: 'A fake officer sends a fake app. It asks for Accessibility, so it can tap for Hà.', vi: 'Cán bộ giả gửi ứng dụng giả. Ứng dụng xin quyền Trợ năng để bấm thay Hà.' },
    actors: [
      { who: 'an', x: 230, y: 90, size: 56, path: bob },
      { who: 'ha', x: 16, y: 94, size: 56, path: bob },
      { icon: 'call', label: { en: '“Police”', vi: '“Công an”' }, tone: 'blue', x: 150, y: 40, path: show(0.05, 0.5) },
      { icon: 'doc', label: 'app.apk', x: 200, y: 110, path: fly(0.4, -110, 0) },
      { icon: 'bell', label: { en: 'Allow Accessibility?', vi: 'Cấp quyền Trợ năng?' }, tone: 'dark', x: 90, y: 60, path: pop(0.75) },
    ],
  },
  {
    set: 'desk', seconds: 8,
    place: { en: '2 a.m., Hà asleep', vi: '2 giờ sáng, Hà đang ngủ' },
    caption: { en: 'The malware taps the PIN at a machine rhythm. Innate holds the transfer.', vi: 'Mã độc bấm PIN với nhịp đều như máy. Innate giữ lệnh lại.' },
    actors: [
      api,
      { who: 'an', x: 16, y: 94, size: 56, path: bob },
      { icon: 'phone', label: '20.000.000', tone: 'blue', x: 96, y: 112, path: fly(0.1, 130, -96) },
      { icon: 'stamp', label: { en: 'Hold', vi: 'Giữ lệnh' }, tone: 'dark', x: 150, y: 60, path: pop(0.5) },
    ],
  },
  {
    set: 'office', seconds: 8,
    place: { en: 'Lunch break, Hà’s desk', vi: 'Giờ nghỉ trưa, bàn của Hà' },
    caption: { en: 'Bảo knows the PIN but not Hà’s touch. Innate asks for a face check.', vi: 'Bảo biết PIN nhưng không có nhịp chạm của Hà. Innate yêu cầu xác thực khuôn mặt.' },
    actors: [
      api,
      { who: 'bao', x: 16, y: 94, size: 56, path: bob },
      { icon: 'phone', label: '2.000.000', tone: 'blue', x: 96, y: 112, path: fly(0.1, 130, -96) },
      { icon: 'eye', label: { en: 'Face check', vi: 'Xác thực khuôn mặt' }, tone: 'dark', x: 150, y: 60, path: pop(0.5) },
    ],
  },
  {
    set: 'desk', seconds: 8,
    place: { en: 'Demo Wallet · fraud ops', vi: 'Ví Demo · vận hành chống gian lận' },
    caption: { en: 'Two flagged sessions, each with its reasons. Khoa labels them fraud.', vi: 'Hai phiên bị gắn cờ, mỗi phiên kèm lý do. Khoa gắn nhãn gian lận.' },
    actors: [
      { who: 'khoa', x: 16, y: 94, size: 56, path: bob },
      { icon: 'laptop', label: { en: 'Dashboard', vi: 'Bảng vận hành' }, x: 110, y: 122 },
      { icon: 'bell', label: { en: '2 flagged', vi: '2 bị gắn cờ' }, tone: 'blue', x: 120, y: 60, path: pop(0.15) },
      { icon: 'check', label: { en: 'Fraud ×2', vi: 'Gian lận ×2' }, tone: 'dark', x: 200, y: 96, path: pop(0.55) },
    ],
  },
  {
    set: 'office', seconds: 8,
    place: { en: 'Demo Wallet · risk team', vi: 'Ví Demo · bộ phận rủi ro' },
    caption: { en: 'Step up before blocking; people decide. Hà’s account stays open.', vi: 'Xác thực thêm trước khi chặn; con người quyết định. Tài khoản của Hà vẫn mở.' },
    actors: [
      { who: 'lananh', x: 16, y: 94, size: 56, path: bob },
      { icon: 'rules', label: { en: 'Thresholds', vi: 'Ngưỡng' }, x: 110, y: 70, path: pop(0.1) },
      { who: 'ha', x: 230, y: 94, size: 56, path: pop(0.45) },
    ],
  },
]

const reduced = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches

function ActorEl({ a, seconds }: { a: Actor; seconds: number }) {
  const { lang } = useT()
  const label = typeof a.label === 'string' ? a.label : a.label?.[lang]
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el || !a.path) return
    const frames = a.path.map(([offset, x, y, opacity = 1, s = 1]) => ({ offset, transform: `translate(${x}px, ${y}px) scale(${s})`, opacity }))
    if (reduced()) {
      // still frame: the last visible pose
      const f = [...frames].reverse().find((k) => k.opacity > 0) ?? frames[0]
      el.style.transform = f.transform
      el.style.opacity = String(f.opacity)
      return
    }
    const anim = el.animate(frames, { duration: seconds * 1000, iterations: Infinity, easing: 'cubic-bezier(0.45, 0, 0.25, 1)' })
    return () => anim.cancel()
  }, [a, seconds])
  return (
    <div ref={ref} className="act" style={{ left: a.x, top: a.y }}>
      {a.who ? <Avatar p={persona(a.who)} size={a.size ?? 48} /> : <span className={`prop ${a.tone ?? 'light'}`}>{a.icon && <Icon name={a.icon} size={12} />}{label}</span>}
    </div>
  )
}

export default function BehindScenes({ step }: { step: number }) {
  const { lang } = useT()
  const [open, setOpen] = useState(() => window.innerWidth > 640)
  const v = VIGNETTES[step]
  if (!v) return null
  const label = lang === 'en' ? 'Behind the scenes' : 'Hậu trường'
  if (!open) {
    return (
      <button className="pip-min" onClick={() => setOpen(true)}><span className="pip-rec" />{label}</button>
    )
  }
  return (
    <aside className="pip" aria-label={label}>
      <div className="pip-head">
        <span className="pip-rec" aria-hidden="true" />
        <span className="pip-title">{label}<span> · {v.place[lang]}</span></span>
        <button className="pip-x" onClick={() => setOpen(false)} aria-label={lang === 'en' ? 'Minimise' : 'Thu nhỏ'}>
          <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true"><path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        </button>
      </div>
      <div className="pip-frame">
        <div className={`pip-canvas set-${v.set}`} key={step}>
          <Backdrop set={v.set} />
          {v.actors.map((a, i) => <ActorEl key={i} a={a} seconds={v.seconds} />)}
        </div>
      </div>
      <div className="pip-bar" key={`bar-${step}`}><i style={{ animationDuration: `${v.seconds}s` }} /></div>
      <p className="pip-cap" key={`cap-${step}`}>{v.caption[lang]}</p>
    </aside>
  )
}

function Backdrop({ set }: { set: Vignette['set'] }) {
  if (set === 'port') {
    return (
      <div className="bd" aria-hidden="true">
        <span className="crane" /><span className="jib" />
        {[0, 1, 2, 3, 4].map((i) => <span key={i} className={`box c${i % 3}`} style={{ left: 96 + i * 40, top: 138 - (i % 2) * 18 }} />)}
        <span className="ground" />
      </div>
    )
  }
  return (
    <div className="bd" aria-hidden="true">
      <span className="window" />
      {set === 'desk' && <span className="desk" />}
      <span className="ground" />
    </div>
  )
}
