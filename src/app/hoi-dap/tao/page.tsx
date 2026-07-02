import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getAllSchools } from "@/lib/schools/resolve"
import { AskQuestionForm } from "@/components/community/qa/AskQuestionForm"

export const metadata: Metadata = {
	title: "Đặt câu hỏi mới",
	description: "Đăng câu hỏi cho cộng đồng sinh viên HoaTieu.",
}

export default function TaoCauHoiPage() {
	const schools = getAllSchools()
	return (
		<main className="mx-auto w-full max-w-2xl px-4 py-8 sm:py-12">
			<Link
				href="/hoi-dap"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
			>
				<ArrowLeft className="h-4 w-4" /> Về danh sách câu hỏi
			</Link>
			<header className="mb-6 mt-3">
				<h1 className="text-3xl font-bold text-foreground">Đặt câu hỏi mới</h1>
				<p className="mt-2 text-muted-foreground">
					Viết tiêu đề rõ ràng và mô tả chi tiết để nhận câu trả lời tốt hơn. Có thể đăng ẩn danh.
				</p>
			</header>
			<AskQuestionForm schools={schools} />
		</main>
	)
}
