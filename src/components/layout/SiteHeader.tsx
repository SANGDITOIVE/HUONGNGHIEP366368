"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import {
	BookOpen,
	Building2,
	Compass,
	GraduationCap,
	Menu,
	ShieldCheck,
	UserRound,
	Users,
	type LucideIcon,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { BrandLogo } from "@/components/layout/BrandLogo"
import { useFavorites } from "@/lib/store/favoritesStore"
import { NotificationBell } from "@/components/notifications/NotificationBell"

type NavItem = {
	href: string
	label: string
	icon: LucideIcon
	match?: string[]
	soon?: boolean
	highlight?: boolean
}

const NAV: NavItem[] = [
	{ href: "/noi-dao-tao", label: "Trường đại học", icon: Building2, match: ["/noi-dao-tao"] },
	{
		href: "/nganh-hoc",
		label: "Ngành học",
		icon: GraduationCap,
		match: ["/nganh-hoc", "/ban-do-mon-hoc", "/so-sanh", "/ban-do-nganh-nghe"],
	},
	// "Cộng đồng" được LÀM NỔI BẬT (viền + nền primary nhạt) vì là khu tương tác chính.
	{
		href: "/cong-dong",
		label: "Cộng đồng",
		icon: Users,
		match: ["/cong-dong", "/truong", "/hoi-dap"],
		highlight: true,
	},
	{
		href: "/cam-nang",
		label: "Cẩm nang và câu chuyện",
		icon: BookOpen,
		match: ["/cam-nang", "/danh-cho-phu-huynh"],
	},
]

// Discovery Journey — điểm khởi đầu, luôn được tô nổi bật ngay cạnh logo.
const DJ_HREF = "/kham-pha"
const DJ_MATCH = ["/kham-pha", "/trac-nghiem-tinh-cach", "/ket-qua"]

function isActive(pathname: string, item: NavItem) {
	if (item.href === "/") return pathname === "/"
	const targets = item.match ?? [item.href]
	return targets.some((t) => pathname === t || pathname.startsWith(t + "/"))
}

function djActive(pathname: string) {
	return DJ_MATCH.some((t) => pathname === t || pathname.startsWith(t + "/"))
}

// Tab "Quản trị" CHỈ hiện với tài khoản có quyền admin.
function AdminLink({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
	const pathname = usePathname()
	const { data: session } = useSession()
	const role = session?.user?.role
	if (!role) return null
	const active = pathname === "/quan-tri" || pathname.startsWith("/quan-tri/")
	return (
		<Link
			href="/quan-tri"
			aria-current={active ? "page" : undefined}
			title={iconOnly ? "Quản trị" : undefined}
			className={cn(
				"flex items-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
				iconOnly ? "justify-center px-0 py-1.5" : "gap-1.5 px-3 py-1.5",
				active ? "bg-amber-100 text-amber-700" : "text-amber-600 hover:bg-amber-50",
				className,
			)}
		>
			<ShieldCheck className="h-4 w-4" />
			{!iconOnly && "Quản trị"}
		</Link>
	)
}

// Avatar/tên tài khoản.
function PersonalLink({ className, iconOnly }: { className?: string; iconOnly?: boolean }) {
	const pathname = usePathname()
	const { data: session } = useSession()
	const active = pathname === "/ca-nhan" || pathname.startsWith("/ca-nhan/")
	const avatar = session?.user?.image ?? ""
	return (
		<Link
			href="/ca-nhan"
			aria-current={active ? "page" : undefined}
			title={iconOnly ? "Cá nhân" : undefined}
			className={cn(
				"flex items-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				iconOnly ? "justify-center px-0 py-1.5" : "gap-2 px-3 py-1.5",
				active ? "text-foreground" : "text-muted-foreground hover:text-foreground",
				className,
			)}
		>
			{avatar ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={avatar}
					alt="Ảnh đại diện"
					referrerPolicy="no-referrer"
					className="h-7 w-7 rounded-full border border-border object-cover"
				/>
			) : (
				<span className="flex h-7 w-7 items-center justify-center rounded-full border border-border bg-muted text-muted-foreground">
					<UserRound className="h-4 w-4" />
				</span>
			)}
			{!iconOnly && (
				<span className="underline decoration-primary/60 decoration-2 underline-offset-4">Cá nhân</span>
			)}
		</Link>
	)
}

// Nút Discovery Journey nổi bật (dùng chung cho sidebar & mobile).
function DiscoveryButton({
	pathname,
	compact,
	iconOnly,
}: {
	pathname: string
	compact?: boolean
	iconOnly?: boolean
}) {
	const active = djActive(pathname)
	return (
		<Link
			href={DJ_HREF}
			aria-current={active ? "page" : undefined}
			title={iconOnly ? "Discovery Journey" : undefined}
			className={cn(
				"flex items-center rounded-xl bg-accent font-bold text-accent-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				active && "ring-2 ring-accent ring-offset-2",
				iconOnly
					? "justify-center px-2 py-2.5"
					: compact
						? "gap-2 px-2.5 py-1.5 text-xs"
						: "gap-2 px-3 py-2.5 text-sm",
			)}
		>
			<Compass className={compact ? "h-4 w-4" : "h-5 w-5"} />
			{!iconOnly && (compact ? "Discovery" : "Discovery Journey")}
		</Link>
	)
}

