import { cn } from "@/lib/utils"

// Logo thương hiệu HoaTieu: "Hoa" vàng nhạt và "Tieu" trắng trên nền tối
// để đảm bảo dễ đọc. (Đã bỏ ký hiệu alpha ở tên; α chỉ còn ở hiệu ứng nền AlphaWave.)
export function BrandLogo({ className }: { className?: string }) {
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-2.5 py-1.5 shadow-sm",
				className,
			)}
		>
			<span className="text-lg font-bold leading-none tracking-tight">
				<span className="text-[#ff8a73]">Hoa</span>
				<span className="text-white">Tieu</span>
			</span>
		</span>
	)
}
