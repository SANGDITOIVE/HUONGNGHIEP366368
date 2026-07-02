import { NextResponse } from "next/server"
import { sql, ensureCommunityTables } from "@/lib/community/db"
import { getAdminContext } from "@/lib/community/serverAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/admin/activity  (chỉ ADMIN)
// Luồng hoạt động: gộp review + comment, sắp xếp mới nhất lên trước.
// =============================================================
export async function GET() {
	const ctx = await getAdminContext()
	if (!ctx.isAdmin) {
		return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
	}

	try {
		await ensureCommunityTables()
		const reviewsRes = await sql`
			SELECT id, university_id, author_name, author_image, rating, content, created_at
			FROM reviews
			ORDER BY created_at DESC
			LIMIT 100
		`
		const commentsRes = await sql`
			SELECT c.id, c.review_id, c.author_name, c.author_image, c.content, c.created_at, r.university_id
			FROM review_comments c
			JOIN reviews r ON r.id = c.review_id
			ORDER BY c.created_at DESC
			LIMIT 100
		`

		const feed = [
			...reviewsRes.rows.map((r) => ({
				type: "review" as const,
				id: r.id,
				universityId: r.university_id,
				authorName: r.author_name ?? "Người dùng ẩn danh",
				authorImage: r.author_image ?? null,
				rating: r.rating as number,
				content: r.content as string,
				createdAt: r.created_at as string,
			})),
			...commentsRes.rows.map((c) => ({
				type: "comment" as const,
				id: c.id,
				reviewId: c.review_id as number,
				universityId: c.university_id,
				authorName: c.author_name ?? "Người dùng ẩn danh",
				authorImage: c.author_image ?? null,
				content: c.content as string,
				createdAt: c.created_at as string,
			})),
		].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

		return NextResponse.json({ ok: true, count: feed.length, feed })
	} catch (err) {
		console.error("[admin/activity][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
