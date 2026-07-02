import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { reportContent, isValidReportTarget } from "@/lib/community/moderation"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// POST /api/reports  { targetType, targetId, reason? }
// Dùng chung cho survival_tip | survival_reply | question | answer.
// Bắt đăng nhập để tránh spam report; mỗi user chỉ tính 1 report/target.
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const userId = session?.user?.id
	if (!userId) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	const b = (await req.json()) as Record<string, unknown>
	const targetType = String(b.targetType ?? b.target_type ?? "")
	const targetId = Number(b.targetId ?? b.target_id)
	const reason = b.reason != null ? String(b.reason) : null

	if (!isValidReportTarget(targetType) || !Number.isInteger(targetId) || targetId <= 0)
		return NextResponse.json({ ok: false, error: "VALIDATION_FAILED" }, { status: 422 })

	const { reportCount, hidden } = await reportContent({ targetType, targetId, userId, reason })
	return NextResponse.json({ ok: true, reportCount, hidden })
}
