"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import {
	CheckCircle2,
	CornerDownRight,
	Loader2,
	MessageSquare,
	Send,
	Star,
	UserRound,
} from "lucide-react"
import { StarDisplay, StarPicker } from "@/components/community/StarRating"

// ---------- Kiểu dữ liệu trả từ API (đã ẩn email/phone) ----------
interface ApiComment {
	id: number
	reviewId: number
	authorName: string
	authorImage: string | null
	content: string
	createdAt: string
}
interface ApiReview {
	id: number
	universityId: string
	authorName: string
	authorImage: string | null
	rating: number
	content: string
	createdAt: string
	comments: ApiComment[]
}

const REVIEW_MAX = 4000
const COMMENT_MAX = 2000

// Thời gian tương đối kiểu "2 giờ trước" cho cảm giác tự nhiên.
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

function Avatar({ name, image, size = 32 }: { name: string; image: string | null; size?: number }) {
	if (image) {
		// eslint-disable-next-line @next/next/no-img-element
		return (
			<img
				src={image}
				alt={name}
				className="shrink-0 rounded-full object-cover"
				style={ { width: size, height: size } }
				referrerPolicy="no-referrer"
			/>
		)
	}
	return (
		<span
			className="flex shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-500"
			style={ { width: size, height: size } }
		>
			<UserRound style={ { width: size * 0.5, height: size * 0.5 } } />
		</span>
	)
}

