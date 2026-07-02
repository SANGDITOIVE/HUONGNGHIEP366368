import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureSurvivalTables, toPublicTip } from "@/lib/community/survivalDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/survival-tips/[id]/vote  — upvote (toggle). Bắt đăng nhập.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const tipId = Number(params.id)
	if (!Number.isInteger(tipId) || tipId <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	await ensureSurvivalTables()
	const exists = await sql`SELECT id FROM survival_tips WHERE id = ${tipId} LIMIT 1`
	if (exists.rows.length === 0) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

	const existing = await sql`SELECT user_id FROM survival_tip_votes WHERE tip_id = ${tipId} AND user_id = ${userId} LIMIT 1`
	let myVote: number
	if (existing.rows.length > 0) {
		await sql`DELETE FROM survival_tip_votes WHERE tip_id = ${tipId} AND user_id = ${userId}`
		myVote = 0
	} else {
		await sql`INSERT INTO survival_tip_votes (tip_id, user_id, value) VALUES (${tipId}, ${userId}, 1)`
		myVote = 1
	}

	const cnt = (await sql`SELECT COUNT(*)::int AS c FROM survival_tip_votes WHERE tip_id = ${tipId}`).rows[0]?.c
	const up = Number(cnt ?? 0)
	const updated = await sql`UPDATE survival_tips SET upvotes = ${up}, trust_score = ${up} WHERE id = ${tipId} RETURNING *`

	const role = session?.user?.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"
	return NextResponse.json({ ok: true, tip: toPublicTip(updated.rows[0], isAdmin), myVote })
}
