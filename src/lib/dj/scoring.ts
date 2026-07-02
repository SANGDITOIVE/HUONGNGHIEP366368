// =============================================================
// SCORING ENGINE — tất cả tính toán quyết định chạy được KHÔNG cần AI.
// (AI chỉ bổ sung diễn giải/sinh đề; thiếu key vẫn hoạt động.)
// =============================================================
import {
	RIASEC_KEYS,
	APTITUDE_KEYS,
	type RiasecKey,
	type RiasecScores,
	type AptitudeScores,
	type Hypothesis,
	type ClusterConfidence,
} from "@/lib/dj/types"
import { RIASEC_ITEMS } from "@/data/dj/riasec"
import { APTITUDE_ITEMS } from "@/data/dj/aptitude"
import { CLUSTERS } from "@/data/dj/clusters"

function clamp(n: number, lo = 0, hi = 100): number {
	return Math.max(lo, Math.min(hi, n))
}

// ---------- RIASEC ----------
// Điểm nhóm = trung bình item (đảo chiều nếu reverse) đưa về 0..100:
// score = (avg - 1) / 4 * 100
export function scoreRiasec(raw: Record<string, number>): {
	scores: RiasecScores
	hollandCode: string
	consistencyFlag: boolean
} {
	const byGroup: Record<RiasecKey, number[]> = { R: [], I: [], A: [], S: [], E: [], C: [] }
	for (const item of RIASEC_ITEMS) {
		const ans = raw[item.id]
		if (typeof ans !== "number" || ans < 1 || ans > 5) continue
		const v = item.reverse ? 6 - ans : ans
		byGroup[item.group].push(v)
	}
	const scores = {} as RiasecScores
	for (const k of RIASEC_KEYS) {
		const arr = byGroup[k]
		const avg = arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 1
		scores[k] = Math.round(clamp(((avg - 1) / 4) * 100))
	}
	const hollandCode = [...RIASEC_KEYS]
		.sort((a, b) => scores[b] - scores[a])
		.slice(0, 3)
		.join("")
	// Cờ thiếu nhất quán: chên lệch lớn giữa item thường và item đảo trong cùng nhóm
	let inconsistent = 0
	for (const k of RIASEC_KEYS) {
		const normal = RIASEC_ITEMS.filter((i) => i.group === k && !i.reverse).map((i) => raw[i.id]).filter((x) => typeof x === "number") as number[]
		const rev = RIASEC_ITEMS.filter((i) => i.group === k && i.reverse).map((i) => raw[i.id]).filter((x) => typeof x === "number") as number[]
		if (!normal.length || !rev.length) continue
		const nAvg = normal.reduce((a, b) => a + b, 0) / normal.length
		const rAvg = rev.reduce((a, b) => a + b, 0) / rev.length
		// nếu cả hai cao (>3.5) => mâu thuẫn (đáng lẽ ngược nhau)
		if (nAvg > 3.5 && rAvg > 3.5) inconsistent++
	}
	return { scores, hollandCode, consistencyFlag: inconsistent >= 2 }
}

// ---------- APTITUDE (chấm tự động theo đáp án) ----------
export function scoreAptitude(raw: Record<string, string>): AptitudeScores {
	const correct: Record<string, number> = {}
	const total: Record<string, number> = {}
	for (const k of APTITUDE_KEYS) {
		correct[k] = 0
		total[k] = 0
	}
	for (const item of APTITUDE_ITEMS) {
		total[item.group]++
		if (raw[item.id] && raw[item.id] === item.answer) correct[item.group]++
	}
	const out = {} as AptitudeScores
	for (const k of APTITUDE_KEYS) {
		out[k] = total[k] ? Math.round((correct[k] / total[k]) * 100) : 0
	}
	return out
}

// ---------- GIẢ THUYẾT CỤM (rule-based) ----------
// Điểm khớp cụm = 0.6*RIASEC affinity + 0.4*aptitude focus, chuẩn hóa 0..1.
export function rankClusters(
	riasec: RiasecScores,
	aptitude: AptitudeScores,
): { clusterId: string; fit: number }[] {
	const ranked = CLUSTERS.map((c) => {
		let wsum = 0
		let acc = 0
		for (const [k, w] of Object.entries(c.riasecAffinity)) {
			acc += (riasec[k as RiasecKey] / 100) * (w as number)
			wsum += w as number
		}
		const riasecFit = wsum ? acc / wsum : 0
		const aptArr = c.aptitudeFocus.map((a) => (aptitude as Record<string, number>)[a] ?? 0)
		const aptFit = aptArr.length ? aptArr.reduce((a, b) => a + b, 0) / aptArr.length / 100 : 0
		const fit = 0.6 * riasecFit + 0.4 * aptFit
		return { clusterId: c.id, fit }
	})
	return ranked.sort((a, b) => b.fit - a.fit)
}

