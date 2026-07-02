"use client"

// =============================================================
// PHASE 4 — Bảng phân tích "quan tâm theo vùng" cho admin.
// Đọc /api/admin/analytics: mỗi tỉnh -> lĩnh vực được quan tâm nhất + %.
// =============================================================
import { useEffect, useState } from "react"
import { BarChart3, Loader2, MapPin } from "lucide-react"

interface TopField {
	fieldId: string
	fieldName: string
	count: number
	percent: number
}
interface ProvinceStat {
	provinceCode: string
	provinceName: string
	total: number
	topFields: TopField[]
}
interface AnalyticsPayload {
	ok: boolean
	totalResponses: number
	matchedResponses: number
	provinces: ProvinceStat[]
}

export function RegionalAnalytics() {
	const [data, setData] = useState<AnalyticsPayload | null>(null)
	const [loading, setLoading] = useState(true)
	const [error, setError] = useState(false)

	useEffect(() => {
		let alive = true
		fetch("/api/admin/analytics")
			.then((r) => (r.ok ? r.json() : Promise.reject(new Error("err"))))
			.then((d) => alive && setData(d as AnalyticsPayload))
			.catch(() => alive && setError(true))
			.finally(() => alive && setLoading(false))
		return () => {
			alive = false
		}
	}, [])

	if (loading) {
		return (
			<div className="flex items-center gap-2 text-sm text-slate-400">
				<Loader2 className="h-4 w-4 animate-spin" /> Đang tổng hợp số liệu…
			</div>
		)
	}
	if (error || !data) {
		return <p className="text-sm text-rose-600">Không tải được số liệu thống kê.</p>
	}

	return (
		<div className="space-y-5">
			<div className="flex flex-wrap items-center gap-4 rounded-xl border bg-white p-4">
				<div className="flex items-center gap-2 text-sm font-semibold">
					<BarChart3 className="h-4 w-4 text-primary" /> Quan tâm theo vùng
				</div>
				<div className="text-xs text-slate-500">
					Tổng phiếu khảo sát: <span className="font-medium text-slate-700">{data.totalResponses}</span> · Gán được vào tỉnh:{" "}
					<span className="font-medium text-slate-700">{data.matchedResponses}</span>
				</div>
			</div>

			{data.provinces.length === 0 ? (
				<p className="text-sm text-slate-500">Chưa có dữ liệu khảo sát gắn được với tỉnh/thành nào.</p>
			) : (
				<div className="grid gap-4 md:grid-cols-2">
					{data.provinces.map((p) => (
						<div key={p.provinceCode} className="rounded-xl border bg-white p-4">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
									<MapPin className="h-4 w-4 text-primary" /> {p.provinceName}
								</div>
								<span className="text-xs text-slate-400">{p.total} học sinh</span>
							</div>
							<ul className="mt-3 space-y-2">
								{p.topFields.map((f) => (
									<li key={f.fieldId}>
										<div className="flex items-center justify-between text-xs">
											<span className="text-slate-700">{f.fieldName}</span>
											<span className="font-medium text-slate-500">
												{f.percent}% ({f.count})
											</span>
										</div>
										<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
											<div
												className="h-full rounded-full bg-primary"
												style={ { width: `${f.percent}%` } }
											/>
										</div>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			)}
		</div>
	)
}
