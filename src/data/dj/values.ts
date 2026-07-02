// =============================================================
// LỚP 1 — Giá trị nghề nghiệp: 8 slider trade-off.
// Mỗi slider 0..100, nghiêng về cực phải khi giá trị cao.
// =============================================================
import type { ValueKey } from "@/lib/dj/types"

export interface ValueSlider {
	key: ValueKey
	left: string
	right: string
}

export const VALUE_SLIDERS: ValueSlider[] = [
	{ key: "safety_vs_risk", left: "An toàn, chắc chắn", right: "Chấp nhận rủi ro" },
	{ key: "income_vs_meaning", left: "Thu nhập cao", right: "Ý nghĩa, cống hiến" },
	{ key: "solo_vs_team", left: "Làm việc độc lập", right: "Làm việc nhóm lớn" },
	{ key: "stable_vs_growth", left: "Ổn định lâu dài", right: "Tăng trưởng nhanh" },
	{ key: "practice_vs_theory", left: "Thực hành, tay nghề", right: "Lý thuyết, nghiên cứu" },
	{ key: "local_vs_global", left: "Gần nhà, địa phương", right: "Quốc tế, đi xa" },
	{ key: "structure_vs_freedom", left: "Quy trình rõ ràng", right: "Tự do, linh hoạt" },
	{ key: "people_vs_things", left: "Làm với con người", right: "Làm với sự vật/số liệu" },
]
