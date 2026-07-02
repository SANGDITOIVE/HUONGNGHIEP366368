// =============================================================
// ENGINE — FUNCTION 3 (tổng hợp) + dữ liệu cho FUNCTION 4 (kết quả).
// 3 bước: (3.1) kiểm nhất quán → (3.2) lọc bối cảnh → (3.3) ánh xạ thị trường.
// =============================================================
import {
	AXIS_IDS,
	AXIS_LABELS,
	type AxisId,
	type AxisVector,
	type CareerMatch,
	type JourneyResult,
	type JourneyState,
	type PersonalityDim,
	type PersonalityProfile,
	type Pole,
	type RoleTendency,
	type SoftWarning,
} from "@/lib/journey/types"
import {
	CLASSIFY_CARDS,
	ENV_CARDS,
	PATTERN_QUESTIONS,
	PATTERN_TASK_AXES,
	ROLE_QUESTIONS,
	WORD_QUESTIONS,
} from "@/data/journey/aptitudeTasks"
import { SITUATION_QUESTIONS, VALUE_ITEMS } from "@/data/journey/situationQuestions"
import { CAREER_GROUPS } from "@/data/journey/careerMarket"
import { AXIS_TO_PORTRAIT, PORTRAITS } from "@/data/journey/portraitTemplates"

function emptyVector(): AxisVector {
	return {
		"ky-thuat": 0,
		"con-nguoi": 0,
		"du-lieu": 0,
		"sang-tao": 0,
		"tu-nhien": 0,
		"to-chuc": 0,
	}
}

function clamp(n: number, min: number, max: number): number {
	return Math.max(min, Math.min(max, n))
}

// ---------- FUNCTION 1: tính vector năng khiếu ----------
export function scoreAptitude(state: JourneyState): AxisVector {
	const raw = emptyVector()

	// Task 1 — quy luật đúng -> du-lieu + ky-thuat
	for (const q of PATTERN_QUESTIONS) {
		const ans = state.patternAnswers[q.id]
		if (typeof ans === "number" && ans === q.correctIndex) {
			for (const axis of PATTERN_TASK_AXES) raw[axis] += 0.75
		}
	}

	// Task 2 — liên kết ý nghĩa
	for (const q of WORD_QUESTIONS) {
		const picks = state.wordAnswers[q.id] ?? []
		for (const opt of q.options) {
			if (picks.includes(opt.id)) raw[opt.axis] += 1
		}
	}

	// Task 3 — phân loại (làm tốt = +1.5)
	for (const card of CLASSIFY_CARDS) {
		if (state.classifyAnswers[card.id] === "tot") raw[card.axis] += 1.5
	}

	// Task 4 — phản xạ môi trường
	for (const env of ENV_CARDS) {
		const r = state.envAnswers[env.id]
		if (r === "hung") raw[env.axis] += 2
		else if (r === "binh-thuong") raw[env.axis] += 0.5
	}

	// Task 5 — vai trò
	for (const q of ROLE_QUESTIONS) {
		const idx = state.roleAnswers[q.id]
		if (typeof idx === "number" && q.options[idx]) {
			raw[q.options[idx].axis] += 2
		}
	}

	// Function 2A — một số lựa chọn nhấn nhẹ vào trục
	for (const q of SITUATION_QUESTIONS) {
		const idx = state.situationAnswers[q.id]
		if (typeof idx === "number" && q.options[idx]) {
			const axis = q.options[idx].axis
			if (axis) raw[axis] += 0.5
		}
	}

	// Function 2B — giá trị xếp hạng nhấn nhẹ vào trục thiên hướng
	const valueBonus = [1.5, 1, 0.5]
	state.valueRanking.slice(0, 3).forEach((vid, i) => {
		const item = VALUE_ITEMS.find((v) => v.id === vid)
		if (item) raw[item.axis] += valueBonus[i] ?? 0
	})

	// Chuẩn hóa 0..100 theo trục cao nhất
	const max = Math.max(...AXIS_IDS.map((a) => raw[a]))
	const out = emptyVector()
	if (max > 0) {
		for (const a of AXIS_IDS) out[a] = Math.round((raw[a] / max) * 100)
	}
	return out
}

