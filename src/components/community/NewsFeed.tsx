"use client"

import Link from "next/link"
import { useEffect, useMemo, useState } from "react"
import { useSession } from "next-auth/react"
import {
	ArrowBigUp, MessageSquare, BookOpen, GraduationCap, Sparkles,
	Clock, PlusCircle, Loader2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { timeAgo } from "@/components/community/survival/SurvivalTipCard"
import { track, readLocalProfile } from "@/lib/personalization/tracker"
import { mergeProfiles, emptyProfile, type FeedItem, type InterestProfile } from "@/lib/personalization/interests"
import { rankFeed } from "@/lib/personalization/rank"

const KIND_META: Record<FeedItem["kind"], { label: string; icon: typeof MessageSquare }> = {
	question: { label: "Hỏi đáp", icon: MessageSquare },
	survival: { label: "Survival guide", icon: BookOpen },
	professor: { label: "Review giảng viên", icon: GraduationCap },
}

// Feed cộng đồng kiểu Reddit: mục "Đề xuất cho bạn" (cá nhân hoá) + "Mới nhất".
export function NewsFeed({ initial }: { initial: FeedItem[] }) {
	const { status } = useSession()
	const [items, setItems] = useState<FeedItem[]>(initial)
	const [profile, setProfile] = useState<InterestProfile>(emptyProfile())
	const [loadingFeed, setLoadingFeed] = useState(initial.length === 0)

	// Luôn nạp lại feed mới nhất từ server khi mount + mỗi khi quay lại tab.
	// Nhờ vậy bài đã bị XOÁ/ẩn (bởi tác giả hoặc admin) biến mất ngay, đồng bộ toàn site
	// (SSR `initial` chỉ dùng để hiển thị tức thì lần đầu).
	useEffect(() => {
		let alive = true
		const refresh = async () => {
			try {
				const res = await fetch("/api/feed", { cache: "no-store" })
				const data = await res.json()
				if (alive && res.ok && data.ok) setItems(data.items ?? [])
			} catch {
				/* ignore */
			} finally {
				if (alive) setLoadingFeed(false)
			}
		}
		refresh()
		const onFocus = () => refresh()
		window.addEventListener("focus", onFocus)
		return () => {
			alive = false
			window.removeEventListener("focus", onFocus)
		}
	}, [])

	// Gộp hồ sơ local + server (khi đăng nhập) để xếp lại feed.
	useEffect(() => {
		let alive = true
		const local = readLocalProfile()
		if (status !== "authenticated") {
			setProfile(local)
			return
		}
		;(async () => {
			try {
				const res = await fetch("/api/track")
				const data = await res.json()
				const server: InterestProfile = data?.profile ?? emptyProfile()
				if (alive) setProfile(mergeProfiles(local, server))
			} catch {
				if (alive) setProfile(local)
			}
		})()
		return () => {
			alive = false
		}
	}, [status])

	const { recommended, latest } = useMemo(() => rankFeed(items, profile), [items, profile])

	function onOpen(item: FeedItem) {
		if (item.schoolId) track("school", item.schoolId, 2)
		if (item.fieldId) track("field", item.fieldId, 2)
		for (const t of item.tags) track("tag", t, 1)
	}

	if (loadingFeed) {
		return (
			<div className="flex items-center justify-center py-16 text-muted-foreground">
				<Loader2 className="h-6 w-6 animate-spin" />
			</div>
		)
	}

	return (
		<div className="space-y-6">
			<div className="flex flex-wrap items-center gap-2">
				<Link
					href="/hoi-dap/tao"
					className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
				>
					<PlusCircle className="h-4 w-4" /> Đăng bài / Đặt câu hỏi
				</Link>
			</div>

			{recommended.length > 0 && (
				<section>
					<h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-primary">
						<Sparkles className="h-4 w-4" /> Đề xuất cho bạn
					</h2>
					<div className="space-y-3">
						{recommended.map((item) => (
							<FeedCard key={`rec-${item.kind}-${item.id}`} item={item} onOpen={onOpen} />
						))}
					</div>
				</section>
			)}

			<section>
				<h2 className="mb-3 flex items-center gap-1.5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
					<Clock className="h-4 w-4" /> Mới nhất từ cộng đồng
				</h2>
				{latest.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
						Chưa có bài đăng nào. Hãy là người đầu tiên chia sẻ!
					</div>
				) : (
					<div className="space-y-3">
						{latest.map((item) => (
							<FeedCard key={`${item.kind}-${item.id}`} item={item} onOpen={onOpen} />
						))}
					</div>
				)}
			</section>
		</div>
	)
}

function FeedCard({ item, onOpen }: { item: FeedItem; onOpen: (i: FeedItem) => void }) {
	const meta = KIND_META[item.kind]
	const Icon = meta.icon
	return (
		<article className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
			<div className="flex w-14 shrink-0 flex-col items-center justify-start gap-0.5 rounded-xl bg-muted/60 py-2 text-center">
				<ArrowBigUp className="h-5 w-5 text-accent" />
				<span className="text-base font-bold text-foreground">{item.score}</span>
				<span className="text-[10px] uppercase text-muted-foreground">điểm</span>
			</div>

			<div className="min-w-0 flex-1">
				<div className="mb-1 flex flex-wrap items-center gap-2">
					<Badge variant="accent" className="inline-flex items-center gap-1">
						<Icon className="h-3 w-3" /> {meta.label}
					</Badge>
					{item.schoolName && <Badge variant="muted">{item.schoolName}</Badge>}
				</div>
				<Link href={item.href} onClick={() => onOpen(item)} className="block">
					<h3 className="line-clamp-2 text-base font-semibold text-foreground hover:text-primary">{item.title}</h3>
				</Link>
				<p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{item.snippet}</p>

				<div className="mt-2 flex flex-wrap items-center gap-2">
					{item.tags.map((t) => (
						<Badge key={t} variant="accent">#{t}</Badge>
					))}
					{item.kind === "question" && item.extra?.answerCount != null && (
						<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
							<MessageSquare className="h-3.5 w-3.5" /> {item.extra.answerCount} trả lời
						</span>
					)}
					<span className="ml-auto text-xs text-muted-foreground">{timeAgo(item.createdAt)}</span>
				</div>
			</div>
		</article>
	)
}
