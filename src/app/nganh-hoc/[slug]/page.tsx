import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import {
	ArrowLeft, Award, Briefcase, Building2, GraduationCap, ListChecks,
	MapPin, Sparkles, Target, TrendingUp, TriangleAlert, Users,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { PinButton } from "@/components/major/PinButton"
import { IndustryHotspots } from "@/components/major/IndustryHotspots"
import { TrackView } from "@/components/personal/TrackView"
import { MAJORS, MAJOR_BY_ID } from "@/data/majors"
import { FIELD_BY_ID } from "@/data/majorFields"
import { rankUniversities } from "@/lib/engine/recommend"
import {
	SKILLS, INTERESTS, CAREER_DESTINATIONS, STREAMS, type Option,
} from "@/data/taxonomies"

const COST_LABEL: Record<string, string> = {
	low: "Chi phí thấp",
	medium: "Chi phí trung bình",
	high: "Chi phí cao",
}
const REGION_LABEL: Record<string, string> = {
	bac: "Miền Bắc",
	trung: "Miền Trung",
	nam: "Miền Nam",
}

function labelsOf<T extends string>(options: Option<T>[], ids: T[]): string[] {
	return ids.map((id) => options.find((o) => o.id === id)?.label ?? id)
}

export function generateStaticParams() {
	return MAJORS.map((m) => ({ slug: m.id }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
	const major = MAJOR_BY_ID[params.slug]
	if (!major) return { title: "Không tìm thấy ngành" }
	return {
		title: `${major.name} — HoaTieu`,
		description: major.definition,
	}
}

export default function MajorDetailPage({ params }: { params: { slug: string } }) {
	const major = MAJOR_BY_ID[params.slug]
	if (!major) notFound()

	const field = FIELD_BY_ID[major.fieldId]
	const skillLabels = labelsOf(SKILLS, major.requiredSkills)
	const interestLabels = labelsOf(INTERESTS, major.relatedInterests)
	const careerDestLabels = labelsOf(CAREER_DESTINATIONS, major.careerDestinations)
	const streamLabels = labelsOf(STREAMS, major.relatedStreams)
	const universities = rankUniversities(major)
	// Ghi nhận hành vi xem ngành: lĩnh vực (fieldId) + các trường đào tạo ngành này
	// (tách phần sau "@" trong universityProgramIds) để cá nhân hoá feed cộng đồng.
	const relatedSchoolIds = Array.from(
		new Set(major.universityProgramIds.map((p) => p.split("@")[1]).filter(Boolean)),
	)

	return (
		<div className="container max-w-4xl py-10">
			<TrackView dim="field" keys={[major.fieldId]} weight={2} />
			{relatedSchoolIds.length > 0 && <TrackView dim="school" keys={relatedSchoolIds} weight={0.5} />}
			<Button asChild variant="ghost" className="mb-4 -ml-2">
				<Link href="/nganh-hoc"><ArrowLeft className="h-4 w-4" /> Quay lại khám phá ngành</Link>
			</Button>

			{/* Header */}
			<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
				{field && <Badge variant="muted">{field.icon} {field.name}</Badge>}
				<Badge variant="outline">{major.feasibility.durationYears} năm đào tạo</Badge>
				<Badge variant="outline">{COST_LABEL[major.feasibility.relativeCost] ?? major.feasibility.relativeCost}</Badge>
			</div>
			<h1 className="mt-3 text-3xl font-bold sm:text-4xl">{major.name}</h1>
			<p className="mt-3 text-lg text-muted-foreground">{major.definition}</p>
			<div className="mt-4 flex flex-wrap items-center gap-3">
				<PinButton majorId={major.id} majorName={major.name} withLabel />
				<Button asChild variant="outline" size="sm"><Link href="/so-sanh">Xem ngành đã ghim</Link></Button>
			</div>

			<div className="mt-8 space-y-6">
				{/* Bản chất ngành */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg"><ListChecks className="h-5 w-5 text-primary" /> Bản chất ngành</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="text-sm leading-relaxed text-muted-foreground">{major.nature}</p>
						<p className="mt-3 text-sm"><span className="font-medium">Phù hợp với: </span><span className="text-muted-foreground">{major.suitableFor}</span></p>
					</CardContent>
				</Card>

				{/* Học những gì */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg"><GraduationCap className="h-5 w-5 text-primary" /> Học những gì</CardTitle>
					</CardHeader>
					<CardContent>
						<ul className="grid gap-2 sm:grid-cols-2">
							{major.whatYouStudy.map((w) => (
								<li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
									<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{w}
								</li>
							))}
						</ul>
						<div className="mt-4">
							<p className="mb-2 text-xs font-medium text-muted-foreground">Kỹ năng cần có</p>
							<div className="flex flex-wrap gap-1.5">
								{skillLabels.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
							</div>
						</div>
					</CardContent>
				</Card>

				{/* Cơ hội + thách thức */}
				<div className="grid gap-4 sm:grid-cols-2">
					<Card className="border-green-200">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base"><TrendingUp className="h-5 w-5 text-green-600" /> Cơ hội thực tế</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1.5 text-sm text-muted-foreground">
								{major.opportunities.map((o) => <li key={o}>• {o}</li>)}
							</ul>
						</CardContent>
					</Card>
					<Card className="border-amber-200">
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-base"><TriangleAlert className="h-5 w-5 text-amber-600" /> Thách thức cần biết</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="space-y-1.5 text-sm text-muted-foreground">
								{major.challenges.map((c) => <li key={c}>• {c}</li>)}
							</ul>
						</CardContent>
					</Card>
				</div>

				{/* Nghề nghiệp + hướng phát triển */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg"><Briefcase className="h-5 w-5 text-primary" /> Nghề nghiệp & hướng phát triển</CardTitle>
					</CardHeader>
					<CardContent>
						<p className="mb-2 text-xs font-medium text-muted-foreground">Công việc tiêu biểu</p>
						<div className="flex flex-wrap gap-1.5">
							{major.careers.map((c) => <Badge key={c} variant="muted">{c}</Badge>)}
						</div>
						<div className="mt-4 flex items-start gap-2 rounded-lg bg-muted/50 p-3">
							<Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
							<p className="text-sm"><span className="font-medium">Định hướng tương lai: </span><span className="text-muted-foreground">{major.futureDirection}</span></p>
						</div>
						<div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
							<span><Target className="mr-1 inline h-3.5 w-3.5" />Khối phù hợp: {streamLabels.join(", ")}</span>
						</div>
					</CardContent>
				</Card>

				{/* Nơi làm việc phổ biến */}
				{major.workplaces && major.workplaces.length > 0 && (
					<Card>
						<CardHeader>
							<CardTitle className="flex items-center gap-2 text-lg"><Building2 className="h-5 w-5 text-primary" /> Nơi làm việc phổ biến</CardTitle>
						</CardHeader>
						<CardContent>
							<ul className="grid gap-2 sm:grid-cols-2">
								{major.workplaces.map((w) => (
									<li key={w} className="flex items-start gap-2 text-sm text-muted-foreground">
										<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />{w}
									</li>
								))}
							</ul>
						</CardContent>
					</Card>
				)}

				{/* Trường đào tạo */}
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center gap-2 text-lg"><Award className="h-5 w-5 text-primary" /> Trường đào tạo (xếp theo điểm nội bộ)</CardTitle>
					</CardHeader>
					<CardContent>
						{universities.length === 0 ? (
							<p className="text-sm text-muted-foreground">Đang cập nhật danh sách trường đào tạo.</p>
						) : (
							<ol className="space-y-3">
								{universities.map((u, i) => (
									<li key={u.university.id} className="flex items-start gap-3 rounded-lg border p-3">
										<span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">{i + 1}</span>
										<div className="min-w-0 flex-1">
											<div className="flex flex-wrap items-center gap-2">
												<span className="font-medium">{u.university.name}</span>
												<Badge variant="outline" className="text-xs"><MapPin className="mr-0.5 h-3 w-3" />{REGION_LABEL[u.university.region]}</Badge>
											</div>
											{u.program.note && <p className="mt-1 text-sm text-muted-foreground">{u.program.note}</p>}
										</div>
										<div className="shrink-0 text-right">
											<div className="text-lg font-bold text-primary">{u.internalScore}</div>
											<div className="text-[10px] text-muted-foreground">điểm nội bộ</div>
										</div>
									</li>
								))}
							</ol>
						)}
						<p className="mt-3 text-xs text-muted-foreground">
							Điểm nội bộ tổng hợp từ uy tín chương trình, thế mạnh đào tạo, độ liên quan và mức độ được công nhận. Đây là ước lượng để sắp thứ tự tương đối, <strong>không phải xếp hạng quốc gia chính thức</strong>.
						</p>
					</CardContent>
				</Card>

				{/* Cơ hội theo địa phương (PHASE 3) */}
				<IndustryHotspots fieldId={major.fieldId} />

				{/* Liên quan */}
				<div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
					<Users className="h-4 w-4" />
					<span>Sở thích liên quan: {interestLabels.join(", ")} · Đích nghề: {careerDestLabels.join(", ")}</span>
				</div>
			</div>

			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				<Button asChild>
					<Link href="/danh-gia">Làm bài đánh giá để xem độ phù hợp <Target className="h-4 w-4" /></Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/nganh-hoc">Xem ngành khác</Link>
				</Button>
			</div>

			<div className="mt-10"><DisclaimerBanner /></div>
		</div>
	)
}
