import { useEffect, useRef, useState, type CSSProperties, type ComponentType } from 'react'
import { ArtCapture, ArtDecide, ArtModels, ArtThreat, HeroPhone } from './art'
import { INTRO_DONE, introRunning } from './Intro'
import { Icon, type IconName } from './icons'
import { useT } from './i18n'
import { demo } from './links'
import StackSection from './StackSection'
import { PERSONAS, type PersonaId } from './story'
import { ArrowBtn, Badge, FitText, Glyph, useReveal, T, Tx } from './ui'

// Landing in the Movora layout (DESIGN.md): hero wordmark, threat strip, problem, numbered outcomes, decision + KPIs,
// the Lime process band, stack, cast, FAQ. Figures are labelled measured or simulated.
type L = { en: string; vi: string }
const avatar = (id: PersonaId) => `${import.meta.env.BASE_URL}avatars/${id}.svg`

const C = {
  threats: { en: 'How a correct PIN ends up in the wrong hands', vi: 'Mã PIN đúng rơi vào tay kẻ gian bằng cách nào' },
  problem: { en: 'The problem', vi: 'Vấn đề' },
  problemTitle: { en: 'PIN, OTP and device all say “owner”. The person holding the phone may not be.', vi: 'PIN, OTP và thiết bị đều nói “chủ tài khoản”. Người đang cầm máy thì chưa chắc.' },
  twoWays: { en: 'Two ways in', vi: 'Hai đường vào' },
  problemBody: {
    en: 'Malware with Accessibility permission reads the screen and taps the PIN itself, and the person who watched you type it needs nothing else. Every check that asks “do you know the secret?” passes.',
    vi: 'Mã độc có quyền Trợ năng đọc màn hình và tự bấm PIN, còn người đã nhìn bạn gõ PIN thì không cần gì thêm. Mọi bước kiểm tra kiểu “bạn có biết mật khẩu không?” đều qua.',
  },
  whatsLeft: { en: 'What is left', vi: 'Thứ còn lại' },
  whatsLeftBody: {
    en: 'How you type. Your hold times, the gaps between keys and where your thumb lands are hard to copy, and a script’s taps look nothing like a finger’s.',
    vi: 'Cách bạn gõ. Thời gian giữ phím, khoảng nghỉ giữa các phím và chỗ ngón cái chạm rất khó bắt chước, còn cú chạm của script thì không giống ngón tay.',
  },
  outcomes: { en: 'Outcomes', vi: 'Kết quả' },
  outcomesTitle: { en: 'Three answers, each with its reasons', vi: 'Ba câu trả lời, mỗi câu kèm lý do' },
  outcomesSub: { en: 'Innate only recommends. The wallet decides what to do, and an account is never locked by the algorithm.', vi: 'Innate chỉ đề xuất. Ví quyết định làm gì, và tài khoản không bao giờ bị thuật toán khoá.' },
  control: { en: 'Inside a score', vi: 'Bên trong một lần chấm' },
  controlTitle: { en: 'Two questions, one decision', vi: 'Hai câu hỏi, một quyết định' },
  kpiNote: {
    en: 'Latency measured on the live API. Catch rates are simulated on synthetic sessions (attacker/), not yet on people; the team measures them on consented participants before the final.',
    vi: 'Độ trễ đo trên API thật. Tỷ lệ phát hiện là giả lập trên phiên tổng hợp (attacker/), chưa đo trên người; đội sẽ đo trên người tham gia có đồng ý trước chung kết.',
  },
  howTitle: { en: 'Tap. Score. Ask before blocking.', vi: 'Chạm. Chấm điểm. Hỏi trước khi chặn.' },
  storyBadge: { en: 'The story', vi: 'Câu chuyện' },
  castTitle: { en: 'One wallet, three people, one PIN', vi: 'Một ví, ba người, một mã PIN' },
  castSub: { en: 'Follow Hà, the colleague who saw her PIN and the malware that taps it at 2 a.m.', vi: 'Theo chân Hà, người đồng nghiệp từng nhìn lén PIN và mã độc tự bấm PIN lúc 2 giờ sáng.' },
  fictional1: { en: 'Fictional character', vi: 'Nhân vật giả tưởng' },
  faqBadge: { en: 'FAQ', vi: 'Hỏi đáp' },
  faqTitle: { en: 'Fair questions', vi: 'Câu hỏi thường gặp' },
  faqMore: { en: 'See it run', vi: 'Xem chạy thật' },
  faqMoreSub: { en: 'Enroll your own rhythm, then let a friend or the malware try.', vi: 'Đăng ký nhịp của bạn, rồi cho bạn bè hoặc mã độc thử.' },
  measured: { en: 'Measured', vi: 'Đo thật' },
}

