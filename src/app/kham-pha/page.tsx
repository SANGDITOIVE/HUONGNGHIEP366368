"use client"
// =============================================================
// KHÁM PHÁ BẢN THÂN — Discovery Journey 3 lớp.
// Hoạt động độc lập bằng localStorage; gọi /api/dj/* để có diễn giải AI.
// Thiếu GEMINI_API_KEY vẫn chạy (fallback rule-based).
// =============================================================
import { useEffect, useMemo, useState } from "react"
import { ArrowLeft, ArrowRight, RotateCcw, Loader2, Sparkles, Target, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Methodology } from "@/components/dj/Methodology"
import { useDiscovery, type DjStep } from "@/lib/dj/useDiscovery"
import { RIASEC_ITEMS, RIASEC_GROUP_LABEL, LIKERT_OPTIONS } from "@/data/dj/riasec"
import { APTITUDE_ITEMS, APTITUDE_LABEL } from "@/data/dj/aptitude"
import { VALUE_SLIDERS } from "@/data/dj/values"
import { CLUSTERS, getCluster } from "@/data/dj/clusters"
import { quadrantLabel } from "@/lib/dj/scoring"
import type { TaskSpec, GradeResult } from "@/lib/dj/types"
import { useSession } from "next-auth/react"
import { buildDjSnapshot, DJ_SNAPSHOT_NS } from "@/lib/dj/snapshot"
import { writeScoped } from "@/lib/store/scopedStore"

const RIASEC_PAGE_SIZE = 7

export default function KhamPhaPage() {
	const dj = useDiscovery()
	const { state, loading, hydrated } = dj
	const { data: session } = useSession()
	const email = session?.user?.email ?? null

	useEffect(() => {
		if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" })
	}, [state.step])

	// Lưu ảnh chụp kết quả "Khám phá bản thân" THEO tài khoản (chỉ khi đã đăng nhập)
	useEffect(() => {
		if (!hydrated || !email) return
		const snap = buildDjSnapshot(state)
		if (snap) writeScoped(DJ_SNAPSHOT_NS, email, snap)
	}, [state, hydrated, email])

	if (!hydrated) {
		return (
			<div className="container max-w-3xl py-16 text-center text-sm text-muted-foreground">
				Đang tải hành trình…
			</div>
		)
	}

	return (
		<div className="container max-w-3xl py-8 md:py-12">
			<StepHeader step={state.step} />
			{state.step === "intro" && <IntroStep dj={dj} />}
			{state.step === "riasec" && <RiasecStep dj={dj} />}
			{state.step === "aptitude" && <AptitudeStep dj={dj} />}
			{state.step === "values" && <ValuesStep dj={dj} />}
			{state.step === "constraints" && <ConstraintsStep dj={dj} />}
			{state.step === "layer1" && <Layer1Step dj={dj} />}
			{state.step === "tasks" && <TasksStep dj={dj} />}
			{state.step === "confidence" && <ConfidenceStep dj={dj} />}
			{state.step === "layer3" && <Layer3Step dj={dj} />}
			{loading && (
				<div className="fixed inset-x-0 bottom-6 mx-auto flex w-fit items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm text-primary-foreground shadow-lg">
					<Loader2 className="h-4 w-4 animate-spin" /> Đang xử lý…
				</div>
			)}
		</div>
	)
}

type Dj = ReturnType<typeof useDiscovery>

const STEP_ORDER: DjStep[] = ["intro", "riasec", "aptitude", "values", "constraints", "layer1", "tasks", "confidence", "layer3"]
const STEP_LABEL: Record<DjStep, string> = {
	intro: "Giới thiệu",
	riasec: "Lớp 1 · Sở thích (RIASEC)",
	aptitude: "Lớp 1 · Năng lực",
	values: "Lớp 1 · Giá trị",
	constraints: "Lớp 1 · Bối cảnh",
	layer1: "Lớp 1 · Giả thuyết",
	tasks: "Lớp 2 · Thử việc thật",
	confidence: "Lớp 2 · Bằng chứng 2 trục",
	layer3: "Lớp 3 · Quyết định",
}

