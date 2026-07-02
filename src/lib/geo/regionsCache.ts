"use client"

// =============================================================
// PHASE 2 — Cache danh mục địa lý phía client (LocalStorage).
// Mục tiêu: tải /api/regions ĐÚNG 1 LẦN, sau đó mọi dropdown Tỉnh/Huyện
// và bản đồ render tức thì từ bộ nhớ client — tiết kiệm 3G/4G.
// =============================================================

import { useEffect, useRef, useState } from "react"
import type { IndustryMeta, IndustryTag } from "@/data/geo/industries"
import type { ProvinceNode } from "@/data/geo/provinces"
import type { EconomicZone } from "@/data/geo/economicZones"

export interface RegionsPayload {
	version: string
	generatedAt: string
	industries: IndustryMeta[]
	provinces: ProvinceNode[]
	zones: EconomicZone[]
	demand: Array<{
		provinceCode: string
		industry: IndustryTag
		demandScore: number
		jobOpenings: number
	}>
}

const CACHE_KEY = "hoatieu.regions.v1"
const TTL_MS = 1000 * 60 * 60 * 24 * 7 // 7 ngày
// Phải khớp GEO_DATA_VERSION trong src/data/geo/index.ts. Đặt lại để tránh
// kéo toàn bộ data vào bundle client qua barrel; bạn nâng song song khi đổi data.
const EXPECTED_VERSION = "2026-06-26.2"

interface CachedEnvelope {
	savedAt: number
	payload: RegionsPayload
}

function readCache(): RegionsPayload | null {
	if (typeof window === "undefined") return null
	try {
		const raw = window.localStorage.getItem(CACHE_KEY)
		if (!raw) return null
		const parsed = JSON.parse(raw) as CachedEnvelope
		if (!parsed?.payload?.provinces?.length) return null
		if (parsed.payload.version !== EXPECTED_VERSION) return null // data đã đổi
		if (Date.now() - parsed.savedAt > TTL_MS) return null // quá hạn
		return parsed.payload
	} catch {
		return null
	}
}

function writeCache(payload: RegionsPayload) {
	if (typeof window === "undefined") return
	try {
		const envelope: CachedEnvelope = { savedAt: Date.now(), payload }
		window.localStorage.setItem(CACHE_KEY, JSON.stringify(envelope))
	} catch {
		// bỏ qua nếu LocalStorage đầy / bị chặn
	}
}

// Tránh gọi /api/regions nhiều lần cùng lúc (nhiều component dùng hook).
let inflight: Promise<RegionsPayload> | null = null

/** Lấy danh mục vùng: ưu tiên cache, chỉ fetch khi thiếu/quá hạn/đổi version. */
export async function loadRegions(force = false): Promise<RegionsPayload> {
	if (!force) {
		const cached = readCache()
		if (cached) return cached
	}
	if (inflight) return inflight
	inflight = (async () => {
		const res = await fetch("/api/regions", { cache: "no-store" })
		if (!res.ok) throw new Error("Không tải được danh mục vùng (/api/regions)")
		const payload = (await res.json()) as RegionsPayload
		writeCache(payload)
		return payload
	})()
	try {
		return await inflight
	} finally {
		inflight = null
	}
}

export interface UseRegionsResult {
	data: RegionsPayload | null
	loading: boolean
	error: string | null
	reload: () => void
}

/**
 * Hook dùng trong Client Component: render ngay từ cache (nếu có),
 * tự fetch nền khi cần. Không fetch lại nếu cache còn hạn.
 */
export function useRegions(): UseRegionsResult {
	const [data, setData] = useState<RegionsPayload | null>(() => readCache())
	const [loading, setLoading] = useState<boolean>(() => readCache() === null)
	const [error, setError] = useState<string | null>(null)
	const aliveRef = useRef(true)

	useEffect(() => {
		aliveRef.current = true
		if (data) {
			setLoading(false)
			return
		}
		loadRegions()
			.then((p) => {
				if (!aliveRef.current) return
				setData(p)
				setLoading(false)
			})
			.catch((e: unknown) => {
				if (!aliveRef.current) return
				setError(e instanceof Error ? e.message : String(e))
				setLoading(false)
			})
		return () => {
			aliveRef.current = false
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const reload = () => {
		setLoading(true)
		loadRegions(true)
			.then((p) => {
				if (!aliveRef.current) return
				setData(p)
				setLoading(false)
			})
			.catch((e: unknown) => {
				if (!aliveRef.current) return
				setError(e instanceof Error ? e.message : String(e))
				setLoading(false)
			})
	}

	return { data, loading, error, reload }
}
