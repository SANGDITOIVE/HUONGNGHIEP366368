import type { MBTIAxis, MBTIType, QuizQuestion } from "@/types"

// Lưu lựa chọn theo chỉ số đáp án đã chọn cho mỗi câu hỏi.
export type QuizAnswers = Record<string, number>

// Tính type MBTI từ câu trả lời. Mỗi đáp án cộng trọng số cho cực tương ứng.
export function scoreQuiz(
	questions: QuizQuestion[],
	answers: QuizAnswers,
): { type: MBTIType; axisScores: Record<MBTIAxis, { left: number; right: number }> } {
	const tally: Record<string, number> = {
		E: 0, I: 0, S: 0, N: 0, T: 0, F: 0, J: 0, P: 0,
	}

	for (const q of questions) {
		const idx = answers[q.id]
		if (idx === undefined || idx === null) continue
		const opt = q.options[idx]
		if (!opt) continue
		tally[opt.pole] += opt.weight
	}

	const ei = tally.E >= tally.I ? "E" : "I"
	const sn = tally.S >= tally.N ? "S" : "N"
	const tf = tally.T >= tally.F ? "T" : "F"
	const jp = tally.J >= tally.P ? "J" : "P"

	const type = `${ei}${sn}${tf}${jp}` as MBTIType

	return {
		type,
		axisScores: {
			EI: { left: tally.E, right: tally.I },
			SN: { left: tally.S, right: tally.N },
			TF: { left: tally.T, right: tally.F },
			JP: { left: tally.J, right: tally.P },
		},
	}
}
