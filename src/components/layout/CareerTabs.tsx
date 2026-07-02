"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { GraduationCap, Map, MapPinned, Scale } from "lucide-react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/store/favoritesStore"

const TABS = [
	{ href: "/nganh-hoc", label: "Danh sách ngành", icon: GraduationCap },
	{ href: "/ban-do-mon-hoc", label: "Tìm theo môn học", icon: Map },
	{ href: "/so-sanh", label: "So sánh đã lưu", icon: Scale },
	{ href: "/ban-do-nganh-nghe", label: "Bản đồ nghề nghiệp", icon: MapPinned },
]

/**
 * Thanh tab dùng chung cho khu "Ngành & nghề":
 * gom 3 cách xem ngành (danh sách, theo môn học, so sánh) về một mạch liền lạc.
 */
export function CareerTabs() {
	const pathname = usePathname()
	const { ids, hydrated } = useFavorites()
	const compareCount = hydrated ? ids.length : 0

	return (
		<nav
			aria-label="Khu vực Ngành & nghề"
			className="mb-8 flex gap-1 overflow-x-auto border-b"
		>
			{TABS.map((t) => {
				const active = pathname === t.href || pathname.startsWith(t.href + "/")
				const Icon = t.icon
				return (
					<Link
						key={t.href}
						href={t.href}
						aria-current={active ? "page" : undefined}
						className={cn(
							"-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
							active
								? "border-primary text-primary"
								: "border-transparent text-muted-foreground hover:text-foreground",
						)}
					>
						<Icon className="h-4 w-4" />
						{t.label}
						{t.href === "/so-sanh" && compareCount > 0 ? (
							<span className="ml-1 rounded-full bg-primary/10 px-1.5 text-xs text-primary">
								{compareCount}
							</span>
						) : null}
					</Link>
				)
			})}
		</nav>
	)
}
