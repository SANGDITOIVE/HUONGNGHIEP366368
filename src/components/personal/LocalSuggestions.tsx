"use client"

// =============================================================
// PHASE 4 — Widget gợi ý ngành & lĩnh vực "hot" tại địa phương của người dùng.
// Đọc /api/suggestions (server tự lấy tỉnh trong hồ sơ) rồi hiển thị:
//  - Ngành kinh tế đang có nhu cầu nhân lực cao tại tỉnh.
//  - Lĩnh vực ngành học phù hợp để theo đuổi.
//  - Khu kinh tế / cơ quan tuyển dụng tại địa phương.
// =============================================================
import { useEffect, useState } from "react"
import Link from "next/link"
import { Sparkles, MapPin, TrendingUp, Loader2, Building2 } from "lucide-react"

interface IndustryItem {
	tag: string
	label: string
	short: string
	color: string
	demandScore: number
	jobOpenings: number
}
interface FieldItem {
	id: string
	name: string
	icon?: string
}
interface ZoneItem {
	id: string
	name: string
	kind: string
	orgs?: string[]
}
interface SuggestionsPayload {
	ok: boolean
	loggedIn: boolean
	province: { code: string; name: string } | null
	industries: IndustryItem[]
	fields: FieldItem[]
	zones: ZoneItem[]
}

export function LocalSuggestions() {
	const [data, setData] = useState<SuggestionsPayload | null>(null)
	const [loading, setLoading] = useState(true)

	useEffect(() => {
		let alive = true
		fetch("/api/suggestions")
			.then((r) => (r.ok ? r.json() : null))
			.then((d) => {
				if (alive) setData(d as SuggestionsPayload)
			})
			.catch(() => {})
			.finally(() => alive && setLoading(false))
		return () => {
			alive = false
		}
	}, [])

	return (
		<div className="rounded-xl border bg-white p-4">
			<div className="flex items-center gap-2 text-sm font-semibold">
				<Sparkles className="h-4 w-4 text-primary" /> Gợi ý theo địa phương
			</div>

			{loading ? (
				<div className="mt-3 flex items-center gap-2 text-sm text-slate-400">
					<Loader2 className="h-4 w-4 animate-spin" /> Đang tải gợi ý…
				</div>
			) : !data || !data.loggedIn ? (
				<p className="mt-2 text-sm text-slate-500">
					Đăng nhập và chọn tỉnh/thành để nhận gợi ý ngành nghề ngay tại địa phương của bạn.
				</p>
			) : !data.province ? (
				<p className="mt-2 text-sm text-slate-500">
					Hãy chọn tỉnh/thành ở ô bên cạnh để HoaTieu gợi ý ngành đang "khát" nhân lực gần bạn.
				</p>
			) : (
				<div className="mt-3 space-y-4">
					<div className="flex items-center gap-1.5 text-xs text-slate-500">
						<MapPin className="h-3.5 w-3.5 text-primary" /> Dựa trên thế mạnh kinh tế tại{" "}
						<span className="font-medium text-slate-700">{data.province.name}</span>
					</div>

					{data.industries.length > 0 && (
						<div>
							<div className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
								<TrendingUp className="h-3.5 w-3.5" /> Ngành đang cần nhân lực
							</div>
							<ul className="space-y-1.5">
								{data.industries.slice(0, 5).map((ind) => (
									<li key={ind.tag} className="flex items-center gap-2 text-sm">
										<span
											className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
											style={ { backgroundColor: ind.color } }
										/>
										<span className="flex-1 text-slate-700">{ind.label}</span>
										<span className="text-xs font-medium text-slate-400">{ind.demandScore}/100</span>
									</li>
								))}
							</ul>
						</div>
					)}

					{data.fields.length > 0 && (
						<div>
							<div className="mb-1.5 text-xs font-semibold text-slate-600">Lĩnh vực ngành học nên cân nhắc</div>
							<div className="flex flex-wrap gap-1.5">
								{data.fields.map((f) => (
									<Link
										key={f.id}
										href={`/nganh-hoc?field=${f.id}`}
										className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs text-slate-700 hover:border-primary hover:text-primary"
									>
										{f.name}
									</Link>
								))}
							</div>
						</div>
					)}

					{data.zones.length > 0 && (
						<div>
							<div className="mb-1.5 flex items-center gap-1 text-xs font-semibold text-slate-600">
								<Building2 className="h-3.5 w-3.5" /> Khu kinh tế / nơi tuyển dụng gần bạn
							</div>
							<ul className="space-y-1 text-sm text-slate-700">
								{data.zones.slice(0, 4).map((z) => (
									<li key={z.id}>• {z.name}</li>
								))}
							</ul>
						</div>
					)}

					<Link
						href="/ban-do-nganh-nghe"
						className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
					>
						Xem trên bản đồ nghề nghiệp →
					</Link>
				</div>
			)}
		</div>
	)
}
