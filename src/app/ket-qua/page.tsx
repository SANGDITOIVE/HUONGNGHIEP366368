"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
	ArrowRight, Award, Briefcase, Compass, GraduationCap, Lightbulb,
	ListChecks, Sparkles, Target, TrendingUp, TriangleAlert,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { ResultActions } from "@/components/result/ResultActions"
import { useAssessment } from "@/lib/store/assessmentStore"
import { recommendMajors, FACTOR_LABELS } from "@/lib/engine/recommend"
import { isInputReady } from "@/lib/engine/recommend"
import { FIELD_BY_ID } from "@/data/majorFields"
import { MBTI_FIT_MATRIX } from "@/data/mbtiFitMatrix"
import { MBTI_PROFILES } from "@/data/mbtiProfiles"
import { SKILLS, type Option } from "@/data/taxonomies"
import type {
	FactorBreakdown, MajorRecommendation, MBTIType,
} from "@/types"

function labelsOf<T extends string>(options: Option<T>[], ids: T[]): string[] {
	return ids.map((id) => options.find((o) => o.id === id)?.label ?? id)
}

// 4 nhóm tính cách hợp nhất với một ngành (theo ma trận MBTI).
function topPersonalityTypes(fitKey: keyof typeof MBTI_FIT_MATRIX): MBTIType[] {
	const row = MBTI_FIT_MATRIX[fitKey]
	if (!row) return []
	return (Object.entries(row) as [MBTIType, number][])
		.sort((a, b) => b[1] - a[1])
		.slice(0, 4)
		.map(([type]) => type)
}

