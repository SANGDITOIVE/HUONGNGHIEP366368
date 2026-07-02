import { redirect } from "next/navigation"

// Trang chọn trường đã được gộp vào khu Cộng đồng → sub-tab "Theo trường".
export default function ChonTruongPage() {
	redirect("/cong-dong/truong")
}