// =============================================================
// ReviewSection — Khu vực đánh giá & phản biện cho 1 trường (Client UI).
// Cơ chế tương tự Google Maps: điểm trung bình + danh sách thẻ review,
// mỗi review có ô phản biện ngay bên dưới.
// =============================================================
export function ReviewSection({
	universityId,
	universityName,
}: {
	universityId: string
	universityName: string
}) {
	const { data: session, status } = useSession()
	const authed = status === "authenticated"
	const me = session?.user

	const [reviews, setReviews] = useState<ApiReview[]>([])
	const [average, setAverage] = useState(0)
	const [count, setCount] = useState(0)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	// Form viết đánh giá
	const [rating, setRating] = useState(5)
	const [content, setContent] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [formError, setFormError] = useState<string | null>(null)
	const [justSent, setJustSent] = useState(false)
	const sentTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch(`/api/reviews?universityId=${encodeURIComponent(universityId)}`, { cache: "no-store" })
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.error || "FETCH_FAILED")
			setReviews(data.reviews ?? [])
			setAverage(data.average ?? 0)
			setCount(data.count ?? 0)
		} catch {
			setError("Không tải được đánh giá. Vui lòng thử lại.")
		} finally {
			setLoading(false)
		}
	}, [universityId])

	useEffect(() => {
		load()
	}, [load])

	useEffect(() => () => {
		if (sentTimer.current) clearTimeout(sentTimer.current)
	}, [])

	async function submitReview(e: React.FormEvent) {
		e.preventDefault()
		setFormError(null)
		const text = content.trim()
		if (text.length < 10) {
			setFormError("Hãy viết ít nhất 10 ký tự để chia sẻ hữu ích hơn nhé.")
			return
		}
		setSubmitting(true)
		try {
			const res = await fetch("/api/reviews", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ universityId, rating, content: text }),
			})
			const data = await res.json().catch(() => ({}))
			if (res.status === 401) {
				setFormError("Bạn cần đăng nhập để viết đánh giá.")
				return
			}
			if (!res.ok || !data.ok) throw new Error(data?.error || "POST_FAILED")
			setContent("")
			setRating(5)
			setJustSent(true)
			if (sentTimer.current) clearTimeout(sentTimer.current)
			sentTimer.current = setTimeout(() => setJustSent(false), 3500)
			await load()
		} catch {
			setFormError("Gửi đánh giá thất bại. Vui lòng thử lại.")
		} finally {
			setSubmitting(false)
		}
	}

	const remaining = REVIEW_MAX - content.length

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<h4 className="flex items-center gap-1.5 text-sm font-semibold text-slate-700">
					<MessageSquare className="h-4 w-4 text-primary" /> Đánh giá từ cộng đồng
				</h4>
				<div className="flex items-center gap-2">
					<span className="font-heading text-lg font-bold text-amber-500">{average.toFixed(1)}</span>
					<StarDisplay value={average} size={15} />
					<span className="text-xs text-slate-400">({count})</span>
				</div>
			</div>

			{/* Form viết đánh giá hoặc CTA đăng nhập */}
			{authed ? (
				justSent ? (
					<div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
						<CheckCircle2 className="h-5 w-5" />
						Cảm ơn bạn đã chia sẻ đánh giá! Đánh giá của bạn đã hiển thị bên dưới.
					</div>
				) : (
					<form onSubmit={submitReview} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/60 p-3.5">
						<div className="flex items-center gap-2.5">
							<Avatar name={me?.name ?? "Bạn"} image={me?.image ?? null} size={36} />
							<div className="min-w-0">
								<p className="truncate text-sm font-semibold text-slate-700">{me?.name ?? "Bạn"}</p>
								<p className="text-xs text-slate-400">Đang viết đánh giá công khai</p>
							</div>
						</div>

						<div className="flex flex-wrap items-center gap-x-3 gap-y-1">
							<span className="text-xs font-medium text-slate-500">Mức độ hài lòng:</span>
							<StarPicker value={rating} onChange={setRating} size={26} />
						</div>

						<textarea
							value={content}
							onChange={(e) => setContent(e.target.value.slice(0, REVIEW_MAX))}
							onKeyDown={(e) => {
								if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && !submitting) {
									e.preventDefault()
								submitReview(e)
							}
						}}
							placeholder={`Chia sẻ trải nghiệm của bạn về ${universityName}: chất lượng đào tạo, cơ sở vật chất, học phí...`}
							rows={3}
							maxLength={REVIEW_MAX}
							className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/15"
						/>

						{formError && <p className="text-xs font-medium text-rose-500">{formError}</p>}

						<div className="flex items-center justify-between gap-2">
							<span className={`text-xs ${remaining < 100 ? "text-amber-500" : "text-slate-400"}`}>
								<span className="hidden sm:inline">Nhấn </span>⌘/Ctrl + Enter để gửi · {content.length}/{REVIEW_MAX}
							</span>
							<button
								type="submit"
								disabled={submitting || content.trim().length < 10}
								className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3.5 py-1.5 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
							>
								{submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
								{submitting ? "Đang gửi..." : "Gửi đánh giá"}
							</button>
						</div>
					</form>
				)
			) : (
				<button
					type="button"
					onClick={() => signIn("google")}
					className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:border-primary hover:text-primary"
				>
					<Star className="h-4 w-4 text-amber-400" /> Đăng nhập bằng Google để viết đánh giá
				</button>
			)}

			{/* Danh sách review */}
			{loading ? (
				<div className="flex items-center justify-center gap-2 py-6 text-xs text-slate-400">
					<Loader2 className="h-4 w-4 animate-spin" /> Đang tải đánh giá...
				</div>
			) : error ? (
				<div className="flex flex-col items-center gap-2 py-5 text-center">
					<p className="text-xs text-rose-500">{error}</p>
					<button
						type="button"
						onClick={load}
						className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 transition hover:border-primary hover:text-primary"
					>
						Thử lại
					</button>
				</div>
			) : reviews.length === 0 ? (
				<div className="flex flex-col items-center gap-1.5 rounded-xl border border-dashed border-slate-200 py-6 text-center">
					<MessageSquare className="h-6 w-6 text-slate-300" />
					<p className="text-sm font-medium text-slate-500">Chưa có đánh giá nào</p>
					<p className="text-xs text-slate-400">Hãy là người đầu tiên chia sẻ về {universityName}!</p>
				</div>
			) : (
				<ul className="space-y-3">
					{reviews.map((r) => (
						<ReviewCard key={r.id} review={r} authed={authed} me={me} onCommented={load} />
					))}
				</ul>
			)}
		</div>
	)
}

