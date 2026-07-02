// =============================================================
// FUNCTION 4 — "ĐÂY LÀ BẠN". 5 chân dung theo cụm trục trội.
// Engine chọn theo trục năng khiếu cao nhất, ghép thêm nét tính cách.
// =============================================================
import type { AxisId } from "@/lib/journey/types"

export interface PortraitTemplate {
	id: string
	title: string
	emoji: string
	lines: string[]
}

// Ánh xạ: trục trội -> chân dung.
export const AXIS_TO_PORTRAIT: Record<AxisId, string> = {
	"ky-thuat": "nguoi-kien-tao",
	"du-lieu": "nguoi-phan-tich",
	"con-nguoi": "nguoi-ket-noi",
	"sang-tao": "nguoi-sang-tao",
	"to-chuc": "nguoi-to-chuc",
	"tu-nhien": "nguoi-kham-pha",
}

export const PORTRAITS: Record<string, PortraitTemplate> = {
	"nguoi-phan-tich": {
		id: "nguoi-phan-tich",
		title: "Người Phân tích",
		emoji: "📊",
		lines: [
			"Bạn có một cái đầu thích được sắp xếp mọi thứ cho rõ ràng, có căn cứ.",
			"Trước một vấn đề, bạn không vội kết luận mà muốn tìm quy luật, bằng chứng đằng sau.",
			"Bạn học nhanh những thứ có logic và cảm thấy thỏa mãn khi một bài toán khó được giải gọn.",
			"Điểm mạnh của bạn là tư duy mạch lạc, khách quan và đáng tin trong những việc cần sự chính xác.",
			"Điều bạn nên luyện thêm: đừng quên lắng nghe cảm xúc — cả của mình và của người khác.",
		],
	},
	"nguoi-kien-tao": {
		id: "nguoi-kien-tao",
		title: "Người Kiến tạo",
		emoji: "🔧",
		lines: [
			"Bạn thuộc kiểu người thích bắt tay vào làm, nhìn thấy kết quả cụ thể từ chính tay mình.",
			"Bạn tò mò về cách mọi thứ vận hành, thích tháo ra – lắp vào – cải tiến.",
			"Khi gặp trục trặc, bản năng của bạn là tìm cách sửa được ngay, hơn là ngồi than phiền.",
			"Điểm mạnh của bạn là sự thực tế, bền bỉ và khả năng biến ý tưởng thành sản phẩm.",
			"Điều nên luyện thêm: tập kiên nhẫn với những việc cần lí thuyết và quy trình dài hơi.",
		],
	},
	"nguoi-ket-noi": {
		id: "nguoi-ket-noi",
		title: "Người Kết nối",
		emoji: "🤝",
		lines: [
			"Bạn có khả năng hiểu và đồng cảm với người khác một cách tự nhiên.",
			"Trong nhóm, bạn thường là người gắn kết mọi người, làm không khí dễ chịu hơn.",
			"Bạn thấy có ý nghĩa khi giúp được ai đó, hoặc khi lời nói của mình tạo ra thay đổi tích cực.",
			"Điểm mạnh của bạn là giao tiếp, thuyết phục và tạo lòng tin — những kỹ năng rất được cần.",
			"Điều nên luyện thêm: tập đặt ranh giới và ra quyết định dựa trên lý trí khi cần.",
		],
	},
	"nguoi-sang-tao": {
		id: "nguoi-sang-tao",
		title: "Người Sáng tạo",
		emoji: "🎨",
		lines: [
			"Bạn nhìn thế giới theo cách riêng, hay nghĩ ra những ý tưởng mà người khác không nghĩ tới.",
			"Bạn ghét sự gò bó, rập khuôn và cảm thấy sống động nhất khi được tự do thể hiện.",
			"Bạn nhạy với cái đẹp, với cảm xúc và có góc nhìn giàu hình ảnh.",
			"Điểm mạnh của bạn là óc tưởng tượng, khả năng đổi mới và truyền cảm hứng.",
			"Điều nên luyện thêm: rèn tính kỷ luật và hoàn thiện đến cùng những gì đã bắt đầu.",
		],
	},
	"nguoi-to-chuc": {
		id: "nguoi-to-chuc",
		title: "Người Tổ chức",
		emoji: "🗂️",
		lines: [
			"Bạn có thiên hướng sắp xếp, lên kế hoạch và khiến mọi thứ chạy trơn tru.",
			"Bạn thấy thoải mái khi có cấu trúc rõ ràng, mục tiêu cụ thể và tiến độ được kiểm soát.",
			"Trong nhóm, người khác hay tin tưởng giao cho bạn vai trò điều phối, quản lý.",
			"Điểm mạnh của bạn là tính trách nhiệm, ngăn nắp và khả năng điều phối nguồn lực.",
			"Điều nên luyện thêm: tập linh hoạt và cởi mở với những thay đổi ngoài kế hoạch.",
		],
	},
	"nguoi-kham-pha": {
		id: "nguoi-kham-pha",
		title: "Người Khám phá",
		emoji: "🌱",
		lines: [
			"Bạn tò mò với thế giới tự nhiên, thích quan sát, tìm hiểu vì sao mọi thứ diễn ra như vậy.",
			"Bạn kiên nhẫn với những việc cần thử đi thử lại, quan sát lâu dài để rút ra kết luận.",
			"Bạn thấy dễ chịu khi được làm việc gần thiên nhiên, sinh vật hoặc trong phòng thí nghiệm.",
			"Điểm mạnh của bạn là óc quan sát, sự tỉ mỉ và tình yêu với việc khám phá.",
			"Điều nên luyện thêm: tập trình bày, chia sẻ phát hiện của mình cho người khác hiểu.",
		],
	},
}
