import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureQaTables, toPublicQuestion } from "@/lib/community/qaDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/questions/[id]/vote  { direction: "up" | "down" }. Bắt đăng nhập.
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const qid = Number(params.id)
	if (!Number.isInteger(qid) || qid <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	const dir = String((await req.json())?.direction ?? "").toLowerCase()
	const value = dir === "up" ? 1 : dir === "down" ? -1 : 0
	if (value === 0) return NextResponse.json({ ok: false, error: "INVALID_DIRECTION" }, { status: 422 })

	await ensureQaTables()
	const exists = await sql`SELECT id FROM questions WHERE id = ${qid} LIMIT 1`
	if (exists.rows.length === 0) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

	const prev = (await sql`SELECT vote_type FROM question_votes WHERE question_id = ${qid} AND user_id = ${userId} LIMIT 1`).rows[0]?.vote_type as number | undefined
	let myVote = value
	if (prev === value) {
		await sql`DELETE FROM question_votes WHERE question_id = ${qid} AND user_id = ${userId}`
		myVote = 0
	} else if (prev === undefined) {
		await sql`INSERT INTO question_votes (question_id, user_id, vote_type) VALUES (${qid}, ${userId}, ${value})`
	} else {
		await sql`UPDATE question_votes SET vote_type = ${value} WHERE question_id = ${qid} AND user_id = ${userId}`
	}

	const agg = await sql`SELECT
		COALESCE(SUM(CASE WHEN vote_type = 1 THEN 1 ELSE 0 END),0)::int AS up,
		COALESCE(SUM(CASE WHEN vote_type = -1 THEN 1 ELSE 0 END),0)::int AS down
		FROM question_votes WHERE question_id = ${qid}`
	const up = Number(agg.rows[0]?.up ?? 0)
	const down = Number(agg.rows[0]?.down ?? 0)
	const updated = await sql`UPDATE questions SET upvotes = ${up}, downvotes = ${down} WHERE id = ${qid} RETURNING *`

	const role = session?.user?.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"
	return NextResponse.json({ ok: true, question: toPublicQuestion(updated.rows[0], isAdmin), myVote })
}
