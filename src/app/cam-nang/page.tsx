import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, BookOpen, Clock, HelpCircle, Quote } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { STORIES } from "@/data/stories"
import { ARTICLES } from "@/data/articles"
import { FIELD_BY_ID } from "@/data/majorFields"

export const metadata: Metadata = {
	title: "Cẩm nang & câu chuyện hướng nghiệp",
	description:
		"Câu chuyện chọn ngành minh hoạ và các bài viết cẩm nang giúp học sinh THPT định hướng nghề nghiệp một cách thực tế.",
}

export default function CamNangPage() {
	return (
		<div className="container py-10">
			<div className="max-w-2xl">
				<h1 className="text-3xl font-bold">Cẩm nang & câu chuyện hướng nghiệp</h1>
				<p className="mt-3 text-muted-foreground">
					Vài bài viết ngắn dựa trên số liệu thật và những lộ trình minh hoạ gần
					gũi — để bạn nhìn nghề nghiệp một cách thực tế và nhẹ nhàng hơn, trước
					khi quyết định con đường cho riêng mình.
				</p>
			</div>

			{/* Bài viết cẩm nang */}
			<section className="mt-10">
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<BookOpen className="h-5 w-5 text-primary" /> Bài viết cẩm nang
				</h2>
				<div className="mt-4 grid gap-4 md:grid-cols-2">
					{ARTICLES.map((a, idx) => (
						<Link key={a.slug} href={`/cam-nang/${a.slug}`} className="group">
							<Card className="h-full animate-fade-in-up transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm" style={{ animationDelay: `${idx * 50}ms` }}>
								<CardHeader>
									<div className="flex items-center justify-between gap-2">
										<Badge variant="muted" className="w-fit">{a.category}</Badge>
										<span className="flex items-center gap-1 text-xs text-muted-foreground"><Clock className="h-3 w-3" /> {a.readingMinutes} phút</span>
									</div>
									<CardTitle className="mt-2 text-lg group-hover:text-primary">{a.title}</CardTitle>
								</CardHeader>
								<CardContent>
									<p className="text-sm text-muted-foreground">{a.description}</p>
									<span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
										Đọc bài <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
									</span>
								</CardContent>
							</Card>
						</Link>
					))}
				</div>
			</section>

			{/* Câu chuyện nghề nghiệp */}
			<section className="mt-12">
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<Quote className="h-5 w-5 text-primary" /> Câu chuyện nghề nghiệp
				</h2>
				<p className="mt-1 text-sm text-muted-foreground">
					Các nhân vật dưới đây là ví dụ minh hoạ điển hình về lộ trình, không phải người có thật.
				</p>
				<div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
					{STORIES.map((s, idx) => {
						const field = FIELD_BY_ID[s.fieldId]
						return (
							<Card key={s.id} className="flex h-full flex-col animate-fade-in-up" style={{ animationDelay: `${idx * 50}ms` }}>
								<CardContent className="flex flex-1 flex-col p-5">
									<div className="flex items-center gap-3">
										<span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted text-2xl">{s.avatar}</span>
										<div>
											<p className="font-semibold">{s.name} · {s.role}</p>
											<p className="text-xs text-muted-foreground">{s.from}</p>
										</div>
									</div>
									<blockquote className="mt-3 border-l-2 border-primary/40 pl-3 text-sm italic text-muted-foreground">
										&ldquo;{s.quote}&rdquo;
									</blockquote>
									<ol className="mt-3 space-y-1.5">
										{s.journey.map((step, i) => (
											<li key={i} className="flex gap-2 text-xs text-muted-foreground">
												<span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] font-medium text-primary">{i + 1}</span>
												{step}
											</li>
										))}
									</ol>
									{field && (
										<div className="mt-4 pt-3">
											<Link href="/nganh-hoc" className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline">
												{field.icon} Khám phá lĩnh vực {field.name} <ArrowRight className="h-3 w-3" />
											</Link>
										</div>
									)}
								</CardContent>
							</Card>
						)
					})}
				</div>
			</section>

			{/* Câu hỏi thường gặp */}
			<section className="mt-12">
				<Card className="bg-muted/30">
					<CardContent className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
						<div>
							<h2 className="flex items-center gap-2 text-lg font-semibold">
								<HelpCircle className="h-5 w-5 text-primary" /> Câu hỏi thường gặp
							</h2>
							<p className="mt-1 text-sm text-muted-foreground">
								Những thắc mắc phổ biến khi chọn ngành, chọn trường và khi dùng HoaTieu.
							</p>
						</div>
						<Link
							href="/cau-hoi-thuong-gap"
							className="inline-flex shrink-0 items-center gap-1 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-transform hover:scale-[1.02]"
						>
							Xem câu hỏi thường gặp <ArrowRight className="h-4 w-4" />
						</Link>
					</CardContent>
				</Card>
			</section>

			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}
