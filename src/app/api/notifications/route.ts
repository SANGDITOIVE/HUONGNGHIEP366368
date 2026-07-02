import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import {
	sql,
	ensureNotificationsTable,
	toPublicNotification,
	createNotification,
	type NotificationType,
} from "@/lib/community/notificationsDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ADMIN_BUCKET = "__admin__"

function isAdminRole(role: unknown): boolean {
	return role === "ADMIN" || role === "SUPER_ADMIN"
}

// Những loại thông báo client được phép tự tạo cho chính mình (ví dụ xem kết quả test).
const SELF_TYPES: NotificationType[] = ["test_result", "question_posted"]

// GET /api/notifications — danh sách + số chưa đọc của tài khoản đang đăng nhập.
export async function GET() {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id ? String(session.user.id) : null
	if (!userId) return NextResponse.json({ ok: true, notifications: [], unread: 0 })
	const admin = isAdminRole(session?.user?.role)
	await ensureNotificationsTable()

	const rows = admin
		? (await sql`
				SELECT * FROM notifications
				WHERE user_id = ${userId} OR user_id = ${ADMIN_BUCKET}
				ORDER BY created_at DESC LIMIT 50`).rows
		: (await sql`
				SELECT * FROM notifications
				WHERE user_id = ${userId}
				ORDER BY created_at DESC LIMIT 50`).rows

	const unreadRes = admin
		? await sql`SELECT COUNT(*)::int AS c FROM notifications WHERE (user_id = ${userId} OR user_id = ${ADMIN_BUCKET}) AND is_read = false`
		: await sql`SELECT COUNT(*)::int AS c FROM notifications WHERE user_id = ${userId} AND is_read = false`

	return NextResponse.json({
		ok: true,
		notifications: rows.map(toPublicNotification),
		unread: Number(unreadRes.rows[0]?.c ?? 0),
	})
}

// POST /api/notifications
//   { action: "mark_all_read" }              => đánh dấu tất cả đã đọc
//   { action: "self", type, title, body?, link? } => client tự tạo thông báo cho chính mình
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id ? String(session.user.id) : null
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
	const admin = isAdminRole(session?.user?.role)
	await ensureNotificationsTable()

	const b = (await req.json().catch(() => ({}))) as Record<string, unknown>
	const action = String(b.action ?? "mark_all_read")

	if (action === "self") {
		const type = String(b.type ?? "") as NotificationType
		if (!SELF_TYPES.includes(type))
			return NextResponse.json({ ok: false, error: "TYPE_NOT_ALLOWED" }, { status: 422 })
		const title = String(b.title ?? "").trim().slice(0, 200)
		if (!title) return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })
		await createNotification({
			userId,
			type,
			title,
			body: b.body ? String(b.body).slice(0, 500) : null,
			link: b.link ? String(b.link).slice(0, 500) : null,
		})
		return NextResponse.json({ ok: true })
	}

	// mark_all_read
	if (admin) {
		await sql`UPDATE notifications SET is_read = true WHERE (user_id = ${userId} OR user_id = ${ADMIN_BUCKET}) AND is_read = false`
	} else {
		await sql`UPDATE notifications SET is_read = true WHERE user_id = ${userId} AND is_read = false`
	}
	return NextResponse.json({ ok: true })
}
