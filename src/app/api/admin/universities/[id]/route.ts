import { NextResponse, type NextRequest } from "next/server"
import { sql, ensureCommunityTables } from "@/lib/community/db"
import { getAdminContext } from "@/lib/community/serverAuth"
import { slugify } from "@/lib/community/slug"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// PUT /api/admin/universities/[id]  (CHỈ ADMIN)
// Payload: { action: 'APPROVE' | 'REJECT', reason?: string }
//
//  - APPROVE: status='APPROVED'. Đảm bảo slug tồn tại & duy nhất (sinh nếu thiếu)
//    → trường lập tức xuất hiện trong directory, search, bộ lọc, và thừa kế
//    review / comment / đóng góp (key theo slug). Không lỗi 404.
//  - REJECT: status='REJECTED' + lưu lý do (vd "Đã tồn tại").
// =============================================================
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const ctx = await getAdminContext()
	if (!ctx.isAdmin) {
		return NextResponse.json(
			{ ok: false, error: "FORBIDDEN", message: "Bạn không có quyền thực hiện thao tác này." },
			{ status: 403 },
		)
	}

	const id = Number(params.id)
	if (!Number.isInteger(id) || id <= 0) {
		return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}
	const action = String((body as { action?: string })?.action ?? "").toUpperCase()
	const reason = String((body as { reason?: string })?.reason ?? "").trim().slice(0, 500) || null
	if (action !== "APPROVE" && action !== "REJECT") {
		return NextResponse.json(
			{ ok: false, error: "INVALID_ACTION", message: "action phải là APPROVE hoặc REJECT." },
			{ status: 422 },
		)
	}

	try {
		await ensureCommunityTables()

		if (action === "REJECT") {
			const res = await sql`
				UPDATE universities
				SET status = 'REJECTED', reject_reason = ${reason}
				WHERE id = ${id} AND status = 'PENDING'
				RETURNING id
			`
			if (res.rows.length === 0) {
				return NextResponse.json(
					{ ok: false, error: "NOT_FOUND_OR_PROCESSED", message: "Cơ sở đào tạo không tồn tại hoặc đã được xử lý." },
					{ status: 409 },
				)
			}
			return NextResponse.json({ ok: true, id, status: "REJECTED" })
		}

		// ---- APPROVE ----
		// Lấy bản ghi PENDING trước để đảm bảo slug.
		const row = await sql`SELECT slug, name FROM universities WHERE id = ${id} AND status = 'PENDING' LIMIT 1`
		if (row.rows.length === 0) {
			return NextResponse.json(
				{ ok: false, error: "NOT_FOUND_OR_PROCESSED", message: "Cơ sở đào tạo không tồn tại hoặc đã được xử lý." },
				{ status: 409 },
			)
		}

		// An toàn: nếu vì lý do nào slug rỗng → sinh slug duy nhất từ tên.
		let slug = String(row.rows[0].slug ?? "").trim()
		if (!slug) {
			const base = slugify(String(row.rows[0].name ?? ""))
			slug = base
			let n = 2
			// eslint-disable-next-line no-constant-condition
			while (true) {
				const exists = await sql`SELECT 1 FROM universities WHERE slug = ${slug} AND id <> ${id} LIMIT 1`
				if (exists.rows.length === 0) break
				slug = `${base}-${n++}`
			}
		}

		const upd = await sql`
			UPDATE universities
			SET status = 'APPROVED', slug = ${slug}, reject_reason = NULL
			WHERE id = ${id} AND status = 'PENDING'
			RETURNING id, slug
		`
		if (upd.rows.length === 0) {
			return NextResponse.json(
				{ ok: false, error: "NOT_FOUND_OR_PROCESSED" },
				{ status: 409 },
			)
		}
		return NextResponse.json({ ok: true, id, status: "APPROVED", slug: upd.rows[0].slug })
	} catch (err) {
		console.error("[admin/universities/:id][PUT] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
