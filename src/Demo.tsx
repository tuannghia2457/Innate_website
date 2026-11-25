import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { ApiError, api, reasonText, type Score, type SessionIn, type UserStatus } from './api'
import { store } from './App'
import BehindScenes from './BehindScenes'
import type { Recorder } from './capture'
import { useT } from './i18n'
import { isMuted, play, setMuted, unlock } from './sound'
import { STEPS, persona, type PersonaId } from './story'
import { StoryBar, StoryStart } from './StoryBar'
import { FRIEND, OWNER, botSession, humanSession, rng, type Layout } from './synth'
import { T, Tx } from './ui'
import Wallet, { DEMO_PIN, type Ghost, type PayCtx } from './Wallet'

type L = { en: string; vi: string }
interface Attempt { id: string; who: L; ctx: PayCtx; score: Score; at: Date }

// Used until the wallet has measured its keys; offsets are relative to the key, so scores do not depend on it.
const DEFAULT_LAYOUT: Layout = Object.fromEntries(
  ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0'].map((k, i) => [k, { cx: 70 + (i % 3) * 96, cy: 420 + Math.floor(i / 3) * 64, w: 88, h: 56 }]),
)
const STORY_SEED = 2 // checked against the live API: owner allow, Bảo step_up, bot hold
const sleep = (ms: number) => new Promise((r) => window.setTimeout(r, ms))
const newId = (p: string) => `${p}_${Math.random().toString(36).slice(2, 10)}`

const WHO: Record<'you' | 'owner' | 'friend' | 'bot', L> = {
  you: { en: 'You', vi: 'Bạn' },
  owner: { en: 'Hà (owner)', vi: 'Hà (chủ ví)' },
  friend: { en: 'Bảo (knows the PIN)', vi: 'Bảo (biết PIN)' },
  bot: { en: 'Malware', vi: 'Mã độc' },
}

