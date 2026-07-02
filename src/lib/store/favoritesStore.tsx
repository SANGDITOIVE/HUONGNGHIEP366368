"use client"

import {
	createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react"
import { useSession } from "next-auth/react"
import {
	migrateLegacyScoped, readScoped, slotFor, writeScoped,
} from "./scopedStore"

// Namespace lưu danh sách ngành đã lưu để so sánh — TÁCH RIÊNG theo tài khoản.
const NS = "favorites-majors"
// Khóa chung cũ (bản trước) — di trú 1 lần vào slot khách.
const LEGACY_KEY = "huong-nghiep:favorites:v1"

interface FavoritesContextValue {
	ids: string[]
	has: (id: string) => boolean
	toggle: (id: string) => void
	remove: (id: string) => void
	clear: () => void
	hydrated: boolean
}

const FavoritesContext = createContext<FavoritesContextValue | null>(null)

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
	const { data: session, status } = useSession()
	const email = session?.user?.email ?? null
	const slot = slotFor(email)

	const [ids, setIds] = useState<string[]>([])
	const [hydrated, setHydrated] = useState(false)
	// Slot đã nạp xong — chỉ cho phép ghi khi khớp với tài khoản hiện tại.
	const loadedSlotRef = useRef<string | null>(null)

	// Nạp danh sách của đúng tài khoản mỗi khi phiên đăng nhập thay đổi.
	useEffect(() => {
		if (status === "loading") return
		migrateLegacyScoped(NS, LEGACY_KEY)
		const stored = readScoped<string[]>(NS, email, [])
		setIds(Array.isArray(stored) ? stored.filter((x): x is string => typeof x === "string") : [])
		loadedSlotRef.current = slot
		setHydrated(true)
	}, [slot, status, email])

	// Ghi lại CHᢀ khi đã nạp đúng slot hiện tại (tránh ghi đè nhầm tài khoản).
	useEffect(() => {
		if (!hydrated || loadedSlotRef.current !== slot) return
		writeScoped(NS, email, ids)
	}, [ids, hydrated, slot, email])

	const has = useCallback((id: string) => ids.includes(id), [ids])
	const toggle = useCallback((id: string) => {
		setIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
	}, [])
	const remove = useCallback((id: string) => {
		setIds((prev) => prev.filter((x) => x !== id))
	}, [])
	const clear = useCallback(() => setIds([]), [])

	const value = useMemo(
		() => ({ ids, has, toggle, remove, clear, hydrated }),
		[ids, has, toggle, remove, clear, hydrated],
	)

	return (
		<FavoritesContext.Provider value={value}>{children}</FavoritesContext.Provider>
	)
}

export function useFavorites() {
	const ctx = useContext(FavoritesContext)
	if (!ctx) throw new Error("useFavorites phải dùng trong FavoritesProvider")
	return ctx
}
