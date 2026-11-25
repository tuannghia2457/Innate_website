import { useEffect, useState, type FormEvent } from 'react'
import { ApiError, api, reasonText, type Flagged } from './api'
import { useT } from './i18n'

type L = { en: string; vi: string }
const KEY = 'innate.opsKey'
const load = () => { try { return sessionStorage.getItem(KEY) ?? '' } catch { return '' } }

// Fraud-ops dashboard: flagged sessions with reasons, labelled fraud / legitimate. Needs the ops key, which is
// never bundled; the analyst types it and it lives only in this tab (sessionStorage).
export default function Ops() {
  const { t, lang } = useT()
  const tx = (x: L) => x[lang]
  const [opsKey, setOpsKey] = useState(load)
  const [draft, setDraft] = useState('')
  const [rows, setRows] = useState<Flagged[] | null>(null)
  const [flaggedOnly, setFlaggedOnly] = useState(true)
  const [error, setError] = useState<L | null>(null)
  const [busy, setBusy] = useState(false)

  const refresh = async (key = opsKey) => {
    if (!key) return
    setBusy(true); setError(null)
    try { setRows(await api.flagged(key, flaggedOnly)) } catch (e) {
      const st = e instanceof ApiError ? e.status : -1
      if (st === 401 || st === 403) { setOpsKey(''); try { sessionStorage.removeItem(KEY) } catch { /* private mode */ } }
      setError(st === 401 || st === 403 ? { en: 'That key has no dashboard access.', vi: 'Key này không có quyền bảng vận hành.' }
        : st === 0 ? { en: 'Cannot reach the Innate API.', vi: 'Không kết nối được API Innate.' }
        : { en: `API error ${st}`, vi: `Lỗi API ${st}` })
    } finally { setBusy(false) }
  }
  useEffect(() => { refresh() }, [opsKey, flaggedOnly]) // eslint-disable-line react-hooks/exhaustive-deps

  const signIn = (e: FormEvent) => {
    e.preventDefault()
    const k = draft.trim()
    if (!k) return
    try { sessionStorage.setItem(KEY, k) } catch { /* private mode */ }
    setDraft(''); setOpsKey(k)
  }
  const label = async (id: string, l: 'fraud' | 'legit') => {
    try {
      await api.label(opsKey, id, l)
      setRows((r) => r?.map((x) => (x.session_id === id ? { ...x, label: l } : x)) ?? null)
    } catch { setError({ en: 'Could not save the label.', vi: 'Không lưu được nhãn.' }) }
  }
  const time = (iso: string) => new Date(iso).toLocaleString(lang === 'en' ? 'en-GB' : 'vi-VN', { dateStyle: 'short', timeStyle: 'short' })

  return (
    <div className="ws wrap" lang={lang}>
      <div className="ws-head">
        <div>
          <span className="chip sim"><span>{t('live')}</span></span>
          <h1>{tx({ en: 'Ops dashboard', vi: 'Bảng vận hành' })}</h1>
          <p className="muted">{tx({ en: 'Transfers Innate asked to verify or hold, with the reasons. Your label becomes training data.', vi: 'Các giao dịch Innate đề nghị xác thực thêm hoặc giữ lệnh, kèm lý do. Nhãn bạn gắn trở thành dữ liệu huấn luyện.' })}</p>
        </div>
        {opsKey && (
          <div className="row">
            <label className="row mini"><input type="checkbox" checked={flaggedOnly} onChange={(e) => setFlaggedOnly(e.target.checked)} />{tx({ en: 'Flagged only', vi: 'Chỉ phiên bị gắn cờ' })}</label>
            <button className="btn ghost small" onClick={() => refresh()} disabled={busy}>{tx({ en: 'Refresh', vi: 'Làm mới' })}</button>
            <button className="btn ghost small" onClick={() => { setOpsKey(''); setRows(null); try { sessionStorage.removeItem(KEY) } catch { /* private mode */ } }}>{tx({ en: 'Sign out', vi: 'Đăng xuất' })}</button>
          </div>
        )}
      </div>

      {error && <p className="callout strong" role="alert">{tx(error)}</p>}

      {!opsKey ? (
        <form className="box ops-login" onSubmit={signIn}>
          <h2>{tx({ en: 'Analyst sign-in', vi: 'Đăng nhập chuyên viên' })}</h2>
          <p className="muted">{tx({ en: 'Enter the ops key from the demo account sheet. It stays in this tab only.', vi: 'Nhập ops key trong phiếu tài khoản demo. Key chỉ được giữ trong tab này.' })}</p>
          <label className="field">{tx({ en: 'Ops key', vi: 'Ops key' })}
            <input type="password" autoComplete="off" value={draft} onChange={(e) => setDraft(e.target.value)} />
          </label>
          <button className="btn" type="submit" disabled={!draft.trim()}>{tx({ en: 'Open dashboard', vi: 'Mở bảng vận hành' })}</button>
        </form>
      ) : (
        <section className="box">
          {rows === null ? <p className="muted">{tx({ en: 'Loading…', vi: 'Đang tải…' })}</p>
            : rows.length === 0 ? <p className="muted">{tx({ en: 'Nothing flagged yet. Try the malware on the demo wallet.', vi: 'Chưa có giao dịch bị gắn cờ. Hãy cho mã độc thử trên ví demo.' })}</p>
            : (
              <div className="table-scroll">
                <table>
                  <thead><tr>
                    <th>{tx({ en: 'Time', vi: 'Thời điểm' })}</th><th>{tx({ en: 'Account', vi: 'Tài khoản' })}</th>
                    <th>{tx({ en: 'Decision', vi: 'Quyết định' })}</th><th className="n">{t('riskScore')}</th>
                    <th>{t('reasons')}</th><th>{tx({ en: 'Label', vi: 'Nhãn' })}</th>
                  </tr></thead>
                  <tbody>{rows.map((r) => (
                    <tr key={r.session_id}>
                      <td className="mono mini">{time(r.created_at)}</td>
                      <td className="mono mini">{r.user_id}</td>
                      <td>{r.action && <span className={`status ${r.action === 'allow' ? 'matched' : r.action === 'step_up' ? 'sent' : 'discrepancy'}`}>{t(`act_${r.action}`)}</span>}</td>
                      <td className="n">{r.risk_score == null ? '—' : `${Math.round(r.risk_score * 100)}%`}</td>
                      <td title={r.explanation_vi ?? ''}>{r.reasons.map((x) => reasonText(x, lang)).join(' · ')}</td>
                      <td>
                        <div className="row" role="group" aria-label={tx({ en: 'Label', vi: 'Nhãn' })}>
                          <button className={`btn small ${r.label === 'fraud' ? '' : 'ghost'}`} aria-pressed={r.label === 'fraud'} onClick={() => label(r.session_id, 'fraud')}>{tx({ en: 'Fraud', vi: 'Gian lận' })}</button>
                          <button className={`btn small ${r.label === 'legit' ? '' : 'ghost'}`} aria-pressed={r.label === 'legit'} onClick={() => label(r.session_id, 'legit')}>{tx({ en: 'Legit', vi: 'Hợp lệ' })}</button>
                        </div>
                      </td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            )}
        </section>
      )}
    </div>
  )
}
