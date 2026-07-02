// =============================================================
// 5 PROMPT (A-E) cho Gemini — bám trang Discovery Journey.
// Mỗi prompt yêu cầu trả JSON thuần để dễ parse (responseMimeType=json).
// =============================================================
import type { TaskSpec } from "@/lib/dj/types"

export const SYSTEM_PERSONA =
	"Bạn là cố vấn hướng nghiệp HoaTieu cho học sinh THPT Việt Nam. Trung thực, không tâng bốc, luôn nói rõ đây là GIẢ THUYẾT cần kiểm chứng, không phán quyết định thay học sinh. Trả lời bằng tiếng Việt."

// PROMPT D — tổng hợp Lớp 1 thành giả thuyết (diễn giải)
export function promptLayer1(input: {
	riasec: Record<string, number>
	aptitude: Record<string, number>
	hollandCode: string
	values: Record<string, number>
	constraints: unknown
	rankedClusterIds: string[]
}): string {
	return `${SYSTEM_PERSONA}

NHIỆM VỤ: Dựa trên dữ liệu Lớp 1 của học sinh, viết 3 GIẢ THUYẾT nghề nghiệp (không phải kết luận). Mỗi giả thuyết phải nêu lý do, điều kiện xác nhận (confirmIf) và điều kiện bác bỏ (disconfirmIf). Để confidence THẤP (0.2-0.55) vì chưa có bằng chứng thực hành.

DỮ LIỆU:
- RIASEC (0-100): ${JSON.stringify(input.riasec)}
- Holland code: ${input.hollandCode}
- Năng lực (0-100): ${JSON.stringify(input.aptitude)}
- Giá trị: ${JSON.stringify(input.values)}
- Ràng buộc: ${JSON.stringify(input.constraints)}
- Cụm gợi ý theo điểm khớp (cao->thấp): ${JSON.stringify(input.rankedClusterIds)}

BẮT BUỘC dùng các trường trong "Ràng buộc" ở trên khi viết why/confirmIf/disconfirmIf (KHÔNG bịa số liệu):
- Nếu kỳ vọng gia đình (parentExpectFields/parentExpectOther/parentExpectNotes) LỆCH với giả thuyết, nêu rõ trong "disclaimer" rằng cần trao đổi thẳng thắn với cha mẹ và gợi ý cách dung hoà.
- Soi ngân sách (familyBudget/budgetAnnual), kết quả học tập (academicResults), mức sẵn sàng học bổng (scholarshipReadiness), ý định du học (studyAbroad), chuyên ngành/lĩnh vực quan tâm (specificMajorInterest) và mục tiêu nghề 5-10 năm (longTermGoal) — dùng chúng để giải thích vì sao giả thuyết phù hợp/chưa phù hợp với chính học sinh này.

Chỉ chọn clusterId trong danh sách trên. Trả ĐÚNG JSON:
{"hypotheses":[{"clusterId":"...","confidence":0.0,"why":"...","confirmIf":"...","disconfirmIf":"..."}],"disclaimer":"..."}`
}

// PROMPT A — sinh biến thể đề micro-task cho 1 cụm
export function promptGenerateTask(clusterId: string, clusterName: string, sample: TaskSpec): string {
	return `${SYSTEM_PERSONA}

NHIỆM VỤ: Sinh MỘT đề micro-task thực tế (làm được trong 12-15 phút) cho cụm "${clusterName}" (id=${clusterId}), để đo cả năng lực lẫn hứng thú thật. Tham khảo VĂN PHONG của mẫu (KHÔNG chép nguyên nội dung, nhất là KHÔNG bê nguyên rubric của mẫu):
${JSON.stringify(sample)}

QUY TẮC NHẤT QUÁN (bắt buộc — nếu sai, đề sẽ bị chấm lệch):
- "instructions" phải nêu RÕ RÀNG mọi việc học sinh cần làm.
- MỖI tiêu chí trong "rubric" phải tương ứng với một yêu cầu ĐÃ GHI trong "instructions". TUYỆT ĐỐI không đưa vào rubric tiêu chí mà đề không yêu cầu (ví dụ: đừng chấm "tính lợi nhuận/vốn" nếu instructions không bảo tính lợi nhuận).
- title, scenario, instructions, rubric phải khớp nhau về chủ đề.

Trả ĐÚNG JSON đúng schema spec_json (task_id, cluster_id, difficulty 1-3, title, scenario, instructions, time_limit_min, deliverable_format ∈ essay|choice|steps|design_brief, rubric[{criterion,weight,what_good_looks_like}], reflection_questions[], red_flag_signals[], dark_side_note).`
}

