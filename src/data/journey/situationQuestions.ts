// =============================================================
// FUNCTION 2 — LỚP KHAI THÁC.
// 2A: 12 câu tình huống -> 4 chiều tính cách (E/I, S/N, T/F, J/P)
//     + đôi khi nhấn nhẹ vào 1 trục năng khiếu.
// 2B: 6 giá trị sống để xếp hạng.
// 2C: 3 câu bối cảnh Việt Nam.
// Tuyệt đối không hỏi "em thích nghề gì".
// =============================================================
import type {
	AxisId,
	EconomicCondition,
	FamilyExpectation,
	PersonalityDim,
	Pole,
	StreamPick,
	ValueId,
} from "@/lib/journey/types"

export interface SituationOption {
	id: string
	label: string
	dim: PersonalityDim
	pole: Pole
	weight: number
	axis?: AxisId
}
export interface SituationQuestion {
	id: string
	prompt: string
	options: SituationOption[]
}

// 3 câu / chiều. Mỗi câu có 4 lựa chọn: 2 nghiêng cực này, 2 nghiêng cực kia.
export const SITUATION_QUESTIONS: SituationQuestion[] = [
	// ----- Chiều ĐỊNH HƯỚNG năng lượng: E / I -----
	{
		id: "s1",
		prompt: "Một ngày nghỉ lý tưởng với bạn trông như thế nào?",
		options: [
			{ id: "s1a", label: "Đi chơi nơi đông vui, càng nhộn nhịp càng thích", dim: "orientation", pole: "E", weight: 2 },
			{ id: "s1b", label: "Hẹn một nhóm bạn quen để trò chuyện", dim: "orientation", pole: "E", weight: 1 },
			{ id: "s1c", label: "Gặp một, hai người thân thiết là đủ", dim: "orientation", pole: "I", weight: 1 },
			{ id: "s1d", label: "Ở nhà một mình, làm việc mình thích để nạp lại năng lượng", dim: "orientation", pole: "I", weight: 2 },
		],
	},
	{
		id: "s2",
		prompt: "Trong một buổi học nhóm, bạn thường là người…",
		options: [
			{ id: "s2a", label: "Nói nhiều nhất, khuấy động không khí", dim: "orientation", pole: "E", weight: 2 },
			{ id: "s2b", label: "Chủ động bắt chuyện với người mới", dim: "orientation", pole: "E", weight: 1 },
			{ id: "s2c", label: "Lắng nghe rồi mới góp ý", dim: "orientation", pole: "I", weight: 1 },
			{ id: "s2d", label: "Thích tự làm phần của mình rồi ghép lại", dim: "orientation", pole: "I", weight: 2 },
		],
	},
	{
		id: "s3",
		prompt: "Sau một tuần học căng thẳng, bạn lấy lại năng lượng bằng cách…",
		options: [
			{ id: "s3a", label: "Rủ bạn bè đi đâu đó cho khuây khỏa", dim: "orientation", pole: "E", weight: 2 },
			{ id: "s3b", label: "Tham gia một hoạt động tập thể", dim: "orientation", pole: "E", weight: 1 },
			{ id: "s3c", label: "Đi dạo, nghe nhạc một mình", dim: "orientation", pole: "I", weight: 1 },
			{ id: "s3d", label: "Ở yên trong phòng, ít tương tác lại", dim: "orientation", pole: "I", weight: 2 },
		],
	},
	// ----- Chiều XỬ LÝ THÔNG TIN: S (cụ thể) / N (trực giác) -----
	{
		id: "s4",
		prompt: "Khi học một điều mới, bạn dễ tiếp thu hơn khi…",
		options: [
			{ id: "s4a", label: "Có ví dụ cụ thể, làm thử từng bước", dim: "info", pole: "S", weight: 2 },
			{ id: "s4b", label: "Biết rõ áp dụng vào việc gì trong thực tế", dim: "info", pole: "S", weight: 1 },
			{ id: "s4c", label: "Hiểu ý tưởng tổng quát, bức tranh lớn", dim: "info", pole: "N", weight: 1 },
			{ id: "s4d", label: "Tự liên hệ, tưởng tượng ra khả năng mới", dim: "info", pole: "N", weight: 2 },
		],
	},
	{
		id: "s5",
		prompt: "Bạn thấy mình hợp với kiểu bài tập nào hơn?",
		options: [
			{ id: "s5a", label: "Bài có quy trình rõ ràng, đáp án chắc chắn", dim: "info", pole: "S", weight: 2 },
			{ id: "s5b", label: "Bài vận dụng kiến thức vào tình huống thật", dim: "info", pole: "S", weight: 1 },
			{ id: "s5c", label: "Bài mở, có nhiều cách giải", dim: "info", pole: "N", weight: 1 },
			{ id: "s5d", label: "Bài cần ý tưởng mới, sáng tạo cách riêng", dim: "info", pole: "N", weight: 2, axis: "sang-tao" },
		],
	},
	{
		id: "s6",
		prompt: "Khi kể lại một câu chuyện, bạn thường…",
		options: [
			{ id: "s6a", label: "Kể chi tiết, đúng trình tự đã xảy ra", dim: "info", pole: "S", weight: 2 },
			{ id: "s6b", label: "Tập trung vào sự việc thật, ai làm gì", dim: "info", pole: "S", weight: 1 },
			{ id: "s6c", label: "Nhấn vào ý nghĩa, bài học rút ra", dim: "info", pole: "N", weight: 1 },
			{ id: "s6d", label: "Thêm liên tưởng, ẩn dụ cho hấp dẫn", dim: "info", pole: "N", weight: 2, axis: "sang-tao" },
		],
	},
	// ----- Chiều RA QUYẾT ĐỊNH: T (lý trí) / F (cảm xúc) -----
	{
		id: "s7",
		prompt: "Khi phải đưa ra một quyết định khó, điều gì dẫn dắt bạn?",
		options: [
			{ id: "s7a", label: "Phân tích lợi – hại một cách logic", dim: "decision", pole: "T", weight: 2, axis: "du-lieu" },
			{ id: "s7b", label: "Dựa trên nguyên tắc đúng – sai rõ ràng", dim: "decision", pole: "T", weight: 1 },
			{ id: "s7c", label: "Cân nhắc cảm xúc của những người liên quan", dim: "decision", pole: "F", weight: 1 },
			{ id: "s7d", label: "Chọn theo điều khiến mình thấy đúng với lòng mình", dim: "decision", pole: "F", weight: 2 },
		],
	},
	{
		id: "s8",
		prompt: "Một người bạn làm sai khiến nhóm bị điểm thấp. Bạn sẽ…",
		options: [
			{ id: "s8a", label: "Chỉ ra vấn đề thẳng thắn để lần sau tốt hơn", dim: "decision", pole: "T", weight: 2 },
			{ id: "s8b", label: "Phân tích xem sai ở khâu nào", dim: "decision", pole: "T", weight: 1 },
			{ id: "s8c", label: "Hỏi xem bạn có gặp khó khăn gì không", dim: "decision", pole: "F", weight: 1 },
			{ id: "s8d", label: "Động viên trước, tránh làm bạn tổn thương", dim: "decision", pole: "F", weight: 2, axis: "con-nguoi" },
		],
	},
	{
		id: "s9",
		prompt: "Lời khen nào khiến bạn thấy vui hơn?",
		options: [
			{ id: "s9a", label: "\"Bạn làm việc rất logic và hiệu quả\"", dim: "decision", pole: "T", weight: 2 },
			{ id: "s9b", label: "\"Bạn phân tích vấn đề sắc bén\"", dim: "decision", pole: "T", weight: 1 },
			{ id: "s9c", label: "\"Ở cạnh bạn mình thấy được lắng nghe\"", dim: "decision", pole: "F", weight: 1 },
			{ id: "s9d", label: "\"Bạn là người ấm áp, tốt bụng\"", dim: "decision", pole: "F", weight: 2, axis: "con-nguoi" },
		],
	},
	// ----- Chiều PHONG CÁCH LÀM VIỆC: J (cấu trúc) / P (linh hoạt) -----
	{
		id: "s10",
		prompt: "Trước một kỳ thi lớn, bạn thường…",
		options: [
			{ id: "s10a", label: "Lập thời gian biểu chi tiết và bám sát", dim: "work", pole: "J", weight: 2, axis: "to-chuc" },
			{ id: "s10b", label: "Có kế hoạch rõ ràng từ sớm", dim: "work", pole: "J", weight: 1 },
			{ id: "s10c", label: "Học theo hứng, miễn kịp là được", dim: "work", pole: "P", weight: 1 },
			{ id: "s10d", label: "Nước tới chân mới nhảy, vẫn ổn", dim: "work", pole: "P", weight: 2 },
		],
	},
	{
		id: "s11",
		prompt: "Bàn học / góc làm việc của bạn thường…",
		options: [
			{ id: "s11a", label: "Luôn ngăn nắp, mọi thứ đúng chỗ", dim: "work", pole: "J", weight: 2, axis: "to-chuc" },
			{ id: "s11b", label: "Gọn gàng theo một hệ thống riêng", dim: "work", pole: "J", weight: 1 },
			{ id: "s11c", label: "Hơi bừa nhưng mình vẫn tìm ra đồ", dim: "work", pole: "P", weight: 1 },
			{ id: "s11d", label: "Khá lộn xộn, tùy hứng mỗi ngày", dim: "work", pole: "P", weight: 2 },
		],
	},
	{
		id: "s12",
		prompt: "Khi đi du lịch, bạn thích…",
		options: [
			{ id: "s12a", label: "Lên lịch trình từng giờ, đặt trước mọi thứ", dim: "work", pole: "J", weight: 2 },
			{ id: "s12b", label: "Có khung kế hoạch chính rồi đi theo", dim: "work", pole: "J", weight: 1 },
			{ id: "s12c", label: "Chỉ chốt vài điểm, còn lại tùy hứng", dim: "work", pole: "P", weight: 1 },
			{ id: "s12d", label: "Xách balo lên và đi, tới đâu hay tới đó", dim: "work", pole: "P", weight: 2 },
		],
	},
]