function StepHeader({ step }: { step: DjStep }) {
	if (step === "intro") return null
	const idx = STEP_ORDER.indexOf(step)
	const pct = Math.round((idx / (STEP_ORDER.length - 1)) * 100)
	return (
		<div className="mb-6 space-y-2">
			<div className="flex items-center justify-between text-sm">
				<span className="font-medium">{STEP_LABEL[step]}</span>
				<span className="text-muted-foreground">{pct}%</span>
			</div>
			<Progress value={pct} />
		</div>
	)
}

function IntroStep({ dj }: { dj: Dj }) {
	const hasProgress = Object.keys(dj.state.riasecRaw).length > 0 || dj.state.attempts.length > 0
	return (
		<div className="space-y-8">
			<Methodology />
			<div className="flex flex-col items-center gap-3">
				<Button size="lg" onClick={() => dj.goto("riasec")}>
					<Sparkles className="h-4 w-4" /> {hasProgress ? "Tiếp tục hành trình" : "Bắt đầu khám phá"}
				</Button>
				{hasProgress && (
					<button onClick={dj.reset} className="flex items-center gap-1 text-xs text-muted-foreground hover:underline">
						<RotateCcw className="h-3 w-3" /> Làm lại từ đầu
					</button>
				)}
				<p className="max-w-md text-center text-xs text-muted-foreground">
					Tiến độ được lưu tự động trên trình duyệt của bạn.
				</p>
			</div>
		</div>
	)
}

function NavRow({ onBack, onNext, nextLabel, nextDisabled }: { onBack?: () => void; onNext: () => void; nextLabel: string; nextDisabled?: boolean }) {
	return (
		<div className="flex items-center justify-between gap-3 border-t pt-5">
			{onBack ? (
				<Button variant="ghost" onClick={onBack}><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
			) : <span />}
			<Button onClick={onNext} disabled={nextDisabled}>{nextLabel} <ArrowRight className="h-4 w-4" /></Button>
		</div>
	)
}

function RiasecStep({ dj }: { dj: Dj }) {
	const [page, setPage] = useState(0)
	const pages = Math.ceil(RIASEC_ITEMS.length / RIASEC_PAGE_SIZE)
	const items = RIASEC_ITEMS.slice(page * RIASEC_PAGE_SIZE, page * RIASEC_PAGE_SIZE + RIASEC_PAGE_SIZE)
	const pageDone = items.every((i) => typeof dj.state.riasecRaw[i.id] === "number")
	const allDone = RIASEC_ITEMS.every((i) => typeof dj.state.riasecRaw[i.id] === "number")
	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">Chọn mức độ đúng với bạn. Không có đáp án đúng/sai. (Trang {page + 1}/{pages})</p>
			{items.map((item) => (
				<Card key={item.id}>
					<CardContent className="space-y-3 p-4">
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-medium">{item.text}</p>
							<Badge variant="muted">{RIASEC_GROUP_LABEL[item.group].split(" ")[0]}</Badge>
						</div>
						<div className="flex flex-wrap gap-2">
							{LIKERT_OPTIONS.map((o) => {
								const sel = dj.state.riasecRaw[item.id] === o.value
								return (
									<button key={o.value} type="button" onClick={() => dj.setRiasec(item.id, o.value)}
										className={`rounded-lg border px-3 py-1.5 text-xs transition ${sel ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"}`}>
										{o.value}. {o.label}
									</button>
								)
							})}
						</div>
					</CardContent>
				</Card>
			))}
			<NavRow
				onBack={page > 0 ? () => setPage((p) => p - 1) : () => dj.goto("intro")}
				onNext={() => { if (page < pages - 1) setPage((p) => p + 1); else dj.goto("aptitude") }}
				nextLabel={page < pages - 1 ? "Trang tiếp" : "Sang phần năng lực"}
				nextDisabled={page < pages - 1 ? !pageDone : !allDone}
			/>
		</div>
	)
}

