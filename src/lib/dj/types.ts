// =============================================================
// DISCOVERY JOURNEY — Mô hình dữ liệu (3 lớp).
// Bám sát đặc tả prompt "Discovery Journey" (Lớp 1: giả thuyết,
// Lớp 2: bằng chứng 2 trục, Lớp 3: quyết định có dữ liệu).
// Mọi điểm hiển thị nằm trong [0,100] trừ khi ghi chú khác.
// =============================================================

export type RiasecKey = "R" | "I" | "A" | "S" | "E" | "C"
export const RIASEC_KEYS: RiasecKey[] = ["R", "I", "A", "S", "E", "C"]

export type RiasecScores = Record<RiasecKey, number> // 0..100

export type AptitudeKey = "logic" | "verbal" | "spatial" | "numeric"
export const APTITUDE_KEYS: AptitudeKey[] = ["logic", "verbal", "spatial", "numeric"]
export type AptitudeScores = Record<AptitudeKey, number> // 0..100

// Các trục giá trị (slider trade-off) — mỗi giá trị 0..100 nghiêng về cực phải.
export type ValueKey =
	| "safety_vs_risk"
	| "income_vs_meaning"
	| "solo_vs_team"
	| "stable_vs_growth"
	| "practice_vs_theory"
	| "local_vs_global"
	| "structure_vs_freedom"
	| "people_vs_things"
export type ValueScores = Partial<Record<ValueKey, number>>

export interface ConstraintsInput {
	familyBudget: "han-che" | "vua-phai" | "day-du" | null
	budgetAnnual: number | null // ngân sách gia đình (triệu đồng/năm)
	parentExpectFields: string[] // cluster id phụ huynh kỳ vọng
	parentExpectOther: string // ngành khác ngoài danh sách (tự điền)
	parentExpectNotes: string // kỳ vọng cụ thể khác của cha mẹ
	specificMajorInterest: string // chuyên ngành/lĩnh vực cụ thể quan tâm (mọi nhóm ngành)
	scholarshipReadiness: "chua" | "quan-tam" | "co-chien-luoc" | null // mức sẵn sàng săn học bổng
	academicResults: string // GPA, IELTS/SAT/ACT...
	longTermGoal: string // mục tiêu nghề 5-10 năm
	geo: string | null // mã/tên tỉnh
	studyAbroad: boolean
}

// ---------- Lớp 1 ----------
export interface Layer1Input {
	riasecRaw: Record<string, number> // itemId -> 1..5
	aptitudeRaw: Record<string, string> // itemId -> đáp án đã chọn
	values: ValueScores
	constraints: ConstraintsInput
	grade: number | null
	region: string | null
}

export interface Hypothesis {
	clusterId: string
	confidence: number // 0..1, THẤP có chủ đích
	why: string
	confirmIf: string
	disconfirmIf: string
}

export interface Layer1Result {
	riasec: RiasecScores
	aptitude: AptitudeScores
	hollandCode: string
	consistencyFlag: boolean // true nếu trả lời thiếu nhất quán
	hypotheses: Hypothesis[]
	disclaimer: string
	source: "ai" | "rule"
}

// ---------- Lớp 2 ----------
export type DeliverableFormat = "essay" | "choice" | "steps" | "design_brief"

export interface RubricItem {
	criterion: string
	weight: number
	what_good_looks_like: string
}

export interface TaskSpec {
	task_id: string
	cluster_id: string
	difficulty: number // 1..3
	title: string
	scenario: string
	instructions: string
	time_limit_min: number
	deliverable_format: DeliverableFormat
	rubric: RubricItem[]
	reflection_questions: string[]
	red_flag_signals: string[]
	dark_side_note: string
}

export interface AttemptInput {
	taskId: string
	clusterId: string
	submission: string
	timeSpentSec: number
	selfFeeling: number // 1..5
	wantMore: number // 1..5
	mode: "auto" | "self_assist"
}

export interface CompetenceBreak {
	criterion: string
	score: number | null // null = đề không yêu cầu tiêu chí này -> không tính điểm
	required_by?: string // trích từ instructions chứng minh đề có yêu cầu tiêu chí
	evidence_quote: string
}

export interface GradeResult {
	competenceScore: number // 0..100
	competenceBreakdown: CompetenceBreak[]
	interestSignal: number // 0..100
	redFlags: string[]
	confidenceDelta: number // -1..+1
	feedback: string
	recommendedNext: "probe_deeper" | "try_adjacent" | "deprioritize"
	source: "ai" | "rule"
	// chỉ với self_assist
	reflectionPrompts?: string[]
	aiObservation?: string
	gapFlag?: boolean
	gapExplanation?: string
}

export interface ClusterConfidence {
	clusterId: string
	competenceAxis: number // 0..100
	interestAxis: number // 0..100
	evidenceCount: number
	divergence: number
}

// ---------- Lớp 3 ----------
export interface OutcomeSchool {
	name: string
	employRate: number // %
	salaryStart: number // triệu/tháng
	salary5yMedian: number
	tuitionYear: number // triệu/năm
	roiNote: string
	source: string
}

export interface Layer3ClusterView {
	clusterId: string
	clusterName: string
	schools: OutcomeSchool[]
	altPaths: string
	salarySpread: { min: number; p50: number; max: number }
}

export interface Layer3Result {
	byCluster: Layer3ClusterView[]
	framing: string
	dataGaps: string[]
	source: "ai" | "rule"
}
