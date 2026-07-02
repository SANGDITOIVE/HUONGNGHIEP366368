import { getAllSchools } from "@/lib/schools/resolve"
import { QuestionFeed } from "@/components/community/qa/QuestionFeed"

export const dynamic = "force-dynamic"

// Sub-tab "Hỏi đáp" của khu Cộng đồng (tái dùng nguyên QuestionFeed).
export default function CongDongHoiDapPage() {
	const schools = getAllSchools()
	return <QuestionFeed schools={schools} />
}