export function buildHypotheses(
	riasec: RiasecScores,
	aptitude: AptitudeScores,
	topN = 3,
): Hypothesis[] {
	const ranked = rankClusters(riasec, aptitude).slice(0, topN)
	return ranked.map((r) => {
		const c = CLUSTERS.find((x) => x.id === r.clusterId)!
		const topRiasec = Object.entries(c.riasecAffinity)
			.sort((a, b) => (b[1] as number) - (a[1] as number))
			.slice(0, 2)
			.map(([k]) => k)
			.join("-")
		return {
			clusterId: c.id,
			// cố ý để confidence THẤP (giả thuyết, chưa phải kết luận)
			confidence: Math.round(Math.min(0.55, 0.25 + r.fit * 0.4) * 100) / 100,
			why: `Sở thích nổi trội ${topRiasec} và năng lực ${c.aptitudeFocus.join(", ")} khá khớp với cụm này.`,
			confirmIf: `Bạn làm tốt và thấy hứng thú ở bài thử nghiệm thuộc ${c.name}.`,
			disconfirmIf: `Bạn thấy chán hoặc vật lộn khi làm bài thực tế của cụm này.`,
		}
	})
}

// ---------- LỚP 2: 2 TRỤC — NĂNG LỰC & HỨNG THÚ ----------
export interface AttemptForConfidence {
	clusterId: string
	competenceScore: number // 0..100 (từ grade)
	difficulty: number // 1..3
	selfFeeling: number // 1..5
	wantMore: number // 1..5
}

// competence_axis: trung bình có trọng số theo độ khó (w=difficulty)
// interest_axis: 100*(0.6*want_more + 0.4*self_feeling)/5
// divergence: |competence - interest| > 30 => cờ phân kỳ
export function computeConfidence(attempts: AttemptForConfidence[]): ClusterConfidence[] {
	const byCluster = new Map<string, AttemptForConfidence[]>()
	for (const a of attempts) {
		if (!byCluster.has(a.clusterId)) byCluster.set(a.clusterId, [])
		byCluster.get(a.clusterId)!.push(a)
	}
	const out: ClusterConfidence[] = []
	for (const [clusterId, arr] of byCluster) {
		let wsum = 0
		let acc = 0
		let interestAcc = 0
		for (const a of arr) {
			const w = Math.max(1, Math.min(3, a.difficulty))
			acc += a.competenceScore * w
			wsum += w
			interestAcc += (100 * (0.6 * a.wantMore + 0.4 * a.selfFeeling)) / 5
		}
		const competenceAxis = Math.round(wsum ? acc / wsum : 0)
		const interestAxis = Math.round(arr.length ? interestAcc / arr.length : 0)
		out.push({
			clusterId,
			competenceAxis,
			interestAxis,
			evidenceCount: arr.length,
			divergence: Math.abs(competenceAxis - interestAxis),
		})
	}
	return out.sort((a, b) => b.competenceAxis + b.interestAxis - (a.competenceAxis + a.interestAxis))
}

// Góc phần tư 2D để hiển thị (Layer 2 chart)
export function quadrantLabel(competence: number, interest: number): string {
	const hiC = competence >= 50
	const hiI = interest >= 50
	if (hiC && hiI) return "Vùng sở trường + đam mê (ưu tiên khám phá sâu)"
	if (!hiC && hiI) return "Thích nhưng chưa giỏi (có thể luyện thêm)"
	if (hiC && !hiI) return "Giỏi nhưng chưa thích (cân nhắc động lực)"
	return "Chưa phù hợp ở thời điểm này"
}

// Chấm điểm bài tự luận theo rule (dự phòng khi không có Gemini).
// Heuristic minh bạch: độ dài, từ khóa cấu trúc, câu hỏi/con số.
export function ruleGradeSubmission(submission: string, deliverable: string): number {
	const text = (submission || "").trim()
	if (text.length < 20) return 15
	const words = text.split(/\s+/).length
	let score = 35
	if (words >= 40) score += 15
	if (words >= 90) score += 10
	if (words >= 160) score += 5
	// dấu hiệu cấu trúc
	if (/(\n\s*[-*\d]|bước|step|\d\.)/i.test(text)) score += 10
	// con số / lý lẽ
	if (/\d/.test(text)) score += 8
	if (/(vì|do|nên|nếu|giả sử|trường hợp|rủi ro)/i.test(text)) score += 12
	if (deliverable === "steps" && /(\d\.|bước)/i.test(text)) score += 5
	return Math.max(0, Math.min(100, score))
}
