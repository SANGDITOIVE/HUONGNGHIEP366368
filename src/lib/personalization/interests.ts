// =============================================================
// CÁ NHÂN HOÁ — MODULE THUẦN (dùng chung client + server).
// KHÔNG import module server (@vercel/postgres, next/*) để cả React client
// component lẫn API route đều import an toàn.
//
// Ý tưởng thuật toán: hồ sơ sở thích của user = trọng số theo 3 chiều:
//   - school: các trường user xem/tương tác nhiều
//   - field:  lĩnh vực ngành (fieldId) user quan tâm
//   - tag:    thẻ chủ đề (hỏi đáp) user quan tâm
// Mỗi lần user xem 1 trang ngành/trường hay bấm vào 1 bài trong feed, ta cộng
// dồn trọng số. Feed sau đó được xếp lại: item nào khớp sở thích thì được đẩy lên
// mục "Đề xuất cho bạn".
// =============================================================

export type InterestDimension = "school" | "field" | "tag"

export interface InterestProfile {
	school: Record<string, number>
	field: Record<string, number>
	tag: Record<string, number>
}

// Một mục trong feed tổng hợp (question / survival / professor review).
export interface FeedItem {
	kind: "question" | "survival" | "professor"
	id: number
	title: string
	snippet: string
	schoolId: string | null
	schoolName: string | null
	tags: string[]
	fieldId: string | null
	score: number
	createdAt: string
	href: string
	extra?: { answerCount?: number; category?: string; professorName?: string }
}

export function emptyProfile(): InterestProfile {
	return { school: {}, field: {}, tag: {} }
}

/** Cộng 1 sự kiện vào hồ sơ (mutate + trả về chính profile để tiện dùng chuỗi). */
export function addEvent(
	profile: InterestProfile,
	dim: InterestDimension,
	key: string,
	weight = 1,
): InterestProfile {
	const k = (key ?? "").trim()
	if (!k) return profile
	const bucket = profile[dim]
	bucket[k] = (bucket[k] ?? 0) + weight
	return profile
}

/** Gộp 2 hồ sơ (vd local + server). Trả về hồ sơ mới, không mutate đầu vào. */
export function mergeProfiles(a: InterestProfile, b: InterestProfile): InterestProfile {
	const out = emptyProfile()
	for (const dim of ["school", "field", "tag"] as InterestDimension[]) {
		for (const [k, v] of Object.entries(a[dim])) out[dim][k] = (out[dim][k] ?? 0) + v
		for (const [k, v] of Object.entries(b[dim])) out[dim][k] = (out[dim][k] ?? 0) + v
	}
	return out
}

/** Tổng trọng số của 1 chiều (để chuẩn hoá về 0..1). */
function dimTotal(bucket: Record<string, number>): number {
	let t = 0
	for (const v of Object.values(bucket)) t += v
	return t
}

/**
 * Điểm cá nhân hoá của 1 item theo hồ sơ, chuẩn hoá về ~0..1.
 * Cộng phần khớp của trường + lĩnh vực + tag, mỗi chiều chia cho tổng của chiều
 * đó để không chiều nào áp đảo chỉ vì được ghi nhiều lần.
 */
export function personalScore(item: FeedItem, profile: InterestProfile): number {
	let s = 0
	const schoolTotal = dimTotal(profile.school)
	if (item.schoolId && schoolTotal > 0) {
		s += (profile.school[item.schoolId] ?? 0) / schoolTotal
	}
	const fieldTotal = dimTotal(profile.field)
	if (item.fieldId && fieldTotal > 0) {
		s += (profile.field[item.fieldId] ?? 0) / fieldTotal
	}
	const tagTotal = dimTotal(profile.tag)
	if (tagTotal > 0 && item.tags.length > 0) {
		let tagHit = 0
		for (const t of item.tags) tagHit += (profile.tag[t] ?? 0) / tagTotal
		s += tagHit
	}
	return s
}

/** Có dữ liệu sở thích hay chưa (để quyết định hiện mục "Đề xuất cho bạn"). */
export function hasSignal(profile: InterestProfile): boolean {
	return (
		Object.keys(profile.school).length > 0 ||
		Object.keys(profile.field).length > 0 ||
		Object.keys(profile.tag).length > 0
	)
}
