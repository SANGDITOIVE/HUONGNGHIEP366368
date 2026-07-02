"use client"

import { useCallback, useEffect, useState } from "react"
import { Check, ExternalLink, MapPin, RefreshCw, ShieldX, X } from "lucide-react"

interface PendingSchool {
	id: number
	slug: string
	name: string
	code: string
	address: string
	website: string
	nganhTieuBieu: string
	region: string
	heDaoTao: string
	authorName: string
	createdAt: string
}

const REGION_LABEL: Record<string, string> = { bac: "Miền Bắc", trung: "Miền Trung", nam: "Miền Nam" }
const HE_LABEL: Record<string, string> = { "dai-hoc": "Đại học", "cao-dang": "Cao đẳng" }

// =============================================================
// NewSchoolsBoard — Phân khu "Duyệt Cơ Sở Đào Tạo Mới".
// Mỗi thẻ hiển thị dữ liệu trường + 3 nút: [Duyệt] / [Từ chối vì đã tồn tại] / [Từ chối].
// =============================================================
export function NewSchoolsBoard() {
	const [items, setItems] = useState<PendingSchool[]>([])
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState<string | null>(null)
	const [busyId, setBusyId] = useState<number | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		setError(null)
		try {
			const res = await fetch("/api/admin/universities", { cache: "no-store" })
			if (res.status === 403) {
				setError("Bạn không có quyền truy cập.")
				setItems([])
				return
			}
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.error || "FETCH_FAILED")
			setItems(data.items ?? [])
		} catch {
			setError("Không tải được danh sách trường chờ duyệt.")
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	async function act(id: number, action: "APPROVE" | "REJECT", reason?: string) {
		setBusyId(id)
		try {
			const res = await fetch(`/api/admin/universities/${id}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ action, reason }),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.error || "ACTION_FAILED")
			setItems((prev) => prev.filter((it) => it.id !== id))
		} catch {
			alert("Thao tác thất bại. Vui lòng thử lại.")
		} finally {
			setBusyId(null)
		}
	}

	if (loading) return <p className="py-10 text-center text-sm text-slate-400">Đang tải...</p>
	if (error) return <p className="py-10 text-center text-sm text-rose-500">{error}</p>

	return (
		<div className="space-y-4">
			<div className="flex items-center justify-between">
				<span className="text-sm text-slate-500">{items.length} cơ sở đào tạo đang chờ duyệt</span>
				<button type="button" onClick={load} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50">
					<RefreshCw className="h-3.5 w-3.5" /> Làm mới
				</button>
			</div>

			{items.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-12 text-center text-sm text-slate-400">
					🎉 Không có cơ sở đào tạo nào chờ duyệt.
				</div>
			) : (
				<ul className="space-y-3">
					{items.map((it) => (
						<li key={it.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
							<div className="flex flex-wrap items-center gap-2 text-xs">
								<span className="rounded-full bg-primary/10 px-2.5 py-0.5 font-mono font-medium text-primary">{it.code || "—"}</span>
								<span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-slate-600">{HE_LABEL[it.heDaoTao] ?? it.heDaoTao}</span>
								<span className="inline-flex items-center gap-0.5 text-slate-500"><MapPin className="h-3 w-3" /> {REGION_LABEL[it.region] ?? it.region}</span>
								<span className="text-slate-400">đề xuất bởi {it.authorName}</span>
							</div>

							<h4 className="mt-2 font-heading text-base font-bold text-slate-800">{it.name}</h4>
							<p className="mt-0.5 text-sm text-slate-600">{it.address}</p>
							{it.nganhTieuBieu && (
								<p className="mt-1 text-xs text-slate-500"><span className="font-medium text-slate-600">Ngành tiêu biểu:</span> {it.nganhTieuBieu}</p>
							)}
							<div className="mt-1.5 flex flex-wrap items-center gap-3 text-xs">
								{it.website && (
									<a href={it.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
										<ExternalLink className="h-3 w-3" /> {it.website}
									</a>
								)}
								<span className="text-slate-400">slug: /truong/{it.slug}</span>
							</div>

							<div className="mt-3 flex flex-wrap justify-end gap-2">
								<button
									type="button"
									disabled={busyId === it.id}
									onClick={() => act(it.id, "REJECT", "Đã tồn tại")}
									className="inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100 disabled:opacity-50"
								>
									<ShieldX className="h-4 w-4" /> Từ chối vì đã tồn tại
								</button>
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
									<Check className="h-4 w-4" /> {busyId === it.id ? "Đang xử lý..." : "Duyệt"}
								</button>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
