import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { isAdminEmail } from "@/lib/community/constants"
import { ContributionsBoard } from "@/components/admin/ContributionsBoard"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// =============================================================
// /admin/contributions — SERVER COMPONENT (bảo mật cổng vào).
// Kiểm tra session ngay trên server: chỉ đúng email admin mới được xem;
// người khác (kể cả chưa đăng nhập) bị redirect về trang chủ.
// =============================================================
export default async function AdminContributionsPage() {
	const session = await getServerSession(authOptions)
	if (!isAdminEmail(session?.user?.email)) {
		redirect("/")
	}

	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-8">
			<header className="mb-6">
				<h1 className="font-heading text-2xl font-bold text-slate-800">
					Duyệt đóng góp cộng đồng
				</h1>
				<p className="mt-1 text-sm text-slate-500">
					Kiểm duyệt các đề xuất chỉnh sửa dữ liệu trường học. Phê duyệt sẽ đè dữ liệu mới lên web công khai.
				</p>
			</header>
			<ContributionsBoard />
		</main>
	)
}
