import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureNotificationsTable } from "@/lib/community/notificationsDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const ADMIN_BUCKET = "__admin__"

function isAdminRole(role: unknown): boolean {
	return role === "ADMIN" || role === "SUPER_ADMIN"
}

// POST /api/notifications/[id] — đánh dấu 1 thông báo đã đọc (khi user bấm vào nó).
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id ? String(session.user.id) : null
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
	const id = Number(params.id)
	if (!Number.isInteger(id) || id <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
	await ensureNotificationsTable()
	const admin = isAdminRole(session?.user?.role)
	if (admin) {
		await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND (user_id = ${userId} OR user_id = ${ADMIN_BUCKET})`
	} else {
		await sql`UPDATE notifications SET is_read = true WHERE id = ${id} AND user_id = ${userId}`
	}
	return NextResponse.json({ ok: true })
}
