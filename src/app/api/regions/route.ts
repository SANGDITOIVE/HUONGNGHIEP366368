import { NextResponse } from "next/server"
import {
	PROVINCES,
	ECONOMIC_ZONES,
	INDUSTRIES,
	REGIONAL_DEMAND_SEED,
	GEO_DATA_VERSION,
} from "@/data/geo"
import { seedGeoData, sql } from "@/lib/community/db"

// Luôn chạy động để có thể đọc demand mới nhất từ DB khi có.
export const dynamic = "force-dynamic"

type DemandRow = {
	provinceCode: string
	industry: string
	demandScore: number
	jobOpenings: number
}

/**
 * GET /api/regions
 * Trả về toàn bộ danh mục địa lý để client cache 1 lần (Phần 2).
 * - provinces: 63 tỉnh + toạ độ + ngành trọng điểm.
 * - zones: khu kinh tế / cơ quan / chủ quyền biển đảo.
 * - industries: danh mục ngành (mã + nhãn + màu + icon).
 * - demand: nhu cầu nhân lực theo ngành/tỉnh (ưu tiên DB, fallback seed tĩnh).
 *
 * Dữ liệu tĩnh luôn sẵn sàng nên API không bao giờ 500 vì DB; nếu DB lỗi
 * hoặc chưa cấu hình, tự động dùng seed tĩnh.
 */
export async function GET() {
	let demand: DemandRow[] = REGIONAL_DEMAND_SEED.map((d) => ({
		provinceCode: d.provinceCode,
		industry: d.industry,
		demandScore: d.demandScore,
		jobOpenings: d.jobOpenings,
	}))

	try {
		// Đảm bảo bảng tồn tại + seed (idempotent) rồi đọc lại từ DB.
		await seedGeoData()
		const res = await sql`
			SELECT province_code, industry_name, demand_score, job_openings_count
			FROM regional_career_demand
		`
		if (res.rows.length > 0) {
			demand = res.rows.map((r) => ({
				provinceCode: String(r.province_code),
				industry: String(r.industry_name),
				demandScore: Number(r.demand_score),
				jobOpenings: Number(r.job_openings_count ?? 0),
			}))
		}
	} catch (err) {
		console.error("[/api/regions] DB không sẵn sàng, dùng seed tĩnh:", err)
	}

	return NextResponse.json(
		{
			version: GEO_DATA_VERSION,
			generatedAt: new Date().toISOString(),
			industries: INDUSTRIES,
			provinces: PROVINCES,
			zones: ECONOMIC_ZONES,
			demand,
		},
		{
			headers: {
				// Cho phép CDN/trình duyệt cache nhẹ; client vẫn tự cache LocalStorage.
				"Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
			},
		},
	)
}
