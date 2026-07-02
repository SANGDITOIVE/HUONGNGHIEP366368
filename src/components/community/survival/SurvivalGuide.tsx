"use client"

import { useCallback, useEffect, useState } from "react"
import {
	AlertTriangle,
	Briefcase,
	Home,
	LayoutGrid,
	ListChecks,
	Loader2,
	MessageCircle,
	Plus,
	Utensils,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { SURVIVAL_CATEGORIES } from "@/lib/community/survivalCategories"
import { SurvivalTipCard, type SurvivalTip } from "@/components/community/survival/SurvivalTipCard"
import { SurvivalTipForm } from "@/components/community/survival/SurvivalTipForm"

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
	ListChecks,
	AlertTriangle,
	Utensils,
	Home,
	Briefcase,
	MessageCircle,
}

export function SurvivalGuide({ schoolId, schoolName }: { schoolId: string; schoolName: string }) {
	const [active, setActive] = useState<string | null>(null)
	const [tips, setTips] = useState<SurvivalTip[]>([])
	const [counts, setCounts] = useState<Record<string, number>>({})
	const [loading, setLoading] = useState(true)
	const [showForm, setShowForm] = useState(false)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const qs = new URLSearchParams({ school_id: schoolId })
			if (active) qs.set("category", active)
			const res = await fetch(`/api/survival-tips?${qs.toString()}`)
			const data = await res.json()
			if (res.ok && data.ok) {
				setTips(data.tips ?? [])
				setCounts(data.categoryCounts ?? {})
			}
		} catch {
			/* ignore */
		} finally {
			setLoading(false)
		}
	}, [schoolId, active])

	useEffect(() => {
		load()
	}, [load])

	const total = Object.values(counts).reduce((a, b) => a + b, 0)

	return (
		<div className="grid gap-6 lg:grid-cols-[260px_1fr]">
			{/* Sidebar category */}
			<aside className="lg:sticky lg:top-24 lg:self-start">
				<div className="rounded-2xl border border-border bg-card p-3 shadow-sm">
					<button
						type="button"
						onClick={() => setActive(null)}
						className={cn(
							"flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
							active === null ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
						)}
					>
						<span className="inline-flex items-center gap-2">
							<LayoutGrid className="h-4 w-4" /> Tất cả
						</span>
						<span className="text-xs opacity-80">{total}</span>
					</button>
					<div className="mt-1 space-y-1">
						{SURVIVAL_CATEGORIES.map((c) => {
							const Icon = ICONS[c.icon] ?? MessageCircle
							const on = active === c.value
							return (
								<button
									key={c.value}
									type="button"
									onClick={() => setActive(c.value)}
									className={cn(
										"flex w-full items-center justify-between rounded-xl px-3 py-2 text-sm font-medium transition-colors",
										on ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-muted",
									)}
								>
									<span className="inline-flex items-center gap-2 text-left">
										<Icon className="h-4 w-4 shrink-0" /> {c.label}
									</span>
									<span className="text-xs opacity-80">{counts[c.value] ?? 0}</span>
								</button>
							)
						})}
					</div>
				</div>
			</aside>

			{/* Content area */}
			<div className="space-y-4">
				<div className="flex flex-wrap items-center justify-between gap-3">
					<p className="text-sm text-muted-foreground">
						Wiki kinh nghiệm do sinh viên <span className="font-semibold text-foreground">{schoolName}</span> đóng góp.
					</p>
					<button
						type="button"
						onClick={() => setShowForm((v) => !v)}
						className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-colors hover:bg-accent/90"
					>
						<Plus className="h-4 w-4" /> {showForm ? "Đóng" : "Đóng góp mẹo"}
					</button>
				</div>

				{showForm && (
					<SurvivalTipForm
						schoolId={schoolId}
						defaultCategory={active ?? "general"}
						onCreated={(tip) => {
							setTips((prev) => [tip, ...prev])
							setCounts((prev) => ({ ...prev, [tip.category]: (prev[tip.category] ?? 0) + 1 }))
							setShowForm(false)
						}}
					/>
				)}

				{loading ? (
					<div className="flex items-center justify-center py-16 text-muted-foreground">
						<Loader2 className="h-6 w-6 animate-spin" />
					</div>
				) : tips.length === 0 ? (
					<div className="rounded-2xl border border-dashed border-border bg-card p-10 text-center text-muted-foreground">
						Chưa có mẹo nào ở mục này. Hãy là người đầu tiên đóng góp!
					</div>
				) : (
					<div className="space-y-4">
						{tips.map((t) => (
							<SurvivalTipCard key={t.id} tip={t} />
						))}
					</div>
				)}
			</div>
		</div>
	)
}
