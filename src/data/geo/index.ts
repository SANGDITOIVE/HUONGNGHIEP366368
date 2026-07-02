// =============================================================
// PHASE 1 — Barrel + helper truy vấn cho tầng dữ liệu địa lý.
// Import gọn: import { PROVINCES, zonesByIndustry } from "@/data/geo"
// =============================================================

export * from "./industries"
export * from "./provinces"
export * from "./economicZones"
export * from "./regionalDemand"

import type { IndustryTag } from "./industries"
import { PROVINCES, PROVINCE_BY_CODE, type ProvinceNode } from "./provinces"
import { ECONOMIC_ZONES, type EconomicZone } from "./economicZones"
import { REGIONAL_DEMAND_SEED, type DemandSeed } from "./regionalDemand"

/** Phiên bản dữ liệu địa lý — tăng khi sửa data để client tự làm mới cache. */
export const GEO_DATA_VERSION = "2026-06-26.2"

/** Các tỉnh có ngành này trong economicFocus. */
export function provincesByIndustry(tag: IndustryTag): ProvinceNode[] {
	return PROVINCES.filter((p) => p.economicFocus.includes(tag))
}

/** Các khu kinh tế / cơ quan gắn với ngành này. */
export function zonesByIndustry(tag: IndustryTag): EconomicZone[] {
	return ECONOMIC_ZONES.filter((z) => z.industries.includes(tag))
}

/** Seed nhu cầu theo ngành, sắp xếp giảm dần theo demandScore. */
export function demandByIndustry(tag: IndustryTag): DemandSeed[] {
	return REGIONAL_DEMAND_SEED.filter((d) => d.industry === tag).sort(
		(a, b) => b.demandScore - a.demandScore,
	)
}

/** Điểm demand tổng hợp (max) cho 1 tỉnh — dùng tô đậm nhạt heatmap. */
export function maxDemandForProvince(provinceCode: string): number {
	const rows = REGIONAL_DEMAND_SEED.filter((d) => d.provinceCode === provinceCode)
	return rows.reduce((m, r) => Math.max(m, r.demandScore), 0)
}

/** "Vùng nóng" của 1 ngành: tỉnh + zone + điểm demand, gom để hiển thị. */
export interface IndustryHotspot {
	province: ProvinceNode
	demandScore: number
	jobOpenings: number
	zones: EconomicZone[]
}

export function hotspotsForIndustry(tag: IndustryTag): IndustryHotspot[] {
	const byProvince = new Map<string, IndustryHotspot>()
	// Từ seed nhu cầu (có điểm số)
	for (const d of demandByIndustry(tag)) {
		const province = PROVINCE_BY_CODE[d.provinceCode]
		if (!province) continue
		byProvince.set(d.provinceCode, {
			province,
			demandScore: d.demandScore,
			jobOpenings: d.jobOpenings,
			zones: [],
		})
	}
	// Bổ sung tỉnh có ngành trong economicFocus nhưng chưa có seed
	for (const p of provincesByIndustry(tag)) {
		if (!byProvince.has(p.code)) {
			byProvince.set(p.code, { province: p, demandScore: 0, jobOpenings: 0, zones: [] })
		}
	}
	// Gắn zone vào tỉnh tương ứng
	for (const z of zonesByIndustry(tag)) {
		const hit = byProvince.get(z.provinceCode)
		if (hit) hit.zones.push(z)
		else {
			const province = PROVINCE_BY_CODE[z.provinceCode]
			if (province) byProvince.set(z.provinceCode, { province, demandScore: 0, jobOpenings: 0, zones: [z] })
		}
	}
	return Array.from(byProvince.values()).sort((a, b) => b.demandScore - a.demandScore)
}
