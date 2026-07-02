"use client"

// PHASE 2/4 — Cho phép người dùng chọn tỉnh/thành, lưu vào hồ sơ (server)
// để cá nhân hoá gợi ý nghề nghiệp theo vị trí.
import { useCallback, useEffect, useState } from "react"
import { MapPin, Check, Loader2 } from "lucide-react"
import { RegionSelect } from "@/components/geo/RegionSelect"

type Status = "loading" | "idle" | "saving" | "saved" | "error" | "anon"

export function ProvincePicker() {
	const [value, setValue] = useState("")
	const [status, setStatus] = useState<Status>("loading")

	useEffect(() => {
		let alive = true
		fetch("/api/profile")
			.then((r) => (r.status === 401 ? "anon" : r.ok ? r.json() : null))
			.then((d) => {
				if (!alive) return
				if (d === "anon") {
					setStatus("anon")
					return
				}
				setValue((d as { account?: { provinceCode?: string } })?.account?.provinceCode ?? "")
				setStatus("idle")
			})
			.catch(() => alive && setStatus("idle"))
		return () => {
			alive = false
		}
	}, [])

	const save = useCallback(async (code: string) => {
		setValue(code)
		setStatus("saving")
		try {
			const res = await fetch("/api/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ provinceCode: code || null }),
			})
			if (!res.ok) throw new Error("save failed")
			setStatus("saved")
			setTimeout(() => setStatus("idle"), 1800)
		} catch {
			setStatus("error")
		}
	}, [])

	return (
		<div className="rounded-xl border bg-white p-4">
			<div className="flex items-center gap-2 text-sm font-semibold">
				<MapPin className="h-4 w-4 text-primary" /> Tỉnh/thành của bạn
			</div>
			<p className="mt-1 text-xs text-slate-500">
				Chọn nơi bạn sinh sống để HoaTieu ưu tiên gợi ý ngành &amp; cơ hội việc làm ngay tại địa phương.
			</p>
			{status === "anon" ? (
				<p className="mt-3 text-sm text-slate-500">Đăng nhập để lưu tỉnh/thành và đồng bộ trên mọi thiết bị.</p>
			) : (
				<div className="mt-3 flex items-center gap-2">
					<RegionSelect value={value} onChange={save} className="max-w-xs" disabled={status === "loading"} />
					{status === "saving" && <Loader2 className="h-4 w-4 animate-spin text-slate-400" />}
					{status === "saved" && (
						<span className="flex items-center gap-1 text-xs text-emerald-600">
							<Check className="h-3.5 w-3.5" /> Đã lưu
						</span>
					)}
					{status === "error" && <span className="text-xs text-rose-600">Lỗi, thử lại</span>}
				</div>
			)}
		</div>
	)
}
