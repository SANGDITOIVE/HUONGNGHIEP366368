import { NextResponse } from "next/server"
import { getCommunityFeed } from "@/lib/community/feedDb"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// GET /api/feed — feed cộng đồng tổng hợp (chưa cá nhân hoá; client tự xếp lại).
export async function GET() {
	try {
		const items = await getCommunityFeed({ perSource: 40 })
		return NextResponse.json({ ok: true, count: items.length, items })
	} catch (err) {
		console.error("[/api/feed] failed", err)
		return NextResponse.json({ ok: false, items: [] }, { status: 500 })
	}
}
