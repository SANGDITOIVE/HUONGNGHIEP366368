import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { searchAppUsers } from "@/lib/community/socialDb"

export async function GET(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user as { id?: string } | undefined
	if (!user?.id) return NextResponse.json({ ok: true, users: [] })
	const q = (req.nextUrl.searchParams.get("q") ?? "").trim()
	if (q.length < 1) return NextResponse.json({ ok: true, users: [] })
	const users = await searchAppUsers(q, 8)
	return NextResponse.json({ ok: true, users })
}
