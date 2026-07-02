// =============================================================
// PHASE 3 — Ánh xạ LĨNH VỰC NGÀNH (majorFields.ts) -> NGÀNH KINH TẾ (IndustryTag).
// Dùng để trang chi tiết ngành biết "vùng nóng / khu kinh tế / doanh nghiệp"
// liên quan, và để gợi ý ngành theo thế mạnh địa phương (Phase 4).
// =============================================================

import type { IndustryTag } from "./industries"

export const FIELD_INDUSTRY_MAP: Record<string, IndustryTag[]> = {
	"cong-nghe": ["cntt", "dien-tu"],
	"ky-thuat": ["co-khi-che-tao", "luyen-kim-thep", "xay-dung", "dien-tu", "nang-luong", "hang-khong"],
	"kien-truc-thiet-ke": ["xay-dung", "van-hoa-sang-tao"],
	"kinh-te": ["logistics-cang-bien", "tai-chinh-ngan-hang", "du-lich-dich-vu"],
	"truyen-thong": ["van-hoa-sang-tao", "cntt"],
	"tai-chinh": ["tai-chinh-ngan-hang", "hanh-chinh-cong"],
	"phap-luat": ["hanh-chinh-cong", "quoc-phong-an-ninh"],
	"y-te": ["y-te-duoc"],
	"su-pham": ["giao-duc"],
	"tam-ly": ["giao-duc", "y-te-duoc", "hanh-chinh-cong"],
	"ngon-ngu": ["du-lich-dich-vu", "van-hoa-sang-tao", "giao-duc"],
	"du-lich": ["du-lich-dich-vu", "logistics-cang-bien", "hang-khong"],
}

/** Trả về các ngành kinh tế liên quan tới 1 lĩnh vực ngành học. */
export function industriesForField(fieldId: string | undefined | null): IndustryTag[] {
	if (!fieldId) return []
	return FIELD_INDUSTRY_MAP[fieldId] ?? []
}

/** Ánh xạ ngược: ngành kinh tế -> các lĩnh vực ngành học gợi ý. */
export function fieldsForIndustry(tag: IndustryTag): string[] {
	const out: string[] = []
	for (const [fieldId, tags] of Object.entries(FIELD_INDUSTRY_MAP)) {
		if (tags.includes(tag)) out.push(fieldId)
	}
	return out
}

// =============================================================
// Ánh xạ NHÓM LĨNH VỰC trong "Bảng tổng quát ngành" (GROUP_CATEGORIES
// ở majorGroups.ts) -> các ngành kinh tế (IndustryTag). Dùng cho bộ lọc
// "Lĩnh vực ngành học" trên Bản đồ nghề nghiệp để học sinh chọn theo
// danh mục ngành quen thuộc thay vì thuật ngữ kinh tế.
// Key khớp đúng GroupCategory trong src/data/majorGroups.ts.
// =============================================================
export const CATEGORY_INDUSTRY_MAP: Record<string, IndustryTag[]> = {
	"kinh-te": ["tai-chinh-ngan-hang", "logistics-cang-bien", "du-lich-dich-vu"],
	"phap-luat": ["hanh-chinh-cong", "quoc-phong-an-ninh"],
	"cong-nghe": ["cntt", "dien-tu"],
	"ky-thuat": ["co-khi-che-tao", "luyen-kim-thep", "xay-dung", "dien-tu", "nang-luong", "hang-khong", "che-bien-thuc-pham"],
	"y-te": ["y-te-duoc"],
	"su-pham": ["giao-duc"],
	"truyen-thong": ["van-hoa-sang-tao", "cntt"],
	"tam-ly": ["giao-duc", "y-te-duoc", "hanh-chinh-cong"],
	"kien-truc": ["xay-dung", "van-hoa-sang-tao"],
	"ngoai-ngu": ["du-lich-dich-vu", "van-hoa-sang-tao", "giao-duc"],
	"nghe-thuat": ["van-hoa-sang-tao"],
	"khoa-hoc": ["giao-duc", "cntt", "y-te-duoc", "nong-nghiep"],
	"nong-nghiep": ["nong-nghiep", "lam-nghiep", "thuy-san", "che-bien-thuc-pham"],
	"dich-vu": ["du-lich-dich-vu", "logistics-cang-bien", "hang-khong"],
	"an-ninh": ["quoc-phong-an-ninh"],
	"moi-truong": ["nang-luong", "khai-khoang", "lam-nghiep", "nong-nghiep"],
}

/** Trả về các ngành kinh tế liên quan tới 1 nhóm lĩnh vực (bảng tổng quát). */
export function industriesForCategory(categoryId: string | undefined | null): IndustryTag[] {
	if (!categoryId) return []
	return CATEGORY_INDUSTRY_MAP[categoryId] ?? []
}
