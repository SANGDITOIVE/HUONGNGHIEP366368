"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession, signIn } from "next-auth/react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"

type SchoolOpt = { id: string; name: string }

export function AskQuestionForm({ schools = [] }: { schools?: SchoolOpt[] }) {
	const router = useRouter()
	const { status } = useSession()
	const [title, setTitle] = useState("")
	const [body, setBody] = useState("")
	const [schoolId, setSchoolId] = useState("")
	const [tags, setTags] = useState("")
	const [anonymous, setAnonymous] = useState(false)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)

	const canSubmit = title.trim().length >= 8 && body.trim().length >= 10 && !busy

	async function submit() {
		if (status !== "authenticated") {
			signIn("google")
			return
		}
		setError(null)
		if (!canSubmit) {
			setError("Tiêu đề tối thiểu 8 ký tự và nội dung tối thiểu 10 ký tự.")
			return
		}
		setBusy(true)
		try {
			const res = await fetch("/api/questions", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					title: title.trim(),
					body: body.trim(),
					schoolId: schoolId || null,
					tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
					isAnonymous: anonymous,
				}),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) {
				setError(data?.error === "UNAUTHORIZED" ? "Cần đăng nhập để đăng câu hỏi." : "Không gửi được, thử lại sau.")
				return
			}
			router.push(`/hoi-dap/${data.question.id}`)
		} catch {
			setError("Lỗi kết nối, thử lại sau.")
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
			<label className="block text-sm">
				<span className="mb-1 block font-medium text-foreground">Tiêu đề câu hỏi *</span>
				<input
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder="VD: Học CNTT ở Bách Khoa có cần giỏi toán không?"
					className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
				/>
			</label>

			<label className="mt-4 block text-sm">
				<span className="mb-1 block font-medium text-foreground">Nội dung chi tiết *</span>
				<textarea
					value={body}
					onChange={(e) => setBody(e.target.value)}
					rows={6}
					placeholder="Mô tả rõ bối cảnh, điều bạn muốn biết..."
					className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
				/>
			</label>

			<div className="mt-4 grid gap-4 sm:grid-cols-2">
				<label className="block text-sm">
					<span className="mb-1 block font-medium text-foreground">Gắn trường (tùy chọn)</span>
					<select
						value={schoolId}
						onChange={(e) => setSchoolId(e.target.value)}
						className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
					>
						<option value="">Không gắn trường (hỏi chung)</option>
						{schools.map((s) => (
							<option key={s.id} value={s.id}>
								{s.name}
							</option>
						))}
					</select>
				</label>
				<label className="block text-sm">
					<span className="mb-1 block font-medium text-foreground">Tag (phân cách bằng dấu phẩy)</span>
					<input
						value={tags}
						onChange={(e) => setTags(e.target.value)}
						placeholder="VD: cntt, hoc-bong, ktx"
						className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
					/>
				</label>
			</div>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
					<input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4" />
					Đăng ẩn danh (ẩn tên với người đọc)
				</label>
				<Button type="button" onClick={submit} disabled={!canSubmit} variant="accent">
					{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
					Đăng câu hỏi
				</Button>
			</div>

			{status !== "authenticated" && (
				<p className="mt-2 text-xs text-muted-foreground">
					Cần đăng nhập để đăng câu hỏi (chống spam). Vẫn có thể chọn ẩn danh với người đọc.
				</p>
			)}
			{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
		</div>
	)
}
