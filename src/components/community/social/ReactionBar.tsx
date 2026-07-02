"use client"

import { useEffect, useRef, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { cn } from "@/lib/utils"

type Kind = "like" | "love" | "haha" | "wow" | "sad" | "angry"

interface Summary {
	counts: Record<Kind, number>
	total: number
	mine: Kind | null
}

const REACTIONS: { kind: Kind; emoji: string; label: string }[] = [
	{ kind: "like", emoji: "👍", label: "Thích" },
	{ kind: "love", emoji: "❤️", label: "Yêu" },
	{ kind: "haha", emoji: "😂", label: "Haha" },
	{ kind: "wow", emoji: "😮", label: "Wow" },
	{ kind: "sad", emoji: "😢", label: "Buồn" },
	{ kind: "angry", emoji: "😠", label: "Phẫn nộ" },
]

const EMPTY: Summary = { counts: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }, total: 0, mine: null }

export function ReactionBar({
	targetType,
	targetId,
	initialSummary,
}: {
	targetType: "question" | "answer" | "comment"
	targetId: number
	initialSummary?: Summary
}) {
	const { status } = useSession()
	const [summary, setSummary] = useState<Summary>(initialSummary ?? EMPTY)
	const [open, setOpen] = useState(false)
	const [busy, setBusy] = useState(false)
	const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	useEffect(() => {
		if (initialSummary) return
		let active = true
		fetch(`/api/reactions?targetType=${targetType}&targetId=${targetId}`)
			.then((r) => r.json())
			.then((d) => {
				if (active && d?.ok && d.summary) setSummary(d.summary)
			})
			.catch(() => {})
		return () => {
			active = false
		}
	}, [targetType, targetId, initialSummary])

	async function react(kind: Kind) {
		setOpen(false)
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		if (busy) return
		setBusy(true)
		try {
			const res = await fetch("/api/reactions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ targetType, targetId, reaction: kind }),
			})
			const d = await res.json()
			if (res.ok && d.ok && d.summary) setSummary(d.summary)
		} catch {
			/* ignore */
		} finally {
			setBusy(false)
		}
	}

	function openNow() {
		if (closeTimer.current) clearTimeout(closeTimer.current)
		setOpen(true)
	}
	function closeSoon() {
		closeTimer.current = setTimeout(() => setOpen(false), 250)
	}

	const mine = summary.mine ? REACTIONS.find((r) => r.kind === summary.mine) ?? null : null
	const present = REACTIONS.filter((r) => (summary.counts[r.kind] ?? 0) > 0)

	return (
		<div className="relative inline-flex items-center gap-2" onMouseLeave={closeSoon}>
			<div className="relative" onMouseEnter={openNow}>
				{open && (
					<div
						className="absolute bottom-full left-0 z-30 mb-1 flex items-center gap-1 rounded-full border border-border bg-card px-2 py-1 shadow-lg"
						onMouseEnter={openNow}
					>
						{REACTIONS.map((r) => (
							<button
								key={r.kind}
								type="button"
								title={r.label}
								aria-label={r.label}
								onClick={() => react(r.kind)}
								className={cn(
									"text-xl leading-none transition-transform hover:scale-125",
								summary.mine === r.kind && "scale-110",
							)}
							>
								<span aria-hidden>{r.emoji}</span>
							</button>
						))}
					</div>
				)}
				<button
					type="button"
					onClick={() => react(mine?.kind ?? "like")}
					disabled={busy}
					className={cn(
						"inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold transition-colors disabled:opacity-50",
						mine ? "text-accent" : "text-muted-foreground hover:text-accent",
					)}
				>
					<span aria-hidden className="text-base leading-none">
						{mine ? mine.emoji : "👍"}
					</span>
					<span>{mine ? mine.label : "Thích"}</span>
				</button>
			</div>
			{summary.total > 0 && (
				<span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
					{present.slice(0, 3).map((r) => (
						<span key={r.kind} aria-hidden>
							{r.emoji}
						</span>
					))}
					<span className="ml-1">{summary.total}</span>
				</span>
			)}
		</div>
	)
}
