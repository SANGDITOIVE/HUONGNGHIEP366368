import { Info } from "lucide-react"

export function DisclaimerBanner() {
	return (
		<div className="flex items-start gap-3 rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm">
			<Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
			<p className="text-muted-foreground">
				<span className="font-medium text-foreground">Lưu ý:</span> Đây là công cụ hỗ trợ
				định hướng, không phải phán quyết về tương lai. Hãy dùng kết quả để tham
				khảo, kết hợp với tư vấn từ thầy cô, gia đình và trải nghiệm thực tế của bản thân.
			</p>
		</div>
	)
}
