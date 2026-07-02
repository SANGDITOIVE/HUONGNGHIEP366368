"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { BookOpen, GraduationCap, MessageCircle, Search, X } from "lucide-react"

type School = { id: string; name: string }

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

// Trang chọn trường (Review giảng viên / Cẩm nang / Hỏi đáp) CÓ THANH SEARCH.
export function SchoolCommunityPicker({ schools }: { schools: School[] }) {
	const [q, setQ] = useState("")
	const filtered = useMemo(() => {
		const n = norm(q.trim())
		if (!n) return schools
		return schools.filter((s) => norm(s.name).includes(n))
	}, [q, schools])

	return (
		<div>
			<div className="relative mb-4">
				<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
				<input
					value={q}
					onChange={(e) => setQ(e.target.value)}
					placeholder="Tìm tên trường (VD: Bách khoa, Kinh tế, Cần Thơ)…"
					className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-9 text-sm outline-none focus:border-primary"
				/>
				{q && (
					<button
						type="button"
						onClick={() => setQ("")}
						aria-label="Xoá tìm kiếm"
						className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
					>
						<X className="h-4 w-4" />
					</button>
				)}
			</div>
			<p className="mb-3 text-xs text-muted-foreground">{filtered.length} trường</p>
			{filtered.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
					Không tìm thấy trường phù hợp.
				</div>
			) : (
				<ul className="grid gap-3 sm:grid-cols-2">
					{filtered.map((s) => (
						<li key={s.id} className="rounded-xl border border-border bg-card p-4 shadow-sm">
							<p className="font-medium text-foreground">{s.name}</p>
							<div className="mt-3 flex flex-wrap gap-2">
								<Link
									href={`/truong/${s.id}/giang-vien`}
									className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
								>
									<GraduationCap className="h-4 w-4" /> Review giảng viên
								</Link>
								<Link
									href={`/truong/${s.id}/survival-guide`}
									className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1.5 text-xs font-medium text-accent transition-colors hover:bg-accent/20"
								>
									<BookOpen className="h-4 w-4" /> Cẩm nang &amp; câu chuyện
								</Link>
								<Link
									href="/cong-dong/hoi-dap"
									className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted/70"
								>
									<MessageCircle className="h-4 w-4" /> Hỏi đáp
								</Link>
							</div>
						</li>
					))}
				</ul>
			)}
		</div>
	)
}