const THREATS: { icon: IconName; t: L }[] = [
  { icon: 'doc', t: { en: 'Fake app (APK)', vi: 'Ứng dụng giả (APK)' } },
  { icon: 'eye', t: { en: 'Accessibility abuse', vi: 'Lạm dụng quyền Trợ năng' } },
  { icon: 'call', t: { en: 'Fake officer calls', vi: 'Cuộc gọi giả danh' } },
  { icon: 'phone', t: { en: 'PIN seen over a shoulder', vi: 'PIN bị nhìn lén' } },
  { icon: 'chat', t: { en: 'Coached by a scammer', vi: 'Bị kẻ gian dẫn dắt' } },
]

const STEPS: { art: ComponentType; t: L; d: L }[] = [
  {
    art: ArtCapture,
    t: { en: 'Capture the touch', vi: 'Ghi lại cú chạm' },
    d: { en: 'The SDK in the PIN pad records when each key goes down and up, where the finger lands and every swipe. Timing and position, scored at the confirm step.', vi: 'SDK trong bàn phím PIN ghi lúc mỗi phím được nhấn và nhả, ngón tay chạm vào đâu và mọi lần vuốt. Chỉ thời điểm và vị trí, chấm ở bước xác nhận.' },
  },
  {
    art: ArtModels,
    t: { en: 'Ask two questions', vi: 'Hỏi hai câu' },
    d: { en: 'Is this a human or a machine? Is this human the owner? The first catches Accessibility malware, the second the person who knows the PIN.', vi: 'Đây là người hay máy? Người này có phải chủ ví? Câu đầu bắt mã độc Trợ năng, câu sau bắt người đã biết PIN.' },
  },
  {
    art: ArtDecide,
    t: { en: 'Recommend, with reasons', vi: 'Đề xuất, kèm lý do' },
    d: { en: 'Allow, ask for a face check, or hold the transfer, with plain-language reasons for the user and the ops team. People keep the final say.', vi: 'Cho qua, yêu cầu xác thực khuôn mặt, hoặc giữ lệnh, kèm lý do dễ hiểu cho người dùng và đội vận hành. Con người giữ quyền quyết định cuối.' },
  },
]

