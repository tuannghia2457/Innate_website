import { API_URL } from './api'
import { useT, type Lang } from './i18n'
import { FitText } from './ui'

// Footer in the Movora layout (DESIGN.md): contact block, three bordered link columns, ghost wordmark, bottom bar.
type L = { en: string; vi: string }
const cols: { label: L; links: [L, string][] }[] = [
  { label: { en: 'Innate', vi: 'Innate' }, links: [
    [{ en: 'Watch the story', vi: 'Xem tình huống' }, '#/demo?story=1'],
    [{ en: 'Try the demo wallet', vi: 'Tự thử ví demo' }, '#/demo'],
    [{ en: 'Ops dashboard', vi: 'Bảng vận hành' }, '#/ops'],
    [{ en: 'How it works', vi: 'Cách hoạt động' }, '#/#how'],
  ] },
  { label: { en: 'For developers', vi: 'Cho lập trình viên' }, links: [
    [{ en: 'API reference (Swagger)', vi: 'Tài liệu API (Swagger)' }, `${API_URL}/docs`],
    [{ en: 'OpenAPI schema', vi: 'Lược đồ OpenAPI' }, `${API_URL}/openapi.json`],
    [{ en: 'API status', vi: 'Trạng thái API' }, `${API_URL}/health`],
  ] },
  { label: { en: 'Data and privacy', vi: 'Dữ liệu và quyền riêng tư' }, links: [
    [{ en: 'What we collect', vi: 'Chúng tôi thu gì' }, '#/#faq'],
    [{ en: 'Why the AI never decides alone', vi: 'Vì sao AI không tự quyết' }, '#/#faq'],
  ] },
]
const ext = (href: string) => (href.startsWith('http') ? { target: '_blank', rel: 'noreferrer' } : {})

export default function Footer() {
  const { lang } = useT()
  const tr = (l: L) => l[lang as Lang]
  return (
    <footer className="foot" lang={lang}>
      <div className="wrap">
        <a className="foot-contact" href="#/demo?choose=1">
          <div>
            <h2 className="h2"><span className="mk">{lang === 'en' ? 'See it run' : 'Xem chạy thật'}</span></h2>
            <p>{lang === 'en' ? 'Innate, a behavioural risk layer for e-wallets. Passwords can be stolen. Habits can’t.' : 'Innate, lớp chấm điểm rủi ro hành vi cho ví điện tử. Mã PIN có thể bị lộ. Thói quen thì không.'}</p>
          </div>
          <svg className="foot-arrow" viewBox="0 0 48 48" aria-hidden="true"><path d="M4 24h36M26 10l14 14-14 14" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="square" /></svg>
        </a>

        <nav className="foot-cols" aria-label={lang === 'en' ? 'Footer' : 'Chân trang'}>
          {cols.map((c) => (
            <div key={c.label.en} className="foot-col">
              <h2>{tr(c.label)}</h2>
              <ul>{c.links.map(([l, href]) => <li key={l.en}><a href={href} {...ext(href)}>{tr(l)}</a></li>)}</ul>
            </div>
          ))}
        </nav>

        <p className="foot-statement">
          {lang === 'en'
            ? 'Innate is a contest prototype. The wallet, people and companies on this site are fictional, and every catch rate is simulated until it is measured on consented participants. Innate scores touch timing and position, and it recommends a step-up check rather than locking any account.'
            : 'Innate là sản phẩm dự thi. Ví, nhân vật và công ty trên trang là giả tưởng, mọi tỷ lệ phát hiện đều là giả lập cho tới khi được đo trên người tham gia có đồng ý. Innate chấm điểm dựa trên thời điểm và toạ độ chạm, và chỉ đề xuất xác thực thêm chứ không tự khoá tài khoản.'}
        </p>

        <div className="foot-word"><FitText text="INNATE" className="wordmark" /></div>

        <div className="foot-bottom">
          <p>© 2026 Innate. {lang === 'en' ? 'All rights reserved.' : 'Bảo lưu mọi quyền.'}</p>
        </div>
      </div>
    </footer>
  )
}
