// =============================================================
// LỚP 1 — Mini test năng lực (aptitude) có đáp án đúng để chấm TỰ ĐỘNG.
// 4 nhóm: logic, verbal, spatial, numeric — 3 câu/nhóm = 12 câu.
// Điểm mỗi nhóm = % số câu đúng. Không cần AI.
// =============================================================
import type { AptitudeKey } from "@/lib/dj/types"

export interface AptitudeItem {
	id: string
	group: AptitudeKey
	prompt: string
	options: { id: string; label: string }[]
	answer: string
}

export const APTITUDE_LABEL: Record<AptitudeKey, string> = {
	logic: "Suy luận logic",
	verbal: "Ngôn ngữ",
	spatial: "Không gian",
	numeric: "Tính toán",
}

export const APTITUDE_ITEMS: AptitudeItem[] = [
	// logic
	{
		id: "L1", group: "logic",
		prompt: "Dãy: 2, 6, 12, 20, 30, ... Số tiếp theo là?",
		options: [{ id: "a", label: "40" }, { id: "b", label: "42" }, { id: "c", label: "44" }, { id: "d", label: "36" }],
		answer: "b",
	},
	{
		id: "L2", group: "logic",
		prompt: "Nếu mọi A là B, và một số B là C, kết luận chắc chắn đúng?",
		options: [{ id: "a", label: "Mọi A là C" }, { id: "b", label: "Một số A là C" }, { id: "c", label: "Không thể kết luận chắc chắn A là C" }, { id: "d", label: "Không A nào là C" }],
		answer: "c",
	},
	{
		id: "L3", group: "logic",
		prompt: "Quy luật: AB, DE, GH, ... Cặp tiếp theo?",
		options: [{ id: "a", label: "IJ" }, { id: "b", label: "JK" }, { id: "c", label: "HI" }, { id: "d", label: "KL" }],
		answer: "b",
	},
	// verbal
	{
		id: "V1", group: "verbal",
		prompt: "\u201cBác sĩ\u201d đối với \u201cbệnh viện\u201d như \u201cgiáo viên\u201d đối với?",
		options: [{ id: "a", label: "Học sinh" }, { id: "b", label: "Trường học" }, { id: "c", label: "Sách" }, { id: "d", label: "Bài giảng" }],
		answer: "b",
	},
	{
		id: "V2", group: "verbal",
		prompt: "Từ nào KHÁC nhóm còn lại?",
		options: [{ id: "a", label: "Vui" }, { id: "b", label: "Buồn" }, { id: "c", label: "Giận" }, { id: "d", label: "Bàn" }],
		answer: "d",
	},
	{
		id: "V3", group: "verbal",
		prompt: "Trái nghĩa của \u201ckhiêm tốn\u201d là?",
		options: [{ id: "a", label: "Nhúng nhường" }, { id: "b", label: "Kiêu ngạo" }, { id: "c", label: "Thật thà" }, { id: "d", label: "Dụt dè" }],
		answer: "b",
	},
	// spatial
	{
		id: "S1", group: "spatial",
		prompt: "Một khối lập phương sơn đỏ 6 mặt, cắt thành 27 khối nhỏ bằng nhau. Bao nhiêu khối nhỏ có đúng 3 mặt đỏ?",
		options: [{ id: "a", label: "4" }, { id: "b", label: "6" }, { id: "c", label: "8" }, { id: "d", label: "12" }],
		answer: "c",
	},
	{
		id: "S2", group: "spatial",
		prompt: "Hình khai triển có 6 ô vuông xếp hình chữ thập gấp lại thành khối gì?",
		options: [{ id: "a", label: "Khối lập phương" }, { id: "b", label: "Khối chóp" }, { id: "c", label: "Lăng trụ tam giác" }, { id: "d", label: "Hình cầu" }],
		answer: "a",
	},
	{
		id: "S3", group: "spatial",
		prompt: "Xoay chữ \u201cb\u201d 180 độ (lật ngược) ta được gần giống chữ nào?",
		options: [{ id: "a", label: "d" }, { id: "b", label: "p" }, { id: "c", label: "q" }, { id: "d", label: "o" }],
		answer: "c",
	},
	// numeric
	{
		id: "N1", group: "numeric",
		prompt: "Một áo giá 200k giảm 15%. Giá sau giảm?",
		options: [{ id: "a", label: "160k" }, { id: "b", label: "170k" }, { id: "c", label: "175k" }, { id: "d", label: "185k" }],
		answer: "b",
	},
	{
		id: "N2", group: "numeric",
		prompt: "Tỉ lệ 3:5, tổng là 64. Số lớn là?",
		options: [{ id: "a", label: "24" }, { id: "b", label: "40" }, { id: "c", label: "32" }, { id: "d", label: "45" }],
		answer: "b",
	},
	{
		id: "N3", group: "numeric",
		prompt: "Trung bình của 4 số là 12. Thêm một số để trung bình thành 15 thì số đó là?",
		options: [{ id: "a", label: "24" }, { id: "b", label: "27" }, { id: "c", label: "30" }, { id: "d", label: "21" }],
		answer: "b",
	},
]
