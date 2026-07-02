import * as React from "react"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
	value: number // 0–100
}

export function Progress({ value, className, ...props }: ProgressProps) {
	const clamped = Math.max(0, Math.min(100, value))
	return (
		<div
			role="progressbar"
			aria-valuenow={Math.round(clamped)}
			aria-valuemin={0}
			aria-valuemax={100}
			className={cn("h-2 w-full overflow-hidden rounded-full bg-muted", className)}
			{...props}
		>
			<div
				className="h-full rounded-full bg-primary transition-all"
				style={{ width: `${clamped}%` }}
			/>
		</div>
	)
}