// ---------- FUNCTION 2A/2/5: tính cách + vai trò ----------
const LEFT_POLE: Record<PersonalityDim, Pole> = {
	orientation: "E",
	info: "S",
	decision: "T",
	work: "J",
}
const RIGHT_POLE: Record<PersonalityDim, Pole> = {
	orientation: "I",
	info: "N",
	decision: "F",
	work: "P",
}

const ROLE_AXIS: Record<RoleTendency, AxisId> = {
	"lanh-dao": "to-chuc",
	"chuyen-gia": "du-lieu",
	"sang-tao": "sang-tao",
	"giao-tiep": "con-nguoi",
}

export function scoreSituation(state: JourneyState): PersonalityProfile {
	const scores: Record<PersonalityDim, { left: number; right: number }> = {
		orientation: { left: 0, right: 0 },
		info: { left: 0, right: 0 },
		decision: { left: 0, right: 0 },
		work: { left: 0, right: 0 },
	}

	for (const q of SITUATION_QUESTIONS) {
		const idx = state.situationAnswers[q.id]
		if (typeof idx !== "number") continue
		const opt = q.options[idx]
		if (!opt) continue
		if (opt.pole === LEFT_POLE[opt.dim]) scores[opt.dim].left += opt.weight
		else scores[opt.dim].right += opt.weight
	}

	const pick = (dim: PersonalityDim): Pole =>
		scores[dim].left >= scores[dim].right ? LEFT_POLE[dim] : RIGHT_POLE[dim]

	const roleScores: Record<RoleTendency, number> = {
		"lanh-dao": 0,
		"chuyen-gia": 0,
		"sang-tao": 0,
		"giao-tiep": 0,
	}
	for (const q of ROLE_QUESTIONS) {
		const idx = state.roleAnswers[q.id]
		if (typeof idx === "number" && q.options[idx]) {
			roleScores[q.options[idx].role] += 1
		}
	}
	let dominantRole: RoleTendency = "chuyen-gia"
	let best = -1
	;(Object.keys(roleScores) as RoleTendency[]).forEach((r) => {
		if (roleScores[r] > best) {
			best = roleScores[r]
			dominantRole = r
		}
	})

	return {
		orientation: pick("orientation"),
		info: pick("info"),
		decision: pick("decision"),
		work: pick("work"),
		scores,
		dominantRole,
		roleScores,
	}
}

// ---------- sắp xếp trục theo điểm ----------
export function sortedAxes(v: AxisVector): AxisId[] {
	return [...AXIS_IDS].sort((a, b) => v[b] - v[a])
}

// ---------- FUNCTION 3.3: ánh xạ thị trường ----------
function buildMatches(
	aptitude: AxisVector,
	valueRanking: JourneyState["valueRanking"],
): CareerMatch[] {
	const topValues = valueRanking.slice(0, 3)
	const scored = CAREER_GROUPS.map((g) => {
		let wsum = 0
		let dot = 0
		for (const axis of AXIS_IDS) {
			const w = g.axisWeights[axis] ?? 0
			if (w > 0) {
				wsum += w
				dot += w * aptitude[axis]
			}
		}
		const base = wsum > 0 ? dot / wsum : 0
		const overlap = g.valueAffinity.filter((v) => topValues.includes(v)).length
		const fit = clamp(Math.round(base + overlap * 5), 0, 100)

		// Lý do khuyến nghị
		const reasons: string[] = []
		const strongAxes = AXIS_IDS.filter(
			(a) => (g.axisWeights[a] ?? 0) > 0 && aptitude[a] >= 55,
		)
		if (strongAxes.length > 0) {
			reasons.push(
				"Tận dụng thế mạnh: " +
					strongAxes.map((a) => AXIS_LABELS[a]).join(", "),
			)
		}
		if (overlap > 0) {
			reasons.push("Phù hợp với giá trị sống bạn ưu tiên")
		}
		if (g.outlook === "cao") {
			reasons.push("Nhu cầu nhân lực đang tăng")
		} else if (g.outlook === "on-dinh") {
			reasons.push("Nhu cầu nhân lực ổn định")
		}
		if (reasons.length === 0) {
			reasons.push("Có một số điểm chạm với nhóm năng khiếu của bạn")
		}

		const match: CareerMatch = {
			groupId: g.id,
			name: g.name,
			fit,
			jobs: g.jobs,
			outlook: g.outlook,
			aiRisk: g.aiRisk,
			income: g.income,
			incomeRange: g.incomeRange,
			universities: g.universities,
			streams: g.streams,
			subjectsFocus: g.subjectsFocus,
			reasons,
		}
		return match
	})

	return scored.sort((a, b) => b.fit - a.fit).slice(0, 3)
}

