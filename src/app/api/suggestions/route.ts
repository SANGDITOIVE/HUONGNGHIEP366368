import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureGeoTables } from "@/lib/community/db"
import { PROVINCE_BY_CODE } from "@/data/geo/provinces"
import { INDUSTRY_BY_TAG, type IndustryTag } from "@/data/geo/industries"
import { ECONOMIC_ZONES } from "@/data/geo/economicZones"
import { fieldsForIndustry } from "@/data/geo/fieldIndustryMap"
import { demandByIndustry } from "@/data/geo"
import { MAJOR_FIELDS } from "@/data/majorFields"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const EMPTY = { industries: [] as unknown[], fields: [] as unknown[], zones: [] as unknown[] }

/**
 * GET /api/suggestions (PHASE 4)
 * Đọc tỉnh/thành trong hồ sơ người dùng để ưu tiên gợi ý ngành đang "hot"
 * tại địa phương + lĩnh vực ngành học phù hợp + khu kinh tế trong vùng.
 * Luôn trả 200 (kể cả chưa đăng nhập / chưa chọn tỉnh) để widget dễ dùng.
 */
export async function GET() {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json({ ok: true, loggedIn: false, province: null, ...EMPTY })
	}

	let provinceCode: string | null = null
	try {
		await ensureGeoTables()
		const res = await sql`SELECT province_code FROM user_profiles WHERE user_id = ${user.id} LIMIT 1`
		provinceCode = res.rows[0]?.province_code ? String(res.rows[0].province_code) : null
	} catch (err) {
		console.error("[/api/suggestions] DB error", err)
	}

	const province = provinceCode ? PROVINCE_BY_CODE[provinceCode] : undefined
	if (!province) {
		return NextResponse.json({ ok: true, loggedIn: true, province: null, ...EMPTY })
	}

	const industries = province.economicFocus
		.map((tag) => {
			const meta = INDUSTRY_BY_TAG[tag]
			const d = demandByIndustry(tag).find((x) => x.provinceCode === province.code)
			return {
				tag,
				label: meta?.label ?? tag,
				short: meta?.short ?? tag,
				color: meta?.color ?? "#64748b",
				demandScore: d?.demandScore ?? 60,
				jobOpenings: d?.jobOpenings ?? 0,
			}
		})
		.sort((a, b) => b.demandScore - a.demandScore)

	const fieldIds = new Set<string>()
	for (const tag of province.economicFocus) {
		for (const fid of fieldsForIndustry(tag as IndustryTag)) fieldIds.add(fid)
	}
	const fields = MAJOR_FIELDS.filter((f) => fieldIds.has(f.id)).map((f) => ({
		id: f.id,
		name: f.name,
		icon: f.icon,
	}))

	const zones = ECONOMIC_ZONES.filter((z) => z.provinceCode === province.code).map((z) => ({
		id: z.id,
		name: z.name,
		kind: z.kind,
		orgs: z.orgs,
	}))

	return NextResponse.json({
		ok: true,
		loggedIn: true,
		province: { code: province.code, name: province.name },
		industries,
		fields,
		zones,
	})
}
