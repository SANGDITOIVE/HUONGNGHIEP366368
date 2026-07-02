import Link from "next/link"
import { BrandLogo } from "@/components/layout/BrandLogo"

const LINK_CLASS =
	"rounded hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"

const GROUPS = [
	{
		title: "Khám phá",
		links: [
			{ href: "/kham-pha", label: "Khám phá bản thân" },
			{ href: "/nganh-hoc", label: "Danh sách ngành" },
			{ href: "/ban-do-mon-hoc", label: "Tìm theo môn học" },
			{ href: "/so-sanh", label: "So sánh ngành" },
		],
	},
	{
		title: "Tìm hiểu",
		links: [
			{ href: "/cam-nang", label: "Cẩm nang" },
			{ href: "/cau-hoi-thuong-gap", label: "Câu hỏi thường gặp" },
			{ href: "/danh-cho-phu-huynh", label: "Dành cho phụ huynh" },
		],
	},
]

export function SiteFooter() {
	return (
		<footer className="glass border-t">
			<div className="container grid gap-8 py-10 text-sm md:grid-cols-[1.6fr_1fr_1fr]">
				<div className="max-w-sm space-y-3">
					<BrandLogo />
					<p className="text-muted-foreground">
						Discovery Journey — nơi mọi sinh viên Việt Nam chia sẻ, tra cứu
						và đưa ra quyết định sau THPT. Thông tin mang tính tham khảo,
						quyền quyết định luôn thuộc về bạn.
					</p>
				</div>
				{GROUPS.map((group) => (
					<div key={group.title}>
						<p className="font-medium text-foreground">{group.title}</p>
						<ul className="mt-3 space-y-2 text-muted-foreground">
							{group.links.map((link) => (
								<li key={link.href}>
									<Link href={link.href} className={LINK_CLASS}>
										{link.label}
									</Link>
								</li>
							))}
						</ul>
					</div>
				))}
			</div>
			<div className="border-t py-4 text-center text-xs text-muted-foreground">
				© {new Date().getFullYear()} HoaTieu · Được xây dựng cho cộng đồng sinh viên Việt Nam{" "}
				<span className="font-medium text-foreground">· Pro-Đa-Zi-Năng &amp; QuangDai368</span>
			</div>
		</footer>
	)
}