function AptitudeStep({ dj }: { dj: Dj }) {
	const allDone = APTITUDE_ITEMS.every((i) => dj.state.aptitudeRaw[i.id])
	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">Mini-test năng lực (logic, ngôn ngữ, không gian, tính toán). Chọn đáp án bạn cho là đúng.</p>
			{APTITUDE_ITEMS.map((item, idx) => (
				<Card key={item.id}>
					<CardContent className="space-y-3 p-4">
						<div className="flex items-center justify-between gap-2">
							<p className="text-sm font-medium">{idx + 1}. {item.prompt}</p>
							<Badge variant="muted">{APTITUDE_LABEL[item.group]}</Badge>
						</div>
						<div className="grid gap-2 sm:grid-cols-2">
							{item.options.map((o) => {
								const sel = dj.state.aptitudeRaw[item.id] === o.id
								return (
									<button key={o.id} type="button" onClick={() => dj.setAptitude(item.id, o.id)}
										className={`rounded-lg border px-3 py-2 text-left text-sm transition ${sel ? "border-primary bg-primary/10" : "border-input hover:bg-muted"}`}>
										{o.id.toUpperCase()}. {o.label}
									</button>
								)
							})}
						</div>
					</CardContent>
				</Card>
			))}
			<NavRow onBack={() => dj.goto("riasec")} onNext={() => dj.goto("values")} nextLabel="Sang phần giá trị" nextDisabled={!allDone} />
		</div>
	)
}

function ValuesStep({ dj }: { dj: Dj }) {
	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">Kéo thanh trượt về phía bạn coi trọng hơn. Không có lựa chọn đúng/sai.</p>
			{VALUE_SLIDERS.map((s) => {
				const v = (dj.state.values as Record<string, number>)[s.key] ?? 50
				return (
					<Card key={s.key}>
						<CardContent className="space-y-2 p-4">
							<div className="flex justify-between text-xs font-medium">
								<span>{s.left}</span><span>{s.right}</span>
							</div>
							<input type="range" min={0} max={100} value={v} onChange={(e) => dj.setValue(s.key, Number(e.target.value))} className="w-full accent-primary" />
						</CardContent>
					</Card>
				)
			})}
			<NavRow onBack={() => dj.goto("aptitude")} onNext={() => dj.goto("constraints")} nextLabel="Sang phần bối cảnh" />
		</div>
	)
}