// ---------- FUNCTION 3.1 + 3.2: nhất quán + bối cảnh ----------
function buildWarnings(
	aptitude: AxisVector,
	personality: PersonalityProfile,
	state: JourneyState,
): SoftWarning[] {
	const warnings: SoftWarning[] = []
	const top = sortedAxes(aptitude)
	const top3 = top.slice(0, 3)

	// 3.1 — nhất quán giữa vai trò tự chọn và năng khiếu đo được
	const roleAxis = ROLE_AXIS[personality.dominantRole]
	if (!top3.includes(roleAxis) && aptitude[roleAxis] < 50) {
		warnings.push({
			title: "Một điểm để bạn suy ngẫm thêm",
			body:
				"Trong nhóm, bạn hay nhận vai " +
				AXIS_LABELS[roleAxis] +
				", nhưng các bài quan sát lại cho thấy thế mạnh rõ hơn ở " +
				top3.map((a) => AXIS_LABELS[a]).join(", ") +
				". Điều này không xấu — chỉ là gợi ý bạn thử nhiều vai khác nhau để hiểu mình hơn.",
		})
	}

	// 3.2 — bối cảnh Việt Nam
	if (state.familyExpectation === "huong-khac") {
		warnings.push({
			title: "Về kỳ vọng gia đình",
			body:
				"Gia đình đang nghiêng về một hướng khác. Hãy xem kết quả này như dữ liệu để cùng trò chuyện cởi mở với gia đình, thay vì để trở thành mâu thuẫn.",
		})
	} else if (state.familyExpectation === "chua-chac") {
		warnings.push({
			title: "Gia đình còn phân vân",
			body:
				"Bạn có thể dùng phần “lý do phù hợp” và thông tin thị trường bên dưới để giải thích lựa chọn của mình rõ ràng hơn.",
		})
	}

	if (state.economic === "can-som") {
		warnings.push({
			title: "Về điều kiện kinh tế",
			body:
				"Nếu cần có thu nhập sớm, bạn có thể cân nhắc con đường cao đẳng nghề / học nghề ngắn hơn trong cùng lĩnh vực, rồi học lên sau — vẫn tới đích mà nhẹ gánh hơn.",
		})
	}

	return warnings
}

function gradeBandOf(grade: number | null): JourneyResult["gradeBand"] {
	if (grade === null) return "chua-ro"
	if (grade < 10) return "thcs"
	return "thpt"
}

