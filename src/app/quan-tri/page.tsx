import { redirect } from "next/navigation"
import Link from "next/link"
import { getAdminContext } from "@/lib/community/serverAuth"
import { AdminDashboard } from "@/components/admin/AdminDashboard"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const metadata = { title: "Quản trị · HoaTieu" }

// =============================================================
// Trang Quản Trị (/quan-tri) — Server Component bảo mật.
// Kiểm tra role ngay phía server: không phải admin → chuyển về trang chủ.
// Người dùng thường không bao giờ thấy được nội dung trang này.
// =============================================================
export default async function AdminPage() {
	const ctx = await getAdminContext()
	const role = ctx.role
	if (!ctx.isAdmin || !role) {
		redirect("/")
		return null
	}
	return (
		<main className="container py-8">
			<div className="mb-4">
				<Link
					href="/quan-tri/thong-ke-vung"
					className="inline-flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-sm font-medium text-primary hover:bg-slate-50"
				>
					Thống kê quan tâm theo vùng →
				</Link>
			</div>
			<AdminDashboard role={role} />
		</main>
	)
}