function ConstraintsStep({ dj }: { dj: Dj }) {
	const c = dj.state.constraints
	const budgets = [
		{ id: "han-che", label: "Hạn chế" },
		{ id: "vua-phai", label: "Vừa phải" },
		{ id: "day-du", label: "Đầy đủ" },
	]
	const scholarships = [
		{ id: "chua", label: "Chưa nghĩ tới" },
		{ id: "quan-tam", label: "Có quan tâm" },
		{ id: "co-chien-luoc", label: "Đã có chiến lược" },
	]
	const inputCls = "w-full rounded-lg border border-input bg-card px-3 py-2 text-sm"
	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">Bối cảnh càng cụ thể, phần “Lớp 3 · Quyết định” càng sát với hoàn cảnh của bạn. Có thể bỏ trống mục chưa chắc — hệ thống sẽ ghi nhận là “dữ liệu cần kiểm chứng”.</p>

			<Card><CardContent className="space-y-3 p-4">
				<p className="text-sm font-medium">Điều kiện tài chính gia đình</p>
				<div className="flex flex-wrap gap-2">
					{budgets.map((b) => (
						<button key={b.id} onClick={() => dj.setConstraints({ familyBudget: b.id as any })}
							className={`rounded-lg border px-3 py-1.5 text-sm transition ${c.familyBudget === b.id ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"}`}>{b.label}</button>
					))}
				</div>
				<label className="block text-xs text-muted-foreground">Con số cụ thể: gia đình có thể chi khoảng bao nhiêu <span className="font-medium">triệu đồng/năm</span> cho việc học? (giúp thu hẹp lựa chọn, nhất là du học)</label>
				<input type="number" min={0} inputMode="numeric" value={c.budgetAnnual ?? ""} placeholder="Ví dụ: 80 (triệu/năm)"
					onChange={(e) => dj.setConstraints({ budgetAnnual: e.target.value === "" ? null : Number(e.target.value) })} className={inputCls} />
			</CardContent></Card>

			<Card><CardContent className="space-y-3 p-4">
				<p className="text-sm font-medium">Gia đình kỳ vọng nhóm ngành nào? (có thể chọn nhiều)</p>
				<div className="flex flex-wrap gap-2">
					{CLUSTERS.map((cl) => {
						const sel = c.parentExpectFields.includes(cl.id)
						return (
							<button key={cl.id} onClick={() => dj.setConstraints({ parentExpectFields: sel ? c.parentExpectFields.filter((x) => x !== cl.id) : [...c.parentExpectFields, cl.id] })}
								className={`rounded-lg border px-3 py-1.5 text-xs transition ${sel ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"}`}>{cl.icon} {cl.name}</button>
						)
					})}
				</div>
				<label className="block text-xs text-muted-foreground">Ngành khác (nếu gia đình kỳ vọng ngành không có trong danh sách trên, tự điền)</label>
				<input type="text" value={c.parentExpectOther} placeholder="Ví dụ: Luật, Nông nghiệp công nghệ cao, Hàng không…"
					onChange={(e) => dj.setConstraints({ parentExpectOther: e.target.value })} className={inputCls} />
				<label className="block text-xs text-muted-foreground">Kỳ vọng cụ thể khác của cha mẹ (trường, địa điểm, định hướng nghề sau này…)</label>
				<textarea rows={2} value={c.parentExpectNotes} placeholder="Ví dụ: muốn học trường công gần nhà, ổn định, có thể làm nhà nước…"
					onChange={(e) => dj.setConstraints({ parentExpectNotes: e.target.value })} className={inputCls} />
			</CardContent></Card>

			<Card><CardContent className="space-y-3 p-4">
				<p className="text-sm font-medium">Chuyên ngành / lĩnh vực cụ thể bạn quan tâm nhất</p>
				<label className="block text-xs text-muted-foreground">Áp dụng cho MỌI nhóm ngành (CNTT, Kỹ thuật &amp; Xây dựng, Kiến trúc &amp; Thiết kế, Kinh doanh &amp; Quản lý, Truyền thông &amp; Marketing, Tài chính – Kế toán, Pháp luật, Y – Dược &amp; Sức khỏe, Sư phạm &amp; Giáo dục, Tâm lý &amp; Xã hội, Ngôn ngữ &amp; Văn hóa, Du lịch &amp; Dịch vụ, Hàng hải – Logistics, Công an – Quân đội, Văn hóa – Nghệ thuật…). Nếu đã có hướng cụ thể, hãy ghi rõ.</label>
				<input type="text" value={c.specificMajorInterest} placeholder="Ví dụ: Trí tuệ nhân tạo, Điều dưỡng, Thiết kế đồ họa, Logistics, Marketing, Luật kinh tế…"
					onChange={(e) => dj.setConstraints({ specificMajorInterest: e.target.value })} className={inputCls} />
			</CardContent></Card>

			<Card><CardContent className="space-y-3 p-4">
				<p className="text-sm font-medium">Kết quả học tập hiện tại</p>
				<label className="block text-xs text-muted-foreground">GPA / học lực và điểm thi chuẩn hóa nếu có (IELTS, SAT, ACT…). Đây là yếu tố then chốt để ước lượng khả năng trúng tuyển, đặc biệt khi du học.</label>
				<textarea rows={2} value={c.academicResults} placeholder="Ví dụ: GPA 8.5/10, IELTS 6.5, chưa thi SAT…"
					onChange={(e) => dj.setConstraints({ academicResults: e.target.value })} className={inputCls} />
			</CardContent></Card>

			<Card><CardContent className="space-y-3 p-4">
				<p className="text-sm font-medium">Mức độ sẵn sàng săn học bổng</p>
				<div className="flex flex-wrap gap-2">
					{scholarships.map((s) => (
						<button key={s.id} onClick={() => dj.setConstraints({ scholarshipReadiness: s.id as any })}
							className={`rounded-lg border px-3 py-1.5 text-sm transition ${c.scholarshipReadiness === s.id ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"}`}>{s.label}</button>
					))}
				</div>
			</CardContent></Card>

			<Card><CardContent className="space-y-3 p-4">
				<p className="text-sm font-medium">Mục tiêu nghề nghiệp dài hạn (5–10 năm tới)</p>
				<label className="block text-xs text-muted-foreground">Bạn hình dung mình làm công việc gì, ở đâu, vai trò ra sao?</label>
				<textarea rows={2} value={c.longTermGoal} placeholder="Ví dụ: làm chuyên viên marketing ở công ty đa quốc gia tại TP.HCM, sau 5 năm lên quản lý…"
					onChange={(e) => dj.setConstraints({ longTermGoal: e.target.value })} className={inputCls} />
			</CardContent></Card>

			<Card><CardContent className="space-y-3 p-4">
				<p className="text-sm font-medium">Nơi bạn muốn học / làm việc (tỉnh/thành)</p>
				<input type="text" value={c.geo ?? ""} placeholder="Ví dụ: Hà Nội, TP.HCM, Đà Nẵng…" onChange={(e) => dj.setConstraints({ geo: e.target.value })}
					className={inputCls} />
				<label className="flex items-center gap-2 text-sm">
					<input type="checkbox" checked={c.studyAbroad} onChange={(e) => dj.setConstraints({ studyAbroad: e.target.checked })} className="accent-primary" />
					Có cân nhắc du học / học chương trình quốc tế
				</label>
			</CardContent></Card>

			<NavRow onBack={() => dj.goto("values")} onNext={() => dj.runLayer1()} nextLabel="Tạo giả thuyết" />
		</div>
	)
}

