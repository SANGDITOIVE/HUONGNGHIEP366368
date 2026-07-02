"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { cn } from "@/lib/utils"
import {
	GROUP_CATEGORIES, MAJOR_GROUPS, type GroupCategory,
} from "@/data/majorGroups"
import { MAJOR_FIELDS } from "@/data/majorFields"
import { MAJOR_BY_ID } from "@/data/majors"
import { PinButton } from "@/components/major/PinButton"
import { CareerTabs } from "@/components/layout/CareerTabs"

function stripVN(s: string) {
	return s
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
}

export default function NganhHocPage() {
	const [query, setQuery] = useState("")
	const [category, setCategory] = useState<GroupCategory | "all">("all")
	const [detailQuery, setDetailQuery] = useState("")

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		return MAJOR_GROUPS.filter((g) => {
			const byCat = category === "all" || g.category === category
			const byText =
				q === "" ||
				g.name.toLowerCase().includes(q) ||
				g.examples.some((e) => e.toLowerCase().includes(q))
			return byCat && byText
		})
	}, [query, category])

	const detailFields = useMemo(() => {
		const dq = stripVN(detailQuery.trim())
		return MAJOR_FIELDS.map((field) => {
			const majors = field.majorIds
				.map((id) => MAJOR_BY_ID[id])
				.filter(Boolean)
				.filter(
					(m) =>
						dq === "" ||
						stripVN(m.name).includes(dq) ||
						stripVN(field.name).includes(dq) ||
						(m.definition ? stripVN(m.definition).includes(dq) : false),
				)
			return { field, majors }
		}).filter((s) => s.majors.length > 0)
	}, [detailQuery])

	const catLabel = (id: GroupCategory) =>
		GROUP_CATEGORIES.find((c) => c.id === id)?.label ?? id

	return (
		<div className="container py-10">
			<CareerTabs />
			<div className="max-w-2xl">
				<h1 className="text-3xl font-bold">Khám phá ngành học</h1>
			</div>

			{/* Ngành có hướng dẫn chi tiết */}
			<section className="mt-8">
				<h2 className="text-xl font-semibold">Ngành có hướng dẫn chi tiết</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Nhấn vào một ngành để xem bản chất, cơ hội, thách thức và các trường đào tạo.
				</p>

				<div className="mt-4">
					<label className="relative block max-w-md">
						<span className="sr-only">Tìm ngành có hướng dẫn</span>
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							value={detailQuery}
							onChange={(e) => setDetailQuery(e.target.value)}
							placeholder="Tìm ngành: công nghệ thông tin, luật, y khoa…"
							className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
					</label>
				</div>

				<div className="mt-4 space-y-6">
					{detailFields.length === 0 ? (
						<p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy ngành phù hợp. Hãy thử từ khóa khác.</p>
					) : detailFields.map(({ field, majors }) => {
						return (
							<div key={field.id}>
								<div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
									<span>{field.icon}</span> {field.name}
								</div>
								<div className="mt-2 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
									{majors.map((m) => (
										<div key={m.id} className="group relative">
										<Link
											href={`/nganh-hoc/${m.id}`}
											className="block rounded-lg border bg-card p-4 pr-12 transition-colors hover:border-primary hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
										>
											<span className="font-medium">{m.name}</span>
											<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{m.definition}</p>
										</Link>
											<PinButton majorId={m.id} majorName={m.name} className="absolute right-2 top-2" />
										</div>
									))}
								</div>
							</div>
						)
					})}
				</div>
			</section>

			<hr className="my-10 border-border" />

			{/* Toàn bộ nhóm ngành */}
			<section>
				<h2 className="text-xl font-semibold">Bảng tổng quát về các ngành</h2>

				{/* Tìm kiếm */}
				<div className="mt-6">
					<label className="relative block max-w-md">
						<span className="sr-only">Tìm ngành</span>
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
						<input
							type="search"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Tìm ngành, ví dụ: luật, AI, điều dưỡng…"
							className="h-11 w-full rounded-lg border border-input bg-card pl-9 pr-4 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
						/>
					</label>
				</div>

				{/* Bộ lọc */}
				<div className="mt-4 flex flex-wrap gap-2">
					<FilterPill active={category === "all"} onClick={() => setCategory("all")} label="Tất cả" />
					{GROUP_CATEGORIES.map((c) => (
						<FilterPill key={c.id} active={category === c.id} onClick={() => setCategory(c.id)} label={c.label} />
					))}
				</div>

				{/* Danh sách */}
				<div className="mt-6">
					{filtered.length === 0 ? (
						<p className="py-10 text-center text-muted-foreground">Không tìm thấy nhóm ngành phù hợp.</p>
					) : (
						<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
							{filtered.map((g) => (
								<Card key={g.id} className="flex flex-col">
									<CardHeader>
										<Badge variant="muted" className="w-fit">{catLabel(g.category)}</Badge>
										<CardTitle className="mt-2">{g.name}</CardTitle>
									</CardHeader>
									<CardContent>
										<p className="mb-2 text-xs font-medium text-muted-foreground">Ngành tiêu biểu</p>
										<div className="flex flex-wrap gap-1.5">
											{g.examples.map((e) => (
												<Badge key={e} variant="outline">{e}</Badge>
											))}
										</div>
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</div>
			</section>

			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}

function FilterPill({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-pressed={active}
			className={cn(
				"rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				active ? "border-primary bg-primary text-primary-foreground" : "border-input bg-card hover:bg-muted",
			)}
		>
			{label}
		</button>
	)
}
