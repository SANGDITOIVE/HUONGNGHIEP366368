"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { StepShell } from "@/components/assessment/StepShell"
import { MultiSelectGroup, SingleSelectGroup } from "@/components/assessment/SelectGroup"
import { useAssessment } from "@/lib/store/assessmentStore"
import { MBTI_PROFILES, MBTI_TYPES } from "@/data/mbtiProfiles"
import {
	CAREER_DESTINATIONS, ENVIRONMENTS, FAMILY_FIELDS,
	FOLLOW_FAMILY, INTERESTS, KNOWLEDGE_AREAS, ROLE_MODELS, SKILLS, STREAMS,
	SUBJECTS, VALUES, WORKING_STYLES,
} from "@/data/taxonomies"

export default function DanhGiaPage() {
	const router = useRouter()
	const { input, update, hydrated } = useAssessment()
	const [step, setStep] = useState(0)

	const steps = useMemo(
		() => [
			{
				key: "stream",
				render: (
					<StepShell
						title="Bạn đang học khối / ban nào?"
						description="Chọn khối hoặc ban gần nhất với bạn, và các môn bạn thích."
					>
						<div className="space-y-4">
							<SingleSelectGroup options={STREAMS} value={input.stream} onChange={(v) => update({ stream: v })} />
							<div>
								<p className="mb-2 text-sm font-medium">Môn học yêu thích (chọn nhiều)</p>
								<MultiSelectGroup options={SUBJECTS} value={input.favoriteSubjects} onChange={(v) => update({ favoriteSubjects: v })} />
							</div>
						</div>
					</StepShell>
				),
				valid: input.stream !== null,
			},
			{
				key: "skills",
				render: (
					<StepShell title="Điểm mạnh của bạn là gì?" description="Chọn những kỹ năng bạn tự tin nhất.">
						<MultiSelectGroup options={SKILLS} value={input.skills} onChange={(v) => update({ skills: v })} />
					</StepShell>
				),
				valid: input.skills.length > 0,
			},
			{
				key: "interests",
				render: (
					<StepShell title="Bạn quan tâm đến điều gì?" description="Sở thích và lĩnh vực bạn thấy hứng thú.">
						<MultiSelectGroup options={INTERESTS} value={input.interests} onChange={(v) => update({ interests: v })} />
					</StepShell>
				),
				valid: input.interests.length > 0,
			},
			{
				key: "style",
				render: (
					<StepShell title="Bạn thích làm việc thế nào?" description="Phong cách làm việc và môi trường mong muốn.">
						<div className="space-y-4">
							<div>
								<p className="mb-2 text-sm font-medium">Phong cách làm việc</p>
								<MultiSelectGroup options={WORKING_STYLES} value={input.workingStyles} onChange={(v) => update({ workingStyles: v })} />
							</div>
							<div>
								<p className="mb-2 text-sm font-medium">Môi trường ưa thích</p>
								<MultiSelectGroup options={ENVIRONMENTS} value={input.preferredEnvironments} onChange={(v) => update({ preferredEnvironments: v })} />
							</div>
						</div>
					</StepShell>
				),
				valid: input.workingStyles.length > 0,
			},
			{
				key: "career",
				render: (
					<StepShell title="Bạn muốn làm việc ở đâu sau này?" description="Đích đến nghề nghiệp bạn hướng tới (chọn nhiều nếu chưa chắc).">
						<MultiSelectGroup options={CAREER_DESTINATIONS} value={input.careerDestinations} onChange={(v) => update({ careerDestinations: v })} />
					</StepShell>
				),
				valid: input.careerDestinations.length > 0,
			},
			{
				key: "values",
				render: (
					<StepShell
						title="Bạn coi trọng điều gì ở công việc tương lai?"
						description="Chọn tối đa 4 giá trị quan trọng nhất với bạn. Đây là một yếu tố khi gợi ý ngành phù hợp."
					>
						<MultiSelectGroup options={VALUES} value={input.values} onChange={(v) => update({ values: v })} max={4} />
					</StepShell>
				),
				valid: input.values.length > 0,
			},
			{
				key: "family",
				render: (
					<StepShell
						title="Nền tảng & định hướng gia đình"
						description="Gia đình bạn đang có nền tảng ở lĩnh vực nào, và bạn có muốn đi theo hay không? Đây mới là điều ảnh hưởng tới định hướng, sau đó xét độ phù hợp giữa ngành tương lai với nền tảng gia đình."
					>
						<div className="space-y-4">
							<div>
								<p className="mb-2 text-sm font-medium">Gia đình bạn đang có nền tảng sẵn trong lĩnh vực nào không?</p>
								<SingleSelectGroup options={FAMILY_FIELDS} value={input.familyField} onChange={(v) => update({ familyField: v })} />
							</div>
							<div>
								<p className="mb-2 text-sm font-medium">Bạn có muốn đi theo nền tảng/định hướng đó của gia đình không?</p>
								<SingleSelectGroup options={FOLLOW_FAMILY} value={input.followFamily} onChange={(v) => update({ followFamily: v })} />
							</div>
							<p className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
								Điều kiện/hoàn cảnh tài chính của gia đình không được dùng để chấm điểm ngành. Ở đây chỉ xét nền tảng lĩnh vực gia đình và mong muốn đi theo của bạn.
							</p>
						</div>
					</StepShell>
				),
				valid: input.familyField !== null && input.followFamily !== null,
			},
			{
				key: "aspiration",
				render: (
					<StepShell
						title="Hình mẫu & vùng kiến thức bạn muốn theo"
						description="Bạn ngưỡng mộ kiểu người nào, và muốn được học sâu về mảng gì?"
					>
						<div className="space-y-4">
							<div>
								<p className="mb-2 text-sm font-medium">Hình mẫu lý tưởng</p>
								<MultiSelectGroup options={ROLE_MODELS} value={input.roleModels} onChange={(v) => update({ roleModels: v })} max={3} />
							</div>
							<div>
								<p className="mb-2 text-sm font-medium">Vùng kiến thức mong muốn được học</p>
								<MultiSelectGroup options={KNOWLEDGE_AREAS} value={input.knowledgeAreas} onChange={(v) => update({ knowledgeAreas: v })} max={3} />
							</div>
						</div>
					</StepShell>
				),
				valid: input.roleModels.length > 0 || input.knowledgeAreas.length > 0,
			},
			{
				key: "mbti",
				render: (
					<StepShell
						title="Bạn đã biết nhóm tính cách (MBTI) của mình chưa?"
						description="MBTI chỉ là một yếu tố tham khảo, không quyết định tất cả."
					>
						<div className="flex flex-wrap gap-2">
							<Button variant={input.knowsMBTI ? "default" : "outline"} onClick={() => update({ knowsMBTI: true, mbtiSource: "self" })}>
								Đã biết
							</Button>
							<Button variant={!input.knowsMBTI && input.mbtiSource !== "quiz" ? "default" : "outline"} onClick={() => update({ knowsMBTI: false, mbtiType: null, mbtiSource: "none" })}>
								Chưa biết
							</Button>
						</div>

						{input.knowsMBTI ? (
							<div>
								<p className="mb-2 text-sm font-medium">Chọn nhóm tính cách của bạn</p>
								<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
									{MBTI_TYPES.map((t) => (
										<button
											key={t}
											type="button"
											aria-pressed={input.mbtiType === t}
											onClick={() => update({ mbtiType: t, mbtiSource: "self" })}
											className={`rounded-lg border px-3 py-2 text-sm transition-colors ${
												input.mbtiType === t ? "border-primary bg-primary/5" : "border-input hover:bg-muted"
											}`}
										>
											<span className="font-semibold">{t}</span>
											<span className="block text-xs text-muted-foreground">{MBTI_PROFILES[t].nickname}</span>
										</button>
									))}
								</div>
							</div>
						) : (
							<Card>
								<CardContent className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between">
									<div className="flex items-start gap-3">
										<Sparkles className="mt-0.5 h-5 w-5 text-primary" />
										<p className="text-sm text-muted-foreground">
											Chưa biết cũng không sao. Làm bài trắc nghiệm tính cách (20 câu, mỗi câu nhiều lựa chọn) để có gợi ý nhóm tính cách.
											{input.mbtiType && input.mbtiSource === "quiz" && (
												<span className="mt-1 block font-medium text-foreground">Kết quả gần nhất: {input.mbtiType} — {MBTI_PROFILES[input.mbtiType].nickname}</span>
											)}
										</p>
									</div>
									<Button asChild variant="accent">
										<Link href="/trac-nghiem-tinh-cach">Làm trắc nghiệm</Link>
									</Button>
								</CardContent>
							</Card>
						)}
					</StepShell>
				),
				valid: input.knowsMBTI ? input.mbtiType !== null : true,
			},
		],
		[input, update],
	)

	const current = steps[step]
	const progress = ((step + 1) / steps.length) * 100
	const isLast = step === steps.length - 1

	if (!hydrated) {
		return <div className="container py-16 text-center text-muted-foreground">Đang tải…</div>
	}

	return (
		<div className="container max-w-3xl py-10">
			<div className="mb-6">
				<div className="mb-2 flex items-center justify-between text-sm text-muted-foreground">
					<span>Bước {step + 1} / {steps.length}</span>
					<span>{Math.round(progress)}%</span>
				</div>
				<Progress value={progress} />
			</div>

			<Card>
				<CardContent key={current.key} className="p-6 animate-fade-in-up">{current.render}</CardContent>
			</Card>

			<div className="mt-6 flex items-center justify-between">
				<Button variant="ghost" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>
					<ArrowLeft className="h-4 w-4" /> Quay lại
				</Button>
				{isLast ? (
					<Button disabled={!current.valid} onClick={() => router.push("/ket-qua")}>
						Xem kết quả <ArrowRight className="h-4 w-4" />
					</Button>
				) : (
					<Button disabled={!current.valid} onClick={() => setStep((s) => Math.min(steps.length - 1, s + 1))}>
						Tiếp tục <ArrowRight className="h-4 w-4" />
					</Button>
				)}
			</div>
		</div>
	)
}
