import { NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getAdminContext } from "@/lib/community/serverAuth"
import { ensureReportsTable } from "@/lib/community/moderation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const TABLE: Record<string, string> = {
	question: "questions",
	answer: "answers",
	survival_tip: "survival_tips",
	survival_reply: "survival_tip_replies",
}

// Lấy đoạn trích + trạng thái + link tới nội dung bị báo cáo.
async function detailFor(targetType: string, targetId: number): Promise<{ snippet: string; status: string | null; link: string | null }> {
	try {
		switch (targetType) {
			case "question": {
				const r = (await sql`SELECT title, body, status FROM questions WHERE id = ${targetId} LIMIT 1`).rows[0]
				if (!r) return { snippet: "(đã xoá)", status: null, link: null }
				return { snippet: String(r.title ?? r.body ?? "").slice(0, 180), status: r.status ?? null, link: `/hoi-dap/${targetId}` }
			}
			case "answer": {
				const r = (await sql`SELECT body, status, question_id FROM answers WHERE id = ${targetId} LIMIT 1`).rows[0]
				if (!r) return { snippet: "(đã xoá)", status: null, link: null }
				return { snippet: String(r.body ?? "").slice(0, 180), status: r.status ?? null, link: `/hoi-dap/${r.question_id}` }
			}
			case "survival_tip": {
				const r = (await sql`SELECT content, status, school_id FROM survival_tips WHERE id = ${targetId} LIMIT 1`).rows[0]
				if (!r) return { snippet: "(đã xoá)", status: null, link: null }
				return { snippet: String(r.content ?? "").slice(0, 180), status: r.status ?? null, link: r.school_id ? `/truong/${r.school_id}/survival-guide` : null }
			}
			case "survival_reply": {
				const r = (await sql`SELECT sr.content, sr.status, st.school_id FROM survival_tip_replies sr LEFT JOIN survival_tips st ON st.id = sr.tip_id WHERE sr.id = ${targetId} LIMIT 1`).rows[0]
				if (!r) return { snippet: "(đã xoá)", status: null, link: null }
				return { snippet: String(r.content ?? "").slice(0, 180), status: r.status ?? null, link: r.school_id ? `/truong/${r.school_id}/survival-guide` : null }
			}
			default:
				return { snippet: "", status: null, link: null }
		}
	} catch {
		return { snippet: "(không đọc được nội dung)", status: null, link: null }
	}
}

async function setStatus(targetType: string, targetId: number, status: "visible" | "removed"): Promise<void> {
	switch (targetType) {
		case "question":
			await sql`UPDATE questions SET status = ${status} WHERE id = ${targetId}`
			return
		case "answer":
			await sql`UPDATE answers SET status = ${status} WHERE id = ${targetId}`
			return
		case "survival_tip":
			await sql`UPDATE survival_tips SET status = ${status} WHERE id = ${targetId}`
			return
		case "survival_reply":
			await sql`UPDATE survival_tip_replies SET status = ${status} WHERE id = ${targetId}`
			return
	}
}

// GET /api/admin/reports — gom nhóm báo cáo theo nội dung, kèm số lượt & link.
export async function GET() {
	const { isAdmin } = await getAdminContext()
	if (!isAdmin) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
	await ensureReportsTable()

	const groups = (await sql`
		SELECT target_type, target_id, COUNT(*)::int AS report_count, MAX(created_at) AS last_at
		FROM content_reports
		GROUP BY target_type, target_id
		ORDER BY report_count DESC, last_at DESC
		LIMIT 200`).rows

	const items: Array<Record<string, unknown>> = []
	for (const g of groups) {
		const d = await detailFor(String(g.target_type), Number(g.target_id))
		// Bài đã bị gỡ (removed) hoặc không còn tồn tại rời khỏi hàng đợi kiểm duyệt:
		// admin/tác giả đã xử lý xong nên KHÔNG hiện lại (đồng bộ với tab cá nhân & cộng đồng).
		if (d.status === "removed" || d.status === null) continue
		items.push({
			targetType: g.target_type,
			targetId: Number(g.target_id),
			reportCount: Number(g.report_count ?? 0),
			lastAt: g.last_at,
			snippet: d.snippet,
			status: d.status,
			link: d.link,
		})
	}
	return NextResponse.json({ ok: true, count: items.length, items })
}

// POST /api/admin/reports  { targetType, targetId, action: "remove"|"restore"|"dismiss" }
export async function POST(req: NextRequest) {
	const { isAdmin } = await getAdminContext()
	if (!isAdmin) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
	await ensureReportsTable()

	const b = (await req.json()) as Record<string, unknown>
	const targetType = String(b.targetType ?? "")
	const targetId = Number(b.targetId)
	const action = String(b.action ?? "")
	if (!(targetType in TABLE) || !Number.isInteger(targetId) || targetId <= 0)
		return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })

	if (action === "remove") {
		await setStatus(targetType, targetId, "removed")
	} else if (action === "restore") {
		await setStatus(targetType, targetId, "visible")
	} else if (action === "dismiss") {
		await sql`DELETE FROM content_reports WHERE target_type = ${targetType} AND target_id = ${targetId}`
	} else {
		return NextResponse.json({ ok: false, error: "INVALID_ACTION" }, { status: 422 })
	}
	return NextResponse.json({ ok: true })
}
