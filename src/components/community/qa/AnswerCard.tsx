"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { authorLabel, timeAgo } from "@/components/community/survival/SurvivalTipCard"
import { ReportButton } from "@/components/community/ReportButton"
import { ReactionBar } from "@/components/community/social/ReactionBar"
import { CommentThread } from "@/components/community/social/CommentThread"

export interface QAAnswer {
	id: number
	questionId: number
	body: string
	authorName: string | null
	isAnonymous: boolean
	upvotes: number
	downvotes: number
	score: number
	status: string
	isHidden: boolean
	createdAt: string
}

export function AnswerCard({ answer }: { answer: QAAnswer }) {
	const { status } = useSession()
	const [score, setScore] = useState(answer.score)
	const [myVote, setMyVote] = useState(0)
	const [busy, setBusy] = useState(false)

	async function vote(direction: "up" | "down") {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		if (busy) return
		setBusy(true)
		try {
			const res = await fetch(`/api/answers/${answer.id}/vote`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ direction }),
			})
			const data = await res.json()
			if (res.ok && data.ok) {
				setScore(data.answer.upvotes - data.answer.downvotes)
				setMyVote(data.myVote ?? 0)
			}
		} catch {
			/* ignore */
		} finally {
			setBusy(false)
		}
	}

	return (
		<article className="flex gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm">
			<div className="flex w-10 shrink-0 flex-col items-center gap-1">
				<button
					type="button"
					onClick={() => vote("up")}
					disabled={busy}
					aria-label="Upvote"
					className={cn("rounded-md p-0.5 transition-colors disabled:opacity-50", myVote === 1 ? "text-accent" : "text-muted-foreground hover:text-accent")}
				>
					{busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowBigUp className="h-5 w-5" />}
				</button>
				<span className="text-sm font-bold text-foreground">{score}</span>
				<button
					type="button"
					onClick={() => vote("down")}
					disabled={busy}
					aria-label="Downvote"
					className={cn("rounded-md p-0.5 transition-colors disabled:opacity-50", myVote === -1 ? "text-destructive" : "text-muted-foreground hover:text-destructive")}
				>
					<ArrowBigDown className="h-5 w-5" />
				</button>
			</div>

			<div className="min-w-0 flex-1">
				<div className="mb-1 flex flex-wrap items-center gap-2">
					<span className="text-sm font-semibold text-foreground">{authorLabel(answer.isAnonymous, answer.authorName)}</span>
					<span className="text-xs text-muted-foreground">{timeAgo(answer.createdAt)}</span>
					{answer.status !== "visible" && <Badge variant="muted">Đang kiểm duyệt</Badge>}
					<span className="ml-auto">
						<ReportButton targetType="answer" targetId={answer.id} />
					</span>
				</div>
				<p className={cn("whitespace-pre-wrap text-sm text-foreground", answer.isHidden && "italic text-muted-foreground")}>{answer.body}</p>
				<div className="mt-3 flex flex-wrap items-center gap-3 border-t border-border/60 pt-2">
					<ReactionBar targetType="answer" targetId={answer.id} />
				</div>
				<CommentThread answerId={answer.id} />
			</div>
		</article>
	)
}
