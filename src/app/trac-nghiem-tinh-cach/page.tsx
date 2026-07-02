"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, ArrowRight, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useAssessment } from "@/lib/store/assessmentStore"
import { QUIZ_QUESTIONS } from "@/data/quizQuestions"
import { scoreQuiz, type QuizAnswers } from "@/lib/quiz/scoreQuiz"
import { MBTI_PROFILES } from "@/data/mbtiProfiles"
import type { MBTIType } from "@/types"

export default function TracNghiemPage() {
	const { update } = useAssessment()
	const [answers, setAnswers] = useState<QuizAnswers>({})
	const [index, setIndex] = useState(0)
	const [result, setResult] = useState<MBTIType | null>(null)

	const total = QUIZ_QUESTIONS.length
	const question = QUIZ_QUESTIONS[index]
	const answered = Object.keys(answers).length
	const progress = (answered / total) * 100

	const choose = (optionIndex: number) => {
		const next = { ...answers, [question.id]: optionIndex }
		setAnswers(next)
		if (index < total - 1) {
			setIndex((i) => i + 1)
		} else {
			const { type } = scoreQuiz(QUIZ_QUESTIONS, next)
			setResult(type)
			update({ mbtiType: type, mbtiSource: "quiz", knowsMBTI: false })
		}
	}

	const restart = () => {
		setAnswers({})
		setIndex(0)
		setResult(null)
	}

	const profile = useMemo(() => (result ? MBTI_PROFILES[result] : null), [result])

	if (result && profile) {
		return (
			<div className="container max-w-2xl py-12">
				<Card>
					<CardHeader>
						<Badge variant="accent" className="w-fit">{profile.temperamentLabel}</Badge>
						<CardTitle className="mt-2 text-2xl">
							{profile.type} — {profile.nickname}
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-5">
						<p className="text-muted-foreground">{profile.summary}</p>
						<div className="flex flex-wrap gap-2">
							{profile.traits.map((t) => (
								<Badge key={t} variant="muted">{t}</Badge>
							))}
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div>
								<p className="mb-1 text-sm font-semibold">Điểm mạnh</p>
								<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
									{profile.strengths.map((s) => <li key={s}>{s}</li>)}
								</ul>
							</div>
							<div>
								<p className="mb-1 text-sm font-semibold">Điều nên lưu ý</p>
								<ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
									{profile.watchOuts.map((s) => <li key={s}>{s}</li>)}
								</ul>
							</div>
						</div>
						<div className="rounded-lg border border-accent/30 bg-accent/5 p-4 text-sm text-muted-foreground">
							Đây là kết quả ước lượng nhanh từ {total} câu hỏi, không phải kết luận chính
							xác về con người bạn. Tính cách có thể thay đổi và chỉ là một trong
							nhiều yếu tố khi chọn ngành.
						</div>
						<div className="flex flex-col gap-3 sm:flex-row">
							<Button asChild>
								<Link href="/danh-gia">Quay lại đánh giá <ArrowRight className="h-4 w-4" /></Link>
							</Button>
							<Button variant="outline" onClick={restart}>
								<RefreshCw className="h-4 w-4" /> Làm lại
							</Button>
						</div>
					</CardContent>
				</Card>
			</div>
		)
	}

	const selectedIndex = answers[question.id]

	return (
		<div className="container max-w-2xl py-12">
			<div className="mb-6">
				<div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
					<span>Câu {index + 1} / {total}</span>
					<span>{Math.round(progress)}%</span>
				</div>
				<Progress value={progress} />
			</div>

			<Card>
				<CardHeader>
					<CardTitle className="text-xl">{question.prompt}</CardTitle>
				</CardHeader>
				<CardContent className="space-y-3">
					{question.options.map((opt, i) => {
						const selected = selectedIndex === i
						return (
							<button
								key={`${question.id}-${i}`}
								type="button"
								onClick={() => choose(i)}
								className={`flex w-full items-center gap-3 rounded-lg border px-4 py-4 text-left text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
									selected ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
								}`}
							>
								<span
									className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
										selected ? "border-primary bg-primary text-primary-foreground" : "border-input text-muted-foreground"
									}`}
								>
									{String.fromCharCode(65 + i)}
								</span>
								<span>{opt.label}</span>
							</button>
						)
					})}
				</CardContent>
			</Card>

			<div className="mt-6">
				<Button variant="ghost" onClick={() => setIndex((i) => Math.max(0, i - 1))} disabled={index === 0}>
					<ArrowLeft className="h-4 w-4" /> Câu trước
				</Button>
			</div>
		</div>
	)
}
