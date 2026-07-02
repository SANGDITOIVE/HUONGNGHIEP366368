"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import {
	ArrowBigUp,
	ExternalLink,
	Eye,
	Loader2,
	MessageSquare,
	MoreHorizontal,
	Trash2,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { timeAgo } from "@/components/community/survival/SurvivalTipCard"

interface MyQuestion {
	id: number
	title: string
	body: string
	tags: string[]
	viewCount: number
	answerCount: number
	score: number
	status: string
	isHidden: boolean
	isMine: boolean
	createdAt: string
}

// Nhãn trạng thái bài đăng hiển thị trong tab Cá nhân.
function StatusChip({ status }: { status: string }) {
	const map: Record<string, { label: string; cls: string }> = {
		visible: { label: "Đã đăng", cls: "bg-emerald-100 text-emerald-700" },
		pending_review: { label: "Chờ duyệt", cls: "bg-amber-100 text-amber-700" },
		removed: { label: "Đã gỡ", cls: "bg-slate-200 text-slate-600" },
	}
	const m = map[status] ?? map.visible
	return (
		<span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", m.cls)}>
			{m.label}
		</span>
	)
}

// =============================================================
// MyPostsTab — Tab "Bài & câu hỏi đã đăng" trong trang Cá nhân.
// Chỉ hiện bài của chính người dùng (API /api/questions/mine đã lọc theo tài khoản).
// Mỗi bài: bấm vào thân bài → mở trang chi tiết câu hỏi; nút "..." góc trên phải
// mở menu gồm "Mở trang câu hỏi" và "Xoá bài" (chỉ tác giả mới có, ở đây luôn đúng).
// =============================================================
export function MyPostsTab() {
	const { status } = useSession()
	const router = useRouter()
	const [items, setItems] = useState<MyQuestion[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (status !== "authenticated") {
			setItems([])
			return
		}
		let cancelled = false
		;(async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await fetch("/api/questions/mine", { cache: "no-store" })
				const data = await res.json()
				if (!res.ok || !data.ok) throw new Error("FETCH_FAILED")
				if (!cancelled) setItems(data.questions ?? [])
			} catch {
				if (!cancelled) setError("Không tải được bài đã đăng của bạn.")
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [status])

	if (status === "loading") {
		return <div className="py-16 text-center text-sm text-slate-400">Đang tải…</div>
	}

	if (status !== "authenticated") {
		return (
			<div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
				Đăng nhập để xem các bài & câu hỏi bạn đã đăng.
				<div className="mt-3">
					<button
						type="button"
						onClick={() => signIn("google")}
						className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
					>
						Đăng nhập với Google
					</button>
				</div>
			</div>
		)
	}

	return (
		<div>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-heading flex items-center gap-2 text-lg font-bold text-slate-800">
					<MessageSquare className="h-5 w-5 text-primary" /> Bài & câu hỏi đã đăng
					<span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-500">{items.length}</span>
				</h3>
				<a href="/hoi-dap/tao" className="text-sm font-medium text-primary hover:underline">+ Đặt câu hỏi</a>
			</div>
			{loading ? (
				<div className="py-10 text-center text-sm text-slate-400">Đang tải bài đã đăng…</div>
			) : error ? (
				<div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">{error}</div>
			) : items.length === 0 ? (
				<div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
					Bạn chưa đăng câu hỏi nào. Vào{" "}
					<a href="/hoi-dap/tao" className="font-medium text-primary underline">Đặt câu hỏi</a>{" "}
					để bắt đầu.
				</div>
			) : (
				<ul className="space-y-3">
					{items.map((q) => (
						<MyPostRow
							key={q.id}
							q={q}
							onOpen={() => router.push(`/hoi-dap/${q.id}`)}
							onDeleted={() => {
							setItems((prev) =>
								prev.map((x) =>
									x.id === q.id ? { ...x, status: "removed", isHidden: false } : x,
								),
							)
							router.refresh()
						}}
						/>
					))}
				</ul>
			)}
		</div>
	)
}

function MyPostRow({
	q,
	onOpen,
	onDeleted,
}: {
	q: MyQuestion
	onOpen: () => void
	onDeleted: () => void
}) {
	const [menuOpen, setMenuOpen] = useState(false)
	const [busy, setBusy] = useState(false)
	const wrapRef = useRef<HTMLDivElement>(null)

	useEffect(() => {
		if (!menuOpen) return
		function onDoc(e: MouseEvent) {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false)
		}
		document.addEventListener("mousedown", onDoc)
		return () => document.removeEventListener("mousedown", onDoc)
	}, [menuOpen])

	async function del() {
		if (busy) return
		if (typeof window !== "undefined" && !window.confirm("Xoá bài này? Người khác sẽ không còn thấy nữa.")) return
		setBusy(true)
		try {
			const res = await fetch(`/api/questions/${q.id}`, { method: "DELETE" })
			const data = await res.json().catch(() => ({}))
			if (res.ok && data.ok) {
				setMenuOpen(false)
				onDeleted()
				return
			}
		} catch {
			/* nuốt lỗi, mở lại nút */
		}
		setBusy(false)
		setMenuOpen(false)
	}

	return (
		<li className="relative flex gap-4 rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:border-primary/40">
			<div className="flex w-12 shrink-0 flex-col items-center justify-start gap-0.5 rounded-xl bg-muted/60 py-2 text-center">
				<ArrowBigUp className="h-5 w-5 text-accent" />
				<span className="text-base font-bold text-foreground">{q.score}</span>
				<span className="text-[10px] uppercase text-muted-foreground">điểm</span>
			</div>

			<button type="button" onClick={onOpen} className="min-w-0 flex-1 text-left">
				<h4 className="truncate pr-8 text-base font-semibold text-foreground hover:text-primary">{q.title}</h4>
				<p className={cn("mt-1 line-clamp-2 text-sm text-muted-foreground", q.isHidden && "italic")}>{q.body}</p>
				<div className="mt-2 flex flex-wrap items-center gap-2">
					<StatusChip status={q.status} />
					{q.tags.map((t) => (
						<Badge key={t} variant="accent">#{t}</Badge>
					))}
					<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
						<MessageSquare className="h-3.5 w-3.5" /> {q.answerCount} trả lời
					</span>
					<span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
						<Eye className="h-3.5 w-3.5" /> {q.viewCount}
					</span>
					<span className="ml-auto text-xs text-muted-foreground">{timeAgo(q.createdAt)}</span>
				</div>
			</button>

			<div ref={wrapRef} className="absolute right-3 top-3">
				<button
					type="button"
					aria-label="Tùy chọn bài đăng"
					onClick={() => setMenuOpen((v) => !v)}
					className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
				>
					<MoreHorizontal className="h-5 w-5" />
				</button>
				{menuOpen && (
					<div className="absolute right-0 z-20 mt-1 w-48 overflow-hidden rounded-xl border border-border bg-card py-1 shadow-lg">
						<button
							type="button"
							onClick={() => {
								setMenuOpen(false)
								onOpen()
							}}
							className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-foreground hover:bg-muted"
						>
							<ExternalLink className="h-4 w-4" /> Mở trang câu hỏi
						</button>
						{q.status !== "removed" && (
							<button
								type="button"
								onClick={del}
								disabled={busy}
								className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-50"
							>
								{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />} Xoá bài
							</button>
						)}
					</div>
				)}
			</div>
		</li>
	)
}
