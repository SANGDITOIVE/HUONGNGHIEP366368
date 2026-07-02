import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
	"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
	{
		variants: {
			variant: {
				default: "bg-primary text-primary-foreground hover:bg-primary/90",
				accent: "bg-accent text-accent-foreground hover:bg-accent/90",
				outline: "border border-input bg-card hover:bg-muted",
				ghost: "hover:bg-muted",
				secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			},
			size: {
				default: "h-10 px-5 py-2",
				sm: "h-9 px-3",
				lg: "h-12 px-7 text-base",
				icon: "h-10 w-10",
			},
		},
		defaultVariants: { variant: "default", size: "default" },
	},
)

export interface ButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement>,
		VariantProps<typeof buttonVariants> {
	/**
	 * Khi true, Button không render thẻ <button> mà áp style lên phần tử con
	 * (ví dụ <Link>). Giống asChild của shadcn/ui nhưng không cần thư viện ngoài.
	 */
	asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
	({ className, variant, size, asChild = false, children, ...props }, ref) => {
		const classes = cn(buttonVariants({ variant, size, className }))

		if (asChild && React.isValidElement(children)) {
			const child = children as React.ReactElement<{ className?: string }>
			return React.cloneElement(child, {
				...props,
				className: cn(classes, child.props.className),
			} as Record<string, unknown>)
		}

		return (
			<button ref={ref} className={classes} {...props}>
				{children}
			</button>
		)
	},
)
Button.displayName = "Button"

export { Button, buttonVariants }
