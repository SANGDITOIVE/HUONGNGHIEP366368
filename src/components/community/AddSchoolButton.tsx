"use client"

import { useEffect, useRef, useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { AlertTriangle, MapPin, PlusCircle, X } from "lucide-react"

// =============================================================
// AddSchoolButton — Nút "Đề xuất thêm cơ sở đào tạo mới" (Crowdsourced Map).
// Mở modal nhập Tên / Mã / Địa chỉ / Website / Hệ đào tạo / Khu vực / Ngành tiêu biểu.
// - Kiểm tra trùng lặp tên ngay khi gõ (debounce) → cảnh báo "có thể đã tồn tại".
// - Gửi về POST /api/universities (status PENDING) → chờ admin duyệt.
// =============================================================

const HE_OPTIONS = [
	{ value: "dai-hoc", label: "Đại học" },
	{ value: "cao-dang", label: "Cao đẳng" },
]
const REGION_OPTIONS = [
	{ value: "bac", label: "Miền Bắc" },
	{ value: "trung", label: "Miền Trung" },
	{ value: "nam", label: "Miền Nam" },
]

interface DupMatch {
	name: string
	source: string
	score: number
}

export function AddSchoolButton({ onSubmitted }: { onSubmitted?: () => void }) {
	const { status } = useSession()
	const [open, setOpen] = useState(false)
	const [submitting, setSubmitting] = useState(false)
	const [done, setDone] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const [name, setName] = useState("")
	const [code, setCode] = useState("")
	const [address, setAddress] = useState("")
	const [website, setWebsite] = useState("")
	const [heDaoTao, setHeDaoTao] = useState("dai-hoc")
	const [region, setRegion] = useState("bac")
	const [nganh, setNganh] = useState("")

	const [dupMatches, setDupMatches] = useState<DupMatch[]>([])
	const dupTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

	function openModal() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		setName("")
		setCode("")
		setAddress("")
		setWebsite("")
		setHeDaoTao("dai-hoc")
		setRegion("bac")
		setNganh("")
		setDupMatches([])
		setError(null)
		setDone(false)
		setOpen(true)
	}

	// Kiểm tra trùng lặp tên (debounce 450ms).
	useEffect(() => {
		if (!open) return
		if (dupTimer.current) clearTimeout(dupTimer.current)
		const q = name.trim()
		if (q.length < 3) {
			setDupMatches([])
			return
		}
		dupTimer.current = setTimeout(async () => {
			try {
				const res = await fetch(`/api/universities/check?name=${encodeURIComponent(q)}`, {
					cache: "no-store",
				})
				const data = await res.json()
				if (data?.ok) setDupMatches(data.matches ?? [])
			} catch {
				/* bỏ qua lỗi kiểm tra trùng */
			}
		}, 450)
		return () => {
			if (dupTimer.current) clearTimeout(dupTimer.current)
		}
	}, [name, open])

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		if (!name.trim() || !code.trim() || !address.trim() || !website.trim()) {
			setError("Vui lòng nhập đủ: Tên trường, Mã trường, Địa chỉ, Website.")
			return
		}
		setSubmitting(true)
		try {
			const res = await fetch("/api/universities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: name.trim(),
					code: code.trim(),
					address: address.trim(),
					website: website.trim(),
					heDaoTao,
					region,
					nganhTieuBieu: nganh.trim(),
				}),
			})
			const data = await res.json()
			if (res.status === 401) {
				setError("Bạn cần đăng nhập để đề xuất trường.")
				return
			}
			if (!res.ok || !data.ok) {
				setError(data?.message || "Gửi đề xuất thất bại. Vui lòng thử lại.")
				return
			}
			setDone(true)
			onSubmitted?.()
		} catch {
			setError("Gửi đề xuất thất bại. Vui lòng thử lại.")
		} finally {
			setSubmitting(false)
		}
	}

	const inputCls =
		"w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/20"

	return (
		<>
			<button
				type="button"
				onClick={openModal}
				className="inline-flex items-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
			>
				<PlusCircle className="h-4 w-4" /> Đề xuất thêm cơ sở đào tạo mới
			</button>

			{open && (
				<div
					className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
					role="dialog"
					aria-modal="true"
					aria-label="Đề xuất thêm cơ sở đào tạo mới"
					onClick={() => setOpen(false)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-2xl"
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<h3 className="flex items-center gap-1.5 font-heading text-base font-bold text-slate-800">
									<PlusCircle className="h-4 w-4 text-primary" /> Đề xuất thêm cơ sở đào tạo
								</h3>
								<p className="mt-0.5 text-xs text-slate-500">
									Trường bạn thêm sẽ được quản trị viên duyệt trước khi hiển thị công khai.
								</p>
							</div>
							<button
								type="button"
								onClick={() => setOpen(false)}
								aria-label="Đóng"
								className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
							>
								<X className="h-4 w-4" />
							</button>
						</div>

						{done ? (
							<div className="mt-4 rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700">
								🎉 Cảm ơn bạn! Cơ sở đào tạo đã được gửi và đang chờ quản trị viên duyệt.
								<div className="mt-3">
									<button
										type="button"
										onClick={() => setOpen(false)}
										className="rounded-lg bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
									>
										Đóng
									</button>
								</div>
							</div>
						) : (
							<form onSubmit={submit} className="mt-4 space-y-3">
								<div>
									<label className="mb-1 block text-xs font-medium text-slate-600">Tên trường <span className="text-rose-500">*</span></label>
									<input value={name} onChange={(e) => setName(e.target.value)} placeholder="VD: Đại học Công nghệ Đông Á" className={inputCls} />
								</div>

								{dupMatches.length > 0 && (
									<div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-700">
										<p className="flex items-center gap-1 font-semibold">
											<AlertTriangle className="h-3.5 w-3.5" /> Có thể trường này đã tồn tại:
										</p>
										<ul className="mt-1 space-y-0.5">
											{dupMatches.map((m, i) => (
												<li key={i}>• {m.name} <span className="text-amber-500">({m.source})</span></li>
											))}
										</ul>
										<p className="mt-1 italic text-amber-600">Nếu đúng là trường khác, bạn vẫn có thể gửi — quản trị viên sẽ kiểm tra lại.</p>
									</div>
								)}

								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="mb-1 block text-xs font-medium text-slate-600">Mã trường <span className="text-rose-500">*</span></label>
										<input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="VD: LHA" className={inputCls} />
									</div>
									<div>
										<label className="mb-1 block text-xs font-medium text-slate-600">Hệ đào tạo <span className="text-rose-500">*</span></label>
										<select value={heDaoTao} onChange={(e) => setHeDaoTao(e.target.value)} className={inputCls}>
											{HE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
										</select>
									</div>
								</div>

								<div>
									<label className="mb-1 block text-xs font-medium text-slate-600">Địa chỉ <span className="text-rose-500">*</span></label>
									<input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="VD: 123 Đ. Lê Lợi, Quận 1, TP.HCM" className={inputCls} />
								</div>

								<div className="grid grid-cols-2 gap-3">
									<div>
										<label className="mb-1 block text-xs font-medium text-slate-600">Website <span className="text-rose-500">*</span></label>
										<input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="VD: dongA.edu.vn" className={inputCls} />
									</div>
									<div>
										<label className="mb-1 flex items-center gap-1 text-xs font-medium text-slate-600"><MapPin className="h-3 w-3" /> Khu vực</label>
										<select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls}>
											{REGION_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
										</select>
									</div>
								</div>

								<div>
									<label className="mb-1 block text-xs font-medium text-slate-600">Ngành tiêu biểu <span className="text-slate-400">(tùy chọn)</span></label>
									<textarea value={nganh} onChange={(e) => setNganh(e.target.value)} rows={2} placeholder="VD: Công nghệ thông tin, Quản trị kinh doanh, Ngôn ngữ Anh" className={`${inputCls} resize-none`} />
								</div>

								{error && <p className="text-xs text-rose-500">{error}</p>}

								<div className="flex justify-end gap-2 pt-1">
									<button type="button" onClick={() => setOpen(false)} className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50">Hủy</button>
									<button type="submit" disabled={submitting} className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50">
										{submitting ? "Đang gửi..." : "Gửi đề xuất"}
									</button>
								</div>
							</form>
						)}
					</div>
				</div>
			)}
		</>
	)
}
