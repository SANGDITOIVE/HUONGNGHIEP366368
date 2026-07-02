import type { Metadata } from "next"
import { CareerTabs } from "@/components/layout/CareerTabs"
import { PersonalTabs } from "@/components/personal/PersonalTabs"
import { AccountPanel } from "@/components/auth/AccountPanel"
import { ProvincePicker } from "@/components/personal/ProvincePicker"
import { LocalSuggestions } from "@/components/personal/LocalSuggestions"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"

export const metadata: Metadata = {
	title: "Tab cá nhân",
	description:
		"Quản lý tập trung hồ sơ của bạn: thông tin cá nhân, định hướng, danh sách ngành & trường đã yêu thích và bảng so sánh ngành.",
}

export default function CaNhanPage() {
	return (
		<div className="container py-10">
			<CareerTabs />
			<div className="mb-6">
				<h1 className="font-heading text-3xl font-bold">Tab cá nhân</h1>
				<p className="mt-2 max-w-2xl text-muted-foreground">
					Nơi bạn quản lý tập trung hồ sơ, định hướng, các ngành & trường đã lưu và bảng so sánh ngành.
				</p>
			</div>
			<div className="mb-8">
				<AccountPanel />
			</div>
			<div className="mb-8 grid gap-4 md:grid-cols-2">
				<ProvincePicker />
				<LocalSuggestions />
			</div>
			<PersonalTabs />
			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}
