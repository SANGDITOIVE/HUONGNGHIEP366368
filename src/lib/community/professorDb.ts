// =============================================================
// LỚP DỮ LIỆU "ĐÁNH GIÁ GIẢNG VIÊN" (tách riêng, không đụng community/db.ts).
// Tự tạo bảng nếu chưa có (idempotent) — an toàn khi deploy lần đầu.
// Xem đặc tả SQL đầy đủ ở scripts/professor-reviews-schema.sql.
// =============================================================
import { sql } from "@vercel/postgres"
import { slugifyVi } from "@/lib/schools/resolve"

export { sql, slugifyVi }

let ensured = false

/** CREATE IF NOT EXISTS 2 bảng mới. Mỗi statement chạy riêng (template tag sql). */
export async function ensureProfessorTables(): Promise<void> {
	if (ensured) return

	await sql`
		CREATE TABLE IF NOT EXISTS professor_reviews (
			id                      SERIAL PRIMARY KEY,
			professor_name          VARCHAR(160) NOT NULL,
			professor_slug          VARCHAR(180) NOT NULL,
			school_id               VARCHAR(100) NOT NULL,
			subject                 VARCHAR(160),
			rating_easy_to_pass     INT NOT NULL CHECK (rating_easy_to_pass BETWEEN 1 AND 5),
			rating_fair_grading     INT NOT NULL CHECK (rating_fair_grading BETWEEN 1 AND 5),
			rating_clear_teaching   INT NOT NULL CHECK (rating_clear_teaching BETWEEN 1 AND 5),
			rating_bonus_points     BOOLEAN NOT NULL DEFAULT FALSE,
			rating_attendance_check BOOLEAN NOT NULL DEFAULT FALSE,
			tip_text                TEXT,
			is_anonymous            BOOLEAN NOT NULL DEFAULT FALSE,
			user_id                 TEXT,
			author_name             TEXT,
			verified_student        BOOLEAN NOT NULL DEFAULT FALSE,
			upvotes                 INT NOT NULL DEFAULT 0,
			downvotes               INT NOT NULL DEFAULT 0,
			trust_score             INT NOT NULL DEFAULT 0,
			created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_prof_reviews_school ON professor_reviews (school_id)`
	await sql`CREATE INDEX IF NOT EXISTS idx_prof_reviews_slug ON professor_reviews (professor_slug)`
	await sql`CREATE INDEX IF NOT EXISTS idx_prof_reviews_school_slug ON professor_reviews (school_id, professor_slug)`

	await sql`
		CREATE TABLE IF NOT EXISTS professor_review_votes (
			review_id  INT NOT NULL REFERENCES professor_reviews(id) ON DELETE CASCADE,
			user_id    TEXT NOT NULL,
			value      SMALLINT NOT NULL CHECK (value IN (-1, 1)),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (review_id, user_id)
		)
	`

	ensured = true
}

/**
 * trust_score = upvotes - downvotes, cộng thêm +2 nếu là sinh viên đã xác minh
 * (thưởng độ tin cậy). Tính lại mỗi lần có phiếu bầu mới.
 */
export function computeTrustScore(
	upvotes: number,
	downvotes: number,
	verified: boolean,
): number {
	const up = Number.isFinite(upvotes) ? Math.trunc(upvotes) : 0
	const down = Number.isFinite(downvotes) ? Math.trunc(downvotes) : 0
	return up - down + (verified ? 2 : 0)
}

// ---------- Kiểu dữ liệu công khai (ĐÃ ẩn email; ẩn tên nếu anonymous) ----------
export interface PublicProfessorReview {
	id: number
	professorName: string
	professorSlug: string
	schoolId: string
	subject: string | null
	ratingEasyToPass: number
	ratingFairGrading: number
	ratingClearTeaching: number
	bonusPoints: boolean
	attendanceCheck: boolean
	tipText: string | null
	isAnonymous: boolean
	authorName: string | null
	verifiedStudent: boolean
	upvotes: number
	downvotes: number
	trustScore: number
	createdAt: string
}

/** Map 1 row DB -> object công khai an toàn. */
export function toPublicReview(r: Record<string, any>): PublicProfessorReview {
	const anon = Boolean(r.is_anonymous)
	return {
		id: Number(r.id),
		professorName: r.professor_name,
		professorSlug: r.professor_slug,
		schoolId: r.school_id,
		subject: r.subject ?? null,
		ratingEasyToPass: Number(r.rating_easy_to_pass),
		ratingFairGrading: Number(r.rating_fair_grading),
		ratingClearTeaching: Number(r.rating_clear_teaching),
		bonusPoints: Boolean(r.rating_bonus_points),
		attendanceCheck: Boolean(r.rating_attendance_check),
		tipText: r.tip_text ?? null,
		isAnonymous: anon,
		authorName: anon ? null : (r.author_name ?? null),
		verifiedStudent: Boolean(r.verified_student),
		upvotes: Number(r.upvotes ?? 0),
		downvotes: Number(r.downvotes ?? 0),
		trustScore: Number(r.trust_score ?? 0),
		createdAt: r.created_at,
	}
}
