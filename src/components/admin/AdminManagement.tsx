"use client"

import { useCallback, useEffect, useState } from "react"
import { Crown, Mail, ShieldCheck, Trash2, UserPlus } from "lucide-react"

interface AdminRow {
	email: string
	role: "SUPER_ADMIN" | "ADMIN"
	grantedBy: string | null
	createdAt: string
}

// =============================================================
// Phân khu 3: Quản Lý Phân Quyền (CHỈ SUPER_ADMIN)
// Ô nhập email + nút Cấp quyền; danh sách admin kèm nút Gỡ quyền.
// Super Admin gốc không thể bị xóa.
// =============================================================
export function AdminManagement() {
	const [admins, setAdmins] = useState<AdminRow[]>([])
	const [loading, setLoading] = useState(true)
	const [email, setEmail] = useState("")
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [notice, setNotice] = useState<string | null>(null)

	const load = useCallback(async () => {
		setLoading(true)
		try {
			const res = await fetch("/api/admin/whitelist", { cache: "no-store" })
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.error || "FETCH_FAILED")
			setAdmins(data.admins ?? [])
		} catch {
			setError("Không tải được danh sách admin.")
		} finally {
			setLoading(false)
		}
	}, [])

	useEffect(() => {
		load()
	}, [load])

	async function grant(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		setNotice(null)
		const value = email.trim().toLowerCase()
		if (!value) return
		setSubmitting(true)
		try {
			const res = await fetch("/api/admin/whitelist", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: value }),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.message || data?.error || "ADD_FAILED")
			setAdmins(data.admins ?? [])
			setEmail("")
			setNotice(`Đã cấp quyền Admin cho ${value}.`)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Cấp quyền thất bại.")
		} finally {
			setSubmitting(false)
		}
	}

	async function revoke(target: string) {
		if (!confirm(`Gỡ quyền Admin của ${target}?`)) return
		setError(null)
		setNotice(null)
		try {
			const res = await fetch(`/api/admin/whitelist?email=${encodeURIComponent(target)}`, {
				method: "DELETE",
			})
			const data = await res.json()
			if (!res.ok || !data.ok) throw new Error(data?.message || data?.error || "DELETE_FAILED")
			setAdmins(data.admins ?? [])
			setNotice(`Đã gỡ quyền Admin của ${target}.`)
		} catch (err) {
			setError(err instanceof Error ? err.message : "Gỡ quyền thất bại.")
		}
	}

	return (
		<div className="space-y-4">
			{/* Form cấp quyền */}
			<form onSubmit={grant} className="flex flex-col gap-2 sm:flex-row">
				<div className="relative flex-1">
					<Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
					<input
						type="email"
						value={email}
						onChange={(ev) => setEmail(ev.target.value)}
						placeholder="Nhập email Google cần cấp quyền Admin..."
						className="h-11 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-primary"
					/>
				</div>
				<button
					type="submit"
					disabled={submitting}
					className="inline-flex h-11 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
				>
					<UserPlus className="h-4 w-4" /> {submitting ? "Đang cấp..." : "Cấp quyền Admin"}
				</button>
			</form>
			{notice && <p className="text-xs text-emerald-600">{notice}</p>}
			{error && <p className="text-xs text-rose-500">{error}</p>}

			{/* Danh sách admin */}
			{loading ? (
				<p className="py-6 text-center text-sm text-slate-400">Đang tải...</p>
			) : (
				<ul className="divide-y divide-slate-100 overflow-hidden rounded-xl border border-slate-200 bg-white">
					{admins.map((a) => {
						const isSuper = a.role === "SUPER_ADMIN"
						return (
							<li key={a.email} className="flex items-center justify-between gap-3 px-4 py-3">
								<div className="flex min-w-0 items-center gap-2.5">
									<span
										className={
											isSuper
												? "flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 text-amber-600"
												: "flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-600"
										}
									>
										{isSuper ? <Crown className="h-4 w-4" /> : <ShieldCheck className="h-4 w-4" />}
									</span>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-slate-700">{a.email}</p>
										<p className="text-xs text-slate-400">
											{isSuper ? "Super Admin (gốc)" : "Admin"}
											{a.grantedBy && !isSuper ? ` · cấp bởi ${a.grantedBy}` : ""}
										</p>
									</div>
								</div>
								{isSuper ? (
									<span className="shrink-0 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-600">
										Không thể gỡ
									</span>
								) : (
									<button
										type="button"
										onClick={() => revoke(a.email)}
										className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-600 transition hover:bg-rose-100"
									>
										<Trash2 className="h-3.5 w-3.5" /> Gỡ quyền
									</button>
								)}
							</li>
						)
					})}
				</ul>
			)}
		</div>
	)
}
