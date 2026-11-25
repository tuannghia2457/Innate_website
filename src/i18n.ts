import { createContext, useContext } from 'react'

export type Lang = 'en' | 'vi'

export const dict = {
  navHow: { en: 'How it works', vi: 'Cách hoạt động' },
  navDemo: { en: 'Open demo', vi: 'Mở demo' },
  navOps: { en: 'Ops dashboard', vi: 'Bảng vận hành' },
  slogan: { en: 'Passwords can be stolen. Habits can’t.', vi: 'Mã PIN có thể bị lộ. Thói quen thì không.' },
  heroTitle: { en: 'The right PIN isn’t always you. Innate knows.', vi: 'PIN đúng chưa chắc là bạn. Innate biết.' },
  introDemo: { en: 'Watch the 2-minute demo', vi: 'Xem demo 2 phút' },
  poweredBy: { en: 'Powered by', vi: 'Phát triển bởi' },
  ctaStory: { en: 'Play the story', vi: 'Xem tình huống' },
  ctaTry: { en: 'Try it on the demo wallet', vi: 'Tự thử trên ví demo' },
  simulated: { en: 'Simulated', vi: 'Giả lập' },
  live: { en: 'Live API', vi: 'API thật' },
  fictional: { en: 'Fictional cast', vi: 'Nhân vật giả tưởng' },
  avatarCredit: { en: 'People and companies are fictional. Illustrations: Notionists by Zoish (CC0).', vi: 'Nhân vật và công ty là giả tưởng. Minh họa: Notionists của Zoish (CC0).' },

  act_allow: { en: 'Allow', vi: 'Cho qua' },
  act_step_up: { en: 'Step-up check', vi: 'Xác thực thêm' },
  act_hold: { en: 'Hold', vi: 'Giữ lệnh' },
  humanScore: { en: 'Human', vi: 'Người thật' },
  ownerMatch: { en: 'Owner match', vi: 'Khớp chủ' },
  riskScore: { en: 'Risk', vi: 'Rủi ro' },
  reasons: { en: 'Reasons', vi: 'Lý do' },

  chooseTitle: { en: 'How would you like to see Innate?', vi: 'Bạn muốn xem Innate theo cách nào?' },
  choiceAuto: { en: 'Watch it play by itself', vi: 'Xem demo tự chạy' },
  choiceAutoSub: { en: 'About 2 minutes, with sound · calls the live API', vi: 'Khoảng 2 phút, có âm thanh · gọi API thật' },
  choiceTry: { en: 'Try the demo wallet yourself', vi: 'Tự thử ví demo' },
  choiceTrySub: { en: 'Enroll your rhythm, then hand the phone to a friend', vi: 'Đăng ký nhịp của bạn, rồi đưa máy cho người khác thử' },

  storyLabel: { en: 'Story player', vi: 'Trình phát tình huống' },
  exit: { en: 'Exit story', vi: 'Thoát tình huống' },
  soundOn: { en: 'Sound on', vi: 'Bật âm thanh' },
  soundOff: { en: 'Sound off', vi: 'Tắt âm thanh' },
  back: { en: 'Back', vi: 'Lùi' },
  next: { en: 'Next', vi: 'Tiếp' },
  play: { en: 'Play', vi: 'Phát' },
  pause: { en: 'Pause', vi: 'Tạm dừng' },
  replay: { en: 'Replay', vi: 'Xem lại' },
  startTitle: { en: 'One wallet, three people, one PIN', vi: 'Một ví, ba người, một mã PIN' },
  startSub: { en: 'The owner, a colleague who saw her PIN, and remote-control malware all type the same PIN. Every score in the story comes from the live Innate API.', vi: 'Chủ ví, đồng nghiệp từng nhìn lén PIN và mã độc điều khiển từ xa cùng nhập một mã PIN. Mọi điểm số trong tình huống đều lấy từ API Innate thật.' },
  playSound: { en: 'Play with sound', vi: 'Phát có âm thanh' },
  playMuted: { en: 'Play muted', vi: 'Phát không tiếng' },
  exploreSelf: { en: 'Try it myself', vi: 'Tự thử' },
} as const

export type Key = keyof typeof dict

export const LangContext = createContext<{ lang: Lang; setLang: (l: Lang) => void }>({ lang: 'vi', setLang: () => {} })

export function useT() {
  const { lang } = useContext(LangContext)
  const t = (k: Key) => dict[k][lang]
  const money = (n: number) => (lang === 'en' ? `${n.toLocaleString('en-US')} ₫` : `${n.toLocaleString('vi-VN')} đ`)
  const plain = (n: number) => n.toLocaleString(lang === 'en' ? 'en-US' : 'vi-VN')
  const pct = (x: number | null | undefined) => (x == null ? '—' : `${Math.round(x * 100)}%`)
  return { t, money, plain, pct, lang }
}
