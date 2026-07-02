"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useSession } from "next-auth/react"
import {
	Bell,
	CheckCheck,
	GraduationCap,
	Hash,
	Heart,
	MessageCircle,
	MessageSquare,
	ShieldAlert,
	Sparkles,
	ThumbsUp,
	AtSign,
} from "lucide-react"
import { cn } from "@/lib/utils"

type Noti = {
	id: number
	type: string
	title: string
	body: string | null
	link: string | null
	actorName: string | null
	isRead: boolean
	createdAt: string
}

function iconFor(type: string) {
	switch (type) {
		case "answer_on_question":
			return <MessageSquare className="h-4 w-4 text-primary" />
		case "comment_on_answer":
		case "reply_on_comment":
			return <MessageCircle className="h-4 w-4 text-sky-500" />
		case "reaction":
			return <ThumbsUp className="h-4 w-4 text-rose-500" />
		case "mention":
			return <AtSign className="h-4 w-4 text-violet-500" />
		case "test_result":
			return <Sparkles className="h-4 w-4 text-amber-500" />
		case "hashtag_post":
			return <Hash className="h-4 w-4 text-emerald-500" />
		case "favorite_school_post":
			return <Heart className="h-4 w-4 text-rose-500" />
		case "admin_report":
			return <ShieldAlert className="h-4 w-4 text-amber-600" />
		case "question_posted":
			return <GraduationCap className="h-4 w-4 text-primary" />
		default:
			return <Bell className="h-4 w-4 text-muted-foreground" />
	}
}

function timeAgo(iso: string): string {
	const then = new Date(iso).getTime()
	if (Number.isNaN(then)) return ""
	const diff = Math.max(0, Date.now() - then)
	const m = Math.floor(diff / 60000)
	if (m < 1) return "vừa xong"
	if (m < 60) return `${m} phút trước`
	const h = Math.floor(m / 60)
	if (h < 24) return `${h} giờ trước`
	const d = Math.floor(h / 24)
	if (d < 30) return `${d} ngày trước`
	return new Date(iso).toLocaleDateString("vi-VN")
}

export function NotificationBell({ className }: { className?: string }) {
	const { status } = useSession()
	const [open, setOpen] = useState(false)
	const [items, setItems] = useState<Noti[]>([])
	const [unread, setUnread] = useState(0)
	const [loading, setLoading] = useState(false)
	const wrapRef = useRef<HTMLDivElement>(null)

	const load = useCallback(async () => {
		if (status !== "authenticated") return
		try {
			const res = await fetch("/api/notifications", { cache: "no-store" })
			if (!res.ok) return
			const data = await res.json()
			setItems(Array.isArray(data.notifications) ? data.notifications : [])
			setUnread(Number(data.unread ?? 0))
		} catch {
			/* im lặng */
		}
	}, [status])

	// Nạp lần đầu + poll mỗi 60s khi đã đăng nhập.
	useEffect(() => {
		if (status !== "authenticated") return
		load()
		const t = setInterval(load, 60000)
		return () => clearInterval(t)
	}, [status, load])

	// Đóng panel khi bấm ra ngoài.
	useEffect(() => {
		if (!open) return
		const onDoc = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", onDoc)
		return () => document.removeEventListener("mousedown", onDoc)
	}, [open])

	async function toggle() {
		const next = !open
		setOpen(next)
		if (next) {
			setLoading(true)
			await load()
			setLoading(false)
		}
	}

	async function markAll() {
		setUnread(0)
		setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
		try {
			await fetch("/api/notifications", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action: "mark_all_read" }),
			})
		} catch {
			/* im lặng */
		}
	}

	async function onItemClick(n: Noti) {
		if (!n.isRead) {
			setUnread((u) => Math.max(0, u - 1))
			setItems((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)))
			try {
				await fetch(`/api/notifications/${n.id}`, { method: "POST" })
			} catch {
				/* im lặng */
			}
		}
		setOpen(false)
	}

	if (status !== "authenticated") return null

	return (
		<div ref={wrapRef} className={cn("relative", className)}>
			<button
				type="button"
				onClick={toggle}
				aria-label="Thông báo"
				className="relative flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			>
				<Bell className="h-5 w-5" />
				{unread > 0 && (
					<span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-bold text-accent-foreground">
						{unread > 99 ? "99+" : unread}
					</span>
				)}
			</button>

			{open && (
				<div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-border bg-card shadow-xl">
					<div className="flex items-center justify-between border-b border-border px-4 py-2.5">
						<span className="text-sm font-semibold text-foreground">Thông báo</span>
						{unread > 0 && (
							<button
								type="button"
								onClick={markAll}
								className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
							>
								<CheckCheck className="h-3.5 w-3.5" /> Đánh dấu đã đọc
							</button>
						)}
					</div>
					<div className="max-h-[70vh] overflow-y-auto">
						{loading && items.length === 0 ? (
							<p className="px-4 py-6 text-center text-sm text-muted-foreground">Đang tải…</p>
						) : items.length === 0 ? (
							<p className="px-4 py-8 text-center text-sm text-muted-foreground">Chưa có thông báo nào.</p>
						) : (
							<ul className="divide-y divide-border">
								{items.map((n) => {
									const inner = (
										<div className="flex gap-3">
											<span className="mt-0.5 shrink-0">{iconFor(n.type)}</span>
											<div className="min-w-0">
												<p className="text-sm text-foreground">{n.title}</p>
												{n.body && <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.body}</p>}
												<p className="mt-0.5 text-[11px] text-muted-foreground">{timeAgo(n.createdAt)}</p>
											</div>
											{!n.isRead && <span className="ml-auto mt-1 h-2 w-2 shrink-0 rounded-full bg-accent" />}
										</div>
									)
									return (
										<li key={n.id} className={cn(!n.isRead && "bg-primary/5")}>
											{n.link ? (
												<Link href={n.link} onClick={() => onItemClick(n)} className="block px-4 py-3 hover:bg-muted/60">
													{inner}
												</Link>
											) : (
												<button type="button" onClick={() => onItemClick(n)} className="block w-full px-4 py-3 text-left hover:bg-muted/60">
													{inner}
												</button>
											)}
										</li>
									)
								})}
							</ul>
						)}
					</div>
				</div>
			)}
		</div>
	)
}
