// POST /api/dj/grade — chấm bài (auto hoặc self_assist).
// Luôn trả kết quả: Gemini nếu có key, không thì rule-based.
import { NextResponse } from "next/server"
import { getTask } from "@/data/dj/tasks"
import { geminiJson } from "@/lib/dj/gemini"
import { promptGrade, promptSelfAssist } from "@/lib/dj/prompts"
import { ruleGradeSubmission } from "@/lib/dj/scoring"
import { saveAttempt } from "@/lib/dj/db"
import type { GradeResult, TaskSpec } from "@/lib/dj/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
		const taskId = String(body?.taskId ?? "")
		const clusterId = String(body?.clusterId ?? "")
		const submission = String(body?.submission ?? "")
		const selfFeeling = Number(body?.selfFeeling ?? 3)
		const wantMore = Number(body?.wantMore ?? 3)
		const timeSpentSec = Number(body?.timeSpentSec ?? 0)
		const mode = body?.mode === "self_assist" ? "self_assist" : "auto"
		// QUAN TRỌNG: chấm theo ĐÚNG đề học sinh đã thấy (client gửi kèm), tránh lệch rubric
		// giữa đề AI sinh và đề tĩnh cùng task_id. Chỉ fallback về đề tĩnh nếu client không gửi.
		const sentTask = body?.task
		const task: TaskSpec | undefined =
			sentTask && typeof sentTask.title === "string" && Array.isArray(sentTask.rubric) && sentTask.rubric.length > 0
				? (sentTask as TaskSpec)
				: getTask(taskId)

		// interest signal luôn tính từ tự đánh giá (0..100)
		const interestSignal = Math.round((100 * (0.6 * wantMore + 0.4 * selfFeeling)) / 5)
		const ruleScore = ruleGradeSubmission(submission, task?.deliverable_format ?? "essay")

		let result: GradeResult

		if (mode === "self_assist" && task) {
			const ai = await geminiJson<any>(promptSelfAssist(task, submission, ruleScore), { hard: false })
			const competenceScore = Number(ai?.competenceScore)
			result = {
				competenceScore: Number.isFinite(competenceScore) ? Math.max(0, Math.min(100, competenceScore)) : ruleScore,
				competenceBreakdown: [],
				interestSignal,
				redFlags: [],
				confidenceDelta: 0,
				feedback: ai?.aiObservation || "Hãy đọc lại bài và tự đánh giá theo các câu hỏi gợi ý.",
				recommendedNext: interestSignal >= 60 ? "probe_deeper" : "try_adjacent",
				source: ai ? "ai" : "rule",
				reflectionPrompts: ai?.reflectionPrompts || task.reflection_questions,
				aiObservation: ai?.aiObservation,
				gapFlag: !!ai?.gapFlag,
				gapExplanation: ai?.gapExplanation,
			}
		} else if (task) {
			const ai = await geminiJson<GradeResult>(promptGrade(task, submission, selfFeeling, wantMore), { hard: false })
			if (ai && Number.isFinite(Number(ai.competenceScore))) {
				result = {
					competenceScore: Math.max(0, Math.min(100, Number(ai.competenceScore))),
					competenceBreakdown: Array.isArray(ai.competenceBreakdown) ? ai.competenceBreakdown : [],
					interestSignal: Number.isFinite(Number(ai.interestSignal)) ? Number(ai.interestSignal) : interestSignal,
					redFlags: Array.isArray(ai.redFlags) ? ai.redFlags : [],
					confidenceDelta: Number(ai.confidenceDelta) || 0,
					feedback: ai.feedback || "",
					recommendedNext: ai.recommendedNext || (interestSignal >= 60 ? "probe_deeper" : "try_adjacent"),
					source: "ai",
				}
			} else {
				result = ruleResult(ruleScore, interestSignal)
			}
		} else {
			result = ruleResult(ruleScore, interestSignal)
		}

		void saveAttempt(null, {
			taskId, clusterId, submission, timeSpentSec, selfFeeling, wantMore,
			competenceScore: result.competenceScore, interestSignal: result.interestSignal,
			grade: result, source: result.source,
		})
		return NextResponse.json(result)
	} catch (e) {
		console.error("[api/dj/grade]", e)
		return NextResponse.json({ error: "grade_failed" }, { status: 500 })
	}
}

function ruleResult(competenceScore: number, interestSignal: number): GradeResult {
	const next = interestSignal >= 60 && competenceScore >= 50 ? "probe_deeper" : interestSignal >= 60 ? "try_adjacent" : "deprioritize"
	return {
		competenceScore,
		competenceBreakdown: [],
		interestSignal,
		redFlags: competenceScore < 25 ? ["Bài làm còn sơ sài, nên làm kỹ hơn để đánh giá chính xác."] : [],
		confidenceDelta: competenceScore >= 60 ? 0.1 : -0.05,
		feedback:
			"Đánh giá tự động (chưa gắn Gemini): dựa trên độ đầy đủ, cấu trúc và lý lẽ của bài. Gắn GEMINI_API_KEY để có nhận xét chi tiết theo rubric.",
		recommendedNext: next,
		source: "rule",
	}
}
