// Nguồn: majors_groups.csv (28 nhóm ngành — source of truth cho trang Khám phá).
// Đã sửa lỗi dữ liệu "Khách sạn,borough Quản trị..." -> "Khách sạn, Quản trị...".
// category dùng cho bộ lọc trên trang Khám phá ngành.

export type GroupCategory =
	| "kinh-te" | "phap-luat" | "cong-nghe" | "ky-thuat" | "y-te"
	| "su-pham" | "truyen-thong" | "tam-ly" | "kien-truc"
	| "ngoai-ngu" | "nghe-thuat" | "khoa-hoc" | "nong-nghiep"
	| "dich-vu" | "an-ninh" | "moi-truong"

export interface MajorGroup {
	id: string
	name: string
	category: GroupCategory
	examples: string[]
}

export const GROUP_CATEGORIES: { id: GroupCategory; label: string }[] = [
	{ id: "kinh-te", label: "Kinh tế" },
	{ id: "phap-luat", label: "Pháp luật" },
	{ id: "cong-nghe", label: "Công nghệ" },
	{ id: "ky-thuat", label: "Kỹ thuật" },
	{ id: "y-te", label: "Y tế" },
	{ id: "su-pham", label: "Sư phạm" },
	{ id: "truyen-thong", label: "Truyền thông" },
	{ id: "tam-ly", label: "Tâm lý" },
	{ id: "kien-truc", label: "Kiến trúc & Xây dựng" },
	{ id: "ngoai-ngu", label: "Ngoại ngữ" },
	{ id: "nghe-thuat", label: "Nghệ thuật" },
	{ id: "khoa-hoc", label: "Khoa học" },
	{ id: "nong-nghiep", label: "Nông – Lâm – Thủy sản" },
	{ id: "dich-vu", label: "Dịch vụ & Vận tải" },
	{ id: "an-ninh", label: "An ninh – Quốc phòng" },
	{ id: "moi-truong", label: "Môi trường" },
]