function Layer1Step({ dj }: { dj: Dj }) {
	const r = dj.state.layer1
	if (!r) return <EmptyRetry label="Chưa có giả thuyết" onRetry={() => dj.runLayer1()} />
	return (
		<div className="space-y-6">
			<Card><CardContent className="space-y-2 p-4">
				<div className="flex items-center gap-2"><Badge variant="accent">Holland Code: {r.hollandCode}</Badge>{r.source === "ai" && <Badge variant="muted">AI</Badge>}</div>
				<p className="text-sm text-muted-foreground">{r.disclaimer}</p>
				{r.consistencyFlag && <p className="text-xs text-amber-600">Lưu ý: một số câu trả lời có vẻ thiếu nhất quán — kết quả chỉ mang tính tham khảo.</p>}
			</CardContent></Card>
			{r.hypotheses.map((h, i) => {
				const cl = getCluster(h.clusterId)
				return (
					<Card key={h.clusterId}>
						<CardContent className="space-y-2 p-4">
							<div className="flex items-center justify-between">
								<h3 className="font-semibold">{cl?.icon} Giả thuyết {i + 1}: {cl?.name}</h3>
								<Badge variant="muted">tin cậy ~{Math.round(h.confidence * 100)}%</Badge>
							</div>
							<p className="text-sm text-muted-foreground">{h.why}</p>
							<p className="text-xs"><span className="font-medium text-primary">Xác nhận nếu:</span> {h.confirmIf}</p>
							<p className="text-xs"><span className="font-medium text-amber-600">Bác bỏ nếu:</span> {h.disconfirmIf}</p>
						</CardContent>
					</Card>
				)
			})}
			<NavRow onBack={() => dj.goto("constraints")} onNext={() => dj.goto("tasks")} nextLabel="Kiểm chứng bằng bài thực tế" />
		</div>
	)
}

