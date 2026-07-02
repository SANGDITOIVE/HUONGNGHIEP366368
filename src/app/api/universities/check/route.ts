import { NextResponse, type NextRequest } from "next/server"
import { sql, ensureCommunityTables } from "@/lib/community/db"
import { UNIVERSITIES } from "@/data/universities"
import {
	similarity,
	DUPLICATE_WARN_THRESHOLD,
	EXTRA_STATIC_SCHOOL_NAMES,
} from "@/lib/community/slug"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const STATIC_NAMES: string[] = [
	...UNIVERSITIES.map((u) => u.name),
	...EXTRA_STATIC_SCHOOL_NAMES,
]

// =============================================================
// GET /api/universities/check?name=...
// Trả về danh sách trường "có thể trùng" để cảnh báo ngay khi người dùng gõ
// (giải quyết vấn đề #1 Trùng lặp dữ liệu). So khớp cả dữ liệu tĩnh + DB đã duyệt.
// =============================================================
export async function GET(req: NextRequest) {
	const name = (req.nextUrl.searchParams.get("name") ?? "").trim()
	if (name.length < 3) {
		return NextResponse.json({ ok: true, matches: [] })
	}

	const matches: { name: string; source: string; score: number }[] = []
	for (const s of STATIC_NAMES) {
		const score = similarity(name, s)
		if (score >= DUPLICATE_WARN_THRESHOLD) {
			matches.push({ name: s, source: "đã có sẵn", score })
		}
	}

	try {
		await ensureCommunityTables()
		const res = await sql`
			SELECT name, status FROM universities
			WHERE status IN ('APPROVED','PENDING')
		`
		for (const r of res.rows) {
			const score = similarity(name, r.name as string)
			if (score >= DUPLICATE_WARN_THRESHOLD) {
				matches.push({
					name: r.name as string,
					source: r.status === "APPROVED" ? "cộng đồng" : "đang chờ duyệt",
					score,
				})
			}
		}
	} catch (err) {
		console.error("[universities/check][GET] db failed", err)
	}

	matches.sort((a, b) => b.score - a.score)
	return NextResponse.json({ ok: true, matches: matches.slice(0, 5) })
}
