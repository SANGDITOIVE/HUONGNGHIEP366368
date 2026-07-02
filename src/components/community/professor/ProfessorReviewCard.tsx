"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import {
	BadgeCheck,
	CheckCircle2,
	ClipboardCheck,
	Lightbulb,
	Loader2,
	ThumbsDown,
	ThumbsUp,
	XCircle,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { StarDisplay } from "@/components/community/StarRating"
import { cn } from "@/lib/utils"

// Kiểu review phía client (khớp với PublicProfessorReview trả từ API).
export interface ProfReview {
	id: number
	professorName: string
	professorSlug: string
	schoolId: string
	subject: string | null
	ratingEasyToPass: number
	ratingFairGrading: number
	ratingClearTeaching: number
	bonusPoints: boolean
	attendanceCheck: boolean
	tipText: string | null
	isAnonymous: boolean
	authorName: string | null
	verifiedStudent: boolean
	upvotes: number
	downvotes: number
	trustScore: number
	createdAt: string
}

function timeAgo(iso: string): string {
	try {
		const then = new Date(iso).getTime()
		if (Number.isNaN(then)) return ""
		const sec = Math.floor((Date.now() - then) / 1000)
		if (sec < 45) return "Vừa xong"
		const min = Math.floor(sec / 60)
		if (min < 60) return `${min} phút trước`
		const hr = Math.floor(min / 60)
		if (hr < 24) return `${hr} giờ trước`
		const day = Math.floor(hr / 24)
		if (day < 7) return `${day} ngày trước`
		return new Date(iso).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })
	} catch {
		return ""
	}
}

// Một dòng tiêu chí: nhãn + sao + số.
function CriteriaRow({ label, value }: { label: string; value: number }) {
	return (
		<div className="flex items-center justify-between gap-3 text-sm">
			<span className="text-muted-foreground">{label}</span>
			<span className="flex items-center gap-2">
				<StarDisplay value={value} size={15} />
				<span className="w-6 text-right font-semibold text-foreground">{value.toFixed(0)}</span>
			</span>
		</div>
	)
}

// Badge Có/Không cho 2 tiêu chí boolean.
function YesNoBadge({ label, on }: { label: string; on: boolean }) {
	return (
		<Badge variant={on ? "accent" : "muted"} className="gap-1">
			{on ? <CheckCircle2 className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
			{label}: {on ? "Có" : "Không"}
		</Badge>
	)
}

export function ProfessorReviewCard({
	review,
	showProfessor = false,
}: {
	review: ProfReview
	showProfessor?: boolean
}) {
	const { status } = useSession()
	const [up, setUp] = useState(review.upvotes)
	const [down, setDown] = useState(review.downvotes)
	const [myVote, setMyVote] = useState<number>(0)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function vote(direction: "up" | "down") {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		if (busy) return
		setBusy(true)
		setError(null)
		try {
			const res = await fetch(`/api/reviews/professor/${review.id}/vote`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ direction }),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) {
				setError(data?.message ?? "Không bình chọn được, thử lại sau.")
				return
			}
			setUp(data.review.upvotes)
			setDown(data.review.downvotes)
			setMyVote(data.myVote ?? 0)
		} catch {
			setError("Lỗi kết nối, thử lại sau.")
		} finally {
			setBusy(false)
		}
	}

	const displayName = review.isAnonymous ? "Sinh viên ẩn danh" : (review.authorName ?? "Người dùng")

	return (
		<article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
			{/* Header */}
			<div className="mb-3 flex flex-wrap items-center gap-2">
				<span className="font-semibold text-foreground">{displayName}</span>
				{review.verifiedStudent && (
					<Badge variant="default" className="gap-1">
						<BadgeCheck className="h-3.5 w-3.5" />
						Sinh viên đã xác minh
					</Badge>
				)}
				<span className="text-xs text-muted-foreground">{timeAgo(review.createdAt)}</span>
			</div>

			{showProfessor && (
				<div className="mb-3 text-sm">
					<span className="font-semibold text-primary">{review.professorName}</span>
					{review.subject ? <span className="text-muted-foreground"> · {review.subject}</span> : null}
				</div>
			)}
			{!showProfessor && review.subject && (
				<div className="mb-3 text-sm text-muted-foreground">Môn: {review.subject}</div>
			)}

			{/* 3 tiêu chí sao riêng biệt */}
			<div className="space-y-1.5 rounded-xl bg-muted/50 p-3">
				<CriteriaRow label="Dễ qua môn" value={review.ratingEasyToPass} />
				<CriteriaRow label="Chấm công bằng" value={review.ratingFairGrading} />
				<CriteriaRow label="Dạy dễ hiểu" value={review.ratingClearTeaching} />
			</div>

			{/* Badge điểm danh / giáo trình */}
			<div className="mt-3 flex flex-wrap gap-2">
				<YesNoBadge label="Điểm danh" on={review.attendanceCheck} />
				<YesNoBadge label="Bắt mua giáo trình" on={review.bonusPoints} />
			</div>

			{/* Tips cộng đồng */}
			{review.tipText && (
				<div className="mt-3 flex gap-2 rounded-xl border border-accent/30 bg-accent/5 p-3 text-sm text-foreground">
					<Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
					<p className="whitespace-pre-wrap">{review.tipText}</p>
				</div>
			)}

			{/* Upvote / Downvote */}
			<div className="mt-4 flex items-center gap-2">
				<button
					type="button"
					onClick={() => vote("up")}
					disabled={busy}
					aria-label="Hữu ích"
					className={cn(
						"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50",
						myVote === 1
							? "border-accent bg-accent/10 text-accent"
							: "border-border text-muted-foreground hover:bg-muted",
					)}
				>
					{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
					{up}
				</button>
				<button
					type="button"
					onClick={() => vote("down")}
					disabled={busy}
					aria-label="Không hữu ích"
					className={cn(
						"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50",
						myVote === -1
							? "border-destructive bg-destructive/10 text-destructive"
							: "border-border text-muted-foreground hover:bg-muted",
					)}
				>
					{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsDown className="h-4 w-4" />}
					{down}
				</button>
				<span className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
					<ClipboardCheck className="h-3.5 w-3.5" />
					Độ tin cậy: {review.trustScore}
				</span>
			</div>

			{error && <p className="mt-2 text-xs text-destructive">{error}</p>}
		</article>
	)
}
