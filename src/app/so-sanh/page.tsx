"use client"

import Link from "next/link"
import { Trash2, X } from "lucide-react"
import { useFavorites } from "@/lib/store/favoritesStore"
import { MAJOR_BY_ID } from "@/data/majors"
import { FIELD_BY_ID } from "@/data/majorFields"
import { SKILLS } from "@/data/taxonomies"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { CareerTabs } from "@/components/layout/CareerTabs"

const COST_LABEL: Record<string, string> = {
	low: "Thấp",
	medium: "Trung bình",
	high: "Cao",
}

function skillLabel(id: string) {
	return SKILLS.find((s) => s.id === id)?.label ?? id
}

export default function SoSanhPage() {
	const { ids, remove, clear, hydrated } = useFavorites()
	const majors = ids.map((id) => MAJOR_BY_ID[id]).filter(Boolean)

	if (!hydrated) {
		return <div className="container py-16 text-center text-muted-foreground">Đang tải…</div>
	}

	return (
		<div className="container py-10">
			<CareerTabs />

			<div className="flex flex-wrap items-start justify-between gap-3">
				<div className="max-w-2xl">
					<h1 className="text-3xl font-bold">So sánh ngành đã lưu</h1>
					<p className="mt-2 text-muted-foreground">
						Đặt các ngành cạnh nhau để cân nhắc bản chất, thời gian, chi phí, kỹ năng và nghề nghiệp trước khi quyết định.
					</p>
				</div>
				{majors.length > 0 && (
					<Button variant="outline" onClick={clear}>
						<Trash2 className="h-4 w-4" /> Bỏ tất cả
					</Button>
				)}
			</div>

			{majors.length === 0 ? (
				<div className="mt-10 rounded-xl border border-dashed p-10 text-center">
					<p className="text-muted-foreground">
						Bạn chưa ghim ngành nào. Vào{" "}
						<Link href="/nganh-hoc" className="font-medium text-primary underline">Khám phá ngành</Link>{" "}
						và bấm biểu tượng ghim để thêm vào so sánh.
					</p>
				</div>
			) : (
				<div className="mt-8 overflow-x-auto">
					<table className="w-full min-w-[640px] border-collapse text-sm">
						<thead>
							<tr>
								<th className="sticky left-0 z-10 w-40 bg-background p-3 text-left align-bottom text-xs font-medium uppercase tracking-wide text-muted-foreground">Tiêu chí</th>
								{majors.map((m) => (
									<th key={m.id} className="min-w-[200px] border-l p-3 text-left align-bottom">
										<div className="flex items-start justify-between gap-2">
											<Link href={`/nganh-hoc/${m.id}`} className="font-semibold text-foreground hover:text-primary hover:underline">{m.name}</Link>
											<button
												type="button"
												onClick={() => remove(m.id)}
												aria-label={`Bỏ ${m.name}`}
												className="shrink-0 rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
											>
												<X className="h-4 w-4" />
											</button>
										</div>
									</th>
								))}
							</tr>
						</thead>
						<tbody className="align-top">
							<Row label="Lĩnh vực">
								{majors.map((m) => <Cell key={m.id}>{FIELD_BY_ID[m.fieldId]?.name ?? "—"}</Cell>)}
							</Row>
							<Row label="Thời gian đào tạo">
								{majors.map((m) => <Cell key={m.id}>{m.feasibility.durationYears} năm</Cell>)}
							</Row>
							<Row label="Chi phí tương đối">
								{majors.map((m) => <Cell key={m.id}>{COST_LABEL[m.feasibility.relativeCost] ?? m.feasibility.relativeCost}</Cell>)}
							</Row>
							<Row label="Bản chất">
								{majors.map((m) => <Cell key={m.id}><span className="text-muted-foreground">{m.nature}</span></Cell>)}
							</Row>
							<Row label="Phù hợp với">
								{majors.map((m) => <Cell key={m.id}><span className="text-muted-foreground">{m.suitableFor}</span></Cell>)}
							</Row>
							<Row label="Kỹ năng chính">
								{majors.map((m) => (
									<Cell key={m.id}>
										<div className="flex flex-wrap gap-1">
											{m.requiredSkills.map((s) => <Badge key={s} variant="outline">{skillLabel(s)}</Badge>)}
										</div>
									</Cell>
								))}
							</Row>
							<Row label="Nghề tiêu biểu">
								{majors.map((m) => (
									<Cell key={m.id}>
										<ul className="space-y-1 text-muted-foreground">
											{m.careers.slice(0, 5).map((c) => <li key={c}>• {c}</li>)}
										</ul>
									</Cell>
								))}
							</Row>
							<Row label="Nơi làm việc phổ biến">
								{majors.map((m) => (
									<Cell key={m.id}>
										<ul className="space-y-1 text-muted-foreground">
											{(m.workplaces ?? []).slice(0, 4).map((w) => <li key={w}>• {w}</li>)}
										</ul>
									</Cell>
								))}
							</Row>
							<Row label="Cơ hội">
								{majors.map((m) => (
									<Cell key={m.id}>
										<ul className="space-y-1 text-muted-foreground">
											{m.opportunities.slice(0, 3).map((c) => <li key={c}>• {c}</li>)}
										</ul>
									</Cell>
								))}
							</Row>
							<Row label="Thách thức">
								{majors.map((m) => (
									<Cell key={m.id}>
										<ul className="space-y-1 text-muted-foreground">
											{m.challenges.slice(0, 3).map((c) => <li key={c}>• {c}</li>)}
										</ul>
									</Cell>
								))}
							</Row>
						</tbody>
					</table>
				</div>
			)}

			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<tr className="border-t">
			<th scope="row" className="sticky left-0 z-10 bg-background p-3 text-left text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</th>
			{children}
		</tr>
	)
}

function Cell({ children }: { children: React.ReactNode }) {
	return <td className="border-l p-3">{children}</td>
}
