"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { Clock, Flame, Loader2, PlusCircle, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { QuestionCard, type QAQuestion } from "@/components/community/qa/QuestionCard"

type SchoolOpt = { id: string; name: string }

export function QuestionFeed({ schools = [] }: { schools?: SchoolOpt[] }) {
	const [sort, setSort] = useState<"new" | "top">("new")
	const [scope, setScope] = useState<"all" | "general">("all")
	const [schoolId, setSchoolId] = useState("")
	const [tag, setTag] = useState("")
	const [tagInput, setTagInput] = useState("")
	const [questions, setQuestions] = useState<QAQuestion[]>([])
	const [loading, setLoading] = useState(true)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const qs = new URLSearchParams({ sort })
			if (scope === "general") qs.set("scope", "general")
			else if (schoolId) qs.set("school_id", schoolId)
			if (tag) qs.set("tag", tag)
			const res = await fetch(`/api/questions?${qs.toString()}`, { cache: "no-store" })
			const data = await res.json()
			if (res.ok && data.ok) setQuestions(data.questions ?? [])
		} catch {
			/* ignore */
		} finally {
			setLoading(false)
		}
	}, [sort, scope, schoolId, tag])

	useEffect(() => {
		load()
	}, [load])

	// Nạp lại khi người dùng quay lại tab để đồng bộ bài đã bị xoá/ẩn.
	useEffect(() => {
		const onFocus = () => load()
		window.addEventListener("focus", onFocus)
		return () => window.removeEventListener("focus", onFocus)
	}, [load])

	return (
		<div className="space-y-4">
			<div className="flex flex-wrap items-center gap-2">
				<div className="inline-flex overflow-hidden rounded-full border border-border">
					<button
						type="button"
						onClick={() => setSort("new")}
						className={cn("inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium", sort === "new" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
					>
						<Clock className="h-4 w-4" /> Mới nhất
					</button>
					<button
						type="button"
						onClick={() => setSort("top")}
						className={cn("inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium", sort === "top" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted")}
					>
						<Flame className="h-4 w-4" /> Nổi bật
					</button>
				</div>

				<Link
					href="/hoi-dap/tao"
					className="ml-auto inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
				>
					<PlusCircle className="h-4 w-4" /> Đặt câu hỏi
				</Link>
			</div>

			<div className="flex flex-wrap items-center gap-2">
				<select
					value={scope === "general" ? "__general__" : schoolId}
					onChange={(e) => {
						const v = e.target.value
						if (v === "__general__") {
							setScope("general")
							setSchoolId("")
						} else {
							setScope("all")
							setSchoolId(v)
						}
					}}
					className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
				>
					<option value="">Tất cả trường</option>
					<option value="__general__">Câu hỏi chung (không gắn trường)</option>
					{schools.map((s) => (
						<option key={s.id} value={s.id}>
							{s.name}
						</option>
					))}
				</select>

				<div className="inline-flex items-center gap-1 rounded-lg border border-input bg-background px-3 py-2">
					<Search className="h-4 w-4 text-muted-foreground" />
					<input
						value={tagInput}
						onChange={(e) => setTagInput(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") setTag(tagInput.trim().toLowerCase())
						}}
						placeholder="Lọc theo tag (Enter)"
						className="w-40 bg-transparent text-sm outline-none"
					/>
				</div>
				{tag && (
					<button
						type="button"
						onClick={() => {
							setTag("")
							setTagInput("")
						}}
						className="text-xs text-muted-foreground underline"
					>
						Xoá lọc #{tag}
					</button>
				)}
			</div>

			{loading ? (
				<div className="flex items-center justify-center py-16 text-muted-foreground">
					<Loader2 className="h-6 w-6 animate-spin" />
				</div>
			) : questions.length === 0 ? (
				<div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
					Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi!
				</div>
			) : (
				<div className="space-y-3">
					{questions.map((q) => (
						<QuestionCard key={q.id} question={q} />
					))}
				</div>
			)}
		</div>
	)
}
