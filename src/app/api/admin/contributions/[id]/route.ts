import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { db, ensureCommunityTables } from "@/lib/community/db"
import { getAdminContext } from "@/lib/community/serverAuth"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// PUT /api/admin/contributions/[id]  (BẢO MẬT TỐI CAO — CHỈ ADMIN)
// Payload: { action: 'APPROVE' | 'REJECT' }
//
//  - Kiểm tra session.user.email khớp 100% email admin → nếu không: 403.
//  - APPROVE: chạy 1 TRANSACTION:
//      (1) UPDATE contributions SET status='APPROVED'
//      (2) UPSERT vào university_overrides (đè dữ liệu mới lên web công khai)
//  - REJECT: chỉ UPDATE status='REJECTED'.
// =============================================================
export async function PUT(
	req: NextRequest,
	{ params }: { params: { id: string } },
) {
	const ctx = await getAdminContext()
	const adminEmail = ctx.email
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
	if (action !== "APPROVE" && action !== "REJECT") {
		return NextResponse.json(
			{ ok: false, error: "INVALID_ACTION", message: "action phải là APPROVE hoặc REJECT." },
			{ status: 422 },
		)
	}

	try {
		await ensureCommunityTables()

		// ---------- REJECT: chỉ đổi trạng thái ----------
		if (action === "REJECT") {
			const { sql } = await import("@vercel/postgres")
			const res = await sql`
				UPDATE contributions
				SET status = 'REJECTED', reviewed_by = ${adminEmail}, reviewed_at = NOW()
				WHERE id = ${id} AND status = 'PENDING'
				RETURNING id
			`
			if (res.rows.length === 0) {
				return NextResponse.json(
					{ ok: false, error: "NOT_FOUND_OR_PROCESSED", message: "Đóng góp không tồn tại hoặc đã được xử lý." },
					{ status: 409 },
				)
			}
			return NextResponse.json({ ok: true, id, status: "REJECTED" })
		}

		// ---------- APPROVE: TRANSACTION (duyệt + đè dữ liệu) ----------
		const client = await db.connect()
		try {
			await client.query("BEGIN")

			const upd = await client.sql`
				UPDATE contributions
				SET status = 'APPROVED', reviewed_by = ${adminEmail}, reviewed_at = NOW()
				WHERE id = ${id} AND status = 'PENDING'
				RETURNING university_id, field_name, new_value
			`
			if (upd.rows.length === 0) {
				await client.query("ROLLBACK")
				return NextResponse.json(
					{ ok: false, error: "NOT_FOUND_OR_PROCESSED", message: "Đóng góp không tồn tại hoặc đã được xử lý." },
					{ status: 409 },
				)
			}

			const { university_id, field_name, new_value } = upd.rows[0] as {
				university_id: string
				field_name: string
				new_value: string
			}

			// Đè trực tiếp dữ liệu mới vào bảng lưu trữ thông tin trường (overrides).
			await client.sql`
				INSERT INTO university_overrides (university_id, field_name, value, updated_by, updated_at)
				VALUES (${university_id}, ${field_name}, ${new_value}, ${adminEmail}, NOW())
				ON CONFLICT (university_id, field_name)
				DO UPDATE SET value = EXCLUDED.value, updated_by = EXCLUDED.updated_by, updated_at = NOW()
			`

			await client.query("COMMIT")
			return NextResponse.json({
				ok: true,
				id,
				status: "APPROVED",
				applied: { universityId: university_id, fieldName: field_name },
			})
		} catch (txErr) {
			await client.query("ROLLBACK")
			throw txErr
		} finally {
			client.release()
		}
	} catch (err) {
		console.error("[admin/contributions/:id][PUT] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
