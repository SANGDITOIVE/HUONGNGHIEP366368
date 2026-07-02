"use client"

import { useCallback, useEffect, useState } from "react"
import { ArrowRight, Check, RefreshCw, X } from "lucide-react"
import { contributionFieldLabel } from "@/lib/community/constants"

interface PendingItem {
	id: number
	universityId: string
	authorName: string
	fieldName: string
	oldValue: string | null
	newValue: string
	status: string
	createdAt: string
}

// =============================================================
// ContributionsBoard — CLIENT COMPONENT.
// Hiển thị danh sách đóng góp PENDING dưới dạng thẻ, mỗi thẻ có 2 nút
// 1-click: [Phê duyệt] (xanh) và [Từ chối] (đỏ) — gọi PUT /api/admin/...
// =============================================================
export function ContributionsBoard() {
	const [items, setItems] = useState<PendingItem[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [busyId, setBusyId] = useState<number | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch("/api/admin/contributions", { cache: "no-store" })
			if (res.status === 403) {
				setError("Bạn không có quyền truy cập.")
				setItems([])
				return
			}
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.error || "FETCH_FAILED")
			setItems(data.items ?? [])
		} catch {
			setError("Không tải được danh sách đóng góp.")
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	async function act(id: number, action: "APPROVE" | "REJECT") {
		setBusyId(id)
		try {
			const res = await fetch(`/api/admin/contributions/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action }),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.error || "ACTION_FAILED")
			// Xóa khỏi danh sách sau khi xử lý thành công
			setItems((prev) => prev.filter((it) => it.id !== id))
		} catch {
			alert("Thao tác thất bại. Vui lòng thử lại.")
		} finally {
			setBusyId(null)
		}
	}

	if (loading) {
		return <p className="py-10 text-center text-sm text-slate-400">Đang tải...</p>
	}
	if (error) {
		return <p className="py-10 text-center text-sm text-rose-500">{error}</p>
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<span className="text-sm text-slate-500">
					{items.length} đóng góp đang chờ duyệt
				</span>
				<button
					type="button"
					onClick={load}
					className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
				>
					<RefreshCw className="h-3.5 w-3.5" /> Làm mới
				</button>
			</div>

			{items.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-sm text-slate-400">
					🎉 Không còn đóng góp nào chờ duyệt.
				</div>
			) : (
				<ul className="space-y-3">
					{items.map((it) => (
						<li key={it.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							<div className="flex flex-wrap items-center gap-2 text-xs">
								<span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-medium text-primary">
									{it.universityId}
								</span>
								<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">
									Mục: {contributionFieldLabel(it.fieldName)}
								</span>
								<span className="text-slate-400">đóng góp bởi {it.authorName}</span>
							</div>

							<div className="mt-3 grid gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-stretch">
								<div className="rounded-lg bg-rose-50/60 p-2.5 text-sm text-slate-500">
									<p className="mb-1 text-[11px] font-semibold uppercase text-rose-400">Nội dung cũ</p>
									{it.oldValue ? it.oldValue : <span className="italic text-slate-400">(Thêm mới hoàn toàn)</span>}
								</div>
								<div className="flex items-center justify-center text-slate-300">
									<ArrowRight className="h-5 w-5" />
								</div>
								<div className="rounded-lg bg-emerald-50/60 p-2.5 text-sm text-slate-700">
									<p className="mb-1 text-[11px] font-semibold uppercase text-emerald-500">Nội dung đề xuất</p>
									{it.newValue}
								</div>
							</div>

							<div className="mt-3 flex justify-end gap-2">
								<button
									type="button"
									disabled={busyId === it.id}
									onClick={() => act(it.id, "REJECT")}
									className="inline-flex items-center gap-1.5 rounded-lg bg-rose-500 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-rose-600 disabled:opacity-50"
								>
									<X className="h-4 w-4" /> Từ chối
								</button>
								<button
									type="button"
									disabled={busyId === it.id}
									onClick={() => act(it.id, "APPROVE")}
									className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50"
								>
									<Check className="h-4 w-4" /> {busyId === it.id ? "Đang xử lý..." : "Phê duyệt"}
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
