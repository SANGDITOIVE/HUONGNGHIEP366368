"use client"

// =============================================================
// PHASE 3 — Bản đồ cơ hội nghề nghiệp (Leaflet + OpenStreetMap).
// KHÔNG dùng Google Maps. Component này CHỈ chạy client (qua dynamic ssr:false).
// Dữ liệu lấy từ cache useRegions() — không fetch lại server.
// =============================================================

import "leaflet/dist/leaflet.css"
import { useMemo, useState } from "react"
import { MapContainer, TileLayer, CircleMarker, Popup, Tooltip } from "react-leaflet"
import Link from "next/link"
import { useRegions } from "@/lib/geo/regionsCache"
import { INDUSTRY_BY_TAG, type IndustryTag } from "@/data/geo/industries"
import { ZONE_KIND_LABEL } from "@/data/geo/economicZones"
import { UNIVERSITIES } from "@/data/universities"
import { provinceForCity } from "@/lib/geo/geocodeUniversity"
import { CATEGORY_INDUSTRY_MAP } from "@/data/geo/fieldIndustryMap"
import { GROUP_CATEGORIES } from "@/data/majorGroups"

const VN_CENTER: [number, number] = [16.2, 108.2]
const OSM_URL = "https://tile.openstreetmap.org/" + "{z}/{x}/{y}.png"

