interface StepShellProps {
	title: string
	description?: string
	children: React.ReactNode
}

export function StepShell({ title, description, children }: StepShellProps) {
	return (
		<div className="space-y-5">
			<div className="space-y-1">
				<h2 className="text-xl font-semibold">{title}</h2>
				{description && <p className="text-sm text-muted-foreground">{description}</p>}
			</div>
			{children}
		</div>
	)
}
