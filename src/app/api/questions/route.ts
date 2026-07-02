import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getAdminContext } from "@/lib/community/serverAuth"
import { findSchoolBySlug } from "@/lib/schools/resolve"
import {
	sql,
	ensureQaTables,
	normalizeTags,
	toPublicQuestion,
} from "@/lib/community/qaDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/questions?school_id=X&tag=Y&scope=general&sort=top
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const schoolId = (searchParams.get("school_id") ?? "").trim().slice(0, 100)
	const tag = (searchParams.get("tag") ?? "").trim().toLowerCase().slice(0, 40)
	const scope = (searchParams.get("scope") ?? "").trim()
	const sort = (searchParams.get("sort") ?? "new").trim()

	const { isAdmin } = await getAdminContext()
	const session = await getServerSession(authOptions)
	const viewerId = session?.user?.id ?? null
	await ensureQaTables()

	const where: string[] = []
	const vals: Array<string | boolean> = []
	let i = 1
	// Trang cộng đồng CHỈ hiển thị bài đã duyệt/đăng (visible) cho MỌI người, kể cả
	// admin. Bài chờ duyệt (pending_review) & đã gỡ (removed) KHÔNG lên feed; admin xử
	// lý ở tab Kiểm duyệt, tác giả xem ở tab Cá nhân.
	where.push(`q.status = 'visible'`)
	if (scope === "general") {
		where.push(`q.school_id IS NULL`)
	} else if (schoolId) {
		vals.push(schoolId)
		where.push(`q.school_id = $${i++}`)
	}
	if (tag) {
		vals.push(`%"${tag}"%`)
		where.push(`q.tags LIKE $${i++}`)
	}
	const orderSql = sort === "top" ? `(q.upvotes - q.downvotes) DESC, q.created_at DESC` : `q.created_at DESC`
	const text =
		`SELECT q.*, (SELECT COUNT(*)::int FROM answers a WHERE a.question_id = q.id AND a.status = 'visible') AS answer_count ` +
		`FROM questions q WHERE ${where.join(" AND ")} ORDER BY ${orderSql} LIMIT 100`
	const rows = (await sql.query(text, vals)).rows
	const questions = rows.map((r) => toPublicQuestion(r, isAdmin, Number(r.answer_count ?? 0), viewerId))
	return NextResponse.json({ ok: true, count: questions.length, questions })
}

// POST /api/questions  — tạo câu hỏi. BẮT BUỘC đăng nhập (chống spam), có thể ẩn danh.
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const b = (await req.json()) as Record<string, unknown>
	const title = String(b.title ?? "").trim().slice(0, 300)
	const body = String(b.body ?? "").trim().slice(0, 8000)
	const isAnonymous = Boolean(b.isAnonymous ?? b.is_anonymous ?? false)
	const tags = normalizeTags(b.tags)
	const schoolRaw = String(b.schoolId ?? b.school_id ?? "").trim()
	const school = schoolRaw ? findSchoolBySlug(schoolRaw) : null
	const schoolId = school?.id ?? null

	if (title.length < 8 || body.length < 10)
		return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })

	await ensureQaTables()
	const inserted = await sql`
		INSERT INTO questions
			(school_id, title, body, tags, is_anonymous, user_id, author_name, view_count, upvotes, downvotes, status)
		VALUES
			(${schoolId}, ${title}, ${body}, ${JSON.stringify(tags)}, ${isAnonymous}, ${user.id}, ${user.name ?? null}, 0, 0, 0, 'visible')
		RETURNING *`
	const role = user.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"
	return NextResponse.json({ ok: true, question: toPublicQuestion(inserted.rows[0], isAdmin, 0, user.id) }, { status: 201 })
}