export const MAJOR_GROUPS: MajorGroup[] = [
	{ id: "khoa-hoc-giao-duc", name: "Khoa học giáo dục & Đào tạo giáo viên", category: "su-pham", examples: ["Khoa học giáo dục", "Giáo dục tiểu học", "Giáo dục mầm non", "Sư phạm các môn"] },
	{ id: "nghe-thuat", name: "Nghệ thuật", category: "nghe-thuat", examples: ["Âm nhạc", "Mỹ thuật", "Thiết kế đồ họa", "Thiết kế thời trang", "Nghệ thuật biểu diễn", "Game đa phương tiện"] },
	{ id: "nhan-van", name: "Nhân văn", category: "khoa-hoc", examples: ["Văn học", "Ngôn ngữ Việt", "Văn hóa học", "Lịch sử", "Triết học", "Tôn giáo học"] },
	{ id: "khoa-hoc-xa-hoi", name: "Khoa học xã hội & Hành vi", category: "tam-ly", examples: ["Tâm lý học", "Xã hội học", "Khoa học truyền thông", "Công tác xã hội"] },
	{ id: "bao-chi-thong-tin", name: "Báo chí & Thông tin", category: "truyen-thong", examples: ["Báo chí", "Truyền thông đa phương tiện", "Thông tin học", "Quản trị thông tin"] },
	{ id: "kinh-doanh-quan-ly", name: "Kinh doanh & Quản lý", category: "kinh-te", examples: ["Quản trị kinh doanh", "Quản trị nhân lực", "Marketing", "Logistics", "Kinh doanh quốc tế", "Thương mại điện tử"] },
	{ id: "phap-luat", name: "Pháp luật", category: "phap-luat", examples: ["Luật Kinh tế", "Luật Dân sự", "Luật Hành chính", "Tố tụng", "Dịch vụ pháp lý"] },
	{ id: "khoa-hoc-su-song", name: "Khoa học sự sống", category: "khoa-hoc", examples: ["Khoa học sinh học", "Công nghệ sinh học", "Vi sinh", "Hóa sinh"] },
	{ id: "khoa-hoc-tu-nhien", name: "Khoa học tự nhiên", category: "khoa-hoc", examples: ["Toán học", "Thống kê", "Vật lý", "Hóa học", "Khoa học môi trường"] },
	{ id: "may-tinh-cntt", name: "Máy tính & CNTT", category: "cong-nghe", examples: ["Khoa học máy tính", "Kỹ thuật phần mềm", "Hệ thống thông tin", "An ninh mạng", "AI", "Khoa học dữ liệu"] },
	{ id: "cong-nghe-ky-thuat", name: "Công nghệ kỹ thuật", category: "ky-thuat", examples: ["Công nghệ ô tô", "Điện – Điện tử", "Tự động hóa", "Cơ khí", "Kỹ thuật máy lạnh", "Vi mạch bán dẫn"] },
	{ id: "san-xuat-che-bien", name: "Kỹ thuật Sản xuất & Chế biến", category: "ky-thuat", examples: ["Công nghệ chế biến thực phẩm", "Công nghệ vật liệu", "Công nghệ hóa học", "Công nghệ sinh-hóa"] },
	{ id: "kien-truc-xay-dung", name: "Kiến trúc & Xây dựng", category: "kien-truc", examples: ["Kiến trúc", "Xây dựng dân dụng", "Xây dựng giao thông", "Quản lý xây dựng"] },
	{ id: "nong-lam-thuy-san", name: "Nông, Lâm & Thủy sản", category: "nong-nghiep", examples: ["Nông nghiệp", "Lâm học", "Thủy sản", "Nông nghiệp công nghệ cao"] },
	{ id: "thu-y", name: "Thú y", category: "nong-nghiep", examples: ["Bác sĩ thú y"] },
	{ id: "suc-khoe", name: "Sức khỏe", category: "y-te", examples: ["Y đa khoa", "Dược", "Điều dưỡng", "Hộ sinh", "Y học cổ truyền", "Kỹ thuật hình ảnh y học", "Phục hồi chức năng"] },
	{ id: "du-lich-khach-san", name: "Du lịch, Khách sạn & Dịch vụ cá nhân", category: "dich-vu", examples: ["Du lịch", "Khách sạn", "Quản trị nhà hàng", "Hướng dẫn du lịch", "Tiếp viên hàng không"] },
	{ id: "dich-vu-van-tai", name: "Dịch vụ vận tải", category: "dich-vu", examples: ["Hàng hải", "Khai thác vận tải", "Hàng không", "Kinh tế vận tải"] },
	{ id: "moi-truong", name: "Môi trường & Bảo vệ môi trường", category: "moi-truong", examples: ["Tài nguyên môi trường", "Kỹ thuật môi trường"] },
	{ id: "an-ninh-quoc-phong", name: "An ninh & Quốc phòng", category: "an-ninh", examples: ["Công an", "Quân đội", "Quốc phòng"] },
	{ id: "ngoai-ngu", name: "Ngoại ngữ", category: "ngoai-ngu", examples: ["Ngôn ngữ Anh", "Tiếng Trung", "Tiếng Nhật", "Tiếng Hàn", "Tiếng Đức"] },
	{ id: "su-pham", name: "Sư phạm", category: "su-pham", examples: ["Sư phạm Toán", "Sư phạm Lý", "Sư phạm Hóa", "Sư phạm Văn", "Giáo dục đặc biệt"] },
	{ id: "tai-chinh-ngan-hang", name: "Tài chính – Ngân hàng", category: "kinh-te", examples: ["Tài chính – Ngân hàng", "Kế toán", "Kiểm toán", "Bảo hiểm"] },
	{ id: "kinh-te", name: "Kinh tế", category: "kinh-te", examples: ["Kinh tế học", "Kinh tế quốc tế", "Kinh tế phát triển"] },
	{ id: "cong-nghiep-ban-dan", name: "Công nghiệp bán dẫn", category: "cong-nghe", examples: ["Vi mạch bán dẫn", "Công nghệ bán dẫn"] },
	{ id: "the-duc-the-thao", name: "Thể dục – Thể thao", category: "khoa-hoc", examples: ["Thể thao học", "Quản lý thể thao"] },
	{ id: "tam-ly", name: "Tâm lý", category: "tam-ly", examples: ["Tâm lý học", "Tâm lý giáo dục"] },
	{ id: "van-hoa-chinh-tri", name: "Văn hóa – Chính trị", category: "khoa-hoc", examples: ["Văn hóa học", "Chính trị học", "Khoa học xã hội"] },
]
