// =============================================================
// PHASE 1 — Danh mục NGÀNH KINH TẾ TRỌNG ĐIỂM (industry tags)
// Dùng chung cho: provinces.economicFocus, economicZones.industries,
// regional_career_demand.industry_name, và tô màu bản đồ ở Phase 3.
// Mỗi tag có nhãn tiếng Việt, màu (tô vùng/chip) và icon lucide-react.
// =============================================================

export type IndustryTag =
	| "cntt"
	| "dien-tu"
	| "co-khi-che-tao"
	| "luyen-kim-thep"
	| "dau-khi"
	| "nang-luong"
	| "logistics-cang-bien"
	| "hang-khong"
	| "xay-dung"
	| "det-may-da-giay"
	| "che-bien-thuc-pham"
	| "nong-nghiep"
	| "thuy-san"
	| "lam-nghiep"
	| "khai-khoang"
	| "du-lich-dich-vu"
	| "tai-chinh-ngan-hang"
	| "y-te-duoc"
	| "giao-duc"
	| "hanh-chinh-cong"
	| "quoc-phong-an-ninh"
	| "van-hoa-sang-tao"

export interface IndustryMeta {
	tag: IndustryTag
	/** Nhãn đầy đủ tiếng Việt. */
	label: string
	/** Nhãn ngắn để hiển thị trên chip/bản đồ. */
	short: string
	/** Màu HEX để tô vùng & chip (đủ tương phản với chữ trắng). */
	color: string
	/** Tên icon lucide-react (import động ở component bản đồ). */
	icon: string
	/** Mô tả ngắn 1 dòng. */
	blurb: string
}

export const INDUSTRIES: IndustryMeta[] = [
	{ tag: "cntt", label: "Công nghệ thông tin", short: "CNTT", color: "#6366f1", icon: "Cpu", blurb: "Phần mềm, AI, dữ liệu, chuyển đổi số." },
	{ tag: "dien-tu", label: "Điện tử - Vi mạch", short: "Điện tử", color: "#0ea5e9", icon: "CircuitBoard", blurb: "Sản xuất linh kiện, chip bán dẫn, lắp ráp điện tử." },
	{ tag: "co-khi-che-tao", label: "Cơ khí - Chế tạo", short: "Cơ khí", color: "#64748b", icon: "Cog", blurb: "Ô tô, máy móc, công nghiệp chế biến chế tạo." },
	{ tag: "luyen-kim-thep", label: "Luyện kim - Thép", short: "Luyện kim", color: "#b45309", icon: "Factory", blurb: "Gang thép, kim loại màu, vật liệu công nghiệp nặng." },
	{ tag: "dau-khi", label: "Dầu khí - Lọc hóa dầu", short: "Dầu khí", color: "#1e293b", icon: "Fuel", blurb: "Khai thác, lọc hóa dầu, hóa chất." },
	{ tag: "nang-luong", label: "Năng lượng - Điện", short: "Năng lượng", color: "#f59e0b", icon: "Zap", blurb: "Thủy điện, điện gió, điện mặt trời, nhiệt điện." },
	{ tag: "logistics-cang-bien", label: "Logistics & Cảng biển", short: "Logistics", color: "#0891b2", icon: "Ship", blurb: "Cảng biển, kho vận, chuỗi cung ứng, hàng hải." },
	{ tag: "hang-khong", label: "Hàng không", short: "Hàng không", color: "#2563eb", icon: "Plane", blurb: "Cảng hàng không, kỹ thuật & dịch vụ hàng không." },
	{ tag: "xay-dung", label: "Xây dựng - Hạ tầng", short: "Xây dựng", color: "#78716c", icon: "HardHat", blurb: "Hạ tầng, vật liệu xây dựng, bất động sản." },
	{ tag: "det-may-da-giay", label: "Dệt may - Da giày", short: "Dệt may", color: "#db2777", icon: "Shirt", blurb: "Dệt may, da giày xuất khẩu, thời trang." },
	{ tag: "che-bien-thuc-pham", label: "Chế biến thực phẩm", short: "Thực phẩm", color: "#ea580c", icon: "Utensils", blurb: "Chế biến nông - thủy sản, đồ uống, thực phẩm." },
	{ tag: "nong-nghiep", label: "Nông nghiệp", short: "Nông nghiệp", color: "#16a34a", icon: "Sprout", blurb: "Trồng trọt, chăn nuôi, nông nghiệp công nghệ cao." },
	{ tag: "thuy-san", label: "Thủy sản", short: "Thủy sản", color: "#0d9488", icon: "Fish", blurb: "Nuôi trồng, đánh bắt, chế biến thủy hải sản." },
	{ tag: "lam-nghiep", label: "Lâm nghiệp", short: "Lâm nghiệp", color: "#15803d", icon: "Trees", blurb: "Trồng rừng, chế biến gỗ, lâm sản." },
	{ tag: "khai-khoang", label: "Khai khoáng", short: "Khoáng sản", color: "#92400e", icon: "Pickaxe", blurb: "Than, bauxite, apatit, khoáng sản." },
	{ tag: "du-lich-dich-vu", label: "Du lịch - Dịch vụ", short: "Du lịch", color: "#e11d48", icon: "Palmtree", blurb: "Du lịch, khách sạn, nhà hàng, dịch vụ." },
	{ tag: "tai-chinh-ngan-hang", label: "Tài chính - Ngân hàng", short: "Tài chính", color: "#ca8a04", icon: "Landmark", blurb: "Ngân hàng, chứng khoán, bảo hiểm, fintech." },
	{ tag: "y-te-duoc", label: "Y tế - Dược", short: "Y - Dược", color: "#dc2626", icon: "HeartPulse", blurb: "Bệnh viện, dược phẩm, thiết bị y tế." },
	{ tag: "giao-duc", label: "Giáo dục - Đào tạo", short: "Giáo dục", color: "#7c3aed", icon: "GraduationCap", blurb: "Trường học, đào tạo, nghiên cứu." },
	{ tag: "hanh-chinh-cong", label: "Hành chính công", short: "Hành chính", color: "#475569", icon: "Building2", blurb: "Cơ quan nhà nước, thuế, thanh tra, quản lý công." },
	{ tag: "quoc-phong-an-ninh", label: "Quốc phòng - An ninh", short: "Quốc phòng", color: "#166534", icon: "ShieldCheck", blurb: "Quân đội, công an, biên phòng, an ninh." },
	{ tag: "van-hoa-sang-tao", label: "Văn hóa - Sáng tạo", short: "Văn hóa", color: "#c026d3", icon: "Palette", blurb: "Báo chí, nghệ thuật, thiết kế, công nghiệp văn hóa." },
]

export const INDUSTRY_BY_TAG: Record<IndustryTag, IndustryMeta> = Object.fromEntries(
	INDUSTRIES.map((i) => [i.tag, i]),
) as Record<IndustryTag, IndustryMeta>

/** Trả nhãn tiếng Việt an toàn cho 1 tag (fallback chính tag nếu thiếu). */
export function industryLabel(tag: string): string {
	return INDUSTRY_BY_TAG[tag as IndustryTag]?.label ?? tag
}
