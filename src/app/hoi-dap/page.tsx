import { redirect } from "next/navigation"

// Hỏi đáp đã trở thành sub-tab của khu Cộng đồng.
export default function HoiDapPage() {
	redirect("/cong-dong/hoi-dap")
}
