"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Loader2, MessageSquare, Send, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { categoryLabel } from "@/lib/community/survivalCategories"
import { ReportButton } from "@/components/community/ReportButton"

export interface SurvivalTip {
	id: number
	schoolId: string
	category: string
	content: string
	authorName: string | null
	isAnonymous: boolean
	upvotes: number
	trustScore: number
	status: string
	isHidden: boolean
	replyCount: number
	createdAt: string
}

export interface SurvivalReply {
	id: number
	tipId: number
	content: string
	authorName: string | null
	isAnonymous: boolean
	status: string
	isHidden: boolean
	createdAt: string
}

export function authorLabel(isAnonymous: boolean, authorName: string | null): string {
	if (isAnonymous) return authorName ? `Sinh viên ẩn danh · ${authorName}` : "Sinh viên ẩn danh"
	return authorName ?? "Người dùng"
}

export function timeAgo(iso: string): string {
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

export function SurvivalTipCard({ tip }: { tip: SurvivalTip }) {
	const { status } = useSession()
	const [up, setUp] = useState(tip.upvotes)
	const [myVote, setMyVote] = useState(0)
	const [busy, setBusy] = useState(false)

	const [showReplies, setShowReplies] = useState(false)
	const [replies, setReplies] = useState<SurvivalReply[]>([])
	const [loadedReplies, setLoadedReplies] = useState(false)
	const [replyText, setReplyText] = useState("")
	const [replyAnon, setReplyAnon] = useState(false)
	const [replyBusy, setReplyBusy] = useState(false)
	const [count, setCount] = useState(tip.replyCount)

	async function vote() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		if (busy) return
		setBusy(true)
		try {
			const res = await fetch(`/api/survival-tips/${tip.id}/vote`, { method: "POST" })
			const data = await res.json()
			if (res.ok && data.ok) {
				setUp(data.tip.upvotes)
				setMyVote(data.myVote ?? 0)
			}
		} catch {
			/* bỏ qua lỗi mạng */
		} finally {
			setBusy(false)
		}
	}

	async function toggleReplies() {
		const next = !showReplies
		setShowReplies(next)
		if (next && !loadedReplies) {
			try {
				const res = await fetch(`/api/survival-tips/${tip.id}/reply`)
				const data = await res.json()
				if (res.ok && data.ok) setReplies(data.replies ?? [])
			} catch {
				/* ignore */
			} finally {
				setLoadedReplies(true)
			}
		}
	}

	async function sendReply() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		const text = replyText.trim()
		if (text.length < 2 || replyBusy) return
		setReplyBusy(true)
		try {
			const res = await fetch(`/api/survival-tips/${tip.id}/reply`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ content: text, isAnonymous: replyAnon }),
			})
			const data = await res.json()
			if (res.ok && data.ok) {
				setReplies((prev) => [...prev, data.reply])
				setCount((c) => c + 1)
				setReplyText("")
			}
		} catch {
			/* ignore */
		} finally {
			setReplyBusy(false)
		}
	}

	return (
		<article className="rounded-2xl border border-border bg-card p-5 shadow-sm">
			<div className="mb-2 flex flex-wrap items-center gap-2">
				<Badge variant="default">{categoryLabel(tip.category)}</Badge>
				<span className="text-sm font-semibold text-foreground">{authorLabel(tip.isAnonymous, tip.authorName)}</span>
				<span className="text-xs text-muted-foreground">{timeAgo(tip.createdAt)}</span>
				{tip.status !== "visible" && (
					<Badge variant="muted">Đang kiểm duyệt</Badge>
				)}
			</div>

			<p className={cn("whitespace-pre-wrap text-sm text-foreground", tip.isHidden && "italic text-muted-foreground")}>
				{tip.content}
			</p>

			<div className="mt-4 flex flex-wrap items-center gap-2">
				<button
					type="button"
					onClick={vote}
					disabled={busy}
					className={cn(
						"inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-colors disabled:opacity-50",
						myVote === 1 ? "border-accent bg-accent/10 text-accent" : "border-border text-muted-foreground hover:bg-muted",
					)}
				>
					{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
					Hữu ích {up}
				</button>
				<button
					type="button"
					onClick={toggleReplies}
					className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
				>
					<MessageSquare className="h-4 w-4" />
					Trả lời {count > 0 ? `(${count})` : ""}
				</button>
				<span className="ml-auto">
					<ReportButton targetType="survival_tip" targetId={tip.id} />
				</span>
			</div>

			{showReplies && (
				<div className="mt-4 space-y-3 border-t border-border pt-4">
					{replies.map((r) => (
						<div key={r.id} className="rounded-xl bg-muted/50 p-3">
							<div className="mb-1 flex flex-wrap items-center gap-2">
								<span className="text-xs font-semibold text-foreground">{authorLabel(r.isAnonymous, r.authorName)}</span>
								<span className="text-xs text-muted-foreground">{timeAgo(r.createdAt)}</span>
								<span className="ml-auto">
									<ReportButton targetType="survival_reply" targetId={r.id} />
								</span>
							</div>
							<p className={cn("whitespace-pre-wrap text-sm text-foreground", r.isHidden && "italic text-muted-foreground")}>{r.content}</p>
						</div>
					))}
					{loadedReplies && replies.length === 0 && (
						<p className="text-sm text-muted-foreground">Chưa có trả lời nào.</p>
					)}

					<div className="rounded-xl border border-border bg-background p-3">
						<textarea
							value={replyText}
							onChange={(e) => setReplyText(e.target.value)}
							rows={2}
							placeholder="Viết trả lời..."
							className="w-full resize-none rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
						/>
						<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
							<label className="inline-flex items-center gap-2 text-xs text-muted-foreground">
								<input type="checkbox" checked={replyAnon} onChange={(e) => setReplyAnon(e.target.checked)} className="h-4 w-4" />
								Ẩn danh
							</label>
							<button
								type="button"
								onClick={sendReply}
								disabled={replyBusy || replyText.trim().length < 2}
								className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-50"
							>
								{replyBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
								Gửi
							</button>
						</div>
						{status !== "authenticated" && (
							<p className="mt-2 text-xs text-muted-foreground">Cần đăng nhập để trả lời (chống spam).</p>
						)}
					</div>
				</div>
			)}
		</article>
	)
}
