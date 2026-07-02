"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Pencil, X } from "lucide-react"

// =============================================================
// ContributeButton — Nút icon cây bút "Đóng góp thông tin" đặt cạnh mỗi mục
// dữ liệu của trường. Bấm vào mở modal nhập đề xuất → gửi về /api/contributions
// với trạng thái chờ duyệt (PENDING).
// =============================================================
export function ContributeButton({
	universityId,
	universityName,
	fieldName,
	fieldLabel,
	currentValue = "",
	variant = "icon",
	triggerLabel = "Đề xuất chỉnh sửa thông tin",
}: {
	universityId: string
	universityName: string
	fieldName: string
	fieldLabel: string
	currentValue?: string
	variant?: "icon" | "button"
	triggerLabel?: string
}) {
	const { status } = useSession()
	const [open, setOpen] = useState(false)
	const [value, setValue] = useState(currentValue)
	const [submitting, setSubmitting] = useState(false)
	const [done, setDone] = useState(false)
	const [error, setError] = useState<string | null>(null)

	function openModal() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		setValue(currentValue)
		setDone(false)
		setError(null)
		setOpen(true)
	}

	async function submit(e: React.FormEvent) {
		e.preventDefault()
		setError(null)
		if (!value.trim()) {
			setError("Vui lòng nhập nội dung đề xuất.")
			return
		}
		setSubmitting(true)
		try {
			const res = await fetch("/api/contributions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					universityId,
					fieldName,
					oldValue: currentValue || null,
					newValue: value.trim(),
				}),
			})
			const data = await res.json()
			if (res.status === 401) {
				setError("Bạn cần đăng nhập để đóng góp.")
				return
			}
			if (!res.ok || !data.ok) throw new Error(data?.error || "CONTRIB_FAILED")
			setDone(true)
		} catch {
			setError("Gửi đóng góp thất bại. Vui lòng thử lại.")
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<>
			{variant === "button" ? (
				<button
					type="button"
					onClick={openModal}
					className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 px-3 py-2 text-sm font-medium text-amber-700 transition hover:bg-amber-100"
				>
					<Pencil className="h-4 w-4" /> {triggerLabel}
				</button>
			) : (
				<button
					type="button"
					onClick={openModal}
					title={`Đóng góp thông tin: ${fieldLabel}`}
					aria-label={`Đóng góp thông tin: ${fieldLabel}`}
					className="inline-flex h-6 w-6 items-center justify-center rounded-full text-slate-400 transition hover:bg-primary/10 hover:text-primary"
				>
					<Pencil className="h-3.5 w-3.5" />
				</button>
			)}

			{open && (
				<div
					className="fixed inset-0 z-[60] flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
					role="dialog"
					aria-modal="true"
					aria-label="Đóng góp thông tin"
					onClick={() => setOpen(false)}
				>
					<div
						onClick={(e) => e.stopPropagation()}
						className="w-full max-w-md rounded-t-2xl border border-slate-200 bg-white p-5 shadow-xl sm:rounded-2xl"
					>
						<div className="flex items-start justify-between gap-3">
							<div>
								<h3 className="flex items-center gap-1.5 font-heading text-base font-bold text-slate-800">
									<Pencil className="h-4 w-4 text-primary" /> Đóng góp thông tin
								</h3>
								<p className="mt-0.5 text-xs text-slate-500">
									{universityName} · Mục: <span className="font-medium text-slate-700">{fieldLabel}</span>
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
								🎉 Cảm ơn bạn! Đóng góp đã được gửi và đang chờ quản trị viên duyệt.
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
								{currentValue && (
									<div className="rounded-lg bg-slate-50 p-2.5 text-xs text-slate-500">
										<span className="font-medium text-slate-600">Nội dung hiện tại:</span> {currentValue}
									</div>
								)}
								<div>
									<label className="mb-1 block text-xs font-medium text-slate-600">
										Nội dung bạn đề xuất
									</label>
									<textarea
										value={value}
										onChange={(e) => setValue(e.target.value)}
										rows={4}
										placeholder="Ví dụ: Thêm ngành 'Luật Kinh tế' vào danh sách ngành tiêu biểu..."
										className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 outline-none focus:border-primary"
									/>
								</div>
								{error && <p className="text-xs text-rose-500">{error}</p>}
								<div className="flex justify-end gap-2">
									<button
										type="button"
										onClick={() => setOpen(false)}
										className="rounded-lg border border-slate-300 px-4 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
									>
										Hủy
									</button>
									<button
										type="submit"
										disabled={submitting}
										className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
									>
										{submitting ? "Đang gửi..." : "Gửi đóng góp"}
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
