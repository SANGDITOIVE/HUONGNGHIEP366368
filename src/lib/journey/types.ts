// =============================================================
// HÀNH TRÌNH KHÁM PHÁ BẢN THÂN — mô hình dữ liệu (Phương án C).
// Tách hoàn toàn nội dung khỏi logic. Mọi điểm số nằm trong [0,1]
// trừ khi ghi chú khác.
// =============================================================

// 6 trục năng khiếu (Function 1).
export type AxisId =
	| "ky-thuat"
	| "con-nguoi"
	| "du-lieu"
	| "sang-tao"
	| "tu-nhien"
	| "to-chuc"

export const AXIS_IDS: AxisId[] = [
	"ky-thuat",
	"con-nguoi",
	"du-lieu",
	"sang-tao",
	"tu-nhien",
	"to-chuc",
]

export const AXIS_LABELS: Record<AxisId, string> = {
	"ky-thuat": "Kỹ thuật",
	"con-nguoi": "Con người",
	"du-lieu": "Dữ liệu",
	"sang-tao": "Sáng tạo",
	"tu-nhien": "Tự nhiên",
	"to-chuc": "Tổ chức",
}

export const AXIS_EMOJI: Record<AxisId, string> = {
	"ky-thuat": "🔧",
	"con-nguoi": "🤝",
	"du-lieu": "📊",
	"sang-tao": "🎨",
	"tu-nhien": "🌱",
	"to-chuc": "🗂️",
}

export type AxisVector = Record<AxisId, number>

// 4 chiều tính cách (Function 2A) — kiểu MBTI rút gọn.
export type PersonalityDim = "orientation" | "info" | "decision" | "work"

export type Pole =
	| "E" | "I"
	| "S" | "N"
	| "T" | "F"
	| "J" | "P"

// Thiên hướng vai trò (Function 1 — Task 5 + một phần 2A).
export type RoleTendency = "lanh-dao" | "chuyen-gia" | "sang-tao" | "giao-tiep"

export const ROLE_LABELS: Record<RoleTendency, string> = {
	"lanh-dao": "Điều phối / Lãnh đạo",
	"chuyen-gia": "Chuyên gia / Đi sâu",
	"sang-tao": "Sáng tạo / Thiết kế",
	"giao-tiep": "Giao tiếp / Kết nối",
}

// Giá trị sống (Function 2B).
export type ValueId =
	| "thu-nhap"
	| "sang-tao"
	| "giup-ich"
	| "cong-nhan"
	| "tu-do"
	| "phat-trien"

// Bối cảnh Việt Nam (Function 2C).
export type FamilyExpectation =
	| "dong-y"
	| "chua-chac"
	| "huong-khac"
	| "tu-quyet"

export type EconomicCondition = "can-som" | "co-nhung-khong-quyet" | "day-du"

export type StreamPick =
	| "khoi-a" | "khoi-a1" | "khoi-b" | "khoi-c" | "khoi-d" | "chua-chon"

// ---------- Trạng thái trả lời toàn hành trình ----------
export interface JourneyState {
	// Function 1
	patternAnswers: Record<string, number> // questionId -> index đã chọn
	wordAnswers: Record<string, string[]> // questionId -> wordId[] (chọn 2)
	classifyAnswers: Record<string, "tot" | "chua-chac"> // cardId -> đánh giá
	envAnswers: Record<string, "hung" | "binh-thuong" | "khong"> // envId -> phản xạ
	roleAnswers: Record<string, number> // questionId -> index
	// Function 2A
	situationAnswers: Record<string, number> // questionId -> index
	// Function 2B
	valueRanking: ValueId[] // xếp theo thứ tự ưu tiên (cao -> thấp)
	// Function 2C
	grade: number | null // 6..12
	stream: StreamPick | null
	familyExpectation: FamilyExpectation | null
	economic: EconomicCondition | null
}

export const EMPTY_JOURNEY: JourneyState = {
	patternAnswers: {},
	wordAnswers: {},
	classifyAnswers: {},
	envAnswers: {},
	roleAnswers: {},
	situationAnswers: {},
	valueRanking: [],
	grade: null,
	stream: null,
	familyExpectation: null,
	economic: null,
}

// ---------- Kết quả tổng hợp (Function 3 + 4) ----------
export interface PersonalityProfile {
	orientation: Pole // E | I
	info: Pole // S | N
	decision: Pole // T | F
	work: Pole // J | P
	scores: Record<PersonalityDim, { left: number; right: number }>
	dominantRole: RoleTendency
	roleScores: Record<RoleTendency, number>
}

export interface CareerMatch {
	groupId: string
	name: string
	fit: number // 0..100
	jobs: string[]
	outlook: "cao" | "on-dinh" | "can-chu-y"
	aiRisk: "thap" | "trung-binh" | "cao"
	income: "thap" | "trung-binh" | "cao"
	incomeRange: string
	universities: string[]
	streams: string
	subjectsFocus: string[]
	reasons: string[]
}

export interface SoftWarning {
	title: string
	body: string
}

export interface JourneyResult {
	completed: boolean
	aptitude: AxisVector // 0..100 mỗi trục
	topAxes: AxisId[]
	personality: PersonalityProfile
	portrait: string
	matches: CareerMatch[]
	warnings: SoftWarning[]
	nextSteps: string[]
	gradeBand: "thcs" | "thpt" | "chua-ro"
	shareText: string
}