// PROMPT B — chấm bài (auto)
export function promptGrade(task: TaskSpec, submission: string, selfFeeling: number, wantMore: number): string {
	return `${SYSTEM_PERSONA}

NHIỆM VỤ: Chấm bài làm CHỈ dựa trên ĐỀ BÀI và RUBRIC dưới đây. Đây là hướng nghiệp cho học sinh — chấm sai sẽ định hướng sai, nên phải chính xác, công bằng và có dẫn chứng.

QUY TẮC BẮT BUỘC:
1. CHỈ chấm đúng các tiêu chí trong "rubric". TUYỆT ĐỐI không tự thêm tiêu chí/yêu cầu không có trong "instructions" (ví dụ: KHÔNG đòi tính vốn/lợi nhuận nếu đề không yêu cầu).
2. Với MỖI tiêu chí, trước khi cho điểm phải trích 1 đoạn trong INSTRUCTIONS chứng minh đề CÓ yêu cầu điều đó (trường "required_by"). Nếu instructions KHÔNG hề yêu cầu nội dung tiêu chí đó → đặt "score": null, "required_by": "đề không yêu cầu" và KHÔNG trừ điểm học sinh vì điều đó.
3. Mỗi tiêu chí phải kèm "evidence_quote": trích NGUYÊN VĂN một đoạn TỪ BÀI LÀM. Nếu bài không có dẫn chứng cho tiêu chí đó, để evidence_quote="" và điểm phản ánh đúng việc thiếu.
4. "criterion" trong competenceBreakdown phải TRÙNG KHỚP tuyệt đối với tên tiêu chí trong rubric.
5. competenceScore = trung bình có trọng số (weight) của CHỈ các tiêu chí được chấm (bỏ qua tiêu chí score=null rồi chuẩn hoá lại trọng số).
6. "feedback" và "redFlags" không được nhắc tới bất kỳ yêu cầu nào KHÔNG có trong instructions.

TỰ KIỂM CHỨNG (bắt buộc trước khi trả): đọc lại từng câu trong feedback và từng nhận xét; nếu có chỗ nào phê bình học sinh vì điều đề KHÔNG yêu cầu, hãy sửa/bỏ. Chỉ xuất JSON sau khi đã tự kiểm.

ĐỀ BÀI:
- title: ${JSON.stringify(task.title)}
- scenario: ${JSON.stringify(task.scenario)}
- instructions: ${JSON.stringify(task.instructions)}
- deliverable_format: ${JSON.stringify(task.deliverable_format)}
- rubric: ${JSON.stringify(task.rubric)}
BÀI LÀM: """${submission}"""
TỰ ĐÁNH GIÁ CỦA HỌC SINH: cảm giác khi làm=${selfFeeling}/5, muốn làm thêm=${wantMore}/5.

Tách riêng NĂNG LỰC (competence, theo rubric) và HỨNG THÚ (interest). Trả ĐÚNG JSON:
{"competenceScore":0-100,"competenceBreakdown":[{"criterion":"<đúng tên trong rubric>","score":0-100 hoặc null,"required_by":"<trích instructions | 'đề không yêu cầu'>","evidence_quote":"<trích từ bài làm>"}],"interestSignal":0-100,"redFlags":["..."],"confidenceDelta":-1..1,"feedback":"...","recommendedNext":"probe_deeper|try_adjacent|deprioritize"}`
}

// PROMPT C — chấm hỗ trợ (self_assist): gợi ý câu hỏi phản tư + phát hiện lệch tự đánh giá
export function promptSelfAssist(task: TaskSpec, submission: string, selfScore: number): string {
	return `${SYSTEM_PERSONA}

NHIỆM VỤ: Học sinh tự chấm ${selfScore}/100. Hãy đưa quan sát khách quan, câu hỏi phản tư giúp học sinh tự nhìn lại, và cờ báo nếu tự đánh giá lệch nhiều so với chất lượng bài. CHỈ đối chiếu theo instructions + rubric bên dưới; KHÔNG phê bình học sinh vì điều đề không yêu cầu.

ĐỀ: ${JSON.stringify({ title: task.title, instructions: task.instructions, rubric: task.rubric })}
BÀI LÀM: """${submission}"""

Trả ĐÚNG JSON:
{"aiObservation":"...","reflectionPrompts":["..."],"gapFlag":true|false,"gapExplanation":"...","competenceScore":0-100}`
}

// PROMPT E — Lớp 3: đóng khung dữ liệu đầu ra thành quyết định
export function promptLayer3(input: {
	topClusters: { clusterId: string; clusterName: string; competence: number; interest: number }[]
	constraints: unknown
}): string {
	return `${SYSTEM_PERSONA}

NHIỆM VỤ: Dựa trên bằng chứng 2 trục (năng lực & hứng thú) và BỐI CẢNH CÁ NHÂN, viết đoạn "framing" giúp học sinh RA QUYẾT ĐỊNH CÓ DỮ LIỆU (không quyết định thay). Nhắc rõ số liệu lương/tỉ lệ là tham khảo, cần kiểm chứng.

"framing" BẮT BUỘC cá nhân hoá theo BỐI CẢNH (chỉ nhắc trường/số liệu có trong dữ liệu, không bịa):
- So ngân sách (budgetAnnual/familyBudget) với học phí các trường ở BẰNG CHỨNG; nếu ngân sách eo hẹp mà học phí cao → gợi ý học bổng/vay ưu đãi/trường công.
- Nếu studyAbroad=true: đối chiếu academicResults (GPA, IELTS/SAT/ACT) với khả năng trúng tuyển và scholarshipReadiness với chiến lược săn học bổng.
- Nếu có specificMajorInterest: nối cụ thể vào cụm ngành phù hợp.
- Dung hoà kỳ vọng cha mẹ (parentExpectFields/parentExpectOther/parentExpectNotes) với bằng chứng năng lực/hứng thú.
- Kiểm tra tính nhất quán với mục tiêu dài hạn (longTermGoal).

"dataGaps" CHỈ liệt kê thông tin THỰC SỰ còn thiếu trong BỐI CẢNH (vd chưa có budgetAnnual; chưa có academicResults khi du học; chưa rõ scholarshipReadiness…), cộng lưu ý lương/điểm chuẩn cần tra nguồn chính thống. KHÔNG liệt kê thứ học sinh đã cung cấp.

BẰNG CHỨNG: ${JSON.stringify(input.topClusters)}
BỐI CẢNH: ${JSON.stringify(input.constraints)}

Trả ĐÚNG JSON:
{"framing":"...","dataGaps":["..."]}`
}
