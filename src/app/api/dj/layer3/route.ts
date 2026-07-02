// POST /api/dj/layer3 — đóng khung quyết định có dữ liệu.
// Dữ liệu đầu ra lấy từ clusters.ts (luôn có); Gemini chỉ viết phần framing.
import { NextResponse } from "next/server"
import { getCluster } from "@/data/dj/clusters"
import { geminiJson } from "@/lib/dj/gemini"
import { promptLayer3 } from "@/lib/dj/prompts"
import type { Layer3Result, Layer3ClusterView, ClusterConfidence } from "@/lib/dj/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
		const confidence = (Array.isArray(body?.confidence) ? body.confidence : []) as ClusterConfidence[]
		const constraints = body?.constraints ?? {}
		const top = confidence.slice(0, 3)

		const byCluster: Layer3ClusterView[] = top.map((c) => {
			const def = getCluster(c.clusterId)
			const schools = def?.schools ?? []
			const salaries = schools.map((s) => s.salary5yMedian)
			return {
				clusterId: c.clusterId,
				clusterName: def?.name ?? c.clusterId,
				schools,
				altPaths: def?.altPaths ?? "",
				salarySpread: {
					min: salaries.length ? Math.min(...salaries) : 0,
					p50: salaries.length ? salaries.sort((a, b) => a - b)[Math.floor(salaries.length / 2)] : 0,
					max: salaries.length ? Math.max(...salaries) : 0,
				},
			}
		})

		// Tính framing & dataGaps TRỰC TIẾP từ bối cảnh (chạy cả khi không có AI).
		const cx = constraints as Record<string, any>
		const budgetLabel =
			cx?.familyBudget === "han-che" ? "hạn chế" : cx?.familyBudget === "vua-phai" ? "vừa phải" : cx?.familyBudget === "day-du" ? "đầy đủ" : ""
		const tuitions = byCluster.flatMap((c) => c.schools.map((s) => s.tuitionYear)).filter((n) => n > 0)
		const minTuition = tuitions.length ? Math.min(...tuitions) : 0
		const maxTuition = tuitions.length ? Math.max(...tuitions) : 0
		const parentFields = Array.isArray(cx?.parentExpectFields) ? cx.parentExpectFields : []
		const framingParts: string[] = [
			"Dưới đây là dữ liệu đầu ra (tham khảo) của các cụm bạn có bằng chứng mạnh nhất. Số liệu lương/học phí/tỉ lệ việc làm chỉ mang tính tham khảo thị trường, cần kiểm chứng trước khi quyết định.",
		]
		if (budgetLabel || cx?.budgetAnnual) {
			const b = cx?.budgetAnnual ? `khoảng ${cx.budgetAnnual} triệu/năm` : `mức ${budgetLabel}`
			if (maxTuition) framingParts.push(`Học phí các trường trong danh sách dao động ~${minTuition}-${maxTuition} triệu/năm; đối chiếu với ngân sách gia đình (${b}) để cân nhắc học bổng, vay ưu đãi hoặc chọn trường công.`)
			else framingParts.push(`Đối chiếu ngân sách gia đình (${b}) với học phí từng trường trước khi quyết định.`)
		}
		if (cx?.studyAbroad) {
			framingParts.push(
				(cx?.academicResults ?? "").trim()
					? `Vì em cân nhắc du học, hãy đối chiếu kết quả học tập (${cx.academicResults}) với yêu cầu đầu vào và ${cx?.scholarshipReadiness === "co-chien-luoc" ? "tiếp tục triển khai chiến lược học bổng đã có" : "sớm xây chiến lược săn học bổng"}.`
					: "Vì em cân nhắc du học, cần bổ sung điểm học tập/chuẩn hóa (GPA, IELTS/SAT/ACT) để ước lượng khả năng trúng tuyển và cơ hội học bổng.",
			)
		}
		if ((cx?.specificMajorInterest ?? "").trim()) framingParts.push(`Bạn quan tâm cụ thể tới "${cx.specificMajorInterest}" — hãy soi kỹ chương trình đào tạo của các trường theo hướng này.`)
		if ((cx?.longTermGoal ?? "").trim()) framingParts.push(`Đối chiếu lựa chọn với mục tiêu 5-10 năm của em: "${cx.longTermGoal}".`)
		if (parentFields.length || (cx?.parentExpectOther ?? "").trim() || (cx?.parentExpectNotes ?? "").trim()) framingParts.push("Cân nhắc dung hoà giữa kỳ vọng của cha mẹ và bằng chứng năng lực/hứng thú của chính em.")
		let framing = framingParts.join(" ")

		let dataGaps: string[] = []
		if (!cx?.budgetAnnual) dataGaps.push("Con số ngân sách gia đình cụ thể (triệu/năm) để thu hẹp lựa chọn, nhất là du học.")
		if (cx?.studyAbroad && !(cx?.academicResults ?? "").trim()) dataGaps.push("Kết quả học tập & điểm chuẩn hóa (GPA, IELTS/SAT/ACT) để đánh giá khả năng trúng tuyển.")
		if (cx?.studyAbroad && (!cx?.scholarshipReadiness || cx?.scholarshipReadiness === "chua")) dataGaps.push("Chiến lược săn học bổng du học cụ thể.")
		if (!(cx?.specificMajorInterest ?? "").trim()) dataGaps.push("Chuyên ngành/lĩnh vực cụ thể muốn theo trong nhóm ngành phù hợp.")
		if (!(cx?.longTermGoal ?? "").trim()) dataGaps.push("Mục tiêu nghề nghiệp dài hạn 5-10 năm.")
		if (!(cx?.parentExpectNotes ?? "").trim()) dataGaps.push("Kỳ vọng cụ thể của cha mẹ (trường, địa điểm, định hướng nghề).")
		dataGaps.push("Lương và tỉ lệ việc làm theo từng trường/năm cần tra nguồn chính thống; điểm chuẩn & chỉ tiêu năm nay.")
		let source: "ai" | "rule" = "rule"

		const ai = await geminiJson<{ framing: string; dataGaps: string[] }>(
			promptLayer3({
				topClusters: top.map((c) => ({
					clusterId: c.clusterId,
					clusterName: getCluster(c.clusterId)?.name ?? c.clusterId,
					competence: c.competenceAxis,
					interest: c.interestAxis,
				})),
				constraints,
			}),
			{ hard: true, temperature: 0.6 },
		)
		if (ai?.framing) {
			framing = ai.framing
			if (Array.isArray(ai.dataGaps) && ai.dataGaps.length) dataGaps = ai.dataGaps
			source = "ai"
		}

		const result: Layer3Result = { byCluster, framing, dataGaps, source }
		return NextResponse.json(result)
	} catch (e) {
		console.error("[api/dj/layer3]", e)
		return NextResponse.json({ error: "layer3_failed" }, { status: 500 })
	}
}
