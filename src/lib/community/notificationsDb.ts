import { sql } from "@vercel/postgres"

// =============================================================
// notificationsDb — Trung tâm thông báo cho HoaTieu (V27 · Đợt 2)
// Bảng notifications tự CREATE IF NOT EXISTS lúc chạy, KHÔNG cần chạy SQL tay.
// Mọi thông báo đều gắn theo user_id (tài khoản Google) => đồng bộ theo tài khoản.
// =============================================================

export { sql }

// Các loại thông báo hỗ trợ.
export type NotificationType =
	| "question_posted" // câu hỏi của bạn đã đăng thành công
	| "answer_on_question" // có người trả lời câu hỏi của bạn
	| "comment_on_answer" // có người bình luận vào câu trả lời của bạn
	| "reply_on_comment" // có người trả lời bình luận của bạn
	| "reaction" // có người thả react vào nội dung của bạn
	| "mention" // có người tag @bạn
	| "test_result" // kết quả bài test / khám phá bản thân
	| "hashtag_post" // bài mới theo hashtag bạn theo dõi
	| "favorite_school_post" // bài mới ở trường bạn yêu thích
	| "admin_report" // (admin) có report mới cần xử lý
	| "admin_content" // (admin) nội dung mới / cập nhật quản trị

export interface PublicNotification {
	id: number
	type: NotificationType
	title: string
	body: string | null
	link: string | null
	actorName: string | null
	isRead: boolean
	createdAt: string
}

let ensured = false
export async function ensureNotificationsTable(): Promise<void> {
	if (ensured) return
	await sql`
		CREATE TABLE IF NOT EXISTS notifications (
			id SERIAL PRIMARY KEY,
			user_id TEXT NOT NULL,
			type TEXT NOT NULL,
			title TEXT NOT NULL,
			body TEXT,
			link TEXT,
			actor_name TEXT,
			is_read BOOLEAN NOT NULL DEFAULT false,
			created_at TIMESTAMPTZ NOT NULL DEFAULT now()
		)`
	await sql`CREATE INDEX IF NOT EXISTS notifications_user_idx ON notifications (user_id, is_read, created_at DESC)`
	ensured = true
}

export function toPublicNotification(r: Record<string, unknown>): PublicNotification {
	return {
		id: Number(r.id),
		type: String(r.type) as NotificationType,
		title: String(r.title ?? ""),
		body: (r.body as string | null) ?? null,
		link: (r.link as string | null) ?? null,
		actorName: (r.actor_name as string | null) ?? null,
		isRead: Boolean(r.is_read),
		createdAt: String(r.created_at),
	}
}

// Tạo 1 thông báo. Bỏ qua nếu thiếu người nhận. Không tự-thông-báo cho chính actor
// (trừ khi cố ý, ví dụ question_posted / test_result) — người gọi tự quyết định.
export async function createNotification(input: {
	userId: string | null | undefined
	type: NotificationType
	title: string
	body?: string | null
	link?: string | null
	actorName?: string | null
}): Promise<void> {
	const userId = input.userId ? String(input.userId) : ""
	if (!userId) return
	try {
		await ensureNotificationsTable()
		await sql`
			INSERT INTO notifications (user_id, type, title, body, link, actor_name)
			VALUES (${userId}, ${input.type}, ${input.title}, ${input.body ?? null}, ${input.link ?? null}, ${input.actorName ?? null})`
	} catch (err) {
		// Thông báo là phụ trợ: KHÔNG được làm hỏng hành động chính nếu insert lỗi.
		console.error("createNotification failed", err)
	}
}

// Gửi cùng một thông báo tới nhiều admin (dùng danh sách user_id admin).
export async function notifyAdmins(
	adminUserIds: string[],
	input: { type: NotificationType; title: string; body?: string | null; link?: string | null; actorName?: string | null },
): Promise<void> {
	const ids = Array.from(new Set(adminUserIds.filter(Boolean).map(String)))
	for (const id of ids) {
		await createNotification({ userId: id, ...input })
	}
}

export async function listNotifications(userId: string, limit = 50): Promise<PublicNotification[]> {
	await ensureNotificationsTable()
	const lim = Math.min(Math.max(1, limit), 100)
	const res = await sql`
		SELECT * FROM notifications
		WHERE user_id = ${userId}
		ORDER BY created_at DESC
		LIMIT ${lim}`
	return res.rows.map(toPublicNotification)
}

export async function unreadCount(userId: string): Promise<number> {
	await ensureNotificationsTable()
	const res = await sql`SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = ${userId} AND is_read = false`
	return Number(res.rows[0]?.c ?? 0)
}

export async function markRead(userId: string, id: number): Promise<void> {
	await ensureNotificationsTable()
	await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND user_id = ${userId}`
}

export async function markAllRead(userId: string): Promise<void> {
	await ensureNotificationsTable()
	await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId} AND is_read = false`
}