function buildNextSteps(
	band: JourneyResult["gradeBand"],
	matches: CareerMatch[],
): string[] {
	const topName = matches[0]?.name ?? "nhóm nghề phù hợp"
	if (band === "thcs") {
		return [
			"Bạn còn nhiều thời gian — chưa cần chốt ngành vội.",
			"Thử tham gia câu lạc bộ / hoạt động liên quan đến " + topName + " để kiểm chứng.",
			"Đầu tư chắc các môn nền tảng (Toán, Ngữ văn, Tiếng Anh) để giữ nhiều lựa chọn mở.",
			"Làm lại hành trình này sau 6–12 tháng để xem mình thay đổi ra sao.",
		]
	}
	if (band === "thpt") {
		return [
			"Xác định tổ hợp thi phù hợp với nhóm " + topName + ".",
			"Tìm hiểu 2–3 trường có ngành này và điểm chuẩn các năm gần đây.",
			"Tham gia hoạt động / dự án nhỏ liên quan để có trải nghiệm thực tế.",
			"So sánh cả 3 hướng được gợi ý trước khi quyết định cuối cùng.",
		]
	}
	return [
		"Ghi lại nhóm " + topName + " để tìm hiểu sâu hơn.",
		"Tìm hiểu môn học và tổ hợp liên quan.",
		"Trò chuyện với người đang làm trong lĩnh vực này nếu có thể.",
	]
}

export function isJourneyComplete(state: JourneyState): boolean {
	const patternDone = Object.keys(state.patternAnswers).length >= PATTERN_QUESTIONS.length
	const wordDone = Object.keys(state.wordAnswers).length >= WORD_QUESTIONS.length
	const classifyDone = Object.keys(state.classifyAnswers).length >= CLASSIFY_CARDS.length
	const envDone = Object.keys(state.envAnswers).length >= ENV_CARDS.length
	const roleDone = Object.keys(state.roleAnswers).length >= ROLE_QUESTIONS.length
	const situationDone =
		Object.keys(state.situationAnswers).length >= SITUATION_QUESTIONS.length
	const valueDone = state.valueRanking.length >= VALUE_ITEMS.length
	const contextDone =
		state.grade !== null &&
		state.familyExpectation !== null &&
		state.economic !== null
	return (
		patternDone &&
		wordDone &&
		classifyDone &&
		envDone &&
		roleDone &&
		situationDone &&
		valueDone &&
		contextDone
	)
}

// ---------- Tổng hợp cuối ----------
export function synthesize(state: JourneyState): JourneyResult {
	const aptitude = scoreAptitude(state)
	const personality = scoreSituation(state)
	const topAxes = sortedAxes(aptitude)
	const matches = buildMatches(aptitude, state.valueRanking)
	const warnings = buildWarnings(aptitude, personality, state)
	const band = gradeBandOf(state.grade)
	const nextSteps = buildNextSteps(band, matches)

	const portraitKey = AXIS_TO_PORTRAIT[topAxes[0]]
	const portraitTpl = PORTRAITS[portraitKey] ?? PORTRAITS["nguoi-phan-tich"]
	const personalitySentence = describePersonality(personality)
	const portrait =
		portraitTpl.lines.join(" ") + " " + personalitySentence

	const shareText =
		"Mình là “" +
		portraitTpl.title +
		"”. 3 hướng được gợi ý cho mình: " +
		matches.map((m) => m.name).join(" • ") +
		" (qua Hành trình Khám phá Bản thân)."

	return {
		completed: isJourneyComplete(state),
		aptitude,
		topAxes,
		personality,
		portrait,
		matches,
		warnings,
		nextSteps,
		gradeBand: band,
		shareText,
	}
}

function describePersonality(p: PersonalityProfile): string {
	const parts: string[] = []
	parts.push(
		p.orientation === "E"
			? "Bạn nạp năng lượng từ việc tương tác với mọi người"
			: "Bạn nạp năng lượng từ không gian yên tĩnh của riêng mình",
	)
	parts.push(
		p.info === "S"
			? "thích điều cụ thể, thực tế"
			: "thích ý tưởng và khả năng mới",
	)
	parts.push(
		p.decision === "T"
			? "ra quyết định thiên về lý trí"
			: "ra quyết định có cân nhắc cảm xúc",
	)
	parts.push(
		p.work === "J"
			? "và làm việc có kế hoạch, ngăn nắp."
			: "và làm việc linh hoạt, tùy ứng biến.",
	)
	return parts.join(", ").replace(", và", " và")
}
