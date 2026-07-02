import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getAdminContext } from "@/lib/community/serverAuth"
import {
	sql,
	ensureQaTables,
	toPublicQuestion,
	toPublicAnswer,
} from "@/lib/community/qaDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/questions/[id]  — chi tiết câu hỏi + tất cả câu trả lời (tăng view_count).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
	const id = Number(params.id)
	if (!Number.isInteger(id) || id <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	const { isAdmin } = await getAdminContext()
	const session = await getServerSession(authOptions)
	const viewerId = session?.user?.id ?? null
	await ensureQaTables()

	const updated = await sql`UPDATE questions SET view_count = view_count + 1 WHERE id = ${id} RETURNING *`
	if (updated.rows.length === 0) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })
	const q = updated.rows[0]
	// Chỉ bài đã duyệt (visible) mới xem công khai; bài chờ duyệt/đã gỡ chỉ tác giả & admin thấy.
	const canSeeHidden = isAdmin || (viewerId != null && String(q.user_id) === String(viewerId))
	if (q.status !== "visible" && !canSeeHidden)
		return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

	const answerRows = (await sql`
		SELECT * FROM answers
		WHERE question_id = ${id} AND (status = 'visible' OR ${isAdmin})
		ORDER BY (upvotes - downvotes) DESC, created_at ASC`).rows

	const question = toPublicQuestion(q, isAdmin, answerRows.length, viewerId)
	const answers = answerRows.map((a) => toPublicAnswer(a, isAdmin, viewerId))
	return NextResponse.json({ ok: true, question, answers })
}

// DELETE /api/questions/[id] — tác giả hoặc admin ẩn (soft-delete) câu hỏi.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const id = Number(params.id)
	if (!Number.isInteger(id) || id <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	await ensureQaTables()
	const row = (await sql`SELECT user_id FROM questions WHERE id = ${id} LIMIT 1`).rows[0]
	if (!row) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

	const role = session?.user?.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"
	if (String(row.user_id) !== String(userId) && !isAdmin)
		return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })

	await sql`UPDATE questions SET status = 'removed' WHERE id = ${id}`
	return NextResponse.json({ ok: true })
}