export default function Demo({ story }: { story: boolean }) {
  const { t, lang, money, pct } = useT()
  const tx = (x: L) => x[lang]

  const [userId, setUserId] = useState(() => {
    if (story) return newId('story')
    const saved = store.get('innate.user')
    if (saved) return saved
    const id = newId('web'); store.set('innate.user', id); return id
  })
  const [status, setStatus] = useState<UserStatus>({ user_id: userId, enrolled_sessions: 0, template_ready: false })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<L | null>(null)
  const [outcome, setOutcome] = useState<Score | null>(null)
  const [attempts, setAttempts] = useState<Attempt[]>([])
  const [ghost, setGhost] = useState<Ghost | null>(null)
  const layout = useRef<Layout | null>(null)
  const onLayout = useCallback((l: Layout) => { layout.current = l }, [])
  const statusRef = useRef(status)
  statusRef.current = status

  useEffect(() => {
    api.user(userId).then(setStatus).catch((e) => { if (!(e instanceof ApiError && e.status === 404)) fail(e) })
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  function fail(e: unknown) {
    const st = e instanceof ApiError ? e.status : -1
    setError(st === 0 ? { en: 'Cannot reach the Innate API. Check your connection and try again.', vi: 'Không kết nối được API Innate. Kiểm tra mạng rồi thử lại.' }
      : st === 401 || st === 403 ? { en: 'This build has no valid SDK key (VITE_SDK_KEY).', vi: 'Bản build này chưa có SDK key hợp lệ (VITE_SDK_KEY).' }
      : { en: `API error ${st}: ${(e as Error).message}`, vi: `Lỗi API ${st}: ${(e as Error).message}` })
  }

  async function enrollWith(s: SessionIn) {
    const { session_id } = await api.createSession(s)
    try { setStatus(await api.enroll(s.user_id, session_id)) } catch (e) {
      if (!(e instanceof ApiError && e.status === 409)) throw e
      setStatus(await api.user(s.user_id)) // already enrolled and locked (e.g. a story step replayed)
    }
  }
  async function scoreWith(s: SessionIn, ctx: PayCtx, who: L) {
    const { session_id } = await api.createSession(s)
    const sc = await api.score(session_id, { recipient_is_new: ctx.recipient_is_new, amount: ctx.amount })
    setOutcome(sc)
    setAttempts((a) => [{ id: session_id, who, ctx, score: sc, at: new Date() }, ...a].slice(0, 12))
    play(sc.action === 'allow' ? 'focus' : 'duplicate')
    return sc
  }
  async function guarded(fn: () => Promise<unknown>) {
    setBusy(true); setError(null)
    try { await fn() } catch (e) { fail(e) } finally { setBusy(false) }
  }

  // your own taps on the wallet
  const onPin = (rec: Recorder, ctx: PayCtx) => guarded(async () => {
    const s = rec.payload(userId)
    if (statusRef.current.template_ready) await scoreWith(s, ctx, WHO.you)
    else await enrollWith(s)
  })

  // replay a synthetic session on the wallet keys, then send it
  const ghostId = useRef(0)
  async function replay(s: SessionIn, label: L, pay?: PayCtx & { id: string }) {
    setOutcome(null)
    setGhost({ id: ++ghostId.current, taps: s.pin_taps, label, pay: pay && { recipient: pay.id, amount: pay.amount } })
    const taps = s.pin_taps
    await sleep(taps[taps.length - 1].t_up - taps[0].t_down + 450)
  }
  const lay = () => layout.current ?? DEFAULT_LAYOUT

  const botAttack = () => guarded(async () => {
    const ctx = { id: 'new', recipient: tx({ en: 'New recipient', vi: 'Người nhận mới' }), recipient_is_new: true, amount: 20_000_000 }
    const s = botSession(userId, DEMO_PIN, lay())
    await replay(s, { en: 'Malware is tapping the PIN…', vi: 'Mã độc đang bấm PIN…' }, ctx)
    await scoreWith(s, ctx, WHO.bot)
    setGhost(null)
  })
  const friendTry = () => guarded(async () => {
    const ctx = { id: 'new', recipient: tx({ en: 'New recipient', vi: 'Người nhận mới' }), recipient_is_new: true, amount: 2_000_000 }
    const s = humanSession(userId, DEMO_PIN, lay(), FRIEND, rng(Date.now() % 100000))
    await replay(s, { en: 'Someone else types the PIN…', vi: 'Người khác đang gõ PIN…' }, ctx)
    await scoreWith(s, ctx, WHO.friend)
    setGhost(null)
  })
  const resetUser = () => {
    const id = newId('web'); store.set('innate.user', id)
    setUserId(id); setStatus({ user_id: id, enrolled_sessions: 0, template_ready: false }); setOutcome(null); setAttempts([]); setError(null)
  }

  // ===== story =====
  const [autostart] = useState(() => { try { return story && sessionStorage.getItem('innate.autostart') === '1' } catch { return false } })
  useEffect(() => { try { sessionStorage.removeItem('innate.autostart') } catch { /* private mode */ } }, [])
  const [started, setStarted] = useState(!story || autostart)
  const [playing, setPlaying] = useState(autostart)
  const [step, setStep] = useState(0)
  const [muted, setMutedState] = useState(isMuted())
  const [acting, setActing] = useState(false)
  const toggleMute = () => { setMuted(!muted); setMutedState(!muted) }
  const goto = useCallback((n: number) => setStep(Math.max(0, Math.min(STEPS.length - 1, n))), [])

  // seeded sessions, generated once in a fixed order so every run scores the same
  const seq = useMemo(() => {
    const g = rng(STORY_SEED)
    const l = DEFAULT_LAYOUT
    return {
      enroll: [0, 1, 2].map(() => humanSession(userId, DEMO_PIN, l, OWNER, g)),
      owner: humanSession(userId, DEMO_PIN, l, OWNER, g),
      friend: humanSession(userId, DEMO_PIN, l, FRIEND, g),
      bot: botSession(userId, DEMO_PIN, l),
    }
  }, [userId])

  async function ensureEnrolled(show: boolean) {
    for (let i = statusRef.current.enrolled_sessions; i < 3 && !statusRef.current.template_ready; i++) {
      if (show) await replay(seq.enroll[i], { en: `Hà enrolls · ${i + 1}/3`, vi: `Hà đăng ký · ${i + 1}/3` })
      await enrollWith(seq.enroll[i])
      statusRef.current = { ...statusRef.current, enrolled_sessions: i + 1 }
    }
  }

  useEffect(() => {
    if (!story || !started) return
    play(STEPS[step].cue)
    const act = STEPS[step].act
    let alive = true
    const run = async (fn: () => Promise<void>) => {
      setActing(true); setError(null)
      try { await fn() } catch (e) { if (alive) fail(e) } finally { if (alive) { setActing(false); setGhost(null) } }
    }
    const me = { id: 'me', recipient: tx({ en: 'Mum', vi: 'Mẹ' }), recipient_is_new: false, amount: 500_000 }
    const stranger = (amount: number) => ({ id: 'new', recipient: tx({ en: 'New recipient', vi: 'Người nhận mới' }), recipient_is_new: true, amount })
    if (act === 'enroll') run(() => ensureEnrolled(true))
    else if (act === 'owner') run(async () => { await ensureEnrolled(false); await sleep(900); await replay(seq.owner, WHO.owner, me); await scoreWith(seq.owner, me, WHO.owner) })
    else if (act === 'bot') run(async () => { await ensureEnrolled(false); await sleep(900); await replay(seq.bot, WHO.bot, stranger(20_000_000)); await scoreWith(seq.bot, stranger(20_000_000), WHO.bot) })
    else if (act === 'friend') run(async () => { await ensureEnrolled(false); await sleep(900); await replay(seq.friend, WHO.friend, stranger(2_000_000)); await scoreWith(seq.friend, stranger(2_000_000), WHO.friend) })
    return () => { alive = false }
  }, [step, started]) // eslint-disable-line react-hooks/exhaustive-deps

  const act = story && started ? STEPS[step].act : null
  const mode = status.template_ready ? 'pay' : 'enroll'

  return (
    <div className={`ws wrap demo ${story ? 'is-story' : ''}`} lang={lang}>
      <div className="ws-head">
        <div>
          <span className="chip sim"><T k="live" /></span>
          <h1>{story ? tx({ en: 'One PIN, three people', vi: 'Một PIN, ba người' }) : tx({ en: 'Try the demo wallet', vi: 'Tự thử ví demo' })}</h1>
          <p className="muted">{story
            ? tx({ en: 'Every score below comes from the live Innate API.', vi: 'Mọi điểm số dưới đây lấy từ API Innate thật.' })
            : tx({ en: `Enroll your rhythm with three PIN entries (${DEMO_PIN}), then make a transfer, hand the phone to a friend, or let the malware try.`, vi: `Đăng ký nhịp bằng ba lần nhập PIN (${DEMO_PIN}), rồi chuyển tiền, đưa máy cho người khác thử, hoặc để mã độc thử.` })}</p>
        </div>
        <div className="row">
          {story ? <a className="btn ghost small" href="#/demo">{tx({ en: 'Try it myself', vi: 'Tự thử' })}</a>
            : <a className="btn ghost small" href="#/demo?story=1">{tx({ en: 'Watch the story', vi: 'Xem tình huống' })}</a>}
        </div>
      </div>

      {!api.hasSdkKey() && <p className="callout strong" role="alert">{tx({ en: 'This build has no SDK key (VITE_SDK_KEY), so API calls will fail.', vi: 'Bản build này chưa có SDK key (VITE_SDK_KEY) nên các lệnh gọi API sẽ lỗi.' })}</p>}

      <div className="demo-grid">
        <div className="demo-phone">
          <Wallet mode={mode} enrollStep={Math.min(status.enrolled_sessions + 1, 3)} busy={busy || (acting && !ghost)} outcome={outcome} ghost={ghost}
            onLayout={onLayout} onPin={onPin} onDone={() => setOutcome(null)} />
        </div>

        <div className="demo-side">
          {error && <p className="callout strong" role="alert">{tx(error)}</p>}
          {act && <ActPanel act={act} attempts={attempts} sample={seq.owner} />}

          <section className="box" aria-live="polite">
            <div className="box-head">
              <h2>{tx({ en: 'Innate decision', vi: 'Quyết định của Innate' })}</h2>
              {outcome && <span className={`status ${outcome.action === 'allow' ? 'matched' : outcome.action === 'step_up' ? 'sent' : 'discrepancy'}`}>{t(`act_${outcome.action}`)}</span>}
            </div>
            {outcome ? (
              <>
                <div className="meters">
                  <Meter label={t('humanScore')} v={outcome.human_score} text={pct(outcome.human_score)} />
                  <Meter label={t('ownerMatch')} v={outcome.owner_match ?? 0} text={pct(outcome.owner_match)} />
                  <Meter label={t('riskScore')} v={outcome.risk_score} text={pct(outcome.risk_score)} danger />
                </div>
                {outcome.reasons.length > 0 && <ul className="pills reasons">{outcome.reasons.map((r) => <li key={r}>{reasonText(r, lang)}</li>)}</ul>}
                <p className="pretty">{outcome.explanation_vi}</p>
                <p className="muted mini mono">session {outcome.session_id}</p>
              </>
            ) : (
              <p className="muted">{status.template_ready
                ? tx({ en: 'Make a transfer to see how Innate scores it.', vi: 'Chuyển tiền để xem Innate chấm điểm thế nào.' })
                : tx({ en: `Enrollment ${status.enrolled_sessions}/3. Type the PIN on the wallet as you normally would.`, vi: `Đăng ký ${status.enrolled_sessions}/3. Gõ PIN trên ví như bình thường.` })}</p>
            )}
          </section>

          {!story && (
            <section className="box">
              <div className="box-head"><h2>{tx({ en: 'Attacker console', vi: 'Bảng điều khiển hacker' })}</h2><span className="chip sim"><T k="simulated" /></span></div>
              <p className="muted">{tx({ en: 'Synthetic sessions on the same keys, scored by the live API. Real attacks run from attacker/ (adb).', vi: 'Phiên tổng hợp trên chính các phím này, chấm bởi API thật. Tấn công thật chạy bằng attacker/ (adb).' })}</p>
              <div className="row" style={{ marginTop: 12 }}>
                <button className="btn small" onClick={botAttack} disabled={busy || !!ghost}>{tx({ en: 'Malware taps the PIN', vi: 'Mã độc bấm PIN' })}</button>
                <button className="btn ghost small" onClick={friendTry} disabled={busy || !!ghost || !status.template_ready}>{tx({ en: 'Someone who knows the PIN', vi: 'Người biết PIN thử' })}</button>
              </div>
            </section>
          )}

          <section className="box">
            <div className="box-head">
              <h2>{tx({ en: 'Account', vi: 'Tài khoản' })}</h2>
              {!story && <button className="btn ghost small" onClick={resetUser} disabled={busy}>{tx({ en: 'Start over', vi: 'Làm lại từ đầu' })}</button>}
            </div>
            <p className="muted mono mini">{userId}</p>
            <p className="muted">{status.template_ready
              ? tx({ en: 'Rhythm enrolled and locked.', vi: 'Đã đăng ký nhịp và khoá mẫu chuẩn.' })
              : tx({ en: `Enrolled ${status.enrolled_sessions}/3`, vi: `Đã đăng ký ${status.enrolled_sessions}/3` })}</p>
            {attempts.length > 0 && (
              <div className="table-scroll" style={{ marginTop: 12 }}>
                <table className="mini">
                  <thead><tr><th>{tx({ en: 'Who', vi: 'Ai' })}</th><th className="n">{tx({ en: 'Amount', vi: 'Số tiền' })}</th><th>{tx({ en: 'Decision', vi: 'Quyết định' })}</th></tr></thead>
                  <tbody>{attempts.map((a) => (
                    <tr key={a.id}><td>{tx(a.who)}</td><td className="n">{money(a.ctx.amount)}</td><td>{t(`act_${a.score.action}`)}</td></tr>
                  ))}</tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </div>

      {story && !started && (
        <StoryStart onStart={(withSound) => {
          unlock(); setMuted(!withSound); setMutedState(!withSound)
          setStarted(true); setStep(0); setPlaying(true)
        }} />
      )}
      {story && started && (
        <>
          <div className="story-pad" aria-hidden="true" />
          <BehindScenes step={step} />
          <StoryBar step={step} goto={goto} playing={playing} setPlaying={setPlaying} muted={muted} toggleMute={toggleMute}
            hold={acting} onExit={() => { window.location.hash = '#/demo' }} />
        </>
      )}
    </div>
  )
}

function Meter({ label, v, text, danger }: { label: string; v: number; text: string; danger?: boolean }) {
  return (
    <div className={`meter ${danger ? 'danger' : ''}`}>
      <span className="meter-label">{label}</span>
      <span className="meter-track"><i style={{ width: `${Math.max(0, Math.min(1, v)) * 100}%` }} /></span>
      <b className="meter-val">{text}</b>
    </div>
  )
}

/** Story panels for the steps that explain rather than score. */
function ActPanel({ act, attempts, sample }: { act: string; attempts: Attempt[]; sample: SessionIn }) {
  const { t, lang } = useT()
  const tx = (x: L) => x[lang]
  const who = (id: PersonaId) => persona(id).name
  if (act === 'sdk') {
    const tap = sample.pin_taps[0]
    return (
      <section className="box act-panel">
        <div className="box-head"><h2>{tx({ en: 'What the SDK sends', vi: 'SDK gửi gì' })}</h2><span className="chip sim">SessionIn</span></div>
        <pre className="code">{JSON.stringify({ key: tap.key, t_down: tap.t_down, t_up: tap.t_up, x: tap.x, y: tap.y, w: tap.w, key_cx: tap.key_cx, key_w: tap.key_w }, null, 1)}</pre>
        <p className="muted mini">{tx({ en: 'One tap of the PIN entry: press and release times, finger position and key centre. Plus swipes and screen idle times.', vi: 'Một cú chạm khi nhập PIN: thời điểm nhấn và nhả, vị trí ngón tay và tâm phím. Kèm các lần vuốt và thời gian dừng ở mỗi màn hình.' })}</p>
      </section>
    )
  }
  if (act === 'malware-setup') {
    return (
      <section className="box act-panel">
        <div className="box-head"><h2>{tx({ en: 'The fake app asks', vi: 'Ứng dụng giả xin quyền' })}</h2><span className="chip sim"><T k="simulated" /></span></div>
        <div className="perm">
          <b>{tx({ en: 'Allow “Public Services ID” to control your device?', vi: 'Cho phép “Dịch vụ công ID” điều khiển thiết bị?' })}</b>
          <ul>
            <li>{tx({ en: 'View and control screen', vi: 'Xem và điều khiển màn hình' })}</li>
            <li>{tx({ en: 'View and perform actions', vi: 'Xem và thực hiện thao tác' })}</li>
          </ul>
          <div className="row"><span className="btn ghost small" aria-hidden="true">{tx({ en: 'Deny', vi: 'Từ chối' })}</span><span className="btn small" aria-hidden="true">{tx({ en: 'Allow', vi: 'Cho phép' })}</span></div>
        </div>
        <p className="muted mini">{tx({ en: 'Banking malware such as RedHook and Gigabud uses this permission to tap on the victim’s behalf.', vi: 'Mã độc ngân hàng như RedHook, Gigabud dùng quyền này để bấm thay nạn nhân.' })}</p>
      </section>
    )
  }
  if (act === 'ops') {
    const flagged = attempts.filter((a) => a.score.action !== 'allow')
    return (
      <section className="box act-panel">
        <div className="box-head"><h2>{tx({ en: 'Ops dashboard', vi: 'Bảng vận hành' })}</h2><span className="chip">{who('khoa')}</span></div>
        <ul className="flag-list">
          {flagged.map((a) => (
            <li key={a.id}>
              <span className={`status ${a.score.action === 'step_up' ? 'sent' : 'discrepancy'}`}>{t(`act_${a.score.action}`)}</span>
              <span>{a.score.reasons.slice(0, 3).map((r) => reasonText(r, lang)).join(' · ')}</span>
              <span className="status discrepancy">{tx({ en: 'Fraud', vi: 'Gian lận' })}</span>
            </li>
          ))}
          {flagged.length === 0 && <li className="muted">{tx({ en: 'Play steps 5 and 6 first.', vi: 'Hãy xem bước 5 và 6 trước.' })}</li>}
        </ul>
        <a className="btn ghost small" href="#/ops">{tx({ en: 'Open the real dashboard', vi: 'Mở bảng vận hành thật' })}</a>
      </section>
    )
  }
  if (act === 'policy') {
    return (
      <section className="box act-panel">
        <div className="box-head"><h2>{tx({ en: 'Policy', vi: 'Chính sách' })}</h2><span className="chip">{who('lananh')}</span></div>
        <ul className="ctl-list compact">
          <li><span className="status matched">{t('act_allow')}</span> {tx({ en: 'owner, normal context', vi: 'chủ ví, bối cảnh bình thường' })}</li>
          <li><span className="status sent">{t('act_step_up')}</span> {tx({ en: 'a human who is not the owner, or doubtful context', vi: 'người thật nhưng không phải chủ, hoặc bối cảnh đáng ngờ' })}</li>
          <li><span className="status discrepancy">{t('act_hold')}</span> {tx({ en: 'machine input, or very high risk', vi: 'thao tác máy, hoặc rủi ro rất cao' })}</li>
        </ul>
        <p className="muted mini">{tx({ en: 'Innate never locks an account. Thresholds are configurable per wallet.', vi: 'Innate không bao giờ tự khoá tài khoản. Ngưỡng chỉnh được theo từng ví.' })}</p>
      </section>
    )
  }
  return null
}
