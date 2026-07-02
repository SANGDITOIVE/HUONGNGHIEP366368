import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { softDeleteComment } from "@/lib/community/socialDb"

function isAdminRole(role?: string | null): boolean {
	return role === "ADMIN" || role === "SUPER_ADMIN"
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
	const id = Number(params.id)
	if (!Number.isFinite(id)) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
	const session = await getServerSession(authOptions)
	const user = session?.user as { id?: string; role?: string } | undefined
	if (!user?.id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })
	const result = await softDeleteComment(id, user.id, isAdminRole(user.role))
	if (result.notFound) return NextResponse.json({ ok: false, error: "NOT_FOUND" }, { status: 404 })
	if (result.forbidden) return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
	return NextResponse.json({ ok: true })
}
