// =============================================================
// LỚP 1 — Ngân hàng RIASEC 42 item (7/nhóm, 1 item đảo chiều mỗi nhóm).
// Nguồn: Phụ lục C — HoaTieu Discovery Journey.
// Thang Likert 1..5. Item reverse: điểm = 6 - trả lời.
// =============================================================
import type { RiasecKey } from "@/lib/dj/types"

export interface RiasecItem {
	id: string
	group: RiasecKey
	text: string
	reverse?: boolean
}

export const RIASEC_GROUP_LABEL: Record<RiasecKey, string> = {
	R: "Thực tế (Realistic)",
	I: "Nghiên cứu (Investigative)",
	A: "Sáng tạo (Artistic)",
	S: "Xã hội (Social)",
	E: "Quản lý (Enterprising)",
	C: "Quy củ (Conventional)",
}

export const RIASEC_ITEMS: RiasecItem[] = [
	// R — Realistic
	{ id: "R1", group: "R", text: "Tôi thích sửa hoặc lắp ráp đồ vật bằng tay." },
	{ id: "R2", group: "R", text: "Tôi thích làm việc với máy móc, công cụ, thiết bị." },
	{ id: "R3", group: "R", text: "Tôi thích hoạt động ngoài trời/vận động hơn ngồi bàn giấy." },
	{ id: "R4", group: "R", text: "Tôi thích thấy kết quả cụ thể, sờ được của việc mình làm." },
	{ id: "R5", group: "R", text: "Tôi không ngại công việc dính dầu mỡ, đất cát." },
	{ id: "R6", group: "R", text: "Tôi thích tìm hiểu cấu tạo của máy móc, xe cộ, thiết bị điện." },
	{ id: "R7", group: "R", text: "Tôi thấy chán khi phải dùng tay chân hay thao tác với đồ vật.", reverse: true },
	// I — Investigative
	{ id: "I1", group: "I", text: "Tôi thích tìm hiểu \u201ctại sao\u201d sự vật hoạt động như vậy." },
	{ id: "I2", group: "I", text: "Tôi thích giải bài toán/câu đố khó." },
	{ id: "I3", group: "I", text: "Tôi thích đọc về khoa học, công nghệ mới." },
	{ id: "I4", group: "I", text: "Tôi thích phân tích dữ liệu, tìm quy luật." },
	{ id: "I5", group: "I", text: "Tôi kiên nhẫn theo đuổi một vấn đề cho tới khi hiểu rõ." },
	{ id: "I6", group: "I", text: "Tôi hay đặt câu hỏi để kiểm chứng điều người khác nói." },
	{ id: "I7", group: "I", text: "Tôi không thích phải suy nghĩ trừu tượng hay phân tích lâu.", reverse: true },
	// A — Artistic
	{ id: "A1", group: "A", text: "Tôi thích vẽ, viết, chụp ảnh hoặc làm nhạc." },
	{ id: "A2", group: "A", text: "Tôi thích tự do thể hiện ý tưởng theo cách riêng." },
	{ id: "A3", group: "A", text: "Tôi thấy khó chịu khi mọi thứ quá khuôn mẫu." },
	{ id: "A4", group: "A", text: "Tôi hay nghĩ ra ý tưởng/cách làm mới lạ." },
	{ id: "A5", group: "A", text: "Tôi để ý đến cái đẹp, bố cục, màu sắc." },
	{ id: "A6", group: "A", text: "Tôi thích những công việc không lặp lại, luôn mới mẻ." },
	{ id: "A7", group: "A", text: "Tôi thích làm theo hướng dẫn có sẵn hơn là tự nghĩ cách mới.", reverse: true },
	// S — Social
	{ id: "S1", group: "S", text: "Tôi thích giúp người khác học hoặc giải quyết vấn đề." },
	{ id: "S2", group: "S", text: "Tôi được bạn bè tìm đến để tâm sự." },
	{ id: "S3", group: "S", text: "Tôi thích làm việc nhóm hơn làm một mình." },
	{ id: "S4", group: "S", text: "Tôi quan tâm đến cảm xúc của người xung quanh." },
	{ id: "S5", group: "S", text: "Tôi thấy vui khi làm điều có ích cho cộng đồng." },
	{ id: "S6", group: "S", text: "Tôi kiên nhẫn lắng nghe người khác dù họ nói dài." },
	{ id: "S7", group: "S", text: "Tôi thích làm việc một mình hơn là tiếp xúc nhiều người.", reverse: true },
	// E — Enterprising
	{ id: "E1", group: "E", text: "Tôi thích dẫn dắt, tổ chức nhóm." },
	{ id: "E2", group: "E", text: "Tôi tự tin thuyết phục người khác theo ý mình." },
	{ id: "E3", group: "E", text: "Tôi thích đặt mục tiêu và cạnh tranh để đạt." },
	{ id: "E4", group: "E", text: "Tôi dám nhận rủi ro để có cơ hội lớn hơn." },
	{ id: "E5", group: "E", text: "Tôi thích ý tưởng kinh doanh, bán hàng." },
	{ id: "E6", group: "E", text: "Tôi thích chịu trách nhiệm ra quyết định quan trọng." },
	{ id: "E7", group: "E", text: "Tôi không thoải mái khi phải dẫn dắt hay thuyết phục người khác.", reverse: true },
	// C — Conventional
	{ id: "C1", group: "C", text: "Tôi thích mọi thứ gọn gàng, có trật tự." },
	{ id: "C2", group: "C", text: "Tôi làm việc tốt khi có quy trình rõ ràng." },
	{ id: "C3", group: "C", text: "Tôi cẩn thận với con số, chi tiết, giấy tờ." },
	{ id: "C4", group: "C", text: "Tôi thích lập kế hoạch và bám theo nó." },
	{ id: "C5", group: "C", text: "Tôi không ngại công việc lặp lại nếu nó rõ ràng." },
	{ id: "C6", group: "C", text: "Tôi thích kiểm tra lại kỹ để tránh sai sót." },
	{ id: "C7", group: "C", text: "Tôi thấy gò bó khi phải tuân theo quy tắc và quy trình.", reverse: true },
]

export const LIKERT_OPTIONS = [
	{ value: 1, label: "Rất không đúng" },
	{ value: 2, label: "Không đúng" },
	{ value: 3, label: "Trung lập" },
	{ value: 4, label: "Đúng" },
	{ value: 5, label: "Rất đúng" },
]
