"use client"

import { useCallback, useEffect, useState } from "react"
import { MessageSquare, RefreshCw, Star, UserRound } from "lucide-react"
import { INSTITUTIONS } from "@/components/InstitutionsTab"

interface ReviewItem {
	type: "review"
	id: number
	universityId: string
	authorName: string
	authorImage: string | null
	rating: number
	content: string
	createdAt: string
}
interface CommentItem {
	type: "comment"
	id: number
	reviewId: number
	universityId: string
	authorName: string
	authorImage: string | null
	content: string
	createdAt: string
}
type FeedItem = ReviewItem | CommentItem

function timeAgo(iso: string): string {
	try {
		const diff = Date.now() - new Date(iso).getTime()
		const m = Math.floor(diff / 60000)
		if (m < 1) return "vừa xong"
		if (m < 60) return `${m} phút trước`
		const h = Math.floor(m / 60)
		if (h < 24) return `${h} giờ trước`
		const d = Math.floor(h / 24)
		return `${d} ngày trước`
	} catch {
		return ""
	}
}

function Avatar({ name, image }: { name: string; image: string | null }) {
	if (image) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={image} alt={name} className="h-8 w-8 rounded-full object-cover" referrerPolicy="no-referrer" />
	}
	return (
		<span className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-slate-500">
			<UserRound className="h-4 w-4" />
		</span>
	)
}

// =============================================================
// Phân khu 2: Theo Dõi Hoạt Động (Activity Feed)
// Gộp review + comment, mới nhất lên trước, để admin kiểm soát nội dung.
// =============================================================
export function ActivityFeed() {
	const [feed, setFeed] = useState<FeedItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)

	const nameOf = (id: string) => INSTITUTIONS.find((s) => s.id === id)?.name ?? id

	const load = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch("/api/admin/activity", { cache: "no-store" })
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.error || "FETCH_FAILED")
			setFeed(data.feed ?? [])
		} catch {
			setError("Không tải được luồng hoạt động.")
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	return (
		<div className="space-y-3">
			<div className="flex items-center justify-between">
				<span className="text-sm text-slate-500">{feed.length} hoạt động gần đây</span>
				<button
					type="button"
					onClick={load}
					className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
				>
					<RefreshCw className="h-3.5 w-3.5" /> Làm mới
				</button>
			</div>

			{loading ? (
				<p className="py-8 text-center text-sm text-slate-400">Đang tải...</p>
			) : error ? (
				<p className="py-8 text-center text-sm text-rose-500">{error}</p>
			) : feed.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-400">
					Chưa có hoạt động nào.
				</div>
			) : (
				<ul className="space-y-2.5">
					{feed.map((it) => (
						<li
							key={`${it.type}-${it.id}`}
							className="flex items-start gap-3 rounded-xl border border-slate-200 bg-white p-3"
						>
							<Avatar name={it.authorName} image={it.authorImage} />
							<div className="min-w-0 flex-1">
								<div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
									<span className="text-sm font-semibold text-slate-700">{it.authorName}</span>
									{it.type === "review" ? (
										<span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-600">
											<Star className="h-3 w-3 fill-amber-400 text-amber-400" /> {it.rating}★ đánh giá
										</span>
									) : (
										<span className="inline-flex items-center gap-1 rounded-full bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-600">
											<MessageSquare className="h-3 w-3" /> phản biện
										</span>
									)}
									<span className="text-xs text-slate-400">· {nameOf(it.universityId)}</span>
									<span className="text-xs text-slate-300">· {timeAgo(it.createdAt)}</span>
								</div>
								<p className="mt-0.5 whitespace-pre-line text-sm text-slate-600">{it.content}</p>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
