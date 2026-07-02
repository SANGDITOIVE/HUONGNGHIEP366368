"use client"

import { useEffect, useRef, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Loader2, MessageCircle, Send, Trash2, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { authorLabel, timeAgo } from "@/components/community/survival/SurvivalTipCard"
import { ReactionBar } from "@/components/community/social/ReactionBar"

type Kind = "like" | "love" | "haha" | "wow" | "sad" | "angry"
interface Summary {
	counts: Record<Kind, number>
	total: number
	mine: Kind | null
}

export interface PublicComment {
	id: number
	answerId: number
	parentCommentId: number | null
	body: string
	authorName: string | null
	isAnonymous: boolean
	isMine: boolean
	isHidden: boolean
	status: string
	createdAt: string
	reactions: Summary
}

interface DirUser {
	id: string
	name: string
	email: string | null
}

export function CommentThread({ answerId }: { answerId: number }) {
	const { data: session, status } = useSession()
	const isAdmin = ((session?.user as { role?: string } | undefined)?.role ?? null) === "ADMIN" ||
		((session?.user as { role?: string } | undefined)?.role ?? null) === "SUPER_ADMIN"

	const [opened, setOpened] = useState(false)
	const [loaded, setLoaded] = useState(false)
	const [loading, setLoading] = useState(false)
	const [comments, setComments] = useState<PublicComment[]>([])

	const [text, setText] = useState("")
	const [anon, setAnon] = useState(false)
	const [busy, setBusy] = useState(false)
	const [replyTo, setReplyTo] = useState<{ id: number; name: string } | null>(null)

	// tag @
	const [mentions, setMentions] = useState<DirUser[]>([])
	const [suggest, setSuggest] = useState<DirUser[]>([])
	const [showSuggest, setShowSuggest] = useState(false)
	const suggestTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	async function load() {
		setLoading(true)
		try {
			const res = await fetch(`/api/answers/${answerId}/comments`)
			const d = await res.json()
			if (res.ok && d.ok) setComments(d.comments ?? [])
		} catch {
			/* ignore */
		} finally {
			setLoading(false)
			setLoaded(true)
		}
	}

	function toggleOpen() {
		const next = !opened
		setOpened(next)
		if (next && !loaded) load()
	}

	function onChangeText(value: string) {
		setText(value)
		const m = value.match(/@([^\s@]{1,})$/)
		if (!m) {
			setShowSuggest(false)
			return
		}
		const term = m[1]
		if (suggestTimer.current) clearTimeout(suggestTimer.current)
		suggestTimer.current = setTimeout(async () => {
			try {
				const res = await fetch(`/api/users/search?q=${encodeURIComponent(term)}`)
				const d = await res.json()
				if (d?.ok) {
					setSuggest(d.users ?? [])
					setShowSuggest((d.users ?? []).length > 0)
				}
			} catch {
				/* ignore */
			}
		}, 220)
	}

	function pickMention(u: DirUser) {
		setText((prev) => prev.replace(/@([^\s@]*)$/, `@${u.name} `))
		setMentions((prev) => (prev.some((x) => x.id === u.id) ? prev : [...prev, u]))
		setShowSuggest(false)
	}

	async function submit() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		const bodyText = text.trim()
		if (bodyText.length < 1 || busy) return
		setBusy(true)
		// chỉ gửi mention còn xuất hiện trong nội dung
		const usedMentions = mentions.filter((u) => bodyText.includes(`@${u.name}`)).map((u) => u.id)
		try {
			const res = await fetch(`/api/answers/${answerId}/comments`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					body: bodyText,
					isAnonymous: anon,
					parentCommentId: replyTo?.id ?? null,
					mentions: usedMentions,
				}),
			})
			const d = await res.json()
			if (res.ok && d.ok && d.comment) {
				setComments((prev) => [...prev, d.comment])
				setText("")
				setMentions([])
				setReplyTo(null)
			}
		} catch {
			/* ignore */
		} finally {
			setBusy(false)
		}
	}

	async function del(id: number) {
		if (typeof window !== "undefined" && !window.confirm("Xoá bình luận này?")) return
		try {
			const res = await fetch(`/api/comments/${id}`, { method: "DELETE" })
			if (res.ok) {
				setComments((prev) =>
					prev.map((c) => (c.id === id ? { ...c, isHidden: true, body: "[Đã xoá]", status: "removed" } : c)),
				)
			}
		} catch {
			/* ignore */
		}
	}

	function startReply(c: PublicComment) {
		setReplyTo({ id: c.parentCommentId ?? c.id, name: authorLabel(c.isAnonymous, c.authorName) })
	}

	const topLevel = comments.filter((c) => c.parentCommentId == null)
	const repliesOf = (id: number) => comments.filter((c) => c.parentCommentId === id)

	function renderComment(c: PublicComment, isReply: boolean) {
		return (
			<div key={c.id} className={cn("rounded-xl bg-muted/40 px-3 py-2", isReply && "ml-6 mt-2")}>
				<div className="flex flex-wrap items-center gap-2">
					<span className="text-xs font-semibold text-foreground">{authorLabel(c.isAnonymous, c.authorName)}</span>
					<span className="text-[11px] text-muted-foreground">{timeAgo(c.createdAt)}</span>
					{c.isMine || isAdmin ? (
						<button
							type="button"
							onClick={() => del(c.id)}
							className="ml-auto inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-destructive"
						>
							<Trash2 className="h-3 w-3" /> Xoá
						</button>
					) : null}
				</div>
				<p className={cn("mt-1 whitespace-pre-wrap text-sm text-foreground", c.isHidden && "italic text-muted-foreground")}>
					{c.body}
				</p>
				<div className="mt-1 flex flex-wrap items-center gap-3">
					<ReactionBar targetType="comment" targetId={c.id} initialSummary={c.reactions} />
					<button
						type="button"
						onClick={() => startReply(c)}
						className="text-xs font-semibold text-muted-foreground hover:text-accent"
					>
						Trả lời
					</button>
				</div>
			</div>
		)
	}

	return (
		<div className="mt-2">
			<button
				type="button"
				onClick={toggleOpen}
				className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground hover:text-accent"
			>
				<MessageCircle className="h-3.5 w-3.5" />
				{opened ? "Ẩn bình luận" : loaded ? `Bình luận (${comments.length})` : "Bình luận"}
			</button>

			{opened && (
				<div className="mt-2 space-y-2">
					{loading ? (
						<p className="flex items-center gap-2 text-xs text-muted-foreground">
							<Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang tải bình luận...
						</p>
					) : topLevel.length === 0 ? (
						<p className="text-xs text-muted-foreground">Chưa có bình luận. Hãy là người đầu tiên!</p>
					) : (
						topLevel.map((c) => (
							<div key={c.id}>
								{renderComment(c, false)}
								{repliesOf(c.id).map((r) => renderComment(r, true))}
							</div>
						))
					)}

					{/* Composer */}
					<div className="relative rounded-xl border border-border bg-card p-2">
						{replyTo && (
							<div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
								<span>Đang trả lời <b>{replyTo.name}</b></span>
								<button type="button" onClick={() => setReplyTo(null)} className="inline-flex items-center hover:text-destructive">
									<X className="h-3 w-3" />
								</button>
							</div>
						)}
						<textarea
							value={text}
							onChange={(e) => onChangeText(e.target.value)}
							rows={2}
							placeholder="Viết bình luận... (gõ @ để tag bạn bè)"
							className="w-full resize-none rounded-lg border border-input bg-background px-2 py-1.5 text-sm outline-none focus:border-primary"
						/>
						{showSuggest && suggest.length > 0 && (
							<div className="absolute left-2 right-2 z-30 mt-1 max-h-48 overflow-auto rounded-lg border border-border bg-card shadow-lg">
								{suggest.map((u) => (
									<button
										key={u.id}
										type="button"
										onClick={() => pickMention(u)}
										className="flex w-full flex-col items-start px-3 py-1.5 text-left hover:bg-muted"
									>
										<span className="text-sm font-semibold text-foreground">{u.name}</span>
										{u.email && <span className="text-[11px] text-muted-foreground">{u.email}</span>}
									</button>
								))}
							</div>
						)}
						<div className="mt-2 flex flex-wrap items-center justify-between gap-2">
							<label className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
								<input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="h-3.5 w-3.5" />
								Ẩn danh
							</label>
							<button
								type="button"
								onClick={submit}
								disabled={busy || text.trim().length < 1}
								className="inline-flex items-center gap-1 rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground disabled:opacity-50"
							>
								{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
								Gửi
							</button>
						</div>
						{status !== "authenticated" && (
							<p className="mt-1 text-[11px] text-muted-foreground">Cần đăng nhập để bình luận.</p>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
