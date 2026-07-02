"use client"

import { useState } from "react"
import { Loader2, Trash2 } from "lucide-react"
import { cn } from "@/lib/utils"

// Nút xoá dùng chung: gọi DELETE tới endpoint. Server tự kiểm tra quyền
// (tác giả hoặc admin). Xoá = ẩn (soft delete).
export function DeleteButton({
	endpoint,
	onDeleted,
	label = "Xoá",
	confirmText = "Xoá nội dung này? Người khác sẽ không còn thấy nữa.",
	className,
}: {
	endpoint: string
	onDeleted?: () => void
	label?: string
	confirmText?: string
	className?: string
}) {
	const [busy, setBusy] = useState(false)
	const [msg, setMsg] = useState<string | null>(null)

	async function del() {
		if (busy) return
		if (typeof window !== "undefined" && !window.confirm(confirmText)) return
		setBusy(true)
		setMsg(null)
		try {
			const res = await fetch(endpoint, { method: "DELETE" })
			const data = await res.json().catch(() => ({}))
			if (!res.ok || !data.ok) {
				setMsg(data?.error === "FORBIDDEN" ? "Bạn không có quyền xoá." : "Không xoá được, thử lại.")
				setBusy(false)
				return
			}
			onDeleted?.()
		} catch {
			setMsg("Lỗi kết nối, thử lại.")
			setBusy(false)
		}
	}

	return (
		<span className="inline-flex items-center gap-2">
			<button
				type="button"
				onClick={del}
				disabled={busy}
				className={cn(
					"inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-destructive disabled:opacity-50",
					className,
				)}
			>
				{busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
				{label}
			</button>
			{msg && <span className="text-xs text-destructive">{msg}</span>}
		</span>
	)
}
