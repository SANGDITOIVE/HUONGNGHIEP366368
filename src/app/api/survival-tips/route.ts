import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getAdminContext } from "@/lib/community/serverAuth"
import {
	sql,
	ensureSurvivalTables,
	isValidCategory,
	toPublicTip,
} from "@/lib/community/survivalDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/survival-tips?school_id=X&category=Y
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const schoolId = (searchParams.get("school_id") ?? "").trim().slice(0, 100)
	const category = (searchParams.get("category") ?? "").trim()
	if (!schoolId) return NextResponse.json({ ok: false, error: "MISSING_SCHOOL_ID" }, { status: 400 })

	const { isAdmin } = await getAdminContext()
	await ensureSurvivalTables()

	const hasCat = category && isValidCategory(category)
	const rows = hasCat
		? (await sql`
			SELECT t.*, (SELECT COUNT(*)::int FROM survival_tip_replies r WHERE r.tip_id = t.id AND r.status <> 'removed') AS reply_count
			FROM survival_tips t
			WHERE t.school_id = ${schoolId} AND t.category = ${category} AND (t.status <> 'removed' OR ${isAdmin})
			ORDER BY t.trust_score DESC, t.created_at DESC`).rows
		: (await sql`
			SELECT t.*, (SELECT COUNT(*)::int FROM survival_tip_replies r WHERE r.tip_id = t.id AND r.status <> 'removed') AS reply_count
			FROM survival_tips t
			WHERE t.school_id = ${schoolId} AND (t.status <> 'removed' OR ${isAdmin})
			ORDER BY t.trust_score DESC, t.created_at DESC`).rows

	const tips = rows.map((r) => toPublicTip(r, isAdmin, Number(r.reply_count ?? 0)))

	const catRows = (await sql`
		SELECT category, COUNT(*)::int AS c FROM survival_tips
		WHERE school_id = ${schoolId} AND status <> 'removed' GROUP BY category`).rows
	const categoryCounts: Record<string, number> = {}
	for (const cr of catRows) categoryCounts[String(cr.category)] = Number(cr.c)

	return NextResponse.json({ ok: true, schoolId, count: tips.length, categoryCounts, tips })
}

// POST /api/survival-tips  (bắt đăng nhập để chống spam; có thể ẩn danh)
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const b = (await req.json()) as Record<string, unknown>
	const schoolId = String(b.schoolId ?? b.school_id ?? "").trim().slice(0, 100)
	const category = String(b.category ?? "").trim()
	const content = String(b.content ?? "").trim().slice(0, 4000)
	const isAnonymous = Boolean(b.isAnonymous ?? b.is_anonymous ?? false)

	if (!schoolId || !isValidCategory(category) || content.length < 3)
		return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })

	await ensureSurvivalTables()
	const inserted = await sql`
		INSERT INTO survival_tips
			(school_id, category, content, author_user_id, author_name, is_anonymous, upvotes, trust_score, status)
		VALUES
			(${schoolId}, ${category}, ${content}, ${user.id}, ${user.name ?? null}, ${isAnonymous}, 0, 0, 'visible')
		RETURNING *`
	const role = user.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"
	return NextResponse.json({ ok: true, tip: toPublicTip(inserted.rows[0], isAdmin, 0) }, { status: 201 })
}
