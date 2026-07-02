import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureQaTables, toPublicQuestion } from "@/lib/community/qaDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/questions/mine — danh sách câu hỏi/bài do CHÍNH người dùng đăng.
// Bắt buộc đăng nhập; chỉ trả về bài của tài khoản hiện tại (user_id = session id),
// bỏ qua bài đã bị xoá. Vì đây là bài của chính mình nên isMine luôn = true →
// nút xoá luôn khả dụng cho tác giả.
export async function GET() {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId)
		return NextResponse.json({ ok: false, error: "UNAUTHORIZED", questions: [] }, { status: 401 })

	await ensureQaTables()
	const rows = (await sql`
		SELECT q.*, (SELECT COUNT(*)::int FROM answers a WHERE a.question_id = q.id AND a.status = 'visible') AS answer_count
		FROM questions q
		WHERE q.user_id = ${userId}
		ORDER BY q.created_at DESC
		LIMIT 100`).rows
	// Đây là bài của CHÍNH người dùng → luôn hiện nội dung thật (không che) kèm MỌI
	// trạng thái: đã đăng (visible), chờ duyệt (pending_review), đã gỡ (removed).
	const questions = rows.map((r) => toPublicQuestion(r, true, Number(r.answer_count ?? 0), userId))
	return NextResponse.json({ ok: true, count: questions.length, questions })
}
