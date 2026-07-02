// =============================================================
// Hằng số & whitelist dùng chung cho hệ thống Review + Wiki đóng góp.
// =============================================================

// Email quản trị viên tối cao. Có thể override bằng biến môi trường ADMIN_EMAIL.
export const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "lequangdai.spc@gmail.com")
	.trim()
	.toLowerCase()

/** Email Super Admin gốc (Quang Đại) — luôn có toàn quyền, không thể bị gỡ. */
export const SUPER_ADMIN_EMAIL = ADMIN_EMAIL

export type AdminRole = "SUPER_ADMIN" | "ADMIN"

/** So khớp 100% email người đăng nhập với email Super Admin gốc (không phân biệt hoa/thường). */
export function isAdminEmail(email?: string | null): boolean {
	return !!email && email.trim().toLowerCase() === ADMIN_EMAIL
}

/** Đồng nghĩa rõ nghĩa hơn: có phải Super Admin gốc không. */
export function isSuperAdminEmail(email?: string | null): boolean {
	return isAdminEmail(email)
}

export function normalizeEmail(email?: string | null): string {
	return (email ?? "").trim().toLowerCase()
}

/** Regex kiểm tra định dạng email cơ bản. */
export function isValidEmail(email: string): boolean {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Whitelist các mục dữ liệu cho phép cộng đồng đóng góp. Tránh ghi đè bừa
// vào những field không kiểm soát. field_name gửi lên BẮT BUỘC nằm trong danh sách.
export const CONTRIBUTION_FIELDS = {
	nganh_tieu_bieu: "Ngành học tiêu biểu",
	diem_chuan_2025: "Điểm chuẩn 2025",
	co_so_vat_chat: "Cơ sở vật chất",
	hoc_phi: "Học phí",
	tuyen_sinh: "Tuyển sinh & đầu vào",
	gioi_thieu: "Giới thiệu chung",
} as const

export type ContributionFieldKey = keyof typeof CONTRIBUTION_FIELDS

export function contributionFieldLabel(key: string): string {
	return (CONTRIBUTION_FIELDS as Record<string, string>)[key] ?? key
}

export function isValidContributionField(key: string): boolean {
	return Object.prototype.hasOwnProperty.call(CONTRIBUTION_FIELDS, key)
}

export const CONTRIBUTION_FIELD_OPTIONS = Object.entries(CONTRIBUTION_FIELDS).map(
	([key, label]) => ({ key, label }),
)
