"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { ArrowBigDown, ArrowBigUp, Eye, Loader2, Send } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { authorLabel, timeAgo } from "@/components/community/survival/SurvivalTipCard"
import { ReportButton } from "@/components/community/ReportButton"
import { AnswerCard, type QAAnswer } from "@/components/community/qa/AnswerCard"
import { ReactionBar } from "@/components/community/social/ReactionBar"
import type { QAQuestion } from "@/components/community/qa/QuestionCard"

export function QuestionDetail({
	initialQuestion,
	initialAnswers,
}: {
	initialQuestion: QAQuestion
	initialAnswers: QAAnswer[]
}) {
	const { status } = useSession()
	const [q, setQ] = useState(initialQuestion)
	const [myVote, setMyVote] = useState(0)
	const [voteBusy, setVoteBusy] = useState(false)
	const [answers, setAnswers] = useState<QAAnswer[]>(initialAnswers)

	const [body, setBody] = useState("")
	const [anon, setAnon] = useState(false)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	async function voteQuestion(direction: "up" | "down") {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		if (voteBusy) return
		setVoteBusy(true)
		try {
			const res = await fetch(`/api/questions/${q.id}/vote`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ direction }),
			})
			const data = await res.json()
			if (res.ok && data.ok) {
				setQ((prev) => ({ ...prev, upvotes: data.question.upvotes, downvotes: data.question.downvotes, score: data.question.score }))
				setMyVote(data.myVote ?? 0)
			}
		} catch {
			/* ignore */
		} finally {
			setVoteBusy(false)
		}
	}

	async function submitAnswer() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		setError(null)
		if (body.trim().length < 2 || busy) return
		setBusy(true)
		try {
			const res = await fetch(`/api/questions/${q.id}/answers`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ body: body.trim(), isAnonymous: anon }),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) {
				setError("Không gửi được câu trả lời, thử lại sau.")
				return
			}
			setAnswers((prev) => [...prev, data.answer])
			setBody("")
		} catch {
			setError("Lỗi kết nối, thử lại sau.")
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="space-y-6">
			{/* Câu hỏi */}
			<article className="flex gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
				<div className="flex w-12 shrink-0 flex-col items-center gap-1">
					<button
						type="button"
						onClick={() => voteQuestion("up")}
						disabled={voteBusy}
						aria-label="Upvote"
						className={cn("rounded-md p-0.5 transition-colors disabled:opacity-50", myVote === 1 ? "text-accent" : "text-muted-foreground hover:text-accent")}
					>
						{voteBusy ? <Loader2 className="h-6 w-6 animate-spin" /> : <ArrowBigUp className="h-6 w-6" />}
					</button>
					<span className="text-lg font-bold text-foreground">{q.score}</span>
					<button
						type="button"
						onClick={() => voteQuestion("down")}
						disabled={voteBusy}
						aria-label="Downvote"
						className={cn("rounded-md p-0.5 transition-colors disabled:opacity-50", myVote === -1 ? "text-destructive" : "text-muted-foreground hover:text-destructive")}
					>
						<ArrowBigDown className="h-6 w-6" />
					</button>
				</div>

				<div className="min-w-0 flex-1">
					<h1 className="text-xl font-bold text-foreground">{q.title}</h1>
					<div className="mt-1 flex flex-wrap items-center gap-2">
						{q.status !== "visible" && <Badge variant="muted">Đang kiểm duyệt</Badge>}
						{q.tags.map((t) => (
							<Badge key={t} variant="accent">#{t}</Badge>
						))}
						<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
							<Eye className="h-3.5 w-3.5" /> {q.viewCount}
						</span>
					</div>
					<p className={cn("mt-3 whitespace-pre-wrap text-sm text-foreground", q.isHidden && "italic text-muted-foreground")}>{q.body}</p>
					<div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
						<span>{authorLabel(q.isAnonymous, q.authorName)} · {timeAgo(q.createdAt)}</span>
						<span className="ml-auto">
							<ReportButton targetType="question" targetId={q.id} />
						</span>
					</div>
					<div className="mt-3 border-t border-border pt-3">
						<ReactionBar targetType="question" targetId={q.id} />
					</div>
				</div>
			</article>

			{/* Câu trả lời */}
			<div>
				<h2 className="mb-3 text-lg font-semibold text-foreground">{answers.length} câu trả lời</h2>
				<div className="space-y-3">
					{answers.map((a) => (
						<AnswerCard key={a.id} answer={a} />
					))}
				</div>
			</div>

			{/* Form trả lời */}
			<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
				<h3 className="mb-3 text-base font-semibold text-foreground">Câu trả lời của bạn</h3>
				<textarea
					value={body}
					onChange={(e) => setBody(e.target.value)}
					rows={4}
					placeholder="Chia sẻ kinh nghiệm / câu trả lời của bạn..."
					className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
				/>
				<div className="mt-3 flex flex-wrap items-center justify-between gap-3">
					<label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
						<input type="checkbox" checked={anon} onChange={(e) => setAnon(e.target.checked)} className="h-4 w-4" />
						Đăng ẩn danh
					</label>
					<Button type="button" onClick={submitAnswer} disabled={busy || body.trim().length < 2} variant="accent">
						{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
						Gửi câu trả lời
					</Button>
				</div>
				{status !== "authenticated" && (
					<p className="mt-2 text-xs text-muted-foreground">Cần đăng nhập để trả lời (chống spam).</p>
				)}
				{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
			</div>
		</div>
	)
}