// ---------- Thẻ 1 bài review + ô phản biện ----------
function ReviewCard({
	review,
	authed,
	me,
	onCommented,
}: {
	review: ApiReview
	authed: boolean
	me?: { name?: string | null; image?: string | null }
	onCommented: () => void
}) {
	const [comment, setComment] = useState("")
	const [sending, setSending] = useState(false)
	const [err, setErr] = useState<string | null>(null)
	const [showAll, setShowAll] = useState(false)

	const replies = review.comments
	const hiddenCount = replies.length > 2 && !showAll ? replies.length - 2 : 0
	const visibleReplies = showAll ? replies : replies.slice(0, 2)

	async function sendComment(e: React.FormEvent) {
		e.preventDefault()
		setErr(null)
		const text = comment.trim()
		if (!text) return
		setSending(true)
		try {
			const res = await fetch(`/api/reviews/${review.id}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: text }),
			})
			const data = await res.json().catch(() => ({}))
			if (res.status === 401) {
				setErr("Phiên đăng nhập đã hết hạn. Hãy đăng nhập lại.")
				return
			}
			if (!res.ok || !data.ok) throw new Error(data?.error || "COMMENT_FAILED")
			setComment("")
			setShowAll(true)
			onCommented()
		} catch {
			setErr("Không gửi được phản biện. Vui lòng thử lại.")
		} finally {
			setSending(false)
		}
	}

	return (
		<li className="rounded-xl border border-slate-200 bg-white p-3.5 transition hover:border-slate-300">
			<div className="flex items-start gap-2.5">
				<Avatar name={review.authorName} image={review.authorImage} size={36} />
				<div className="min-w-0 flex-1">
					<div className="flex items-center justify-between gap-2">
						<span className="truncate text-sm font-semibold text-slate-700">{review.authorName}</span>
						<span className="shrink-0 text-xs text-slate-400" title={review.createdAt}>{timeAgo(review.createdAt)}</span>
					</div>
					<StarDisplay value={review.rating} size={13} />
					<p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">{review.content}</p>
				</div>
			</div>

			{/* Phản biện */}
			{replies.length > 0 && (
				<ul className="mt-3 space-y-2.5 border-l-2 border-slate-100 pl-3">
					{hiddenCount > 0 && (
						<li>
							<button
								type="button"
								onClick={() => setShowAll(true)}
								className="text-xs font-medium text-primary hover:underline"
							>
								Xem thêm {hiddenCount} phản biện trước đó
							</button>
						</li>
					)}
					{visibleReplies.map((c) => (
						<li key={c.id} className="flex items-start gap-2">
							<Avatar name={c.authorName} image={c.authorImage} size={24} />
							<div className="min-w-0 flex-1">
								<div className="flex items-center gap-2">
									<span className="text-xs font-semibold text-slate-600">{c.authorName}</span>
									<span className="text-[11px] text-slate-400" title={c.createdAt}>{timeAgo(c.createdAt)}</span>
								</div>
								<p className="whitespace-pre-line text-sm text-slate-600">{c.content}</p>
							</div>
						</li>
					))}
				</ul>
			)}

			{/* Ô nhập phản biện nhanh (chỉ khi đã đăng nhập) */}
			{authed && (
				<form onSubmit={sendComment} className="mt-2.5 flex items-center gap-2 pl-3">
					<CornerDownRight className="h-4 w-4 shrink-0 text-slate-300" />
					<Avatar name={me?.name ?? "Bạn"} image={me?.image ?? null} size={24} />
					<input
						value={comment}
						onChange={(e) => setComment(e.target.value.slice(0, COMMENT_MAX))}
						placeholder="Viết phản biện lịch sự..."
						maxLength={COMMENT_MAX}
						className="h-9 flex-1 rounded-full border border-slate-200 bg-slate-50 px-3.5 text-sm text-slate-700 outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/15"
					/>
					<button
						type="submit"
						disabled={sending || !comment.trim()}
						aria-label="Gửi phản biện"
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition hover:bg-primary/90 disabled:opacity-40"
					>
						{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
					</button>
				</form>
			)}
			{err && <p className="mt-1 pl-3 text-xs text-rose-500">{err}</p>}
		</li>
	)
}
