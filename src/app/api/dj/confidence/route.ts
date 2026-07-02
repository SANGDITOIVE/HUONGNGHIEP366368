// POST /api/dj/confidence — tính 2 trục (năng lực & hứng thú). KHÔNG dùng AI.
import { NextResponse } from "next/server"
import { computeConfidence, type AttemptForConfidence } from "@/lib/dj/scoring"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
		const attempts = (Array.isArray(body?.attempts) ? body.attempts : []) as AttemptForConfidence[]
		const confidence = computeConfidence(attempts)
		return NextResponse.json({ confidence })
	} catch (e) {
		console.error("[api/dj/confidence]", e)
		return NextResponse.json({ error: "confidence_failed" }, { status: 500 })
	}
}