// ---------- 2B: Giá trị sống (xếp hạng) ----------
export interface ValueItem {
	id: ValueId
	label: string
	desc: string
	axis: AxisId
}

export const VALUE_ITEMS: ValueItem[] = [
	{ id: "thu-nhap", label: "Thu nhập & ổn định", desc: "Kiếm tốt, công việc vững vàng, lo được cho bản thân và gia đình", axis: "du-lieu" },
	{ id: "sang-tao", label: "Tự do sáng tạo", desc: "Được làm điều mới mẻ, không bị gò bó khuôn mẫu", axis: "sang-tao" },
	{ id: "giup-ich", label: "Giúp ích cho người khác", desc: "Công việc tạo ra giá trị tốt đẹp cho cộng đồng", axis: "con-nguoi" },
	{ id: "cong-nhan", label: "Được công nhận", desc: "Có tiếng nói, được tôn trọng và ghi nhận", axis: "to-chuc" },
	{ id: "tu-do", label: "Tự do & cân bằng", desc: "Chủ động thời gian, không gian, giữ cân bằng cuộc sống", axis: "tu-nhien" },
	{ id: "phat-trien", label: "Phát triển bản thân", desc: "Mỗi ngày giỏi hơn, liên tục học và tiến bộ", axis: "ky-thuat" },
]

