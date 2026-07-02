"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ChevronRight, Loader2, PlusCircle, Search, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { StarDisplay } from "@/components/community/StarRating"
import { ProfessorReviewForm } from "@/components/community/professor/ProfessorReviewForm"

interface ProfessorSummary {
	professorName: string
	professorSlug: string
	subjects: string[]
	reviewCount: number
	averageOverall: number
}

export function ProfessorDirectory({
	schoolId,
	schoolName,
	slug,
}: {
	schoolId: string
	schoolName: string
	slug: string
}) {
	const [professors, setProfessors] = useState<ProfessorSummary[]>([])
	const [loading, setLoading] = useState(true)
	const [query, setQuery] = useState("")
	const [showForm, setShowForm] = useState(false)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch(`/api/reviews/professor?school_id=${encodeURIComponent(schoolId)}`, { cache: "no-store" })
			const data = await res.json()
			if (data.ok) setProfessors(data.professors ?? [])
		} catch {
			// giữ danh sách rỗng khi lỗi
		} finally {
			setLoading(false)
		}
	}, [schoolId])

	useEffect(() => {
		load()
	}, [load])

	const filtered = useMemo(() => {
		const q = query.trim().toLowerCase()
		if (!q) return professors
		return professors.filter(
			(p) =>
				p.professorName.toLowerCase().includes(q) ||
				p.subjects.some((s) => s.toLowerCase().includes(q)),
		)
	}, [professors, query])

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center justify-between gap-3">
				<div className="relative w-full max-w-sm">
					<Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Tìm giảng viên hoặc môn..."
						className="w-full rounded-full border border-input bg-background py-2 pl-9 pr-4 text-sm outline-none focus:border-primary"
					/>
				</div>
				<Button type="button" variant={showForm ? "outline" : "accent"} onClick={() => setShowForm((v) => !v)}>
					<PlusCircle className="h-4 w-4" />
					{showForm ? "Đóng" : "Viết đánh giá"}
				</Button>
			</div>

			{showForm && (
				<ProfessorReviewForm
					schoolId={schoolId}
					onCreated={() => {
						setShowForm(false)
						load()
					}}
				/>
			)}

			{loading ? (
				<div className="flex items-center gap-2 py-10 text-muted-foreground">
					<Loader2 className="h-5 w-5 animate-spin" /> Đang tải danh sách giảng viên...
				</div>
			) : filtered.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center">
					<Users className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
					<p className="font-medium text-foreground">Chưa có đánh giá giảng viên nào cho {schoolName}.</p>
					<p className="mt-1 text-sm text-muted-foreground">Hãy là người đầu tiên chia sẻ trải nghiệm thật!</p>
				</div>
			) : (
				<ul className="grid gap-3 sm:grid-cols-2">
					{filtered.map((p) => (
						<li key={p.professorSlug}>
							<Link
								href={`/truong/${slug}/giang-vien/${encodeURIComponent(p.professorSlug)}`}
								className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/50 hover:bg-muted/40"
							>
								<div className="min-w-0">
									<p className="truncate font-semibold text-foreground">{p.professorName}</p>
									{p.subjects.length > 0 && (
										<p className="mt-0.5 truncate text-xs text-muted-foreground">{p.subjects.join(", ")}</p>
									)}
									<div className="mt-2 flex items-center gap-2">
										<StarDisplay value={p.averageOverall} size={14} />
										<span className="text-xs text-muted-foreground">{p.averageOverall.toFixed(1)}/5</span>
										<Badge variant="muted">{p.reviewCount} đánh giá</Badge>
									</div>
								</div>
								<ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
							</Link>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
