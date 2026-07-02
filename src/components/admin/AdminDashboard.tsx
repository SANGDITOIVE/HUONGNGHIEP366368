"use client"

import { ClipboardCheck, Crown, ListChecks, Activity, Building2, Flag } from "lucide-react"
import { ContributionsBoard } from "@/components/admin/ContributionsBoard"
import { ActivityFeed } from "@/components/admin/ActivityFeed"
import { AdminManagement } from "@/components/admin/AdminManagement"
import { NewSchoolsBoard } from "@/components/admin/NewSchoolsBoard"
import { ReportsBoard } from "@/components/admin/ReportsBoard"

function SectionCard({
	icon,
	title,
	subtitle,
	accent,
	children,
}: {
	icon: React.ReactNode
	title: string
	subtitle: string
	accent: string
	children: React.ReactNode
}) {
	return (
		<section className="rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
			<div className="mb-4 flex items-start gap-3">
				<span className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent}`}>{icon}</span>
				<div>
					<h2 className="text-lg font-semibold text-slate-800">{title}</h2>
					<p className="text-sm text-slate-500">{subtitle}</p>
				</div>
			</div>
			{children}
		</section>
	)
}

// =============================================================
// Trang Quản Trị — 3 phân khu. Phân khu 3 chỉ hiện cho SUPER_ADMIN.
// =============================================================
export function AdminDashboard({ role }: { role: "SUPER_ADMIN" | "ADMIN" }) {
	const isSuper = role === "SUPER_ADMIN"
	return (
		<div className="space-y-6">
			<header className="flex items-center gap-3">
				<span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<ListChecks className="h-6 w-6" />
				</span>
				<div>
					<h1 className="text-2xl font-bold text-slate-900">Bảng điều khiển Quản trị</h1>
					<p className="text-sm text-slate-500">
						{isSuper ? "Super Admin · toàn quyền" : "Admin · duyệt nội dung"}
					</p>
				</div>
			</header>

			{/* Phân khu 1 — Duyệt cơ sở đào tạo mới do cộng đồng đề xuất */}
			<SectionCard
				icon={<Building2 className="h-5 w-5 text-white" />}
				accent="bg-indigo-500"
				title="1 · Duyệt Cơ Sở Đào Tạo Mới"
				subtitle="Trường do người dùng đề xuất — duyệt để hiển thị công khai (tự thừa kế review, đóng góp, bộ lọc)."
			>
				<NewSchoolsBoard />
			</SectionCard>

			{/* Báo cáo nội dung vi phạm */}
			<SectionCard
				icon={<Flag className="h-5 w-5 text-white" />}
				accent="bg-rose-500"
				title="Báo cáo nội dung vi phạm"
				subtitle="Câu hỏi / trả lời / mẹo bị report. Bấm 'Xem bài' để tới nội dung, rồi ẩn hoặc khôi phục."
			>
				<ReportsBoard />
			</SectionCard>

			{/* Phân khu 2 */}
			<SectionCard
				icon={<ClipboardCheck className="h-5 w-5 text-white" />}
				accent="bg-emerald-500"
				title="2 · Duyệt Đóng Góp"
				subtitle="Đề xuất sửa thông tin trường — mới nhất lên đầu. Phê duyệt để đồng bộ ra web."
			>
				<ContributionsBoard />
			</SectionCard>

			{/* Phân khu 3 */}
			<SectionCard
				icon={<Activity className="h-5 w-5 text-white" />}
				accent="bg-sky-500"
				title="3 · Theo Dõi Hoạt Động"
				subtitle="Toàn bộ đánh giá & phản biện người dùng vừa đăng — mới nhất lên trước."
			>
				<ActivityFeed />
			</SectionCard>

			{/* Phân khu 4 — chỉ SUPER_ADMIN */}
			{isSuper && (
				<SectionCard
					icon={<Crown className="h-5 w-5 text-white" />}
					accent="bg-amber-500"
					title="4 · Quản Lý Phân Quyền"
					subtitle="Cấp / gỡ quyền Admin cho các email khác. Chỉ Super Admin gốc thao tác được."
				>
					<AdminManagement />
				</SectionCard>
			)}
		</div>
	)
}
