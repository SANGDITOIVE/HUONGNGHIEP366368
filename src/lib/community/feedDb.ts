// =============================================================
// FEED TỔNG HỢP (Reddit-style) — gộp câu hỏi + survival tip + review giảng viên
// mới nhất thành một dòng bài đăng chung cho trang Cộng đồng.
// Chỉ đọc; tôn trọng kiểm duyệt (status <> 'removed'). Idempotent qua ensure*.
// =============================================================
import { sql } from "@vercel/postgres"
import { ensureQaTables, parseTags } from "@/lib/community/qaDb"
import { ensureSurvivalTables, categoryLabel } from "@/lib/community/survivalDb"
import { ensureProfessorTables } from "@/lib/community/professorDb"
import { findSchoolBySlug, slugifyVi } from "@/lib/schools/resolve"
import type { FeedItem } from "@/lib/personalization/interests"

function iso(v: unknown): string {
	return v instanceof Date ? v.toISOString() : String(v ?? "")
}

function schoolName(id: string | null): string | null {
	if (!id) return null
	return findSchoolBySlug(id)?.name ?? null
}

/**
 * Lấy feed tổng hợp: mỗi nguồn lấy `perSource` bản ghi mới nhất rồi trộn lại.
 * Trả về FeedItem chuẩn hoá để client/lib xếp hạng (hot + cá nhân hoá).
 */
export async function getCommunityFeed({ perSource = 40 }: { perSource?: number } = {}): Promise<FeedItem[]> {
	const items: FeedItem[] = []

	// 1) Câu hỏi (Q&A)
	try {
		await ensureQaTables()
		const { rows } = await sql`
			SELECT q.id, q.school_id, q.title, q.body, q.tags, q.upvotes, q.downvotes, q.created_at,
				(SELECT COUNT(*)::int FROM answers a WHERE a.question_id = q.id AND a.status = 'visible') AS answer_count
			FROM questions q
			WHERE q.status = 'visible'
			ORDER BY q.created_at DESC
			LIMIT ${perSource}`
		for (const r of rows) {
			const schoolId = (r.school_id as string) ?? null
			items.push({
				kind: "question",
				id: Number(r.id),
				title: String(r.title ?? ""),
				snippet: String(r.body ?? ""),
				schoolId,
				schoolName: schoolName(schoolId),
				tags: parseTags(r.tags),
				fieldId: null,
				score: Number(r.upvotes ?? 0) - Number(r.downvotes ?? 0),
				createdAt: iso(r.created_at),
				href: `/hoi-dap/${Number(r.id)}`,
				extra: { answerCount: Number(r.answer_count ?? 0) },
			})
		}
	} catch (err) {
		console.error("[feed] questions failed", err)
	}

	// 2) Survival tips
	try {
		await ensureSurvivalTables()
		const { rows } = await sql`
			SELECT id, school_id, category, content, trust_score, created_at
			FROM survival_tips
			WHERE status = 'visible'
			ORDER BY created_at DESC
			LIMIT ${perSource}`
		for (const r of rows) {
			const schoolId = (r.school_id as string) ?? null
			const cat = String(r.category ?? "general")
			items.push({
				kind: "survival",
				id: Number(r.id),
				title: `${categoryLabel(cat)}${schoolName(schoolId) ? ` · ${schoolName(schoolId)}` : ""}`,
				snippet: String(r.content ?? ""),
				schoolId,
				schoolName: schoolName(schoolId),
				tags: [],
				fieldId: null,
				score: Number(r.trust_score ?? 0),
				createdAt: iso(r.created_at),
				href: schoolId ? `/truong/${schoolId}/survival-guide` : "/cong-dong/truong",
				extra: { category: cat },
			})
		}
	} catch (err) {
		console.error("[feed] survival failed", err)
	}

	// 3) Review giảng viên
	try {
		await ensureProfessorTables()
		const { rows } = await sql`
			SELECT id, professor_name, professor_slug, school_id, subject, tip_text, trust_score, created_at
			FROM professor_reviews
			ORDER BY created_at DESC
			LIMIT ${perSource}`
		for (const r of rows) {
			const schoolId = (r.school_id as string) ?? null
			const name = String(r.professor_name ?? "")
			const slug = String(r.professor_slug ?? slugifyVi(name))
			const subject = r.subject ? ` (${String(r.subject)})` : ""
			items.push({
				kind: "professor",
				id: Number(r.id),
				title: `Review giảng viên ${name}${subject}`,
				snippet: String(r.tip_text ?? "Đánh giá giảng viên từ sinh viên."),
				schoolId,
				schoolName: schoolName(schoolId),
				tags: [],
				fieldId: null,
				score: Number(r.trust_score ?? 0),
				createdAt: iso(r.created_at),
				href: schoolId ? `/truong/${schoolId}/giang-vien/${slug}` : "/cong-dong/truong",
				extra: { professorName: name },
			})
		}
	} catch (err) {
		console.error("[feed] professor failed", err)
	}

	return items
}
