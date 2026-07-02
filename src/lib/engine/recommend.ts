import type {
	AssessmentInput,
	FactorBreakdown,
	Major,
	MajorRecommendation,
	RankedUniversity,
} from "@/types"
import {
	FACTOR_WEIGHTS,
	LOW_CONFIDENCE_FACTOR,
	MAX_RECOMMENDATIONS,
	UNIVERSITY_SCORE_WEIGHTS,
} from "@/config/scoring"
import { MAJORS } from "@/data/majors"
import { FIELD_VALUES } from "@/data/valueMap"
import { PROGRAM_BY_ID, UNIVERSITY_BY_ID } from "@/data/universities"
import { MBTI_FIT_MATRIX } from "@/data/mbtiFitMatrix"

// =============================================================
// Engine gợi ý ngành (Phase 3, cập nhật logic gia đình).
// Minh bạch: điểm = 100 × Σ(trọng số × mức khớp từng yếu tố).
// Mọi mức khớp nằm trong [0,1]. Khi thiếu MBTI, bỏ yếu tố tính cách
// và chuẩn hóa lại trọng số các yếu tố còn lại.
// =============================================================

export const FACTOR_LABELS: Record<keyof FactorBreakdown, string> = {
	interestFit: "Sở thích",
	skillFit: "Kỹ năng",
	familyFit: "Nền tảng & định hướng gia đình",
	knowledgeAreaFit: "Vùng kiến thức muốn học",
	personalityFit: "Tính cách (MBTI)",
	roleModelFit: "Hình mẫu lý tưởng",
	careerFit: "Đích đến nghề nghiệp",
	valueFit: "Giá trị nghề nghiệp coi trọng",
	streamFit: "Khối / ban đang học",
}

const REASON_TEXT: Record<keyof FactorBreakdown, string> = {
	interestFit: "Đúng với những sở thích bạn đã chọn",
	skillFit: "Tận dụng được các kỹ năng bạn đang có",
	familyFit: "Khớp với nền tảng và định hướng của gia đình bạn",
	knowledgeAreaFit: "Trùng với vùng kiến thức bạn muốn học",
	personalityFit: "Nhóm tính cách của bạn thường hợp với ngành này",
	roleModelFit: "Gắn với hình mẫu nghề nghiệp bạn hướng tới",
	careerFit: "Khớp với đích đến nghề nghiệp bạn mong muốn",
	valueFit: "Đáp ứng những giá trị bạn coi trọng ở công việc",
	streamFit: "Hợp với khối/ban bạn đang theo học",
}

function overlapCount<T>(a: T[], b: T[]): number {
	const setB = new Set(b)
	let count = 0
	for (const item of a) if (setB.has(item)) count++
	return count
}

function safeRatio(matches: number, total: number): number {
	if (total <= 0) return 0
	return Math.min(1, matches / total)
}

// ----- Từng yếu tố (0..1) -----

function streamFit(input: AssessmentInput, major: Major): number {
	if (!input.stream || input.stream === "chua-ro") return 0.5
	if (major.relatedStreams.includes(input.stream)) return 1
	return 0.3
}

function skillFit(input: AssessmentInput, major: Major): number {
	if (major.requiredSkills.length === 0) return 0.5
	return safeRatio(
		overlapCount(input.skills, major.requiredSkills),
		major.requiredSkills.length,
	)
}

function interestFit(input: AssessmentInput, major: Major): number {
	if (major.relatedInterests.length === 0) return 0.5
	return safeRatio(
		overlapCount(input.interests, major.relatedInterests),
		major.relatedInterests.length,
	)
}

function careerFit(input: AssessmentInput, major: Major): number {
	if (input.careerDestinations.length === 0) return 0.5
	if (major.careerDestinations.length === 0) return 0.5
	return safeRatio(
		overlapCount(input.careerDestinations, major.careerDestinations),
		major.careerDestinations.length,
	)
}

function roleModelFit(input: AssessmentInput, major: Major): number {
	const chosen = input.roleModels.filter((r) => r !== "chua-ro")
	if (chosen.length === 0) return 0.5
	return safeRatio(
		overlapCount(chosen, major.relatedRoleModels),
		chosen.length,
	)
}

function knowledgeAreaFit(input: AssessmentInput, major: Major): number {
	if (input.knowledgeAreas.length === 0) return 0.5
	return safeRatio(
		overlapCount(input.knowledgeAreas, major.knowledgeAreas),
		input.knowledgeAreas.length,
	)
}

// Giá trị nghề nghiệp: mức khớp giữa giá trị người dùng coi trọng và
// những giá trị mà lĩnh vực của ngành thường mang lại (tham khảo).
function valueFit(input: AssessmentInput, major: Major): number {
	if (input.values.length === 0) return 0.5
	const fieldValues = FIELD_VALUES[major.fieldId] ?? []
	if (fieldValues.length === 0) return 0.5
	return safeRatio(
		overlapCount(input.values, fieldValues),
		input.values.length,
	)
}

