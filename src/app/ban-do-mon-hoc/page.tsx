"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, RotateCcw, Sparkles, Target } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MultiSelectGroup, SingleSelectGroup } from "@/components/assessment/SelectGroup"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { CareerTabs } from "@/components/layout/CareerTabs"
import { cn } from "@/lib/utils"
import { SUBJECTS, STREAMS } from "@/data/taxonomies"
import { SUBJECT_FIELD_MAP, STREAM_FIELD_MAP } from "@/data/bullseye"
import { FIELD_BY_ID } from "@/data/majorFields"
import { MAJOR_BY_ID } from "@/data/majors"
import type { StreamId, SubjectId } from "@/types"

const TIER_META = [
	{ label: "Rất phù hợp", className: "border-primary/60 bg-primary/5" },
	{ label: "Phù hợp", className: "border-accent/40 bg-accent/5" },
	{ label: "Có thể cân nhắc", className: "border-border bg-card" },
]

const OUTLOOK_LABEL: Record<string, string> = {
	"cao": "Triển vọng cao",
	"on-dinh": "Ổn định",
	"canh-tranh": "Cạnh tranh cao",
}

export default function BanDoMonHocPage() {
	const [subjects, setSubjects] = useState<SubjectId[]>([])
	const [stream, setStream] = useState<StreamId | null>(null)

	const ranked = useMemo(() => {
		const scores: Record<string, number> = {}
		for (const s of subjects) {
			for (const fid of SUBJECT_FIELD_MAP[s] ?? []) {
				scores[fid] = (scores[fid] ?? 0) + 2
			}
		}
		if (stream && stream !== "chua-ro") {
			for (const fid of STREAM_FIELD_MAP[stream] ?? []) {
				scores[fid] = (scores[fid] ?? 0) + 1
			}
		}
		return Object.entries(scores)
			.map(([id, score]) => ({ field: FIELD_BY_ID[id], score }))
			.filter((x) => Boolean(x.field))
			.sort((a, b) => b.score - a.score)
	}, [subjects, stream])

	const maxScore = ranked[0]?.score ?? 0
	const hasInput = subjects.length > 0 || (stream != null && stream !== "chua-ro")

	const tierOf = (score: number): 0 | 1 | 2 => {
		if (score >= maxScore) return 0
		if (score >= maxScore * 0.5) return 1
		return 2
	}

	const reset = () => {
		setSubjects([])
		setStream(null)
	}

	return (
		<div className="container py-10">
			<CareerTabs />
			<div className="max-w-2xl">
				<div className="relative mx-auto mb-4 flex h-24 w-24 items-center justify-center">
					<div className="absolute inset-0 animate-fade-in rounded-full border-4 border-primary/15" />
					<div className="absolute inset-3 rounded-full border-4 border-primary/25" />
					<div className="absolute inset-6 rounded-full border-4 border-primary/40" />
					<Target className="relative h-9 w-9 text-primary" />
				</div>
				<h1 className="text-3xl font-bold">Bản đồ môn học → ngành</h1>
				<p className="mt-3 text-muted-foreground">
					Chọn những môn bạn học tốt hoặc yêu thích, web sẽ gợi ý các lĩnh vực
					ngành thường phù hợp với thế mạnh đó. Đây là gợi ý tham khảo để khám
					phá, không phải giới hạn lựa chọn của bạn.
				</p>
			</div>

			<div className="mt-8 grid gap-8 lg:grid-cols-[1fr_1.1fr]">
				{/* Cột chọn */}
				<div className="space-y-8">
					<section>
						<h2 className="text-lg font-semibold">Môn học bạn mạnh / yêu thích</h2>
						<p className="mb-3 mt-1 text-sm text-muted-foreground">Chọn tối đa 5 môn.</p>
						<MultiSelectGroup options={SUBJECTS} value={subjects} onChange={setSubjects} max={5} />
					</section>
					<section>
						<h2 className="text-lg font-semibold">Khối / ban đang theo <span className="font-normal text-muted-foreground">(tuỳ chọn)</span></h2>
						<div className="mt-3">
							<SingleSelectGroup options={STREAMS} value={stream} onChange={setStream} />
						</div>
					</section>
					{hasInput && (
						<button
							type="button"
							onClick={reset}
							className="inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						>
							<RotateCcw className="h-3.5 w-3.5" /> Chọn lại
						</button>
					)}
				</div>

				{/* Cột kết quả */}
				<div>
					<h2 className="flex items-center gap-2 text-lg font-semibold">
						<Target className="h-5 w-5 text-primary" /> Lĩnh vực ngành gợi ý
					</h2>

					{!hasInput ? (
						<Card className="mt-3 border-dashed">
							<CardContent className="flex flex-col items-center gap-3 py-14 text-center">
								<Sparkles className="h-8 w-8 text-muted-foreground/60" />
								<p className="max-w-xs text-sm text-muted-foreground">
									Chọn ít nhất một môn học bên trái để xem các lĩnh vực ngành phù hợp với thế mạnh của bạn.
								</p>
							</CardContent>
						</Card>
					) : ranked.length === 0 ? (
						<p className="mt-6 text-sm text-muted-foreground">Chưa có gợi ý phù hợp. Hãy thử chọn thêm môn học.</p>
					) : (
						<div className="mt-3 space-y-3">
							{ranked.map(({ field, score }, idx) => {
								const tier = tierOf(score)
								const pct = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0
								return (
									<Card
										key={field.id}
										className={cn("animate-fade-in-up", TIER_META[tier].className)}
										style={{ animationDelay: `${idx * 50}ms` }}
									>
										<CardContent className="p-4">
											<div className="flex items-start justify-between gap-3">
												<div className="flex items-center gap-2">
													<span className="text-2xl">{field.icon}</span>
													<div>
														<p className="font-semibold">{field.name}</p>
														<p className="text-xs text-muted-foreground">{field.shortDescription}</p>
													</div>
												</div>
												<Badge variant="muted" className="shrink-0">{TIER_META[tier].label}</Badge>
											</div>
											<div className="mt-3">
												<div className="h-2 w-full overflow-hidden rounded-full bg-muted">
													<div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
												</div>
												<div className="mt-1.5 flex items-center justify-between text-xs text-muted-foreground">
													<span>Mức khớp với lựa chọn của bạn: {pct}%</span>
													{field.outlook && <span>{OUTLOOK_LABEL[field.outlook.level] ?? ""}</span>}
												</div>
											</div>
											<div className="mt-3 flex flex-wrap gap-1.5">
												{field.majorIds.map((mid) => {
													const m = MAJOR_BY_ID[mid]
													if (!m) return null
													return (
														<Link
															key={mid}
															href={`/nganh-hoc/${mid}`}
															className="group inline-flex items-center gap-1 rounded-full border bg-background px-2.5 py-1 text-xs font-medium transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:text-primary"
														>
															{m.name}
															<ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
														</Link>
													)
												})}
											</div>
										</CardContent>
									</Card>
								)
							})}
							<Card className="border-dashed bg-muted/30">
								<CardContent className="flex items-center justify-between gap-3 p-4">
									<p className="text-sm text-muted-foreground">Muốn phân tích kỹ hơn theo sở thích, kỹ năng và gia đình?</p>
									<Link href="/danh-gia" className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]">
										Làm đánh giá <ArrowRight className="h-4 w-4" />
									</Link>
								</CardContent>
							</Card>
						</div>
					)}
				</div>
			</div>

			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}
