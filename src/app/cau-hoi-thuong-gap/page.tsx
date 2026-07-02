import type { Metadata } from "next"
import Link from "next/link"
import { HelpCircle } from "lucide-react"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"

export const metadata: Metadata = {
	title: "Câu hỏi thường gặp",
	description:
		"Giải đáp cách dùng HoaTieu, cách hiểu kết quả gợi ý ngành, điểm nội bộ của trường và những lưu ý khi chọn ngành sau lớp 12.",
}

interface QA {
	q: string
	a: string[]
}

const FAQS: QA[] = [
	{
		q: "Trang web này giúp gì cho em?",
		a: [
			"HoaTieu giúp em hệ thống lại sở thích, kỹ năng, khối học, bối cảnh gia đình và tính cách, rồi gợi ý những ngành học có thể phù hợp để em tìm hiểu thêm.",
			"Đây là công cụ tham khảo để em tự khám phá, không phải bài kiểm tra chính thức và không quyết định thay em.",
		],
	},
	{
		q: "Kết quả gợi ý ngành có chính xác không?",
		a: [
			"Kết quả dựa trên câu trả lời của em và một công thức chấm điểm minh bạch (em có thể xem từng yếu tố đóng góp bao nhiêu ở trang Kết quả).",
			"Vì con người rất đa dạng, hãy xem gợi ý như điểm khởi đầu để tìm hiểu thêm, không phải kết luận cuối cùng. Hãy đọc kỹ phần cơ hội và thách thức của mỗi ngành.",
		],
	},
	{
		q: "“Điểm nội bộ” khi xếp các trường nghĩa là gì?",
		a: [
			"Điểm nội bộ là con số do HoaTieu tự tính để sắp thứ tự tương đối giữa các trường, tổng hợp từ uy tín chương trình, thế mạnh đào tạo, độ liên quan và mức độ được công nhận.",
			"Đây KHÔNG phải xếp hạng quốc gia chính thức và KHÔNG phải điểm chuẩn tuyển sinh. Khi đăng ký, em phải tra cứu thông tin chính thức từ website của trường và Bộ GD&ĐT.",
		],
	},
	{
		q: "Em chưa biết mình thích gì thì bắt đầu từ đâu?",
		a: [
			"Hãy làm bài đánh giá: em chỉ cần chọn những môn, hoạt động và môi trường em thấy dễ chịu nhất. Không có câu trả lời đúng hay sai.",
			"Em cũng có thể đọc mục Cẩm nang để hiểu thêm cách khám phá bản thân trước khi chọn ngành.",
		],
	},
	{
		q: "MBTI quan trọng đến mức nào khi chọn ngành?",
		a: [
			"MBTI chỉ là một góc nhìn tham khảo về phong cách làm việc, không quyết định em hợp hay không hợp một ngành.",
			"Trong HoaTieu, tính cách chỉ là một trong nhiều yếu tố; sở thích, kỹ năng và điều kiện thực tế cũng được cân nhắc.",
		],
	},
	{
		q: "Dữ liệu ngành và trường lấy từ đâu?",
		a: [
			"Dữ liệu ngành được biên soạn dưới dạng mô tả tổng quan mang tính tham khảo, tập trung giải thích bản chất công việc và hướng phát triển.",
			"Về tuyển sinh (điểm chuẩn, tổ hợp, chỉ tiêu), em luôn cần kiểm tra thông tin mới nhất từ nguồn chính thức vì các con số thay đổi theo từng năm.",
		],
	},
	{
		q: "Em nên nghe theo gợi ý hay theo gia đình?",
		a: [
			"Không có đáp án chung. Gợi ý của HoaTieu, mong muốn của em và góc nhìn của gia đình đều là thông tin để em cân nhắc.",
			"Hãy trao đổi thẳng thắn với gia đình dựa trên dữ liệu cụ thể (cơ hội, thách thức, chi phí) thay vì cảm tính. Trang dành cho phụ huynh có thể hỗ trợ cuộc trò chuyện này.",
		],
	},
	{
		q: "Làm sao lưu và so sánh các ngành?",
		a: [
			"Ở trang Khám phá ngành hoặc trang chi tiết mỗi ngành, em bấm biểu tượng ghim để lưu ngành quan tâm.",
			"Sau đó vào mục So sánh trên thanh menu để xem các ngành đã ghim cạnh nhau theo từng tiêu chí.",
		],
	},
	{
		q: "Dữ liệu của em có bị gửi đi đâu không?",
		a: [
			"Không. Câu trả lời đánh giá và danh sách ngành đã ghim chỉ được lưu ngay trên trình duyệt của em (localStorage), không gửi về máy chủ.",
			"Nếu em xóa dữ liệu trình duyệt hoặc dùng thiết bị khác, các lựa chọn đã lưu sẽ không còn.",
		],
	},
]

export default function FaqPage() {
	return (
		<div className="container max-w-3xl py-10">
			<div className="flex items-center gap-2 text-sm font-medium text-primary">
				<HelpCircle className="h-4 w-4" /> Hỗ trợ
			</div>
			<h1 className="mt-2 text-3xl font-bold sm:text-4xl">Câu hỏi thường gặp</h1>
			<p className="mt-3 text-muted-foreground">
				Những thắc mắc phổ biến khi dùng HoaTieu và khi chọn ngành sau lớp 12.
			</p>

			<div className="mt-8 space-y-3">
				{FAQS.map((item) => (
					<details
						key={item.q}
						className="group rounded-lg border bg-card p-4 [&_summary::-webkit-details-marker]:hidden"
					>
						<summary className="flex cursor-pointer items-center justify-between gap-3 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
							<span>{item.q}</span>
							<span className="shrink-0 text-muted-foreground transition-transform group-open:rotate-45" aria-hidden="true">+</span>
						</summary>
						<div className="mt-3 space-y-2 text-sm leading-relaxed text-muted-foreground">
							{item.a.map((p) => (
								<p key={p}>{p}</p>
							))}
						</div>
					</details>
				))}
			</div>

			<div className="mt-8 rounded-lg border bg-muted/40 p-4 text-sm text-muted-foreground">
				Còn thắc mắc khác? Hãy bắt đầu bằng{" "}
				<Link href="/danh-gia" className="font-medium text-primary underline">bài đánh giá</Link>{" "}
				hoặc đọc thêm trong{" "}
				<Link href="/cam-nang" className="font-medium text-primary underline">Cẩm nang</Link>.
			</div>

			<div className="mt-10">
				<DisclaimerBanner />
			</div>
		</div>
	)
}
