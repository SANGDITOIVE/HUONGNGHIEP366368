// POST /api/dj/layer1 — tổng hợp Lớp 1 thành giả thuyết.
// Chạy được không cần Gemini (rule-based). Có key -> diễn giải AI.
import { NextResponse } from "next/server"
import { scoreRiasec, scoreAptitude, buildHypotheses, rankClusters } from "@/lib/dj/scoring"
import { geminiJson } from "@/lib/dj/gemini"
import { promptLayer1 } from "@/lib/dj/prompts"
import { saveLayer1 } from "@/lib/dj/db"
import type { Layer1Result, Hypothesis } from "@/lib/dj/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
		const riasecRaw = (body?.riasecRaw ?? {}) as Record<string, number>
		const aptitudeRaw = (body?.aptitudeRaw ?? {}) as Record<string, string>
		const values = (body?.values ?? {}) as Record<string, number>
		const constraints = body?.constraints ?? {}

		const { scores: riasec, hollandCode, consistencyFlag } = scoreRiasec(riasecRaw)
		const aptitude = scoreAptitude(aptitudeRaw)
		const ranked = rankClusters(riasec, aptitude)
		const rankedIds = ranked.map((r) => r.clusterId)

		// fallback rule-based
		let hypotheses: Hypothesis[] = buildHypotheses(riasec, aptitude, 3)
		let source: "ai" | "rule" = "rule"
		let disclaimer =
			"Đây là GIẢ THUYẾT ban đầu dựa trên sở thích và năng lực, CHƯA phải kết luận. Hãy làm các bài thực hành ở Lớp 2 để kiểm chứng."

		const ai = await geminiJson<{ hypotheses: Hypothesis[]; disclaimer?: string }>(
			promptLayer1({ riasec, aptitude, hollandCode, values, constraints, rankedClusterIds: rankedIds.slice(0, 6) }),
			{ hard: false, temperature: 0.6 },
		)
		if (ai?.hypotheses?.length) {
			// giữ confidence thấp, chỉ nhận cluster hợp lệ
			const valid = ai.hypotheses.filter((h) => rankedIds.includes(h.clusterId)).slice(0, 3)
			if (valid.length) {
				hypotheses = valid.map((h) => ({ ...h, confidence: Math.min(0.55, Math.max(0.2, Number(h.confidence) || 0.4)) }))
				source = "ai"
				if (ai.disclaimer) disclaimer = ai.disclaimer
			}
		}

		// Quy tắc (chạy cả khi không có AI): nếu kỳ vọng gia đình lệch hẳn với giả thuyết mạnh nhất.
		const cx = constraints as { parentExpectFields?: string[]; parentExpectOther?: string }
		const expectFields = Array.isArray(cx?.parentExpectFields) ? cx.parentExpectFields : []
		const hypoIds = hypotheses.map((h) => h.clusterId)
		const overlap = expectFields.some((f) => hypoIds.includes(f))
		if ((expectFields.length > 0 || (cx?.parentExpectOther ?? "").trim().length > 0) && !overlap) {
			disclaimer +=
				" Lưu ý: nhóm ngành gia đình kỳ vọng hiện chưa trùng với giả thuyết mạnh nhất của em — hãy trao đổi thẳng thắn với cha mẹ và mang theo bằng chứng ở Lớp 2 để cùng nhìn nhận."
		}

		const result: Layer1Result = { riasec, aptitude, hollandCode, consistencyFlag, hypotheses, disclaimer, source }
		// lưu (không bắt buộc)
		void saveLayer1(null, { riasec, aptitude, values, constraints, hollandCode, hypotheses, source })
		return NextResponse.json(result)
	} catch (e) {
		console.error("[api/dj/layer1]", e)
		return NextResponse.json({ error: "layer1_failed" }, { status: 500 })
	}
}
