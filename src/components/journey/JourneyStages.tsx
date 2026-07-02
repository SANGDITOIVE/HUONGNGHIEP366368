"use client"

import { Compass, Pause, Play } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { SelectableChip } from "@/components/ui/SelectableChip"
import { StepShell } from "@/components/assessment/StepShell"
import {
	CLASSIFY_CARDS,
	ENV_CARDS,
	PATTERN_QUESTIONS,
	ROLE_QUESTIONS,
	WORD_QUESTIONS,
} from "@/data/journey/aptitudeTasks"
import {
	ECONOMIC_OPTIONS,
	FAMILY_OPTIONS,
	GRADE_OPTIONS,
	SITUATION_QUESTIONS,
	STREAM_OPTIONS,
	VALUE_ITEMS,
} from "@/data/journey/situationQuestions"
import type {
	EconomicCondition,
	FamilyExpectation,
	JourneyState,
	StreamPick,
	ValueId,
} from "@/lib/journey/types"

// Nút lựa chọn dùng chung cho các task.
function OptionButton({
	selected,
	onClick,
	children,
}: {
	selected: boolean
	onClick: () => void
	children: React.ReactNode
}) {
	return (
		<button
			type="button"
			aria-pressed={selected}
			onClick={onClick}
			className={cn(
				"w-full rounded-lg border px-4 py-3 text-left text-sm transition-all duration-200 active:scale-[0.98]",
				"focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
				selected
					? "border-primary bg-primary/5 font-medium shadow-sm"
					: "border-input bg-card hover:-translate-y-0.5 hover:bg-muted hover:shadow-sm",
			)}
		>
			{children}
		</button>
	)
}

// ============ INTRO ============
export function JourneyIntro({
	hasSaved,
	onStart,
}: {
	hasSaved: boolean
	onStart: () => void
}) {
	return (
		<Card className="overflow-hidden">
			<CardContent className="space-y-6 p-8 text-center">
				<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<Compass className="h-8 w-8" />
				</div>
				<div className="space-y-2">
					<h1 className="text-3xl font-bold">Hành trình Khám phá Bản thân</h1>
					<p className="mx-auto max-w-xl text-muted-foreground">
						Một hành trình duy nhất, đi qua 3 lớp: quan sát năng khiếu, khai thác
						tính cách – giá trị, rồi đối chiếu với bối cảnh thực tế. Không ai
						hỏi bạn “em thích nghề gì” — bạn chỉ cần làm và phản hồi thật.
					</p>
				</div>
				<div className="mx-auto grid max-w-lg gap-3 text-left text-sm">
					<div className="rounded-lg bg-muted/60 p-3">🔍 <b>Lớp 1 – Quan sát:</b> 5 nhiệm vụ nhỏ để lộ ra năng khiếu tự nhiên.</div>
					<div className="rounded-lg bg-muted/60 p-3">🧩 <b>Lớp 2 – Khai thác:</b> tình huống để hiểu tính cách và giá trị sống.</div>
					<div className="rounded-lg bg-muted/60 p-3">🧭 <b>Lớp 3 – Đối chiếu:</b> ghép với bối cảnh gia đình, học lực, kinh tế.</div>
				</div>
				<p className="text-xs text-muted-foreground">⏱️ Khoảng 22–28 phút — có thể tạm dừng bất cứ lúc nào, tiến độ được lưu tự động.</p>
				<Button size="lg" onClick={onStart}>
					{hasSaved ? <Play className="h-4 w-4" /> : null}
					{hasSaved ? "Tiếp tục hành trình" : "Bắt đầu hành trình"}
				</Button>
			</CardContent>
		</Card>
	)
}

