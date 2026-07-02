import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureCommunityTables, ensureGeoTables } from "@/lib/community/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// HỒ SƠ TÀI KHOẢN (tên người dùng) — LƯU Ở SERVER theo Google user_id (sub).
// Nhờ lưu ở máy chủ (không phải localStorage từng máy), đăng nhập cùng một
// tài khoản Google trên ĐIỆN THOẠI hay MÁY TÍNH đều thấy cùng tên & trạng thái.
//
//   GET  /api/profile             -> { ok, account: { username, email, linkedAt } | null }
//   POST /api/profile { username } -> upsert -> { ok, account }
// =============================================================

export async function GET() {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
	}
	try {
		await ensureGeoTables()
		const res = await sql`
			SELECT username, email, created_at, province_code
			FROM user_profiles
			WHERE user_id = ${user.id}
			LIMIT 1
		`
		if (res.rows.length === 0) {
			return NextResponse.json({ ok: true, account: null })
		}
		const row = res.rows[0]
		return NextResponse.json({
			ok: true,
			account: {
				username: row.username,
				email: row.email ?? user.email ?? null,
				linkedAt: row.created_at,
				provinceCode: row.province_code ?? null,
			},
		})
	} catch (err) {
		console.error("[profile][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để tạo tài khoản." },
			{ status: 401 },
		)
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}
	const username = String((body as { username?: string })?.username ?? "").trim().slice(0, 80)
	if (username.length < 2) {
		return NextResponse.json(
			{ ok: false, error: "VALIDATION_FAILED", message: "Tên người dùng cần ít nhất 2 ký tự." },
			{ status: 422 },
		)
	}

	try {
		await ensureCommunityTables()
		const res = await sql`
			INSERT INTO user_profiles (user_id, email, username, updated_at)
			VALUES (${user.id}, ${user.email ?? null}, ${username}, CURRENT_TIMESTAMP)
			ON CONFLICT (user_id) DO UPDATE
				SET username = EXCLUDED.username,
				    email = EXCLUDED.email,
				    updated_at = CURRENT_TIMESTAMP
			RETURNING username, email, created_at
		`
		const row = res.rows[0]
		return NextResponse.json({
			ok: true,
			account: {
				username: row.username,
				email: row.email ?? user.email ?? null,
				linkedAt: row.created_at,
			},
		})
	} catch (err) {
		console.error("[profile][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}

// =============================================================
// PATCH /api/profile { provinceCode } -> cập nhật tỉnh/thành để cá nhân hoá.
// Không bắt buộc đã đặt username: nếu chưa có hồ sơ, tạo mới với tên tạm
// (suy ra từ email) để thoả ràng buộc NOT NULL; nếu đã có thì giữ nguyên tên.
// provinceCode = null để xoá lựa chọn.
// =============================================================
export async function PATCH(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}

	const raw = (body as { provinceCode?: unknown })?.provinceCode
	const provinceCode = raw === null || raw === undefined || raw === "" ? null : String(raw).trim().slice(0, 20)
	const fallbackName = (user.email ?? "").split("@")[0]?.slice(0, 80) || "Bạn"

	try {
		await ensureGeoTables()
		const res = await sql`
			INSERT INTO user_profiles (user_id, email, username, province_code, updated_at)
			VALUES (${user.id}, ${user.email ?? null}, ${fallbackName}, ${provinceCode}, CURRENT_TIMESTAMP)
			ON CONFLICT (user_id) DO UPDATE
				SET province_code = EXCLUDED.province_code,
				    updated_at = CURRENT_TIMESTAMP
			RETURNING username, email, created_at, province_code
		`
		const row = res.rows[0]
		return NextResponse.json({
			ok: true,
			account: {
				username: row.username,
				email: row.email ?? user.email ?? null,
				linkedAt: row.created_at,
				provinceCode: row.province_code ?? null,
			},
		})
	} catch (err) {
		console.error("[profile][PATCH] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
