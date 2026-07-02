import { NextResponse, type NextRequest } from "next/server"
import { sql } from "@vercel/postgres"
import { isValidSurveyPayload } from "@/lib/survey/shared"

// Ghi DB => chạy trên Node runtime, không cache.
export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * Tự tạo bảng nếu chưa có (an toàn khi deploy lần đầu).
 * Bạn cũng có thể chạy tay file scripts/create-surveys-table.sql.
 */
async function ensureTable() {
	await sql`
		CREATE TABLE IF NOT EXISTS surveys (
			id             SERIAL PRIMARY KEY,
			full_name      TEXT        NOT NULL,
			location       TEXT,
			birth_year     INTEGER,
			phone_zalo     TEXT,
			email          TEXT,
			target_goal    TEXT,
			favorite_field TEXT,
			score_target   TEXT,
			priority       TEXT,
			created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
		)
	`
}

function parseBirthYear(raw: unknown): number | null {
	const digits = String(raw ?? "").replace(/\D/g, "")
	if (!digits) return null
	const n = Number(digits)
	return n >= 1900 && n <= 2100 ? n : null
}

/**
 * POST /api/survey
 * Nhận dữ liệu Form khảo sát và INSERT vào bảng surveys (Vercel Postgres).
 * Body: SurveyPayload (xem src/lib/survey/shared.ts)
 */
export async function POST(req: NextRequest) {
	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}

	if (!isValidSurveyPayload(body)) {
		return NextResponse.json(
			{ ok: false, error: "VALIDATION_FAILED", message: "Thiếu họ tên hoặc thông tin liên hệ." },
			{ status: 422 },
		)
	}

	// Chuẩn hóa dữ liệu trước khi ghi.
	const fullName = String(body.name).trim().slice(0, 120)
	const location = String(body.place ?? "").trim().slice(0, 160) || null
	const birthYear = parseBirthYear(body.birthYear)
	const phoneZalo = String(body.phone ?? "").trim().slice(0, 24) || null
	const email = String(body.email ?? "").trim().slice(0, 160) || null
	const answers = (body.answers ?? {}) as Record<string, string>
	const targetGoal = answers["huong-di"] ?? null
	const favoriteField = answers["khoi-nganh"] ?? null
	const scoreTarget = answers["muc-diem"] ?? null
	const priority = answers["tieu-chi"] ?? null

	try {
		await ensureTable()
		const result = await sql`
			INSERT INTO surveys
				(full_name, location, birth_year, phone_zalo, email, target_goal, favorite_field, score_target, priority)
			VALUES
				(${fullName}, ${location}, ${birthYear}, ${phoneZalo}, ${email}, ${targetGoal}, ${favoriteField}, ${scoreTarget}, ${priority})
			RETURNING id, created_at
		`
		const row = result.rows[0]
		return NextResponse.json(
			{ ok: true, id: row?.id, createdAt: row?.created_at },
			{ status: 201 },
		)
	} catch (err) {
		console.error("[survey] insert failed", err)
		return NextResponse.json(
			{ ok: false, error: "DB_ERROR", message: "Không ghi được vào cơ sở dữ liệu." },
			{ status: 500 },
		)
	}
}

/**
 * GET /api/survey  (dành cho Admin)
 * Bảo vệ bằng header: x-admin-token === process.env.ADMIN_TOKEN
 * Trả về danh sách khảo sát mới nhất để quản lý/marketing.
 */
export async function GET(req: NextRequest) {
	const token = process.env.ADMIN_TOKEN
	if (!token) {
		return NextResponse.json(
			{ ok: false, error: "ADMIN_TOKEN_NOT_SET", message: "Hãy đặt ADMIN_TOKEN trong Environment Variables." },
			{ status: 501 },
		)
	}
	if (req.headers.get("x-admin-token") !== token) {
		return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
	}

	const { searchParams } = new URL(req.url)
	const limit = Math.min(Math.max(Number(searchParams.get("limit")) || 100, 1), 1000)

	try {
		await ensureTable()
		const result = await sql`
			SELECT id, full_name, location, birth_year, phone_zalo, email,
			       target_goal, favorite_field, score_target, priority, created_at
			FROM surveys
			ORDER BY created_at DESC
			LIMIT ${limit}
		`
		return NextResponse.json({ ok: true, count: result.rows.length, items: result.rows })
	} catch (err) {
		console.error("[survey] list failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
