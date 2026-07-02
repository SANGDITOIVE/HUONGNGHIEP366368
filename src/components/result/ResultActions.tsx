"use client"

import { useState } from "react"
import { Check, Copy, Printer, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function ResultActions({ summary, title }: { summary: string; title: string }) {
	const [copied, setCopied] = useState(false)

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(summary)
			setCopied(true)
			setTimeout(() => setCopied(false), 2000)
		} catch {
			/* bỏ qua nếu trình duyệt chặn clipboard */
		}
	}

	async function handleShare() {
		if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
			try {
				await navigator.share({ title, text: summary })
				return
			} catch {
				/* người dùng huỷ chia sẻ */
			}
		}
		handleCopy()
	}

	function handlePrint() {
		if (typeof window !== "undefined") window.print()
	}

	return (
		<div className="flex flex-wrap gap-2 print:hidden">
			<Button type="button" variant="outline" onClick={handleCopy}>
				{copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
				{copied ? "Đã sao chép" : "Sao chép kết quả"}
			</Button>
			<Button type="button" variant="outline" onClick={handleShare}>
				<Share2 className="h-4 w-4" /> Chia sẻ
			</Button>
			<Button type="button" variant="outline" onClick={handlePrint}>
				<Printer className="h-4 w-4" /> In / Lưu PDF
			</Button>
		</div>
	)
}
