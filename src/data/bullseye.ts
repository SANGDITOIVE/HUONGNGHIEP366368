import type { StreamId, SubjectId } from "@/types"

// =============================================================
// Career bullseye phiên bản VN: bản đồ "môn học / khối → lĩnh vực ngành".
// Giá trị là id của MajorField trong majorFields.ts. Mang tính gợi ý tham khảo,
// giúp học sinh thấy môn mình mạnh có thể dẫn tới nhóm ngành nào.
// =============================================================

export const SUBJECT_FIELD_MAP: Record<SubjectId, string[]> = {
	toan: ["cong-nghe", "ky-thuat", "tai-chinh", "kinh-te"],
	ly: ["ky-thuat", "cong-nghe", "kien-truc-thiet-ke"],
	hoa: ["y-te", "ky-thuat"],
	sinh: ["y-te"],
	van: ["ngon-ngu", "truyen-thong", "phap-luat", "su-pham", "tam-ly"],
	su: ["phap-luat", "su-pham", "ngon-ngu", "tam-ly"],
	dia: ["du-lich", "kinh-te"],
	anh: ["ngon-ngu", "kinh-te", "truyen-thong", "du-lich"],
	tin: ["cong-nghe", "ky-thuat"],
	gdcd: ["phap-luat", "tam-ly", "su-pham"],
	"my-thuat": ["kien-truc-thiet-ke", "truyen-thong"],
	"am-nhac": ["kien-truc-thiet-ke", "su-pham"],
}

export const STREAM_FIELD_MAP: Record<StreamId, string[]> = {
	"khoi-a": ["cong-nghe", "ky-thuat", "tai-chinh", "kinh-te"],
	"khoi-a1": ["cong-nghe", "ky-thuat", "kinh-te", "tai-chinh"],
	"khoi-b": ["y-te"],
	"khoi-c": ["phap-luat", "ngon-ngu", "su-pham", "tam-ly", "du-lich"],
	"khoi-d": ["kinh-te", "truyen-thong", "ngon-ngu", "tai-chinh", "du-lich"],
	"ban-khtn": ["cong-nghe", "ky-thuat", "y-te", "tai-chinh"],
	"ban-khxh": ["phap-luat", "ngon-ngu", "truyen-thong", "su-pham", "tam-ly", "du-lich"],
	"chua-ro": [],
}
