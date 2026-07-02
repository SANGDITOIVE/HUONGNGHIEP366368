import type { Metadata } from "next"
import { CareerTabs } from "@/components/layout/CareerTabs"
import { InstitutionsTab } from "@/components/InstitutionsTab"
import { SchoolDirectorySection } from "@/components/SchoolDirectorySection"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"

export const metadata: Metadata = {
	title: "Tra cứu nơi đào tạo sau THPT",
	description:
		"Tra cứu Cao đẳng, Đại học, Học viện tại Việt Nam theo khu vực, khối ngành và phổ điểm chuẩn. Tìm kiếm, lọc, lưu yêu thích và so sánh điểm chuẩn các trường.",
}

export default function NoiDaoTaoPage() {
	return (
		<div className="container py-10">
			<CareerTabs />
			<InstitutionsTab />
			<SchoolDirectorySection />
			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}
