// =============================================================
// Điểm chuẩn tuyển sinh đại học 2025 (phương thức điểm thi tốt nghiệp THPT
// trừ khi ghi chú khác). Dữ liệu nghiên cứu thủ công, tổng hợp từ công bố
// chính thức của từng trường + Chinhphu.vn / VnExpress / Tuyensinh247
// (mùa công bố 22–23/8/2025).
//
// LƯU Ý QUAN TRỌNG:
// - Đây là số liệu THAM KHẢO, BẮT BUỘC đối chiếu đề án/công bố chính thức
//   của trường trước khi dùng cho quyết định thực tế.
// - `diem: null` = trường đã công bố nhưng chưa trích được con số từng ngành
//   đủ chắc → cố tình KHÔNG bịa số.
// - Khóa (key) trùng `id` trong UNIVERSITIES (src/data/universities.ts).
// =============================================================

export interface MajorAdmissionScore {
	/** Tên ngành / chương trình tại trường */
	nganh: string
	/** Điểm chuẩn 2025; null = chưa chốt số chính thức */
	diem: number | null
	/** Tổ hợp xét tuyển tiêu biểu (nếu có) */
	toHop?: string
	ghiChu?: string
}

export interface SchoolAdmission2025 {
	/** Dải điểm chuẩn toàn trường [min, max] */
	range?: [number, number]
	/** Thang điểm: 30 (mặc định), 40 (có môn nhân hệ số) hoặc 100 */
	thang?: 30 | 40 | 100
	/** Phương thức tương ứng với các con số */
	phuongThuc?: string
	/** Ngày công bố điểm chuẩn 2025 */
	congBo?: string
	/** Danh sách ngành tiêu biểu, sắp theo điểm giảm dần */
	nganh: MajorAdmissionScore[]
	ghiChu?: string
}

const DEFAULT_NOTE =
	"Điểm chuẩn 2025 theo phương thức điểm thi tốt nghiệp THPT; tham khảo, cần đối chiếu công bố chính thức của trường."

