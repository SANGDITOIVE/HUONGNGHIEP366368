// =============================================================
// Module khảo sát dùng chung cho cả Client (SurveyNote, ProfileTab)
// và Server (API route). KHÔNG chứa React để import được ở mọi nơi.
// =============================================================

export interface SurveyQuestion {
	/** Khóa lưu trong answers + DB */
	id: string
	/** Nhãn ngắn hiển thị ở Tab cá nhân */
	label: string
	/** Câu hỏi đầy đủ hiển thị trong form */
	q: string
	options: string[]
}

// Bộ câu hỏi đại chúng — quét nhu cầu của học sinh THPT toàn quốc.
export const SURVEY_QUESTIONS: SurveyQuestion[] = [
	{
		id: "huong-di",
		label: "Định hướng sau THPT",
		q: "Bạn dự định hướng đi nào sau khi tốt nghiệp THPT?",
		options: [
			"Học Đại học trong nước",
			"Học Cao đẳng / Trường nghề",
			"Du học nước ngoài",
			"Đi làm ngay",
		],
	},
	{
		id: "khoi-nganh",
		label: "Khối ngành yêu thích",
		q: "Bạn cảm thấy mình phù hợp với lĩnh vực nào nhất?",
		options: [
			"Công nghệ / Kỹ thuật",
			"Kinh tế / Kinh doanh / Luật",
			"Sư phạm / Ngôn ngữ / Xã hội",
			"Y dược / Chăm sóc sức khỏe",
			"Khối lực lượng vũ trang",
		],
	},
	{
		id: "muc-diem",
		label: "Mức điểm mục tiêu (thang 30)",
		q: "Khoảng điểm thi thử / mục tiêu tổ hợp 3 môn của bạn?",
		options: ["Dưới 20 điểm", "20 - 24 điểm", "24 - 27 điểm", "Trên 27 điểm"],
	},
	{
		id: "tieu-chi",
		label: "Tiêu chí chọn trường",
		q: "Điều gì quan trọng nhất với bạn khi chọn trường?",
		options: [
			"Học phí rẻ / Cơ hội học bổng",
			"Chất lượng giảng dạy & Uy tín",
			"Cơ sở vật chất hiện đại",
			"Tỷ lệ việc làm sau tốt nghiệp",
		],
	},
]

// Thông tin liên hệ thu thập ở bước cuối khảo sát.
export interface SurveyContact {
	name: string
	place: string // Nơi ở
	birthYear: string // Năm sinh (giữ string để nhập liệu mượt, parse ở server)
	phone: string // Số điện thoại / Zalo
	email: string
}

export type SurveyAnswers = Record<string, string>

// Toàn bộ payload gửi lên server + lưu localStorage cho Tab cá nhân.
export interface SurveyPayload extends SurveyContact {
	answers: SurveyAnswers
	submittedAt: string
}

// Khóa localStorage để đồng bộ hồ sơ giữa SurveyNote và ProfileTab.
export const PROFILE_STORAGE_KEY = "huong-nghiep:profile:v1"
// Khóa cũ (giữ để tương thích bản trước, không còn dùng để ghi).
export const LEGACY_SURVEY_KEY = "huong-nghiep:survey:v1"

// Kiểm tra payload tối thiểu hợp lệ (dùng chung client + server).
export function isValidSurveyPayload(input: unknown): input is SurveyPayload {
	if (!input || typeof input !== "object") return false
	const p = input as Record<string, unknown>
	if (typeof p.name !== "string" || p.name.trim().length < 2) return false
	if (typeof p.email !== "string" && typeof p.phone !== "string") return false
	if (typeof p.answers !== "object" || p.answers === null) return false
	return true
}

// Lấy nhãn câu trả lời theo id câu hỏi (cho ProfileTab).
export function answerLabel(questionId: string): string {
	return SURVEY_QUESTIONS.find((q) => q.id === questionId)?.label ?? questionId
}
