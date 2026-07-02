// =============================================================
// 34 ĐƠN VỊ HÀNH CHÍNH CẤP TỈNH (Nghị quyết 202/2025/QH15,
// hiệu lực 12/6/2025): 6 thành phố trực thuộc TW + 28 tỉnh.
// Toạ độ là điểm đại diện (trung tâm hành chính/đô thị) để ghim/phủ
// màu bản đồ; KHÔNG dùng cho đo đạc hành chính chính xác.
// economicFocus tham chiếu IndustryTag (xem industries.ts) và được
// gộp từ các tỉnh thành phần sau sáp nhập.
// Mã `code` giữ theo mã GSO của đơn vị nhận sáp nhập để tương thích
// dữ liệu khu kinh tế / nhu cầu nhân lực hiện có.
// =============================================================

import type { IndustryTag } from "./industries"

export type GeoRegion = "bac" | "trung" | "nam"

export interface ProvinceNode {
	/** Mã hành chính (GSO của đơn vị nhận sáp nhập). */
	code: string
	name: string
	region: GeoRegion
	lat: number
	lng: number
	economicFocus: IndustryTag[]
}

export const PROVINCES: ProvinceNode[] = [
	// --- MIỀN BẮC (15) ---
	{ code: "01", name: "Hà Nội", region: "bac", lat: 21.0285, lng: 105.8542, economicFocus: ["cntt", "tai-chinh-ngan-hang", "hanh-chinh-cong", "giao-duc"] },
	{ code: "31", name: "Hải Phòng", region: "bac", lat: 20.8449, lng: 106.6881, economicFocus: ["logistics-cang-bien", "dien-tu", "co-khi-che-tao", "nong-nghiep"] }, // + Hải Dương
	{ code: "04", name: "Cao Bằng", region: "bac", lat: 22.665, lng: 106.257, economicFocus: ["du-lich-dich-vu", "nong-nghiep", "khai-khoang"] },
	{ code: "08", name: "Tuyên Quang", region: "bac", lat: 21.823, lng: 105.214, economicFocus: ["du-lich-dich-vu", "lam-nghiep", "nong-nghiep", "khai-khoang"] }, // + Hà Giang
	{ code: "10", name: "Lào Cai", region: "bac", lat: 21.705, lng: 104.870, economicFocus: ["khai-khoang", "du-lich-dich-vu", "lam-nghiep", "logistics-cang-bien"] }, // TT Yên Bái, + Yên Bái
	{ code: "11", name: "Điện Biên", region: "bac", lat: 21.386, lng: 103.017, economicFocus: ["du-lich-dich-vu", "nong-nghiep", "lam-nghiep"] },
	{ code: "12", name: "Lai Châu", region: "bac", lat: 22.386, lng: 103.470, economicFocus: ["nang-luong", "lam-nghiep", "nong-nghiep"] },
	{ code: "14", name: "Sơn La", region: "bac", lat: 21.327, lng: 103.914, economicFocus: ["nong-nghiep", "nang-luong", "che-bien-thuc-pham"] },
	{ code: "19", name: "Thái Nguyên", region: "bac", lat: 21.594, lng: 105.848, economicFocus: ["dien-tu", "luyen-kim-thep", "khai-khoang", "giao-duc"] }, // + Bắc Kạn
	{ code: "20", name: "Lạng Sơn", region: "bac", lat: 21.853, lng: 106.761, economicFocus: ["logistics-cang-bien", "du-lich-dich-vu", "nong-nghiep"] },
	{ code: "22", name: "Quảng Ninh", region: "bac", lat: 21.006, lng: 107.293, economicFocus: ["khai-khoang", "du-lich-dich-vu", "nang-luong", "logistics-cang-bien"] },
	{ code: "25", name: "Phú Thọ", region: "bac", lat: 21.323, lng: 105.402, economicFocus: ["co-khi-che-tao", "dien-tu", "che-bien-thuc-pham", "du-lich-dich-vu", "nang-luong"] }, // + Vĩnh Phúc + Hòa Bình
	{ code: "27", name: "Bắc Ninh", region: "bac", lat: 21.273, lng: 106.194, economicFocus: ["dien-tu", "co-khi-che-tao", "logistics-cang-bien", "det-may-da-giay"] }, // TT Bắc Giang, + Bắc Giang
	{ code: "33", name: "Hưng Yên", region: "bac", lat: 20.646, lng: 106.051, economicFocus: ["dien-tu", "co-khi-che-tao", "det-may-da-giay", "nong-nghiep"] }, // + Thái Bình
	{ code: "37", name: "Ninh Bình", region: "bac", lat: 20.254, lng: 105.975, economicFocus: ["du-lich-dich-vu", "co-khi-che-tao", "det-may-da-giay", "xay-dung"] }, // + Hà Nam + Nam Định
	// --- MIỀN TRUNG & TÂY NGUYÊN (11) ---
	{ code: "38", name: "Thanh Hóa", region: "trung", lat: 19.807, lng: 105.776, economicFocus: ["dau-khi", "logistics-cang-bien", "du-lich-dich-vu"] },
	{ code: "40", name: "Nghệ An", region: "trung", lat: 18.679, lng: 105.681, economicFocus: ["nong-nghiep", "che-bien-thuc-pham", "du-lich-dich-vu"] },
	{ code: "42", name: "Hà Tĩnh", region: "trung", lat: 18.357, lng: 105.900, economicFocus: ["luyen-kim-thep", "logistics-cang-bien", "nang-luong"] },
	{ code: "45", name: "Quảng Trị", region: "trung", lat: 17.468, lng: 106.622, economicFocus: ["du-lich-dich-vu", "nang-luong", "logistics-cang-bien", "nong-nghiep"] }, // TT Quảng Bình, + Quảng Bình
	{ code: "46", name: "Huế", region: "trung", lat: 16.4637, lng: 107.5909, economicFocus: ["du-lich-dich-vu", "y-te-duoc", "van-hoa-sang-tao"] }, // TP trực thuộc TW
	{ code: "48", name: "Đà Nẵng", region: "trung", lat: 16.0544, lng: 108.2022, economicFocus: ["du-lich-dich-vu", "cntt", "logistics-cang-bien", "co-khi-che-tao"] }, // + Quảng Nam
	{ code: "51", name: "Quảng Ngãi", region: "trung", lat: 15.120, lng: 108.792, economicFocus: ["luyen-kim-thep", "dau-khi", "logistics-cang-bien", "nong-nghiep"] }, // + Kon Tum
	{ code: "52", name: "Gia Lai", region: "trung", lat: 13.782, lng: 109.219, economicFocus: ["nong-nghiep", "logistics-cang-bien", "du-lich-dich-vu", "nang-luong", "che-bien-thuc-pham"] }, // TT Bình Định, + Bình Định
	{ code: "56", name: "Khánh Hòa", region: "trung", lat: 12.259, lng: 109.052, economicFocus: ["du-lich-dich-vu", "thuy-san", "logistics-cang-bien", "nang-luong"] }, // + Ninh Thuận
	{ code: "66", name: "Đắk Lắk", region: "trung", lat: 12.710, lng: 108.237, economicFocus: ["nong-nghiep", "che-bien-thuc-pham", "du-lich-dich-vu", "nang-luong"] }, // + Phú Yên
	{ code: "68", name: "Lâm Đồng", region: "trung", lat: 11.940, lng: 108.458, economicFocus: ["nong-nghiep", "du-lich-dich-vu", "nang-luong", "che-bien-thuc-pham", "khai-khoang"] }, // + Đắk Nông + Bình Thuận
	// --- MIỀN NAM (8) ---
	{ code: "79", name: "TP. Hồ Chí Minh", region: "nam", lat: 10.7769, lng: 106.7009, economicFocus: ["tai-chinh-ngan-hang", "cntt", "logistics-cang-bien", "dien-tu", "dau-khi"] }, // + Bình Dương + Bà Rịa - Vũng Tàu
	{ code: "75", name: "Đồng Nai", region: "nam", lat: 10.945, lng: 106.824, economicFocus: ["co-khi-che-tao", "hang-khong", "logistics-cang-bien", "che-bien-thuc-pham"] }, // + Bình Phước
	{ code: "72", name: "Tây Ninh", region: "nam", lat: 10.535, lng: 106.413, economicFocus: ["nong-nghiep", "co-khi-che-tao", "det-may-da-giay", "du-lich-dich-vu", "nang-luong"] }, // TT Long An, + Long An
	{ code: "92", name: "Cần Thơ", region: "nam", lat: 10.0452, lng: 105.7469, economicFocus: ["nong-nghiep", "thuy-san", "che-bien-thuc-pham", "logistics-cang-bien", "giao-duc"] }, // + Sóc Trăng + Hậu Giang
	{ code: "86", name: "Vĩnh Long", region: "nam", lat: 10.253, lng: 105.972, economicFocus: ["nong-nghiep", "thuy-san", "che-bien-thuc-pham", "du-lich-dich-vu"] }, // + Bến Tre + Trà Vinh
	{ code: "87", name: "Đồng Tháp", region: "nam", lat: 10.360, lng: 106.359, economicFocus: ["nong-nghiep", "thuy-san", "che-bien-thuc-pham", "du-lich-dich-vu"] }, // TT Tiền Giang, + Tiền Giang
	{ code: "91", name: "An Giang", region: "nam", lat: 10.012, lng: 105.081, economicFocus: ["nong-nghiep", "thuy-san", "du-lich-dich-vu", "logistics-cang-bien"] }, // TT Kiên Giang, + Kiên Giang
	{ code: "96", name: "Cà Mau", region: "nam", lat: 9.177, lng: 105.150, economicFocus: ["thuy-san", "nang-luong", "che-bien-thuc-pham", "nong-nghiep"] }, // + Bạc Liêu
]

export const PROVINCE_BY_CODE: Record<string, ProvinceNode> = Object.fromEntries(
	PROVINCES.map((p) => [p.code, p]),
)

export const REGION_LABEL: Record<GeoRegion, string> = {
	bac: "Miền Bắc",
	trung: "Miền Trung & Tây Nguyên",
	nam: "Miền Nam",
}
