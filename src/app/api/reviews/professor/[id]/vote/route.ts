import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import {
	sql,
	ensureProfessorTables,
	computeTrustScore,
	toPublicReview,
} from "@/lib/community/professorDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// POST /api/reviews/professor/[id]/vote   Body: { direction: "up" | "down" }
// -------------------------------------------------------------
// GHI CHÚ: đặt dưới namespace /professor/ (thay vì /api/reviews/[id]/vote) để
// TRÁNH đụng id với hệ review TRƯỜNG cũ (bảng `reviews`) — hai bảng có id riêng.
//
// Bắt buộc đăng nhập. Mỗi user chỉ 1 phiếu/review (bảng professor_review_votes,
// PRIMARY KEY (review_id, user_id)). Bấm lại cùng chiều = gỡ phiếu (toggle).
// upvotes/downvotes/trust_score được TÍNH LẠI từ bảng phiếu (nguồn sự thật).
// =============================================================
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để bình chọn." },
			{ status: 401 },
		)
	}

	const reviewId = Number(params.id)
	if (!Number.isInteger(reviewId) || reviewId <= 0) {
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}
	const dir = String((body as Record<string, unknown>)?.direction ?? "").toLowerCase()
	const value = dir === "up" ? 1 : dir === "down" ? -1 : 0
	if (value === 0) {
		return NextResponse.json(
			{ ok: false, error: "INVALID_DIRECTION", message: "direction phải là 'up' hoặc 'down'." },
			{ status: 422 },
		)
	}

	try {
		await ensureProfessorTables()

		// Đảm bảo review tồn tại trước khi ghi phiếu.
		const verRes = await sql`SELECT verified_student FROM professor_reviews WHERE id = ${reviewId} LIMIT 1`
		if (verRes.rows.length === 0) {
			return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })
		}

		const existingRes = await sql`
			SELECT value FROM professor_review_votes
			WHERE review_id = ${reviewId} AND user_id = ${userId} LIMIT 1
		`
		const existing = existingRes.rows[0]?.value as number | undefined

		if (existing === value) {
			// Bấm lại cùng chiều => gỡ phiếu.
			await sql`DELETE FROM professor_review_votes WHERE review_id = ${reviewId} AND user_id = ${userId}`
		} else if (existing === undefined) {
			await sql`INSERT INTO professor_review_votes (review_id, user_id, value) VALUES (${reviewId}, ${userId}, ${value})`
		} else {
			await sql`UPDATE professor_review_votes SET value = ${value} WHERE review_id = ${reviewId} AND user_id = ${userId}`
		}

		// Tính lại số phiếu từ bảng votes.
		const agg = await sql`
			SELECT
				COALESCE(SUM(CASE WHEN value = 1 THEN 1 ELSE 0 END), 0)::int AS up,
				COALESCE(SUM(CASE WHEN value = -1 THEN 1 ELSE 0 END), 0)::int AS down
			FROM professor_review_votes WHERE review_id = ${reviewId}
		`
		const up = Number(agg.rows[0]?.up ?? 0)
		const down = Number(agg.rows[0]?.down ?? 0)
		const verified = Boolean(verRes.rows[0].verified_student)
		const trust = computeTrustScore(up, down, verified)

		const updated = await sql`
			UPDATE professor_reviews
			SET upvotes = ${up}, downvotes = ${down}, trust_score = ${trust}
			WHERE id = ${reviewId}
			RETURNING *
		`

		const myVote = existing === value ? 0 : value
		return NextResponse.json({ ok: true, review: toPublicReview(updated.rows[0]), myVote })
	} catch (err) {
		console.error("[professor-reviews][vote] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
