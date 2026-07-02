"use client"

import {
	createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react"
import { useSession } from "next-auth/react"
import type { AssessmentInput } from "@/types"
import {
	migrateLegacyScoped, readScoped, slotFor, writeScoped,
} from "./scopedStore"

// Namespace bản nháp trắc nghiệm — TÁCH RIÊNG theo tài khoản.
const NS = "assessment"
const LEGACY_KEY = "huong-nghiep:assessment:v1"

export const EMPTY_INPUT: AssessmentInput = {
	stream: null,
	favoriteSubjects: [],
	skills: [],
	interests: [],
	workingStyles: [],
	preferredEnvironments: [],
	careerDestinations: [],
	values: [],
	familySupport: null,
	familyField: null,
	followFamily: null,
	roleModels: [],
	knowledgeAreas: [],
	knowsMBTI: false,
	mbtiType: null,
	mbtiSource: "none",
}

interface AssessmentContextValue {
	input: AssessmentInput
	update: (patch: Partial<AssessmentInput>) => void
	reset: () => void
	hydrated: boolean
}

const AssessmentContext = createContext<AssessmentContextValue | null>(null)

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession()
	const email = session?.user?.email ?? null
	const slot = slotFor(email)

	const [input, setInput] = useState<AssessmentInput>(EMPTY_INPUT)
	const [hydrated, setHydrated] = useState(false)
	const loadedSlotRef = useRef<string | null>(null)

	// Nạp bản nháp của đúng tài khoản mỗi khi phiên đăng nhập thay đổi.
	useEffect(() => {
		if (status === "loading") return
		migrateLegacyScoped(NS, LEGACY_KEY)
		const stored = readScoped<Partial<AssessmentInput>>(NS, email, {})
		setInput({ ...EMPTY_INPUT, ...(stored && typeof stored === "object" ? stored : {}) })
		loadedSlotRef.current = slot
		setHydrated(true)
	}, [slot, status, email])

	// Ghi lại CHᢀ khi đã nạp đúng slot hiện tại (tránh ghi đè nhầm tài khoản).
	useEffect(() => {
		if (!hydrated || loadedSlotRef.current !== slot) return
		writeScoped(NS, email, input)
	}, [input, hydrated, slot, email])

	const update = useCallback((patch: Partial<AssessmentInput>) => {
		setInput((prev) => ({ ...prev, ...patch }))
	}, [])

	const reset = useCallback(() => setInput(EMPTY_INPUT), [])

	const value = useMemo(
		() => ({ input, update, reset, hydrated }),
		[input, update, reset, hydrated],
	)

	return (
		<AssessmentContext.Provider value={value}>
			{children}
		</AssessmentContext.Provider>
	)
}

export function useAssessment() {
	const ctx = useContext(AssessmentContext)
	if (!ctx) throw new Error("useAssessment phải dùng trong AssessmentProvider")
	return ctx
}
