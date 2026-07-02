import { NextResponse } from "next/server"
import { sql, ensureCommunityTables } from "@/lib/community/db"
import { getAdminContext } from "@/lib/community/serverAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/admin/universities  (chỉ ADMIN)
// Trả về các cơ sở đào tạo do cộng đồng đề xuất đang chờ duyệt (PENDING),
// mới nhất lên đầu, để hiển thị trong phân khu "Duyệt Cơ Sở Đào Tạo Mới".
// =============================================================
export async function GET() {
	const ctx = await getAdminContext()
	if (!ctx.isAdmin) {
		return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
	}

	try {
		await ensureCommunityTables()
		const res = await sql`
			SELECT id, slug, name, code, address, website, nganh_tieu_bieu, region, he_dao_tao, author_name, created_at
			FROM universities
			WHERE status = 'PENDING'
			ORDER BY created_at DESC
		`
		return NextResponse.json({
			ok: true,
			count: res.rows.length,
			items: res.rows.map((r) => ({
				id: r.id,
				slug: r.slug,
				name: r.name,
				code: r.code ?? "",
				address: r.address ?? "",
				website: r.website ?? "",
				nganhTieuBieu: r.nganh_tieu_bieu ?? "",
				region: r.region ?? "bac",
				heDaoTao: r.he_dao_tao ?? "dai-hoc",
				authorName: r.author_name ?? "Người dùng ẩn danh",
				createdAt: r.created_at,
			})),
		})
	} catch (err) {
		console.error("[admin/universities][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
