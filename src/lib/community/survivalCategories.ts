// =============================================================
// Danh mục category cho Survival Guide — AN TOÀN CHO CLIENT (không import
// bất kỳ module server/@vercel/postgres nào) để cả component client lẫn
// lớp DB server đều dùng chung 1 nguồn.
// icon = tên icon lucide-react (component tự map sang icon thật).
// =============================================================
export const SURVIVAL_CATEGORIES = [
	{ value: "checklist", code: "CHECKLIST_PRE_ENROLLMENT", label: "Checklist trước nhập học", icon: "ListChecks" },
	{ value: "mistakes", code: "COMMON_MISTAKES", label: "Lỗi thường gặp", icon: "AlertTriangle" },
	{ value: "food", code: "FOOD_SPOTS", label: "Quán ăn · chỗ ăn", icon: "Utensils" },
	{ value: "housing", code: "HOUSING_REVIEW", label: "Nhà trọ · Ký túc xá", icon: "Home" },
	{ value: "intern", code: "INTERN_EXPERIENCE", label: "Kinh nghiệm thực tập", icon: "Briefcase" },
	{ value: "general", code: "GENERAL", label: "Chung", icon: "MessageCircle" },
] as const

export type SurvivalCategory = (typeof SURVIVAL_CATEGORIES)[number]["value"]

export function isValidCategory(v: string): v is SurvivalCategory {
	return SURVIVAL_CATEGORIES.some((c) => c.value === v)
}

export function categoryLabel(v: string): string {
	return SURVIVAL_CATEGORIES.find((c) => c.value === v)?.label ?? "Chung"
}
