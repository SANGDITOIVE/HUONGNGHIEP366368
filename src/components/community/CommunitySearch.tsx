"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import {
	Search, X, Loader2, GraduationCap, BookOpen, MessageSquare,
	Building2, Compass,
} from "lucide-react"

type ProfessorHit = { name: string; subject: string | null; schoolName: string | null; reviewCount: number; href: string }
type SurvivalHit = { id: number; category: string; snippet: string; schoolName: string | null; href: string }
type QuestionHit = { id: number; title: string; schoolName: string | null; href: string }
type SchoolHit = { id: string; name: string; href: string }
type MajorHit = { id: string; name: string; field: string | null; href: string; schools: { id: string; name: string }[] }

interface SearchResult {
	professors: ProfessorHit[]
	survival: SurvivalHit[]
	questions: QuestionHit[]
	schools: SchoolHit[]
	majors: MajorHit[]
}

const EMPTY: SearchResult = { professors: [], survival: [], questions: [], schools: [], majors: [] }

function totalHits(r: SearchResult): number {
	return r.professors.length + r.survival.length + r.questions.length + r.schools.length + r.majors.length
}

// Ô search tổng hợp cho khu Cộng đồng: gõ ra giảng viên, survival guide, hỏi đáp,
// trường và ngành (kèm các trường đào tạo ngành đó).
export function CommunitySearch() {
	const [q, setQ] = useState("")
	const [result, setResult] = useState<SearchResult>(EMPTY)
	const [loading, setLoading] = useState(false)
	const [open, setOpen] = useState(false)
	const boxRef = useRef<HTMLDivElement>(null)

	// Debounce ~250ms.
	useEffect(() => {
		const term = q.trim()
		if (term.length < 2) {
			setResult(EMPTY)
			setLoading(false)
			return
		}
		setLoading(true)
		const t = setTimeout(async () => {
			try {
				const res = await fetch(`/api/community/search?q=${encodeURIComponent(term)}`)
				const data = await res.json()
				if (res.ok && data.ok) {
					setResult({
						professors: data.professors ?? [],
						survival: data.survival ?? [],
						questions: data.questions ?? [],
						schools: data.schools ?? [],
						majors: data.majors ?? [],
					})
				}
			} catch {
				/* ignore */
			} finally {
				setLoading(false)
			}
		}, 250)
		return () => clearTimeout(t)
	}, [q])

	// Đóng dropdown khi bấm ra ngoài.
	useEffect(() => {
		function onClick(e: MouseEvent) {
			if (boxRef.current && !boxRef.current.contains(e.target as Node)) setOpen(false)
		}
		document.addEventListener("mousedown", onClick)
		return () => document.removeEventListener("mousedown", onClick)
	}, [])

	const showPanel = open && q.trim().length >= 2
	const empty = !loading && totalHits(result) === 0

	return (
		<div ref={boxRef} className="relative w-full">
			<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
			<input
				value={q}
				onChange={(e) => {
					setQ(e.target.value)
					setOpen(true)
				}}
				onFocus={() => setOpen(true)}
				onKeyDown={(e) => e.key === "Escape" && setOpen(false)}
				placeholder="Tìm giảng viên, survival guide, hỏi đáp, trường hoặc ngành…"
				className="w-full rounded-xl border border-input bg-background py-2.5 pl-9 pr-9 text-sm outline-none focus:border-primary"
				aria-label="Tìm kiếm cộng đồng"
			/>
			{loading ? (
				<Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
			) : q ? (
				<button
					type="button"
					onClick={() => {
						setQ("")
						setOpen(false)
					}}
					aria-label="Xoá tìm kiếm"
					className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
				>
					<X className="h-4 w-4" />
				</button>
			) : null}

			{showPanel && (
				<div className="absolute z-50 mt-2 max-h-[70vh] w-full overflow-y-auto rounded-xl border border-border bg-card p-2 shadow-lg">
					{empty ? (
						<p className="px-3 py-6 text-center text-sm text-muted-foreground">
							Không tìm thấy kết quả cho “{q.trim()}”.
						</p>
					) : (
						<div className="space-y-3">
							<Group title="Ngành học" icon={<Compass className="h-3.5 w-3.5" />} show={result.majors.length > 0}>
								{result.majors.map((m) => (
									<div key={m.id} className="rounded-lg px-3 py-2 hover:bg-muted">
										<Link href={m.href} onClick={() => setOpen(false)} className="block">
											<p className="text-sm font-medium text-foreground">{m.name}</p>
											{m.field && <p className="text-xs text-muted-foreground">{m.field}</p>}
										</Link>
										{m.schools.length > 0 && (
											<div className="mt-1.5 flex flex-wrap gap-1.5">
												<span className="text-[11px] text-muted-foreground">Trường đào tạo:</span>
												{m.schools.map((s) => (
													<Link
														key={s.id}
														href={`/truong/${s.id}/giang-vien`}
														onClick={() => setOpen(false)}
														className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary hover:bg-primary/20"
													>
														{s.name}
													</Link>
												))}
											</div>
										)}
									</div>
								))}
							</Group>

							<Group title="Trường" icon={<Building2 className="h-3.5 w-3.5" />} show={result.schools.length > 0}>
								{result.schools.map((s) => (
									<Row key={s.id} href={s.href} onGo={() => setOpen(false)} title={s.name} sub="Review giảng viên · Survival guide" />
								))}
							</Group>

							<Group title="Giảng viên" icon={<GraduationCap className="h-3.5 w-3.5" />} show={result.professors.length > 0}>
								{result.professors.map((p, i) => (
									<Row
										key={`${p.href}-${i}`}
										href={p.href}
										onGo={() => setOpen(false)}
										title={p.name}
										sub={[p.subject, p.schoolName, `${p.reviewCount} đánh giá`].filter(Boolean).join(" · ")}
									/>
								))}
							</Group>

							<Group title="Hỏi đáp" icon={<MessageSquare className="h-3.5 w-3.5" />} show={result.questions.length > 0}>
								{result.questions.map((qq) => (
									<Row key={qq.id} href={qq.href} onGo={() => setOpen(false)} title={qq.title} sub={qq.schoolName ?? "Câu hỏi chung"} />
								))}
							</Group>

							<Group title="Survival guide" icon={<BookOpen className="h-3.5 w-3.5" />} show={result.survival.length > 0}>
								{result.survival.map((s) => (
									<Row key={s.id} href={s.href} onGo={() => setOpen(false)} title={s.snippet} sub={[s.category, s.schoolName].filter(Boolean).join(" · ")} />
								))}
							</Group>
						</div>
					)}
				</div>
			)}
		</div>
	)
}

function Group({ title, icon, show, children }: { title: string; icon: React.ReactNode; show: boolean; children: React.ReactNode }) {
	if (!show) return null
	return (
		<div>
			<p className="flex items-center gap-1.5 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
				{icon} {title}
			</p>
			<div>{children}</div>
		</div>
	)
}

function Row({ href, title, sub, onGo }: { href: string; title: string; sub?: string; onGo: () => void }) {
	return (
		<Link href={href} onClick={onGo} className="block rounded-lg px-3 py-2 hover:bg-muted">
			<p className="line-clamp-1 text-sm font-medium text-foreground">{title}</p>
			{sub && <p className="line-clamp-1 text-xs text-muted-foreground">{sub}</p>}
		</Link>
	)
}
