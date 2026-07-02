"use client"
// =============================================================
// HOOK quản lý toàn bộ luồng Discovery Journey ở client (localStorage).
// Hoạt động độc lập: không cần đăng nhập, không cần DB.
// Gọi API /api/dj/* để có diễn giải AI; nếu API lỗi vẫn fallback.
// =============================================================
import { useCallback, useEffect, useState } from "react"
import type {
	ConstraintsInput,
	ValueScores,
	Layer1Result,
	GradeResult,
	ClusterConfidence,
	Layer3Result,
	TaskSpec,
} from "@/lib/dj/types"

export type DjStep =
	| "intro"
	| "riasec"
	| "aptitude"
	| "values"
	| "constraints"
	| "layer1"
	| "tasks"
	| "confidence"
	| "layer3"

const STORAGE_KEY = "hoatieu_dj_v1"

export interface AttemptRecord {
	taskId: string
	clusterId: string
	submission: string
	timeSpentSec: number
	selfFeeling: number
	wantMore: number
	grade: GradeResult
	difficulty: number
}

export interface DjState {
	step: DjStep
	riasecRaw: Record<string, number>
	aptitudeRaw: Record<string, string>
	values: ValueScores
	constraints: ConstraintsInput
	layer1: Layer1Result | null
	attempts: AttemptRecord[]
	confidence: ClusterConfidence[]
	layer3: Layer3Result | null
}

const DEFAULT_CONSTRAINTS: ConstraintsInput = {
	familyBudget: null,
	budgetAnnual: null,
	parentExpectFields: [],
	parentExpectOther: "",
	parentExpectNotes: "",
	specificMajorInterest: "",
	scholarshipReadiness: null,
	academicResults: "",
	longTermGoal: "",
	geo: null,
	studyAbroad: false,
}

function initialState(): DjState {
	return {
		step: "intro",
		riasecRaw: {},
		aptitudeRaw: {},
		values: {},
		constraints: DEFAULT_CONSTRAINTS,
		layer1: null,
		attempts: [],
		confidence: [],
		layer3: null,
	}
}

async function postJson<T>(url: string, body: unknown): Promise<T | null> {
	try {
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(body),
		})
		if (!res.ok) return null
		return (await res.json()) as T
	} catch {
		return null
	}
}

export function useDiscovery() {
	const [state, setState] = useState<DjState>(initialState)
	const [loading, setLoading] = useState(false)
	const [hydrated, setHydrated] = useState(false)

	useEffect(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY)
			if (raw) setState({ ...initialState(), ...JSON.parse(raw) })
		} catch {}
		setHydrated(true)
	}, [])

	useEffect(() => {
		if (!hydrated) return
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
		} catch {}
	}, [state, hydrated])

	const goto = useCallback((step: DjStep) => setState((s) => ({ ...s, step })), [])
	const reset = useCallback(() => {
		try {
			localStorage.removeItem(STORAGE_KEY)
		} catch {}
		setState(initialState())
	}, [])

	const setRiasec = useCallback((id: string, v: number) => {
		setState((s) => ({ ...s, riasecRaw: { ...s.riasecRaw, [id]: v } }))
	}, [])
	const setAptitude = useCallback((id: string, v: string) => {
		setState((s) => ({ ...s, aptitudeRaw: { ...s.aptitudeRaw, [id]: v } }))
	}, [])
	const setValue = useCallback((key: string, v: number) => {
		setState((s) => ({ ...s, values: { ...s.values, [key]: v } }))
	}, [])
	const setConstraints = useCallback((patch: Partial<ConstraintsInput>) => {
		setState((s) => ({ ...s, constraints: { ...s.constraints, ...patch } }))
	}, [])

	// Lớp 1: gửi dữ liệu -> nhận giả thuyết
	const runLayer1 = useCallback(async () => {
		setLoading(true)
		const res = await postJson<Layer1Result>("/api/dj/layer1", {
			riasecRaw: state.riasecRaw,
			aptitudeRaw: state.aptitudeRaw,
			values: state.values,
			constraints: state.constraints,
		})
		setLoading(false)
		if (res) setState((s) => ({ ...s, layer1: res, step: "layer1" }))
		return res
	}, [state.riasecRaw, state.aptitudeRaw, state.values, state.constraints])

	// Lấy đề cho 1 cụm
	const fetchTask = useCallback(async (clusterId: string): Promise<TaskSpec | null> => {
		const res = await postJson<{ task: TaskSpec }>("/api/dj/task", { clusterId })
		return res?.task ?? null
	}, [])

	// Nộp bài -> chấm
	const submitAttempt = useCallback(
		async (args: {
			task: TaskSpec
			submission: string
			timeSpentSec: number
			selfFeeling: number
			wantMore: number
			mode: "auto" | "self_assist"
		}) => {
			setLoading(true)
			const grade = await postJson<GradeResult>("/api/dj/grade", {
				taskId: args.task.task_id,
				clusterId: args.task.cluster_id,
				task: args.task, // gửi ĐÚNG đề đã hiển thị để chấm khớp rubric
				submission: args.submission,
				timeSpentSec: args.timeSpentSec,
				selfFeeling: args.selfFeeling,
				wantMore: args.wantMore,
				mode: args.mode,
			})
			setLoading(false)
			if (!grade) return null
			const record: AttemptRecord = {
				taskId: args.task.task_id,
				clusterId: args.task.cluster_id,
				submission: args.submission,
				timeSpentSec: args.timeSpentSec,
				selfFeeling: args.selfFeeling,
				wantMore: args.wantMore,
				grade,
				difficulty: args.task.difficulty,
			}
			setState((s) => ({ ...s, attempts: [...s.attempts.filter((a) => a.taskId !== record.taskId), record] }))
			return grade
		},
		[],
	)

	// Tính confidence 2 trục
	const runConfidence = useCallback(async () => {
		setLoading(true)
		const res = await postJson<{ confidence: ClusterConfidence[] }>("/api/dj/confidence", {
			attempts: state.attempts.map((a) => ({
				clusterId: a.clusterId,
				competenceScore: a.grade.competenceScore,
				difficulty: a.difficulty,
				selfFeeling: a.selfFeeling,
				wantMore: a.wantMore,
			})),
		})
		setLoading(false)
		if (res) setState((s) => ({ ...s, confidence: res.confidence, step: "confidence" }))
		return res?.confidence ?? []
	}, [state.attempts])

	// Lớp 3: đóng khung quyết định
	const runLayer3 = useCallback(async () => {
		setLoading(true)
		const top = [...state.confidence].slice(0, 3).map((c) => c.clusterId)
		const params = new URLSearchParams()
		params.set("clusters", top.join(","))
		const qs = new URLSearchParams()
		qs.set("clusters", top.join(","))
		let res: Layer3Result | null = null
		try {
			const r = await fetch(`/api/dj/layer3`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ confidence: state.confidence, constraints: state.constraints }),
			})
			if (r.ok) res = (await r.json()) as Layer3Result
		} catch {}
		setLoading(false)
		if (res) setState((s) => ({ ...s, layer3: res, step: "layer3" }))
		return res
	}, [state.confidence, state.constraints])

	return {
		state,
		loading,
		hydrated,
		goto,
		reset,
		setRiasec,
		setAptitude,
		setValue,
		setConstraints,
		runLayer1,
		fetchTask,
		submitAttempt,
		runConfidence,
		runLayer3,
	}
}
