import { NextResponse, type NextRequest } from "next/server"
import { listAdmins, addAdmin, removeAdmin } from "@/lib/community/db"
import { getAdminContext } from "@/lib/community/serverAuth"
import { isValidEmail, normalizeEmail, SUPER_ADMIN_EMAIL } from "@/lib/community/constants"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// GET /api/admin/whitelist  — xem danh sách admin (chỉ admin/super admin).
// =============================================================
export async function GET() {
	const ctx = await getAdminContext()
	if (!ctx.isAdmin) {
		return NextResponse.json({ ok: false, error: "FORBIDDEN" }, { status: 403 })
	}
	try {
		const admins = await listAdmins()
		return NextResponse.json({ ok: true, admins, isSuperAdmin: ctx.isSuperAdmin })
	} catch (err) {
		console.error("[whitelist][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}

// =============================================================
// POST /api/admin/whitelist  { email }  — cấp quyền Admin (CHỈ SUPER_ADMIN).
// =============================================================
export async function POST(req: NextRequest) {
	const ctx = await getAdminContext()
	if (!ctx.isSuperAdmin) {
		return NextResponse.json(
			{ ok: false, error: "FORBIDDEN", message: "Chỉ Super Admin mới có quyền cấp Admin." },
			{ status: 403 },
		)
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}
	const email = normalizeEmail((body as { email?: string })?.email)
	if (!email || !isValidEmail(email)) {
		return NextResponse.json(
			{ ok: false, error: "INVALID_EMAIL", message: "Email không hợp lệ." },
			{ status: 422 },
		)
	}

	try {
		await addAdmin(email, ctx.email ?? "super-admin")
		const admins = await listAdmins()
		return NextResponse.json({ ok: true, admins }, { status: 201 })
	} catch (err) {
		console.error("[whitelist][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}

// =============================================================
// DELETE /api/admin/whitelist  { email }  — gỡ quyền Admin (CHỈ SUPER_ADMIN).
// Không thể gỡ chính Super Admin gốc.
// =============================================================
export async function DELETE(req: NextRequest) {
	const ctx = await getAdminContext()
	if (!ctx.isSuperAdmin) {
		return NextResponse.json(
			{ ok: false, error: "FORBIDDEN", message: "Chỉ Super Admin mới có quyền gỡ Admin." },
			{ status: 403 },
		)
	}

	// Cho phép truyền email qua body hoặc query param.
	let email = normalizeEmail(new URL(req.url).searchParams.get("email"))
	if (!email) {
		try {
			const body = await req.json()
			email = normalizeEmail((body as { email?: string })?.email)
		} catch {
			/* bỏ qua */
		}
	}
	if (!email) {
		return NextResponse.json({ ok: false, error: "MISSING_EMAIL" }, { status: 400 })
	}
	if (email === SUPER_ADMIN_EMAIL) {
		return NextResponse.json(
			{ ok: false, error: "CANNOT_REMOVE_SUPER_ADMIN", message: "Không thể gỡ quyền Super Admin gốc." },
			{ status: 409 },
		)
	}

	try {
		await removeAdmin(email)
		const admins = await listAdmins()
		return NextResponse.json({ ok: true, admins })
	} catch (err) {
		console.error("[whitelist][DELETE] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