const FAQ: { q: L; a: L }[] = [
  {
    q: { en: 'What runs live in this demo?', vi: 'Phần nào trong demo chạy thật?' },
    a: { en: 'The SDK capture on the demo wallet, the scoring API, enrollment, the decision and its reasons, and the ops dashboard all run live. The wallet, the people and the attacker sessions are simulated.', vi: 'Phần SDK ghi thao tác trên ví demo, API chấm điểm, đăng ký nhịp, quyết định và lý do, và bảng vận hành đều chạy thật. Ví, nhân vật và các phiên tấn công là giả lập.' },
  },
  {
    q: { en: 'Don’t e-wallets already have biometrics?', vi: 'Ví điện tử chẳng phải đã có sinh trắc học sao?' },
    a: { en: 'Face checks run at login or for large amounts. Innate runs on every PIN entry without asking the user for anything, and decides when a face check is worth the friction.', vi: 'Xác thực khuôn mặt chạy khi đăng nhập hoặc khi chuyển số tiền lớn. Innate chạy ở mỗi lần nhập PIN mà không bắt người dùng làm gì thêm, và quyết định khi nào đáng bắt xác thực khuôn mặt.' },
  },
  {
    q: { en: 'What if the real owner is rejected?', vi: 'Nếu chủ thật bị từ chối thì sao?' },
    a: { en: 'They get a face check, not a block. Thresholds are set to bother the real owner rarely, and accounts are never locked automatically.', vi: 'Chủ thật chỉ bị yêu cầu xác thực khuôn mặt, không bị chặn. Ngưỡng được đặt để hiếm khi làm phiền chủ thật, và tài khoản không bao giờ bị tự động khoá.' },
  },
  {
    q: { en: 'Can a bot copy a real person’s rhythm?', vi: 'Bot có bắt chước được nhịp của người thật không?' },
    a: { en: 'A simple bot is caught today. Replaying a recorded session or sampling human timings still gets past the rule-based baseline in our simulator, which is why the trained model is next on the roadmap. We report this openly.', vi: 'Bot đơn giản bị bắt ngay. Phát lại phiên đã ghi hoặc lấy mẫu nhịp người thật vẫn qua được bản luật cơ sở trong bộ giả lập của đội, nên mô hình học là việc tiếp theo trong lộ trình. Đội công bố điều này minh bạch.' },
  },
  {
    q: { en: 'Is touch data personal data?', vi: 'Dữ liệu chạm có phải dữ liệu cá nhân không?' },
    a: { en: 'Yes. Vietnam’s 2025 Personal Data Protection Law treats biometrics as sensitive, so collection needs explicit consent and the data stays scoped to scoring. Dashboard and export use separate keys from the app.', vi: 'Có. Luật Bảo vệ dữ liệu cá nhân 2025 xếp sinh trắc học vào dữ liệu nhạy cảm, nên thu thập cần đồng ý rõ ràng và dữ liệu chỉ dùng để chấm điểm. Bảng vận hành và xuất dữ liệu dùng key riêng, tách khỏi ứng dụng.' },
  },
  {
    q: { en: 'Why not let an LLM decide?', vi: 'Sao không để LLM quyết định?' },
    a: { en: 'Latency, consistency and audit. Scoring takes about 20 ms and gives the same answer for the same input. An LLM may later summarise cases for analysts, off the decision path.', vi: 'Vì độ trễ, tính nhất quán và khả năng kiểm toán. Chấm điểm mất khoảng 20 ms và cùng đầu vào cho cùng kết quả. LLM sau này có thể tóm tắt vụ việc cho chuyên viên, ngoài đường ra quyết định.' },
  },
]

