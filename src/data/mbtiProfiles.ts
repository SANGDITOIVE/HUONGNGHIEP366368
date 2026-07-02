import type { MBTIProfile, MBTIType } from "@/types"

// Nguồn: mbti_traits.csv (16 type, 4 nhóm khí chất).
// summary/strengths/watchOuts được biên tập thêm, trung thực, không tâng bốc.
export const MBTI_PROFILES: Record<MBTIType, MBTIProfile> = {
	INTJ: {
		type: "INTJ",
		nickname: "Kiến trúc sư",
		temperament: "NT",
		temperamentLabel: "Các Nhà Phân Tích (NT)",
		traits: ["Độc lập", "Sắc bén", "Thiên tư logic", "Yêu thích số liệu"],
		populationShare: "2%",
		summary:
			"Thích lập kế hoạch dài hạn, làm việc độc lập và giải bài toán phức tạp bằng tư duy hệ thống.",
		strengths: ["Tư duy chiến lược", "Tự chủ cao", "Phân tích sâu"],
		watchOuts: ["Đôi khi quá cầu toàn", "Ít chú ý cảm xúc người khác"],
	},
	INTP: {
		type: "INTP",
		nickname: "Nhà logic",
		temperament: "NT",
		temperamentLabel: "Các Nhà Phân Tích (NT)",
		traits: ["Tư duy phân tích", "Nghiên cứu", "Triết học", "Sáng tạo"],
		populationShare: "3%",
		summary:
			"Tò mò với nguyên lý vận hành của mọi thứ, thích khám phá ý tưởng mới và mô hình trừu tượng.",
		strengths: ["Tư duy trừu tượng", "Giải quyết vấn đề", "Khách quan"],
		watchOuts: ["Dễ trì hoãn việc thực thi", "Ngại công việc lặp lại"],
	},
	ENTJ: {
		type: "ENTJ",
		nickname: "Thống lĩnh",
		temperament: "NT",
		temperamentLabel: "Các Nhà Phân Tích (NT)",
		traits: ["Lãnh đạo", "Quyết đoán", "Quản lý", "Chiến lược"],
		populationShare: "3%",
		summary:
			"Thiên hướng dẫn dắt, tổ chức nguồn lực và đặt mục tiêu rõ ràng để đạt kết quả.",
		strengths: ["Lãnh đạo tự nhiên", "Quyết đoán", "Tư duy mục tiêu"],
		watchOuts: ["Có thể áp đặt", "Thiếu kiên nhẫn với chi tiết nhỏ"],
	},
	ENTP: {
		type: "ENTP",
		nickname: "Người tranh luận",
		temperament: "NT",
		temperamentLabel: "Các Nhà Phân Tích (NT)",
		traits: ["Năng động", "Tư duy phản biện", "Sáng tạo", "Mạo hiểm"],
		populationShare: "3%",
		summary:
			"Thích thử ý tưởng mới, tranh luận và nhìn vấn đề từ nhiều góc độ khác nhau.",
		strengths: ["Linh hoạt", "Giàu ý tưởng", "Phản biện tốt"],
		watchOuts: ["Dễ phân tán", "Khó theo việc dài hạn"],
	},
	INFJ: {
		type: "INFJ",
		nickname: "Người cố vấn",
		temperament: "NF",
		temperamentLabel: "Các Nhà Ngoại Giao (NF)",
		traits: ["Sâu sắc", "Thấu cảm", "Lý tưởng hóa", "Truyền cảm hứng"],
		populationShare: "2%",
		summary:
			"Quan tâm tới ý nghĩa và con người, thích giúp người khác phát triển theo chiều sâu.",
		strengths: ["Thấu cảm", "Định hướng giá trị", "Kiên định"],
		watchOuts: ["Dễ kỳ vọng quá cao", "Ngại xung đột"],
	},
	INFP: {
		type: "INFP",
		nickname: "Người lý tưởng hóa",
		temperament: "NF",
		temperamentLabel: "Các Nhà Ngoại Giao (NF)",
		traits: ["Chu đáo", "Nhiệt tình", "Sáng tạo", "Giá trị cá nhân cao"],
		populationShare: "4%",
		summary:
			"Sống theo giá trị riêng, giàu trí tưởng tượng và thích công việc có ý nghĩa cá nhân.",
		strengths: ["Sáng tạo", "Chân thành", "Linh hoạt"],
		watchOuts: ["Dễ lý tưởng hóa", "Khó với áp lực số liệu khô khan"],
	},
	ENFJ: {
		type: "ENFJ",
		nickname: "Người thầy",
		temperament: "NF",
		temperamentLabel: "Các Nhà Ngoại Giao (NF)",
		traits: ["Hướng ngoại", "Quan tâm", "Lãnh đạo", "Kết nối"],
		populationShare: "2%",
		summary:
			"Giỏi truyền cảm hứng và gắn kết tập thể, thường đặt sự phát triển của người khác lên cao.",
		strengths: ["Kết nối người", "Truyền cảm hứng", "Tổ chức nhóm"],
		watchOuts: ["Dễ quên nhu cầu bản thân", "Nhạy cảm với phê bình"],
	},
	ENFP: {
		type: "ENFP",
		nickname: "Người truyền cảm hứng",
		temperament: "NF",
		temperamentLabel: "Các Nhà Ngoại Giao (NF)",
		traits: ["Tự do", "Sáng tạo", "Truyền cảm hứng", "Hòa đồng"],
		populationShare: "7%",
		summary:
			"Tràn năng lượng và ý tưởng, thích môi trường đa dạng và kết nối với nhiều người.",
		strengths: ["Nhiệt huyết", "Giao tiếp tốt", "Thích nghi nhanh"],
		watchOuts: ["Dễ chán việc lặp lại", "Khó tập trung dài"],
	},
	ISTJ: {
		type: "ISTJ",
		nickname: "Người trách nhiệm",
		temperament: "SJ",
		temperamentLabel: "Các Nhà Bảo Hộ (SJ)",
		traits: ["Thực tế", "Tôn trọng quy tắc", "Kỷ luật", "Đáng tin cậy"],
		populationShare: "11-13%",
		summary:
			"Làm việc có hệ thống, giữ cam kết và đề cao sự chính xác, ổn định.",
		strengths: ["Kỷ luật", "Đáng tin", "Tỉ mỉ"],
		watchOuts: ["Ngại thay đổi đột ngột", "Có thể cứng nhắc"],
	},
	ISFJ: {
		type: "ISFJ",
		nickname: "Người nuôi dưỡng",
		temperament: "SJ",
		temperamentLabel: "Các Nhà Bảo Hộ (SJ)",
		traits: ["Nhẹ nhàng", "Chăm sóc", "Đáng tin", "Kiên nhẫn"],
		populationShare: "12%",
		summary:
			"Tận tâm và chu đáo, thích hỗ trợ người khác và duy trì môi trường ổn định.",
		strengths: ["Tận tâm", "Kiên nhẫn", "Chú ý chi tiết"],
		watchOuts: ["Khó từ chối", "Ngại va chạm"],
	},
	ESTJ: {
		type: "ESTJ",
		nickname: "Người giám hộ",
		temperament: "SJ",
		temperamentLabel: "Các Nhà Bảo Hộ (SJ)",
		traits: ["Quyết đoán", "Tổ chức", "Quản lý", "Thực tế"],
		populationShare: "8%",
		summary:
			"Giỏi điều phối công việc theo quy trình rõ ràng và đưa ra quyết định dứt khoát.",
		strengths: ["Tổ chức tốt", "Thực tế", "Trách nhiệm"],
		watchOuts: ["Có thể bảo thủ", "Ít linh hoạt với cái mới"],
	},
	ESFJ: {
		type: "ESFJ",
		nickname: "Người ủng hộ",
		temperament: "SJ",
		temperamentLabel: "Các Nhà Bảo Hộ (SJ)",
		traits: ["Hòa đồng", "Quan tâm", "Xã hội", "Chăm sóc"],
		populationShare: "10%",
		summary:
			"Thân thiện và có trách nhiệm với tập thể, thích môi trường hợp tác, gắn bó.",
		strengths: ["Hợp tác", "Chu đáo", "Đáng tin"],
		watchOuts: ["Nhạy cảm với chỉ trích", "Phụ thuộc sự công nhận"],
	},
	ISTP: {
		type: "ISTP",
		nickname: "Người khéo léo",
		temperament: "SP",
		temperamentLabel: "Các Nghệ Sĩ & Thám Hiểm (SP)",
		traits: ["Tháo vát", "Kỹ thuật", "Thực dụng", "Linh hoạt"],
		populationShare: "5%",
		summary:
			"Thích thao tác thực tế, mày mò máy móc/công cụ và xử lý vấn đề ngay tại chỗ.",
		strengths: ["Thực hành tốt", "Bình tĩnh", "Linh hoạt"],
		watchOuts: ["Ngại kế hoạch dài", "Ít thích lý thuyết suông"],
	},
	ISFP: {
		type: "ISFP",
		nickname: "Nghệ sĩ",
		temperament: "SP",
		temperamentLabel: "Các Nghệ Sĩ & Thám Hiểm (SP)",
		traits: ["Sáng tạo", "Tự do", "Nghệ thuật", "Nhạy cảm"],
		populationShare: "7%",
		summary:
			"Cảm nhận thẩm mỹ tốt, thích thể hiện qua hành động cụ thể và môi trường tự do.",
		strengths: ["Thẩm mỹ", "Nhẹ nhàng", "Thực tế"],
		watchOuts: ["Ngại cạnh tranh gay gắt", "Khó với khuôn khổ cứng"],
	},
	ESTP: {
		type: "ESTP",
		nickname: "Người thám hiểm",
		temperament: "SP",
		temperamentLabel: "Các Nghệ Sĩ & Thám Hiểm (SP)",
		traits: ["Năng động", "Mạo hiểm", "Thực tế", "Quyết đoán"],
		populationShare: "4%",
		summary:
			"Hành động nhanh, thích thử thách thực tế và phản ứng linh hoạt với tình huống.",
		strengths: ["Quyết đoán", "Thực tế", "Giao tiếp tốt"],
		watchOuts: ["Dễ bốc đồng", "Ngại việc bàn giấy"],
	},
	ESFP: {
		type: "ESFP",
		nickname: "Người biểu diễn",
		temperament: "SP",
		temperamentLabel: "Các Nghệ Sĩ & Thám Hiểm (SP)",
		traits: ["Sáng tạo", "Hòa đồng", "Vui vẻ", "Thích thể hiện"],
		populationShare: "7-8%",
		summary:
			"Thích môi trường sống động, giao tiếp với mọi người và mang lại năng lượng tích cực.",
		strengths: ["Hoạt náo", "Thân thiện", "Thích nghi"],
		watchOuts: ["Khó tập trung dài", "Ngại lý thuyết khô"],
	},
}

export const MBTI_TYPES = Object.keys(MBTI_PROFILES) as MBTIType[]
