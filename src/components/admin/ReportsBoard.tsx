"use client"

import { useCallback, useEffect, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ExternalLink, Loader2, RotateCcw, Trash2, X } from "lucide-react"

type ReportItem = {
	targetType: string
	targetId: number
	reportCount: number
	lastAt: string | null
	snippet: string
	status: string | null
	link: string | null
}

const TYPE_LABEL: Record<string, string> = {
	question: "Câu hỏi",
	answer: "Câu trả lời",
	survival_tip: "Mẹo (Cẩm nang)",
	survival_reply: "Bình luận (Cẩm nang)",
}

export function ReportsBoard() {
	const [items, setItems] = useState<ReportItem[]>([])
	const [loading, setLoading] = useState(true)
	const [busyKey, setBusyKey] = useState<string | null>(null)
	const router = useRouter()

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch("/api/admin/reports", { cache: "no-store" })
			const data = await res.json()
			if (res.ok && data.ok) setItems(data.items ?? [])
		} catch {
			/* ignore */
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	async function act(it: ReportItem, action: "remove" | "restore" | "dismiss") {
		const key = `${it.targetType}:${it.targetId}`
		setBusyKey(key)
		try {
			const res = await fetch("/api/admin/reports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ targetType: it.targetType, targetId: it.targetId, action }),
			})
			const data = await res.json()
			if (res.ok && data.ok) {
				await load()
				// Đồng bộ toàn site: xoá cache router để feed/danh sách cộng đồng cập nhật.
				router.refresh()
			}
		} catch {
			/* ignore */
		} finally {
			setBusyKey(null)
		}
	}

	if (loading)
		return (
			<div className="flex justify-center py-8 text-slate-400">
				<Loader2 className="h-5 w-5 animate-spin" />
			</div>
		)

	if (items.length === 0)
		return (
			<p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
				Chưa có báo cáo nào. 🎉
			</p>
		)

	return (
		<div className="space-y-3">
			{items.map((it) => {
				const key = `${it.targetType}:${it.targetId}`
				const busy = busyKey === key
				return (
					<div key={key} className="rounded-xl border border-slate-200 bg-white p-4">
						<div className="flex flex-wrap items-center gap-2">
							<span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">{TYPE_LABEL[it.targetType] ?? it.targetType}</span>
							<span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs font-semibold text-rose-700">{it.reportCount} báo cáo</span>
							{it.status && it.status !== "visible" && (
								<span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">{it.status === "removed" ? "Đã ẩn/xoá" : "Đang kiểm duyệt"}</span>
							)}
						</div>
						<p className="mt-2 line-clamp-3 text-sm text-slate-700">{it.snippet || "(không có nội dung)"}</p>
						<div className="mt-3 flex flex-wrap items-center gap-2">
							{it.link && (
								<Link href={it.link} target="_blank" className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-primary hover:bg-slate-50">
									<ExternalLink className="h-3.5 w-3.5" /> Xem bài
								</Link>
							)}
							<button type="button" disabled={busy} onClick={() => act(it, "remove")} className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-rose-700 disabled:opacity-50">
								<Trash2 className="h-3.5 w-3.5" /> Ẩn/Xoá bài
							</button>
							<button type="button" disabled={busy} onClick={() => act(it, "restore")} className="inline-flex items-center gap-1 rounded-md border border-emerald-300 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-50 disabled:opacity-50">
								<RotateCcw className="h-3.5 w-3.5" /> Khôi phục
							</button>
							<button type="button" disabled={busy} onClick={() => act(it, "dismiss")} className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1 text-xs font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50">
								<X className="h-3.5 w-3.5" /> Bỏ qua báo cáo
							</button>
							{busy && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
						</div>
					</div>
				)
			})}
		</div>
	)
}
