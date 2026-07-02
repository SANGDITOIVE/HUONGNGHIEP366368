"use client"

import { useState } from "react"
import Link from "next/link"
import {
	ArrowRight,
	Briefcase,
	Check,
	Copy,
	GraduationCap,
	Lightbulb,
	RefreshCw,
	ShieldAlert,
	Sparkles,
	TrendingUp,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { AXIS_EMOJI, AXIS_LABELS, type JourneyResult } from "@/lib/journey/types"
import { AXIS_TO_PORTRAIT, PORTRAITS } from "@/data/journey/portraitTemplates"

const OUTLOOK_LABEL: Record<JourneyResult["matches"][number]["outlook"], string> = {
	cao: "Nhu cầu tăng",
	"on-dinh": "Ổn định",
	"can-chu-y": "Cần chú ý",
}
const RISK_LABEL: Record<JourneyResult["matches"][number]["aiRisk"], string> = {
	thap: "Rủi ro AI thấp",
	"trung-binh": "Rủi ro AI trung bình",
	cao: "Rủi ro AI cao",
}
const INCOME_LABEL: Record<JourneyResult["matches"][number]["income"], string> = {
	thap: "Thu nhập khởi điểm thấp",
	"trung-binh": "Thu nhập khá",
	cao: "Thu nhập cao",
}

function Badge({ children, tone = "muted" }: { children: React.ReactNode; tone?: "muted" | "green" | "amber" }) {
	const cls =
		tone === "green"
			? "bg-primary/10 text-primary"
			: tone === "amber"
				? "bg-accent/10 text-accent"
				: "bg-muted text-muted-foreground"
	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${cls}`}>
			{children}
		</span>
	)
}

function SectionTitle({ icon, index, title }: { icon: React.ReactNode; index: number; title: string }) {
	return (
		<div className="flex items-center gap-3">
			<div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
				{icon}
			</div>
			<div>
				<div className="text-xs font-medium text-muted-foreground">Phần {index}</div>
				<h2 className="text-xl font-bold">{title}</h2>
			</div>
		</div>
	)
}

export function JourneyResultView({ result, onRestart }: { result: JourneyResult; onRestart: () => void }) {
	const [copied, setCopied] = useState(false)
	const portraitKey = AXIS_TO_PORTRAIT[result.topAxes[0]]
	const portrait = PORTRAITS[portraitKey] ?? PORTRAITS["nguoi-phan-tich"]

	const copyShare = async () => {
		try {
			await navigator.clipboard.writeText(result.shareText)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			/* noop */
		}
	}

	return (
		<div className="space-y-12">
			{/* BLOCK 1 — Đây là bạn */}
			<section className="animate-fade-in-up space-y-5">
				<SectionTitle icon={<Sparkles className="h-5 w-5" />} index={1} title="Đây là bạn" />
				<Card>
					<CardContent className="space-y-5 p-6">
						<div className="flex items-center gap-4">
							<div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-4xl">
								{portrait.emoji}
							</div>
							<div>
								<div className="text-sm text-muted-foreground">Chân dung năng khiếu nổi bật</div>
								<h3 className="text-2xl font-bold">{portrait.title}</h3>
							</div>
						</div>
						<p className="leading-relaxed text-muted-foreground">{result.portrait}</p>
						<div className="space-y-3 pt-2">
							<div className="text-sm font-semibold">Phân bố 6 trục năng khiếu</div>
							{result.topAxes.map((axis) => (
								<div key={axis} className="space-y-1">
									<div className="flex items-center justify-between text-sm">
										<span>
											{AXIS_EMOJI[axis]} {AXIS_LABELS[axis]}
										</span>
										<span className="text-muted-foreground">{result.aptitude[axis]}%</span>
									</div>
									<Progress value={result.aptitude[axis]} />
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</section>

			{/* BLOCK 2 — 3 hướng gợi ý */}
			<section className="animate-fade-in-up space-y-5">
				<SectionTitle icon={<TrendingUp className="h-5 w-5" />} index={2} title="3 hướng để bạn cân nhắc" />
				<div className="grid gap-5">
					{result.matches.map((m, i) => (
						<Card key={m.groupId}>
							<CardContent className="space-y-4 p-6">
								<div className="flex items-start justify-between gap-4">
									<div className="flex items-center gap-3">
										<div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
											{i + 1}
										</div>
										<h3 className="text-lg font-semibold">{m.name}</h3>
									</div>
									<div className="text-right">
										<div className="text-2xl font-bold text-primary">{m.fit}%</div>
										<div className="text-xs text-muted-foreground">mức phù hợp</div>
									</div>
								</div>
								<div className="flex flex-wrap gap-2">
									<Badge tone="green">{OUTLOOK_LABEL[m.outlook]}</Badge>
									<Badge tone={m.aiRisk === "thap" ? "green" : m.aiRisk === "cao" ? "amber" : "muted"}>
										{RISK_LABEL[m.aiRisk]}
									</Badge>
									<Badge>{INCOME_LABEL[m.income]}</Badge>
								</div>
								<div className="grid gap-3 text-sm sm:grid-cols-2">
									<div className="flex items-start gap-2">
										<Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
										<span>{m.jobs.join(", ")}</span>
									</div>
									<div className="flex items-start gap-2">
										<GraduationCap className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
										<span>{m.universities.join(" • ")}</span>
									</div>
								</div>
								<div className="rounded-lg bg-muted/60 p-3 text-sm">
									<div className="mb-1 font-medium">Vì sao gợi ý cho bạn</div>
									<ul className="list-inside list-disc space-y-0.5 text-muted-foreground">
										{m.reasons.map((r, ri) => (
											<li key={ri}>{r}</li>
										))}
									</ul>
								</div>
								<div className="text-xs text-muted-foreground">
									Tổ hợp thường dùng: {m.streams} — Môn nên chú ý: {m.subjectsFocus.join(", ")}
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* BLOCK 3 — Cảnh báo mềm */}
			{result.warnings.length > 0 && (
				<section className="animate-fade-in-up space-y-5">
					<SectionTitle icon={<ShieldAlert className="h-5 w-5" />} index={3} title="Đôi điều nhắn nhủ" />
					<div className="grid gap-4">
						{result.warnings.map((w, i) => (
							<Card key={i} className="border-accent/40 bg-accent/5">
								<CardContent className="p-5">
									<div className="mb-1 font-semibold">{w.title}</div>
									<p className="text-sm text-muted-foreground">{w.body}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>
			)}

			{/* BLOCK 4 — Bước tiếp theo */}
			<section className="animate-fade-in-up space-y-5">
				<SectionTitle icon={<Lightbulb className="h-5 w-5" />} index={4} title="Bước tiếp theo" />
				<Card>
					<CardContent className="p-6">
						<ol className="space-y-3">
							{result.nextSteps.map((s, i) => (
								<li key={i} className="flex items-start gap-3">
									<span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
										{i + 1}
									</span>
									<span className="text-sm">{s}</span>
								</li>
							))}
						</ol>
					</CardContent>
				</Card>
			</section>

			{/* BLOCK 5 — Nút hành động */}
			<section className="animate-fade-in-up space-y-4">
				<SectionTitle icon={<ArrowRight className="h-5 w-5" />} index={5} title="Hành động ngay" />
				<div className="flex flex-wrap gap-3">
					<Button asChild size="lg">
						<Link href="/nganh-hoc">
							Khám phá ngành học chi tiết <ArrowRight className="h-4 w-4" />
						</Link>
					</Button>
					<Button asChild size="lg" variant="outline">
						<Link href="/danh-gia">Làm đánh giá chuyên sâu</Link>
					</Button>
					<Button size="lg" variant="ghost" onClick={copyShare}>
						{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
						{copied ? "Đã sao chép" : "Sao chép kết quả"}
					</Button>
					<Button size="lg" variant="ghost" onClick={onRestart}>
						<RefreshCw className="h-4 w-4" /> Làm lại hành trình
					</Button>
				</div>
				<p className="text-xs text-muted-foreground">
					Kết quả mang tính định hướng tham khảo, không thay thế tư vấn chuyên sâu. Bạn mới là người quyết định cuối cùng.
				</p>
			</section>
		</div>
	)
}
