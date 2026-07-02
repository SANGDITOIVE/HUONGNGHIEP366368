"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { useSession } from "next-auth/react"
import { EMPTY_JOURNEY, type JourneyState } from "@/lib/journey/types"
import {
	clearScoped, migrateLegacyScoped, readScoped, slotFor, writeScoped,
} from "@/lib/store/scopedStore"

// Namespace tiến trình hành trình — TÁCH RIÊNG theo tài khoản.
const NS = "journey"
const LEGACY_KEY = "huong-nghiep:journey:v1"

// Hook quản lý trạng thái hành trình + tự lưu vào localStorage (tạm dừng được).
export function useJourney() {
	const { data: session, status } = useSession()
	const email = session?.user?.email ?? null
	const slot = slotFor(email)
	const loadedSlotRef = useRef<string | null>(null)

	const [state, setState] = useState<JourneyState>(EMPTY_JOURNEY)
	const [loaded, setLoaded] = useState(false)

	// Nạp tiến trình của đúng tài khoản mỗi khi phiên đăng nhập thay đổi.
	useEffect(() => {
		if (status === "loading") return
		migrateLegacyScoped(NS, LEGACY_KEY)
		const stored = readScoped<Partial<JourneyState>>(NS, email, {})
		setState({ ...EMPTY_JOURNEY, ...(stored && typeof stored === "object" ? stored : {}) })
		loadedSlotRef.current = slot
		setLoaded(true)
	}, [slot, status, email])

	useEffect(() => {
		if (!loaded || loadedSlotRef.current !== slot) return
		writeScoped(NS, email, state)
	}, [state, loaded, slot, email])

	const update = useCallback((patch: Partial<JourneyState>) => {
		setState((s) => ({ ...s, ...patch }))
	}, [])

	const setPattern = useCallback((id: string, idx: number) => {
		setState((s) => ({ ...s, patternAnswers: { ...s.patternAnswers, [id]: idx } }))
	}, [])

	const toggleWord = useCallback((qid: string, wordId: string, max: number) => {
		setState((s) => {
			const cur = s.wordAnswers[qid] ?? []
			let next: string[]
			if (cur.includes(wordId)) {
				next = cur.filter((w) => w !== wordId)
			} else if (cur.length >= max) {
				next = [...cur.slice(1), wordId]
			} else {
				next = [...cur, wordId]
			}
			return { ...s, wordAnswers: { ...s.wordAnswers, [qid]: next } }
		})
	}, [])

	const setClassify = useCallback((id: string, v: "tot" | "chua-chac") => {
		setState((s) => ({ ...s, classifyAnswers: { ...s.classifyAnswers, [id]: v } }))
	}, [])

	const setEnv = useCallback((id: string, v: "hung" | "binh-thuong" | "khong") => {
		setState((s) => ({ ...s, envAnswers: { ...s.envAnswers, [id]: v } }))
	}, [])

	const setRole = useCallback((qid: string, idx: number) => {
		setState((s) => ({ ...s, roleAnswers: { ...s.roleAnswers, [qid]: idx } }))
	}, [])

	const setSituation = useCallback((qid: string, idx: number) => {
		setState((s) => ({ ...s, situationAnswers: { ...s.situationAnswers, [qid]: idx } }))
	}, [])

	const reset = useCallback(() => {
		setState(EMPTY_JOURNEY)
		clearScoped(NS, email)
	}, [email])

	return {
		state,
		loaded,
		update,
		setPattern,
		toggleWord,
		setClassify,
		setEnv,
		setRole,
		setSituation,
		reset,
	}
}
