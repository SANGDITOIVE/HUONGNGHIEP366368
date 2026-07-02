import { NextResponse } from "next/server"
import { sql } from "@/lib/community/db"
import { getAdminContext } from "@/lib/community/serverAuth"
import { provinceForCity } from "@/lib/geo/geocodeUniversity"
import { MAJOR_FIELDS } from "@/data/majorFields"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const FIELD_NAME: Record<string, string> = Object.fromEntries(
	MAJOR_FIELDS.map((f) => [f.id, f.name]),
)

interface ProvinceStat {
	provinceCode: string
	provinceName: string
	total: number
	/** Lĩnh vực ngành học được quan tâm nhiều nhất tại tỉnh + tỉ lệ %. */
	topFields: { fieldId: string; fieldName: string; count: number; percent: number }[]
}

/**
 * GET /api/admin/analytics (PHASE 4 — chỉ ADMIN)
 * Tổng hợp số liệu khảo sát: "X% học sinh tại tỉnh … quan tâm lĩnh vực …".
 * Ghép location -> tỉnh (provinceForCity) và gom theo favorite_field.
 */
export async function GET() {
	const ctx = await getAdminContext()
	if (!ctx.isAdmin) {
		return NextResponse.json({ ok: false, error: "forbidden" }, { status: 403 })
	}

	let rows: Array<{ location: string | null; favorite_field: string | null }> = []
	try {
		const res = await sql`SELECT location, favorite_field FROM surveys`
		rows = res.rows as Array<{ location: string | null; favorite_field: string | null }>
	} catch (err) {
		console.error("[/api/admin/analytics] DB error", err)
		return NextResponse.json({ ok: true, totalResponses: 0, provinces: [] as ProvinceStat[] })
	}

	// gom: provinceCode -> { name, total, fieldCounts }
	const byProvince = new Map<
		string,
		{ name: string; total: number; fields: Map<string, number> }
	>()
	let matched = 0

	for (const r of rows) {
		const province = provinceForCity(r.location)
		if (!province) continue
		matched++
		let bucket = byProvince.get(province.code)
		if (!bucket) {
			bucket = { name: province.name, total: 0, fields: new Map() }
			byProvince.set(province.code, bucket)
		}
		bucket.total++
		const field = (r.favorite_field ?? "").trim()
		if (field) bucket.fields.set(field, (bucket.fields.get(field) ?? 0) + 1)
	}

	const provinces: ProvinceStat[] = Array.from(byProvince.entries())
		.map(([provinceCode, b]) => ({
			provinceCode,
			provinceName: b.name,
			total: b.total,
			topFields: Array.from(b.fields.entries())
				.map(([fieldId, count]) => ({
					fieldId,
					fieldName: FIELD_NAME[fieldId] ?? fieldId,
					count,
					percent: b.total > 0 ? Math.round((count / b.total) * 100) : 0,
				}))
				.sort((a, b2) => b2.count - a.count)
				.slice(0, 5),
		}))
		.sort((a, b) => b.total - a.total)

	return NextResponse.json({
		ok: true,
		totalResponses: rows.length,
		matchedResponses: matched,
		provinces,
	})
}
