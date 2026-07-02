// =============================================================
// Phân giải "trường" từ slug trên URL (/truong/[slug]/...).
// Dữ liệu trường nằm trong 2 file TypeScript TĨNH (không phải bảng DB):
//   - UNIVERSITIES (src/data/universities.ts): danh sách lõi, id ngắn (vd "hust")
//   - SCHOOL_DIRECTORY (src/data/schoolDirectory.ts): danh bạ ~200 trường, id dạng slug
// => Ta dùng chính `id` có sẵn (đã ổn định & duy nhất) làm slug URL, KHÔNG tạo
//    FK cứng vì đây là dữ liệu tĩnh trong code.
// =============================================================
import { SCHOOL_DIRECTORY } from "@/data/schoolDirectory"
import { UNIVERSITIES } from "@/data/universities"

export interface ResolvedSchool {
	id: string
	name: string
}

/**
 * Bỏ dấu tiếng Việt + chuẩn hoá thành slug an toàn cho URL.
 * Dùng chung cho slug giảng viên (professor_slug) để tra cứu theo [name].
 * Không dùng escape \u — lọc dấu tổ hợp theo code point (0x300–0x36f).
 */
export function slugifyVi(input: string): string {
	const decomposed = (input ?? "").normalize("NFD")
	let base = ""
	for (const ch of decomposed) {
		const code = ch.codePointAt(0) ?? 0
		if (code >= 0x300 && code <= 0x36f) continue // bỏ dấu thanh/dấu phụ tổ hợp
		base += ch
	}
	return base
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
}

// Gộp 2 nguồn trường; ưu tiên id lõi UNIVERSITIES nếu trùng.
function buildIndex(): Map<string, ResolvedSchool> {
	const map = new Map<string, ResolvedSchool>()
	for (const u of UNIVERSITIES) {
		if (u?.id && !map.has(u.id)) map.set(u.id, { id: u.id, name: u.name })
	}
	for (const s of SCHOOL_DIRECTORY) {
		if (s?.id && !map.has(s.id)) map.set(s.id, { id: s.id, name: s.name })
	}
	return map
}

const SCHOOL_INDEX = buildIndex()

/** Tìm trường theo slug (= id). Trả null nếu không có => trang trả 404. */
export function findSchoolBySlug(slug: string): ResolvedSchool | null {
	if (!slug) return null
	return SCHOOL_INDEX.get(slug) ?? null
}

/** Danh sách toàn bộ trường (đã sort theo tên) cho trang chọn trường. */
export function getAllSchools(): ResolvedSchool[] {
	return Array.from(SCHOOL_INDEX.values()).sort((a, b) =>
		a.name.localeCompare(b.name, "vi"),
	)
}
