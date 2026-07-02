import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import {
	sql,
	slugifyVi,
	ensureProfessorTables,
	computeTrustScore,
	toPublicReview,
	type PublicProfessorReview,
} from "@/lib/community/professorDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/reviews/professor?school_id=X&professor=Y
// - Không có professor => trả toàn bộ review của trường + danh sách giảng viên
//   (gom nhóm, kèm điểm trung bình) cho trang list.
// - Có professor (tên hoặc slug) => trả review của riêng giảng viên đó.
// Chỉ trả tên hiển thị (ẩn nếu anonymous), KHÔNG bao giờ trả email.
// =============================================================
export async function GET(req: NextRequest) {
	const { searchParams } = new URL(req.url)
	const schoolId = (searchParams.get("school_id") ?? "").trim().slice(0, 100)
	const professor = (searchParams.get("professor") ?? "").trim()

	if (!schoolId) {
		return NextResponse.json({ ok: false, error: "MISSING_SCHOOL_ID" }, { status: 400 })
	}

	try {
		await ensureProfessorTables()

		let rows: Array<Record<string, unknown>>
		if (professor) {
			const slug = slugifyVi(professor)
			const res = await sql`
				SELECT * FROM professor_reviews
				WHERE school_id = ${schoolId} AND professor_slug = ${slug}
				ORDER BY trust_score DESC, created_at DESC
			`
			rows = res.rows
		} else {
			const res = await sql`
				SELECT * FROM professor_reviews
				WHERE school_id = ${schoolId}
				ORDER BY trust_score DESC, created_at DESC
			`
			rows = res.rows
		}

		const reviews: PublicProfessorReview[] = rows.map(toPublicReview)

		// Gom nhóm theo giảng viên (cho trang list của 1 trường).
		const byProf = new Map<string, {
			professorName: string
			professorSlug: string
			subjects: Set<string>
			count: number
			sumOverall: number
		}>()
		for (const rv of reviews) {
			const g = byProf.get(rv.professorSlug) ?? {
				professorName: rv.professorName,
				professorSlug: rv.professorSlug,
				subjects: new Set<string>(),
				count: 0,
				sumOverall: 0,
			}
			if (rv.subject) g.subjects.add(rv.subject)
			g.count += 1
			g.sumOverall += (rv.ratingEasyToPass + rv.ratingFairGrading + rv.ratingClearTeaching) / 3
			byProf.set(rv.professorSlug, g)
		}

		const professors = Array.from(byProf.values())
			.map((g) => ({
				professorName: g.professorName,
				professorSlug: g.professorSlug,
				subjects: Array.from(g.subjects),
				reviewCount: g.count,
				averageOverall: Math.round((g.sumOverall / Math.max(g.count, 1)) * 10) / 10,
			}))
			.sort((a, b) => b.reviewCount - a.reviewCount)

		return NextResponse.json({ ok: true, schoolId, count: reviews.length, professors, reviews })
	} catch (err) {
		console.error("[professor-reviews][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}

// =============================================================
// POST /api/reviews/professor
// Body: { professorName, schoolId, subject?, ratingEasyToPass, ratingFairGrading,
//         ratingClearTeaching, bonusPoints?, attendanceCheck?, tipText?, isAnonymous? }
// Cho phép đăng ảnh danh (user_id = null). Nếu đăng nhập Google thật & không
// ẩn danh => verified_student = true (xem ghi chú bên dưới).
// =============================================================
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}

	const b = (body ?? {}) as Record<string, unknown>
	const professorName = String(b.professorName ?? b.professor_name ?? "").trim().slice(0, 160)
	const schoolId = String(b.schoolId ?? b.school_id ?? "").trim().slice(0, 100)
	const subject = String(b.subject ?? "").trim().slice(0, 160) || null
	const easy = Number(b.ratingEasyToPass ?? b.rating_easy_to_pass)
	const fair = Number(b.ratingFairGrading ?? b.rating_fair_grading)
	const clear = Number(b.ratingClearTeaching ?? b.rating_clear_teaching)
	const bonus = Boolean(b.bonusPoints ?? b.rating_bonus_points ?? false)
	const attendance = Boolean(b.attendanceCheck ?? b.rating_attendance_check ?? false)
	const tip = String(b.tipText ?? b.tip_text ?? "").trim().slice(0, 4000) || null
	const isAnonymous = Boolean(b.isAnonymous ?? b.is_anonymous ?? false)

	const inRange = (n: number) => Number.isInteger(n) && n >= 1 && n <= 5
	if (!professorName || !schoolId || !inRange(easy) || !inRange(fair) || !inRange(clear)) {
		return NextResponse.json(
			{
				ok: false,
				error: "VALIDATION_FAILED",
				message: "Thiếu tên giảng viên/trường hoặc điểm sao không hợp lệ (1–5).",
			},
			{ status: 422 },
		)
	}

	// Danh tính: user_id = Google sub (null nếu ẩn danh hoặc chưa đăng nhập).
	const userId = user?.id ?? null
	// "Sinh viên đã xác minh": hiện CHƯА có hệ thống xác minh trường học riêng,
	// nên tạm quy ước = có đăng nhập Google THẬT và KHÔNG chọn ẩn danh.
	const verified = !!userId && !isAnonymous
	const authorName = isAnonymous ? null : (user?.name ?? null)
	const slug = slugifyVi(professorName)
	const trust = computeTrustScore(0, 0, verified)

	try {
		await ensureProfessorTables()
		const inserted = await sql`
			INSERT INTO professor_reviews
				(professor_name, professor_slug, school_id, subject,
				 rating_easy_to_pass, rating_fair_grading, rating_clear_teaching,
				 rating_bonus_points, rating_attendance_check, tip_text,
				 is_anonymous, user_id, author_name, verified_student,
				 upvotes, downvotes, trust_score)
			VALUES
				(${professorName}, ${slug}, ${schoolId}, ${subject},
				 ${easy}, ${fair}, ${clear},
				 ${bonus}, ${attendance}, ${tip},
				 ${isAnonymous}, ${userId}, ${authorName}, ${verified},
				 0, 0, ${trust})
			RETURNING *
		`
		return NextResponse.json(
			{ ok: true, review: toPublicReview(inserted.rows[0]) },
			{ status: 201 },
		)
	} catch (err) {
		console.error("[professor-reviews][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
