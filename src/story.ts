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