// ---------- 2C: Bối cảnh Việt Nam ----------
export interface ChoiceOption<T extends string> {
	value: T
	label: string
	hint?: string
}

export const FAMILY_OPTIONS: ChoiceOption<FamilyExpectation>[] = [
	{ value: "dong-y", label: "Gia đình ủng hộ lựa chọn của mình", hint: "Mình khá tự do quyết định" },
	{ value: "chua-chac", label: "Gia đình chưa chắc, còn lo lắng", hint: "Cần thuyết phục thêm" },
	{ value: "huong-khac", label: "Gia đình muốn mình theo hướng khác", hint: "Có khoảng cách về kỳ vọng" },
	{ value: "tu-quyet", label: "Gia đình để mình tự quyết hoàn toàn", hint: "Mình tự chịu trách nhiệm" },
]

export const ECONOMIC_OPTIONS: ChoiceOption<EconomicCondition>[] = [
	{ value: "can-som", label: "Cần đi làm, có thu nhập sớm", hint: "Ưu tiên ra trường nhanh, học phí vừa phải" },
	{ value: "co-nhung-khong-quyet", label: "Có điều kiện, nhưng cân nhắc chi phí", hint: "Linh hoạt, vẫn tính toán" },
	{ value: "day-du", label: "Điều kiện khá đầy đủ", hint: "Có thể đầu tư dài hạn cho việc học" },
]

export const STREAM_OPTIONS: ChoiceOption<StreamPick>[] = [
	{ value: "khoi-a", label: "Khối A (Toán – Lý – Hóa)" },
	{ value: "khoi-a1", label: "Khối A1 (Toán – Lý – Anh)" },
	{ value: "khoi-b", label: "Khối B (Toán – Hóa – Sinh)" },
	{ value: "khoi-c", label: "Khối C (Văn – Sử – Địa)" },
	{ value: "khoi-d", label: "Khối D (Toán – Văn – Anh)" },
	{ value: "chua-chon", label: "Mình chưa chọn tổ hợp" },
]

export const GRADE_OPTIONS: ChoiceOption<string>[] = [
	{ value: "6", label: "Lớp 6" },
	{ value: "7", label: "Lớp 7" },
	{ value: "8", label: "Lớp 8" },
	{ value: "9", label: "Lớp 9" },
	{ value: "10", label: "Lớp 10" },
	{ value: "11", label: "Lớp 11" },
	{ value: "12", label: "Lớp 12" },
]
