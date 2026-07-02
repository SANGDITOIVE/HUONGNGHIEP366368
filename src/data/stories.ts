// Câu chuyện hướng nghiệp - NHÂN VẬT MINH HOẠ.
// Đây là các lộ trình điển hình mang tính minh hoạ, không phải người có thật,
// nhằm giúp học sinh hình dung con đường từ sở thích tới nghề nghiệp.

export interface CareerStory {
	id: string
	name: string
	role: string
	fieldId: string
	avatar: string
	from: string
	quote: string
	journey: string[]
}

export const STORIES: CareerStory[] = [
	{
		id: "minh-ky-su-phan-mem",
		name: "Minh",
		role: "Kỹ sư phần mềm",
		fieldId: "cong-nghe",
		avatar: "👨‍💻",
		from: "Khối A, mạnh Toán và Tin học",
		quote: "Mình chọn ngành vì thích giải quyết vấn đề, chứ không chỉ vì lương cao.",
		journey: [
			"Cấp 3 mê giải thuật, tự học lập trình qua các bài toán trực tuyến.",
			"Chọn ngành Công nghệ thông tin, ưu tiên nền tảng vững thay vì chạy theo công nghệ thời thượng.",
			"Năm ba đi thực tập, học cách làm việc nhóm và đọc mã nguồn lớn.",
			"Hiện làm kỹ sư phần mềm và vẫn dành thời gian tự học mỗi tuần.",
		],
	},
	{
		id: "an-dieu-duong",
		name: "An",
		role: "Điều dưỡng viên",
		fieldId: "y-te",
		avatar: "👩‍⚕️",
		from: "Khối B, thích chăm sóc người khác",
		quote: "Nghề của mình không hào nhoáng, nhưng mỗi ngày đều thấy mình có ích.",
		journey: [
			"Từ nhỏ quen chăm sóc người thân khi ốm, thấy hợp với công việc gần gũi con người.",
			"Cân nhắc giữa Y khoa và Điều dưỡng, chọn Điều dưỡng vì phù hợp khả năng và hoàn cảnh.",
			"Học cách giữ vững tinh thần trước áp lực và ca trực đêm.",
			"Hiện làm tại bệnh viện, định hướng học thêm về điều dưỡng chuyên sâu.",
		],
	},
	{
		id: "huong-giao-vien",
		name: "Hương",
		role: "Giáo viên THCS",
		fieldId: "su-pham",
		avatar: "👩‍🏫",
		from: "Ban Khoa học xã hội, thích giảng giải",
		quote: "Mình thích khoảnh khắc học trò chợt hiểu ra một điều khó.",
		journey: [
			"Hay được bạn bè nhờ giảng bài và thấy vui khi giải thích cho người khác hiểu.",
			"Chọn Sư phạm dù biết thu nhập khởi điểm không cao, vì hợp tính cách và giá trị bản thân.",
			"Rèn kỹ năng quản lý lớp và kiên nhẫn qua từng kỳ thực tập.",
			"Hiện đứng lớp và tìm cách dạy sinh động hơn cho học sinh.",
		],
	},
	{
		id: "khoa-marketing",
		name: "Khoa",
		role: "Chuyên viên Marketing",
		fieldId: "truyen-thong",
		avatar: "🧑‍💼",
		from: "Khối D, mạnh tiếng Anh và giao tiếp",
		quote: "Mình hợp với việc kể chuyện cho thương hiệu hơn là ngồi tính toán cả ngày.",
		journey: [
			"Thích viết, làm nội dung cho câu lạc bộ ở trường.",
			"Chọn ngành Marketing vì kết hợp được sáng tạo và một chút phân tích.",
			"Làm cộng tác viên nội dung từ năm hai để có sản phẩm thực tế.",
			"Hiện phụ trách nội dung và quảng cáo cho một doanh nghiệp vừa.",
		],
	},
	{
		id: "linh-kien-truc",
		name: "Linh",
		role: "Kiến trúc sư",
		fieldId: "kien-truc-thiet-ke",
		avatar: "👩‍🎨",
		from: "Khối A, vẽ tốt và thích không gian",
		quote: "Ngành đẹp nhưng vất vả hơn mình tưởng, và mình vẫn thấy đáng.",
		journey: [
			"Thích vẽ và sắp xếp không gian, hay mày mò mô hình nhà cửa.",
			"Tìm hiểu kỹ trước khi chọn Kiến trúc vì biết chương trình học nặng.",
			"Quen với việc thức khuya làm đồ án và nhận góp ý thẳng thắn.",
			"Hiện làm tại văn phòng thiết kế, học thêm về kiến trúc bền vững.",
		],
	},
	{
		id: "trang-ngon-ngu",
		name: "Trang",
		role: "Biên - phiên dịch",
		fieldId: "ngon-ngu",
		avatar: "🧑‍🏫",
		from: "Khối D, đam mê ngoại ngữ",
		quote: "Ngôn ngữ mở ra nhiều nghề, quan trọng là mình chọn hướng đi cụ thể.",
		journey: [
			"Yêu thích tiếng Anh và văn hoá nước ngoài từ sớm.",
			"Chọn ngành Ngôn ngữ Anh, ý thức rằng cần thêm một chuyên môn phụ.",
			"Học thêm về biên dịch và một lĩnh vực ngách để khác biệt.",
			"Hiện làm biên - phiên dịch tự do kết hợp dạy học.",
		],
	},
]

export const STORY_BY_ID: Record<string, CareerStory> = Object.fromEntries(
	STORIES.map((s) => [s.id, s]),
)
