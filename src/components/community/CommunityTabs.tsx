"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Newspaper, MessageCircle, GraduationCap } from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

type Tab = { href: string; label: string; icon: LucideIcon; match: string[] }

// Sub-tab của khu Cộng đồng. "Theo trường" gồm cả review giảng viên + survival
// (route chi tiết vẫn nằm dưới /truong nên được tính là active).
const TABS: Tab[] = [
	{ href: "/cong-dong", label: "Bảng tin", icon: Newspaper, match: ["/cong-dong"] },
	{ href: "/cong-dong/hoi-dap", label: "Hỏi đáp", icon: MessageCircle, match: ["/cong-dong/hoi-dap", "/hoi-dap"] },
	{ href: "/cong-dong/truong", label: "Theo trường", icon: GraduationCap, match: ["/cong-dong/truong", "/truong"] },
]

function isActive(pathname: string, tab: Tab): boolean {
	// "Bảng tin" chỉ active khi đúng /cong-dong (không phải các sub-route).
	if (tab.href === "/cong-dong") return pathname === "/cong-dong"
	return tab.match.some((m) => pathname === m || pathname.startsWith(m + "/"))
}

export function CommunityTabs() {
	const pathname = usePathname()
	return (
		<nav className="flex items-center gap-1 overflow-x-auto" aria-label="Điều hướng cộng đồng">
			{TABS.map((tab) => {
				const active = isActive(pathname, tab)
				const Icon = tab.icon
				return (
					<Link
						key={tab.href}
						href={tab.href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"inline-flex items-center gap-1.5 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							active
								? "bg-primary text-primary-foreground"
								: "text-muted-foreground hover:bg-muted hover:text-foreground",
						)}
					>
						<Icon className="h-4 w-4" /> {tab.label}
					</Link>
				)
			})}
		</nav>
	)
}
