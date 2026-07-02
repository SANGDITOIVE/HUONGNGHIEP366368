import type { QuizQuestion } from "@/types"

// Trắc nghiệm tính cách (MBTI rút gọn): 20 câu, 5 câu mỗi trục (EI, SN, TF, JP).
// Mỗi câu có 3 lựa chọn, mỗi lựa chọn nghiêng về một cực với trọng số.
// Kết quả chỉ là ước lượng nhanh để tham khảo.
export const QUIZ_QUESTIONS: QuizQuestion[] = [
	// ---------- E / I ----------
	{
		id: "ei-1", axis: "EI",
		prompt: "Cuối tuần lý tưởng của bạn trông như thế nào?",
		options: [
			{ label: "Gặp gỡ bạn bè, tham gia hoạt động đông người", pole: "E", weight: 2 },
			{ label: "Ở nhà thư giãn hoặc đi với vài người thân", pole: "I", weight: 2 },
			{ label: "Tùy tâm trạng, nhưng thường thích có chút không gian riêng", pole: "I", weight: 1 },
		],
	},
	{
		id: "ei-2", axis: "EI",
		prompt: "Khi giáo viên đặt câu hỏi cho cả lớp, bạn thường…",
		options: [
			{ label: "Giơ tay phát biểu ngay, thích nói trước đám đông", pole: "E", weight: 2 },
			{ label: "Suy nghĩ kỹ, chỉ nói khi đã chắc chắn", pole: "I", weight: 2 },
			{ label: "Trao đổi nhỏ với bạn bên cạnh trước", pole: "E", weight: 1 },
		],
	},
	{
		id: "ei-3", axis: "EI",
		prompt: "Sau nhiều giờ giao tiếp liên tục, bạn cảm thấy…",
		options: [
			{ label: "Hứng khởi, càng nói chuyện càng nhiều năng lượng", pole: "E", weight: 2 },
			{ label: "Mệt và cần thời gian ở một mình để hồi sức", pole: "I", weight: 2 },
			{ label: "Ổn, nhưng sẽ muốn nghỉ ngơi yên tĩnh sau đó", pole: "I", weight: 1 },
		],
	},
	{
		id: "ei-4", axis: "EI",
		prompt: "Đến một sự kiện đông người, bạn…",
		options: [
			{ label: "Dễ dàng bắt chuyện với cả người lạ", pole: "E", weight: 2 },
			{ label: "Thích quan sát và trò chuyện với người đã quen", pole: "I", weight: 2 },
			{ label: "Chủ động làm quen nếu thấy chủ đề thú vị", pole: "E", weight: 1 },
		],
	},
	{
		id: "ei-5", axis: "EI",
		prompt: "Bạn xử lý suy nghĩ/cảm xúc của mình bằng cách…",
		options: [
			{ label: "Nói ra, bàn luận với người khác để hiểu rõ hơn", pole: "E", weight: 2 },
			{ label: "Tự suy ngẫm, viết ra hoặc nghĩ trong đầu", pole: "I", weight: 2 },
			{ label: "Thường nghĩ một mình trước rồi mới chia sẻ", pole: "I", weight: 1 },
		],
	},
	// ---------- S / N ----------
	{
		id: "sn-1", axis: "SN",
		prompt: "Khi học một chủ đề mới, bạn thấy cuốn hút hơn với…",
		options: [
			{ label: "Ví dụ cụ thể, số liệu và ứng dụng thực tế", pole: "S", weight: 2 },
			{ label: "Ý tưởng lớn, mô hình tổng quát và 'vì sao'", pole: "N", weight: 2 },
			{ label: "Cả hai, nhưng cần thấy bức tranh tổng thể trước", pole: "N", weight: 1 },
		],
	},
	{
		id: "sn-2", axis: "SN",
		prompt: "Bạn tin tưởng điều gì hơn khi ra quyết định?",
		options: [
			{ label: "Kinh nghiệm thực tế đã được kiểm chứng", pole: "S", weight: 2 },
			{ label: "Trực giác và linh cảm về điều sắp tới", pole: "N", weight: 2 },
			{ label: "Dữ kiện cụ thể trước mắt là chính", pole: "S", weight: 1 },
		],
	},
	{
		id: "sn-3", axis: "SN",
		prompt: "Bạn thích loại bài tập nào hơn?",
		options: [
			{ label: "Bài có quy trình rõ ràng, làm theo từng bước", pole: "S", weight: 2 },
			{ label: "Bài mở, sáng tạo, tự nghĩ cách giải mới", pole: "N", weight: 2 },
			{ label: "Bài cho phép thử nhiều hướng khác nhau", pole: "N", weight: 1 },
		],
	},
	{
		id: "sn-4", axis: "SN",
		prompt: "Khi kể lại một câu chuyện, bạn thường…",
		options: [
			{ label: "Kể chi tiết, theo trình tự, đầy đủ sự việc", pole: "S", weight: 2 },
			{ label: "Tập trung vào ý nghĩa, ấn tượng chung và liên tưởng", pole: "N", weight: 2 },
			{ label: "Nhớ rõ các chi tiết cụ thể đã xảy ra", pole: "S", weight: 1 },
		],
	},
	{
		id: "sn-5", axis: "SN",
		prompt: "Điều khiến bạn hứng thú hơn là…",
		options: [
			{ label: "Hoàn thiện những việc thực tế, hữu ích ngay", pole: "S", weight: 2 },
			{ label: "Khám phá khả năng và ý tưởng cho tương lai", pole: "N", weight: 2 },
			{ label: "Tưởng tượng ra những điều chưa từng có", pole: "N", weight: 1 },
		],
	},
	// ---------- T / F ----------
	{
		id: "tf-1", axis: "TF",
		prompt: "Khi đưa ra một quyết định quan trọng, bạn ưu tiên…",
		options: [
			{ label: "Logic, phân tích đúng–sai khách quan", pole: "T", weight: 2 },
			{ label: "Cảm xúc và ảnh hưởng tới những người liên quan", pole: "F", weight: 2 },
			{ label: "Cân nhắc lý lẽ trước, rồi mới tính đến con người", pole: "T", weight: 1 },
		],
	},
	{
		id: "tf-2", axis: "TF",
		prompt: "Khi bạn bè gặp chuyện buồn, phản ứng đầu tiên của bạn là…",
		options: [
			{ label: "Phân tích vấn đề và đưa giải pháp", pole: "T", weight: 2 },
			{ label: "Lắng nghe, đồng cảm và an ủi", pole: "F", weight: 2 },
			{ label: "An ủi trước, rồi cùng tìm cách giải quyết", pole: "F", weight: 1 },
		],
	},
	{
		id: "tf-3", axis: "TF",
		prompt: "Người khác thường nhận xét bạn là người…",
		options: [
			{ label: "Thẳng thắn, công bằng, lý trí", pole: "T", weight: 2 },
			{ label: "Ấm áp, tế nhị, biết quan tâm", pole: "F", weight: 2 },
			{ label: "Khá thẳng thắn nhưng vẫn để ý cảm xúc người khác", pole: "F", weight: 1 },
		],
	},
	{
		id: "tf-4", axis: "TF",
		prompt: "Trong một cuộc tranh luận, bạn coi trọng điều gì hơn?",
		options: [
			{ label: "Tìm ra điều đúng đắn, hợp lý nhất", pole: "T", weight: 2 },
			{ label: "Giữ hòa khí và cảm giác của mọi người", pole: "F", weight: 2 },
			{ label: "Sự thật quan trọng hơn, dù có thể mất lòng", pole: "T", weight: 1 },
		],
	},
	{
		id: "tf-5", axis: "TF",
		prompt: "Một lời phê bình tốt theo bạn nên…",
		options: [
			{ label: "Thẳng thắn, đi thẳng vào vấn đề", pole: "T", weight: 2 },
			{ label: "Nhẹ nhàng, khéo léo để người nghe không tổn thương", pole: "F", weight: 2 },
			{ label: "Rõ ràng nhưng vẫn cần sự tế nhị", pole: "F", weight: 1 },
		],
	},
	// ---------- J / P ----------
	{
		id: "jp-1", axis: "JP",
		prompt: "Với một dự án dài hạn, bạn thường…",
		options: [
			{ label: "Lập kế hoạch chi tiết và làm sớm từng phần", pole: "J", weight: 2 },
			{ label: "Làm linh hoạt, nước rút cuối cũng ổn", pole: "P", weight: 2 },
			{ label: "Có kế hoạch sơ bộ nhưng sẵn sàng thay đổi", pole: "P", weight: 1 },
		],
	},
	{
		id: "jp-2", axis: "JP",
		prompt: "Bàn học / không gian của bạn thường…",
		options: [
			{ label: "Gọn gàng, mọi thứ có chỗ rõ ràng", pole: "J", weight: 2 },
			{ label: "Hơi bừa nhưng mình biết đồ ở đâu", pole: "P", weight: 2 },
			{ label: "Thỉnh thoảng dọn, tùy giai đoạn", pole: "P", weight: 1 },
		],
	},
	{
		id: "jp-3", axis: "JP",
		prompt: "Bạn cảm thấy thoải mái hơn khi…",
		options: [
			{ label: "Mọi việc đã được quyết định và chốt lịch", pole: "J", weight: 2 },
			{ label: "Vẫn còn nhiều lựa chọn để mở", pole: "P", weight: 2 },
			{ label: "Có khung chung nhưng linh hoạt chi tiết", pole: "J", weight: 1 },
		],
	},
	{
		id: "jp-4", axis: "JP",
		prompt: "Khi đi du lịch, bạn thiên về…",
		options: [
			{ label: "Lên lịch trình rõ ràng từng ngày", pole: "J", weight: 2 },
			{ label: "Đi tới đâu hay tới đó, tùy hứng", pole: "P", weight: 2 },
			{ label: "Đặt chỗ chính, còn lại để tự do", pole: "P", weight: 1 },
		],
	},
	{
		id: "jp-5", axis: "JP",
		prompt: "Deadline đối với bạn là…",
		options: [
			{ label: "Mốc cần hoàn thành sớm, ghét nước đến chân", pole: "J", weight: 2 },
			{ label: "Nguồn động lực, mình làm tốt nhất lúc gấp", pole: "P", weight: 2 },
			{ label: "Quan trọng, nhưng mình hay xê dịch một chút", pole: "P", weight: 1 },
		],
	},
]
