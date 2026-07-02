import type { Metadata } from "next"
import { CommunitySearch } from "@/components/community/CommunitySearch"
import { CommunityTabs } from "@/components/community/CommunityTabs"

export const metadata: Metadata = {
	title: "Cộng đồng HoaTieu",
	description:
		"Bảng tin cộng đồng: hỏi đáp, review giảng viên và survival guide từ chính sinh viên. Tìm kiếm giảng viên, trường và ngành học.",
}

export default function CongDongLayout({ children }: { children: React.ReactNode }) {
	return (
		<main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-10">
			<header className="mb-5">
				<h1 className="text-3xl font-bold text-foreground">Cộng đồng</h1>
				<p className="mt-1 text-muted-foreground">
					Hỏi đáp, review giảng viên và kinh nghiệm sinh viên — cập nhật liên tục.
				</p>
			</header>
			<div className="mb-4">
				<CommunitySearch />
			</div>
			<div className="mb-6 border-b border-border pb-3">
				<CommunityTabs />
			</div>
			{children}
		</main>
	)
}
