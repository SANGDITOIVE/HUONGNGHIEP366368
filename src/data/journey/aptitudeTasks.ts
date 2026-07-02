// =============================================================
// FUNCTION 1 — LỚP QUAN SÁT (5 mini-task). Nội dung tĩnh.
// Mỗi lựa chọn gắn với 1 trục năng khiếu; engine cộng điểm.
// Không hỏi "em thích gì" — tất cả đều là việc để LÀM/QUAN SÁT.
// =============================================================
import type { AxisId, RoleTendency } from "@/lib/journey/types"

// ---------- Task 1: Nhận diện quy luật ----------
// Làm đúng -> phản ánh tư duy logic (Dữ liệu + Kỹ thuật).
export interface PatternQuestion {
	id: string
	sequence: string
	options: string[]
	correctIndex: number
}

export const PATTERN_TASK_AXES: AxisId[] = ["du-lieu", "ky-thuat"]

export const PATTERN_QUESTIONS: PatternQuestion[] = [
	{
		id: "p1",
		sequence: "⬆️ ➡️ ⬇️ ⬅️ ⬆️ ➡️ …",
		options: ["⬇️", "⬆️", "⬅️", "➡️"],
		correctIndex: 0,
	},
	{
		id: "p2",
		sequence: "2️⃣ 4️⃣ 6️⃣ 8️⃣ …",
		options: ["9️⃣", "🔟", "7️⃣", "1️⃣"],
		correctIndex: 1,
	},
	{
		id: "p3",
		sequence: "🔺 🔻 🔺 🔻 🔺 …",
		options: ["🔺", "🔻", "⬛", "🔵"],
		correctIndex: 1,
	},
	{
		id: "p4",
		sequence: "🌑 🌓 🌕 🌗 🌑 …",
		options: ["🌕", "🌗", "🌓", "⭐"],
		correctIndex: 2,
	},
	{
		id: "p5",
		sequence: "🔴 🟠 🟡 🟢 🔵 …",
		options: ["⚫", "🟣", "🔴", "⚪"],
		correctIndex: 1,
	},
	{
		id: "p6",
		sequence: "1️⃣ 1️⃣ 2️⃣ 3️⃣ 5️⃣ 8️⃣ …",
		options: ["1️⃣1️⃣", "9️⃣", "1️⃣3️⃣", "1️⃣0️⃣"],
		correctIndex: 2,
	},
]

// ---------- Task 2: Liên kết ý nghĩa ----------
// Chọn 2 từ thấy "gần" nhất với từ trung tâm.
// Lựa chọn nghiêng về nghĩa đen / cảm xúc / kỹ thuật / hình ảnh...
export interface WordOption {
	id: string
	label: string
	axis: AxisId
}
export interface WordQuestion {
	id: string
	center: string
	pick: number
	options: WordOption[]
}

