import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureCommunityTables } from "@/lib/community/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/reviews/mine
// Trả về các bài đánh giá LỊCH SỪ của chính người đang đăng nhập.
// Dùng cho Tab cá nhân. Khi đăng nhập lại đúng tài khoản Google, user_id
// (Google sub) không đổi nên sẽ thấy lại đầy đủ review cũ.
// =============================================================
export async function GET() {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
	}

	try {
		await ensureCommunityTables()
		const res = await sql`
			SELECT id, university_id, rating, content, created_at
			FROM reviews
			WHERE user_id = ${user.id}
			ORDER BY created_at DESC
		`
		return NextResponse.json({
			ok: true,
			count: res.rows.length,
			reviews: res.rows.map((r) => ({
				id: r.id,
				universityId: r.university_id,
				rating: r.rating,
				content: r.content,
				createdAt: r.created_at,
			})),
		})
	} catch (err) {
		console.error("[reviews/mine][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
