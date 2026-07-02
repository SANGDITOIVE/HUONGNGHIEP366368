"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Loader2, MessageSquare } from "lucide-react"
import { StarDisplay } from "@/components/community/StarRating"
import { Badge } from "@/components/ui/badge"
import {
	ProfessorReviewCard,
	type ProfReview,
} from "@/components/community/professor/ProfessorReviewCard"
import { ProfessorReviewForm } from "@/components/community/professor/ProfessorReviewForm"

export function ProfessorProfile({
	schoolId,
	schoolName,
	slug,
	professorSlug,
	initialName,
}: {
	schoolId: string
	schoolName: string
	slug: string
	professorSlug: string
	initialName: string
}) {
	const [reviews, setReviews] = useState<ProfReview[]>([])
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch(
				`/api/reviews/professor?school_id=${encodeURIComponent(schoolId)}&professor=${encodeURIComponent(professorSlug)}`,
				{ cache: "no-store" },
			)
			const data = await res.json()
			if (data.ok) setReviews(data.reviews ?? [])
		} catch {
			// giữ rỗng khi lỗi
		} finally {
			setLoading(false)
		}
	}, [schoolId, professorSlug])

	useEffect(() => {
		load()
	}, [load])

	const professorName = reviews[0]?.professorName ?? initialName

	const agg = useMemo(() => {
		if (reviews.length === 0) return { easy: 0, fair: 0, clear: 0, overall: 0, count: 0 }
		const n = reviews.length
		const sum = reviews.reduce(
			(acc, r) => {
				acc.easy += r.ratingEasyToPass
				acc.fair += r.ratingFairGrading
				acc.clear += r.ratingClearTeaching
				return acc
			},
			{ easy: 0, fair: 0, clear: 0 },
		)
		const easy = sum.easy / n
		const fair = sum.fair / n
		const clear = sum.clear / n
		return { easy, fair, clear, overall: (easy + fair + clear) / 3, count: n }
	}, [reviews])

	const subjects = useMemo(() => {
		const set = new Set<string>()
		for (const r of reviews) if (r.subject) set.add(r.subject)
		return Array.from(set)
	}, [reviews])

	return (
		<div className="space-y-6">
			<Link
				href={`/truong/${slug}/giang-vien`}
				className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
			>
				<ArrowLeft className="h-4 w-4" /> Tất cả giảng viên của {schoolName}
			</Link>

			{/* Header tổng quan */}
			<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
				<h1 className="text-2xl font-bold text-foreground">{professorName}</h1>
				<p className="mt-1 text-sm text-muted-foreground">{schoolName}</p>
				{subjects.length > 0 && (
					<div className="mt-2 flex flex-wrap gap-2">
						{subjects.map((s) => (
							<Badge key={s} variant="muted">{s}</Badge>
						))}
					</div>
				)}

				<div className="mt-4 grid gap-3 sm:grid-cols-3">
					<AggBox label="Dễ qua môn" value={agg.easy} />
					<AggBox label="Chấm công bằng" value={agg.fair} />
					<AggBox label="Dạy dễ hiểu" value={agg.clear} />
				</div>
				<p className="mt-3 text-sm text-muted-foreground">
					Điểm tổng: <span className="font-semibold text-foreground">{agg.overall.toFixed(1)}/5</span> · {agg.count} đánh giá
				</p>
			</div>

			{/* Form viết đánh giá (khoá tên giảng viên) */}
			<ProfessorReviewForm
				schoolId={schoolId}
				lockProfessorName
				defaultProfessorName={professorName}
				onCreated={() => load()}
			/>

			{/* Danh sách review */}
			<div>
				<h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-foreground">
					<MessageSquare className="h-5 w-5" /> Tất cả đánh giá
				</h2>
				{loading ? (
					<div className="flex items-center gap-2 py-8 text-muted-foreground">
						<Loader2 className="h-5 w-5 animate-spin" /> Đang tải...
					</div>
				) : reviews.length === 0 ? (
					<p className="rounded-xl border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
						Chưa có đánh giá nào cho giảng viên này. Hãy viết đánh giá đầu tiên ở trên.
					</p>
				) : (
					<div className="space-y-3">
						{reviews.map((r) => (
							<ProfessorReviewCard key={r.id} review={r} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}

function AggBox({ label, value }: { label: string; value: number }) {
	return (
		<div className="rounded-xl bg-muted/50 p-3 text-center">
			<p className="text-xs text-muted-foreground">{label}</p>
			<p className="my-1 text-lg font-bold text-foreground">{value.toFixed(1)}</p>
			<div className="flex justify-center">
				<StarDisplay value={value} size={14} />
			</div>
		</div>
	)
}
