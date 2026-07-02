"use client"

import Link from "next/link"
import { ArrowBigUp, Eye, MessageSquare } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { authorLabel, timeAgo } from "@/components/community/survival/SurvivalTipCard"

export interface QAQuestion {
	id: number
	schoolId: string | null
	title: string
	body: string
	tags: string[]
	authorName: string | null
	isAnonymous: boolean
	viewCount: number
	upvotes: number
	downvotes: number
	score: number
	status: string
	isHidden: boolean
	answerCount: number
	createdAt: string
}

export function QuestionCard({ question }: { question: QAQuestion }) {
	return (
		<article className="flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
			<div className="flex w-14 shrink-0 flex-col items-center justify-start gap-0.5 rounded-xl bg-muted/60 py-2 text-center">
				<ArrowBigUp className="h-5 w-5 text-accent" />
				<span className="text-base font-bold text-foreground">{question.score}</span>
				<span className="text-[10px] uppercase text-muted-foreground">điểm</span>
			</div>

			<div className="min-w-0 flex-1">
				<Link href={`/hoi-dap/${question.id}`} className="block">
					<h3 className="truncate text-base font-semibold text-foreground hover:text-primary">{question.title}</h3>
				</Link>
				<p className={cn("mt-1 line-clamp-2 text-sm text-muted-foreground", question.isHidden && "italic")}>{question.body}</p>

				<div className="mt-2 flex flex-wrap items-center gap-2">
					{question.status !== "visible" && <Badge variant="muted">Đang kiểm duyệt</Badge>}
					{question.tags.map((t) => (
						<Badge key={t} variant="accent">#{t}</Badge>
					))}
					<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
						<MessageSquare className="h-3.5 w-3.5" /> {question.answerCount} trả lời
					</span>
					<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
						<Eye className="h-3.5 w-3.5" /> {question.viewCount}
					</span>
					<span className="ml-auto text-xs text-muted-foreground">
						{authorLabel(question.isAnonymous, question.authorName)} · {timeAgo(question.createdAt)}
					</span>
				</div>
			</div>
		</article>
	)
}
