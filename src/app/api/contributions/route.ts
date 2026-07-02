import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureCommunityTables } from "@/lib/community/db"
import { isValidContributionField } from "@/lib/community/constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// POST /api/contributions  { universityId, fieldName, oldValue?, newValue }
// Tiếp nhận đề xuất sửa/bổ sung thông tin trường. Bắt buộc đăng nhập.
// Lưu vào public.contributions với status mặc định = 'PENDING'.
// =============================================================
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để đóng góp thông tin." },
			{ status: 401 },
		)
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}

	const { universityId, fieldName, oldValue, newValue } = (body ?? {}) as {
		universityId?: string
		fieldName?: string
		oldValue?: string | null
		newValue?: string
	}

	const uid = String(universityId ?? "").trim().slice(0, 100)
	const field = String(fieldName ?? "").trim()
	const newVal = String(newValue ?? "").trim()
	const oldVal = oldValue == null ? null : String(oldValue).slice(0, 8000)

	if (!uid || !newVal) {
		return NextResponse.json(
			{ ok: false, error: "VALIDATION_FAILED", message: "Thiếu trường hoặc nội dung đề xuất." },
			{ status: 422 },
		)
	}
	if (!isValidContributionField(field)) {
		return NextResponse.json(
			{ ok: false, error: "INVALID_FIELD", message: "Mục dữ liệu không hợp lệ." },
			{ status: 422 },
		)
	}

	try {
		await ensureCommunityTables()
		const inserted = await sql`
			INSERT INTO contributions (university_id, user_id, author_name, field_name, old_value, new_value, status)
			VALUES (${uid}, ${user.id}, ${user.name ?? null}, ${field}, ${oldVal}, ${newVal.slice(0, 8000)}, 'PENDING')
			RETURNING id, created_at
		`
		return NextResponse.json(
			{
				ok: true,
				id: inserted.rows[0]?.id,
				status: "PENDING",
				message: "Cảm ơn bạn! Đóng góp đã được gửi và đang chờ quản trị viên duyệt.",
			},
			{ status: 201 },
		)
	} catch (err) {
		console.error("[contributions][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
