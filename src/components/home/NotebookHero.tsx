import Link from "next/link"
import {
	ArrowRight,
	Compass,
	GraduationCap,
	LifeBuoy,
	MessageCircleQuestion,
	School,
	Star,
} from "lucide-react"

// Bảng giới thiệu các khu vực chính của nền tảng — thay cho mô hình sách 3D cũ.
// Chỉ thay đổi phần hiển thị (visual + copy); không đụng data/route/logic.
type IntroRow = {
	icon: typeof School
	area: string
	desc: string
	href: string
	cta: string
	soon?: boolean
}

const INTRO_ROWS: IntroRow[] = [
	{
		icon: School,
		area: "Trường đại học",
		desc: "Hồ sơ trường, học phí thật, điểm chuẩn 2025 và trải nghiệm từ chính sinh viên.",
		href: "/noi-dao-tao",
		cta: "Xem trường",
	},
	{
		icon: GraduationCap,
		area: "Ngành học",
		desc: "Thư viện ngành: học gì, ra trường làm gì, triển vọng và trường đào tạo.",
		href: "/nganh-hoc",
		cta: "Khám phá ngành",
	},
	{
		icon: Star,
		area: "Review giảng viên",
		desc: "Đánh giá giảng viên từ cộng đồng sinh viên — minh bạch, thật, có kiểm chứng.",
		href: "/noi-dao-tao",
		cta: "Sắp ra mắt",
		soon: true,
	},
	{
		icon: LifeBuoy,
		area: "Survival Guide",
		desc: "Cẩm nang sống sót sau THPT: nhập học, ký túc xá, học bổng, kỹ năng cần có.",
		href: "/cam-nang",
		cta: "Đọc cẩm nang",
	},
	{
		icon: MessageCircleQuestion,
		area: "Hỏi đáp",
		desc: "Đặt câu hỏi và tìm câu trả lời từ cộng đồng sinh viên đi trước.",
		href: "/cau-hoi-thuong-gap",
		cta: "Vào hỏi đáp",
	},
]

export function NotebookHero() {
	return (
		<section className="relative overflow-hidden border-b">
			<div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-primary/20 blur-3xl" />
			<div className="pointer-events-none absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" />

			<div className="container relative py-20 md:py-24">
				<div className="mx-auto max-w-3xl text-center">
					<span className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-medium text-accent sm:text-sm">
						<Compass className="h-3.5 w-3.5" /> Discovery Journey
					</span>
					<h1 className="mt-5 font-heading text-3xl font-bold leading-tight text-foreground sm:text-4xl md:text-5xl">
						Hạ tầng thông tin sau THPT của Việt Nam
					</h1>
					<p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
						Đánh giá trường, review giảng viên, chi phí thật, trải nghiệm thật — từ chính sinh viên.
					</p>
					<p className="mt-2 text-sm text-muted-foreground">
						Nơi mọi sinh viên Việt Nam chia sẻ, tra cứu và đưa ra quyết định sau THPT.
					</p>
					<div className="mt-8 flex flex-wrap justify-center gap-3">
						<Link
							href="/kham-pha"
							className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-md transition hover:-translate-y-0.5 hover:shadow-lg"
						>
							<Compass className="h-4 w-4" /> Bắt đầu Discovery Journey
						</Link>
						<Link
							href="/noi-dao-tao"
							className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
						>
							<School className="h-4 w-4" /> Xem trường đại học
						</Link>
					</div>
				</div>

				{/* Bảng giới thiệu nền tảng (thay cho mô hình sách 3D) */}
				<div className="mx-auto mt-14 max-w-4xl overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
					<table className="w-full text-left text-sm">
						<thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
							<tr>
								<th className="px-5 py-3 font-semibold">Khu vực</th>
								<th className="hidden px-5 py-3 font-semibold sm:table-cell">Bạn làm được gì</th>
								<th className="px-5 py-3 text-right font-semibold">Đi tới</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-border">
							{INTRO_ROWS.map((row) => (
								<tr key={row.area} className="transition-colors hover:bg-muted/40">
									<td className="px-5 py-4">
										<div className="flex items-center gap-2.5 font-semibold text-foreground">
											<span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
												<row.icon className="h-4 w-4" />
											</span>
											{row.area}
										</div>
										<p className="mt-1.5 text-xs text-muted-foreground sm:hidden">{row.desc}</p>
									</td>
									<td className="hidden px-5 py-4 text-muted-foreground sm:table-cell">{row.desc}</td>
									<td className="px-5 py-4 text-right">
										{row.soon ? (
											<span className="inline-flex items-center gap-1 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
												{row.cta}
											</span>
										) : (
											<Link
												href={row.href}
												className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary transition hover:bg-primary/20"
											>
												{row.cta} <ArrowRight className="h-3.5 w-3.5" />
											</Link>
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</section>
	)
}
