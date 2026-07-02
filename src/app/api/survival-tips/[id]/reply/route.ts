import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getAdminContext } from "@/lib/community/serverAuth"
import { sql, ensureSurvivalTables, toPublicReply } from "@/lib/community/survivalDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/survival-tips/[id]/reply  — danh sách reply của 1 tip.
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
	const tipId = Number(params.id)
	if (!Number.isInteger(tipId) || tipId <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	const { isAdmin } = await getAdminContext()
	await ensureSurvivalTables()
	const rows = (await sql`
		SELECT * FROM survival_tip_replies
		WHERE tip_id = ${tipId} AND (status <> 'removed' OR ${isAdmin})
		ORDER BY created_at ASC`).rows
	const replies = rows.map((r) => toPublicReply(r, isAdmin))
	return NextResponse.json({ ok: true, count: replies.length, replies })
}

// POST /api/survival-tips/[id]/reply  — trả lời 1 tip. Bắt đăng nhập; có thể ẩn danh.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const tipId = Number(params.id)
	if (!Number.isInteger(tipId) || tipId <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	const b = (await req.json()) as Record<string, unknown>
	const content = String(b.content ?? "").trim().slice(0, 2000)
	const isAnonymous = Boolean(b.isAnonymous ?? b.is_anonymous ?? false)
	if (content.length < 2) return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })

	await ensureSurvivalTables()
	const exists = await sql`SELECT id FROM survival_tips WHERE id = ${tipId} LIMIT 1`
	if (exists.rows.length === 0) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

	const inserted = await sql`
		INSERT INTO survival_tip_replies (tip_id, user_id, author_name, is_anonymous, content, status)
		VALUES (${tipId}, ${user.id}, ${user.name ?? null}, ${isAnonymous}, ${content}, 'visible')
		RETURNING *`
	const role = user.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"
	return NextResponse.json({ ok: true, reply: toPublicReply(inserted.rows[0], isAdmin) }, { status: 201 })
}
