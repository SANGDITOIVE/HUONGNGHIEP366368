// PHASE 3 — Panel "Cơ hội theo địa phương" gắn vào trang chi tiết ngành.
// Server Component (không dùng hook) — đọc trực tiếp dữ liệu tĩnh.
import { MapPinned, Building2, Landmark } from "lucide-react"
import { industriesForField } from "@/data/geo/fieldIndustryMap"
import { INDUSTRY_BY_TAG } from "@/data/geo/industries"
import { PROVINCE_BY_CODE } from "@/data/geo/provinces"
import { ZONE_KIND_LABEL } from "@/data/geo/economicZones"
import { demandByIndustry, zonesByIndustry } from "@/data/geo"

export function IndustryHotspots({ fieldId }: { fieldId: string }) {
	const tags = industriesForField(fieldId)
	if (tags.length === 0) return null

	return (
		<section className="rounded-2xl border bg-white p-5">
			<div className="flex items-center gap-2">
				<MapPinned className="h-5 w-5 text-primary" />
				<h2 className="font-heading text-xl font-bold">Cơ hội theo địa phương</h2>
			</div>
			<p className="mt-1 text-sm text-muted-foreground">
				Những tỉnh/thành và khu kinh tế đang có nhu cầu cao cho nhóm ngành liên quan. Xem toàn cảnh tại{" "}
				<a className="font-medium text-primary underline" href="/ban-do-nganh-nghe">bản đồ nghề nghiệp</a>.
			</p>
			<div className="mt-4 space-y-5">
				{tags.map((tag) => {
					const meta = INDUSTRY_BY_TAG[tag]
					if (!meta) return null
					const demand = demandByIndustry(tag)
						.slice()
						.sort((a, b) => b.demandScore - a.demandScore)
						.slice(0, 5)
					const zones = zonesByIndustry(tag).slice(0, 6)
					return (
						<div key={tag} className="rounded-xl border p-4">
							<div className="flex items-center gap-2">
								<span style={ { backgroundColor: meta.color } } className="inline-block h-3 w-3 rounded-full" />
								<h3 className="font-semibold">{meta.label}</h3>
							</div>
							{demand.length > 0 && (
								<div className="mt-3">
									<p className="text-xs font-medium uppercase tracking-wide text-slate-500">Tỉnh/thành nhu cầu cao</p>
									<div className="mt-2 space-y-1.5">
										{demand.map((d) => {
											const prov = PROVINCE_BY_CODE[d.provinceCode]
											return (
												<div key={d.provinceCode} className="flex items-center gap-2 text-sm">
													<span className="w-36 shrink-0 truncate">{prov?.name ?? d.provinceCode}</span>
													<div className="h-2 flex-1 rounded-full bg-slate-100">
														<div className="h-2 rounded-full" style={ { width: d.demandScore + "%", backgroundColor: meta.color } } />
													</div>
													<span className="w-10 text-right text-xs text-slate-500">{d.demandScore}</span>
												</div>
											)
										})}
									</div>
								</div>
							)}
							{zones.length > 0 && (
								<div className="mt-3">
									<p className="text-xs font-medium uppercase tracking-wide text-slate-500">Khu kinh tế · doanh nghiệp · cơ quan</p>
									<ul className="mt-2 space-y-1 text-sm">
										{zones.map((z) => (
											<li key={z.id} className="flex items-start gap-2">
												{z.kind === "co-quan-nha-nuoc" ? (
													<Landmark className="mt-0.5 h-4 w-4 text-slate-400" />
												) : (
													<Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
												)}
												<span>
													<span className="font-medium">{z.name}</span>
													<span className="text-slate-400"> · {ZONE_KIND_LABEL[z.kind]}</span>
													{z.orgs.length > 0 && <span className="block text-xs text-slate-500">{z.orgs.join(", ")}</span>}
												</span>
											</li>
										))}
									</ul>
								</div>
							)}
						</div>
					)
				})}
			</div>
		</section>
	)
}
