"use client"

// =============================================================
// PHASE 2 — Dropdown chọn Tỉnh/Thành render TỨC THÌ từ cache client.
// Dùng useRegions() (LocalStorage) nên KHÔNG fetch lại server mỗi lần mở.
// =============================================================

import { useMemo } from "react"
import { useRegions } from "@/lib/geo/regionsCache"

const REGION_GROUP: Record<string, string> = {
	bac: "Miền Bắc",
	trung: "Miền Trung",
	nam: "Miền Nam",
}

export interface RegionSelectProps {
	value: string | null
	onChange: (provinceCode: string | null) => void
	id?: string
	className?: string
	placeholder?: string
	disabled?: boolean
}

export function RegionSelect({
	value,
	onChange,
	id,
	className,
	placeholder = "— Chọn tỉnh/thành —",
	disabled,
}: RegionSelectProps) {
	const { data, loading } = useRegions()

	const grouped = useMemo(() => {
		const provinces = data?.provinces ?? []
		const groups: Record<string, { code: string; name: string }[]> = { bac: [], trung: [], nam: [] }
		for (const p of provinces) {
			;(groups[p.region] ??= []).push({ code: p.code, name: p.name })
		}
		for (const k of Object.keys(groups)) {
			groups[k].sort((a, b) => a.name.localeCompare(b.name, "vi"))
		}
		return groups
	}, [data])

	return (
		<select
			id={id}
			value={value ?? ""}
			disabled={disabled || loading}
			onChange={(e) => onChange(e.target.value || null)}
			className={
				className ??
				"h-10 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
			}
		>
			<option value="">{loading ? "Đang tải danh mục…" : placeholder}</option>
			{(["bac", "trung", "nam"] as const).map((rk) =>
				grouped[rk] && grouped[rk].length > 0 ? (
					<optgroup key={rk} label={REGION_GROUP[rk]}>
						{grouped[rk].map((p) => (
							<option key={p.code} value={p.code}>
								{p.name}
							</option>
						))}
					</optgroup>
				) : null,
			)}
		</select>
	)
}
