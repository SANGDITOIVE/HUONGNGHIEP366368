"use client"

import { useMemo, useState } from "react"
import {
	Search,
	X,
	MapPin,
	Building2,
	GraduationCap,
	Sparkles,
	Wallet,
	Target,
	ChevronDown,
} from "lucide-react"
import {
	SCHOOL_DIRECTORY,
	SCHOOL_GROUPS,
	type SchoolProfile,
} from "@/data/schoolDirectory"

// Bỏ dấu để tìm kiếm không dấu.
function strip(s: string): string {
	return s
		.replace(/đ/g, "d")
		.replace(/Đ/g, "D")
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.toLowerCase()
}

const REGION_LABEL: Record<string, string> = {
	bac: "Miền Bắc",
	trung: "Miền Trung",
	nam: "Miền Nam",
}

const TYPE_LABEL: Record<string, string> = {
	"dai-hoc": "Đại học",
	"hoc-vien": "Học viện",
	"cao-dang": "Cao đẳng",
}

type RegionFilter = "all" | "bac" | "trung" | "nam" | "unknown"

const REGION_FILTERS: { id: RegionFilter; label: string }[] = [
	{ id: "all", label: "Tất cả vùng" },
	{ id: "bac", label: "Miền Bắc" },
	{ id: "trung", label: "Miền Trung" },
	{ id: "nam", label: "Miền Nam" },
	{ id: "unknown", label: "Chưa rõ vùng" },
]

function SchoolModal({
	school,
	onClose,
}: {
	school: SchoolProfile
	onClose: () => void
}) {
	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
			role="dialog"
			aria-modal="true"
			onClick={onClose}
		>
			<div
				className="max-h-[88vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:rounded-2xl"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="mb-3 flex items-start justify-between gap-3">
					<div>
						<h3 className="font-heading text-lg font-bold text-slate-800">{school.name}</h3>
						<div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
							<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
								<Building2 className="h-3 w-3" /> {school.loaiHinhRaw}
							</span>
							{school.region && (
								<span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">
									<MapPin className="h-3 w-3" /> {REGION_LABEL[school.region]}
								</span>
							)}
							<span className="rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-500">{school.group}</span>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						className="shrink-0 rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
						aria-label="Đóng"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="space-y-3 text-sm">
					<div className="rounded-lg bg-slate-50 p-3 text-slate-600">{school.intro}</div>

					<div>
						<p className="mb-1 flex items-center gap-1 font-semibold text-slate-700">
							<Sparkles className="h-4 w-4 text-amber-500" /> Ngành mạnh
						</p>
						<p className="text-slate-600">{school.strongMajors}</p>
					</div>

					<div>
						<p className="mb-1 flex items-center gap-1 font-semibold text-slate-700">
							<GraduationCap className="h-4 w-4 text-emerald-600" /> Tuyển sinh & đầu vào
						</p>
						<p className="text-slate-600">{school.admission}</p>
					</div>

					<div>
						<p className="mb-1 flex items-center gap-1 font-semibold text-slate-700">
							<Wallet className="h-4 w-4 text-slate-400" /> Học phí / Hỗ trợ
						</p>
						<p className="text-slate-600">{school.tuition}</p>
					</div>

					<div>
						<p className="mb-1 flex items-center gap-1 font-semibold text-slate-700">
							<Target className="h-4 w-4 text-rose-500" /> Đầu ra / Phù hợp với ai
						</p>
						<p className="text-slate-600">{school.output}</p>
					</div>
				</div>
			</div>
		</div>
	)
}