export default function Landing() {
  const { t, lang, money } = useT()
  const tx = (x: L) => x[lang]
  const [open, setOpen] = useState(1)
  useReveal(lang)

  // Movora's hero entrance runs on mount; on the first home load it waits until the intro lifts away.
  const [go, setGo] = useState(() => !introRunning())
  useEffect(() => {
    if (go) return
    const start = () => setGo(true)
    window.addEventListener(INTRO_DONE, start)
    const fallback = window.setTimeout(start, 5000)
    return () => { window.removeEventListener(INTRO_DONE, start); window.clearTimeout(fallback) }
  }, [go])

  // the hanging phone drops a further 100 px while the hero scrolls away
  const crateRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = crateRef.current
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    let raf = 0
    const on = () => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(() => {
        const h = el.parentElement?.offsetHeight ?? window.innerHeight
        el.style.translate = `0 ${Math.round(Math.min(window.scrollY / h, 1) * 100)}px`
      })
    }
    on()
    window.addEventListener('scroll', on, { passive: true })
    return () => { window.removeEventListener('scroll', on); cancelAnimationFrame(raf) }
  }, [])

  const OUTCOMES = [
    {
      key: 'allow', status: 'matched', title: t('act_allow'),
      body: tx({ en: 'A human, matching the owner’s rhythm, in a normal context. No extra step.', vi: 'Người thật, khớp nhịp của chủ ví, bối cảnh bình thường. Không thêm bước nào.' }),
      pills: lang === 'en' ? ['(01) Human score high', '(02) Owner match high', '(03) Known recipient, usual amount'] : ['(01) Điểm người thật cao', '(02) Khớp chủ cao', '(03) Người nhận quen, số tiền thường lệ'],
      evi: [[t('humanScore'), '100%'], [t('ownerMatch'), '81%']], out: '7%',
    },
    {
      key: 'step_up', status: 'sent', title: t('act_step_up'),
      body: tx({ en: 'A real person, but not the owner, or a doubtful context. The wallet asks for a face check before money moves.', vi: 'Người thật nhưng không phải chủ ví, hoặc bối cảnh đáng ngờ. Ví yêu cầu xác thực khuôn mặt trước khi chuyển tiền.' }),
      pills: lang === 'en' ? ['(01) PIN rhythm 51% slower', '(02) Taps further left and lower', '(03) New recipient'] : ['(01) Nhịp PIN chậm hơn 51%', '(02) Chạm lệch trái và xuống dưới', '(03) Người nhận mới'],
      evi: [[t('humanScore'), '100%'], [t('ownerMatch'), '12%']], out: '52%',
    },
    {
      key: 'hold', status: 'discrepancy', title: t('act_hold'),
      body: tx({ en: 'Machine input: steady timing, every tap on the exact key centre. The transfer waits and the user is contacted.', vi: 'Thao tác của máy: nhịp đều, mọi cú chạm rơi đúng tâm phím. Lệnh chuyển được giữ lại và người dùng được liên hệ.' }),
      pills: lang === 'en' ? ['(01) Machine-regular timing', '(02) Exact key centres', '(03) Perfectly straight swipe'] : ['(01) Nhịp bấm đều bất thường', '(02) Chạm đúng tâm nút', '(03) Vuốt thẳng tuyệt đối'],
      evi: [[t('humanScore'), '0%'], [t('ownerMatch'), '28%']], out: '93%',
    },
  ] as const

  const STORIES = [
    {
      p: PERSONAS.find((p) => p.id === 'ha')!,
      quote: lang === 'en' ? '“I type my PIN the same way every day. When Bảo tried it, the wallet asked for my face instead of sending him the money.”' : '“Ngày nào tôi cũng gõ PIN theo một kiểu. Khi Bảo thử, ví đòi xác thực khuôn mặt thay vì chuyển tiền cho cậu ấy.”',
      stats: [{ l: tx({ en: 'Her own transfer', vi: 'Lệnh của chính Hà' }), v: t('act_allow') }, { l: tx({ en: 'Bảo with her PIN', vi: 'Bảo dùng PIN của Hà' }), v: t('act_step_up') }],
    },
    {
      p: PERSONAS.find((p) => p.id === 'khoa')!,
      quote: lang === 'en' ? `“The 2 a.m. transfer of ${money(20_000_000)} came in with ‘machine-regular timing, exact key centres’. I marked it fraud in one click.”` : `“Lệnh ${money(20_000_000)} lúc 2 giờ sáng đến kèm lý do ‘nhịp đều bất thường, chạm đúng tâm nút’. Tôi đánh dấu gian lận bằng một cú bấm.”`,
      stats: [{ l: tx({ en: 'Malware transfer', vi: 'Lệnh của mã độc' }), v: t('act_hold') }, { l: tx({ en: 'Account locked', vi: 'Tài khoản bị khoá' }), v: tx({ en: 'Never', vi: 'Không' }) }],
    },
  ]

  return (
    <>
      {/* ===== hero: wordmark drops in, the phone is lowered on a spring, the copy rises ===== */}
      <section className={`hero2 ${go ? 'go' : ''}`} aria-labelledby="hero-title">
        <div className="wrap hero2-top"><div className="a-word"><FitText text="INNATE" className="wordmark" /></div></div>
        <div className="crate crate-phone" ref={crateRef} aria-hidden="true">
          <div className="crate-drop"><div className="crate-sway"><HeroPhone /></div></div>
        </div>
        <div className="wrap">
          <div className="hero2-foot">
            <div className="hero2-copy">
              <div className="a-up"><Badge><T k="slogan" /></Badge></div>
              <h1 className="h3 a-up" id="hero-title" style={{ '--ad': '0.08s' } as CSSProperties}><T k="heroTitle" /></h1>
              <div className="hero2-ctas a-up" style={{ '--ad': '0.16s' } as CSSProperties}>
                <ArrowBtn href={demo('#/demo?choose=1')}><T k="introDemo" /></ArrowBtn>
              </div>
              <p className="hero2-meta a-up" style={{ '--ad': '0.24s' } as CSSProperties}>{tx({ en: 'A behavioural risk layer for e-wallets', vi: 'Lớp chấm điểm rủi ro hành vi cho ví điện tử' })}</p>
            </div>
            <div className="a-up" style={{ '--ad': '1.2s' } as CSSProperties}>
              <div className="hero-card edge" role="group" aria-label={tx({ en: 'Example score', vi: 'Ví dụ kết quả chấm' })}>
                <div className="hc-bar"><b>POST /v1/sessions/…/score</b><span className="chip sim"><T k="live" /></span></div>
                <div className="hc-rows">
                  <div className="hc-row"><span>{t('humanScore')}</span><span className="muted">100%</span><span className="status matched">{tx({ en: 'Human', vi: 'Người' })}</span></div>
                  <div className="hc-row"><span>{t('ownerMatch')}</span><span className="muted">12%</span><span className="status discrepancy">{tx({ en: 'Not owner', vi: 'Không khớp' })}</span></div>
                </div>
                <div className="hc-diff"><b>{t('act_step_up')}</b><span>{tx({ en: 'PIN rhythm 51% slower', vi: 'Nhịp PIN chậm hơn 51%' })}<br />{tx({ en: 'Taps further left and lower', vi: 'Chạm lệch trái và xuống dưới' })}</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== threats (Movora's logo strip) ===== */}
      <section className="wrap" aria-label={tx(C.threats)}>
        <ul className="strip" style={{ listStyle: 'none', margin: 0 }}>
          {THREATS.map((c) => <li key={c.t.en} className="strip-cell edge"><Icon name={c.icon} size={20} /><Tx v={c.t} /></li>)}
        </ul>
      </section>

      {/* ===== problem ===== */}
      <section className="sec" aria-labelledby="problem-title">
        <div className="wrap">
          <div className="about-head reveal">
            <Badge><Tx v={C.problem} /></Badge>
            <h2 className="statement" id="problem-title"><Tx v={C.problemTitle} /></h2>
          </div>
          <div className="about-grid">
            <article className="art-card edge reveal">
              <h3 className="h3"><Tx v={C.twoWays} /></h3>
              <div className="art"><ArtThreat /></div>
              <ol className="plist">
                <li><b>(01) {tx({ en: 'Remote-control malware', vi: 'Mã độc điều khiển từ xa' })}</b><span>{tx({ en: 'A fake app gets Accessibility and taps the PIN itself.', vi: 'Ứng dụng giả có quyền Trợ năng và tự bấm PIN.' })}</span></li>
                <li><b>(02) {tx({ en: 'Someone who knows the PIN', vi: 'Người đã biết PIN' })}</b><span>{tx({ en: 'A colleague, a relative, a thief who watched.', vi: 'Đồng nghiệp, người thân, kẻ trộm từng nhìn lén.' })}</span></li>
              </ol>
            </article>
            <article className="mid-card reveal" style={{ '--rd': '0.08s' } as CSSProperties}>
              <p className="pretty"><Tx v={C.problemBody} /></p>
              <ArrowBtn href={demo('#/demo?story=1')}><T k="ctaStory" /></ArrowBtn>
            </article>
            <article className="art-card edge reveal" style={{ '--rd': '0.16s' } as CSSProperties}>
              <h3 className="h3"><Tx v={C.whatsLeft} /></h3>
              <div className="art"><ArtCapture /></div>
              <p className="pretty"><Tx v={C.whatsLeftBody} /></p>
            </article>
          </div>
        </div>
      </section>

      {/* ===== outcomes: numbered rows ===== */}
      <section className="sec" aria-labelledby="outcomes-title">
        <div className="wrap">
          <div className="sec-head reveal">
            <Badge><Tx v={C.outcomes} /></Badge>
            <h2 className="h2" id="outcomes-title"><Tx v={C.outcomesTitle} /></h2>
            <p className="sub lg"><Tx v={C.outcomesSub} /></p>
          </div>
          <div className="nrows">
            {OUTCOMES.map((o, i) => {
              const isOpen = open === i
              return (
                <article key={o.key} className="nrow edge reveal" data-open={isOpen}>
                  <button className="nrow-head" aria-expanded={isOpen} aria-controls={`out-${o.key}`} onClick={() => setOpen(isOpen ? -1 : i)}>
                    <span className="nrow-num">0{i + 1}</span>
                    <span className="nrow-title">{o.title}</span>
                    <span className="nrow-plus" aria-hidden="true"><Glyph name="plus" /></span>
                  </button>
                  {isOpen && (
                    <div className="nrow-body" id={`out-${o.key}`}>
                      <div className="evi">
                        {o.evi.map(([k, v]) => <div key={k} className="evi-row"><span className="k">{k}</span><b>{v}</b></div>)}
                        <div className="evi-out"><span className={`status ${o.status}`}>{t('riskScore')}</span><b>{o.out}</b></div>
                      </div>
                      <div className="nrow-copy">
                        <p className="pretty">{o.body}</p>
                        <ul className="pills">{o.pills.map((p) => <li key={p}>{p}</li>)}</ul>
                        <div><ArrowBtn href={demo('#/demo')}><T k="ctaTry" /></ArrowBtn></div>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== inside a score: list + response + KPIs ===== */}
      <section className="sec" aria-labelledby="control-title">
        <div className="wrap">
          <div className="sec-head reveal">
            <Badge><Tx v={C.control} /></Badge>
            <h2 className="h2" id="control-title"><Tx v={C.controlTitle} /></h2>
          </div>
          <div className="ctl">
            <ul className="ctl-list reveal">
              <li>{tx({ en: 'Human or machine: timing regularity, exact key centres, swipe straightness', vi: 'Người hay máy: độ đều của nhịp, chạm đúng tâm phím, độ thẳng khi vuốt' })}</li>
              <li>{tx({ en: 'Owner or not: distance to a template from three PIN entries', vi: 'Có phải chủ: khoảng cách tới mẫu chuẩn từ ba lần nhập PIN' })}</li>
              <li>{tx({ en: 'Context: new recipient, amount unusual for this user', vi: 'Bối cảnh: người nhận mới, số tiền bất thường với người dùng này' })}</li>
              <li>{tx({ en: 'Enrollment locks after three entries, so nobody can add their rhythm later', vi: 'Đăng ký khoá sau ba lần nhập, không ai chèn nhịp của mình vào sau được' })}</li>
              <li>{tx({ en: 'Separate keys for the app, the ops dashboard and data export', vi: 'Key riêng cho ứng dụng, bảng vận hành và xuất dữ liệu' })}</li>
            </ul>
            <div className="device edge reveal" aria-label={tx({ en: 'Example API response', vi: 'Ví dụ phản hồi API' })}>
              <div className="device-bar"><span className="mono">200 OK · 17 ms</span><span className="chip sim"><T k="live" /></span></div>
              <div className="device-body">
                <pre className="code">{`{
  "human_score": 1.0,
  "owner_match": 0.116,
  "risk": "medium",
  "action": "step_up",
  "reasons": ["tap_offset_left",
    "pin_rhythm_slower_51pct",
    "new_recipient"],
  "explanation_vi": "Thao tác giống người
    thật nhưng không khớp thói quen của
    chủ tài khoản…"
}`}</pre>
              </div>
            </div>
          </div>
          <div className="kpis">
            {[
              { l: tx({ en: 'Scoring latency, server', vi: 'Độ trễ chấm điểm, phía server' }), v: '16–21 ms', tag: C.measured },
              { l: tx({ en: 'Steady-rhythm bots held', vi: 'Bot nhịp đều bị giữ lệnh' }), v: '100%', tag: null },
              { l: tx({ en: 'PIN-knowers flagged', vi: 'Người biết PIN bị gắn cờ' }), v: '100%', tag: null },
              { l: tx({ en: 'Owners let through', vi: 'Chủ thật được cho qua' }), v: '95%', tag: null },
            ].map((k, i) => (
              <div key={k.l} className="kpi edge reveal" style={{ '--rd': `${i * 0.08}s` } as CSSProperties}>
                <span className="kpi-label">{k.l}</span>
                <span className="kpi-value"><span className="mk">{k.v}</span></span>
                <span className="kpi-tag">{k.tag ? tx(k.tag) : t('simulated')}</span>
              </div>
            ))}
          </div>
          <p className="kpi-note"><Tx v={C.kpiNote} /></p>
        </div>
      </section>

      {/* ===== the Lime band: how it works ===== */}
      <section className="sec band" id="how" aria-labelledby="how-title">
        <div className="wrap">
          <div className="sec-head center reveal">
            <Badge><T k="navHow" /></Badge>
            <h2 className="h2" id="how-title"><Tx v={C.howTitle} /></h2>
          </div>
          <div className="pcards">
            {STEPS.map((s, i) => (
              <article key={s.t.en} className="pcard edge reveal">
                <div className="pcard-art"><s.art /></div>
                <div className="pcard-copy">
                  <span className="pcard-num">0{i + 1}</span>
                  <h3 className="h3"><Tx v={s.t} /></h3>
                  <p className="pretty"><Tx v={s.d} /></p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <StackSection />

      {/* ===== story cards ===== */}
      <section className="sec" aria-labelledby="cast">
        <div className="wrap">
          <div className="sec-head reveal">
            <Badge><Tx v={C.storyBadge} /></Badge>
            <h2 className="h2" id="cast"><Tx v={C.castTitle} /></h2>
            <p className="sub lg"><Tx v={C.castSub} /></p>
          </div>
          <div className="tcards">
            {STORIES.map((s) => (
              <article key={s.p.id} className="tcard edge reveal">
                <div className="tcard-person">
                  <img src={avatar(s.p.id)} alt="" width={245} height={245} loading="lazy" />
                  <div>
                    <div className="tcard-name">{s.p.name}</div>
                    <div className="tcard-role">{s.p.role[lang]}</div>
                    <div className="tcard-role"><Tx v={C.fictional1} /></div>
                  </div>
                </div>
                <div className="tcard-side">
                  <blockquote className="tcard-quote" style={{ margin: 0 }}>{s.quote}</blockquote>
                  <div className="tcard-stats">
                    {s.stats.map((k) => (
                      <div key={k.l} className="kpi edge">
                        <span className="kpi-label">{k.l}</span>
                        <span className="kpi-value"><span className="mk">{k.v}</span></span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
          <ul className="cast-strip" style={{ listStyle: 'none', padding: 0 }}>
            {PERSONAS.map((p) => (
              <li key={p.id} className="cast-cell edge reveal">
                <img src={avatar(p.id)} alt="" width={56} height={56} loading="lazy" />
                <b>{p.name}</b>
                <span>{p.role[lang]}</span>
              </li>
            ))}
          </ul>
          <div className="cast-foot">
            <p><T k="avatarCredit" /></p>
            <ArrowBtn href={demo('#/demo?story=1')}><T k="ctaStory" /></ArrowBtn>
          </div>
        </div>
      </section>

      {/* ===== FAQ ===== */}
      <section className="sec" id="faq" aria-labelledby="faq-title">
        <div className="wrap">
          <div className="sec-head center reveal sec-tight">
            <Badge><Tx v={C.faqBadge} /></Badge>
            <h2 className="h2" id="faq-title"><Tx v={C.faqTitle} /></h2>
          </div>
          <div className="faq">
            {FAQ.map((f, i) => (
              <details key={f.q.en} className="edge reveal" open={i === 0}>
                <summary><Tx v={f.q} /><span className="q-ico" aria-hidden="true"><Glyph name="plus" /></span></summary>
                <p className="ans pretty"><Tx v={f.a} /></p>
              </details>
            ))}
            <div className="faq-cta reveal">
              <div><b><Tx v={C.faqMore} /></b><span><Tx v={C.faqMoreSub} /></span></div>
              <ArrowBtn href={demo('#/demo')}><T k="ctaTry" /></ArrowBtn>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
