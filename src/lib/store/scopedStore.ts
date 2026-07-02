// =============================================================
// Lưu trữ localStorage TÁCH RIÊNG theo từng tài khoản Google.
// Mỗi namespace giữ một bản đồ: slot -> giá trị, trong đó slot là email
// (đã lowercase) của tài khoản đang đăng nhập, hoặc slot khách dùng chung
// khi chưa đăng nhập. Nhờ vậy mỗi account chỉ thấy đúng dữ liệu của mình,
// kể cả khi nhiều người đăng nhập trên cùng một trình duyệt.
// Module thuần JS (không React) để import được ở mọi nơi.
// =============================================================

export const GUEST_SLOT = "__guest__"
export const SCOPED_EVENT = "hoatieu:scoped-updated"

// Chuẩn hóa email thành khóa slot. Không có email -> slot khách.
export function slotFor(email?: string | null): string {
	const e = (email ?? "").trim().toLowerCase()
	return e.length > 0 ? e : GUEST_SLOT
}

function mapKey(ns: string): string {
	return `huong-nghiep:scoped:${ns}`
}

function readMap(ns: string): Record<string, unknown> {
	try {
		const raw = localStorage.getItem(mapKey(ns))
		if (!raw) return {}
		const parsed = JSON.parse(raw)
		return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {}
	} catch {
		return {}
	}
}

// Đọc giá trị của đúng tài khoản hiện tại (hoặc khách nếu chưa đăng nhập).
export function readScoped<T>(ns: string, email: string | null | undefined, fallback: T): T {
	const map = readMap(ns)
	const v = map[slotFor(email)]
	return v === undefined ? fallback : (v as T)
}

// Ghi giá trị vào đúng slot của tài khoản hiện tại + phát sự kiện đồng bộ.
export function writeScoped<T>(ns: string, email: string | null | undefined, value: T): void {
	try {
		const map = readMap(ns)
		map[slotFor(email)] = value
		localStorage.setItem(mapKey(ns), JSON.stringify(map))
		dispatchScoped(ns)
	} catch {
		/* trình duyệt chặn localStorage -> bỏ qua */
	}
}

// Xóa dữ liệu của một slot (ví dụ làm lại từ đầu).
export function clearScoped(ns: string, email?: string | null): void {
	try {
		const map = readMap(ns)
		if (map[slotFor(email)] !== undefined) {
			delete map[slotFor(email)]
			localStorage.setItem(mapKey(ns), JSON.stringify(map))
			dispatchScoped(ns)
		}
	} catch {
		/* bỏ qua */
	}
}

// Di trú 1 lần: chuyển dữ liệu từ khóa chung cũ vào slot khách,
// KHÔNG gán cho email nào để tránh rò rỉ sang tài khoản khác, rồi xóa khóa cũ.
export function migrateLegacyScoped(ns: string, legacyKey: string): void {
	try {
		const legacy = localStorage.getItem(legacyKey)
		if (legacy == null) return
		const map = readMap(ns)
		if (map[GUEST_SLOT] === undefined) {
			try {
				map[GUEST_SLOT] = JSON.parse(legacy)
				localStorage.setItem(mapKey(ns), JSON.stringify(map))
			} catch {
				/* dữ liệu cũ hỏng -> bỏ qua */
			}
		}
		localStorage.removeItem(legacyKey)
	} catch {
		/* bỏ qua */
	}
}

// Phát sự kiện để các component khác cùng tài khoản nạp lại dữ liệu mới.
export function dispatchScoped(ns: string): void {
	try {
		window.dispatchEvent(new CustomEvent(SCOPED_EVENT, { detail: { ns } }))
	} catch {
		/* SSR / môi trường không có window */
	}
}
