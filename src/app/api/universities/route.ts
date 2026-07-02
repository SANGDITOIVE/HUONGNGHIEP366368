import { NextResponse, type NextRequest } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { sql, ensureCommunityTables } from "@/lib/community/db"
import { UNIVERSITIES } from "@/data/universities"
import {
	slugify,
	normalizeName,
	similarity,
	EXTRA_STATIC_SCHOOL_NAMES,
} from "@/lib/community/slug"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const VALID_HE = new Set(["dai-hoc", "cao-dang"])
const VALID_REGION = new Set(["bac", "trung", "nam"])

// =============================================================
// GET /api/universities
// Trả về các cơ sở đào tạo do cộng đồng đóng góp ĐÃ ĐƯỢC DUYỆT (APPROVED).
// Client merge danh sách này với dữ liệu trường tĩnh → đồng bộ toàn bộ
// tìm kiếm / bộ lọc khu vực / so sánh / review mà KHÔNG cần sửa code tay.
// =============================================================
export async function GET() {
	try {
		await ensureCommunityTables()
		const res = await sql`
			SELECT slug, name, code, address, website, nganh_tieu_bieu, region, he_dao_tao, ownership, created_at
			FROM universities
			WHERE status = 'APPROVED'
			ORDER BY created_at DESC
		`
		return NextResponse.json({
			ok: true,
			count: res.rows.length,
			items: res.rows.map((r) => ({
				slug: r.slug,
				name: r.name,
				code: r.code ?? "",
				address: r.address ?? "",
				website: r.website ?? "",
				nganhTieuBieu: r.nganh_tieu_bieu ?? "",
				region: r.region ?? "bac",
				heDaoTao: r.he_dao_tao ?? "dai-hoc",
				ownership: r.ownership ?? "cong-lap",
			})),
		})
	} catch (err) {
		console.error("[universities][GET] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR", items: [] }, { status: 500 })
	}
}

// Danh sách tên trường tĩnh (server-safe) phục vụ phát hiện trùng lặp.
const STATIC_NAMES: string[] = [
	...UNIVERSITIES.map((u) => u.name),
	...EXTRA_STATIC_SCHOOL_NAMES,
]

// =============================================================
// POST /api/universities
// Người dùng đăng nhập đề xuất thêm 1 cơ sở đào tạo mới (status = PENDING).
// Minimum Viable Data: name, code, address, website, he_dao_tao bắt buộc.
// Sinh slug duy nhất ngay lúc tạo. Chặn trùng khít tuyệt đối (DUPLICATE_EXACT);
// trùng gần giống vẫn cho gửi (admin sẽ là người quyết định cuối cùng).
// =============================================================
export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user
	if (!user?.id) {
		return NextResponse.json(
			{ ok: false, error: "UNAUTHORIZED", message: "Vui lòng đăng nhập để đề xuất trường mới." },
			{ status: 401 },
		)
	}

	let body: unknown
	try {
		body = await req.json()
	} catch {
		return NextResponse.json({ ok: false, error: "INVALID_JSON" }, { status: 400 })
	}

	const raw = (body ?? {}) as Record<string, unknown>
	const name = String(raw.name ?? "").trim().slice(0, 255)
	const code = String(raw.code ?? "").trim().slice(0, 50)
	const address = String(raw.address ?? "").trim().slice(0, 1000)
	let website = String(raw.website ?? "").trim().slice(0, 255)
	const he = String(raw.heDaoTao ?? "").trim()
	const region = String(raw.region ?? "bac").trim()
	const nganh = String(raw.nganhTieuBieu ?? "").trim().slice(0, 2000)

	// ---- Validate Minimum Viable Data ----
	const missing: string[] = []
	if (!name) missing.push("Tên trường")
	if (!code) missing.push("Mã trường")
	if (!address) missing.push("Địa chỉ")
	if (!website) missing.push("Website")
	if (!VALID_HE.has(he)) missing.push("Hệ đào tạo")
	if (missing.length > 0) {
		return NextResponse.json(
			{
				ok: false,
				error: "VALIDATION_FAILED",
				message: `Vui lòng nhập đủ: ${missing.join(", ")}.`,
				missing,
			},
			{ status: 422 },
		)
	}
	const regionOk = VALID_REGION.has(region) ? region : "bac"
	// Chuẩn hóa website (thêm https:// nếu thiếu).
	if (!/^https?:\/\//i.test(website)) website = `https://${website}`

	try {
		await ensureCommunityTables()

		// ---- Phát hiện trùng lặp ----
		const target = normalizeName(name)
		// 1) Trùng với trường tĩnh có sẵn?
		for (const staticName of STATIC_NAMES) {
			if (normalizeName(staticName) === target) {
				return NextResponse.json(
					{
						ok: false,
						error: "DUPLICATE_EXACT",
						message: `Trường “${staticName}” đã có sẵn trong hệ thống. Không cần thêm lại.`,
					},
					{ status: 409 },
				)
			}
		}
		// 2) Trùng với trường đã được duyệt trong DB?
		const dupApproved = await sql`
			SELECT name FROM universities
			WHERE status = 'APPROVED' AND lower(name) = ${name.toLowerCase()}
			LIMIT 1
		`
		if (dupApproved.rows.length > 0) {
			return NextResponse.json(
				{
					ok: false,
					error: "DUPLICATE_EXACT",
					message: `Trường “${dupApproved.rows[0].name}” đã tồn tại trên hệ thống.`,
				},
				{ status: 409 },
			)
		}
		// 3) Trùng với đề xuất đang chờ duyệt của chính người này (chống spam gửi 2 lần)?
		const dupPending = await sql`
			SELECT id FROM universities
			WHERE status = 'PENDING' AND created_by = ${user.id} AND lower(name) = ${name.toLowerCase()}
			LIMIT 1
		`
		if (dupPending.rows.length > 0) {
			return NextResponse.json(
				{
					ok: false,
					error: "ALREADY_PENDING",
					message: "Bạn đã gửi đề xuất trường này rồi, đang chờ duyệt.",
				},
				{ status: 409 },
			)
		}

		// ---- Sinh slug duy nhất ----
		const base = slugify(name)
		let slug = base
		let n = 2
		// eslint-disable-next-line no-constant-condition
		while (true) {
			const exists = await sql`SELECT 1 FROM universities WHERE slug = ${slug} LIMIT 1`
			if (exists.rows.length === 0) break
			slug = `${base}-${n++}`
		}

		const inserted = await sql`
			INSERT INTO universities
				(slug, name, code, address, website, nganh_tieu_bieu, region, he_dao_tao, status, created_by, author_name)
			VALUES
				(${slug}, ${name}, ${code}, ${address}, ${website}, ${nganh || null}, ${regionOk}, ${he}, 'PENDING', ${user.id}, ${user.name ?? null})
			RETURNING id, slug, created_at
		`
		return NextResponse.json(
			{
				ok: true,
				id: inserted.rows[0]?.id,
				slug: inserted.rows[0]?.slug,
				status: "PENDING",
				message: "Cảm ơn bạn! Cơ sở đào tạo đã được gửi và đang chờ quản trị viên duyệt.",
			},
			{ status: 201 },
		)
	} catch (err) {
		console.error("[universities][POST] failed", err)
		return NextResponse.json({ ok: false, error: "DB_ERROR" }, { status: 500 })
	}
}
