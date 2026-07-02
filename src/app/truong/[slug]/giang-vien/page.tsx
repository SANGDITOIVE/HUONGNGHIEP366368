import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, BookOpen } from "lucide-react"
import { findSchoolBySlug } from "@/lib/schools/resolve"
import { ProfessorDirectory } from "@/components/community/professor/ProfessorDirectory"
import { TrackView } from "@/components/personal/TrackView"

export async function generateMetadata({
	params,
}: {
	params: { slug: string }
}): Promise<Metadata> {
	const school = findSchoolBySlug(params.slug)
	if (!school) return { title: "Không tìm thấy trường" }
	return {
		title: `Review giảng viên — ${school.name}`,
		description: `Đánh giá giảng viên tại ${school.name} từ chính sinh viên: dễ qua môn, chấm công bằng, dạy dễ hiểu.`,
	}
}

export default function GiangVienPage({ params }: { params: { slug: string } }) {
	const school = findSchoolBySlug(params.slug)
	if (!school) notFound()

	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
			<TrackView dim="school" keys={[school.id]} weight={2} />
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Link
					href="/cong-dong/truong"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
				>
					<ArrowLeft className="h-4 w-4" /> Chọn trường khác
				</Link>
				<Link
					href={`/truong/${params.slug}/survival-guide`}
					className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent hover:bg-accent/20"
				>
					<BookOpen className="h-4 w-4" /> Survival Guide của trường
				</Link>
			</div>
			<header className="mb-6 mt-3">
				<h1 className="text-3xl font-bold text-foreground">Review giảng viên</h1>
				<p className="mt-1 text-lg text-primary">{school.name}</p>
				<p className="mt-2 text-sm text-muted-foreground">
					Đánh giá thật từ sinh viên: dễ qua môn, chấm công bằng, dạy dễ hiểu, điểm danh, giáo trình và mẹo ôn thi.
				</p>
			</header>
			<ProfessorDirectory schoolId={school.id} schoolName={school.name} slug={params.slug} />
		</main>
	)
}
