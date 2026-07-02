"use client"
// Giới thiệu PHƯƠNG THỨC và HIỆU QUẢ của hệ thống đánh giá Discovery Journey.
// Dùng ở đầu trang Khám phá bản thân và có thể tái sử dụng ở trang chủ.
import { Compass, FlaskConical, BarChart3, ShieldCheck } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const LAYERS = [
	{
		icon: Compass,
		tag: "Lớp 1",
		title: "Giả thuyết — chưa phải kết luận",
		desc: "Bắt đầu bằng trắc nghiệm sở thích RIASEC (42 câu), mini-test năng lực và bộ giá trị nghề nghiệp. Hệ thống đưa ra 3 GIẢ THUYẾT nghề nghiệp với độ tin cậy có chủ đích để THẤP — vì chưa có bằng chứng thực hành.",
	},
	{
		icon: FlaskConical,
		tag: "Lớp 2",
		title: "Bằng chứng — làm thử việc thật",
		desc: "Bạn làm các micro-task mô phỏng công việc thực tế của từng cụm ngành. Mỗi bài được chấm theo 2 TRỤC riêng biệt: Năng lực thực tế và Hứng thú thật sự — để phân biệt ‘thích’ và ‘giỏi’.",
	},
	{
		icon: BarChart3,
		tag: "Lớp 3",
		title: "Quyết định có dữ liệu",
		desc: "Kết hợp bằng chứng với dữ liệu đầu ra thực tế (tỉ lệ việc làm, lương tham khảo, học phí, ROI, con đường thay thế) và ràng buộc gia đình để bạn TỰ ra quyết định — hệ thống không quyết định thay.",
	},
]

const BENEFITS = [
	"Phân biệt rõ ‘thích’ và ‘có năng lực’ nhờ đo lường 2 trục độc lập.",
	"Kiểm chứng bằng trải nghiệm thực tế, không chỉ dựa vào cảm tính.",
	"Luôn minh bạch đây là giả thuyết, tránh gán nhãn sớm.",
	"Dữ liệu trường/ngành/lương gắn với bối cảnh Việt Nam.",
]

export function Methodology() {
	return (
		<div className="space-y-8">
			<div className="space-y-3 text-center">
				<Badge variant="accent" className="mx-auto">Phương pháp Discovery Journey</Badge>
				<h2 className="text-2xl font-bold md:text-3xl">Hệ thống đánh giá 3 lớp</h2>
				<p className="mx-auto max-w-2xl text-sm text-muted-foreground md:text-base">
					Thay vì “test xong dán nhãn”, HoaTieu dẫn bạn đi qua một hành trình: đặt giả thuyết → kiểm chứng bằng việc làm thật → ra quyết định dựa trên dữ liệu.
				</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				{LAYERS.map((l) => (
					<Card key={l.tag} className="h-full">
						<CardContent className="space-y-3 p-5">
							<div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
								<l.icon className="h-6 w-6" />
							</div>
							<Badge variant="muted">{l.tag}</Badge>
							<h3 className="font-semibold">{l.title}</h3>
							<p className="text-sm text-muted-foreground">{l.desc}</p>
						</CardContent>
					</Card>
				))}
			</div>

			<Card>
				<CardContent className="space-y-3 p-5">
					<div className="flex items-center gap-2">
						<ShieldCheck className="h-5 w-5 text-accent" />
						<h3 className="font-semibold">Vì sao cách này hiệu quả hơn?</h3>
					</div>
					<ul className="grid gap-2 md:grid-cols-2">
						{BENEFITS.map((b) => (
							<li key={b} className="flex items-start gap-2 text-sm text-muted-foreground">
								<span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
								{b}
							</li>
						))}
					</ul>
				</CardContent>
			</Card>
		</div>
	)
}
