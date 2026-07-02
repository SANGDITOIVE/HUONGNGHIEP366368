import { getAllSchools } from "@/lib/schools/resolve"
import { SchoolCommunityPicker } from "@/components/community/SchoolCommunityPicker"

export const dynamic = "force-dynamic"

// Sub-tab "Theo trường": chọn trường để xem review giảng viên + survival guide.
export default function CongDongTruongPage() {
	const schools = getAllSchools()
	return (
		<div>
			<p className="mb-4 text-sm text-muted-foreground">
				Chọn trường để xem <span className="font-medium text-foreground">review giảng viên</span> và{" "}
				<span className="font-medium text-foreground">survival guide</span> từ chính sinh viên.
			</p>
			<SchoolCommunityPicker schools={schools} />
		</div>
	)
}