export const WORD_QUESTIONS: WordQuestion[] = [
	{
		id: "w1",
		center: "NƯỚC",
		pick: 2,
		options: [
			{ id: "w1a", label: "Dòng sông, biển cả", axis: "tu-nhien" },
			{ id: "w1b", label: "Công thức H₂O", axis: "du-lieu" },
			{ id: "w1c", label: "Sự sống, khởi nguồn", axis: "sang-tao" },
			{ id: "w1d", label: "Đường ống, máy bơm", axis: "ky-thuat" },
			{ id: "w1e", label: "Cơn khát của con người", axis: "con-nguoi" },
			{ id: "w1f", label: "Phân phối, điều tiết", axis: "to-chuc" },
		],
	},
	{
		id: "w2",
		center: "ÁNH SÁNG",
		pick: 2,
		options: [
			{ id: "w2a", label: "Mặt trời, cây cối", axis: "tu-nhien" },
			{ id: "w2b", label: "Bóng đèn, mạch điện", axis: "ky-thuat" },
			{ id: "w2c", label: "Hy vọng, niềm tin", axis: "sang-tao" },
			{ id: "w2d", label: "Bước sóng, quang phổ", axis: "du-lieu" },
			{ id: "w2e", label: "Người soi đường cho ta", axis: "con-nguoi" },
			{ id: "w2f", label: "Hệ thống chiếu sáng", axis: "to-chuc" },
		],
	},
	{
		id: "w3",
		center: "CON ĐƯỜNG",
		pick: 2,
		options: [
			{ id: "w3a", label: "Bản đồ, lộ trình", axis: "to-chuc" },
			{ id: "w3b", label: "Cầu, nhựa đường, thi công", axis: "ky-thuat" },
			{ id: "w3c", label: "Hành trình cuộc đời", axis: "sang-tao" },
			{ id: "w3d", label: "Lưu lượng xe, tốc độ", axis: "du-lieu" },
			{ id: "w3e", label: "Người đồng hành", axis: "con-nguoi" },
			{ id: "w3f", label: "Núi rừng, đèo dốc", axis: "tu-nhien" },
		],
	},
	{
		id: "w4",
		center: "NGÔI NHÀ",
		pick: 2,
		options: [
			{ id: "w4a", label: "Bản vẽ, kết cấu", axis: "ky-thuat" },
			{ id: "w4b", label: "Gia đình, tổ ấm", axis: "con-nguoi" },
			{ id: "w4c", label: "Không gian sáng tạo", axis: "sang-tao" },
			{ id: "w4d", label: "Sắp xếp, gọn gàng", axis: "to-chuc" },
			{ id: "w4e", label: "Vườn cây, sân vườn", axis: "tu-nhien" },
			{ id: "w4f", label: "Diện tích, chi phí", axis: "du-lieu" },
		],
	},
	{
		id: "w5",
		center: "THỜI GIAN",
		pick: 2,
		options: [
			{ id: "w5a", label: "Lịch trình, kế hoạch", axis: "to-chuc" },
			{ id: "w5b", label: "Đồng hồ, cơ cấu máy", axis: "ky-thuat" },
			{ id: "w5c", label: "Ký ức, hoài niệm", axis: "sang-tao" },
			{ id: "w5d", label: "Con số, thống kê giờ", axis: "du-lieu" },
			{ id: "w5e", label: "Khoảnh khắc bên người thương", axis: "con-nguoi" },
			{ id: "w5f", label: "Mùa màng, ngày đêm", axis: "tu-nhien" },
		],
	},
]

// ---------- Task 3: Phân loại nhanh ----------
// "Việc này mình làm được TỐT" (+1.5) hay "chưa chắc" (0)?
export interface ClassifyCard {
	id: string
	emoji: string
	label: string
	axis: AxisId
}

export const CLASSIFY_CARDS: ClassifyCard[] = [
	{ id: "c1", emoji: "📈", label: "Phân tích số liệu, tìm ra xu hướng", axis: "du-lieu" },
	{ id: "c2", emoji: "🗣️", label: "Thuyết phục người khác nghe theo ý mình", axis: "con-nguoi" },
	{ id: "c3", emoji: "🎨", label: "Vẽ, thiết kế một thứ gì đó đẹp mắt", axis: "sang-tao" },
	{ id: "c4", emoji: "🔧", label: "Sửa chữa, lắp ráp đồ vật, máy móc", axis: "ky-thuat" },
	{ id: "c5", emoji: "🌿", label: "Chăm sóc cây cối, vật nuôi", axis: "tu-nhien" },
	{ id: "c6", emoji: "🗂️", label: "Lập kế hoạch, phân công việc cho cả nhóm", axis: "to-chuc" },
	{ id: "c7", emoji: "🧩", label: "Giải bài toán khó, tìm quy luật ẩn", axis: "ky-thuat" },
	{ id: "c8", emoji: "🫂", label: "Lắng nghe, an ủi khi bạn bè buồn", axis: "con-nguoi" },
	{ id: "c9", emoji: "✍️", label: "Viết truyện, làm thơ, sáng tác", axis: "sang-tao" },
	{ id: "c10", emoji: "📒", label: "Ghi chép, quản lý sổ sách gọn gàng", axis: "to-chuc" },
	{ id: "c11", emoji: "🔬", label: "Làm thí nghiệm, tìm hiểu hiện tượng tự nhiên", axis: "tu-nhien" },
	{ id: "c12", emoji: "📊", label: "Đọc biểu đồ, bảng thống kê và rút ra ý nghĩa", axis: "du-lieu" },
]

// ---------- Task 4: Phản xạ môi trường ----------
// "Hào hứng" (+2) / "Bình thường" (+0.5) / "Không hợp" (0).
export interface EnvCard {
	id: string
	emoji: string
	label: string
	axis: AxisId
}