function personalityFit(input: AssessmentInput, major: Major): number | null {
	if (input.mbtiSource === "none" || !input.mbtiType) return null
	const row = MBTI_FIT_MATRIX[major.fitKey]
	if (!row) return null
	const raw = (row[input.mbtiType] ?? 50) / 100
	const factor = major.personalityConfidence === "low" ? LOW_CONFIDENCE_FACTOR : 1
	return Math.min(1, raw * factor)
}

// Nền tảng & định hướng gia đình (KHÔNG xét tài chính/hoàn cảnh).
// Logic: gia đình có nền tảng ở lĩnh vực nào + người dùng có muốn đi theo không
// -> đánh giá độ phù hợp giữa ngành tương lai và nền tảng đó.
function familyFit(input: AssessmentInput, major: Major): number {
	const hasField = !!input.familyField && input.familyField !== "khong-co"
	// Không có nền tảng, hoặc không muốn đi theo -> trung tính, không thưởng/phạt.
	if (!hasField || !input.followFamily || input.followFamily === "khong") return 0.6
	const match = major.knowledgeAreas.includes(
		input.familyField as Major["knowledgeAreas"][number],
	)
	if (input.followFamily === "co") return match ? 1 : 0.3
	// "coi-mo": cởi mở cân nhắc -> thưởng nhẹ khi khớp, không phạt nặng khi lệch.
	return match ? 0.9 : 0.55
}

// ----- Xếp hạng trường (mạnh → yếu) -----

export function rankUniversities(major: Major): RankedUniversity[] {
	const ranked: RankedUniversity[] = []
	for (const programId of major.universityProgramIds) {
		const program = PROGRAM_BY_ID[programId]
		if (!program) continue
		const university = UNIVERSITY_BY_ID[program.universityId]
		if (!university) continue
		const s = program.scores
		const internalScore =
			s.programReputation * UNIVERSITY_SCORE_WEIGHTS.programReputation +
			s.trainingStrength * UNIVERSITY_SCORE_WEIGHTS.trainingStrength +
			s.relevance * UNIVERSITY_SCORE_WEIGHTS.relevance +
			s.recognitionBreadth * UNIVERSITY_SCORE_WEIGHTS.recognitionBreadth
		ranked.push({
			university,
			program,
			internalScore: Math.round(internalScore * 10) / 10,
		})
	}
	return ranked.sort((a, b) => b.internalScore - a.internalScore)
}

// ----- Tính điểm một ngành -----

function scoreMajor(input: AssessmentInput, major: Major): MajorRecommendation {
	const pFit = personalityFit(input, major)

	const rawFits: FactorBreakdown = {
		interestFit: interestFit(input, major),
		skillFit: skillFit(input, major),
		familyFit: familyFit(input, major),
		knowledgeAreaFit: knowledgeAreaFit(input, major),
		personalityFit: pFit ?? 0,
		roleModelFit: roleModelFit(input, major),
		careerFit: careerFit(input, major),
		valueFit: valueFit(input, major),
		streamFit: streamFit(input, major),
	}

	// Chuẩn hóa trọng số: bỏ personalityFit nếu không có MBTI.
	const activeKeys = (Object.keys(FACTOR_WEIGHTS) as (keyof FactorBreakdown)[]).filter(
		(k) => !(k === "personalityFit" && pFit === null),
	)
	const weightSum = activeKeys.reduce((sum, k) => sum + FACTOR_WEIGHTS[k], 0)

	const weightedContributions = {} as Record<keyof FactorBreakdown, number>
	for (const k of Object.keys(FACTOR_WEIGHTS) as (keyof FactorBreakdown)[]) {
		if (!activeKeys.includes(k)) {
			weightedContributions[k] = 0
			continue
		}
		const normWeight = FACTOR_WEIGHTS[k] / weightSum
		weightedContributions[k] = normWeight * rawFits[k]
	}

	const total = activeKeys.reduce((sum, k) => sum + weightedContributions[k], 0)
	const score = Math.round(total * 100)

	// Lý do: 3 yếu tố đóng góp nhiều nhất, chỉ lấy yếu tố có mức khớp khá.
	const reasons = activeKeys
		.filter((k) => rawFits[k] >= 0.5)
		.sort((a, b) => weightedContributions[b] - weightedContributions[a])
		.slice(0, 3)
		.map((k) => REASON_TEXT[k])

	return {
		major,
		score,
		breakdown: rawFits,
		weightedContributions,
		reasons,
		rankedUniversities: rankUniversities(major),
	}
}

// ----- API chính -----

export function recommendMajors(
	input: AssessmentInput,
	limit: number = MAX_RECOMMENDATIONS,
): MajorRecommendation[] {
	return MAJORS.map((major) => scoreMajor(input, major))
		.sort((a, b) => b.score - a.score)
		.slice(0, limit)
}

export function isInputReady(input: AssessmentInput): boolean {
	return (
		!!input.stream ||
		input.interests.length > 0 ||
		input.skills.length > 0 ||
		input.knowledgeAreas.length > 0
	)
}
