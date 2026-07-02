// =============================================================
// PHASE 1 — KHU KINH TẾ / KCN / KHU CÔNG NGHỆ CAO / CẢNG / CƠ QUAN
// NHÀ NƯỚC / CHỦ QUYỀN BIỂN ĐẢO — điểm ghim trên bản đồ (Phase 3).
//
// Nguồn: tổng hợp thông tin công khai về các khu kinh tế trọng điểm,
// tập đoàn lớn và địa giới hành chính VN. Toạ độ là điểm đại diện.
// orgs = tập đoàn/công ty/cơ quan tiêu biểu; industries tham chiếu IndustryTag.
// =============================================================

import type { IndustryTag } from "./industries"

export type ZoneKind =
	| "khu-cong-nghiep"
	| "khu-cong-nghe-cao"
	| "cang-logistics"
	| "nang-luong-dau-khi"
	| "du-lich"
	| "nong-nghiep"
	| "tai-chinh"
	| "co-quan-nha-nuoc"
	| "chu-quyen-bien-dao"

export interface EconomicZone {
	id: string
	name: string
	/** Mã tỉnh GSO (xem provinces.ts). Rỗng cho điểm biển đảo chủ quyền. */
	provinceCode: string
	lat: number
	lng: number
	kind: ZoneKind
	industries: IndustryTag[]
	orgs: string[]
	note: string
}

export const ZONE_KIND_LABEL: Record<ZoneKind, string> = {
	"khu-cong-nghiep": "Khu công nghiệp",
	"khu-cong-nghe-cao": "Khu công nghệ cao",
	"cang-logistics": "Cảng & Logistics",
	"nang-luong-dau-khi": "Năng lượng & Dầu khí",
	"du-lich": "Trung tâm du lịch",
	"nong-nghiep": "Vùng nông nghiệp",
	"tai-chinh": "Trung tâm tài chính",
	"co-quan-nha-nuoc": "Cơ quan nhà nước",
	"chu-quyen-bien-dao": "Chủ quyền biển đảo",
}