export function SiteHeader() {
	const pathname = usePathname()
	const { ids, hydrated } = useFavorites()
	const compareCount = hydrated ? ids.length : 0

	// Trạng thái thu gọn sidebar (chỉ áp dụng cho desktop). Lưu vào localStorage
	// và phản chiếu lên <html data-sidebar> để phần nội dung tự chỉnh lề trái.
	const [collapsed, setCollapsed] = useState(false)

	useEffect(() => {
		try {
			setCollapsed(localStorage.getItem("hoatieu-sidebar") === "collapsed")
		} catch {}
	}, [])

	useEffect(() => {
		if (typeof document !== "undefined") {
			document.documentElement.setAttribute(
				"data-sidebar",
				collapsed ? "collapsed" : "expanded",
			)
		}
	}, [collapsed])

	const toggleSidebar = () => {
		setCollapsed((prev) => {
			const next = !prev
			try {
				localStorage.setItem("hoatieu-sidebar", next ? "collapsed" : "expanded")
			} catch {}
			return next
		})
	}

	const navSuffix = (item: NavItem) =>
		item.href === "/nganh-hoc" && compareCount > 0 ? ` (${compareCount})` : ""

	return (
		<>
			{/* Chuông thông báo CỐ ĐỊNH GÓC PHẢI TRÊN CÙNG (chỉ desktop). */}
			<div className="fixed right-4 top-3 z-50 hidden lg:block">
				<div className="glass rounded-full border border-white/40 shadow-sm">
					<NotificationBell />
				</div>
			</div>

			{/* ===================== SIDEBAR DỌC (DESKTOP) ===================== */}
			<aside
				className={cn(
					"glass-header fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-white/40 transition-[width] duration-200 lg:flex",
					collapsed ? "w-28" : "w-60",
				)}
				aria-label="Thanh điều hướng bên"
			>
				<div
					className={cn(
						"flex items-center",
						collapsed
							? "h-auto flex-col gap-1.5 px-1 py-2.5"
							: "h-16 justify-between gap-2 px-3",
					)}
				>
					<Link
						href="/"
						className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
						aria-label="HoaTieu — trang chủ"
					>
						<BrandLogo />
					</Link>
					<button
						type="button"
						onClick={toggleSidebar}
						aria-label={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
						aria-pressed={collapsed}
						title={collapsed ? "Mở rộng menu" : "Thu gọn menu"}
						className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					>
						<Menu className="h-5 w-5" />
					</button>
				</div>

				<div className={cn("pb-1", collapsed ? "px-2" : "px-3")}>
					<DiscoveryButton pathname={pathname} iconOnly={collapsed} />
				</div>

				<nav
					className={cn(
						"flex flex-1 flex-col gap-1 overflow-y-auto py-3",
						collapsed ? "px-2" : "px-3",
					)}
					aria-label="Điều hướng chính"
				>
					{NAV.map((item) => {
						const Icon = item.icon
						if (item.soon) {
							return (
								<span
									key={item.label}
									className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground/70"
								>
									<Icon className="h-4 w-4" />
									{item.label}
								</span>
							)
						}
						const active = isActive(pathname, item)
						return (
							<Link
								key={item.label}
								href={item.href}
								aria-current={active ? "page" : undefined}
								title={collapsed ? item.label : undefined}
								className={cn(
									"flex items-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									collapsed ? "justify-center px-0 py-2.5" : "gap-2.5 px-3 py-2",
									item.highlight
										? active
											? "bg-primary/15 text-primary ring-1 ring-primary/30"
											: "bg-primary/5 text-primary ring-1 ring-primary/20 hover:bg-primary/10"
										: active
											? "bg-muted text-foreground"
											: "text-muted-foreground hover:bg-muted/60 hover:text-foreground",
								)}
							>
								<Icon className="h-4 w-4" />
								{!collapsed && (
									<span className="flex-1">{item.label}{navSuffix(item)}</span>
								)}
								{!collapsed && item.highlight && (
									<span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
										Hot
									</span>
								)}
							</Link>
						)
					})}
				</nav>

				<div
					className={cn(
						"mt-auto flex flex-col gap-1 border-t border-white/40 py-3",
						collapsed ? "px-2" : "px-3",
					)}
				>
					<AdminLink iconOnly={collapsed} />
					<PersonalLink iconOnly={collapsed} />
				</div>
			</aside>

			{/* ===================== TOP BAR (MOBILE) — giữ nguyên trải nghiệm cũ ===================== */}
			<header className="glass-header sticky top-0 z-40 w-full lg:hidden">
				<div className="container flex h-16 items-center justify-between gap-2">
					<div className="flex items-center gap-2">
						<Link
							href="/"
							className="flex items-center rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
							aria-label="HoaTieu — trang chủ"
						>
							<BrandLogo />
						</Link>
						<DiscoveryButton pathname={pathname} compact />
					</div>
					<div className="flex items-center gap-1">
						<NotificationBell />
						<AdminLink />
						<PersonalLink className="whitespace-nowrap" />
					</div>
				</div>
				<nav
					className="flex items-center gap-1 overflow-x-auto border-t px-3 py-2 [-webkit-overflow-scrolling:touch]"
					aria-label="Điều hướng chính (di động)"
				>
					{NAV.map((item) => {
						if (item.soon) {
							return (
								<span
									key={item.label}
									className="flex items-center gap-1 whitespace-nowrap rounded-md px-3 py-1.5 text-sm text-muted-foreground/70"
								>
									{item.label}
								</span>
							)
						}
						const active = isActive(pathname, item)
						return (
							<Link
								key={item.label}
								href={item.href}
								aria-current={active ? "page" : undefined}
								className={cn(
									"whitespace-nowrap rounded-md px-3 py-1.5 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
									item.highlight
										? "bg-primary/10 font-semibold text-primary ring-1 ring-primary/20"
										: active
											? "bg-muted text-foreground"
											: "text-muted-foreground",
								)}
							>
								{item.label}{navSuffix(item)}
							</Link>
						)
					})}
				</nav>
			</header>
		</>
	)
}
