"use client"

import { useState } from "react"
import { Star } from "lucide-react"
import { cn } from "@/lib/utils"

// Nhãn cảm xúc theo số sao — giúp người dùng hiểu ý nghĩa khi chấm.
export const RATING_LABELS: Record<number, string> = {
	1: "Rất tệ",
	2: "Tệ",
	3: "Bình thường",
	4: "Tốt",
	5: "Tuyệt vời",
}

// Hiển thị số sao (read-only) — hỗ trợ nửa sao.
export function StarDisplay({ value, size = 16 }: { value: number; size?: number }) {
	const pct = Math.max(0, Math.min(100, (value / 5) * 100))
	return (
		<span className="relative inline-flex" aria-label={`${value.toFixed(1)} trên 5 sao`}>
			<span className="flex">
				{Array.from({ length: 5 }).map((_, i) => (
					<Star key={`bg-${i}`} className="text-slate-200" style={ { width: size, height: size } } />
				))}
			</span>
			<span className="absolute inset-0 flex overflow-hidden" style={ { width: `${pct}%` } }>
				{Array.from({ length: 5 }).map((_, i) => (
					<Star
						key={`fg-${i}`}
						className="shrink-0 fill-amber-400 text-amber-400"
						style={ { width: size, height: size } }
					/>
				))}
			</span>
		</span>
	)
}

// Thanh chọn sao tương tác (1–5) cho form viết đánh giá.
// - Hiệu ứng hover/zoom mượt, nhãn cảm xúc đi kèm.
// - Điều khiển được bằng bàn phím (mũi tên) + vùng chạm rộng cho mobile.
export function StarPicker({
	value,
	onChange,
	size = 28,
	showLabel = true,
}: {
	value: number
	onChange: (v: number) => void
	size?: number
	showLabel?: boolean
}) {
	const [hover, setHover] = useState(0)
	const active = hover || value
	return (
		<div className="flex items-center gap-2.5">
			<div
				className="flex items-center"
				role="radiogroup"
				aria-label="Chọn số sao"
				onMouseLeave={() => setHover(0)}
			>
				{[1, 2, 3, 4, 5].map((n) => (
					<button
						key={n}
						type="button"
						role="radio"
						aria-checked={value === n}
						aria-label={`${n} sao — ${RATING_LABELS[n]}`}
						onMouseEnter={() => setHover(n)}
						onFocus={() => setHover(n)}
						onBlur={() => setHover(0)}
						onClick={() => onChange(n)}
						onKeyDown={(e) => {
							if (e.key === "ArrowRight" || e.key === "ArrowUp") {
								e.preventDefault()
								onChange(Math.min(5, (value || 0) + 1))
							} else if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
								e.preventDefault()
								onChange(Math.max(1, (value || 1) - 1))
							}
						}}
						className="rounded-full p-1 transition-transform duration-150 hover:scale-125 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60 active:scale-95"
					>
						<Star
							className={cn(
								"transition-colors duration-150",
								n <= active ? "fill-amber-400 text-amber-400" : "text-slate-300",
							)}
							style={ { width: size, height: size } }
						/>
					</button>
				))}
			</div>
			{showLabel && (
				<span
					className={cn(
						"min-w-[78px] text-sm font-semibold transition-colors",
						active ? "text-amber-600" : "text-slate-400",
					)}
				>
					{RATING_LABELS[active] ?? "Chọn sao"}
				</span>
			)}
		</div>
	)
}
