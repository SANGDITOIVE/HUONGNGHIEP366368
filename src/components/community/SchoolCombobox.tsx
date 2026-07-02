"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { ChevronsUpDown, Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type SchoolOpt = { id: string; name: string }
type Extra = { value: string; label: string }

// Bỏ dấu tiếng Việt để tìm kiếm dễ chịu (lọc theo code point, không dùng escape).
function norm(input: string): string {
	const d = (input ?? "").normalize("NFD")
	let out = ""
	for (const ch of d) {
		const c = ch.codePointAt(0) ?? 0
		if (c >= 0x300 && c <= 0x36f) continue
		out += ch
	}
	return out.replace(/đ/g, "d").replace(/Đ/g, "D").toLowerCase()
}

// Ô chọn trường CÓ THANH SEARCH: gõ tên trường để lọc nhanh trong ~200 trường.
export function SchoolCombobox({
	schools,
	value,
	onChange,
	placeholder = "Chọn trường…",
	extraOptions = [],
	className,
}: {
	schools: SchoolOpt[]
	value: string
	onChange: (value: string) => void
	placeholder?: string
	extraOptions?: Extra[]
	className?: string
}) {
	const [open, setOpen] = useState(false)
	const [query, setQuery] = useState("")
	const wrapRef = useRef<HTMLDivElement>(null)

	const currentLabel = useMemo(() => {
		const ex = extraOptions.find((o) => o.value === value)
		if (ex) return ex.label
		const s = schools.find((x) => x.id === value)
		return s ? s.name : ""
	}, [value, schools, extraOptions])

	const results = useMemo(() => {
		const q = norm(query.trim())
		const exs = extraOptions.filter((o) => !q || norm(o.label).includes(q))
		const sch = schools
			.filter((s) => !q || norm(s.name).includes(q))
			.slice(0, 40)
			.map((s) => ({ value: s.id, label: s.name }))
		return [...exs, ...sch]
	}, [query, schools, extraOptions])

	useEffect(() => {
		if (!open) return
		const onDoc = (e: MouseEvent) => {
			if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", onDoc)
		return () => document.removeEventListener("mousedown", onDoc)
	}, [open])

	function pick(v: string) {
		onChange(v)
		setOpen(false)
		setQuery("")
	}

	return (
		<div ref={wrapRef} className={cn("relative", className)}>
			<button
				type="button"
				onClick={() => {
					setOpen((o) => !o)
					setQuery("")
				}}
				className="flex w-full items-center justify-between gap-2 rounded-lg border border-input bg-background px-3 py-2 text-left text-sm outline-none focus:border-primary"
			>
				<span className={cn("truncate", !currentLabel && "text-muted-foreground")}>{currentLabel || placeholder}</span>
				<ChevronsUpDown className="h-4 w-4 shrink-0 text-muted-foreground" />
			</button>

			{open && (
				<div className="absolute z-30 mt-1 w-full min-w-[240px] rounded-lg border border-border bg-card shadow-lg">
					<div className="flex items-center gap-1 border-b border-border px-2 py-1.5">
						<Search className="h-4 w-4 text-muted-foreground" />
						<input
							autoFocus
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Gõ tên trường…"
							className="w-full bg-transparent py-1 text-sm outline-none"
						/>
						{query && (
							<button type="button" onClick={() => setQuery("")} aria-label="Xoá">
								<X className="h-4 w-4 text-muted-foreground" />
							</button>
						)}
					</div>
					<ul className="max-h-64 overflow-y-auto py-1">
						{results.length === 0 ? (
							<li className="px-3 py-2 text-sm text-muted-foreground">Không tìm thấy trường</li>
						) : (
							results.map((o) => (
								<li key={o.value || "__empty__"}>
									<button
										type="button"
										onClick={() => pick(o.value)}
										className={cn(
											"block w-full truncate px-3 py-2 text-left text-sm hover:bg-muted",
										o.value === value && "bg-muted font-medium text-primary",
									)}
									>
										{o.label}
									</button>
								</li>
							))
						)}
					</ul>
				</div>
			)}
		</div>
	)
}