export const ADMISSION_2025: Record<string, SchoolAdmission2025> = {
	// --- Miền Bắc ---
	hust: {
		range: [19.0, 29.39], thang: 30, phuongThuc: "Điểm thi THPT (quy đổi)",
		nganh: [
			{ nganh: "Khoa học dữ liệu & Trí tuệ nhân tạo (IT-E10)", diem: 29.39 },
			{ nganh: "Khoa học máy tính (IT1)", diem: 29.19 },
			{ nganh: "Kỹ thuật Điều khiển - Tự động hóa (EE2)", diem: 28.48 },
			{ nganh: "Kỹ thuật Vi điện tử & Công nghệ nano (MS2)", diem: 28.25 },
			{ nganh: "Kỹ thuật Điện tử - Viễn thông (ET1)", diem: 28.07 },
		],
	},
	neu: {
		range: [23, 28.83], thang: 30, phuongThuc: "Điểm thi THPT (quy đổi)",
		nganh: [
			{ nganh: "Thương mại điện tử", diem: 28.83 },
			{ nganh: "Kinh doanh quốc tế", diem: 28.60 },
			{ nganh: "Truyền thông Marketing", diem: 27.61 },
			{ nganh: "Kinh tế học", diem: 26.52 },
			{ nganh: "Ngôn ngữ Anh", diem: 26.51 },
			{ nganh: "Quản trị kinh doanh thương mại", diem: 26.29 },
			{ nganh: "Luật kinh doanh", diem: 25.50 },
		],
	},
	ftu: {
		thang: 30, phuongThuc: "Điểm thi THPT, tổ hợp A00",
		nganh: [
			{ nganh: "Kinh doanh quốc tế", diem: 28, toHop: "A00" },
			{ nganh: "Kinh tế quốc tế", diem: 26.7, toHop: "A00" },
			{ nganh: "Kế toán - Kiểm toán", diem: 25.8, toHop: "A00" },
			{ nganh: "Luật thương mại quốc tế", diem: 25.7, toHop: "A00" },
		],
		ghiChu: "Điểm theo tổ hợp A00; các tổ hợp khác có thể chênh lệch.",
	},
	aof: {
		range: [21.51, 26.6], thang: 30, congBo: "22/8/2025", phuongThuc: "Điểm thi THPT (quy đổi)",
		nganh: [
			{ nganh: "Kiểm toán", diem: 26.6 },
			{ nganh: "Tài chính - Ngân hàng 2 (TCDN; Phân tích tài chính)", diem: 26.31 },
			{ nganh: "Marketing", diem: 26.23 },
			{ nganh: "Kinh tế đầu tư", diem: 25.56 },
			{ nganh: "Khoa học dữ liệu trong tài chính", diem: 25.52 },
			{ nganh: "Tài chính - Ngân hàng 1 (Thuế; Hải quan; TC quốc tế)", diem: 25.47 },
			{ nganh: "Kinh tế & quản lý nguồn lực tài chính", diem: 25.43 },
			{ nganh: "Tài chính - Ngân hàng 3 (Ngân hàng; Đầu tư tài chính)", diem: 25.4 },
			{ nganh: "Luật kinh doanh", diem: 25.12 },
			{ nganh: "Tin học tài chính kế toán", diem: 25.07 },
			{ nganh: "Kế toán doanh nghiệp; Kế toán công", diem: 25.01 },
			{ nganh: "Quản trị doanh nghiệp; QTKD du lịch", diem: 24.98 },
			{ nganh: "Trí tuệ nhân tạo trong tài chính kế toán", diem: 24.97 },
			{ nganh: "Toán tài chính", diem: 24.57 },
			{ nganh: "Tiếng Anh tài chính kế toán", diem: 24.1 },
			{ nganh: "Quản lý tài chính công", diem: 22.55 },
			{ nganh: "Thẩm định giá & kinh doanh bất động sản", diem: 21.51 },
		],
	},
	bav: {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Kinh tế đầu tư", diem: 24.38 }],
	},
	hlu: {
		thang: 30, phuongThuc: "Điểm thi THPT, tổ hợp C00",
		nganh: [{ nganh: "Luật kinh tế", diem: 28.79, toHop: "C00", ghiChu: "đã gồm điểm ưu tiên" }],
	},
	"law-vnu": {
		range: [23.72, 24.2], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Luật", diem: 24.2 }],
	},
	hmu: {
		range: [17, 28.7], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Tâm lý học", diem: 28.7, toHop: "C00" },
			{ nganh: "Y khoa", diem: 28.13 },
			{ nganh: "Răng - Hàm - Mặt", diem: 27.34 },
		],
	},
	hup: {
		range: [20, 24.5], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Dược học", diem: 24.5 }],
	},
	hnue: {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Sư phạm Lịch sử", diem: 29.06 },
			{ nganh: "Sư phạm Địa lí", diem: 28.79 },
			{ nganh: "Sư phạm Lịch sử - Địa lí", diem: 28.60 },
			{ nganh: "Sư phạm Ngữ văn", diem: 28.48 },
			{ nganh: "Sư phạm Toán", diem: 28.42 },
			{ nganh: "Sư phạm Khoa học tự nhiên", diem: 27.06 },
			{ nganh: "Sư phạm Tiếng Anh", diem: 26.30 },
			{ nganh: "Sư phạm Âm nhạc", diem: 23.75 },
			{ nganh: "Sư phạm Mỹ thuật", diem: 23.48 },
			{ nganh: "Sư phạm Công nghệ", diem: 21.75 },
		],
	},
	"ussh-vnu": {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Tâm lý học", diem: 29, toHop: "C00" },
			{ nganh: "Báo chí / Quan hệ công chúng", diem: null, ghiChu: "nhóm cao, cần đối chiếu" },
		],
	},
	"ulis-vnu": {
		range: [15.06, 30], thang: 30, congBo: "22/8/2025", phuongThuc: "Điểm thi THPT (quy đổi)",
		nganh: [
			{ nganh: "Sư phạm Tiếng Anh", diem: 30 },
			{ nganh: "Sư phạm Tiếng Trung", diem: 30 },
			{ nganh: "Sư phạm Tiếng Nhật", diem: 28.1 },
			{ nganh: "Sư phạm Tiếng Hàn Quốc", diem: 27.81 },
			{ nganh: "Ngôn ngữ Trung Quốc", diem: 27.03 },
			{ nganh: "Ngôn ngữ Anh", diem: 26.85 },
			{ nganh: "Ngôn ngữ Hàn Quốc", diem: 24.69 },
			{ nganh: "Văn hóa & truyền thông xuyên quốc gia", diem: 24.58 },
			{ nganh: "Ngôn ngữ Đức", diem: 24.56 },
			{ nganh: "Ngôn ngữ Nhật", diem: 23.93 },
			{ nganh: "Ngôn ngữ Pháp", diem: 23.47 },
			{ nganh: "Ngôn ngữ Nga", diem: 22.6 },
			{ nganh: "Tiếng Việt & Văn hóa Việt Nam", diem: 22.56 },
			{ nganh: "Ngôn ngữ Ả Rập", diem: 21.88 },
			{ nganh: "Kinh tế - Tài chính", diem: 15.06 },
		],
	},
	hanu: {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Ngôn ngữ Anh/Trung/Nhật/Hàn (nhóm cao)", diem: null, ghiChu: "cần đối chiếu" }],
	},
	huce: {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Kỹ thuật điều khiển & tự động hóa", diem: 27, ghiChu: "cao nhất trường" }],
	},
	hau: {
		range: [16.1, 26.25], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Nghệ thuật số (Thiết kế đồ họa)", diem: 24.15 },
			{ nganh: "Thiết kế đồ họa", diem: 24 },
			{ nganh: "Thiết kế nội thất", diem: 23 },
		],
	},
	ajc: {
		range: [37.64, 38.93], thang: 40, congBo: "23/8/2025", phuongThuc: "Điểm thi THPT (môn chính nhân hệ số 2)",
		nganh: [
			{ nganh: "Quan hệ công chúng (Truyền thông marketing)", diem: 38.93, toHop: "D01;D14;X78;X79" },
			{ nganh: "Truyền thông đa phương tiện", diem: 38.93 },
			{ nganh: "Quan hệ công chúng chuyên nghiệp", diem: 38.67 },
			{ nganh: "Truyền thông quốc tế", diem: 38.5 },
			{ nganh: "Truyền thông đại chúng", diem: 38.28 },
			{ nganh: "Quan hệ quốc tế (QHQT & Truyền thông toàn cầu)", diem: 38.27 },
			{ nganh: "Quan hệ quốc tế (Thông tin đối ngoại; QH chính trị & TTQT)", diem: 37.64 },
		],
		ghiChu: "Điểm theo thang 40 (đã nhân hệ số môn chính), không so trực tiếp với thang 30.",
	},
	dav: {
		range: [24.17, 26.09], thang: 30, congBo: "22/8/2025", phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Trung Quốc học", diem: 26.09 },
			{ nganh: "Quan hệ quốc tế", diem: 25.95 },
			{ nganh: "Truyền thông quốc tế", diem: 25.9 },
			{ nganh: "Ngôn ngữ Anh", diem: 25.28 },
			{ nganh: "Hàn Quốc học", diem: 25.1 },
			{ nganh: "Luật quốc tế", diem: 24.95 },
			{ nganh: "Kinh doanh quốc tế", diem: 24.75 },
			{ nganh: "Luật thương mại quốc tế", diem: 24.7 },
			{ nganh: "Kinh tế quốc tế", diem: 24.45 },
			{ nganh: "Nhật Bản học", diem: 24.43 },
			{ nganh: "Hoa Kỳ học", diem: 24.17 },
		],
	},
	utc: {
		range: [17.94, 27.52], thang: 30, phuongThuc: "Điểm thi THPT (cơ sở phía Bắc)",
		nganh: [
			{ nganh: "Logistics & quản lý chuỗi cung ứng", diem: 27.52 },
			{ nganh: "Kỹ thuật điều khiển - TĐH (Hệ thống giao thông thông minh)", diem: 25.56 },
			{ nganh: "Kỹ thuật điều khiển - TĐH (Tự động hóa)", diem: 25.42 },
			{ nganh: "Kỹ thuật điều khiển - TĐH (Tín hiệu đường sắt hiện đại)", diem: 24.39 },
			{ nganh: "Kỹ thuật ô tô (gồm lớp kỹ sư tài năng)", diem: 23.66 },
			{ nganh: "Kỹ thuật xây dựng công trình giao thông", diem: 17.94 },
		],
	},
	fpt: {
		range: [17, 18.5], thang: 30, phuongThuc: "Xét điểm thi THPT (tổ hợp linh hoạt)",
		nganh: [{ nganh: "Xét THPT (ngưỡng đảm bảo chất lượng)", diem: 18.5 }],
	},

	// --- Miền Nam ---
	hcmut: {
		range: [55.05, 85.41], thang: 100, phuongThuc: "Xét tuyển kết hợp (thang 100)",
		nganh: [
			{ nganh: "Khoa học Máy tính", diem: 85.41 },
			{ nganh: "Kỹ thuật Máy tính", diem: 82.91 },
		],
		ghiChu: "Điểm theo thang 100 của phương thức kết hợp; không so trực tiếp với thang 30.",
	},
	uit: {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Trí tuệ nhân tạo", diem: null, ghiChu: "nhóm cao nhất ~28+, cần đối chiếu" },
			{ nganh: "Khoa học máy tính / An toàn thông tin", diem: null, ghiChu: "cần đối chiếu" },
		],
		ghiChu: "Trường đã công bố 2025; chưa trích được số từng ngành đủ chắc.",
	},
	ueh: {
		range: [22.8, 27.7], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Logistics & Quản lý chuỗi cung ứng", diem: 27.7 },
			{ nganh: "Công nghệ Marketing", diem: 26.65 },
			{ nganh: "Marketing", diem: 26.5 },
			{ nganh: "Kinh doanh quốc tế", diem: 26.3 },
			{ nganh: "Thương mại điện tử", diem: 26.1 },
			{ nganh: "Khoa học dữ liệu", diem: 26.0 },
			{ nganh: "Luật kinh doanh quốc tế", diem: 24.9 },
			{ nganh: "Luật kinh tế", diem: 24.65 },
			{ nganh: "Khoa học máy tính", diem: 24 },
		],
	},
	hcmulaw: {
		range: [18.55, 25.65], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Luật / Luật KT / Luật TMQT", diem: null, ghiChu: "đã công bố, cần đối chiếu số từng ngành" }],
	},
	ump: {
		range: [16, 27.34], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [
			{ nganh: "Y khoa", diem: 27.34 },
			{ nganh: "Răng - Hàm - Mặt", diem: 26.45 },
			{ nganh: "Dược học", diem: 23.65 },
			{ nganh: "Y tế công cộng", diem: 16 },
		],
	},
	pntu: {
		range: [18, 25.55], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Y khoa", diem: 25.55, ghiChu: "dải toàn trường 18–25,55" }],
	},
	hcmue: {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Ngành cao nhất trường", diem: 29.38, ghiChu: "cần đối chiếu từng ngành" }],
	},
	"ussh-hcm": {
		range: [20, 28.55], thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Báo chí / Tâm lý / QHQT (nhóm cao)", diem: 28.55 }],
	},
	uah: {
		thang: 30, phuongThuc: "Điểm thi THPT",
		nganh: [{ nganh: "Kiến trúc / TK nội thất / TKĐH", diem: null, ghiChu: "đã công bố, cần đối chiếu" }],
	},
}

/** Mô tả ngắn dải điểm chuẩn để hiển thị nhanh trên thẻ trường. */
export function admissionRangeLabel(id: string): string | null {
	const a = ADMISSION_2025[id]
	if (!a) return null
	const suffix = a.thang && a.thang !== 30 ? ` (thang ${a.thang})` : ""
	if (a.range) return `${fmt(a.range[0])}–${fmt(a.range[1])}${suffix}`
	const nums = a.nganh.map((n) => n.diem).filter((d): d is number => d != null)
	if (nums.length === 0) return null
	const min = Math.min(...nums)
	const max = Math.max(...nums)
	return min === max ? `${fmt(max)}${suffix}` : `${fmt(min)}–${fmt(max)}${suffix}`
}

function fmt(n: number): string {
	return n.toFixed(2).replace(/\.?0+$/, "").replace(".", ",")
}

export { DEFAULT_NOTE as ADMISSION_DEFAULT_NOTE }
