import type { FactorBreakdown } from "@/types"

// =============================================================
// Trọng số chấm điểm ngành. CHỈNH TẠI ĐÂY, không đụng logic.
// Tổng phải = 1. Lưu ý: hoàn cảnh/tài chính gia đình KHÔNG còn là
// yếu tố chấm điểm. "familyFit" chỉ xét nền tảng lĩnh vực của gia đình
// và việc người dùng có muốn đi theo hay không.
// =============================================================
export const FACTOR_WEIGHTS: Record<keyof FactorBreakdown, number> = {
	interestFit: 0.15, // sở thích
	skillFit: 0.14, // kỹ năng
	familyFit: 0.13, // nền tảng & định hướng gia đình (không xét tài chính)
	knowledgeAreaFit: 0.12, // vùng kiến thức muốn học
	personalityFit: 0.12, // MBTI
	valueFit: 0.1, // giá trị nghề nghiệp coi trọng
	roleModelFit: 0.1, // hình mẫu lý tưởng
	careerFit: 0.08, // đích đến nghề nghiệp
	streamFit: 0.06, // khối / ban đang học
}

// Hệ số tin cậy khi fitKey chỉ gần đúng (personalityConfidence = "low").
export const LOW_CONFIDENCE_FACTOR = 0.85

// Trọng số 4 trục điểm trường (tổng = 1).
export const UNIVERSITY_SCORE_WEIGHTS = {
	programReputation: 0.3,
	trainingStrength: 0.3,
	relevance: 0.25,
	recognitionBreadth: 0.15,
}

// Số ngành tối đa / tối thiểu hiển thị ở trang kết quả.
export const MAX_RECOMMENDATIONS = 5
export const MIN_RECOMMENDATIONS = 3