function TasksStep({ dj }: { dj: Dj }) {
	const clusterIds = useMemo(() => dj.state.layer1?.hypotheses.map((h) => h.clusterId) ?? [], [dj.state.layer1])
	const [activeIdx, setActiveIdx] = useState(0)
	const [task, setTask] = useState<TaskSpec | null>(null)
	const [submission, setSubmission] = useState("")
	const [selfFeeling, setSelfFeeling] = useState(3)
	const [wantMore, setWantMore] = useState(3)
	const [grade, setGrade] = useState<GradeResult | null>(null)
	const [startedAt, setStartedAt] = useState<number>(Date.now())
	const clusterId = clusterIds[activeIdx]

	useEffect(() => {
		let alive = true
		setTask(null); setGrade(null); setSubmission(""); setStartedAt(Date.now())
		const existing = dj.state.attempts.find((a) => a.clusterId === clusterId)
		if (existing) { setGrade(existing.grade); setSubmission(existing.submission); setSelfFeeling(existing.selfFeeling); setWantMore(existing.wantMore) }
		if (clusterId) dj.fetchTask(clusterId).then((t) => { if (alive) setTask(t) })
		return () => { alive = false }
	}, [clusterId])

	if (!clusterIds.length) return <EmptyRetry label="Chưa có cụm để thử" onRetry={() => dj.goto("layer1")} />
	const cl = getCluster(clusterId)
	const submit = async () => {
		if (!task) return
		const g = await dj.submitAttempt({ task, submission, timeSpentSec: Math.round((Date.now() - startedAt) / 1000), selfFeeling, wantMore, mode: "auto" })
		if (g) setGrade(g)
	}
	const allTried = clusterIds.every((id) => dj.state.attempts.some((a) => a.clusterId === id))
	return (
		<div className="space-y-5">
			<div className="flex flex-wrap gap-2">
				{clusterIds.map((id, i) => {
					const done = dj.state.attempts.some((a) => a.clusterId === id)
					return (
						<button key={id} onClick={() => setActiveIdx(i)}
							className={`rounded-full border px-3 py-1 text-xs transition ${i === activeIdx ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"}`}>
							{done ? "✓ " : ""}{getCluster(id)?.icon} {getCluster(id)?.name}
						</button>
					)
				})}
			</div>
			{!task ? (
				<div className="py-10 text-center text-sm text-muted-foreground"><Loader2 className="mx-auto mb-2 h-5 w-5 animate-spin" />Đang tải đề bài…</div>
			) : (
				<Card><CardContent className="space-y-3 p-4">
					<Badge variant="muted">{cl?.name} · ~{task.time_limit_min} phút</Badge>
					<h3 className="font-semibold">{task.title}</h3>
					<p className="text-sm text-muted-foreground">{task.scenario}</p>
					<p className="text-sm"><span className="font-medium">Yêu cầu: </span>{task.instructions}</p>
					{task.rubric?.length > 0 && (
						<div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
							<p className="mb-1 font-medium text-foreground">Bài của bạn sẽ được chấm theo đúng các tiêu chí này:</p>
							<ul className="list-disc space-y-0.5 pl-4">
								{task.rubric.map((r, i) => (<li key={i}><strong>{r.criterion}</strong> — {r.what_good_looks_like}</li>))}
							</ul>
						</div>
					)}
					<textarea value={submission} onChange={(e) => setSubmission(e.target.value)} rows={7} placeholder="Viết bài làm của bạn ở đây…"
						className="w-full rounded-lg border border-input bg-card px-3 py-2 text-sm" />
					<div className="grid gap-3 sm:grid-cols-2">
						<ScaleRow label="Cảm giác khi làm bài này" value={selfFeeling} onChange={setSelfFeeling} />
						<ScaleRow label="Muốn làm thêm dạng này" value={wantMore} onChange={setWantMore} />
					</div>
					<Button onClick={submit} disabled={submission.trim().length < 10}>Nộp & chấm</Button>
				</CardContent></Card>
			)}
			{grade && <GradeView grade={grade} />}
			<NavRow onBack={() => dj.goto("layer1")} onNext={() => dj.runConfidence()} nextLabel="Xem bằng chứng 2 trục" nextDisabled={dj.state.attempts.length === 0} />
			{!allTried && <p className="text-right text-xs text-muted-foreground">Nên thử ít nhất vài cụm để so sánh chính xác hơn.</p>}
		</div>
	)
}

