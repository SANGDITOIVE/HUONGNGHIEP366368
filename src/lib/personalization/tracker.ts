// =============================================================
// TRACKER (CLIENT) — ghi hành vi xem của user vào localStorage, có suy giảm
// theo thời gian (time-decay), và đồng bộ lên server khi đã đăng nhập.
// Chỉ chạy phía client (dùng window/localStorage).
// =============================================================
import {
	type InterestProfile,
	type InterestDimension,
	emptyProfile,
	addEvent,
} from "@/lib/personalization/interests"

const STORAGE_KEY = "hoatieu:interests"
// Nửa đời (half-life) ~14 ngày: sở thích cũ nhạt dần để feed bám hành vi gần đây.
const HALFLIFE_DAYS = 14
const MIN_WEIGHT = 0.05 // dưới ngưỡng này thì bỏ để hồ sơ không phình to

interface StoredProfile {
	profile: InterestProfile
	updatedAt: number
}

function isBrowser(): boolean {
	return typeof window !== "undefined" && !!window.localStorage
}

function decayFactor(fromMs: number, toMs: number): number {
	const days = Math.max(0, (toMs - fromMs) / 86_400_000)
	if (days <= 0) return 1
	return Math.pow(0.5, days / HALFLIFE_DAYS)
}

function applyDecay(profile: InterestProfile, factor: number): InterestProfile {
	if (factor >= 1) return profile
	for (const dim of ["school", "field", "tag"] as InterestDimension[]) {
		const bucket = profile[dim]
		for (const k of Object.keys(bucket)) {
			const v = bucket[k] * factor
			if (v < MIN_WEIGHT) delete bucket[k]
			else bucket[k] = v
		}
	}
	return profile
}

/** Đọc hồ sơ local đã áp suy giảm theo thời gian tính tới hiện tại. */
export function readLocalProfile(): InterestProfile {
	if (!isBrowser()) return emptyProfile()
	try {
		const raw = window.localStorage.getItem(STORAGE_KEY)
		if (!raw) return emptyProfile()
		const parsed = JSON.parse(raw) as StoredProfile
		const profile: InterestProfile = {
			school: parsed.profile?.school ?? {},
			field: parsed.profile?.field ?? {},
			tag: parsed.profile?.tag ?? {},
		}
		return applyDecay(profile, decayFactor(parsed.updatedAt ?? Date.now(), Date.now()))
	} catch {
		return emptyProfile()
	}
}

function writeLocalProfile(profile: InterestProfile): void {
	if (!isBrowser()) return
	try {
		const payload: StoredProfile = { profile, updatedAt: Date.now() }
		window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
	} catch {
		/* localStorage đầy hoặc bị chặn — bỏ qua, không phá luồng người dùng */
	}
}

/**
 * Ghi nhận 1 hành vi. Cập nhật local ngay, và bắn lên server (fire-and-forget);
 * nếu chưa đăng nhập, API trả 401 và ta bỏ qua một cách yên lặng.
 */
export function track(dim: InterestDimension, key: string, weight = 1): void {
	if (!isBrowser()) return
	const k = (key ?? "").trim()
	if (!k) return
	const profile = readLocalProfile()
	addEvent(profile, dim, k, weight)
	writeLocalProfile(profile)

	// Đồng bộ server (chỉ có tác dụng khi đã đăng nhập). Không chờ kết quả.
	void fetch("/api/track", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ dim, key: k, weight }),
		keepalive: true,
	}).catch(() => {})
}

/** Ghi nhiều key cùng chiều (vd nhiều trường của 1 ngành). */
export function trackMany(dim: InterestDimension, keys: string[], weight = 1): void {
	for (const k of keys) track(dim, k, weight)
}
