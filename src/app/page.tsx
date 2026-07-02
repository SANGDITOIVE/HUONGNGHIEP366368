import Link from "next/link"
import {
	ArrowRight,
	BookOpen,
	Brain,
	ClipboardList,
	Compass,
	GraduationCap,
	Heart,
	ListChecks,
	Map,
	Scale,
	Share2,
	Sparkles,
	Target,
	Users,
	Users2,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { NotebookHero } from "@/components/home/NotebookHero"

type AboutFeature = { icon: LucideIcon; title: string; href: string; tag?: string; desc: string }

const ABOUT_FEATURES: AboutFeature[] = [
	{ icon: Compass, title: "Hành trình Khám phá Bản thân", href: "/kham-pha", tag: "Nên bắt đầu ở đây", desc: "Đi qua ba lớp: quan sát năng khiếu → khai thác tính cách &amp; giá trị → đối chiếu với bối cảnh thật của bạn." },
	{ icon: ClipboardList, title: "Đánh giá chuyên sâu", href: "/danh-gia", desc: "Bộ câu hỏi nhiều chiều: sở thích, kỹ năng, tính cách, hình mẫu, vùng kiến thức, đích đến nghề nghiệp → gợi ý 3–5 ngành có lý do rõ ràng." },
	{ icon: Brain, title: "Trắc nghiệm tính cách (MBTI)", href: "/trac-nghiem-tinh-cach", desc: "Phiên bản rút gọn, dễ hiểu, giúp bạn hiểu mình hợp môi trường làm việc nào — không dán nhãn cứng nhắc." },
	{ icon: GraduationCap, title: "Khám phá ngành học", href: "/nganh-hoc", desc: "Thư viện ngành: ra trường làm gì, triển vọng, ảnh hưởng AI, thu nhập tham khảo, tổ hợp xét tuyển và trường tiêu biểu." },
	{ icon: Scale, title: "So sánh ngành", href: "/so-sanh", desc: "Đặt hai, ba ngành cạnh nhau để nhìn thẳng vào điểm mạnh, điểm yếu và khác biệt." },
	{ icon: Map, title: "Bản đồ môn học → ngành", href: "/ban-do-mon-hoc", desc: "Bắt đầu từ môn bạn học tốt để thấy thế mạnh hiện tại có thể dẫn tới những ngành nào." },
	{ icon: BookOpen, title: "Cẩm nang &amp; câu chuyện", href: "/cam-nang", desc: "Bài viết ngắn dựa trên số liệu thật, luôn dẫn nguồn để bạn tự kiểm chứng." },
	{ icon: Users2, title: "Dành cho phụ huynh", href: "/danh-cho-phu-huynh", desc: "Góc riêng cho bố mẹ: cách đồng hành cùng con và cùng nhìn vào dữ liệu thay vì tranh luận hơn – thua." },
]

const STEPS = [
	{ icon: ListChecks, title: "Trả lời vài câu hỏi", desc: "Khối học, sở thích, kỹ năng, hoàn cảnh và định hướng nghề." },
	{ icon: Sparkles, title: "Hệ thống phân tích", desc: "Chấm điểm minh bạch theo nhiều yếu tố, không đoán mò." },
	{ icon: Target, title: "Nhận gợi ý ngành", desc: "Top ngành phù hợp, lý do rõ ràng và trường đào tạo." },
]

const FEATURES = [
	{ icon: Compass, title: "Đánh giá toàn diện", desc: "Không chỉ dựa vào tính cách — kết hợp sở thích, kỹ năng, hoàn cảnh gia đình và hình mẫu bạn hướng tới." },
	{ icon: Users, title: "MBTI là một phần", desc: "Nếu chưa hiểu rõ bản thân, bài trắc nghiệm ngắn giúp gợi mở — nhưng không quyết định thay bạn." },
	{ icon: GraduationCap, title: "Trường đào tạo minh bạch", desc: "Xếp hạng trường theo điểm nội bộ rõ tiêu chí, không mạo danh bảng xếp hạng quốc gia." },
]

export default function HomePage() {
	return (
		<div>
			<NotebookHero />

			{/* Cách hoạt động */}
			<section className="container py-16">
				<h2 className="text-center text-2xl font-bold md:text-3xl">3 bước đơn giản</h2>
				<div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{STEPS.map((s, i) => (
						<Card key={s.title}>
							<CardContent className="flex flex-col gap-3 p-6">
								<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
									<s.icon className="h-6 w-6" />
								</div>
								<div className="text-sm font-medium text-muted-foreground">Bước {i + 1}</div>
								<h3 className="text-lg font-semibold">{s.title}</h3>
								<p className="text-sm text-muted-foreground">{s.desc}</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			{/* Điểm mạnh */}
			<section className="border-t bg-card">
				<div className="container py-16">
					<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
						{FEATURES.map((f) => (
							<div key={f.title} className="flex flex-col gap-3">
								<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-accent/10 text-accent">
									<f.icon className="h-6 w-6" />
								</div>
								<h3 className="text-lg font-semibold">{f.title}</h3>
								<p className="text-sm text-muted-foreground">{f.desc}</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* Phương thức đánh giá 3 lớp */}
			<section className="border-t bg-card">
				<div className="container py-16">
					<div className="mx-auto max-w-3xl text-center">
						<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
							<Sparkles className="h-3.5 w-3.5" /> Phương thức đánh giá mới
						</span>
						<h2 className="mt-4 text-2xl font-bold md:text-3xl">Không đoán mò — kiểm chứng bằng bằng chứng</h2>
						<p className="mt-4 text-base leading-relaxed text-muted-foreground">
							Hành trình Khám phá Bản thân đi qua ba lớp nối tiếp nhau: từ giả thuyết về sở thích &amp; năng lực, đến việc bạn <strong className="text-foreground">thử làm việc thật</strong> để lấy bằng chứng, rồi đặt mọi thứ cạnh dữ liệu nghề nghiệp công khai. Mục tiêu là một quyết định bạn thật sự tin, chứ không phải một cái nhãn.
						</p>
					</div>
					<div className="mx-auto mt-10 grid max-w-5xl gap-6 sm:grid-cols-3">
						{[
							{ icon: Compass, n: "Lớp 1", t: "Giả thuyết", d: "Trắc nghiệm sở thích (RIASEC), mini-test năng lực và giá trị nghề → 2–3 hướng ngành đáng thử, kèm điều kiện xác nhận/bác bỏ." },
							{ icon: Target, n: "Lớp 2", t: "Bằng chứng", d: "Bạn làm thử bài tập mô phỏng đúng công việc thật. Hệ thống chấm năng lực và đo hứng thú trên hai trục riêng biệt." },
							{ icon: Scale, n: "Lớp 3", t: "Quyết định", d: "Đối chiếu kết quả với tỉ lệ việc làm, thu nhập, học phí và con đường thay thế — minh bạch nguồn để bạn tự kiểm chứng." },
						].map((s) => (
							<Card key={s.n}>
								<CardContent className="flex flex-col gap-3 p-6">
									<div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
										<s.icon className="h-6 w-6" />
									</div>
									<div className="text-sm font-medium text-muted-foreground">{s.n}</div>
									<h3 className="text-lg font-semibold">{s.t}</h3>
									<p className="text-sm leading-relaxed text-muted-foreground">{s.d}</p>
								</CardContent>
							</Card>
						))}
					</div>
					<div className="mt-8 text-center">
						<Link href="/kham-pha" className="inline-flex items-center gap-1 rounded-lg bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90">
							Bắt đầu Khám phá Bản thân <ArrowRight className="h-4 w-4" />
						</Link>
					</div>
				</div>
			</section>

			{/* Về HoaTieu — chuyển từ trang Giới thiệu về đây */}
			<section className="container py-16">
				<div className="mx-auto max-w-3xl">
					<h2 className="font-heading text-2xl font-bold sm:text-3xl">Về HoaTieu</h2>
					<p className="mt-4 text-base leading-relaxed text-muted-foreground">
						HoaTieu là người bạn đồng hành giúp bạn chọn ngành, chọn nghề một cách bình tĩnh và có cơ sở. Ở đây không có chuyện bói toán hay phán xét — chỉ có những câu hỏi tử tế, dữ liệu rõ ràng và quyền quyết định luôn thuộc về bạn.
					</p>
					<Card className="mt-6 border-primary/20 bg-primary/5">
						<CardContent className="space-y-3 p-6 leading-relaxed text-muted-foreground">
							<h3 className="flex items-center gap-2 font-semibold text-foreground">
								<Heart className="h-5 w-5 text-primary" /> Người làm ra HoaTieu
							</h3>
							<p>
								HoaTieu được mình — <strong className="text-foreground">LeQuangDai</strong> — tự tay làm ra, từ chính những đêm cuối cấp trằn trọc với một câu hỏi quen thuộc: rốt cuộc mình hợp ngành nào, nên theo nghề gì?
							</p>
							<p>
								Mình làm HoaTieu không phải để chọn thay bạn, mà để bạn <strong className="text-foreground">tự quyết một cách bình tĩnh và tự tin hơn</strong> — dựa trên dữ liệu công khai cùng cách chấm điểm minh bạch.
							</p>
						</CardContent>
					</Card>
				</div>

				<div className="mx-auto mt-10 max-w-5xl">
					<h3 className="text-xl font-bold sm:text-2xl">HoaTieu giúp bạn làm được gì?</h3>
					<div className="mt-5 grid gap-4 sm:grid-cols-2">
						{ABOUT_FEATURES.map((f) => {
							const Icon = f.icon
							return (
								<Link key={f.href + f.title} href={f.href} className="group">
									<Card className="h-full transition-all duration-200 hover:-translate-y-0.5 hover:border-primary hover:shadow-sm">
										<CardContent className="flex h-full flex-col p-5">
											<div className="flex items-center gap-3">
												<span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
													<Icon className="h-5 w-5" />
												</span>
												<h4 className="font-semibold leading-tight group-hover:text-primary">{f.title}</h4>
											</div>
											{f.tag ? (
												<span className="mt-3 w-fit rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">{f.tag}</span>
											) : null}
											<p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
											<span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
												Dùng thử <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
											</span>
										</CardContent>
									</Card>
								</Link>
							)
						})}
					</div>
				</div>
			</section>

			<section className="container py-12">
				<DisclaimerBanner />
			</section>
		</div>
	)
}
