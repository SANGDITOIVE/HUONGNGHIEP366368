import type { ValueId } from "@/types"

// =============================================================
// Bản đồ Lĩnh vực → Giá trị nghề nghiệp tiêu biểu (Phase 2).
// Dùng cho trục "valueFit": đo mức khớp giữa giá trị người dùng coi trọng
// và những giá trị mà lĩnh vực thường mang lại. Mang tính tham khảo,
// KHÔNG phải khẳng định tuyệt đối. Khóa = fieldId trong majorFields.ts.
// =============================================================
export const FIELD_VALUES: Record<string, ValueId[]> = {
	"cong-nghe": ["thu-nhap-cao", "thu-thach-tri-tue", "thang-tien", "sang-tao-tu-do", "tu-chu-linh-hoat"],
	"ky-thuat": ["on-dinh", "thu-thach-tri-tue", "thu-nhap-cao", "thang-tien"],
	"kien-truc-thiet-ke": ["sang-tao-tu-do", "tu-chu-linh-hoat", "duoc-ton-trong"],
	"kinh-te": ["thu-nhap-cao", "thang-tien", "tu-chu-linh-hoat", "duoc-ton-trong"],
	"truyen-thong": ["sang-tao-tu-do", "tac-dong-xa-hoi", "tu-chu-linh-hoat", "thu-nhap-cao"],
	"tai-chinh": ["thu-nhap-cao", "on-dinh", "thang-tien", "duoc-ton-trong"],
	"phap-luat": ["duoc-ton-trong", "on-dinh", "thu-thach-tri-tue", "thu-nhap-cao"],
	"y-te": ["giup-do-nguoi-khac", "duoc-ton-trong", "on-dinh", "tac-dong-xa-hoi"],
	"su-pham": ["giup-do-nguoi-khac", "on-dinh", "can-bang-cuoc-song", "tac-dong-xa-hoi"],
	"tam-ly": ["giup-do-nguoi-khac", "tac-dong-xa-hoi", "thu-thach-tri-tue", "can-bang-cuoc-song"],
	"ngon-ngu": ["tu-chu-linh-hoat", "can-bang-cuoc-song", "duoc-ton-trong", "sang-tao-tu-do"],
	"du-lich": ["tu-chu-linh-hoat", "giup-do-nguoi-khac", "tac-dong-xa-hoi", "can-bang-cuoc-song"],
}
