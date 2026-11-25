// Fictional cast and the eight-step story. Every name and company here is invented for the demo.
// Steps 2, 3, 5 and 6 call the live Innate API with seeded synthetic sessions (synth.ts), so the scores are real.
type L = { en: string; vi: string }

export type PersonaId = 'vy' | 'ha' | 'bao' | 'khoa' | 'lananh' | 'an'

export interface Persona { id: PersonaId; name: string; initials: string; tone: 'navy' | 'blue' | 'ice'; role: L; org: L; does: L }

const WALLET: L = { en: 'Demo Wallet (fictional)', vi: 'Ví Demo (giả tưởng)' }

export const PERSONAS: Persona[] = [
  {
    id: 'ha', name: 'Trần Thu Hà', initials: 'TH', tone: 'navy',
    role: { en: 'Wallet owner', vi: 'Chủ ví' }, org: { en: 'Office worker, HCMC', vi: 'Nhân viên văn phòng, TP.HCM' },
    does: { en: 'Pays rent and sends money home with her e-wallet. Types her PIN the same way every day without thinking.', vi: 'Trả tiền nhà, gửi tiền về cho mẹ bằng ví điện tử. Ngày nào cũng gõ PIN theo một nhịp mà không để ý.' },
  },
  {
    id: 'bao', name: 'Phạm Quốc Bảo', initials: 'QB', tone: 'blue',
    role: { en: 'Colleague who saw her PIN', vi: 'Đồng nghiệp từng nhìn lén PIN' }, org: { en: 'Same office', vi: 'Cùng văn phòng' },
    does: { en: 'Watched Hà type 1593 at lunch. Picks up her phone while she is away from her desk.', vi: 'Nhìn thấy Hà gõ 1593 lúc ăn trưa. Cầm điện thoại của Hà khi Hà rời bàn.' },
  },
  {
    id: 'an', name: 'Đỗ Gia An', initials: 'GA', tone: 'ice',
    role: { en: 'Scammer running the malware', vi: 'Kẻ gian điều khiển mã độc' }, org: { en: 'Fake “police officer” on the phone', vi: '“Cán bộ công an” giả qua điện thoại' },
    does: { en: 'Talks Hà into installing a fake app that asks for Accessibility, then taps her PIN remotely at 2 a.m.', vi: 'Dụ Hà cài ứng dụng giả xin quyền Trợ năng, rồi bấm PIN của Hà từ xa lúc 2 giờ sáng.' },
  },
  {
    id: 'vy', name: 'Hoàng Bảo Vy', initials: 'BV', tone: 'ice',
    role: { en: 'Mobile engineer', vi: 'Kỹ sư mobile' }, org: WALLET,
    does: { en: 'Adds the Innate SDK to the wallet’s PIN pad and calls the score API at the confirm step.', vi: 'Gắn SDK Innate vào bàn phím PIN của ví và gọi API chấm điểm ở bước xác nhận.' },
  },
  {
    id: 'khoa', name: 'Lê Minh Khoa', initials: 'MK', tone: 'blue',
    role: { en: 'Fraud operations analyst', vi: 'Chuyên viên vận hành chống gian lận' }, org: WALLET,
    does: { en: 'Reviews flagged transfers with their reasons and marks each one fraud or legitimate.', vi: 'Xem các giao dịch bị gắn cờ kèm lý do, đánh dấu gian lận hay hợp lệ.' },
  },
  {
    id: 'lananh', name: 'Nguyễn Lan Anh', initials: 'LA', tone: 'navy',
    role: { en: 'Head of risk', vi: 'Trưởng bộ phận rủi ro' }, org: WALLET,
    does: { en: 'Sets the thresholds: ask for a face check before blocking, and never lock an account automatically.', vi: 'Đặt ngưỡng: xác thực thêm trước khi chặn, không bao giờ tự khoá tài khoản.' },
  },
]

export const persona = (id: PersonaId) => PERSONAS.find((p) => p.id === id)!

export type Cue = 'rates' | 'channels' | 'scan' | 'extract' | 'reconcile' | 'focus' | 'duplicate' | 'send' | 'done'
/** what the workspace does on this step */
export type Act = 'sdk' | 'enroll' | 'owner' | 'malware-setup' | 'bot' | 'friend' | 'ops' | 'policy'

/** who speaks; also lists the cast members the step mentions, so they light up too */
export interface StoryStep { who: PersonaId; also: PersonaId[]; title: L; body: L; cue: Cue; act: Act; seconds: number }

