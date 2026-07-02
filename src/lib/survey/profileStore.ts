// =============================================================
// Lưu hồ sơ khảo sát theo TỪ NG tài khoản Google (theo email).
// Trước đây toàn bộ hồ sơ dùng chung 1 khóa localStorage nên khi
// đăng nhập tài khoản khác vẫn thấy dữ liệu của người trước.
// Module này tách riêng dữ liệu theo email, không chứa React.
// =============================================================

import { PROFILE_STORAGE_KEY, type SurveyPayload } from "./shared"

// Bản đồ email -> hồ sơ. Slot đặc biệt cho người chưa đăng nhập.
const PROFILES_KEY = "huong-nghiep:profiles:v2"
export const GUEST_SLOT = "__guest__"

type ProfileMap = Record<string, SurveyPayload>

function readMap(): ProfileMap {
	try {
		const raw = localStorage.getItem(PROFILES_KEY)
		if (!raw) return {}
		const parsed = JSON.parse(raw)
		return parsed && typeof parsed === "object" ? (parsed as ProfileMap) : {}
	} catch {
		return {}
	}
}

function writeMap(map: ProfileMap) {
	try {
		localStorage.setItem(PROFILES_KEY, JSON.stringify(map))
	} catch {
		/* bỏ qua nếu trình duyệt chặn localStorage */
	}
}

// Chuẩn hóa email thành khóa slot (thường/lowercase). Không email -> guest.
export function slotFor(email?: string | null): string {
	const e = (email ?? "").trim().toLowerCase()
	return e.length > 0 ? e : GUEST_SLOT
}

// Di trú 1 lần: đưa dữ liệu từ khóa chung cũ vào slot khách (logged-out),
// KHÔNG gán cho bất kỳ email nào để tránh rò rỉ sang tài khoản khác.
export function migrateLegacyProfile() {
	try {
		const legacy = localStorage.getItem(PROFILE_STORAGE_KEY)
		if (!legacy) return
		const map = readMap()
		if (!map[GUEST_SLOT]) {
			try {
				map[GUEST_SLOT] = JSON.parse(legacy) as SurveyPayload
				writeMap(map)
			} catch {
				/* dữ liệu cũ hỏng -> bỏ qua */
			}
		}
		// Gỡ khóa chung cũ để không còn dùng lẫn nữa.
		localStorage.removeItem(PROFILE_STORAGE_KEY)
	} catch {
		/* bỏ qua */
	}
}

// Đọc hồ sơ đúng theo tài khoản hiện tại (hoặc khách nếu chưa đăng nhập).
export function readProfileFor(email?: string | null): SurveyPayload | null {
	const map = readMap()
	return map[slotFor(email)] ?? null
}

// Ghi hồ sơ vào đúng slot của tài khoản hiện tại.
export function writeProfileFor(email: string | null | undefined, payload: SurveyPayload) {
	const map = readMap()
	map[slotFor(email)] = payload
	writeMap(map)
	dispatchProfileUpdated()
}

// Xóa hồ sơ của một slot (ví dụ khi muốn làm lại khảo sát).
export function clearProfileFor(email?: string | null) {
	const map = readMap()
	const slot = slotFor(email)
	if (map[slot]) {
		delete map[slot]
		writeMap(map)
		dispatchProfileUpdated()
	}
}

// Có hồ sơ khách (làm khi chưa đăng nhập) hay không?
export function hasGuestProfile(): boolean {
	return !!readMap()[GUEST_SLOT]
}

// Gán hồ sơ khách cho tài khoản hiện tại (người dùng bấm đồng ý),
// sau đó dọn slot khách để không lộ sang tài khoản khác.
export function claimGuestProfileFor(email: string): SurveyPayload | null {
	if (!email) return null
	const map = readMap()
	const guest = map[GUEST_SLOT]
	if (!guest) return readProfileFor(email)
	map[slotFor(email)] = guest
	delete map[GUEST_SLOT]
	writeMap(map)
	dispatchProfileUpdated()
	return guest
}

export function dispatchProfileUpdated() {
	try {
		window.dispatchEvent(new CustomEvent("hoatieu:profile-updated"))
	} catch {
		/* SSR / môi trường không có window */
	}
}