// ============ TASK 1 — Pattern ============
export function PatternTask({
	answers,
	onAnswer,
}: {
	answers: JourneyState["patternAnswers"]
	onAnswer: (id: string, idx: number) => void
}) {
	return (
		<StepShell
			title="Nhiệm vụ 1 — Nhận diện quy luật"
			description="Chọn đáp án đúng tiếp theo cho từng dãy. Cứ làm theo cảm nhận đầu tiên."
		>
			<div className="space-y-5">
				{PATTERN_QUESTIONS.map((q, qi) => (
					<Card key={q.id}>
						<CardContent className="space-y-3 p-5">
							<div className="text-sm font-medium text-muted-foreground">Câu {qi + 1}</div>
							<div className="text-2xl tracking-wide">{q.sequence}</div>
							<div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
								{q.options.map((opt, oi) => (
									<OptionButton key={oi} selected={answers[q.id] === oi} onClick={() => onAnswer(q.id, oi)}>
										<span className="text-xl">{opt}</span>
									</OptionButton>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</StepShell>
	)
}

// ============ TASK 2 — Word association ============
export function WordTask({
	answers,
	onToggle,
}: {
	answers: JourneyState["wordAnswers"]
	onToggle: (qid: string, wordId: string, max: number) => void
}) {
	return (
		<StepShell
			title="Nhiệm vụ 2 — Liên kết ý nghĩa"
			description="Với mỗi từ trung tâm, chọn 2 liên tưởng bạn thấy gần gũi nhất."
		>
			<div className="space-y-5">
				{WORD_QUESTIONS.map((q) => {
					const picks = answers[q.id] ?? []
					return (
						<Card key={q.id}>
							<CardContent className="space-y-3 p-5">
								<div className="flex items-center gap-2">
									<span className="rounded-md bg-primary/10 px-3 py-1 text-lg font-bold text-primary">{q.center}</span>
									<span className="text-xs text-muted-foreground">đã chọn {picks.length}/2</span>
								</div>
								<div className="grid gap-2 sm:grid-cols-2">
									{q.options.map((opt) => (
										<OptionButton
											key={opt.id}
											selected={picks.includes(opt.id)}
											onClick={() => onToggle(q.id, opt.id, q.pick)}
										>
											{opt.label}
										</OptionButton>
									))}
								</div>
							</CardContent>
						</Card>
					)
				})}
			</div>
		</StepShell>
	)
}

// ============ TASK 3 — Classify ============
export function ClassifyTask({
	answers,
	onSet,
}: {
	answers: JourneyState["classifyAnswers"]
	onSet: (id: string, v: "tot" | "chua-chac") => void
}) {
	return (
		<StepShell
			title="Nhiệm vụ 3 — Phân loại nhanh"
			description="Với mỗi việc, bạn thấy mình “làm tốt” hay “chưa chắc”? Trả lời theo bản năng."
		>
			<div className="grid gap-3">
				{CLASSIFY_CARDS.map((c) => (
					<Card key={c.id}>
						<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<span className="text-2xl">{c.emoji}</span>
								<span className="text-sm">{c.label}</span>
							</div>
							<div className="flex gap-2">
								<Button
									size="sm"
									variant={answers[c.id] === "tot" ? "default" : "outline"}
									onClick={() => onSet(c.id, "tot")}
								>
									Làm tốt
								</Button>
								<Button
									size="sm"
									variant={answers[c.id] === "chua-chac" ? "secondary" : "outline"}
									onClick={() => onSet(c.id, "chua-chac")}
								>
									Chưa chắc
								</Button>
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</StepShell>
	)
}

// ============ TASK 4 — Environment ============
const ENV_CHOICES: { value: "hung" | "binh-thuong" | "khong"; label: string }[] = [
	{ value: "hung", label: "🔥 Hào hứng" },
	{ value: "binh-thuong", label: "😐 Bình thường" },
	{ value: "khong", label: "❌ Không hợp" },
]
export function EnvTask({
	answers,
	onSet,
}: {
	answers: JourneyState["envAnswers"]
	onSet: (id: string, v: "hung" | "binh-thuong" | "khong") => void
}) {
	return (
		<StepShell
			title="Nhiệm vụ 4 — Phản xạ với môi trường"
			description="Tưởng tượng bạn làm việc ở mỗi nơi sau. Phản xạ đầu tiên của bạn là gì?"
		>
			<div className="grid gap-3">
				{ENV_CARDS.map((env) => (
					<Card key={env.id}>
						<CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
							<div className="flex items-center gap-3">
								<span className="text-2xl">{env.emoji}</span>
								<span className="text-sm">{env.label}</span>
							</div>
							<div className="flex flex-wrap gap-2">
								{ENV_CHOICES.map((ch) => (
									<Button
										key={ch.value}
										size="sm"
										variant={answers[env.id] === ch.value ? "default" : "outline"}
										onClick={() => onSet(env.id, ch.value)}
									>
										{ch.label}
									</Button>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</StepShell>
	)
}

// ============ TASK 5 — Role scenarios ============
export function RoleTask({
	answers,
	onAnswer,
}: {
	answers: JourneyState["roleAnswers"]
	onAnswer: (qid: string, idx: number) => void
}) {
	return (
		<StepShell
			title="Nhiệm vụ 5 — Bạn hợp vai nào?"
			description="Trong mỗi tình huống nhóm, bạn thấy mình tự nhiên nhận phần việc nào?"
		>
			<div className="space-y-5">
				{ROLE_QUESTIONS.map((q) => (
					<Card key={q.id}>
						<CardContent className="space-y-3 p-5">
							<p className="text-sm font-medium">{q.scenario}</p>
							<div className="grid gap-2">
								{q.options.map((opt, oi) => (
									<OptionButton key={opt.id} selected={answers[q.id] === oi} onClick={() => onAnswer(q.id, oi)}>
										{opt.label}
									</OptionButton>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</StepShell>
	)
}

// ============ 2A — Situational ============
export function SituationStep({
	answers,
	onAnswer,
}: {
	answers: JourneyState["situationAnswers"]
	onAnswer: (qid: string, idx: number) => void
}) {
	return (
		<StepShell
			title="Khai thác tính cách"
			description="Không có đáp án đúng hay sai. Hãy chọn điều gần với con người thật của bạn nhất."
		>
			<div className="space-y-5">
				{SITUATION_QUESTIONS.map((q, qi) => (
					<Card key={q.id}>
						<CardContent className="space-y-3 p-5">
							<p className="text-sm font-medium">
								<span className="text-muted-foreground">Câu {qi + 1}. </span>
								{q.prompt}
							</p>
							<div className="grid gap-2">
								{q.options.map((opt, oi) => (
									<OptionButton key={opt.id} selected={answers[q.id] === oi} onClick={() => onAnswer(q.id, oi)}>
										{opt.label}
									</OptionButton>
								))}
							</div>
						</CardContent>
					</Card>
				))}
			</div>
		</StepShell>
	)
}

// ============ 2B — Value ranking ============
export function ValueRankStep({
	ranking,
	onChange,
}: {
	ranking: ValueId[]
	onChange: (next: ValueId[]) => void
}) {
	const toggle = (id: ValueId) => {
		if (ranking.includes(id)) onChange(ranking.filter((v) => v !== id))
		else onChange([...ranking, id])
	}
	return (
		<StepShell
			title="Điều gì quan trọng với bạn?"
			description="Bấm lần lượt theo thứ tự ưu tiên (quan trọng nhất bấm trước). Bấm lại để bỏ chọn."
		>
			<div className="grid gap-3">
				{VALUE_ITEMS.map((v) => {
					const rank = ranking.indexOf(v.id)
					const selected = rank >= 0
					return (
						<button
							key={v.id}
							type="button"
							onClick={() => toggle(v.id)}
							className={cn(
								"flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-all active:scale-[0.99]",
								selected ? "border-primary bg-primary/5 shadow-sm" : "border-input bg-card hover:bg-muted",
							)}
						>
							<span
								className={cn(
									"flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
									selected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
								)}
							>
								{selected ? rank + 1 : "–"}
							</span>
							<span>
								<span className="block text-sm font-medium">{v.label}</span>
								<span className="block text-xs text-muted-foreground">{v.desc}</span>
							</span>
						</button>
					)
				})}
			</div>
		</StepShell>
	)
}

// ============ 2C — Context ============
export function ContextStep({
	state,
	onUpdate,
}: {
	state: JourneyState
	onUpdate: (patch: Partial<JourneyState>) => void
}) {
	return (
		<StepShell
			title="Bối cảnh của bạn"
			description="Những thông tin này giúp kết quả sát với thực tế Việt Nam hơn."
		>
			<div className="space-y-6">
				<div className="space-y-2">
					<div className="text-sm font-medium">Bạn đang học lớp mấy?</div>
					<div className="flex flex-wrap gap-2">
						{GRADE_OPTIONS.map((g) => (
							<Button
								key={g.value}
								size="sm"
								variant={state.grade === Number(g.value) ? "default" : "outline"}
								onClick={() => onUpdate({ grade: Number(g.value) })}
							>
								{g.label}
							</Button>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<div className="text-sm font-medium">Tổ hợp / khối bạn thiên về (nếu có)</div>
					<div className="grid gap-2 sm:grid-cols-2">
						{STREAM_OPTIONS.map((s) => (
							<SelectableChip
								key={s.value}
								label={s.label}
								selected={state.stream === s.value}
								onToggle={() => onUpdate({ stream: s.value as StreamPick })}
							/>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<div className="text-sm font-medium">Gia đình nghĩ sao về lựa chọn của bạn?</div>
					<div className="grid gap-2 sm:grid-cols-2">
						{FAMILY_OPTIONS.map((f) => (
							<SelectableChip
								key={f.value}
								label={f.label}
								hint={f.hint}
								selected={state.familyExpectation === f.value}
								onToggle={() => onUpdate({ familyExpectation: f.value as FamilyExpectation })}
							/>
						))}
					</div>
				</div>

				<div className="space-y-2">
					<div className="text-sm font-medium">Điều kiện kinh tế hiện tại</div>
					<div className="grid gap-2 sm:grid-cols-2">
						{ECONOMIC_OPTIONS.map((e) => (
							<SelectableChip
								key={e.value}
								label={e.label}
								hint={e.hint}
								selected={state.economic === e.value}
								onToggle={() => onUpdate({ economic: e.value as EconomicCondition })}
							/>
						))}
					</div>
				</div>
			</div>
		</StepShell>
	)
}

// ============ Processing ============
export function ProcessingStep() {
	return (
		<Card>
			<CardContent className="flex flex-col items-center gap-4 p-10 text-center">
				<div className="flex h-14 w-14 animate-pulse items-center justify-center rounded-2xl bg-primary/10 text-primary">
					<Compass className="h-7 w-7" />
				</div>
				<h2 className="text-xl font-semibold">Đang tổng hợp kết quả…</h2>
				<p className="max-w-md text-sm text-muted-foreground">
					Đối chiếu năng khiếu – tính cách – giá trị – bối cảnh, rồi ánh xạ sang nhóm nghề phù hợp.
				</p>
			</CardContent>
		</Card>
	)
}

// Re-export icon để page dùng cho nút tạm dừng (tránh import trùng).
export { Pause as PauseIcon }
