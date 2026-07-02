import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureQaTables, toPublicAnswer } from "@/lib/community/qaDb"
import { createNotification } from "@/lib/community/notificationsDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/questions/[id]/answers  — trả lời câu hỏi. Bắt đăng nhập; có thể ẩn danh.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const qid = Number(params.id)
	if (!Number.isInteger(qid) || qid <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	const b = (await req.json()) as Record<string, unknown>
	const body = String(b.body ?? "").trim().slice(0, 8000)
	const isAnonymous = Boolean(b.isAnonymous ?? b.is_anonymous ?? false)
	if (body.length < 2) return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })

	await ensureQaTables()
	const exists = await sql`SELECT id, user_id, title FROM questions WHERE id = ${qid} LIMIT 1`
	if (exists.rows.length === 0) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

	const inserted = await sql`
		INSERT INTO answers (question_id, body, is_anonymous, user_id, author_name, upvotes, downvotes, status)
		VALUES (${qid}, ${body}, ${isAnonymous}, ${user.id}, ${user.name ?? null}, 0, 0, 'visible')
		RETURNING *`
	const role = user.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"

	// Thông báo cho chủ câu hỏi (bỏ qua nếu tự trả lời chính mình).
	const qRow = exists.rows[0]
	if (qRow?.user_id && String(qRow.user_id) !== String(user.id)) {
		await createNotification({
			userId: String(qRow.user_id),
			type: "answer_on_question",
			title: `${isAnonymous ? "Một sinh viên" : user.name ?? "Ai đó"} đã trả lời câu hỏi của bạn`,
			body: String(qRow.title ?? "").slice(0, 140),
			link: `/hoi-dap/${qid}`,
			actorName: isAnonymous ? null : user.name ?? null,
		})
	}

	return NextResponse.json({ ok: true, answer: toPublicAnswer(inserted.rows[0], isAdmin, user.id) }, { status: 201 })
}
