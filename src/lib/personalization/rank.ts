// =============================================================
// XẾP HẠNG FEED (thuần) — Reddit-style "hot" + cá nhân hoá.
// Dùng chung client + server. Không import module server.
// =============================================================
import {
	type FeedItem,
	type InterestProfile,
	personalScore,
	hasSignal,
} from "@/lib/personalization/interests"

/**
 * Điểm "hot" kiểu Reddit: kết hợp điểm bình chọn (log) và độ mới (gravity).
 * hot = log10(max(|score|,1)) + createdAtSeconds / 45000
 * 45000s (~12.5h) là hằng số trọng lực: bài mới luôn có lợi thế, bài cũ tụt dần
 * trừ khi điểm đủ cao. Dấu của score được giữ để bài bị downvote nặng tụt xuống.
 */
export function hotScore(item: FeedItem): number {
	const s = item.score
	const order = Math.log10(Math.max(Math.abs(s), 1))
	const sign = s > 0 ? 1 : s < 0 ? -1 : 0
	const seconds = new Date(item.createdAt).getTime() / 1000
	return sign * order + seconds / 45000
}

/** Sắp xếp toàn bộ feed theo hot score giảm dần (không cá nhân hoá). */
export function sortByHot(items: FeedItem[]): FeedItem[] {
	return [...items].sort((a, b) => hotScore(b) - hotScore(a))
}

export interface RankedFeed {
	recommended: FeedItem[]
	latest: FeedItem[]
}

/**
 * Xếp lại feed theo hồ sơ sở thích.
 *  - latest: toàn bộ feed theo hot score (dòng thời gian chính).
 *  - recommended: các item có điểm cá nhân hoá > 0, ưu tiên item khớp sở thích
 *    (personalScore) kết hợp một phần hot score để không đề xuất bài quá cũ.
 * Nếu chưa có tín hiệu sở thích → recommended rỗng (UI ẩn mục này).
 */
export function rankFeed(
	items: FeedItem[],
	profile: InterestProfile,
	opts: { recommendLimit?: number } = {},
): RankedFeed {
	const latest = sortByHot(items)
	if (!hasSignal(profile)) return { recommended: [], latest }

	const recommendLimit = opts.recommendLimit ?? 5
	// Chuẩn hoá hot score về ~0..1 để cộng công bằng với personalScore.
	const hots = items.map(hotScore)
	const minH = Math.min(...hots)
	const maxH = Math.max(...hots)
	const spanH = maxH - minH || 1

	const scored = items
		.map((item) => {
			const p = personalScore(item, profile)
			const h = (hotScore(item) - minH) / spanH
			// Ưu tiên độ liên quan (0.7) hơn độ mới (0.3).
			return { item, p, combined: p * 0.7 + h * 0.3 }
		})
		.filter((x) => x.p > 0)
		.sort((a, b) => b.combined - a.combined)

	return {
		recommended: scored.slice(0, recommendLimit).map((x) => x.item),
		latest,
	}
}
