import type { Metadata } from "next"
import Link from "next/link"
import {
	ArrowRight, HeartHandshake, Lightbulb, MessageCircleQuestion,
	ShieldCheck, TriangleAlert,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"

export const metadata: Metadata = {
	title: "Dành cho phụ huynh",
	description:
		"Gợi ý giúp cha mẹ đồng hành cùng con khi chọn ngành, chọn nghề sau lớp 12 — lắng nghe và định hướng thay vì áp đặt.",
}

const CONVERSATION_STARTERS = [
	"Con thấy mình thích làm việc gì đến mức quên cả thời gian?",
	"Môn học hay hoạt động nào khiến con thấy tự tin nhất?",
	"Con hình dung một ngày đi làm lý tưởng diễn ra như thế nào?",
	"Điều gì khiến con lo lắng nhất khi nghĩ về việc chọn ngành?",
	"Nếu không ai phán xét, con muốn thử sức ở lĩnh vực nào?",
]

const MISCONCEPTIONS = [
	{
		wrong: "Chọn ngành \u201chot\u201d là chắc chắn có việc.",
		right: "Ngành hot hôm nay có thể bão hoà sau 4 năm. Sự phù hợp và năng lực bền vững quan trọng hơn xu hướng nhất thời.",
	},
	{
		wrong: "Điểm cao thì cứ vào trường top, ngành nào cũng được.",
		right: "Học đúng ngành phù hợp giúp con đi đường dài, hơn là chọn theo danh tiếng trường trong ngắn hạn.",
	},
	{
		wrong: "Nghề của bố mẹ thì con nối nghiệp là an toàn nhất.",
		right: "Truyền thống gia đình là lợi thế, nhưng chỉ phát huy khi con thật sự có hứng thú và năng lực.",
	},
]

export default function PhuHuynhPage() {
	return (
		<div className="container max-w-3xl py-10">
			<div className="flex items-center gap-2 text-sm text-muted-foreground">
				<HeartHandshake className="h-4 w-4 text-primary" /> Dành cho cha mẹ
			</div>
			<h1 className="mt-1 text-3xl font-bold">Đồng hành cùng con khi chọn ngành</h1>
			<p className="mt-3 text-muted-foreground">
				Cha mẹ là người ảnh hưởng lớn nhất đến quyết định của con. Trang này gợi ý cách
				đồng hành: lắng nghe, đặt câu hỏi và cùng con tìm hiểu — thay vì quyết định thay con.
			</p>

			<Card className="mt-8 animate-fade-in-up border-primary/30 bg-primary/5">
				<CardContent className="flex gap-3 p-5">
					<Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
					<p className="text-sm text-muted-foreground">
						<span className="font-medium text-foreground">Nguyên tắc vàng:</span> hãy là người
						cố vấn, không phải người ra quyết định. Con sẽ đi xa hơn khi cảm thấy được tin tưởng
						và thật sự sở hữu lựa chọn của mình.
					</p>
				</CardContent>
			</Card>

			<section className="mt-10">
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<MessageCircleQuestion className="h-5 w-5 text-primary" /> Câu hỏi gợi mở để trò chuyện cùng con
				</h2>
				<div className="mt-4 space-y-2">
					{CONVERSATION_STARTERS.map((q, i) => (
						<div
							key={i}
							className="flex animate-fade-in-up items-start gap-3 rounded-lg border bg-card p-3"
							style={{ animationDelay: `${i * 50}ms` }}
						>
							<span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{i + 1}</span>
							<p className="text-sm">{q}</p>
						</div>
					))}
				</div>
			</section>

			<section className="mt-10">
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<ShieldCheck className="h-5 w-5 text-primary" /> Hiểu đúng về điểm gợi ý
				</h2>
				<p className="mt-3 text-sm text-muted-foreground">
					Điểm phù hợp trên web được tính minh bạch từ sở thích, kỹ năng, bối cảnh gia đình,
					hình mẫu và lĩnh vực hiểu biết của con. Đây là công cụ để mở ra cuộc trò chuyện,
					không phải kết luận cuối cùng và không phải xếp hạng chính thức của bất kỳ trường nào.
				</p>
			</section>

			<section className="mt-10">
				<h2 className="flex items-center gap-2 text-xl font-semibold">
					<TriangleAlert className="h-5 w-5 text-amber-600" /> Vài hiểu lầm thường gặp
				</h2>
				<div className="mt-4 grid gap-3">
					{MISCONCEPTIONS.map((m, i) => (
						<Card key={i} className="animate-fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
							<CardContent className="space-y-2 p-4">
								<p className="flex items-start gap-2 text-sm">
									<span className="font-medium text-amber-700">Hiểu lầm:</span>
									<span className="text-muted-foreground">{m.wrong}</span>
								</p>
								<p className="flex items-start gap-2 text-sm">
									<span className="font-medium text-green-700">Thực tế:</span>
									<span className="text-muted-foreground">{m.right}</span>
								</p>
							</CardContent>
						</Card>
					))}
				</div>
			</section>

			<div className="mt-10 flex flex-col gap-3 sm:flex-row">
				<Button asChild>
					<Link href="/danh-gia">Cùng con làm đánh giá <ArrowRight className="h-4 w-4" /></Link>
				</Button>
				<Button asChild variant="outline">
					<Link href="/cam-nang">Đọc cẩm nang hướng nghiệp</Link>
				</Button>
			</div>

			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}
