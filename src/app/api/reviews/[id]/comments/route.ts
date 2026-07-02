import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureCommunityTables } from "@/lib/community/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// POST /api/reviews/[id]/comments  { content }
// Thêm bình luận phản biện dưới 1 bài review. Bắt buộc đăng nhập.
// =============================================================
export async function POST(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để phản biện." },
			{ status: 401 },
		)
	}

	const reviewId = Number(params.id)
	if (!Number.isInteger(reviewId) || reviewId <= 0) {
		return NextResponse.json({ ok: false, error: "INVALID_REVIEW_ID" }, { status: 400 })
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}
	const text = String((body as { content?: string })?.content ?? "").trim()
	if (!text) {
		return NextResponse.json(
			{ ok: false, error: "VALIDATION_FAILED", message: "Nội dung phản biện không được để trống." },
			{ status: 422 },
		)
	}

	try {
		await ensureCommunityTables()
		// Đảm bảo review tồn tại (tránh comment mồ côi)
		const exists = await sql`SELECT 1 FROM reviews WHERE id = ${reviewId} LIMIT 1`
		if (exists.rows.length === 0) {
			return NextResponse.json({ ok: false, error: "REVIEW_NOT_FOUND" }, { status: 404 })
		}
		const inserted = await sql`
			INSERT INTO review_comments (review_id, user_id, author_name, author_image, content)
			VALUES (${reviewId}, ${user.id}, ${user.name ?? null}, ${user.image ?? null}, ${text.slice(0, 2000)})
			RETURNING id, created_at
		`
		return NextResponse.json(
			{
				ok: true,
				comment: {
					id: inserted.rows[0]?.id,
					reviewId,
					authorName: user.name ?? "Người dùng ẩn danh",
					authorImage: user.image ?? null,
					content: text,
					createdAt: inserted.rows[0]?.created_at,
				},
			},
			{ status: 201 },
		)
	} catch (err) {
		console.error("[comments][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
