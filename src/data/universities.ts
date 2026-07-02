import type { University, UniversityProgram } from "@/types"

// =============================================================
// Trường đại học Việt Nam (dữ liệu nghiên cứu thủ công, có thể bổ sung).
// Lưu ý: KHÔNG phải xếp hạng quốc gia chính thức. Xem methodology ở /gioi-thieu.
// =============================================================

export const UNIVERSITIES: University[] = [
	// --- Miền Bắc ---
	{ id: "hust", name: "Đại học Bách khoa Hà Nội", shortName: "Bách khoa HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hust.edu.vn" },
	{ id: "uet-vnu", name: "Trường ĐH Công nghệ – ĐHQG Hà Nội", shortName: "UET – ĐHQGHN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://uet.vnu.edu.vn" },
	{ id: "neu", name: "Đại học Kinh tế Quốc dân", shortName: "NEU", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://neu.edu.vn" },
	{ id: "ftu", name: "Đại học Ngoại thương", shortName: "FTU", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://ftu.edu.vn" },
	{ id: "aof", name: "Học viện Tài chính", shortName: "AOF", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hvtc.edu.vn" },
	{ id: "bav", name: "Học viện Ngân hàng", shortName: "Học viện Ngân hàng", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hvnh.edu.vn" },
	{ id: "hlu", name: "Đại học Luật Hà Nội", shortName: "Luật HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hlu.edu.vn" },
	{ id: "law-vnu", name: "Trường ĐH Luật – ĐHQG Hà Nội", shortName: "Luật – ĐHQGHN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://law.vnu.edu.vn" },
	{ id: "hmu", name: "Đại học Y Hà Nội", shortName: "Y HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hmu.edu.vn" },
	{ id: "hup", name: "Đại học Dược Hà Nội", shortName: "Dược HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hup.edu.vn" },
	{ id: "ndun", name: "Đại học Điều dưỡng Nam Định", shortName: "Điều dưỡng Nam Định", region: "bac", city: "Nam Định", type: "cong-lap", website: "https://ndun.edu.vn" },
	{ id: "hnue", name: "Đại học Sư phạm Hà Nội", shortName: "Sư phạm HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hnue.edu.vn" },
	{ id: "ussh-vnu", name: "Trường ĐH KHXH&NV – ĐHQG Hà Nội", shortName: "KHXH&NV HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://ussh.vnu.edu.vn" },
	{ id: "ulis-vnu", name: "Trường ĐH Ngoại ngữ – ĐHQG Hà Nội", shortName: "ULIS – ĐHQGHN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://ulis.vnu.edu.vn" },
	{ id: "hanu", name: "Đại học Hà Nội", shortName: "HANU", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hanu.vn" },
	{ id: "huce", name: "Đại học Xây dựng Hà Nội", shortName: "Xây dựng HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://huce.edu.vn" },
	{ id: "hau", name: "Đại học Kiến trúc Hà Nội", shortName: "Kiến trúc HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hau.edu.vn" },
	{ id: "uia", name: "Đại học Mỹ thuật Công nghiệp", shortName: "Mỹ thuật CN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://mythuatcongnghiep.edu.vn" },
	{ id: "ajc", name: "Học viện Báo chí và Tuyên truyền", shortName: "Báo chí – Tuyên truyền", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://ajc.hcma.vn" },
	{ id: "huc", name: "Đại học Văn hóa Hà Nội", shortName: "Văn hóa HN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://huc.edu.vn" },
	{ id: "dav", name: "Học viện Ngoại giao", shortName: "Ngoại giao", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://dav.edu.vn" },
	{ id: "utc", name: "Đại học Giao thông Vận tải", shortName: "GTVT", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://utc.edu.vn" },
	{ id: "fpt", name: "Đại học FPT", shortName: "FPT", region: "bac", city: "Hà Nội", type: "tu-thuc", website: "https://daihoc.fpt.edu.vn" },

	// --- Miền Trung ---
	{ id: "dut", name: "Trường ĐH Bách khoa – ĐH Đà Nẵng", shortName: "Bách khoa ĐN", region: "trung", city: "Đà Nẵng", type: "cong-lap", website: "https://dut.udn.vn" },
	{ id: "sp-dn", name: "Trường ĐH Sư phạm – ĐH Đà Nẵng", shortName: "Sư phạm ĐN", region: "trung", city: "Đà Nẵng", type: "cong-lap", website: "https://ued.udn.vn" },
	{ id: "hueuni-med", name: "Trường ĐH Y – Dược – ĐH Huế", shortName: "Y Dược Huế", region: "trung", city: "Huế", type: "cong-lap", website: "https://huemed-univ.edu.vn" },

	// --- Miền Nam ---
	{ id: "hcmut", name: "Trường ĐH Bách khoa – ĐHQG TP.HCM", shortName: "Bách khoa TP.HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://hcmut.edu.vn" },
	{ id: "uit", name: "Trường ĐH Công nghệ Thông tin – ĐHQG TP.HCM", shortName: "UIT – ĐHQG HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://uit.edu.vn" },
	{ id: "ueh", name: "Đại học Kinh tế TP.HCM", shortName: "UEH", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://ueh.edu.vn" },
	{ id: "uel", name: "Trường ĐH Kinh tế – Luật – ĐHQG TP.HCM", shortName: "UEL", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://uel.edu.vn" },
	{ id: "buh", name: "Đại học Ngân hàng TP.HCM", shortName: "Ngân hàng TP.HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://buh.edu.vn" },
	{ id: "hcmulaw", name: "Đại học Luật TP.HCM", shortName: "Luật TP.HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://hcmulaw.edu.vn" },
	{ id: "ump", name: "Đại học Y Dược TP.HCM", shortName: "Y Dược TP.HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://ump.edu.vn" },
	{ id: "pntu", name: "Đại học Y khoa Phạm Ngọc Thạch", shortName: "Phạm Ngọc Thạch", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://pnt.edu.vn" },
	{ id: "hcmue", name: "Đại học Sư phạm TP.HCM", shortName: "Sư phạm TP.HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://hcmue.edu.vn" },
	{ id: "ussh-hcm", name: "Trường ĐH KHXH&NV – ĐHQG TP.HCM", shortName: "KHXH&NV HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://hcmussh.edu.vn" },
	{ id: "uah", name: "Đại học Kiến trúc TP.HCM", shortName: "Kiến trúc TP.HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://uah.edu.vn" },

	// --- Bổ sung miền Bắc ---
	{ id: "tmu", name: "Đại học Thương mại", shortName: "Thương mại", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://tmu.edu.vn" },
	{ id: "ptit", name: "Học viện Công nghệ Bưu chính Viễn thông", shortName: "PTIT", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://ptit.edu.vn" },
	{ id: "tlu", name: "Đại học Thủy lợi", shortName: "Thủy lợi", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://tlu.edu.vn" },
	{ id: "vnua", name: "Học viện Nông nghiệp Việt Nam", shortName: "Nông nghiệp VN", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://vnua.edu.vn" },
	{ id: "humg", name: "Đại học Mỏ - Địa chất", shortName: "Mỏ - Địa chất", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://humg.edu.vn" },
	{ id: "epu", name: "Đại học Điện lực", shortName: "Điện lực", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://epu.edu.vn" },
	{ id: "hou", name: "Đại học Mở Hà Nội", shortName: "Mở Hà Nội", region: "bac", city: "Hà Nội", type: "cong-lap", website: "https://hou.edu.vn" },
	{ id: "phenikaa", name: "Đại học Phenikaa", shortName: "Phenikaa", region: "bac", city: "Hà Nội", type: "tu-thuc", website: "https://phenikaa-uni.edu.vn" },
	{ id: "tnut", name: "Đại học Kỹ thuật Công nghiệp - ĐH Thái Nguyên", shortName: "Kỹ thuật CN Thái Nguyên", region: "bac", city: "Thái Nguyên", type: "cong-lap", website: "https://tnut.edu.vn" },
	{ id: "tueba", name: "Đại học Kinh tế & QTKD - ĐH Thái Nguyên", shortName: "Kinh tế QTKD Thái Nguyên", region: "bac", city: "Thái Nguyên", type: "cong-lap", website: "https://tueba.edu.vn" },
	{ id: "tnu-med", name: "Đại học Y Dược - ĐH Thái Nguyên", shortName: "Y Dược Thái Nguyên", region: "bac", city: "Thái Nguyên", type: "cong-lap", website: "https://tump.edu.vn" },
	{ id: "vmu", name: "Đại học Hàng hải Việt Nam", shortName: "Hàng hải VN", region: "bac", city: "Hải Phòng", type: "cong-lap", website: "https://vimaru.edu.vn" },
	{ id: "hpu", name: "Đại học Hải Phòng", shortName: "Hải Phòng", region: "bac", city: "Hải Phòng", type: "cong-lap", website: "https://dhhp.edu.vn" },
	{ id: "utehy", name: "Đại học Sư phạm Kỹ thuật Hưng Yên", shortName: "SPKT Hưng Yên", region: "bac", city: "Hưng Yên", type: "cong-lap", website: "https://utehy.edu.vn" },
	{ id: "hdu", name: "Đại học Hồng Đức", shortName: "Hồng Đức", region: "bac", city: "Thanh Hóa", type: "cong-lap", website: "https://hdu.edu.vn" },

	// --- Bổ sung miền Trung ---
	{ id: "vinhuni", name: "Đại học Vinh", shortName: "Vinh", region: "trung", city: "Vinh", type: "cong-lap", website: "https://vinhuni.edu.vn" },
	{ id: "htu", name: "Đại học Hà Tĩnh", shortName: "Hà Tĩnh", region: "trung", city: "Hà Tĩnh", type: "cong-lap", website: "https://htu.edu.vn" },
	{ id: "due-dn", name: "Đại học Kinh tế - ĐH Đà Nẵng", shortName: "Kinh tế ĐN", region: "trung", city: "Đà Nẵng", type: "cong-lap", website: "https://due.udn.vn" },
	{ id: "vku", name: "Đại học CNTT & Truyền thông Việt - Hàn - ĐH Đà Nẵng", shortName: "VKU ĐN", region: "trung", city: "Đà Nẵng", type: "cong-lap", website: "https://vku.udn.vn" },
	{ id: "ufl-dn", name: "Đại học Ngoại ngữ - ĐH Đà Nẵng", shortName: "Ngoại ngữ ĐN", region: "trung", city: "Đà Nẵng", type: "cong-lap", website: "https://ufl.udn.vn" },
	{ id: "duytan", name: "Đại học Duy Tân", shortName: "Duy Tân", region: "trung", city: "Đà Nẵng", type: "tu-thuc", website: "https://duytan.edu.vn" },
	{ id: "hueuni-edu", name: "Đại học Sư phạm - ĐH Huế", shortName: "Sư phạm Huế", region: "trung", city: "Huế", type: "cong-lap", website: "https://dhsphue.edu.vn" },
	{ id: "hueuni-econ", name: "Đại học Kinh tế - ĐH Huế", shortName: "Kinh tế Huế", region: "trung", city: "Huế", type: "cong-lap", website: "https://hce.edu.vn" },
	{ id: "hueuni-sci", name: "Đại học Khoa học - ĐH Huế", shortName: "Khoa học Huế", region: "trung", city: "Huế", type: "cong-lap", website: "https://hueuni.edu.vn" },
	{ id: "qnu", name: "Đại học Quy Nhơn", shortName: "Quy Nhơn", region: "trung", city: "Quy Nhơn", type: "cong-lap", website: "https://qnu.edu.vn" },
	{ id: "ntu", name: "Đại học Nha Trang", shortName: "Nha Trang", region: "trung", city: "Nha Trang", type: "cong-lap", website: "https://ntu.edu.vn" },
	{ id: "dlu", name: "Đại học Đà Lạt", shortName: "Đà Lạt", region: "trung", city: "Đà Lạt", type: "cong-lap", website: "https://dlu.edu.vn" },
	{ id: "ttn", name: "Đại học Tây Nguyên", shortName: "Tây Nguyên", region: "trung", city: "Buôn Ma Thuột", type: "cong-lap", website: "https://ttn.edu.vn" },

	// --- Bổ sung miền Nam ---
	{ id: "iuh", name: "Đại học Công nghiệp TP.HCM", shortName: "Công nghiệp HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://iuh.edu.vn" },
	{ id: "hcmute", name: "Đại học Sư phạm Kỹ thuật TP.HCM", shortName: "SPKT HCM", region: "nam", city: "Thủ Đức", type: "cong-lap", website: "https://hcmute.edu.vn" },
	{ id: "nlu-hcm", name: "Đại học Nông Lâm TP.HCM", shortName: "Nông Lâm HCM", region: "nam", city: "Thủ Đức", type: "cong-lap", website: "https://hcmuaf.edu.vn" },
	{ id: "tdtu", name: "Đại học Tôn Đức Thắng", shortName: "Tôn Đức Thắng", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://tdtu.edu.vn" },
	{ id: "ou-hcm", name: "Đại học Mở TP.HCM", shortName: "Mở HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://ou.edu.vn" },
	{ id: "ufm", name: "Đại học Tài chính - Marketing", shortName: "Tài chính - Marketing", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://ufm.edu.vn" },
	{ id: "ut-hcmc", name: "Đại học Giao thông vận tải TP.HCM", shortName: "GTVT HCM", region: "nam", city: "TP.HCM", type: "cong-lap", website: "https://ut.edu.vn" },
	{ id: "hutech", name: "Đại học Công nghệ TP.HCM (HUTECH)", shortName: "HUTECH", region: "nam", city: "TP.HCM", type: "tu-thuc", website: "https://hutech.edu.vn" },
	{ id: "van-lang", name: "Đại học Văn Lang", shortName: "Văn Lang", region: "nam", city: "TP.HCM", type: "tu-thuc", website: "https://vlu.edu.vn" },
	{ id: "ntt", name: "Đại học Nguyễn Tất Thành", shortName: "Nguyễn Tất Thành", region: "nam", city: "TP.HCM", type: "tu-thuc", website: "https://ntt.edu.vn" },
	{ id: "ctu", name: "Đại học Cần Thơ", shortName: "Cần Thơ", region: "nam", city: "Cần Thơ", type: "cong-lap", website: "https://ctu.edu.vn" },
	{ id: "ctump", name: "Đại học Y Dược Cần Thơ", shortName: "Y Dược Cần Thơ", region: "nam", city: "Cần Thơ", type: "cong-lap", website: "https://ctump.edu.vn" },
	{ id: "agu", name: "Đại học An Giang", shortName: "An Giang", region: "nam", city: "Long Xuyên", type: "cong-lap", website: "https://agu.edu.vn" },
	{ id: "dthu", name: "Đại học Đồng Tháp", shortName: "Đồng Tháp", region: "nam", city: "Đồng Tháp", type: "cong-lap", website: "https://dthu.edu.vn" },
	{ id: "tvu", name: "Đại học Trà Vinh", shortName: "Trà Vinh", region: "nam", city: "Trà Vinh", type: "cong-lap", website: "https://tvu.edu.vn" },
	{ id: "lhu", name: "Đại học Lạc Hồng", shortName: "Lạc Hồng", region: "nam", city: "Biên Hòa", type: "tu-thuc", website: "https://lhu.edu.vn" },
	{ id: "tdmu", name: "Đại học Thủ Dầu Một", shortName: "Thủ Dầu Một", region: "nam", city: "Thủ Dầu Một", type: "cong-lap", website: "https://tdmu.edu.vn" },
]

// Builder gọn cho chương trình đào tạo. id = `${majorId}@${universityId}`.
function prog(
	majorId: string, universityId: string,
	reputation: number, training: number, relevance: number, recognition: number,
	note?: string,
): UniversityProgram {
	return {
		id: `${majorId}@${universityId}`,
		universityId, majorId,
		scores: {
			programReputation: reputation,
			trainingStrength: training,
			relevance, recognitionBreadth: recognition,
		},
		note,
	}
}

export const UNIVERSITY_PROGRAMS: UniversityProgram[] = [
	// Công nghệ thông tin
	prog("cong-nghe-thong-tin", "hust", 96, 95, 95, 95),
	prog("cong-nghe-thong-tin", "hcmut", 93, 92, 93, 90),
	prog("cong-nghe-thong-tin", "uet-vnu", 90, 90, 92, 88),
	prog("cong-nghe-thong-tin", "uit", 88, 88, 92, 85),
	prog("cong-nghe-thong-tin", "fpt", 82, 83, 86, 80),
	// Trí tuệ nhân tạo
	prog("tri-tue-nhan-tao", "hust", 95, 94, 95, 92),
	prog("tri-tue-nhan-tao", "uet-vnu", 90, 90, 93, 88),
	prog("tri-tue-nhan-tao", "hcmut", 90, 89, 92, 88),
	prog("tri-tue-nhan-tao", "uit", 87, 87, 92, 84),
	prog("tri-tue-nhan-tao", "fpt", 80, 82, 85, 80),
	// Kỹ thuật điện – điện tử
	prog("ky-thuat-dien-tu", "hust", 95, 94, 94, 92),
	prog("ky-thuat-dien-tu", "hcmut", 92, 91, 92, 89),
	prog("ky-thuat-dien-tu", "uet-vnu", 88, 88, 90, 85),
	prog("ky-thuat-dien-tu", "dut", 84, 84, 88, 80),
	// Kỹ thuật xây dựng
	prog("ky-thuat-xay-dung", "huce", 93, 92, 95, 88),
	prog("ky-thuat-xay-dung", "hust", 90, 89, 90, 88),
	prog("ky-thuat-xay-dung", "hcmut", 90, 89, 91, 87),
	prog("ky-thuat-xay-dung", "dut", 82, 82, 87, 78),
	// Kiến trúc
	prog("kien-truc", "hau", 92, 91, 94, 88),
	prog("kien-truc", "uah", 90, 90, 93, 86),
	prog("kien-truc", "huce", 84, 84, 88, 80),
	prog("kien-truc", "dut", 80, 80, 85, 76),
	// Thiết kế đồ họa
	prog("thiet-ke-do-hoa", "uia", 90, 89, 93, 85),
	prog("thiet-ke-do-hoa", "hau", 82, 82, 86, 80),
	prog("thiet-ke-do-hoa", "uah", 82, 81, 86, 79),
	prog("thiet-ke-do-hoa", "fpt", 80, 81, 85, 80),
	// Quản trị kinh doanh
	prog("quan-tri-kinh-doanh", "neu", 95, 93, 94, 93),
	prog("quan-tri-kinh-doanh", "ftu", 93, 91, 92, 92),
	prog("quan-tri-kinh-doanh", "ueh", 92, 90, 92, 90),
	prog("quan-tri-kinh-doanh", "uel", 86, 85, 88, 84),
	// Marketing
	prog("marketing", "neu", 93, 91, 93, 90),
	prog("marketing", "ueh", 91, 90, 92, 89),
	prog("marketing", "ftu", 88, 87, 88, 88),
	prog("marketing", "ajc", 82, 82, 86, 82),
	// Tài chính – Ngân hàng
	prog("tai-chinh-ngan-hang", "neu", 94, 92, 93, 92),
	prog("tai-chinh-ngan-hang", "ftu", 92, 90, 91, 91),
	prog("tai-chinh-ngan-hang", "aof", 90, 90, 93, 86),
	prog("tai-chinh-ngan-hang", "ueh", 91, 89, 91, 89),
	prog("tai-chinh-ngan-hang", "bav", 84, 84, 88, 82),
	// Kế toán – Kiểm toán
	prog("ke-toan-kiem-toan", "neu", 93, 91, 93, 90),
	prog("ke-toan-kiem-toan", "aof", 90, 90, 93, 86),
	prog("ke-toan-kiem-toan", "ueh", 90, 89, 91, 88),
	prog("ke-toan-kiem-toan", "uel", 85, 84, 87, 83),
	// Luật kinh tế
	prog("luat-kinh-te", "hlu", 93, 92, 94, 90),
	prog("luat-kinh-te", "hcmulaw", 91, 90, 93, 88),
	prog("luat-kinh-te", "uel", 85, 84, 88, 82),
	prog("luat-kinh-te", "law-vnu", 84, 84, 87, 82),
	// Y khoa
	prog("y-khoa", "hmu", 96, 95, 96, 94),
	prog("y-khoa", "ump", 94, 93, 95, 92),
	prog("y-khoa", "pntu", 85, 85, 90, 82),
	prog("y-khoa", "hueuni-med", 86, 86, 90, 83),
	// Điều dưỡng
	prog("dieu-duong", "hmu", 92, 91, 93, 88),
	prog("dieu-duong", "ump", 90, 90, 92, 87),
	prog("dieu-duong", "ndun", 85, 86, 92, 80),
	prog("dieu-duong", "hueuni-med", 82, 83, 88, 79),
	// Sư phạm
	prog("su-pham", "hnue", 94, 92, 94, 90),
	prog("su-pham", "hcmue", 92, 90, 93, 88),
	prog("su-pham", "sp-dn", 82, 82, 87, 78),
	// Tâm lý học
	prog("tam-ly-hoc", "ussh-vnu", 90, 89, 92, 87),
	prog("tam-ly-hoc", "ussh-hcm", 89, 88, 92, 86),
	prog("tam-ly-hoc", "hnue", 85, 85, 88, 83),
	// Ngôn ngữ Anh
	prog("ngon-ngu-anh", "ulis-vnu", 93, 92, 94, 90),
	prog("ngon-ngu-anh", "hanu", 90, 89, 92, 87),
	prog("ngon-ngu-anh", "ftu", 87, 86, 87, 88),
	// Quản trị dịch vụ du lịch & lữ hành
	prog("quan-tri-du-lich", "ueh", 88, 87, 90, 86),
	prog("quan-tri-du-lich", "hanu", 84, 84, 88, 82),
	prog("quan-tri-du-lich", "huc", 80, 81, 86, 78),
	// Khoa học dữ liệu
	prog("khoa-hoc-du-lieu", "hust", 93, 92, 93, 90),
	prog("khoa-hoc-du-lieu", "uet-vnu", 90, 90, 92, 88),
	prog("khoa-hoc-du-lieu", "uit", 87, 87, 91, 84),
	prog("khoa-hoc-du-lieu", "ueh", 85, 85, 89, 84),
	// Kỹ thuật cơ kh��
	prog("ky-thuat-co-khi", "hust", 94, 93, 93, 91),
	prog("ky-thuat-co-khi", "hcmut", 91, 90, 91, 88),
	prog("ky-thuat-co-khi", "dut", 83, 83, 87, 79),
	// Logistics & chuỗi cung ứng
	prog("logistics-chuoi-cung-ung", "ftu", 92, 90, 92, 90),
	prog("logistics-chuoi-cung-ung", "neu", 90, 89, 91, 89),
	prog("logistics-chuoi-cung-ung", "ueh", 89, 88, 90, 87),
	prog("logistics-chuoi-cung-ung", "uel", 84, 84, 87, 82),
	// Kinh doanh quốc tế
	prog("kinh-doanh-quoc-te", "ftu", 94, 92, 93, 92),
	prog("kinh-doanh-quoc-te", "neu", 91, 90, 91, 90),
	prog("kinh-doanh-quoc-te", "ueh", 90, 89, 91, 88),
	prog("kinh-doanh-quoc-te", "uel", 85, 84, 87, 83),
	// Quan hệ quốc tế
	prog("quan-he-quoc-te", "ussh-vnu", 89, 88, 91, 86),
	prog("quan-he-quoc-te", "ussh-hcm", 88, 87, 90, 85),
	prog("quan-he-quoc-te", "hanu", 85, 84, 88, 83),
	// Dược học
	prog("duoc-hoc", "hup", 94, 93, 95, 91),
	prog("duoc-hoc", "ump", 92, 91, 93, 89),
	prog("duoc-hoc", "hueuni-med", 84, 84, 89, 81),

	// =============================================================
	// Bổ sung: gắn danh sách trường cho 47 ngành trong majorsExtra.ts
	// (điểm số là chỉ số tham khảo về uy tín/đào tạo, KHÔNG phải xếp hạng
	// chính thức — cùng phương pháp với dữ liệu phía trên).
	// =============================================================
	// An toàn thông tin
	prog("an-toan-thong-tin", "ptit", 90, 89, 92, 87),
	prog("an-toan-thong-tin", "uit", 89, 88, 91, 86),
	prog("an-toan-thong-tin", "hust", 89, 88, 90, 88),
	prog("an-toan-thong-tin", "uet-vnu", 86, 86, 89, 84),
	// Hệ thống thông tin
	prog("he-thong-thong-tin", "uet-vnu", 88, 87, 90, 85),
	prog("he-thong-thong-tin", "uit", 87, 86, 90, 84),
	prog("he-thong-thong-tin", "neu", 85, 84, 88, 85),
	prog("he-thong-thong-tin", "ptit", 84, 84, 88, 82),
	// Kỹ thuật phần mềm
	prog("ky-thuat-phan-mem", "hust", 92, 91, 93, 90),
	prog("ky-thuat-phan-mem", "uit", 89, 89, 92, 86),
	prog("ky-thuat-phan-mem", "hcmut", 89, 88, 91, 87),
	prog("ky-thuat-phan-mem", "fpt", 83, 84, 87, 81),
	// Mạng máy tính & truyền thông dữ liệu
	prog("mang-may-tinh-truyen-thong", "ptit", 88, 87, 90, 85),
	prog("mang-may-tinh-truyen-thong", "uit", 87, 86, 90, 84),
	prog("mang-may-tinh-truyen-thong", "hust", 87, 86, 89, 86),
	prog("mang-may-tinh-truyen-thong", "uet-vnu", 84, 84, 88, 82),
	// Thiết kế vi mạch bán dẫn
	prog("thiet-ke-vi-mach-ban-dan", "hust", 91, 90, 93, 88),
	prog("thiet-ke-vi-mach-ban-dan", "hcmut", 89, 88, 92, 86),
	prog("thiet-ke-vi-mach-ban-dan", "uet-vnu", 87, 86, 90, 84),
	prog("thiet-ke-vi-mach-ban-dan", "uit", 85, 85, 89, 83),
	// Công nghệ tài chính (Fintech)
	prog("cong-nghe-tai-chinh", "neu", 89, 88, 91, 88),
	prog("cong-nghe-tai-chinh", "ueh", 88, 87, 90, 86),
	prog("cong-nghe-tai-chinh", "ftu", 86, 85, 89, 85),
	prog("cong-nghe-tai-chinh", "buh", 84, 83, 88, 82),
	// Kỹ thuật điện
	prog("ky-thuat-dien", "hust", 92, 91, 92, 90),
	prog("ky-thuat-dien", "hcmut", 90, 89, 91, 88),
	prog("ky-thuat-dien", "dut", 83, 83, 87, 79),
	prog("ky-thuat-dien", "epu", 82, 82, 87, 79),
	// Kỹ thuật điều khiển & tự động hóa
	prog("ky-thuat-dieu-khien-tu-dong-hoa", "hust", 92, 91, 93, 89),
	prog("ky-thuat-dieu-khien-tu-dong-hoa", "hcmut", 90, 89, 92, 87),
	prog("ky-thuat-dieu-khien-tu-dong-hoa", "dut", 83, 83, 88, 79),
	prog("ky-thuat-dieu-khien-tu-dong-hoa", "epu", 81, 81, 86, 78),
	// Kỹ thuật cơ điện tử
	prog("ky-thuat-co-dien-tu", "hust", 91, 90, 92, 89),
	prog("ky-thuat-co-dien-tu", "hcmut", 90, 89, 91, 87),
	prog("ky-thuat-co-dien-tu", "hcmute", 83, 83, 88, 80),
	prog("ky-thuat-co-dien-tu", "dut", 82, 82, 87, 78),
	// Kỹ thuật ô tô
	prog("ky-thuat-o-to", "hust", 90, 89, 91, 88),
	prog("ky-thuat-o-to", "hcmut", 88, 87, 90, 85),
	prog("ky-thuat-o-to", "hcmute", 85, 85, 89, 82),
	prog("ky-thuat-o-to", "phenikaa", 80, 80, 85, 78),
	// Kỹ thuật công trình giao thông
	prog("ky-thuat-giao-thong", "utc", 89, 88, 91, 86),
	prog("ky-thuat-giao-thong", "hcmut", 86, 85, 89, 84),
	prog("ky-thuat-giao-thong", "huce", 84, 84, 88, 82),
	prog("ky-thuat-giao-thong", "dut", 81, 81, 86, 78),
	// Kỹ thuật hóa học
	prog("ky-thuat-hoa-hoc", "hust", 90, 89, 91, 88),
	prog("ky-thuat-hoa-hoc", "hcmut", 89, 88, 90, 86),
	prog("ky-thuat-hoa-hoc", "dut", 82, 82, 87, 78),
	// Kỹ thuật vật liệu
	prog("ky-thuat-vat-lieu", "hust", 89, 88, 90, 87),
	prog("ky-thuat-vat-lieu", "hcmut", 88, 87, 90, 85),
	prog("ky-thuat-vat-lieu", "dut", 81, 81, 86, 78),
	// Kỹ thuật môi trường
	prog("ky-thuat-moi-truong", "hust", 88, 87, 89, 86),
	prog("ky-thuat-moi-truong", "hcmut", 86, 85, 88, 84),
	prog("ky-thuat-moi-truong", "tlu", 84, 84, 88, 81),
	prog("ky-thuat-moi-truong", "humg", 80, 80, 85, 77),
	// Công nghệ thực phẩm
	prog("cong-nghe-thuc-pham", "hust", 89, 88, 90, 87),
	prog("cong-nghe-thuc-pham", "vnua", 84, 84, 88, 82),
	prog("cong-nghe-thuc-pham", "iuh", 82, 82, 87, 80),
	prog("cong-nghe-thuc-pham", "ntu", 81, 81, 86, 79),
	// Răng - Hàm - Mặt
	prog("rang-ham-mat", "hmu", 94, 93, 95, 91),
	prog("rang-ham-mat", "ump", 92, 91, 93, 89),
	prog("rang-ham-mat", "hueuni-med", 84, 84, 89, 81),
	prog("rang-ham-mat", "pntu", 83, 83, 88, 80),
	// Y học cổ truyền
	prog("y-hoc-co-truyen", "hmu", 90, 89, 92, 87),
	prog("y-hoc-co-truyen", "ump", 88, 87, 91, 85),
	prog("y-hoc-co-truyen", "hueuni-med", 82, 82, 88, 79),
	// Kỹ thuật xét nghiệm y học
	prog("ky-thuat-xet-nghiem-y-hoc", "hmu", 89, 88, 91, 86),
	prog("ky-thuat-xet-nghiem-y-hoc", "ump", 88, 87, 90, 85),
	prog("ky-thuat-xet-nghiem-y-hoc", "hueuni-med", 82, 82, 88, 79),
	prog("ky-thuat-xet-nghiem-y-hoc", "tnu-med", 80, 80, 86, 78),
	// Dinh dưỡng
	prog("dinh-duong", "hmu", 88, 87, 90, 85),
	prog("dinh-duong", "ump", 86, 85, 89, 83),
	// Hộ sinh
	prog("ho-sinh", "hmu", 87, 86, 90, 84),
	prog("ho-sinh", "ump", 85, 84, 89, 82),
	prog("ho-sinh", "ndun", 83, 83, 88, 80),
	// Y tế công cộng
	prog("y-te-cong-cong", "hmu", 87, 86, 89, 85),
	prog("y-te-cong-cong", "ump", 85, 84, 88, 83),
	prog("y-te-cong-cong", "hueuni-med", 80, 80, 86, 78),
	// Luật học
	prog("luat-hoc", "hlu", 92, 91, 93, 90),
	prog("luat-hoc", "law-vnu", 89, 88, 91, 87),
	prog("luat-hoc", "hcmulaw", 89, 88, 91, 87),
	prog("luat-hoc", "vinhuni", 80, 80, 85, 78),
	// Luật quốc tế
	prog("luat-quoc-te", "hlu", 89, 88, 91, 87),
	prog("luat-quoc-te", "dav", 88, 87, 91, 85),
	prog("luat-quoc-te", "ftu", 86, 85, 90, 84),
	prog("luat-quoc-te", "hcmulaw", 85, 84, 89, 83),
	// Kinh tế học
	prog("kinh-te-hoc", "neu", 93, 92, 93, 92),
	prog("kinh-te-hoc", "ueh", 90, 89, 92, 89),
	prog("kinh-te-hoc", "ftu", 88, 87, 90, 87),
	prog("kinh-te-hoc", "uel", 84, 84, 88, 82),
	// Kinh tế đầu tư
	prog("kinh-te-dau-tu", "neu", 91, 90, 92, 90),
	prog("kinh-te-dau-tu", "ueh", 87, 86, 90, 85),
	prog("kinh-te-dau-tu", "aof", 85, 84, 89, 83),
	prog("kinh-te-dau-tu", "uel", 83, 83, 87, 81),
	// Bất động sản
	prog("bat-dong-san", "neu", 88, 87, 90, 87),
	prog("bat-dong-san", "ueh", 85, 84, 88, 83),
	prog("bat-dong-san", "tmu", 82, 82, 87, 80),
	// Thương mại điện tử
	prog("thuong-mai-dien-tu", "neu", 90, 89, 92, 88),
	prog("thuong-mai-dien-tu", "ueh", 88, 87, 91, 86),
	prog("thuong-mai-dien-tu", "ftu", 86, 85, 90, 85),
	prog("thuong-mai-dien-tu", "tmu", 84, 84, 88, 82),
	// Quản trị nhân lực
	prog("quan-tri-nhan-luc", "neu", 89, 88, 90, 88),
	prog("quan-tri-nhan-luc", "ueh", 86, 85, 89, 84),
	prog("quan-tri-nhan-luc", "tmu", 83, 83, 87, 81),
	// Quản trị khách sạn
	prog("quan-tri-khach-san", "duytan", 83, 83, 88, 80),
	prog("quan-tri-khach-san", "due-dn", 82, 82, 86, 80),
	prog("quan-tri-khach-san", "hutech", 82, 82, 87, 80),
	prog("quan-tri-khach-san", "van-lang", 81, 81, 86, 79),
	// Quản trị nhà hàng & dịch vụ ăn uống
	prog("quan-tri-nha-hang", "duytan", 82, 82, 87, 80),
	prog("quan-tri-nha-hang", "hutech", 81, 81, 86, 79),
	prog("quan-tri-nha-hang", "van-lang", 80, 80, 85, 78),
	// Báo chí
	prog("bao-chi", "ajc", 91, 90, 92, 89),
	prog("bao-chi", "ussh-vnu", 88, 87, 90, 86),
	prog("bao-chi", "ussh-hcm", 86, 85, 89, 84),
	// Quan hệ công chúng
	prog("quan-he-cong-chung", "ajc", 89, 88, 91, 87),
	prog("quan-he-cong-chung", "ussh-vnu", 86, 85, 89, 84),
	prog("quan-he-cong-chung", "van-lang", 82, 82, 87, 80),
	// Truyền thông đa phương tiện
	prog("truyen-thong-da-phuong-tien", "ajc", 88, 87, 90, 86),
	prog("truyen-thong-da-phuong-tien", "ptit", 85, 85, 89, 83),
	prog("truyen-thong-da-phuong-tien", "huc", 82, 82, 87, 80),
	prog("truyen-thong-da-phuong-tien", "duytan", 80, 80, 85, 78),
	// Xã hội học
	prog("xa-hoi-hoc", "ussh-vnu", 88, 87, 90, 85),
	prog("xa-hoi-hoc", "ussh-hcm", 86, 85, 89, 84),
	prog("xa-hoi-hoc", "hdu", 78, 78, 84, 76),
	// Công tác xã hội
	prog("cong-tac-xa-hoi", "ussh-vnu", 87, 86, 89, 85),
	prog("cong-tac-xa-hoi", "ussh-hcm", 85, 84, 88, 83),
	prog("cong-tac-xa-hoi", "vinhuni", 79, 79, 84, 77),
	// Việt Nam học
	prog("viet-nam-hoc", "ussh-vnu", 87, 86, 89, 84),
	prog("viet-nam-hoc", "ussh-hcm", 85, 84, 88, 83),
	prog("viet-nam-hoc", "hanu", 82, 82, 86, 80),
	// Đông phương học
	prog("dong-phuong-hoc", "ussh-vnu", 87, 86, 89, 84),
	prog("dong-phuong-hoc", "ussh-hcm", 85, 84, 88, 83),
	prog("dong-phuong-hoc", "hanu", 82, 82, 86, 80),
	// Ngôn ngữ Trung
	prog("ngon-ngu-trung", "ulis-vnu", 89, 88, 91, 87),
	prog("ngon-ngu-trung", "hanu", 87, 86, 90, 85),
	prog("ngon-ngu-trung", "ussh-hcm", 84, 84, 88, 82),
	prog("ngon-ngu-trung", "ufl-dn", 81, 81, 86, 79),
	// Ngôn ngữ Nhật
	prog("ngon-ngu-nhat", "ulis-vnu", 89, 88, 91, 87),
	prog("ngon-ngu-nhat", "hanu", 87, 86, 90, 85),
	prog("ngon-ngu-nhat", "ussh-hcm", 84, 84, 88, 82),
	prog("ngon-ngu-nhat", "ufl-dn", 81, 81, 86, 79),
	// Ngôn ngữ Hàn
	prog("ngon-ngu-han", "ulis-vnu", 89, 88, 91, 87),
	prog("ngon-ngu-han", "hanu", 87, 86, 90, 85),
	prog("ngon-ngu-han", "ussh-hcm", 84, 84, 88, 82),
	prog("ngon-ngu-han", "ufl-dn", 81, 81, 86, 79),
	// Giáo dục mầm non
	prog("giao-duc-mam-non", "hnue", 90, 89, 92, 88),
	prog("giao-duc-mam-non", "hcmue", 88, 87, 91, 86),
	prog("giao-duc-mam-non", "sp-dn", 83, 83, 88, 80),
	// Giáo dục tiểu học
	prog("giao-duc-tieu-hoc", "hnue", 90, 89, 92, 88),
	prog("giao-duc-tieu-hoc", "hcmue", 88, 87, 91, 86),
	prog("giao-duc-tieu-hoc", "sp-dn", 83, 83, 88, 80),
	// Sư phạm tiếng Anh
	prog("su-pham-tieng-anh", "hnue", 89, 88, 91, 87),
	prog("su-pham-tieng-anh", "ulis-vnu", 88, 87, 91, 86),
	prog("su-pham-tieng-anh", "hcmue", 87, 86, 90, 85),
	prog("su-pham-tieng-anh", "sp-dn", 82, 82, 87, 80),
	// Thiết kế nội thất
	prog("thiet-ke-noi-that", "uia", 88, 87, 90, 85),
	prog("thiet-ke-noi-that", "hau", 84, 84, 88, 82),
	prog("thiet-ke-noi-that", "uah", 84, 83, 88, 81),
	prog("thiet-ke-noi-that", "van-lang", 80, 80, 85, 78),
	// Thiết kế thời trang
	prog("thiet-ke-thoi-trang", "uia", 87, 86, 90, 84),
	prog("thiet-ke-thoi-trang", "hutech", 80, 80, 85, 78),
	prog("thiet-ke-thoi-trang", "van-lang", 80, 80, 85, 78),
	// Thiết kế công nghiệp (tạo dáng)
	prog("thiet-ke-cong-nghiep", "uia", 87, 86, 90, 84),
	prog("thiet-ke-cong-nghiep", "hau", 82, 82, 87, 80),
	prog("thiet-ke-cong-nghiep", "uah", 82, 81, 86, 79),
	// Quy hoạch vùng & đô thị
	prog("quy-hoach-do-thi", "hau", 88, 87, 90, 85),
	prog("quy-hoach-do-thi", "uah", 86, 85, 89, 83),
	prog("quy-hoach-do-thi", "huce", 83, 83, 88, 81),
	prog("quy-hoach-do-thi", "dut", 79, 79, 85, 77),
]

export const UNIVERSITY_BY_ID: Record<string, University> = Object.fromEntries(
	UNIVERSITIES.map((u) => [u.id, u]),
)

export const PROGRAM_BY_ID: Record<string, UniversityProgram> = Object.fromEntries(
	UNIVERSITY_PROGRAMS.map((p) => [p.id, p]),
)
