import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import { getAdminContext } from "@/lib/community/serverAuth"
import {
	sql,
	ensureQaTables,
	toPublicQuestion,
	toPublicAnswer,
} from "@/lib/community/qaDb"
import { QuestionDetail } from "@/components/community/qa/QuestionDetail"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Server Component: đọc trực tiếp từ DB để render sẵn (SEO + không cần fetch
// nội bộ). Tăng view_count ngay khi mở trang.
export default async function QuestionPage({ params }: { params: { id: string } }) {
	const id = Number(params.id)
	if (!Number.isInteger(id) || id <= 0) notFound()

	const { isAdmin } = await getAdminContext()
	const session = await getServerSession(authOptions)
	const viewerId = session?.user?.id ?? null
	await ensureQaTables()

	const updated = await sql`UPDATE questions SET view_count = view_count + 1 WHERE id = ${id} RETURNING *`
	if (updated.rows.length === 0) notFound()
	const qRow = updated.rows[0]
	// Chỉ bài đã duyệt (visible) mới xem công khai; bài chờ duyệt/đã gỡ chỉ tác giả & admin thấy.
	const canSeeHidden = isAdmin || (viewerId != null && String(qRow.user_id) === String(viewerId))
	if (qRow.status !== "visible" && !canSeeHidden) notFound()

	const answerRows = (await sql`
		SELECT * FROM answers
		WHERE question_id = ${id} AND (status = 'visible' OR ${isAdmin})
		ORDER BY (upvotes - downvotes) DESC, created_at ASC`).rows

	const question = toPublicQuestion(qRow, isAdmin, answerRows.length, viewerId)
	const answers = answerRows.map((a) => toPublicAnswer(a, isAdmin, viewerId))

	return (
		<main className="mx-auto w-full max-w-3xl px-4 py-8 sm:py-12">
			<Link
				href="/hoi-dap"
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
			>
				<ArrowLeft className="h-4 w-4" /> Về danh sách câu hỏi
			</Link>
			<div className="mt-4">
				<QuestionDetail initialQuestion={question} initialAnswers={answers} />
			</div>
		</main>
	)
}
