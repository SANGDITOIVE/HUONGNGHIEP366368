"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Check, Flag, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Nút báo cáo dùng chung cho mọi loại nội dung. Đủ 5 report độc lập → server
// tự ẩn nội dung (pending_review).
export type ReportTarget = "survival_tip" | "survival_reply" | "question" | "answer"

export function ReportButton({
	targetType,
	targetId,
	className,
}: {
	targetType: ReportTarget
	targetId: number
	className?: string
}) {
	const { status } = useSession()
	const [busy, setBusy] = useState(false)
	const [done, setDone] = useState(false)
	const [msg, setMsg] = useState<string | null>(null)

	async function report() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		if (busy || done) return
		if (typeof window !== "undefined" && !window.confirm("Báo cáo nội dung này là không phù hợp?")) return
		setBusy(true)
		setMsg(null)
		try {
			const res = await fetch("/api/reports", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ targetType, targetId }),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) {
				setMsg("Không gửi được báo cáo.")
				return
			}
			setDone(true)
			setMsg(data.hidden ? "Đã ẩn nội dung để chờ kiểm duyệt." : "Đã ghi nhận báo cáo.")
		} catch {
			setMsg("Lỗi kết nối, thử lại sau.")
		} finally {
			setBusy(false)
		}
	}

	return (
		<span className="inline-flex items-center gap-2">
			<button
				type="button"
				onClick={report}
				disabled={busy || done}
				className={cn(
					"inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50",
					className,
				)}
			>
				{busy ? (
					<Loader2 className="h-3.5 w-3.5 animate-spin" />
				) : done ? (
					<Check className="h-3.5 w-3.5" />
				) : (
					<Flag className="h-3.5 w-3.5" />
				)}
				{done ? "Đã báo cáo" : "Báo cáo"}
			</button>
			{msg && <span className="text-xs text-muted-foreground">{msg}</span>}
		</span>
	)
}