export function CareerMap() {
	const { data, loading, error } = useRegions()
	const [active, setActive] = useState<IndustryTag | null>(null)
	const [activeCat, setActiveCat] = useState<string | null>(null)
	const [showUnis, setShowUnis] = useState(true)

	const industries = data?.industries ?? []
	const provinces = data?.provinces ?? []
	const zones = data?.zones ?? []

	// Trường ĐH geocode về tỉnh (một lần).
	const uniPins = useMemo(() => {
		return UNIVERSITIES.map((u) => {
			const p = provinceForCity(u.city)
			if (!p) return null
			return { u, lat: p.lat, lng: p.lng }
		}).filter((x): x is { u: (typeof UNIVERSITIES)[number]; lat: number; lng: number } => x !== null)
	}, [])

	if (loading) {
		return <div className="flex h-[70vh] items-center justify-center text-sm text-slate-500">Đang tải bản đồ…</div>
	}
	if (error) {
		return <div className="flex h-[70vh] items-center justify-center text-sm text-rose-600">Không tải được dữ liệu bản đồ: {error}</div>
	}

	const activeTags: IndustryTag[] | null = active ? [active] : activeCat ? ((CATEGORY_INDUSTRY_MAP[activeCat] as IndustryTag[] | undefined) ?? []) : null
	const matchProvince = (focus: IndustryTag[]) => (activeTags ? focus.some((f) => activeTags.includes(f)) : true)
	const matchZone = (inds: IndustryTag[]) => (activeTags ? inds.some((i) => activeTags.includes(i)) : true)

	return (
		<div className="grid gap-4 lg:grid-cols-[260px_1fr]">
			{/* Bảng chọn ngành */}
			<aside className="space-y-3">
				<div className="rounded-xl border bg-white p-3">
					<p className="mb-2 text-sm font-semibold">Lọc theo ngành kinh tế</p>
					<div className="flex flex-wrap gap-1.5">
						<button
							onClick={() => { setActive(null); setActiveCat(null) }}
							className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${active === null && activeCat === null ? "border-slate-800 bg-slate-800 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
						>
							Tất cả
						</button>
						{industries.map((ind) => {
							const selected = ind.tag === active
							const style = selected
								? { backgroundColor: ind.color, borderColor: ind.color, color: "#ffffff" }
								: { borderColor: ind.color, color: ind.color }
							return (
								<button
									key={ind.tag}
									onClick={() => { setActiveCat(null); setActive(selected ? null : ind.tag) }}
									style={style}
									className="rounded-full border px-2.5 py-1 text-xs font-medium transition hover:opacity-80"
									title={ind.blurb}
								>
									{ind.short}
								</button>
							)
						})}
					</div>
					<label className="mt-3 flex items-center gap-2 text-xs text-slate-600">
						<input type="checkbox" checked={showUnis} onChange={(e) => setShowUnis(e.target.checked)} />
						Hiện điểm trường đại học
					</label>
				</div>
<div className="rounded-xl border bg-white p-3">
					<p className="mb-1 text-sm font-semibold">Lĩnh vực ngành học</p>
					<p className="mb-2 text-[11px] leading-snug text-slate-500">Tham khảo bảng tổng quát ngành. Chọn một lĩnh vực để xem các tỉnh/khu vực có ngành liên quan.</p>
					<div className="flex flex-wrap gap-1.5">
						{GROUP_CATEGORIES.map((c) => {
							const selectedCat = c.id === activeCat
							return (
								<button
									key={c.id}
									onClick={() => { setActive(null); setActiveCat(selectedCat ? null : c.id) }}
									className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${selectedCat ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
								>
									{c.label}
								</button>
							)
						})}
					</div>
				</div>
				<div className="rounded-xl border bg-white p-3 text-xs text-slate-500">
					<p className="mb-2 font-semibold text-slate-700">Chú giải</p>
					<ul className="space-y-1.5">
						<li className="flex items-center gap-2">
							<span className="inline-block h-3 w-3 shrink-0 rounded-full" style={ { backgroundColor: "#6366f1" } } />
							Chấm lớn = tỉnh/thành (màu theo ngành chủ đạo)
						</li>
						<li className="flex items-center gap-2">
							<span className="inline-block h-2.5 w-2.5 shrink-0 rotate-45 bg-slate-900" />
							Khu kinh tế / doanh nghiệp / cơ quan nhà nước
						</li>
						<li className="flex items-center gap-2">
							<span className="inline-block h-3 w-3 shrink-0 rounded-full border" style={ { backgroundColor: "#3b82f6", borderColor: "#1d4ed8" } } />
							Trường đại học (vị trí tương đối theo tỉnh)
						</li>
					</ul>
				</div>
			</aside>

			{/* Bản đồ */}
			<div className="h-[72vh] overflow-hidden rounded-xl border">
				<MapContainer center={VN_CENTER} zoom={5} scrollWheelZoom className="h-full w-full">
					<TileLayer
						attribution='&copy; OpenStreetMap contributors'
						url={OSM_URL}
					/>

					{/* Tỉnh/thành */}
					{provinces.map((p) => {
						const dominant = p.economicFocus[0]
						const color = dominant ? INDUSTRY_BY_TAG[dominant]?.color ?? "#64748b" : "#64748b"
						const on = matchProvince(p.economicFocus)
						return (
							<CircleMarker
								key={p.code}
								center={[p.lat, p.lng]}
								radius={on ? 9 : 4}
								pathOptions={ { color: color, fillColor: color, fillOpacity: on ? 0.7 : 0.15, weight: on ? 2 : 1, opacity: on ? 0.9 : 0.3 } }
							>
								<Tooltip direction="top">{p.name}</Tooltip>
								<Popup>
									<div className="text-sm">
										<p className="font-semibold">{p.name}</p>
										<p className="mt-1 text-xs text-slate-600">Ngành chủ đạo:</p>
										<div className="mt-1 flex flex-wrap gap-1">
											{p.economicFocus.map((t) => (
												<span key={t} style={ { backgroundColor: INDUSTRY_BY_TAG[t]?.color ?? "#64748b" } } className="rounded px-1.5 py-0.5 text-[11px] text-white">
													{INDUSTRY_BY_TAG[t]?.short ?? t}
												</span>
											))}
										</div>
									</div>
								</Popup>
							</CircleMarker>
						)
					})}

					{/* Khu kinh tế / doanh nghiệp / cơ quan / biển đảo */}
					{zones.map((z) => {
						const on = matchZone(z.industries)
						const color = z.industries[0] ? INDUSTRY_BY_TAG[z.industries[0]]?.color ?? "#0f172a" : "#0f172a"
						return (
							<CircleMarker
								key={z.id}
								center={[z.lat, z.lng]}
								radius={on ? 8 : 3}
								pathOptions={ { color: "#0f172a", fillColor: color, fillOpacity: on ? 0.9 : 0.2, weight: on ? 2 : 1, opacity: on ? 1 : 0.3 } }
							>
								<Tooltip direction="top">{z.name}</Tooltip>
								<Popup>
									<div className="text-sm">
										<p className="font-semibold">{z.name}</p>
										<p className="text-xs text-slate-500">{ZONE_KIND_LABEL[z.kind]}</p>
										<p className="mt-1 text-xs text-slate-600">{z.note}</p>
										{z.orgs.length > 0 && (
											<p className="mt-1 text-xs"><span className="font-medium">Tiêu biểu: </span>{z.orgs.join(", ")}</p>
										)}
										<div className="mt-1 flex flex-wrap gap-1">
											{z.industries.map((t) => (
												<span key={t} style={ { backgroundColor: INDUSTRY_BY_TAG[t]?.color ?? "#64748b" } } className="rounded px-1.5 py-0.5 text-[11px] text-white">
													{INDUSTRY_BY_TAG[t]?.short ?? t}
												</span>
											))}
										</div>
									</div>
								</Popup>
							</CircleMarker>
						)
					})}

					{/* Trường đại học */}
					{showUnis &&
						uniPins.map(({ u, lat, lng }, idx) => (
							<CircleMarker
								key={u.id + "-" + idx}
								center={[lat + ((idx % 5) - 2) * 0.05, lng + ((idx % 7) - 3) * 0.05]}
								radius={4}
								pathOptions={ { color: "#1d4ed8", fillColor: "#3b82f6", fillOpacity: 0.85, weight: 1 } }
							>
								<Popup>
									<div className="text-sm">
										<p className="font-semibold">{u.name}</p>
										<p className="text-xs text-slate-500">{u.city} · {u.type === "cong-lap" ? "Công lập" : "Tư thục"}</p>
										<div className="mt-1 flex gap-2">
											<Link href="/noi-dao-tao" className="text-xs font-medium text-primary underline">Xem nơi đào tạo</Link>
											{u.website && (
												<a href={u.website} target="_blank" rel="noreferrer" className="text-xs font-medium text-primary underline">Website</a>
											)}
										</div>
									</div>
								</Popup>
							</CircleMarker>
						))}
				</MapContainer>
			</div>
		</div>
	)
}
