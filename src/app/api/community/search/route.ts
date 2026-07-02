import { NextRequest, NextResponse } from "next/server"
import { sql, ensureQaTables } from "@/lib/community/qaDb"
import { ensureSurvivalTables, categoryLabel } from "@/lib/community/survivalDb"
import { ensureProfessorTables } from "@/lib/community/professorDb"
import { getAllSchools, findSchoolBySlug, slugifyVi } from "@/lib/schools/resolve"
import { MAJORS } from "@/data/majors"
import { FIELD_BY_ID } from "@/data/majorFields"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const PER_GROUP = 5

// Trường đào tạo 1 ngành: tách phần sau "@" trong universityProgramIds.
function schoolsForMajor(programIds: string[] | undefined) {
	const seen = new Set<string>()
	const out: { id: string; name: string }[] = []
	for (const pid of programIds ?? []) {
		const id = pid.split("@")[1]
		if (!id || seen.has(id)) continue
		seen.add(id)
		const s = findSchoolBySlug(id)
		if (s) out.push({ id: s.id, name: s.name })
	}
	return out.slice(0, 6)
}

// GET /api/community/search?q=... — tìm tổng hợp giảng viên / survival / hỏi đáp /
// trường / ngành (kèm trường liên quan đến ngành).
export async function GET(req: NextRequest) {
	const q = (new URL(req.url).searchParams.get("q") ?? "").trim().slice(0, 80)
	if (q.length < 2) {
		return NextResponse.json({
			ok: true,
			q,
			professors: [],
			survival: [],
			questions: [],
			schools: [],
			majors: [],
		})
	}
	const like = `%${q}%`
	const nq = slugifyVi(q)

	// --- Nguồn tĩnh: trường + ngành (khớp không dấu) ---
	const schools = getAllSchools()
		.filter((s) => slugifyVi(s.name).includes(nq))
		.slice(0, PER_GROUP)
		.map((s) => ({ id: s.id, name: s.name, href: `/truong/${s.id}/giang-vien` }))

	const majors = MAJORS.filter((m) => slugifyVi(m.name).includes(nq))
		.slice(0, PER_GROUP)
		.map((m) => ({
			id: m.id,
			name: m.name,
			field: FIELD_BY_ID[m.fieldId]?.name ?? null,
			href: `/nganh-hoc/${m.id}`,
			schools: schoolsForMajor(m.universityProgramIds),
		}))

	// --- Nguồn DB: giảng viên / survival / hỏi đáp (khớp ILIKE có dấu) ---
	let professors: unknown[] = []
	let survival: unknown[] = []
	let questions: unknown[] = []

	try {
		await ensureProfessorTables()
		const { rows } = await sql`
			SELECT professor_name, professor_slug, school_id, MAX(subject) AS subject, COUNT(*)::int AS c
			FROM professor_reviews
			WHERE professor_name ILIKE ${like} OR subject ILIKE ${like}
			GROUP BY professor_name, professor_slug, school_id
			ORDER BY c DESC LIMIT ${PER_GROUP}`
		professors = rows.map((r) => ({
			name: String(r.professor_name),
			subject: r.subject ? String(r.subject) : null,
			schoolId: String(r.school_id),
			schoolName: findSchoolBySlug(String(r.school_id))?.name ?? null,
			reviewCount: Number(r.c ?? 0),
			href: `/truong/${String(r.school_id)}/giang-vien/${String(r.professor_slug)}`,
		}))
	} catch (err) {
		console.error("[search] professors failed", err)
	}

	try {
		await ensureSurvivalTables()
		const { rows } = await sql`
			SELECT id, school_id, category, content FROM survival_tips
			WHERE status <> 'removed' AND content ILIKE ${like}
			ORDER BY created_at DESC LIMIT ${PER_GROUP}`
		survival = rows.map((r) => {
			const schoolId = String(r.school_id)
			return {
				id: Number(r.id),
				category: categoryLabel(String(r.category)),
				snippet: String(r.content ?? "").slice(0, 120),
				schoolId,
				schoolName: findSchoolBySlug(schoolId)?.name ?? null,
				href: `/truong/${schoolId}/survival-guide`,
			}
		})
	} catch (err) {
		console.error("[search] survival failed", err)
	}

	try {
		await ensureQaTables()
		const { rows } = await sql`
			SELECT id, school_id, title FROM questions
			WHERE status <> 'removed' AND (title ILIKE ${like} OR body ILIKE ${like} OR tags ILIKE ${like})
			ORDER BY created_at DESC LIMIT ${PER_GROUP}`
		questions = rows.map((r) => {
			const schoolId = r.school_id ? String(r.school_id) : null
			return {
				id: Number(r.id),
				title: String(r.title ?? ""),
				schoolName: schoolId ? findSchoolBySlug(schoolId)?.name ?? null : null,
				href: `/hoi-dap/${Number(r.id)}`,
			}
		})
	} catch (err) {
		console.error("[search] questions failed", err)
	}

	return NextResponse.json({ ok: true, q, professors, survival, questions, schools, majors })
}