export const STEPS: StoryStep[] = [
  {
    who: 'vy', also: [], cue: 'channels', act: 'sdk', seconds: 12,
    title: { en: 'Vy adds Innate to the PIN pad', vi: 'Vy gắn Innate vào bàn phím PIN' },
    body: {
      en: 'The SDK records when each key goes down and up, where the finger lands on the key, touch size and swipes. It sends the session to the score API at the confirm step; the wallet keeps its own PIN check.',
      vi: 'SDK ghi lúc mỗi phím được nhấn và nhả, ngón tay chạm lệch đâu trên phím, kích thước vùng chạm và các lần vuốt. Ở bước xác nhận, SDK gửi phiên lên API chấm điểm; ví vẫn tự kiểm tra PIN như cũ.',
    },
  },
  {
    who: 'ha', also: [], cue: 'extract', act: 'enroll', seconds: 13,
    title: { en: 'Hà enrolls her rhythm in three entries', vi: 'Hà đăng ký nhịp bằng ba lần nhập' },
    body: {
      en: 'Hà types her PIN three times. Innate learns her hold times, the gaps between keys and that she taps a little right of centre. After the third entry enrollment locks, so nobody can add their own rhythm later.',
      vi: 'Hà gõ PIN ba lần. Innate học thời gian giữ phím, khoảng nghỉ giữa các phím và thói quen chạm hơi lệch phải. Sau lần thứ ba, việc đăng ký khoá lại để không ai chèn nhịp của mình vào sau.',
    },
  },
  {
    who: 'ha', also: [], cue: 'reconcile', act: 'owner', seconds: 10,
    title: { en: 'Hà sends 500,000 to her mum', vi: 'Hà chuyển 500.000 cho mẹ' },
    body: {
      en: 'A known recipient, a usual amount and her own rhythm: Innate scores it as the owner and lets it through without any extra step.',
      vi: 'Người nhận quen, số tiền bình thường và đúng nhịp của Hà: Innate xác nhận là chủ ví và cho qua, không thêm bước nào.',
    },
  },
  {
    who: 'an', also: ['ha'], cue: 'scan', act: 'malware-setup', seconds: 11,
    title: { en: 'A fake officer calls Hà', vi: 'Một “cán bộ” giả gọi cho Hà' },
    body: {
      en: 'An says Hà’s ID must be updated and sends a link to a fake government app. It asks for Accessibility permission, which lets it read the screen and tap anywhere. PIN and OTP no longer protect her.',
      vi: 'An nói căn cước của Hà cần cập nhật và gửi link ứng dụng dịch vụ công giả. Ứng dụng xin quyền Trợ năng, quyền cho phép đọc màn hình và bấm ở bất kỳ đâu. Từ đây PIN và OTP không còn bảo vệ được Hà.',
    },
  },
  {
    who: 'an', also: ['ha'], cue: 'duplicate', act: 'bot', seconds: 11,
    title: { en: '2 a.m.: the malware types the PIN', vi: '2 giờ sáng: mã độc tự gõ PIN' },
    body: {
      en: 'The malware opens the wallet and taps 1593 to send 20,000,000 to a new account. The PIN is right, but every tap lands on the exact centre of the key at a machine-steady rhythm. Innate holds the transfer.',
      vi: 'Mã độc mở ví và bấm 1593 để chuyển 20.000.000 cho tài khoản lạ. PIN đúng, nhưng mọi cú chạm rơi đúng tâm phím với nhịp đều như máy. Innate giữ lệnh lại.',
    },
  },
  {
    who: 'bao', also: ['ha'], cue: 'focus', act: 'friend', seconds: 11,
    title: { en: 'Bảo tries with the PIN he saw', vi: 'Bảo thử bằng mã PIN đã nhìn thấy' },
    body: {
      en: 'Bảo is human, so the bot check passes. But his rhythm is not Hà’s: slower keys, taps left and low. Innate asks for a face check instead of sending 2,000,000 to his account.',
      vi: 'Bảo là người thật nên vượt qua kiểm tra người hay máy. Nhưng nhịp của Bảo không phải của Hà: bấm chậm hơn, chạm lệch trái và xuống dưới. Innate yêu cầu xác thực khuôn mặt thay vì chuyển 2.000.000 vào tài khoản của Bảo.',
    },
  },
  {
    who: 'khoa', also: ['ha'], cue: 'send', act: 'ops', seconds: 11,
    title: { en: 'Khoa reviews the two flagged transfers', vi: 'Khoa xem hai giao dịch bị gắn cờ' },
    body: {
      en: 'Each flagged session reaches the ops dashboard with plain-language reasons. Khoa marks both as fraud; the labels become training data for the next model.',
      vi: 'Mỗi phiên bị gắn cờ hiện trên bảng vận hành kèm lý do dễ hiểu. Khoa đánh dấu cả hai là gian lận; nhãn trở thành dữ liệu huấn luyện cho mô hình sau.',
    },
  },
  {
    who: 'lananh', also: ['ha'], cue: 'done', act: 'policy', seconds: 12,
    title: { en: 'Lan Anh: ask before blocking', vi: 'Lan Anh: hỏi trước khi chặn' },
    body: {
      en: 'Innate only recommends. A doubtful transfer gets a face check, a machine gets held, and Hà’s account is never locked by an algorithm. Thresholds stay with the risk team.',
      vi: 'Innate chỉ đề xuất. Giao dịch đáng ngờ thì xác thực thêm, máy thì giữ lệnh, và tài khoản của Hà không bao giờ bị thuật toán khoá. Ngưỡng do bộ phận rủi ro quyết định.',
    },
  },
]
