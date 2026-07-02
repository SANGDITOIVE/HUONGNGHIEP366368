// =============================================================
// 8 CỤM MVP — mỗi cụm tự chứa: RIASEC tham chiếu, năng lực nhấn,
// liên kết lĩnh vực ngành, và DỮ LIỆU ĐẦU RA (Layer 3) nhúng sẵn
// để hệ thống chạy được không phụ thuộc API ngoài.
// Số liệu lương/tỉ lệ là KHOẢNG THAM KHẢO thị trường VN 2024-2025.
// =============================================================
import type { RiasecKey, OutcomeSchool } from "@/lib/dj/types"

export interface ClusterDef {
	id: string
	name: string
	tagline: string
	icon: string
	riasecAffinity: Partial<Record<RiasecKey, number>> // trọng số 0..1
	aptitudeFocus: string[]
	majorFieldId: string // liên kết src/data/majorFields.ts
	sampleMajors: string[]
	schools: OutcomeSchool[]
	altPaths: string
	darkSide: string
}

export const CLUSTERS: ClusterDef[] = [
	{
		id: "cntt",
		name: "Công nghệ thông tin & phần mềm",
		tagline: "Xây dựng sản phẩm số, lập trình, dữ liệu, AI.",
		icon: "\ud83d\udcbb",
		riasecAffinity: { I: 0.9, C: 0.5, R: 0.4, A: 0.3 },
		aptitudeFocus: ["logic", "numeric"],
		majorFieldId: "cong-nghe",
		sampleMajors: ["Kỹ thuật phần mềm", "Khoa học máy tính", "Trí tuệ nhân tạo", "An toàn thông tin"],
		schools: [
			{ name: "ĐH Bách Khoa Hà Nội", employRate: 95, salaryStart: 15, salary5yMedian: 35, tuitionYear: 30, roiNote: "ROI cao, cầu nhân lực lớn", source: "Tham khảo báo cáo việc làm 2024" },
			{ name: "ĐH Công nghệ - ĐHQG HN", employRate: 93, salaryStart: 14, salary5yMedian: 32, tuitionYear: 28, roiNote: "ROI cao", source: "Tham khảo" },
			{ name: "ĐH FPT", employRate: 92, salaryStart: 13, salary5yMedian: 30, tuitionYear: 70, roiNote: "Học phí cao, mạng lưới DN tốt", source: "Tham khảo" },
		],
		altPaths: "Có thể vào nghề qua bộtăng tự học + bootcamp + portfolio GitHub, không bắt buộc đại học top.",
		darkSide: "Áp lực cập nhật công nghệ liên tục, deadline, ngồi màn hình lâu, dễ burnout.",
	},
	{
		id: "kinh-te",
		name: "Kinh tế, Kinh doanh & Tài chính",
		tagline: "Quản trị, marketing, tài chính, khởi nghiệp.",
		icon: "\ud83d\udcc8",
		riasecAffinity: { E: 0.9, C: 0.6, S: 0.4, I: 0.3 },
		aptitudeFocus: ["numeric", "verbal"],
		majorFieldId: "kinh-te",
		sampleMajors: ["Quản trị kinh doanh", "Marketing", "Tài chính - Ngân hàng", "Logistics"],
		schools: [
			{ name: "ĐH Kinh tế Quốc dân", employRate: 90, salaryStart: 12, salary5yMedian: 28, tuitionYear: 25, roiNote: "Thương hiệu mạnh", source: "Tham khảo" },
			{ name: "ĐH Ngoại thương", employRate: 91, salaryStart: 13, salary5yMedian: 30, tuitionYear: 25, roiNote: "Mạng lưới tốt", source: "Tham khảo" },
			{ name: "ĐH Kinh tế TP.HCM", employRate: 89, salaryStart: 12, salary5yMedian: 27, tuitionYear: 24, roiNote: "Ổn định", source: "Tham khảo" },
		],
		altPaths: "Khởi nghiệp sớm, freelance marketing, chứng chỉ nghề (ACCA, CFA) thay cho học hàm.",
		darkSide: "Cạnh tranh cao, áp lực doanh số/KPI, nhiều vị trí bão hòa ở đầu vào.",
	},
	{
		id: "y-duoc",
		name: "Y - Dược & Chăm sóc sức khỏe",
		tagline: "Khám chữa bệnh, điều dưỡng, dược, y tế cộng đồng.",
		icon: "\ud83e\ude7a",
		riasecAffinity: { I: 0.8, S: 0.7, R: 0.4, C: 0.4 },
		aptitudeFocus: ["logic", "verbal"],
		majorFieldId: "y-te",
		sampleMajors: ["Y khoa", "Dược học", "Điều dưỡng", "Kỹ thuật xét nghiệm"],
		schools: [
			{ name: "ĐH Y Hà Nội", employRate: 96, salaryStart: 10, salary5yMedian: 25, tuitionYear: 27, roiNote: "Học dài 6 năm, ổn định lâu dài", source: "Tham khảo" },
			{ name: "ĐH Y Dược TP.HCM", employRate: 95, salaryStart: 10, salary5yMedian: 24, tuitionYear: 55, roiNote: "Học phí tăng mạnh", source: "Tham khảo" },
			{ name: "ĐH Dược Hà Nội", employRate: 94, salaryStart: 11, salary5yMedian: 26, tuitionYear: 26, roiNote: "Ổn định", source: "Tham khảo" },
		],
		altPaths: "Điều dưỡng/kỹ thuật y học cao đẳng rồi liên thông; xuất khẩu lao động điều dưỡng.",
		darkSide: "Học rất dài và tốn kém, trực đêm, áp lực sinh mạng, lương đầu nghề thấp so với thời gian học.",
	},
	{
		id: "ky-thuat",
		name: "Kỹ thuật & Công nghệ kỹ thuật",
		tagline: "Cơ khí, điện - điện tử, tự động hóa, xây dựng.",
		icon: "\u2699\ufe0f",
		riasecAffinity: { R: 0.9, I: 0.6, C: 0.4 },
		aptitudeFocus: ["spatial", "logic", "numeric"],
		majorFieldId: "ky-thuat",
		sampleMajors: ["Kỹ thuật cơ khí", "Kỹ thuật điện", "Tự động hóa", "Kỹ thuật ô tô"],
		schools: [
			{ name: "ĐH Bách Khoa Hà Nội", employRate: 92, salaryStart: 12, salary5yMedian: 28, tuitionYear: 30, roiNote: "Cầu cao khối sản xuất", source: "Tham khảo" },
			{ name: "ĐH Bách Khoa TP.HCM", employRate: 91, salaryStart: 12, salary5yMedian: 27, tuitionYear: 30, roiNote: "Mạnh cơ khí", source: "Tham khảo" },
			{ name: "ĐH Sư phạm Kỹ thuật TP.HCM", employRate: 90, salaryStart: 11, salary5yMedian: 24, tuitionYear: 22, roiNote: "Thực hành tốt", source: "Tham khảo" },
		],
		altPaths: "Cao đẳng nghề + chứng chỉ kỹ thuật; làm kỹ thuật viên rồi nâng bậc.",
		darkSide: "Môi trường xưởng/công trường, đi công tác xa, công việc tiềm ẩn rủi ro an toàn.",
	},
	{
		id: "ngon-ngu",
		name: "Ngôn ngữ & Quan hệ quốc tế",
		tagline: "Ngôn ngữ, biên phiên dịch, đối ngoại, du lịch.",
		icon: "\ud83c\udf10",
		riasecAffinity: { A: 0.7, S: 0.7, E: 0.4, I: 0.3 },
		aptitudeFocus: ["verbal"],
		majorFieldId: "ngon-ngu",
		sampleMajors: ["Ngôn ngữ Anh", "Ngôn ngữ Trung/Nhật/Hàn", "Quan hệ quốc tế", "Du lịch"],
		schools: [
			{ name: "ĐH Ngoại ngữ - ĐHQG HN", employRate: 88, salaryStart: 11, salary5yMedian: 24, tuitionYear: 24, roiNote: "Rộng đầu ra", source: "Tham khảo" },
			{ name: "ĐH Hà Nội", employRate: 87, salaryStart: 10, salary5yMedian: 22, tuitionYear: 22, roiNote: "Ổn định", source: "Tham khảo" },
			{ name: "ĐH KHXH&NV TP.HCM", employRate: 85, salaryStart: 10, salary5yMedian: 21, tuitionYear: 20, roiNote: "Đa dạng ngành", source: "Tham khảo" },
		],
		altPaths: "Chứng chỉ ngôn ngữ (IELTS, HSK, JLPT) + freelance dịch/teaching online.",
		darkSide: "Dễ bị thay thế bởi AI dịch thuật, thu nhập phân hóa mạnh theo năng lực.",
	},
	{
		id: "thiet-ke",
		name: "Thiết kế & Nghệ thuật sáng tạo",
		tagline: "Thiết kế đồ họa, UX/UI, kiến trúc, truyền thông.",
		icon: "\ud83c\udfa8",
		riasecAffinity: { A: 0.9, R: 0.4, E: 0.4, I: 0.3 },
		aptitudeFocus: ["spatial", "verbal"],
		majorFieldId: "kien-truc-thiet-ke",
		sampleMajors: ["Thiết kế đồ họa", "Thiết kế nội thất", "Kiến trúc", "Truyền thông đa phương tiện"],
		schools: [
			{ name: "ĐH Mỹ thuật Công nghiệp", employRate: 84, salaryStart: 10, salary5yMedian: 24, tuitionYear: 22, roiNote: "Portfolio quan trọng hơn bằng", source: "Tham khảo" },
			{ name: "ĐH Kiến trúc Hà Nội", employRate: 86, salaryStart: 11, salary5yMedian: 26, tuitionYear: 24, roiNote: "Kiến trúc học dài", source: "Tham khảo" },
			{ name: "ĐH FPT (Design)", employRate: 85, salaryStart: 11, salary5yMedian: 25, tuitionYear: 70, roiNote: "Học phí cao", source: "Tham khảo" },
		],
		altPaths: "Tự học + dựng portfolio Behance/Dribbble; freelance design; bootcamp UX/UI.",
		darkSide: "Thu nhập bấp bênh giai đoạn đầu, khách hàng sửa nhiều, cạnh tranh gắt.",
	},
	{
		id: "su-pham",
		name: "Sư phạm & Giáo dục",
		tagline: "Giảng dạy, giáo dục, đào tạo, quản lý giáo dục.",
		icon: "\ud83d\udcda",
		riasecAffinity: { S: 0.9, A: 0.4, C: 0.4, I: 0.3 },
		aptitudeFocus: ["verbal", "logic"],
		majorFieldId: "su-pham",
		sampleMajors: ["Sư phạm Toán/Văn/Anh", "Giáo dục tiểu học", "Giáo dục mầm non", "Quản lý giáo dục"],
		schools: [
			{ name: "ĐH Sư phạm Hà Nội", employRate: 88, salaryStart: 8, salary5yMedian: 16, tuitionYear: 0, roiNote: "Miễn học phí nếu cam kết theo nghề", source: "Tham khảo NĐ 116" },
			{ name: "ĐH Sư phạm TP.HCM", employRate: 87, salaryStart: 8, salary5yMedian: 16, tuitionYear: 0, roiNote: "Hỗ trợ sinh hoạt phí", source: "Tham khảo" },
			{ name: "ĐH Giáo dục - ĐHQG HN", employRate: 86, salaryStart: 8, salary5yMedian: 17, tuitionYear: 15, roiNote: "Ổn định", source: "Tham khảo" },
		],
		altPaths: "Chứng chỉ nghiệp vụ sư phạm + dạy trung tâm/online; gia sư; đào tạo doanh nghiệp.",
		darkSide: "Lương khởi điểm thấp, áp lực hồ sơ - thành tích, biên chế cạnh tranh.",
	},
	{
		id: "tam-ly-xa-hoi",
		name: "Tâm lý & Khoa học xã hội",
		tagline: "Tâm lý học, công tác xã hội, luật, báo chí.",
		icon: "\ud83e\udde0",
		riasecAffinity: { S: 0.8, I: 0.6, A: 0.4, E: 0.3 },
		aptitudeFocus: ["verbal", "logic"],
		majorFieldId: "tam-ly",
		sampleMajors: ["Tâm lý học", "Công tác xã hội", "Luật", "Báo chí - Truyền thông"],
		schools: [
			{ name: "ĐH KHXH&NV - ĐHQG HN", employRate: 83, salaryStart: 9, salary5yMedian: 20, tuitionYear: 22, roiNote: "Đa dạng ngành", source: "Tham khảo" },
			{ name: "ĐH Luật Hà Nội", employRate: 85, salaryStart: 10, salary5yMedian: 24, tuitionYear: 24, roiNote: "Phân hóa theo năng lực", source: "Tham khảo" },
			{ name: "Học viện Báo chí & Tuyên truyền", employRate: 84, salaryStart: 9, salary5yMedian: 21, tuitionYear: 20, roiNote: "Mạng lưới tốt", source: "Tham khảo" },
		],
		altPaths: "Chứng chỉ tham vấn/coaching; viết nội dung freelance; trợ lý pháp lý.",
		darkSide: "Đầu ra phân hóa, một số ngành khó xin việc đúng chuyên môn, cần học lên cao.",
	},
]

export function getCluster(id: string): ClusterDef | undefined {
	return CLUSTERS.find((c) => c.id === id)
}
