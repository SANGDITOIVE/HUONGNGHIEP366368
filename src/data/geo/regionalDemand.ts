// =============================================================
// PHASE 1 — SEED nhu cầu nhân lực theo tỉnh (regional_career_demand).
// demandScore 1-100 = mức "khát" nhân lực ước lượng; jobOpenings = số tin
// tuyển tham khảo. Đây là số liệu SEED ban đầu (có thể thay bằng dữ
// liệu thực qua admin sau). Dùng để vẽ heatmap/icon map ở Phase 3.
// =============================================================

import type { IndustryTag } from "./industries"

export interface DemandSeed {
	provinceCode: string
	industry: IndustryTag
	demandScore: number
	jobOpenings: number
}

export const REGIONAL_DEMAND_SEED: DemandSeed[] = [
	// Hà Nội
	{ provinceCode: "01", industry: "cntt", demandScore: 95, jobOpenings: 12000 },
	{ provinceCode: "01", industry: "tai-chinh-ngan-hang", demandScore: 88, jobOpenings: 7000 },
	{ provinceCode: "01", industry: "hanh-chinh-cong", demandScore: 70, jobOpenings: 3000 },
	// TP.HCM
	{ provinceCode: "79", industry: "cntt", demandScore: 97, jobOpenings: 15000 },
	{ provinceCode: "79", industry: "tai-chinh-ngan-hang", demandScore: 92, jobOpenings: 9000 },
	{ provinceCode: "79", industry: "logistics-cang-bien", demandScore: 82, jobOpenings: 5000 },
	// Hải Phòng
	{ provinceCode: "31", industry: "logistics-cang-bien", demandScore: 93, jobOpenings: 6000 },
	{ provinceCode: "31", industry: "co-khi-che-tao", demandScore: 80, jobOpenings: 4000 },
	{ provinceCode: "31", industry: "dien-tu", demandScore: 78, jobOpenings: 3500 },
	// Bắc Ninh / Bắc Giang / Thái Nguyên (điện tử)
	{ provinceCode: "27", industry: "dien-tu", demandScore: 96, jobOpenings: 8000 },
	{ provinceCode: "27", industry: "dien-tu", demandScore: 90, jobOpenings: 6500 },
	{ provinceCode: "19", industry: "dien-tu", demandScore: 88, jobOpenings: 5000 },
	// Bà Rịa - Vũng Tàu (dầu khí)
	{ provinceCode: "79", industry: "dau-khi", demandScore: 90, jobOpenings: 3000 },
	{ provinceCode: "79", industry: "logistics-cang-bien", demandScore: 85, jobOpenings: 3500 },
	// Quảng Ngãi (luyện kim - Hòa Phát)
	{ provinceCode: "51", industry: "luyen-kim-thep", demandScore: 86, jobOpenings: 2500 },
	{ provinceCode: "51", industry: "dau-khi", demandScore: 72, jobOpenings: 1200 },
	// Hà Tĩnh (Formosa)
	{ provinceCode: "42", industry: "luyen-kim-thep", demandScore: 84, jobOpenings: 2000 },
	// Bình Dương / Đồng Nai (chế tạo)
	{ provinceCode: "79", industry: "co-khi-che-tao", demandScore: 91, jobOpenings: 9000 },
	{ provinceCode: "75", industry: "co-khi-che-tao", demandScore: 89, jobOpenings: 8000 },
	{ provinceCode: "75", industry: "hang-khong", demandScore: 75, jobOpenings: 1500 },
	// Đà Nẵng (du lịch + CNTT)
	{ provinceCode: "48", industry: "du-lich-dich-vu", demandScore: 84, jobOpenings: 4000 },
	{ provinceCode: "48", industry: "cntt", demandScore: 80, jobOpenings: 3000 },
	// Khánh Hòa / Kiên Giang (du lịch)
	{ provinceCode: "56", industry: "du-lich-dich-vu", demandScore: 82, jobOpenings: 3500 },
	{ provinceCode: "91", industry: "du-lich-dich-vu", demandScore: 80, jobOpenings: 3000 },
	// Tây Nguyên (nông nghiệp)
	{ provinceCode: "66", industry: "nong-nghiep", demandScore: 78, jobOpenings: 2500 },
	{ provinceCode: "68", industry: "nong-nghiep", demandScore: 76, jobOpenings: 2200 },
	// ĐBSCL (nông - thủy sản)
	{ provinceCode: "92", industry: "nong-nghiep", demandScore: 79, jobOpenings: 2600 },
	{ provinceCode: "96", industry: "thuy-san", demandScore: 81, jobOpenings: 2400 },
	{ provinceCode: "87", industry: "thuy-san", demandScore: 77, jobOpenings: 2000 },
]