export default function KetQuaPage() {
	const { input, hydrated } = useAssessment()

	const recommendations = useMemo(
		() => (isInputReady(input) ? recommendMajors(input) : []),
		[input],
	)

	const hasMBTI = input.mbtiSource !== "none" && !!input.mbtiType

	const shareSummary = useMemo(() => {
		if (recommendations.length === 0) return ""
		const lines = recommendations.map(
			(rec, i) => `${i + 1}. ${rec.major.name} (${rec.score} điểm) — ${rec.reasons[0] ?? rec.major.suitableFor}`,
		)
		return [
			"KẾT QUẢ GỢI Ý NGÀNH HỌC",
			"",
			...lines,
			"",
			"Tạo từ web HoaTieu. Đây là gợi ý tham khảo, không phải kết luận chính thức.",
		].join("\n")
	}, [recommendations])

	if (!hydrated) {
		return (
			<div className="container py-16 text-center text-muted-foreground">Đang tải…</div>
		)
	}

	if (recommendations.length === 0) {
		return (
			<div className="container max-w-xl py-16 text-center">
				<Compass className="mx-auto h-10 w-10 text-primary" />
				<h1 className="mt-4 text-2xl font-bold">Chưa đủ dữ liệu để gợi ý</h1>
				<p className="mt-2 text-muted-foreground">
					Hãy hoàn thành bài đánh giá ngắn để nhận gợi ý ngành phù hợp và trường đào tạo.
				</p>
				<Button asChild className="mt-6">
					<Link href="/danh-gia">Bắt đầu đánh giá <ArrowRight className="h-4 w-4" /></Link>
				</Button>
			</div>
		)
	}

	return (
		<div className="container max-w-4xl py-10">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<Sparkles className="h-4 w-4" /> Gợi ý dành riêng cho bạn
			</div>
			<h1 className="mt-1 text-3xl font-bold">Những ngành phù hợp nhất</h1>
			<p className="mt-2 text-muted-foreground">
				Dưới đây là {recommendations.length} ngành phù hợp nhất với hồ sơ của bạn, kèm lý do và
				cách tính điểm minh bạch. Đây là gợi ý để tham khảo, không phải kết luận cuối cùng.
			</p>

			<div className="mt-5">
				<ResultActions summary={shareSummary} title="Kết quả gợi ý ngành học" />
			</div>

			<div className="mt-8 space-y-6">
				{recommendations.map((rec, index) => (
					<RecommendationCard
						key={rec.major.id}
						rec={rec}
						rank={index + 1}
						showPersonality={hasMBTI}
					/>
				))}
			</div>

			<div className="mt-8 flex flex-col gap-3 sm:flex-row">
				<Button asChild variant="outline">
					<Link href="/danh-gia">Chỉnh sửa đánh giá</Link>
				</Button>
				<Button asChild variant="ghost">
					<Link href="/nganh-hoc">Khám phá toàn bộ ngành <ArrowRight className="h-4 w-4" /></Link>
				</Button>
			</div>

			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}

function RecommendationCard({
	rec, rank, showPersonality,
}: {
	rec: MajorRecommendation
	rank: number
	showPersonality: boolean
}) {
	const { major, score, breakdown, reasons, rankedUniversities } = rec
	const field = FIELD_BY_ID[major.fieldId]
	const skillLabels = labelsOf(SKILLS, major.requiredSkills)
	const personalityTypes = topPersonalityTypes(major.fitKey)

	const factorKeys = (Object.keys(FACTOR_LABELS) as (keyof FactorBreakdown)[]).filter(
		(k) => showPersonality || k !== "personalityFit",
	)

	return (
		<Card className="overflow-hidden animate-fade-in-up">
			<CardHeader className="bg-muted/40">
				<div className="flex items-start justify-between gap-4">
					<div>
						<div className="flex items-center gap-2 text-xs text-muted-foreground">
							<span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
								{rank}
							</span>
							{field && <span>{field.icon} {field.name}</span>}
						</div>
						<CardTitle className="mt-2 text-2xl">{major.name}</CardTitle>
						<p className="mt-1 text-sm text-muted-foreground">{major.definition}</p>
					</div>
					<div className="shrink-0 text-center">
						<div className="text-3xl font-bold text-primary">{score}</div>
						<div className="text-xs text-muted-foreground">điểm phù hợp</div>
					</div>
				</div>
			</CardHeader>

			<CardContent className="space-y-6 pt-6">
				{/* Lý do phù hợp */}
				{reasons.length > 0 && (
					<section>
						<SectionTitle icon={<Lightbulb className="h-4 w-4" />}>Vì sao phù hợp với bạn</SectionTitle>
						<ul className="mt-2 space-y-1.5">
							{reasons.map((r) => (
								<li key={r} className="flex items-start gap-2 text-sm">
									<span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
									<span>{r}</span>
								</li>
							))}
						</ul>
					</section>
				)}

				{/* Biểu đồ đóng góp điểm */}
				<section>
					<SectionTitle icon={<Target className="h-4 w-4" />}>Mức khớp từng yếu tố</SectionTitle>
					<div className="mt-3 space-y-2">
						{factorKeys.map((k) => {
							const pct = Math.round(breakdown[k] * 100)
							return (
								<div key={k} className="flex items-center gap-3 text-sm">
									<span className="w-44 shrink-0 text-muted-foreground">{FACTOR_LABELS[k]}</span>
									<div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
										<div className="h-full rounded-full bg-primary" style={{ width: `${pct}%` }} />
									</div>
									<span className="w-10 shrink-0 text-right tabular-nums text-muted-foreground">{pct}%</span>
								</div>
							)
						})}
					</div>
				</section>

				{/* Bản chất + học gì */}
				<section className="grid gap-4 sm:grid-cols-2">
					<div>
						<SectionTitle icon={<ListChecks className="h-4 w-4" />}>Bản chất ngành</SectionTitle>
						<p className="mt-2 text-sm text-muted-foreground">{major.nature}</p>
					</div>
					<div>
						<SectionTitle icon={<GraduationCap className="h-4 w-4" />}>Học những gì</SectionTitle>
						<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
							{major.whatYouStudy.map((w) => <li key={w}>• {w}</li>)}
						</ul>
					</div>
				</section>

				{/* Cơ hội + thách thức */}
				<section className="grid gap-4 sm:grid-cols-2">
					<div className="rounded-lg border border-green-200 bg-green-50/60 p-3">
						<SectionTitle icon={<TrendingUp className="h-4 w-4 text-green-600" />}>Cơ hội</SectionTitle>
						<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
							{major.opportunities.map((o) => <li key={o}>• {o}</li>)}
						</ul>
					</div>
					<div className="rounded-lg border border-amber-200 bg-amber-50/60 p-3">
						<SectionTitle icon={<TriangleAlert className="h-4 w-4 text-amber-600" />}>Thách thức cần biết</SectionTitle>
						<ul className="mt-2 space-y-1 text-sm text-muted-foreground">
							{major.challenges.map((c) => <li key={c}>• {c}</li>)}
						</ul>
					</div>
				</section>

				{/* Nghề nghiệp + hướng phát triển */}
				<section>
					<SectionTitle icon={<Briefcase className="h-4 w-4" />}>Nghề nghiệp tiêu biểu</SectionTitle>
					<div className="mt-2 flex flex-wrap gap-1.5">
						{major.careers.map((c) => <Badge key={c} variant="muted">{c}</Badge>)}
					</div>
					<p className="mt-3 text-sm">
						<span className="font-medium">Hướng phát triển: </span>
						<span className="text-muted-foreground">{major.futureDirection}</span>
					</p>
				</section>

				{/* Kỹ năng + tính cách phù hợp */}
				<section className="grid gap-4 sm:grid-cols-2">
					<div>
						<SectionTitle icon={<Sparkles className="h-4 w-4" />}>Kỹ năng quan trọng</SectionTitle>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{skillLabels.map((s) => <Badge key={s} variant="outline">{s}</Badge>)}
						</div>
					</div>
					<div>
						<SectionTitle icon={<Sparkles className="h-4 w-4" />}>Nhóm tính cách thường hợp</SectionTitle>
						<div className="mt-2 flex flex-wrap gap-1.5">
							{personalityTypes.map((t) => (
								<Badge key={t} variant="accent">
									{t} · {MBTI_PROFILES[t]?.nickname ?? ""}
								</Badge>
							))}
						</div>
					</div>
				</section>

				{/* Trường đào tạo xếp hạng */}
				{rankedUniversities.length > 0 && (
					<section>
						<SectionTitle icon={<Award className="h-4 w-4" />}>Trường đào tạo (mạnh → nhẹ hơn)</SectionTitle>
						<p className="mt-1 text-xs text-muted-foreground">
							Xếp theo điểm nội bộ minh bạch (uy tín chương trình, năng lực đào tạo, mức liên quan, độ phổ biến) — không phải xếp hạng chính thức quốc gia.
						</p>
						<ol className="mt-3 space-y-2">
							{rankedUniversities.map((ru, i) => (
								<li key={ru.university.id} className="flex items-center gap-3 rounded-lg border p-3">
									<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold">{i + 1}</span>
									<div className="min-w-0 flex-1">
										<div className="truncate font-medium">{ru.university.name}</div>
										<div className="text-xs text-muted-foreground">
											{ru.university.shortName} · {ru.university.city}
											{ru.program.note ? ` · ${ru.program.note}` : ""}
										</div>
									</div>
									<span className="shrink-0 text-sm font-semibold tabular-nums text-primary">{ru.internalScore}</span>
								</li>
							))}
						</ol>
					</section>
				)}

				{/* Tóm tắt vì sao hợp */}
				<section className="rounded-lg bg-primary/5 p-4">
					<SectionTitle icon={<Compass className="h-4 w-4 text-primary" />}>Tóm lại vì sao ngành này hợp với bạn</SectionTitle>
					<p className="mt-2 text-sm text-muted-foreground">
						<span className="font-medium text-foreground">{major.name}</span> đ��t {score} điểm phù hợp với hồ sơ của bạn.{" "}
						{major.suitableFor}{" "}
						Nếu thấy hứng thú, bạn nên tìm hiểu thêm chương trình đào tạo ở các trường ở trên.
					</p>
				</section>
			</CardContent>
		</Card>
	)
}

function SectionTitle({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
	return (
		<h3 className="flex items-center gap-2 text-sm font-semibold">
			{icon} {children}
		</h3>
	)
}