export const ENV_CARDS: EnvCard[] = [
	{ id: "e1", emoji: "🔬", label: "Phòng thí nghiệm yên tĩnh", axis: "tu-nhien" },
	{ id: "e2", emoji: "🏗️", label: "Công trường, nhà xưởng", axis: "ky-thuat" },
	{ id: "e3", emoji: "🏫", label: "Lớp học, đứng trước nhiều người", axis: "con-nguoi" },
	{ id: "e4", emoji: "💻", label: "Bàn làm việc nhiều màn hình, dữ liệu", axis: "du-lieu" },
	{ id: "e5", emoji: "🌳", label: "Ngoài trời, giữa thiên nhiên", axis: "tu-nhien" },
	{ id: "e6", emoji: "🎭", label: "Sân khấu, studio biểu diễn", axis: "sang-tao" },
	{ id: "e7", emoji: "🏥", label: "Bệnh viện, nơi chăm sóc người khác", axis: "con-nguoi" },
	{ id: "e8", emoji: "🎨", label: "Xưởng thiết kế, phòng sáng tạo", axis: "sang-tao" },
	{ id: "e9", emoji: "🛠️", label: "Xưởng cơ khí, lắp ráp thiết bị", axis: "ky-thuat" },
	{ id: "e10", emoji: "📋", label: "Phòng họp, điều phối dự án", axis: "to-chuc" },
]

// ---------- Task 5: Bài toán lựa chọn vai trò ----------
export interface RoleOption {
	id: string
	label: string
	role: RoleTendency
	axis: AxisId
}
export interface RoleQuestion {
	id: string
	scenario: string
	options: RoleOption[]
}

export const ROLE_QUESTIONS: RoleQuestion[] = [
	{
		id: "r1",
		scenario:
			"Lớp tham gia một hội chợ khoa học. Nhóm cần làm một gian trưng bày trong 2 tuần. Bạn muốn nhận phần việc nào nhất?",
		options: [
			{ id: "r1a", label: "Điều phối cả nhóm, chia việc và canh tiến độ", role: "lanh-dao", axis: "to-chuc" },
			{ id: "r1b", label: "Nghiên cứu, dựng mô hình và lo phần kỹ thuật", role: "chuyen-gia", axis: "ky-thuat" },
			{ id: "r1c", label: "Thiết kế gian hàng, poster cho thật bắt mắt", role: "sang-tao", axis: "sang-tao" },
			{ id: "r1d", label: "Đứng thuyết trình, giới thiệu với khách tham quan", role: "giao-tiep", axis: "con-nguoi" },
		],
	},
	{
		id: "r2",
		scenario:
			"Lớp tổ chức một đêm văn nghệ cuối năm. Vai trò nào khiến bạn thấy mình hữu ích nhất?",
		options: [
			{ id: "r2a", label: "Tổng đạo diễn: lên kịch bản, sắp lịch tập", role: "lanh-dao", axis: "to-chuc" },
			{ id: "r2b", label: "Phụ trách âm thanh, ánh sáng, thiết bị", role: "chuyen-gia", axis: "ky-thuat" },
			{ id: "r2c", label: "Biên đạo, thiết kế trang phục và sân khấu", role: "sang-tao", axis: "sang-tao" },
			{ id: "r2d", label: "Dẫn chương trình, khuấy động khán giả", role: "giao-tiep", axis: "con-nguoi" },
		],
	},
	{
		id: "r3",
		scenario:
			"Nhóm bạn cùng bán hàng gây quỹ. Bạn sẽ tự nhiên nhận việc gì?",
		options: [
			{ id: "r3a", label: "Quản lý chung, phân công và theo dõi kết quả", role: "lanh-dao", axis: "to-chuc" },
			{ id: "r3b", label: "Tính vốn, lãi, ghi sổ thu chi cho chuẩn", role: "chuyen-gia", axis: "du-lieu" },
			{ id: "r3c", label: "Thiết kế sản phẩm, gian hàng, ấn phẩm", role: "sang-tao", axis: "sang-tao" },
			{ id: "r3d", label: "Chào hàng, thuyết phục và chăm khách", role: "giao-tiep", axis: "con-nguoi" },
		],
	},
]
