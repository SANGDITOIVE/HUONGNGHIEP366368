import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureQaTables } from "@/lib/community/qaDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// DELETE /api/answers/[id] — tác giả hoặc admin ẩn (soft-delete) câu trả lời.
export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const id = Number(params.id)
	if (!Number.isInteger(id) || id <= 0)
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	await ensureQaTables()
	const row = (await sql`SELECT user_id FROM answers WHERE id = ${id} LIMIT 1`).rows[0]
	if (!row) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })

	const role = session?.user?.role
	const isAdmin = role === "ADMIN" || role === "SUPER_ADMIN"
	if (String(row.user_id) !== String(userId) && !isAdmin)
		return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })

	await sql`UPDATE answers SET status = 'removed' WHERE id = ${id}`
	return NextResponse.json({ ok: true })
}
