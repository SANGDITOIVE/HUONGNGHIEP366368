import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import {
	sql,
	ensureCommunityTables,
	type PublicReview,
	type PublicComment,
} from "@/lib/community/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/reviews?universityId=hust
// Trả về toàn bộ review của 1 trường + bình luận phản biện của từng bài,
// kèm điểm trung bình (dynamic aggregate). CHỈ trả name + image — KHÔNG
// bao giờ trả email/phone (privacy preserving).
// =============================================================
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const universityId = (searchParams.get("universityId") ?? "").trim()
	if (!universityId) {
		return NextResponse.json(
			{ ok: false, error: "MISSING_UNIVERSITY_ID" },
			{ status: 400 },
		)
	}

	try {
		await ensureCommunityTables()

		// 1) Các bài review (chỉ các cột an toàn)
		const reviewsRes = await sql`
			SELECT id, university_id, author_name, author_image, rating, content, created_at
			FROM reviews
			WHERE university_id = ${universityId}
			ORDER BY created_at DESC
		`

		// 2) Comment của các review đó (JOIN theo university để lấy 1 lần)
		const commentsRes = await sql`
			SELECT c.id, c.review_id, c.author_name, c.author_image, c.content, c.created_at
			FROM review_comments c
			JOIN reviews r ON r.id = c.review_id
			WHERE r.university_id = ${universityId}
			ORDER BY c.created_at ASC
		`

		// 3) Điểm trung bình + số lượt (tính trực tiếp từ DB mỗi lần đọc)
		const aggRes = await sql`
			SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS average
			FROM reviews
			WHERE university_id = ${universityId}
		`

		// Gom comment theo review_id
		const commentsByReview = new Map<number, PublicComment[]>()
		for (const c of commentsRes.rows) {
			const list = commentsByReview.get(c.review_id) ?? []
			list.push({
				id: c.id,
				reviewId: c.review_id,
				authorName: c.author_name ?? "Người dùng ẩn danh",
				authorImage: c.author_image ?? null,
				content: c.content,
				createdAt: c.created_at,
			})
			commentsByReview.set(c.review_id, list)
		}

		const reviews: PublicReview[] = reviewsRes.rows.map((r) => ({
			id: r.id,
			universityId: r.university_id,
			authorName: r.author_name ?? "Người dùng ẩn danh",
			authorImage: r.author_image ?? null,
			rating: r.rating,
			content: r.content,
			createdAt: r.created_at,
			comments: commentsByReview.get(r.id) ?? [],
		}))

		const agg = aggRes.rows[0] ?? { count: 0, average: 0 }
		return NextResponse.json({
			ok: true,
			universityId,
			average: Math.round((agg.average ?? 0) * 10) / 10,
			count: agg.count ?? 0,
			reviews,
		})
	} catch (err) {
		console.error("[reviews][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}

// =============================================================
// POST /api/reviews  { universityId, rating, content }
// Bắt buộc đăng nhập (getServerSession). Chưa đăng nhập → 401.
// =============================================================
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để viết đánh giá." },
			{ status: 401 },
		)
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}

	const { universityId, rating, content } = (body ?? {}) as {
		universityId?: string
		rating?: number
		content?: string
	}

	const uid = String(universityId ?? "").trim().slice(0, 100)
	const ratingNum = Number(rating)
	const text = String(content ?? "").trim()

	if (!uid || !text || !Number.isInteger(ratingNum) || ratingNum < 1 || ratingNum > 5) {
		return NextResponse.json(
			{ ok: false, error: "VALIDATION_FAILED", message: "Thiếu trường, nội dung hoặc số sao không hợp lệ (1–5)." },
			{ status: 422 },
		)
	}

	try {
		await ensureCommunityTables()
		const inserted = await sql`
			INSERT INTO reviews (university_id, user_id, author_name, author_image, rating, content)
			VALUES (${uid}, ${user.id}, ${user.name ?? null}, ${user.image ?? null}, ${ratingNum}, ${text.slice(0, 4000)})
			RETURNING id, created_at
		`
		// Tính lại điểm trung bình ngay sau khi thêm (dynamic aggregate)
		const aggRes = await sql`
			SELECT COUNT(*)::int AS count, COALESCE(AVG(rating), 0)::float AS average
			FROM reviews WHERE university_id = ${uid}
		`
		const agg = aggRes.rows[0] ?? { count: 0, average: 0 }
		return NextResponse.json(
			{
				ok: true,
				id: inserted.rows[0]?.id,
				average: Math.round((agg.average ?? 0) * 10) / 10,
				count: agg.count ?? 0,
			},
			{ status: 201 },
		)
	} catch (err) {
		console.error("[reviews][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
