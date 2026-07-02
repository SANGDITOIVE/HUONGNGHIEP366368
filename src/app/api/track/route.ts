import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { bumpInterest, getUserProfile } from "@/lib/community/interestsDb"
import { emptyProfile } from "@/lib/personalization/interests"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/track — trả hồ sơ sở thích của user hiện tại (để đồng bộ đa thiết bị).
export async function GET() {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) return NextResponse.json({ ok: true, loggedIn: false, profile: emptyProfile() })
	const profile = await getUserProfile(userId)
	return NextResponse.json({ ok: true, loggedIn: true, profile })
}

// POST /api/track — ghi 1 hành vi { dim, key, weight }. Bắt đăng nhập (yên lặng
// trả 401 nếu chưa) để tracker client fire-and-forget không cần xử lý lỗi.
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	let body: Record<string, unknown>
	try {
		body = (await req.json()) as Record<string, unknown>
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}
	const dim = String(body.dim ?? "")
	const key = String(body.key ?? "")
	const weight = Number(body.weight ?? 1)

	try {
		const ok = await bumpInterest(userId, dim, key, weight)
		if (!ok) return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })
		return NextResponse.json({ ok: true })
	} catch (err) {
		console.error("[/api/track][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
