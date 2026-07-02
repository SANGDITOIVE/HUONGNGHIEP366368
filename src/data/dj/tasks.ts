// =============================================================
// LỚP 2 — 8 đề micro-task (mỗi cụm 1 đề MVP). Bám schema dj_task.spec_json.
// Dùng trực tiếp khi cache miss; Gemini A có thể sinh thêm biến thể.
// Nguồn: Phụ lục D — HoaTieu Discovery Journey.
// =============================================================
import type { TaskSpec } from "@/lib/dj/types"

export const TASKS: TaskSpec[] = [
	{
		task_id: "cntt-001", cluster_id: "cntt", difficulty: 2,
		title: "Thiết kế logic cho app nhắc việc",
		scenario: "Một bạn học sinh hay quên nộp bài. Bạn được giao thiết kế logic cho một app nhắc việc đơn giản.",
		instructions: "Mô tả các bước xử lý (pseudo-code hoặc gạch đầu dòng): app nhận dữ liệu gì, lưu thế nào, khi nào báo, xử lý trường hợp đặc biệt ra sao.",
		time_limit_min: 15, deliverable_format: "steps",
		rubric: [
			{ criterion: "Tư duy chia bước rõ ràng", weight: 0.4, what_good_looks_like: "Các bước tuần tự, có input/output, không nhảy cóc." },
			{ criterion: "Xử lý trường hợp ngoại lệ", weight: 0.35, what_good_looks_like: "Nghĩ đến lỗi, trùng lịch, mất mạng..." },
			{ criterion: "Tính khả thi", weight: 0.25, what_good_looks_like: "Giải pháp làm được, không viễn tưởng." },
		],
		reflection_questions: ["Bước nào bạn thấy hứng thú nhất?", "Bạn có muốn làm thêm dạng bài này không?"],
		red_flag_signals: ["Chỉ viết chung chung không có bước", "Sao chép đề bài"],
		dark_side_note: "Nghề lập trình đòi debug lặp đi lặp lại, không phải lúc nào cũng sáng tạo.",
	},
	{
		task_id: "kinh-te-001", cluster_id: "kinh-te", difficulty: 2,
		title: "Kế hoạch bán hàng hội chợ trường",
		scenario: "Lớp bạn có gian hàng hội chợ với vốn 500k, mục tiêu lãi cao nhất trong 1 ngày.",
		instructions: "Đề xuất: bán gì, giá vốn/giá bán, cách thu hút khách, dự kiến lãi và rủi ro. Có con số cụ thể.",
		time_limit_min: 15, deliverable_format: "essay",
		rubric: [
			{ criterion: "Tư duy lợi nhuận", weight: 0.4, what_good_looks_like: "Tính được vốn - giá - lãi hợp lý." },
			{ criterion: "Ý tưởng thu hút khách", weight: 0.35, what_good_looks_like: "Cách marketing sáng tạo, khả thi." },
			{ criterion: "Nhận diện rủi ro", weight: 0.25, what_good_looks_like: "Nghĩ đến ế hàng, thời tiết, cạnh tranh." },
		],
		reflection_questions: ["Bạn thích phần tính toán hay phần thuyết phục khách hơn?", "Bạn có muốn cầm trịch một dự án thực không?"],
		red_flag_signals: ["Không có con số", "Chỉ nói chung chung"],
		dark_side_note: "Kinh doanh chịu áp lực doanh số và rủi ro mất vốn thật.",
	},
	{
		task_id: "y-duoc-001", cluster_id: "y-duoc", difficulty: 2,
		title: "Xử lý tình huống sơ cứu",
		scenario: "Một người bị đứt tay chảy máu nhiều tại trường. Bạn là người có mặt đầu tiên.",
		instructions: "Liệt kê các bước xử lý theo thứ tự ưu tiên và giải thích vì sao. Khi nào cần gọi cấp cứu?",
		time_limit_min: 12, deliverable_format: "steps",
		rubric: [
			{ criterion: "Ưu tiên đúng", weight: 0.45, what_good_looks_like: "Cầm máu/an toàn trước, đúng trình tự." },
			{ criterion: "Hiểu lý do y khoa", weight: 0.3, what_good_looks_like: "Giải thích được vì sao làm vậy." },
			{ criterion: "Bình tĩnh, an toàn", weight: 0.25, what_good_looks_like: "Quan tâm an toàn của mình và nạn nhân." },
		],
		reflection_questions: ["Bạn có thấy bình tĩnh khi thấy máu không?", "Bạn có muốn học sâu về cơ thể người không?"],
		red_flag_signals: ["Hoảng loạn bỏ qua cầm máu", "Thứ tự sai nguy hiểm"],
		dark_side_note: "Nghề y đối mặt máu, đau đớn và căng thẳng sinh mạng hàng ngày.",
	},
	{
		task_id: "ky-thuat-001", cluster_id: "ky-thuat", difficulty: 2,
		title: "Thiết kế giá đỡ điện thoại",
		scenario: "Bạn cần thiết kế một giá đỡ điện thoại bằng bìa cứng, chắc chắn và gọn.",
		instructions: "Mô tả thiết kế (kèm kích thước ước lượng), giải thích cách nó chịu lực, và cách gấp/cắt.",
		time_limit_min: 15, deliverable_format: "design_brief",
		rubric: [
			{ criterion: "Tư duy kết cấu", weight: 0.45, what_good_looks_like: "Hiểu trọng tâm, chịu lực, độ vững." },
			{ criterion: "Hình dung không gian", weight: 0.3, what_good_looks_like: "Mô tả rõ hình dạng 3D, kích thước." },
			{ criterion: "Tính khả thi", weight: 0.25, what_good_looks_like: "Làm được với bìa cứng." },
		],
		reflection_questions: ["Bạn có thích hình dung vật thể trong đầu không?", "Bạn có muốn tự tay làm ra nó không?"],
		red_flag_signals: ["Không quan tâm độ vững", "Bỏ qua kích thước"],
		dark_side_note: "Kỹ thuật làm việc ở xưởng/hiện trường, bụi bặm và tiêu chuẩn an toàn ngặt.",
	},
	{
		task_id: "ngon-ngu-001", cluster_id: "ngon-ngu", difficulty: 2,
		title: "Viết email xin lỗi khách hàng (song ngữ)",
		scenario: "Một khách nước ngoài phàn nàn vì giao hàng trễ. Bạn viết email xin lỗi bằng tiếng Việt và dịch sang tiếng Anh.",
		instructions: "Viết email ngắn (Việt + Anh) giữ lịch sự, giải thích ngắn gọn và đề xuất bù đắp.",
		time_limit_min: 15, deliverable_format: "essay",
		rubric: [
			{ criterion: "Diễn đạt rõ - lịch sự", weight: 0.4, what_good_looks_like: "Giọng điệu chuyên nghiệp, mạch lạc." },
			{ criterion: "Chất lượng dịch", weight: 0.35, what_good_looks_like: "Dịch đúng ý, tự nhiên." },
			{ criterion: "Giải quyết vấn đề", weight: 0.25, what_good_looks_like: "Đề xuất bù đắp hợp lý." },
		],
		reflection_questions: ["Bạn thích chơi với ngôn từ không?", "Bạn có muốn giao tiếp với người nước ngoài thường xuyên không?"],
		red_flag_signals: ["Dịch sai nghĩa", "Giọng điệu thô lỗ"],
		dark_side_note: "Nghề ngôn ngữ dễ bị AI cạnh tranh ở phần dịch cơ bản.",
	},
	{
		task_id: "thiet-ke-001", cluster_id: "thiet-ke", difficulty: 2,
		title: "Ý tưởng poster sự kiện trường",
		scenario: "Trường tổ chức ngày hội STEM. Bạn thiết kế ý tưởng poster quảng bá.",
		instructions: "Mô tả: thông điệp chính, bố cục, màu sắc, hình ảnh, font chữ — và vì sao chọn như vậy.",
		time_limit_min: 15, deliverable_format: "design_brief",
		rubric: [
			{ criterion: "Tư duy thị giác", weight: 0.4, what_good_looks_like: "Bố cục - màu - font phục vụ thông điệp." },
			{ criterion: "Thông điệp rõ", weight: 0.35, what_good_looks_like: "Người xem hiểu ngay sự kiện." },
			{ criterion: "Sáng tạo", weight: 0.25, what_good_looks_like: "Ý tưởng mới, không sáo mòn." },
		],
		reflection_questions: ["Bạn có hay để ý cái đẹp xung quanh không?", "Bạn thích nhận góp ý để sửa thiết kế không?"],
		red_flag_signals: ["Chỉ liệt kê không có lý do", "Bỏ qua thông điệp"],
		dark_side_note: "Thiết kế bị sửa nhiều theo ý khách, thu nhập đầu nghề bấp bênh.",
	},
	{
		task_id: "su-pham-001", cluster_id: "su-pham", difficulty: 2,
		title: "Giải thích một khái niệm khó",
		scenario: "Bạn cần giảng cho một em lớp 6 hiểu vì sao có ngày và đêm.",
		instructions: "Viết cách bạn giải thích (có thể dùng ví dụ, hình ảnh, câu hỏi gợi mở) sao cho em dễ hiểu.",
		time_limit_min: 12, deliverable_format: "essay",
		rubric: [
			{ criterion: "Dễ hiểu - phù hợp lứa tuổi", weight: 0.45, what_good_looks_like: "Ngôn ngữ đơn giản, ví dụ gần gũi." },
			{ criterion: "Đúng kiến thức", weight: 0.3, what_good_looks_like: "Giải thích khoa học không sai." },
			{ criterion: "Tương tác", weight: 0.25, what_good_looks_like: "Có câu hỏi gợi mở, khuyến khích." },
		],
		reflection_questions: ["Bạn có kiên nhẫn khi người khác chưa hiểu không?", "Bạn thấy vui khi giúp ai đó hiểu bài không?"],
		red_flag_signals: ["Dùng thuật ngữ khó", "Giải thích sai bản chất"],
		dark_side_note: "Nghề giáo lương khởi điểm thấp, nhiều hồ sơ giấy tờ và áp lực thành tích.",
	},
	{
		task_id: "tam-ly-xa-hoi-001", cluster_id: "tam-ly-xa-hoi", difficulty: 2,
		title: "Tư vấn cho bạn đang căng thẳng",
		scenario: "Một bạn cùng lớp tâm sự rằng bạn ấy rất áp lực thi cử và muốn bỏ cuộc.",
		instructions: "Viết cách bạn phản hồi: lắng nghe, đặt câu hỏi gì, động viên ra sao, khi nào khuyên tìm người lớn/chuyên gia.",
		time_limit_min: 12, deliverable_format: "essay",
		rubric: [
			{ criterion: "Lắng nghe - đồng cảm", weight: 0.45, what_good_looks_like: "Không phán xét, công nhận cảm xúc." },
			{ criterion: "Đặt câu hỏi đúng", weight: 0.3, what_good_looks_like: "Câu hỏi mở giúp bạn ấy tự nhìn nhận." },
			{ criterion: "Biết giới hạn", weight: 0.25, what_good_looks_like: "Biết khi nào cần nhờ chuyên gia." },
		],
		reflection_questions: ["Bạn có thấy thoải mái khi nghe chuyện buồn của người khác không?", "Bạn có tò mò vì sao con người hành động như vậy không?"],
		red_flag_signals: ["Phán xét, ra lệnh", "Hứa giải quyết thay"],
		dark_side_note: "Nghề tâm lý dễ bị hút cảm xúc tiêu cực, cần học lên cao để hành nghề.",
	},
]

export function getTask(taskId: string): TaskSpec | undefined {
	return TASKS.find((t) => t.task_id === taskId)
}
export function getTaskByCluster(clusterId: string): TaskSpec | undefined {
	return TASKS.find((t) => t.cluster_id === clusterId)
}
