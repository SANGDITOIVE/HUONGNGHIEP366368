import { redirect } from "next/navigation"
import Link from "next/link"
import { getAdminContext } from "@/lib/community/serverAuth"
import { RegionalAnalytics } from "@/components/admin/RegionalAnalytics"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const metadata = { title: "Thống kê theo vùng · HoaTieu" }

// =============================================================
// PHASE 4 — Trang thống kê "quan tâm theo vùng" (/quan-tri/thong-ke-vung).
// Server Component bảo mật: chỉ admin truy cập, người thường -> về trang chủ.
// =============================================================
export default async function ThongKeVungPage() {
	const ctx = await getAdminContext()
	if (!ctx.isAdmin) {
		redirect("/")
		return null
	}
	return (
		<main className="container py-8">
			<div className="mb-4">
				<Link href="/quan-tri" className="text-sm text-primary hover:underline">
					← Về trang quản trị
				</Link>
			</div>
			<h1 className="text-xl font-bold text-slate-900">Thống kê quan tâm theo vùng</h1>
			<p className="mt-1 mb-5 text-sm text-slate-500">
				Tỉ lệ học sinh mỗi tỉnh/thành quan tâm đến từng lĩnh vực ngành học (dựa trên phiếu khảo sát).
			</p>
			<RegionalAnalytics />
		</main>
	)
}
