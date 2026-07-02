// =============================================================
// PHASE 3 — Geocode trường ĐH về toạ độ tỉnh (để ghim lên bản đồ).
// Dữ liệu UNIVERSITIES chỉ có `city` dạng chuỗi -> khớp về ProvinceNode
// bằng bảng alias + so khớp tên. Trả null nếu không khớp (bỏ ghim — an toàn).
// =============================================================

import { PROVINCES, type ProvinceNode } from "@/data/geo/provinces"

// city trong universities.ts -> tên tỉnh chuẩn trong provinces.ts
// Lưu ý: từ 12/6/2025 cả nước còn 34 đơn vị. Bảng này ánh xạ tên tỉnh/thành
// CŨ (nơi trường đóng) về tên đơn vị MỚI sau sáp nhập để vẫn ghim đúng.
const CITY_ALIAS: Record<string, string> = {
	// TP. Hồ Chí Minh (+ Bình Dương + Bà Rịa - Vũng Tàu)
	"TP.HCM": "TP. Hồ Chí Minh",
	"TPHCM": "TP. Hồ Chí Minh",
	"TP Hồ Chí Minh": "TP. Hồ Chí Minh",
	"Hồ Chí Minh": "TP. Hồ Chí Minh",
	"Sài Gòn": "TP. Hồ Chí Minh",
	"Bình Dương": "TP. Hồ Chí Minh",
	"Thủ Dầu Một": "TP. Hồ Chí Minh",
	"Bà Rịa - Vũng Tàu": "TP. Hồ Chí Minh",
	"Bà Rịa-Vũng Tàu": "TP. Hồ Chí Minh",
	"Vũng Tàu": "TP. Hồ Chí Minh",
	// Huế (TP trực thuộc TW)
	"Thừa Thiên Huế": "Huế",
	// Hải Phòng (+ Hải Dương)
	"Hải Dương": "Hải Phòng",
	// Tuyên Quang (+ Hà Giang)
	"Hà Giang": "Tuyên Quang",
	// Lào Cai (+ Yên Bái)
	"Yên Bái": "Lào Cai",
	// Thái Nguyên (+ Bắc Kạn)
	"Bắc Kạn": "Thái Nguyên",
	// Phú Thọ (+ Vĩnh Phúc + Hòa Bình)
	"Vĩnh Phúc": "Phú Thọ",
	"Hòa Bình": "Phú Thọ",
	// Bắc Ninh (+ Bắc Giang)
	"Bắc Giang": "Bắc Ninh",
	// Hưng Yên (+ Thái Bình)
	"Thái Bình": "Hưng Yên",
	// Ninh Bình (+ Hà Nam + Nam Định)
	"Hà Nam": "Ninh Bình",
	"Nam Định": "Ninh Bình",
	// Quảng Trị (+ Quảng Bình)
	"Quảng Bình": "Quảng Trị",
	"Đồng Hới": "Quảng Trị",
	// Đà Nẵng (+ Quảng Nam)
	"Quảng Nam": "Đà Nẵng",
	"Tam Kỳ": "Đà Nẵng",
	"Hội An": "Đà Nẵng",
	// Quảng Ngãi (+ Kon Tum)
	"Kon Tum": "Quảng Ngãi",
	// Gia Lai (+ Bình Định)
	"Bình Định": "Gia Lai",
	"Quy Nhơn": "Gia Lai",
	// Khánh Hòa (+ Ninh Thuận)
	"Ninh Thuận": "Khánh Hòa",
	"Phan Rang": "Khánh Hòa",
	"Phan Rang - Tháp Chàm": "Khánh Hòa",
	"Nha Trang": "Khánh Hòa",
	// Đắk Lắk (+ Phú Yên)
	"Phú Yên": "Đắk Lắk",
	"Tuy Hòa": "Đắk Lắk",
	"Buôn Ma Thuột": "Đắk Lắk",
	// Lâm Đồng (+ Đắk Nông + Bình Thuận)
	"Đắk Nông": "Lâm Đồng",
	"Gia Nghĩa": "Lâm Đồng",
	"Bình Thuận": "Lâm Đồng",
	"Phan Thiết": "Lâm Đồng",
	"Đà Lạt": "Lâm Đồng",
	// Đồng Nai (+ Bình Phước)
	"Bình Phước": "Đồng Nai",
	"Đồng Xoài": "Đồng Nai",
	"Biên Hòa": "Đồng Nai",
	// Tây Ninh (+ Long An)
	"Long An": "Tây Ninh",
	"Tân An": "Tây Ninh",
	// Cần Thơ (+ Sóc Trăng + Hậu Giang)
	"Sóc Trăng": "Cần Thơ",
	"Hậu Giang": "Cần Thơ",
	"Vị Thanh": "Cần Thơ",
	// Vĩnh Long (+ Bến Tre + Trà Vinh)
	"Bến Tre": "Vĩnh Long",
	"Trà Vinh": "Vĩnh Long",
	// Đồng Tháp (+ Tiền Giang)
	"Tiền Giang": "Đồng Tháp",
	"Mỹ Tho": "Đồng Tháp",
	// An Giang (+ Kiên Giang)
	"Kiên Giang": "An Giang",
	"Rạch Giá": "An Giang",
	"Phú Quốc": "An Giang",
	// Cà Mau (+ Bạc Liêu)
	"Bạc Liêu": "Cà Mau",
	// --- Tên TP/quận hay gặp trong tên trường -> tỉnh mới ---
	"Vinh": "Nghệ An",
	"Long Xuyên": "An Giang",
	"Pleiku": "Gia Lai",
	"Thủ Đức": "TP. Hồ Chí Minh",
	"Hà Đông": "Hà Nội",
	"Sơn Tây": "Hà Nội",
	"Hạ Long": "Quảng Ninh",
	"Uông Bí": "Quảng Ninh",
	"Việt Trì": "Phú Thọ",
	"Sầm Sơn": "Thanh Hóa",
	"Cam Ranh": "Khánh Hòa",
	"Bảo Lộc": "Lâm Đồng",
}

function norm(s: string): string {
	return s
		.normalize("NFC")
		.toLowerCase()
		.replace(/^(tp\.?|thành phố|tỉnh)\s+/i, "")
		.trim()
}

const byNorm = new Map<string, ProvinceNode>()
for (const p of PROVINCES) byNorm.set(norm(p.name), p)

export function provinceForCity(city: string | undefined | null): ProvinceNode | null {
	if (!city) return null
	const aliased = CITY_ALIAS[city.trim()] ?? city.trim()
	const key = norm(aliased)
	const direct = byNorm.get(key)
	if (direct) return direct
	// So khớp mềm: tên tỉnh chứa city hoặc ngược lại.
	for (const p of PROVINCES) {
		const pn = norm(p.name)
		if (pn === key || pn.includes(key) || key.includes(pn)) return p
	}
	return null
}