export function SchoolDirectorySection() {
	const [query, setQuery] = useState("")
	const [region, setRegion] = useState<RegionFilter>("all")
	const [selected, setSelected] = useState<SchoolProfile | null>(null)

	const filtered = useMemo(() => {
		const q = strip(query.trim())
		return SCHOOL_DIRECTORY.filter((s) => {
			if (region === "unknown" && s.region !== null) return false
			if (region !== "all" && region !== "unknown" && s.region !== region) return false
			if (!q) return true
			return (
				strip(s.name).includes(q) ||
				strip(s.strongMajors).includes(q) ||
				strip(s.group).includes(q)
			)
		})
	}, [query, region])

	const grouped = useMemo(() => {
		return SCHOOL_GROUPS.map((g) => ({
			group: g,
			schools: filtered.filter((s) => s.group === g),
		})).filter((x) => x.schools.length > 0)
	}, [filtered])

	return (
		<section className="mt-12">
			<div className="mb-4">
				<h2 className="font-heading text-xl font-bold text-slate-800">
					📒 Danh bạ đầy đủ cơ sở đào tạo
				</h2>
				<p className="mt-1 text-sm text-slate-500">
					{SCHOOL_DIRECTORY.length} trường được gom theo 10 nhóm lĩnh vực. Bấm vào tên trường để xem định vị, ngành mạnh, tuyển sinh, học phí và đầu ra.
				</p>
			</div>

			<div className="mb-4 space-y-3">
				<div className="relative">
					<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
					<input
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Tìm theo tên trường hoặc ngành mạnh (không dấu cũng được)…"
						className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-9 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
					/>
					{query && (
						<button
							type="button"
							onClick={() => setQuery("")}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							aria-label="Xóa tìm kiếm"
						>
							<X className="h-4 w-4" />
						</button>
					)}
				</div>
				<div className="flex flex-wrap gap-2">
					{REGION_FILTERS.map((r) => (
						<button
							key={r.id}
							type="button"
							onClick={() => setRegion(r.id)}
							className={
								"rounded-full border px-3 py-1 text-xs font-medium transition-colors " +
								(region === r.id
									? "border-primary bg-primary text-white"
									: "border-slate-200 bg-white text-slate-500 hover:border-primary/40")
							}
						>
							{r.label}
						</button>
					))}
				</div>
			</div>

			<p className="mb-3 text-xs text-slate-400">Tìm thấy {filtered.length} trường</p>

			{grouped.length === 0 && (
				<p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-400">
					Không có trường nào khớp bộ lọc.
				</p>
			)}

			<div className="space-y-3">
				{grouped.map(({ group, schools }) => (
					<details key={group} className="group overflow-hidden rounded-xl border border-slate-200 bg-white" open={query.trim().length > 0 || region !== "all"}>
						<summary className="flex cursor-pointer list-none items-center justify-between gap-2 bg-slate-50 px-4 py-3 font-heading font-semibold text-slate-700">
							<span>{group}</span>
							<span className="flex items-center gap-2">
								<span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{schools.length} trường</span>
								<ChevronDown className="h-4 w-4 text-slate-400 transition-transform group-open:rotate-180" />
							</span>
						</summary>
						<div className="overflow-x-auto">
							<table className="w-full text-left text-sm">
								<thead>
									<tr className="border-t border-slate-100 text-xs uppercase tracking-wide text-slate-400">
										<th className="px-4 py-2 font-medium">Tên trường</th>
										<th className="px-4 py-2 font-medium">Loại hình</th>
										<th className="hidden px-4 py-2 font-medium sm:table-cell">Ngành mạnh</th>
									</tr>
								</thead>
								<tbody>
									{schools.map((s) => (
										<tr
											key={s.id}
											onClick={() => setSelected(s)}
											className="cursor-pointer border-t border-slate-100 transition-colors hover:bg-primary/5"
										>
											<td className="px-4 py-2.5 font-medium text-slate-700">{s.name}</td>
											<td className="px-4 py-2.5 text-slate-500">{s.loaiHinhRaw}</td>
											<td className="hidden px-4 py-2.5 text-slate-500 sm:table-cell">{s.strongMajors}</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</details>
				))}
			</div>

			{selected && <SchoolModal school={selected} onClose={() => setSelected(null)} />}
		</section>
	)
}
