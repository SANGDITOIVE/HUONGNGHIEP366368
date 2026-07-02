import { NextResponse, type NextRequest } from "next/server"
import { sql, ensureCommunityTables } from "@/lib/community/db"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/universities/[id]/overrides
// Trả về các dữ liệu đã được admin DUYỆT cho 1 trường (để client merge
// lên dữ liệu tĩnh gốc → hiển thị thông tin do cộng đồng đóng góp).
// =============================================================
export async function GET(
	_req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const universityId = (params.id ?? "").trim()
	if (!universityId) {
		return NextResponse.json({ ok: false, error: "MISSING_ID" }, { status: 400 })
	}

	try {
		await ensureCommunityTables()
		const res = await sql`
			SELECT field_name, value, updated_at
			FROM university_overrides
			WHERE university_id = ${universityId}
			ORDER BY updated_at DESC
		`
		const overrides: Record<string, { value: string; updatedAt: string }> = {}
		for (const r of res.rows) {
			if (!(r.field_name in overrides)) {
				overrides[r.field_name] = { value: r.value, updatedAt: r.updated_at }
			}
		}
		return NextResponse.json({ ok: true, universityId, overrides })
	} catch (err) {
		console.error("[universities/:id/overrides][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR", overrides: {} }, { status: 500 })
	}
}
