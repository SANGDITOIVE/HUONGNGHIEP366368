"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { SURVIVAL_CATEGORIES } from "@/lib/community/survivalCategories"
import type { SurvivalTip } from "@/components/community/survival/SurvivalTipCard"

// Form đóng góp 1 tip Survival Guide. Bắt đăng nhập (chống spam), có thể ẩn danh.
export function SurvivalTipForm({
	schoolId,
	defaultCategory = "general",
	onCreated,
}: {
	schoolId: string
	defaultCategory?: string
	onCreated?: (tip: SurvivalTip) => void
}) {
	const { status } = useSession()
	const [category, setCategory] = useState(defaultCategory)
	const [content, setContent] = useState("")
	const [anonymous, setAnonymous] = useState(false)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [done, setDone] = useState(false)

	const canSubmit = content.trim().length >= 3 && !busy

	async function submit() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		setError(null)
		if (!canSubmit) {
			setError("Nhập nội dung mẹo (ít nhất 3 ký tự).")
			return
		}
		setBusy(true)
		try {
			const res = await fetch("/api/survival-tips", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ schoolId, category, content: content.trim(), isAnonymous: anonymous }),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) {
				setError(data?.error === "UNAUTHORIZED" ? "Cần đăng nhập để đăng." : "Không gửi được, thử lại sau.")
				return
			}
			setContent("")
			setDone(true)
			if (onCreated && data.tip) onCreated(data.tip as SurvivalTip)
			setTimeout(() => setDone(false), 2500)
		} catch {
			setError("Lỗi kết nối, thử lại sau.")
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
			<h3 className="mb-4 text-lg font-semibold text-foreground">Đóng góp mẹo cho cộng đồng</h3>

			<label className="block text-sm">
				<span className="mb-1 block font-medium text-foreground">Chủ đề</span>
				<select
					value={category}
					onChange={(e) => setCategory(e.target.value)}
					className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
				>
					{SURVIVAL_CATEGORIES.map((c) => (
						<option key={c.value} value={c.value}>
							{c.label}
						</option>
					))}
				</select>
			</label>

			<label className="mt-4 block text-sm">
				<span className="mb-1 block font-medium text-foreground">Nội dung *</span>
				<textarea
					value={content}
					onChange={(e) => setContent(e.target.value)}
					rows={4}
					placeholder="VD: Nên đăng ký học phần sớm vào 7h sáng ngày mở cổng, khu KTX A2 gần căng-tin nhất..."
					className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
				/>
			</label>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
					<input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4" />
					Đăng ẩn danh (ẩn tên với người đọc)
				</label>
				<Button type="button" onClick={submit} disabled={!canSubmit} variant="accent">
					{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
					Đăng mẹo
				</Button>
			</div>

			{status !== "authenticated" && (
				<p className="mt-2 text-xs text-muted-foreground">
					Cần{" "}
					<button type="button" onClick={() => signIn("google")} className="font-semibold text-primary underline">
						đăng nhập Google
					</button>{" "}
					để đăng (vẫn có thể chọn ẩn danh với người đọc).
				</p>
			)}
			{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
			{done && <p className="mt-2 text-sm font-medium text-accent">Đã đăng, cảm ơn bạn!</p>}
		</div>
	)
}
