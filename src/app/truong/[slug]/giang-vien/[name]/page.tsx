import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { findSchoolBySlug } from "@/lib/schools/resolve"
import { ProfessorProfile } from "@/components/community/professor/ProfessorProfile"

// Chuyển slug -> tên hiển thị tạm thời (component sẽ thay bằng tên thật sau khi tải review).
function slugToName(slug: string): string {
	const decoded = decodeURIComponent(slug).replace(/-/g, " ").trim()
	return decoded
		.split(/\s+/)
		.map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
		.join(" ")
}

export async function generateMetadata({
	params,
}: {
	params: { slug: string; name: string }
}): Promise<Metadata> {
	const school = findSchoolBySlug(params.slug)
	const name = slugToName(params.name)
	if (!school) return { title: "Không tìm thấy" }
	return {
		title: `${name} — ${school.name}`,
		description: `Tất cả đánh giá về giảng viên ${name} tại ${school.name}.`,
	}
}

export default function GiangVienProfilePage({
	params,
}: {
	params: { slug: string; name: string }
}) {
	const school = findSchoolBySlug(params.slug)
	if (!school) notFound()

	const professorSlug = decodeURIComponent(params.name)

	return (
		<main className="mx-auto w-full max-w-4xl px-4 py-8 sm:py-12">
			<ProfessorProfile
				schoolId={school.id}
				schoolName={school.name}
				slug={params.slug}
				professorSlug={professorSlug}
				initialName={slugToName(params.name)}
			/>
		</main>
	)
}
