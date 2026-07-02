import type {
	CareerDestinationId, EnvironmentId, FamilyFieldId, FamilySupportId,
	FollowFamilyId, InterestId, KnowledgeAreaId, RoleModelId, SkillId,
	StreamId, SubjectId, ValueId, WorkingStyleId,
} from "@/types"

export interface Option<T extends string> {
	id: T
	label: string
	hint?: string
}

export const STREAMS: Option<StreamId>[] = [
	{ id: "khoi-a", label: "Khối A (Toán – Lý – Hóa)" },
	{ id: "khoi-a1", label: "Khối A1 (Toán – Lý – Anh)" },
	{ id: "khoi-b", label: "Khối B (Toán – Hóa – Sinh)" },
	{ id: "khoi-c", label: "Khối C (Văn – Sử – Địa)" },
	{ id: "khoi-d", label: "Khối D (Toán – Văn – Anh)" },
	{ id: "ban-khtn", label: "Ban Khoa học tự nhiên" },
	{ id: "ban-khxh", label: "Ban Khoa học xã hội" },
	{ id: "chua-ro", label: "Chưa rõ / chưa chọn" },
]

export const SUBJECTS: Option<SubjectId>[] = [
	{ id: "toan", label: "Toán" },
	{ id: "ly", label: "Vật lý" },
	{ id: "hoa", label: "Hóa học" },
	{ id: "sinh", label: "Sinh học" },
	{ id: "van", label: "Ngữ văn" },
	{ id: "su", label: "Lịch sử" },
	{ id: "dia", label: "Địa lý" },
	{ id: "anh", label: "Tiếng Anh" },
	{ id: "tin", label: "Tin học" },
	{ id: "gdcd", label: "GDCD" },
	{ id: "my-thuat", label: "Mỹ thuật" },
	{ id: "am-nhac", label: "Âm nhạc" },
]

export const SKILLS: Option<SkillId>[] = [
	{ id: "tu-duy-logic", label: "Tư duy logic" },
	{ id: "tinh-toan", label: "Tính toán" },
	{ id: "giao-tiep", label: "Giao tiếp" },
	{ id: "viet-lach", label: "Viết lách" },
	{ id: "sang-tao", label: "Sáng tạo" },
	{ id: "lanh-dao", label: "Lãnh đạo" },
	{ id: "lam-viec-nhom", label: "Làm việc nhóm" },
	{ id: "ngoai-ngu", label: "Ngoại ngữ" },
	{ id: "ky-thuat-tay-nghe", label: "Kỹ thuật / tay nghề" },
	{ id: "tin-hoc", label: "Tin học" },
	{ id: "phan-tich-du-lieu", label: "Phân tích dữ liệu" },
	{ id: "thau-cam", label: "Thấu cảm" },
	{ id: "to-chuc-ky-luat", label: "Tổ chức, kỷ luật" },
	{ id: "thuyet-phuc", label: "Thuyết phục" },
]

export const INTERESTS: Option<InterestId>[] = [
	{ id: "cong-nghe", label: "Công nghệ" },
	{ id: "kinh-doanh", label: "Kinh doanh" },
	{ id: "nghe-thuat", label: "Nghệ thuật" },
	{ id: "con-nguoi", label: "Con người" },
	{ id: "khoa-hoc", label: "Khoa học" },
	{ id: "xa-hoi", label: "Xã hội" },
	{ id: "suc-khoe", label: "Sức khỏe" },
	{ id: "thien-nhien", label: "Thiên nhiên" },
	{ id: "ngon-ngu", label: "Ngôn ngữ" },
	{ id: "phap-luat", label: "Pháp luật" },
	{ id: "thiet-ke", label: "Thiết kế" },
	{ id: "giao-duc", label: "Giáo dục" },
]

export const WORKING_STYLES: Option<WorkingStyleId>[] = [
	{ id: "doc-lap", label: "Làm độc lập" },
	{ id: "lam-nhom", label: "Làm theo nhóm" },
	{ id: "co-cau-truc", label: "Có quy trình rõ ràng" },
	{ id: "linh-hoat", label: "Linh hoạt, tự do" },
	{ id: "thuc-hanh", label: "Thiên thực hành" },
	{ id: "nghien-cuu", label: "Thiên nghiên cứu" },
]

export const ENVIRONMENTS: Option<EnvironmentId>[] = [
	{ id: "van-phong", label: "Văn phòng" },
	{ id: "hien-truong", label: "Hiện trường / công trường" },
	{ id: "phong-lab", label: "Phòng thí nghiệm" },
	{ id: "sang-tao", label: "Môi trường sáng tạo" },
	{ id: "benh-vien", label: "Bệnh viện / cơ sở y tế" },
	{ id: "lop-hoc", label: "Lớp học" },
	{ id: "ngoai-troi", label: "Ngoài trời" },
	{ id: "so-hoa", label: "Môi trường số / remote" },
]

export const CAREER_DESTINATIONS: Option<CareerDestinationId>[] = [
	{ id: "doanh-nghiep", label: "Doanh nghiệp tư nhân" },
	{ id: "nha-nuoc", label: "Cơ quan nhà nước" },
	{ id: "khoi-cong-nghe", label: "Khối công nghệ" },
	{ id: "y-te", label: "Y tế" },
	{ id: "giao-duc", label: "Giáo dục" },
	{ id: "sang-tao-nghe-thuat", label: "Sáng tạo / nghệ thuật" },
	{ id: "phap-ly", label: "Pháp lý" },
	{ id: "khoi-nghiep", label: "Khởi nghiệp" },
	{ id: "nghien-cuu", label: "Nghiên cứu" },
	{ id: "lam-viec-quoc-te", label: "Làm việc quốc tế" },
]

