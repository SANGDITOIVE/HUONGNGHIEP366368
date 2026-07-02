"use client"

import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectableChipProps {
	label: string
	hint?: string
	selected: boolean
	onToggle: () => void
}

// Chip chọn được (single hoặc multi). Có trạng thái aria-pressed cho a11y.
export function SelectableChip({ label, hint, selected, onToggle }: SelectableChipProps) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={onToggle}
			className={cn(
				"group flex items-start gap-2 rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 active:scale-[0.98]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				selected
					? "border-primary bg-primary/5 text-foreground shadow-sm"
					: "border-input bg-card hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm",
			)}
		>
			<span
				className={cn(
					"mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border",
					selected ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/40",
				)}
			>
				{selected && <Check className="h-3 w-3" />}
			</span>
			<span>
				<span className="font-medium">{label}</span>
				{hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
			</span>
		</button>
	)
}
