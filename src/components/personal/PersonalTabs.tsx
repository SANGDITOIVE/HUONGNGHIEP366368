"use client"

import { useState } from "react"
import { MessageSquare, UserRound } from "lucide-react"
import { cn } from "@/lib/utils"
import { ProfileTab } from "@/components/ProfileTab"
import { MyPostsTab } from "@/components/personal/MyPostsTab"

const TABS = [
	{ id: "profile", label: "Hồ sơ của tôi", icon: UserRound },
	{ id: "posts", label: "Bài & câu hỏi đã đăng", icon: MessageSquare },
] as const

type TabId = (typeof TABS)[number]["id"]

// Bộ chuyển tab cho trang Cá nhân: gộp "Hồ sơ của tôi" (ProfileTab cũ) và
// tab mới "Bài & câu hỏi đã đăng" (MyPostsTab).
export function PersonalTabs() {
	const [tab, setTab] = useState<TabId>("profile")
	return (
		<div>
			<nav className="mb-6 flex gap-1 overflow-x-auto border-b" aria-label="Khu vực cá nhân">
				{TABS.map((t) => {
					const Icon = t.icon
					const active = tab === t.id
					return (
						<button
							key={t.id}
							type="button"
							onClick={() => setTab(t.id)}
							aria-current={active ? "page" : undefined}
							className={cn(
								"-mb-px flex items-center gap-1.5 whitespace-nowrap border-b-2 px-4 py-3 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
								active
									? "border-primary text-primary"
									: "border-transparent text-muted-foreground hover:text-foreground",
							)}
						>
							<Icon className="h-4 w-4" /> {t.label}
						</button>
					)
				})}
			</nav>
			{tab === "profile" ? <ProfileTab /> : <MyPostsTab />}
		</div>
	)
}