export const ECONOMIC_ZONES: EconomicZone[] = [
	// ====== Công nghiệp / công nghệ cao / cảng ======
	{ id: "hoa-lac", name: "Khu Công nghệ cao Hòa Lạc", provinceCode: "01", lat: 21.013, lng: 105.527, kind: "khu-cong-nghe-cao", industries: ["cntt", "dien-tu", "co-khi-che-tao"], orgs: ["FPT Software", "Viettel R&D", "Hanwha Aero Engines"], note: "Trung tâm R&D, phần mềm và công nghệ cao lớn nhất miền Bắc." },
	{ id: "cang-hai-phong", name: "Cụm cảng Hải Phòng - Đình Vũ / Lạch Huyện", provinceCode: "31", lat: 20.811, lng: 106.733, kind: "cang-logistics", industries: ["logistics-cang-bien", "co-khi-che-tao", "dien-tu"], orgs: ["Cảng Hải Phòng", "Tan Cang Lach Huyen", "LG, VinFast (gần kề)"], note: "Cửa ngõ logistics & cảng nước sâu lớn nhất miền Bắc." },
	{ id: "vsip-bac-ninh", name: "KCN Bắc Ninh (Samsung / VSIP)", provinceCode: "27", lat: 21.183, lng: 106.063, kind: "khu-cong-nghiep", industries: ["dien-tu", "co-khi-che-tao", "logistics-cang-bien"], orgs: ["Samsung Electronics", "Canon", "Goertek"], note: "Thủ phủ điện tử miền Bắc, xuất khẩu điện thoại lớn." },
	{ id: "yen-binh-thai-nguyen", name: "KCN Yên Bình (Samsung Thái Nguyên)", provinceCode: "19", lat: 21.305, lng: 105.910, kind: "khu-cong-nghiep", industries: ["dien-tu", "co-khi-che-tao"], orgs: ["Samsung Electronics", "Samsung SDI"], note: "Tổ hợp sản xuất điện tử quy mô lớn." },
	{ id: "que-vo-cnc", name: "Tổ hợp điện tử Bắc Giang", provinceCode: "27", lat: 21.270, lng: 106.215, kind: "khu-cong-nghiep", industries: ["dien-tu", "co-khi-che-tao"], orgs: ["Foxconn", "Luxshare", "JA Solar"], note: "Chuỗi lắp ráp điện tử & bán dẫn phụ trợ." },
	{ id: "vung-ang", name: "KKT Vũng Áng (Formosa Hà Tĩnh)", provinceCode: "42", lat: 18.083, lng: 106.350, kind: "khu-cong-nghiep", industries: ["luyen-kim-thep", "logistics-cang-bien", "nang-luong"], orgs: ["Formosa Hà Tĩnh", "Nhiệt điện Vũng Áng"], note: "Trung tâm luyện thép & cảng biển lớn miền Trung." },
	{ id: "nghi-son", name: "KKT Nghi Sơn (Lọc dầu Thanh Hóa)", provinceCode: "38", lat: 19.350, lng: 105.790, kind: "nang-luong-dau-khi", industries: ["dau-khi", "logistics-cang-bien", "nang-luong"], orgs: ["Lọc hóa dầu Nghi Sơn", "Nhiệt điện Nghi Sơn"], note: "Nhà máy lọc hóa dầu & cảng nước sâu." },
	{ id: "dung-quat", name: "KKT Dung Quất (Hòa Phát & Lọc dầu)", provinceCode: "51", lat: 15.388, lng: 108.792, kind: "khu-cong-nghiep", industries: ["luyen-kim-thep", "dau-khi", "logistics-cang-bien"], orgs: ["Hòa Phát Dung Quất", "Lọc dầu Bình Sơn (BSR)", "Doosan Vina"], note: "Khu liên hợp gang thép Hòa Phát + nhà máy lọc dầu đầu tiên của VN." },
	{ id: "chu-lai", name: "KKT mở Chu Lai (THACO)", provinceCode: "48", lat: 15.412, lng: 108.700, kind: "khu-cong-nghiep", industries: ["co-khi-che-tao", "logistics-cang-bien"], orgs: ["THACO Trường Hải", "THACO Industries"], note: "Trung tâm cơ khí ô tô lớn nhất miền Trung." },
	{ id: "shtp-hcm", name: "Khu Công nghệ cao TP.HCM (SHTP)", provinceCode: "79", lat: 10.852, lng: 106.795, kind: "khu-cong-nghe-cao", industries: ["cntt", "dien-tu", "co-khi-che-tao"], orgs: ["Intel Products Vietnam", "Samsung SEHC", "NIDEC"], note: "Trung tâm vi mạch & công nghệ cao phía Nam." },
	{ id: "vsip-binh-duong", name: "VSIP Bình Dương", provinceCode: "79", lat: 11.053, lng: 106.668, kind: "khu-cong-nghiep", industries: ["co-khi-che-tao", "dien-tu", "logistics-cang-bien"], orgs: ["VSIP", "Procter & Gamble", "Kumho"], note: "Hệ thống KCN kiểu mẫu, thu hút FDI lớn." },
	{ id: "cai-mep", name: "Cụm cảng Cái Mép - Thị Vải", provinceCode: "79", lat: 10.530, lng: 107.020, kind: "cang-logistics", industries: ["logistics-cang-bien", "dau-khi"], orgs: ["Cảng Cái Mép Thượng", "TCIT", "Gemalink"], note: "Cảng nước sâu trung chuyển quốc tế lớn nhất VN." },
	{ id: "vung-tau-dau-khi", name: "Trung tâm Dầu khí Vũng Tàu", provinceCode: "79", lat: 10.346, lng: 107.084, kind: "nang-luong-dau-khi", industries: ["dau-khi", "nang-luong", "logistics-cang-bien"], orgs: ["PetroVietnam (PVN)", "Vietsovpetro", "PTSC"], note: "Đầu não khai thác & dịch vụ dầu khí biển." },
	{ id: "long-thanh", name: "Sân bay quốc tế Long Thành", provinceCode: "75", lat: 10.815, lng: 107.040, kind: "cang-logistics", industries: ["hang-khong", "logistics-cang-bien", "xay-dung"], orgs: ["ACV", "Vietnam Airlines"], note: "Siêu dự án cảng hàng không quốc tế lớn nhất VN." },
	{ id: "da-nang-it", name: "Khu CNTT tập trung Đà Nẵng (FPT Complex)", provinceCode: "48", lat: 16.015, lng: 108.250, kind: "khu-cong-nghe-cao", industries: ["cntt", "du-lich-dich-vu"], orgs: ["FPT Software Đà Nẵng", "Axon"], note: "Trung tâm phần mềm & dịch vụ số miền Trung." },

	// ====== Du lịch / nông nghiệp / tài chính ======
	{ id: "ha-long", name: "Vịnh Hạ Long", provinceCode: "22", lat: 20.910, lng: 107.184, kind: "du-lich", industries: ["du-lich-dich-vu"], orgs: ["Sun Group", "Tuần Châu"], note: "Di sản thiên nhiên thế giới, trung tâm du lịch Bắc Bộ." },
	{ id: "phu-quoc", name: "Đảo Phú Quốc", provinceCode: "91", lat: 10.227, lng: 103.960, kind: "du-lich", industries: ["du-lich-dich-vu", "thuy-san"], orgs: ["Vingroup", "Sun Group"], note: "Đảo du lịch nghỉ dưỡng hàng đầu phía Nam." },
	{ id: "da-lat", name: "Đà Lạt - Nông nghiệp CNC", provinceCode: "68", lat: 11.940, lng: 108.458, kind: "nong-nghiep", industries: ["nong-nghiep", "du-lich-dich-vu", "che-bien-thuc-pham"], orgs: ["Dalat Hasfarm", "Vinamilk Organic"], note: "Trung tâm rau hoa công nghệ cao & du lịch." },
	{ id: "buon-ma-thuot", name: "Buôn Ma Thuột - Thủ phủ cà phê", provinceCode: "66", lat: 12.688, lng: 108.050, kind: "nong-nghiep", industries: ["nong-nghiep", "che-bien-thuc-pham"], orgs: ["Trung Nguyên", "Intimex"], note: "Vùng cà phê xuất khẩu lớn nhất cả nước." },
	{ id: "can-tho-agri", name: "Cần Thơ - Trung tâm ĐBSCL", provinceCode: "92", lat: 10.045, lng: 105.746, kind: "nong-nghiep", industries: ["nong-nghiep", "thuy-san", "che-bien-thuc-pham"], orgs: ["Vinarice", "Gạo & thủy sản ĐBSCL"], note: "Thủ phủ vùng đồng bằng sông Cửu Long." },
	{ id: "ca-mau-khi-dien-dam", name: "Cụm Khí - Điện - Đạm Cà Mau", provinceCode: "96", lat: 9.000, lng: 105.030, kind: "nang-luong-dau-khi", industries: ["nang-luong", "dau-khi", "che-bien-thuc-pham"], orgs: ["PVCFC (Đạm Cà Mau)", "Điện lực Dầu khí"], note: "Tổ hợp khí - điện - đạm trọng điểm Nam Bộ." },
	{ id: "tphcm-finance", name: "Trung tâm tài chính TP.HCM (Q1)", provinceCode: "79", lat: 10.775, lng: 106.703, kind: "tai-chinh", industries: ["tai-chinh-ngan-hang", "cntt"], orgs: ["HOSE", "Vietcombank", "Techcombank"], note: "Trung tâm tài chính - ngân hàng lớn nhất VN." },

	// ====== Cơ quan nhà nước (ngành chính trị / hành chính) ======
	{ id: "ba-dinh", name: "Khu trung tâm chính trị Ba Đình", provinceCode: "01", lat: 21.0375, lng: 105.834, kind: "co-quan-nha-nuoc", industries: ["hanh-chinh-cong", "quoc-phong-an-ninh"], orgs: ["Văn phòng Chính phủ", "Quốc hội", "Các Bộ ngành TW"], note: "Nơi đặt trụ sở Chính phủ, Quốc hội và nhiều bộ." },
	{ id: "bo-cong-an", name: "Bộ Công an", provinceCode: "01", lat: 21.018, lng: 105.815, kind: "co-quan-nha-nuoc", industries: ["quoc-phong-an-ninh", "hanh-chinh-cong"], orgs: ["Bộ Công an"], note: "Cơ quan đầu ngành an ninh - cảnh sát." },
	{ id: "tong-cuc-thue", name: "Tổng cục Thuế & hệ thống Cục Thuế", provinceCode: "01", lat: 21.005, lng: 105.815, kind: "co-quan-nha-nuoc", industries: ["hanh-chinh-cong", "tai-chinh-ngan-hang"], orgs: ["Tổng cục Thuế", "Cục Thuế 63 tỉnh"], note: "Hệ thống thuế - tài chính công toàn quốc." },
	{ id: "toa-an-vksnd", name: "Tòa án & Viện Kiểm sát (hệ thống tư pháp)", provinceCode: "79", lat: 10.776, lng: 106.695, kind: "co-quan-nha-nuoc", industries: ["hanh-chinh-cong"], orgs: ["TAND", "VKSND", "Sở Tư pháp"], note: "Hệ thống tư pháp, thanh tra có mặt ở mọi tỉnh." },

	// ====== CHỦ QUYỀN BIỂN ĐẢO (không thể thiếu) ======
	{ id: "truong-sa", name: "Huyện đảo Trường Sa", provinceCode: "56", lat: 8.644, lng: 111.920, kind: "chu-quyen-bien-dao", industries: ["quoc-phong-an-ninh", "thuy-san", "logistics-cang-bien"], orgs: ["Huyện Trường Sa (Khánh Hòa)"], note: "Quần đảo Trường Sa thuộc chủ quyền Việt Nam." },
	{ id: "hoang-sa", name: "Huyện đảo Hoàng Sa", provinceCode: "48", lat: 16.500, lng: 112.000, kind: "chu-quyen-bien-dao", industries: ["quoc-phong-an-ninh", "thuy-san", "logistics-cang-bien"], orgs: ["Huyện Hoàng Sa (Đà Nẵng)"], note: "Quần đảo Hoàng Sa thuộc chủ quyền Việt Nam." },
]
