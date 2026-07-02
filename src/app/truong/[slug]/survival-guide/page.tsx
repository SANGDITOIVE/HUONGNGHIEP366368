import type { Metadata } from "next"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, GraduationCap } from "lucide-react"
import { findSchoolBySlug } from "@/lib/schools/resolve"
import { SurvivalGuide } from "@/components/community/survival/SurvivalGuide"
import { TrackView } from "@/components/personal/TrackView"

export async function generateMetadata({
	params,
}: {
	params: { slug: string }
}): Promise<Metadata> {
	const school = findSchoolBySlug(params.slug)
	if (!school) return { title: "Không tìm thấy trường" }
	return {
		title: `Survival Guide — ${school.name}`,
		description: `Wiki kinh nghiệm sinh tồn cho tân sinh viên ${school.name}: checklist nhập học, lỗi thường gặp, quán ăn, nhà trọ, thực tập.`,
	}
}

export default function SurvivalGuidePage({ params }: { params: { slug: string } }) {
	const school = findSchoolBySlug(params.slug)
	if (!school) notFound()

	return (
		<main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
			<TrackView dim="school" keys={[school.id]} weight={2} />
			<div className="flex flex-wrap items-center justify-between gap-2">
				<Link
					href="/cong-dong/truong"
					className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
				>
					<ArrowLeft className="h-4 w-4" /> Chọn trường khác
				</Link>
				<Link
					href={`/truong/${params.slug}/giang-vien`}
					className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary hover:bg-primary/20"
				>
					<GraduationCap className="h-4 w-4" /> Review giảng viên
				</Link>
			</div>
			<header className="mb-6 mt-3">
				<h1 className="text-3xl font-bold text-foreground">Survival Guide</h1>
				<p className="mt-1 text-lg text-primary">{school.name}</p>
				<p className="mt-2 text-sm text-muted-foreground">
					Wiki do sinh viên đóng góp: checklist trước nhập học, lỗi thường gặp, quán ăn, nhà trọ/KTX, kinh nghiệm thực tập.
				</p>
			</header>
			<SurvivalGuide schoolId={school.id} schoolName={school.name} />
		</main>
	)
}
