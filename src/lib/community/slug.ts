// =============================================================
// Tiện ích sinh SLUG động (tiếng Việt → ASCII không dấu) + phát hiện trùng lặp
// tên trường. Dùng cho tính năng "Cộng đồng đề xuất thêm cơ sở đào tạo".
// =============================================================

/**
 * Sinh slug thân thiện URL từ tên trường tiếng Việt.
 * VD: "Đại học Mới Thêm" → "dai-hoc-moi-them".
 * Luôn trả về chuỗi hợp lệ (không rỗng) để KHÔNG bao giờ tạo URL lỗi 404.
 */
export function slugify(input: string): string {
	const base = (input ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.replace(/Đ/g, "d")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/-{2,}/g, "-")
		.replace(/^-+|-+$/g, "")
	return base || "truong"
}

/** Chuẩn hóa tên để so khớp trùng lặp (bỏ dấu, gom khoảng trắng, viết thường). */
export function normalizeName(input: string): string {
	return (input ?? "")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, " ")
		.trim()
		.replace(/\s+/g, " ")
}

/**
 * Độ tương đồng giữa 2 tên trường (0 → 1). Kết hợp:
 *  - Trùng khít sau chuẩn hóa → 1.
 *  - Một chuỗi chứa chuỗi kia (vd "dai hoc luat" ⊂ "dai hoc luat ha noi") → boost.
 *  - Hệ số Jaccard theo từ (token overlap) — bền với khác biệt thứ tự từ.
 */
export function similarity(a: string, b: string): number {
	const s1 = normalizeName(a)
	const s2 = normalizeName(b)
	if (!s1 || !s2) return 0
	if (s1 === s2) return 1

	const t1 = new Set(s1.split(" "))
	const t2 = new Set(s2.split(" "))
	let inter = 0
	for (const t of t1) if (t2.has(t)) inter++
	const union = new Set([...t1, ...t2]).size
	const jaccard = union ? inter / union : 0

	const sub = s1.includes(s2) || s2.includes(s1) ? 0.7 : 0
	return Math.max(jaccard, sub)
}

/** Ngưỡng cảnh báo trùng lặp ở phía người dùng (hiển thị danh sách "có thể trùng"). */
export const DUPLICATE_WARN_THRESHOLD = 0.5

/** Một vài trường đặc thù khai báo thủ công trong InstitutionsTab (ngoài kho dữ liệu). */
export const EXTRA_STATIC_SCHOOL_NAMES: string[] = [
	"Đại học Hàng hải Việt Nam",
	"Học viện An ninh Nhân dân",
	"Trường Cao đẳng Kỹ thuật Cao Thắng",
]