export const FAMILY_SUPPORTS: Option<FamilySupportId>[] = [
	{ id: "ho-tro-manh", label: "Hỗ trợ mạnh", hint: "Học xa hay dài năm đều ổn" },
	{ id: "ho-tro-trung-binh", label: "Hỗ trợ trung bình", hint: "Ổn định nhưng cần cân nhắc" },
	{ id: "can-can-nhac-chi-phi", label: "Cần cân nhắc chi phí", hint: "Ưu tiên ngành chi phí hợp lý" },
	{ id: "can-di-lam-som", label: "Cần đi làm sớm", hint: "Ưu tiên ra trường nhanh" },
]

export const FOLLOW_FAMILY: Option<FollowFamilyId>[] = [
	{ id: "co", label: "Có, muốn theo định hướng gia đình" },
	{ id: "coi-mo", label: "Cởi mở, cân nhắc thêm" },
	{ id: "khong", label: "Không, muốn tự chọn hướng riêng" },
]

export const ROLE_MODELS: Option<RoleModelId>[] = [
	{ id: "nha-sang-lap", label: "Nhà sáng lập / khởi nghiệp" },
	{ id: "chuyen-gia-cong-nghe", label: "Chuyên gia công nghệ / lập trình" },
	{ id: "bac-si", label: "Bác sĩ / chuyên gia y tế" },
	{ id: "luat-su", label: "Luật sư / chuyên gia pháp lý" },
	{ id: "nha-quan-ly", label: "Lãnh đạo / nhà quản lý" },
	{ id: "chuyen-gia-tai-chinh", label: "Chuyên gia tài chính / đầu tư" },
	{ id: "nghe-si-sang-tao", label: "Nghệ sĩ / nhà thiết kế" },
	{ id: "nha-giao", label: "Giáo viên / giảng viên" },
	{ id: "nha-nghien-cuu", label: "Nhà khoa học / nghiên cứu" },
	{ id: "nha-truyen-thong", label: "Nhà báo / truyền thông" },
	{ id: "kien-truc-su", label: "Kiến trúc sư" },
	{ id: "chua-ro", label: "Chưa rõ" },
]

export const KNOWLEDGE_AREAS: Option<KnowledgeAreaId>[] = [
	{ id: "cong-nghe-may-tinh", label: "Công nghệ & máy tính" },
	{ id: "kinh-te-kinh-doanh", label: "Kinh tế & kinh doanh" },
	{ id: "suc-khoe-y-sinh", label: "Sức khỏe & y sinh" },
	{ id: "luat-xa-hoi", label: "Luật & xã hội" },
	{ id: "ky-thuat-xay-dung", label: "Kỹ thuật & xây dựng" },
	{ id: "nghe-thuat-thiet-ke", label: "Nghệ thuật & thiết kế" },
	{ id: "ngon-ngu-van-hoa", label: "Ngôn ngữ & văn hóa" },
	{ id: "khoa-hoc-tu-nhien", label: "Khoa học tự nhiên" },
	{ id: "giao-duc-su-pham", label: "Giáo dục & sư phạm" },
	{ id: "tam-ly-con-nguoi", label: "Tâm lý & con người" },
	{ id: "moi-truong-nong-nghiep", label: "Môi trường & nông nghiệp" },
	{ id: "truyen-thong-media", label: "Truyền thông & media" },
]

// Nền tảng gia đình dùng chung danh sách vùng kiến thức + "không có".
export const FAMILY_FIELDS: Option<FamilyFieldId>[] = [
	{ id: "khong-co", label: "Không có nền tảng sẵn" },
	...KNOWLEDGE_AREAS.map((k) => ({ id: k.id as FamilyFieldId, label: k.label })),
]

// Giá trị nghề nghiệp — điều người dùng coi trọng ở công việc tương lai.
export const VALUES: Option<ValueId>[] = [
	{ id: "thu-nhap-cao", label: "💰 Thu nhập cao", hint: "Mức lương hấp dẫn" },
	{ id: "on-dinh", label: "🛡️ Ổn định, an toàn", hint: "Công việc bền vững, ít rủi ro" },
	{ id: "giup-do-nguoi-khac", label: "🤝 Giúp đỡ người khác", hint: "Mang lại lợi ích cho người khác" },
	{ id: "sang-tao-tu-do", label: "🎨 Sáng tạo, thể hiện bản thân", hint: "Được tự do sáng tạo" },
	{ id: "tu-chu-linh-hoat", label: "🧭 Tự chủ, linh hoạt", hint: "Chủ động thời gian và cách làm" },
	{ id: "thang-tien", label: "📈 Cơ hội thăng tiến", hint: "Lộ trình phát triển rõ ràng" },
	{ id: "duoc-ton-trong", label: "🏅 Được tôn trọng", hint: "Vị thế, uy tín trong xã hội" },
	{ id: "thu-thach-tri-tue", label: "🧠 Thử thách trí tuệ", hint: "Công việc đòi hỏi tư duy" },
	{ id: "can-bang-cuoc-song", label: "⚖️ Cân bằng cuộc sống", hint: "Hài hòa công việc và cá nhân" },
	{ id: "tac-dong-xa-hoi", label: "🌍 Tạo tác động xã hội", hint: "Đóng góp cho cộng đồng" },
]
