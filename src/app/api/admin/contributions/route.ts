import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureCommunityTables } from "@/lib/community/db"
import { getAdminContext } from "@/lib/community/serverAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/admin/contributions  (chỉ ADMIN)
// Trả về toàn bộ đóng góp đang ở trạng thái PENDING để hiển thị trên
// Admin Dashboard. Người không phải admin → 403.
// =============================================================
export async function GET() {
	const ctx = await getAdminContext()
	if (!ctx.isAdmin) {
		return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
	}

	try {
		await ensureCommunityTables()
		const res = await sql`
			SELECT id, university_id, user_id, author_name, field_name, old_value, new_value, status, created_at
			FROM contributions
			WHERE status = 'PENDING'
			ORDER BY created_at ASC
		`
		return NextResponse.json({
			ok: true,
			count: res.rows.length,
			items: res.rows.map((r) => ({
				id: r.id,
				universityId: r.university_id,
				authorName: r.author_name ?? "Người dùng ẩn danh",
				fieldName: r.field_name,
				oldValue: r.old_value,
				newValue: r.new_value,
				status: r.status,
				createdAt: r.created_at,
			})),
		})
	} catch (err) {
		console.error("[admin/contributions][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
