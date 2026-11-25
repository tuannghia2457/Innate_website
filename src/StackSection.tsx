import { Icon, type IconName } from './icons'
import { Badge, Tx } from './ui'

type L = { en: string; vi: string }

const PIPE: { icon: IconName; t: L; d: L }[] = [
  { icon: 'phone', t: { en: 'SDK in the PIN pad', vi: 'SDK trong bàn phím PIN' }, d: { en: 'Press and release times, finger offset from the key centre, touch size, swipes, screen idle time', vi: 'Thời điểm nhấn và nhả, độ lệch ngón tay so với tâm phím, kích thước chạm, vuốt, thời gian dừng màn hình' } },
  { icon: 'scan', t: { en: 'Features', vi: 'Đặc trưng' }, d: { en: 'About 30 per session: rhythm, offsets, swipe speed and straightness, regularity', vi: 'Khoảng 30 đặc trưng mỗi phiên: nhịp, độ lệch, tốc độ và độ thẳng khi vuốt, độ đều' } },
  { icon: 'eye', t: { en: 'Human or machine', vi: 'Người hay máy' }, d: { en: 'Machine-regular timing and exact key centres flag Accessibility malware', vi: 'Nhịp đều như máy và chạm đúng tâm phím bắt mã độc Trợ năng' } },
  { icon: 'rules', t: { en: 'Owner or not', vi: 'Có phải chủ' }, d: { en: 'Scaled distance to the owner’s three-entry template, locked after enrollment', vi: 'Khoảng cách chuẩn hoá tới mẫu chuẩn ba lần nhập của chủ, khoá sau khi đăng ký' } },
  { icon: 'check', t: { en: 'Decision and reasons', vi: 'Quyết định và lý do' }, d: { en: 'Allow, step-up or hold, with reasons in Vietnamese; no LLM in the decision path', vi: 'Cho qua, xác thực thêm hoặc giữ lệnh, kèm lý do tiếng Việt; không có LLM trên đường ra quyết định' } },
]

const BUILT = ['FastAPI', 'Python', 'SQLAlchemy', 'Neon Postgres', 'Vercel', 'React', 'TypeScript', 'Vite', 'Pointer Events', 'pytest', 'Vitest']
const PLANNED: L[] = [
  { en: 'Trained human-or-machine model (LightGBM) on collected sessions', vi: 'Mô hình người hay máy (LightGBM) học trên phiên thu được' },
  { en: 'Pairwise owner verifier for new users', vi: 'Mô hình so cặp cho người dùng mới' },
  { en: 'Motion sensors around each tap', vi: 'Cảm biến chuyển động quanh mỗi cú chạm' },
  { en: 'Native Android and iOS SDKs', vi: 'SDK gốc cho Android và iOS' },
  { en: 'LLM case summaries for analysts, off the decision path', vi: 'LLM tóm tắt vụ việc cho chuyên viên, ngoài đường ra quyết định' },
]

export default function StackSection() {
  return (
    <section className="sec" aria-labelledby="stack">
      <div className="wrap">
        <div className="sec-head sec-tight reveal">
          <Badge><Tx v={{ en: 'Under the hood', vi: 'Bên trong Innate' }} /></Badge>
          <h2 className="h2" id="stack"><Tx v={{ en: 'From a tap to a decision', vi: 'Từ cú chạm tới quyết định' }} /></h2>
        </div>
        <ol className="pipe reveal">
          {PIPE.map((p, i) => (
            <li key={p.t.en} className="pipe-item edge">
              <span className="pcard-num">0{i + 1}</span>
              <span className="flow-title"><Icon name={p.icon} size={18} /> <Tx v={p.t} /></span>
              <span className="muted"><Tx v={p.d} /></span>
            </li>
          ))}
        </ol>
        <div className="stack-lists reveal">
          <div>
            <h3 className="h3"><Tx v={{ en: 'Built and running', vi: 'Đã dựng và đang chạy' }} /></h3>
            <ul className="chips">{BUILT.map((b) => <li key={b} className="chip">{b}</li>)}</ul>
          </div>
          <div>
            <h3 className="h3"><Tx v={{ en: 'Next', vi: 'Tiếp theo' }} /></h3>
            <ul className="plist">{PLANNED.map((p) => <li key={p.en}><Tx v={p} /></li>)}</ul>
          </div>
        </div>
      </div>
    </section>
  )
}
