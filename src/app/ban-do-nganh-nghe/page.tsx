import type { Metadata } from "next"
import { CareerTabs } from "@/components/layout/CareerTabs"
import { CareerMapClient } from "@/components/geo/CareerMapClient"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"

export const metadata: Metadata = {
	title: "Bản đồ ngành nghề theo vị trí địa lý",
	description:
		"Bản đồ tương tác cơ hội nghề nghiệp theo tỉnh/thành: ngành kinh tế trọng điểm, khu công nghiệp, doanh nghiệp, cơ quan nhà nước và trường đại học trên khắp Việt Nam, gồm cả Trường Sa & Hoàng Sa.",
}

export default function BanDoNganhNghePage() {
	return (
		<div className="container py-10">
			<CareerTabs />
			<div className="mb-6">
				<h1 className="font-heading text-3xl font-bold">Bản đồ ngành nghề theo vị trí địa lý</h1>
				<p className="mt-2 max-w-2xl text-muted-foreground">
					Khám phá cơ hội nghề nghiệp trên khắp Việt Nam: chọn một ngành để xem những tỉnh/thành và
					khu kinh tế đang cần nhân lực.
				</p>
			</div>
			<CareerMapClient />
			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}
