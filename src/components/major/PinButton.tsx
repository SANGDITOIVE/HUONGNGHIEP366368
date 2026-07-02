"use client"

import { Bookmark } from "lucide-react"
import { useFavorites } from "@/lib/store/favoritesStore"
import { cn } from "@/lib/utils"

interface PinButtonProps {
	majorId: string
	majorName?: string
	withLabel?: boolean
	className?: string
}

export function PinButton({ majorId, majorName, withLabel, className }: PinButtonProps) {
	const { has, toggle, hydrated } = useFavorites()
	const pinned = hydrated && has(majorId)
	const action = pinned ? "Bỏ ghim" : "Ghim để so sánh"

	return (
		<button
			type="button"
			onClick={(e) => {
				e.preventDefault()
				e.stopPropagation()
				toggle(majorId)
			}}
			aria-pressed={pinned}
			aria-label={majorName ? `${action}: ${majorName}` : action}
			title={action}
			className={cn(
				"inline-flex items-center justify-center gap-1.5 rounded-md border bg-card text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				withLabel ? "px-3 py-2 font-medium" : "h-8 w-8",
				pinned
					? "border-primary bg-primary/10 text-primary"
					: "text-muted-foreground hover:border-primary hover:text-primary",
				className,
			)}
		>
			<Bookmark className={cn("h-4 w-4", pinned && "fill-current")} />
			{withLabel && <span>{pinned ? "Đã ghim" : "Ghim để so sánh"}</span>}
		</button>
	)
}