function ScaleRow({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
	return (
		<div className="space-y-1">
			<p className="text-xs font-medium">{label}</p>
			<div className="flex gap-1">
				{[1, 2, 3, 4, 5].map((n) => (
					<button key={n} onClick={() => onChange(n)} className={`h-8 w-8 rounded-md border text-xs transition ${value === n ? "border-primary bg-primary/10 text-primary" : "border-input hover:bg-muted"}`}>{n}</button>
				))}
			</div>
		</div>
	)
}

function GradeView({ grade }: { grade: GradeResult }) {
	return (
		<Card><CardContent className="space-y-3 p-4">
			<div className="flex flex-wrap gap-3">
				<div className="flex items-center gap-2 text-sm"><Target className="h-4 w-4 text-primary" /> Năng lực: <strong>{grade.competenceScore}/100</strong></div>
				<div className="flex items-center gap-2 text-sm"><Heart className="h-4 w-4 text-accent" /> Hứng thú: <strong>{grade.interestSignal}/100</strong></div>
				{grade.source === "ai" ? <Badge variant="muted">Chấm bởi AI</Badge> : <Badge variant="muted">Chấm tự động</Badge>}
			</div>
			{grade.feedback && <p className="text-sm text-muted-foreground">{grade.feedback}</p>}
			{grade.competenceBreakdown?.length > 0 && (
				<ul className="space-y-1">
					{grade.competenceBreakdown.map((b, i) => (
						<li key={i} className="text-xs text-muted-foreground"><strong>{b.criterion}:</strong> {b.score == null ? "không áp dụng (đề không yêu cầu)" : `${b.score}/100`}{b.evidence_quote ? ` — ${b.evidence_quote}` : ""}</li>
					))}
				</ul>
			)}
			{grade.redFlags?.length > 0 && grade.redFlags.map((f, i) => <p key={i} className="text-xs text-amber-600">⚠ {f}</p>)}
		</CardContent></Card>
	)
}

function ConfidenceStep({ dj }: { dj: Dj }) {
	const data = dj.state.confidence
	if (!data.length) return <EmptyRetry label="Chưa có bằng chứng" onRetry={() => dj.runConfidence()} />
	return (
		<div className="space-y-6">
			<p className="text-sm text-muted-foreground">Mỗi cụm được đặt trên 2 trục: Năng lực (trục dọc) và Hứng thú (trục ngang).</p>
			<Quadrant data={data} />
			{data.map((c) => {
				const cl = getCluster(c.clusterId)
				return (
					<Card key={c.clusterId}><CardContent className="space-y-1 p-4">
						<div className="flex items-center justify-between">
							<h3 className="font-semibold">{cl?.icon} {cl?.name}</h3>
							<Badge variant="muted">{c.evidenceCount} bài</Badge>
						</div>
						<p className="text-xs text-muted-foreground">Năng lực {c.competenceAxis}/100 · Hứng thú {c.interestAxis}/100{c.divergence > 30 ? " · ⚠ chênh lệch lớn giữa thích và giỏi" : ""}</p>
						<p className="text-sm">{quadrantLabel(c.competenceAxis, c.interestAxis)}</p>
					</CardContent></Card>
				)
			})}
			<NavRow onBack={() => dj.goto("tasks")} onNext={() => dj.runLayer3()} nextLabel="Xem quyết định có dữ liệu" />
		</div>
	)
}

function Quadrant({ data }: { data: { clusterId: string; competenceAxis: number; interestAxis: number }[] }) {
	return (
		<div className="relative mx-auto aspect-square w-full max-w-sm rounded-xl border bg-card">
			<div className="absolute left-1/2 top-0 h-full w-px bg-border" />
			<div className="absolute left-0 top-1/2 h-px w-full bg-border" />
			<span className="absolute left-1 top-1 text-[10px] text-muted-foreground">Giỏi/chưa thích</span>
			<span className="absolute right-1 top-1 text-[10px] text-muted-foreground">Giỏi + thích</span>
			<span className="absolute bottom-1 left-1 text-[10px] text-muted-foreground">Chưa phù hợp</span>
			<span className="absolute bottom-1 right-1 text-[10px] text-muted-foreground">Thích/chưa giỏi</span>
			{data.map((c) => {
				const cl = getCluster(c.clusterId)
				return (
					<div key={c.clusterId} className="absolute -translate-x-1/2 translate-y-1/2 text-lg"
						style={{ left: `${c.interestAxis}%`, bottom: `${c.competenceAxis}%` }} title={cl?.name}>
						{cl?.icon}
					</div>
				)
			})}
		</div>
	)
}

function Layer3Step({ dj }: { dj: Dj }) {
	const r = dj.state.layer3
	if (!r) return <EmptyRetry label="Chưa có dữ liệu quyết định" onRetry={() => dj.runLayer3()} />
	return (
		<div className="space-y-6">
			<Card><CardContent className="space-y-2 p-4">
				<h3 className="font-semibold">Đóng khung quyết định</h3>
				<p className="text-sm text-muted-foreground">{r.framing}</p>
			</CardContent></Card>
			{(() => {
				const c = dj.state.constraints
				const rows: string[] = []
				if (c.familyBudget) rows.push(`Tài chính: ${c.familyBudget === "han-che" ? "Hạn chế" : c.familyBudget === "vua-phai" ? "Vừa phải" : "Đầy đủ"}${c.budgetAnnual ? ` (~${c.budgetAnnual} triệu/năm)` : ""}`)
				else if (c.budgetAnnual) rows.push(`Tài chính: ~${c.budgetAnnual} triệu/năm`)
				if (c.parentExpectFields.length || c.parentExpectOther) {
					const names = c.parentExpectFields.map((id) => getCluster(id)?.name ?? id)
					if (c.parentExpectOther) names.push(c.parentExpectOther)
					rows.push(`Gia đình kỳ vọng: ${names.join(", ")}`)
				}
				if (c.parentExpectNotes) rows.push(`Kỳ vọng khác của cha mẹ: ${c.parentExpectNotes}`)
				if (c.specificMajorInterest) rows.push(`Chuyên ngành/lĩnh vực quan tâm: ${c.specificMajorInterest}`)
				if (c.academicResults) rows.push(`Kết quả học tập: ${c.academicResults}`)
				if (c.scholarshipReadiness) rows.push(`Học bổng: ${c.scholarshipReadiness === "chua" ? "Chưa nghĩ tới" : c.scholarshipReadiness === "quan-tam" ? "Có quan tâm" : "Đã có chiến lược"}`)
				if (c.longTermGoal) rows.push(`Mục tiêu 5–10 năm: ${c.longTermGoal}`)
				if (c.geo) rows.push(`Nơi học/làm: ${c.geo}`)
				if (c.studyAbroad) rows.push("Có cân nhắc du học")
				if (!rows.length) return null
				return (
					<Card><CardContent className="space-y-1 p-4">
						<h3 className="text-sm font-semibold">Hồ sơ bối cảnh của bạn (đã dùng để đóng khung)</h3>
						<ul className="space-y-1">{rows.map((t, i) => <li key={i} className="text-xs text-muted-foreground">• {t}</li>)}</ul>
					</CardContent></Card>
				)
			})()}
			{r.byCluster.map((c) => (
				<Card key={c.clusterId}><CardContent className="space-y-3 p-4">
					<h3 className="font-semibold">{getCluster(c.clusterId)?.icon} {c.clusterName}</h3>
					<div className="overflow-x-auto">
						<table className="w-full text-left text-xs">
							<thead className="text-muted-foreground"><tr>
								<th className="py-1 pr-2">Trường</th><th className="py-1 pr-2">Tỉ lệ VL</th><th className="py-1 pr-2">Lương đầu</th><th className="py-1 pr-2">Lương 5n</th><th className="py-1">Học phí/năm</th>
							</tr></thead>
							<tbody>
								{c.schools.map((s) => (
									<tr key={s.name} className="border-t">
										<td className="py-1 pr-2">{s.name}</td>
										<td className="py-1 pr-2">{s.employRate}%</td>
										<td className="py-1 pr-2">{s.salaryStart}tr</td>
										<td className="py-1 pr-2">{s.salary5yMedian}tr</td>
										<td className="py-1">{s.tuitionYear === 0 ? "Miễn" : s.tuitionYear + "tr"}</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
					<p className="text-xs text-muted-foreground"><span className="font-medium">Con đường thay thế: </span>{c.altPaths}</p>
				</CardContent></Card>
			))}
			<Card><CardContent className="space-y-2 p-4">
				<h3 className="text-sm font-semibold">Dữ liệu còn thiếu / cần kiểm chứng</h3>
				<ul className="space-y-1">{r.dataGaps.map((g, i) => <li key={i} className="text-xs text-muted-foreground">• {g}</li>)}</ul>
			</CardContent></Card>
			<div className="flex items-center justify-between gap-3 border-t pt-5">
				<Button variant="ghost" onClick={() => dj.goto("confidence")}><ArrowLeft className="h-4 w-4" /> Quay lại</Button>
				<Button variant="outline" onClick={dj.reset}><RotateCcw className="h-4 w-4" /> Làm lại từ đầu</Button>
			</div>
		</div>
	)
}

function EmptyRetry({ label, onRetry }: { label: string; onRetry: () => void }) {
	return (
		<div className="space-y-3 py-10 text-center">
			<p className="text-sm text-muted-foreground">{label}</p>
			<Button onClick={onRetry}>Thử lại</Button>
		</div>
	)
}
