"use client"

import { useState } from "react"
import { useSession, signIn } from "next-auth/react"
import { Loader2, Send } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StarPicker } from "@/components/community/StarRating"
import type { ProfReview } from "@/components/community/professor/ProfessorReviewCard"

// Form viết đánh giá giảng viên. Cho phép ẩn danh (không bắt đăng nhập),
// nhưng nếu đăng nhập Google & không ẩn danh thì review được gắn "đã xác minh".
export function ProfessorReviewForm({
	schoolId,
	lockProfessorName,
	defaultProfessorName = "",
	onCreated,
}: {
	schoolId: string
	lockProfessorName?: boolean
	defaultProfessorName?: string
	onCreated?: (review: ProfReview) => void
}) {
	const { data: session, status } = useSession()

	const [professorName, setProfessorName] = useState(defaultProfessorName)
	const [subject, setSubject] = useState("")
	const [easy, setEasy] = useState(0)
	const [fair, setFair] = useState(0)
	const [clear, setClear] = useState(0)
	const [attendance, setAttendance] = useState(false)
	const [bonus, setBonus] = useState(false)
	const [tip, setTip] = useState("")
	const [anonymous, setAnonymous] = useState(false)
	const [busy, setBusy] = useState(false)
	const [error, setError] = useState<string | null>(null)
	const [done, setDone] = useState(false)

	const canSubmit =
		professorName.trim().length > 1 && easy >= 1 && fair >= 1 && clear >= 1 && !busy

	async function submit() {
		setError(null)
		if (!canSubmit) {
			setError("Nhập tên giảng viên và chấm đủ 3 tiêu chí sao (1–5).")
			return
		}
		setBusy(true)
		try {
			const res = await fetch("/api/reviews/professor", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					schoolId,
					professorName: professorName.trim(),
					subject: subject.trim(),
					ratingEasyToPass: easy,
					ratingFairGrading: fair,
					ratingClearTeaching: clear,
					attendanceCheck: attendance,
					bonusPoints: bonus,
					tipText: tip.trim(),
					isAnonymous: anonymous,
				}),
			})
			const data = await res.json()
			if (!res.ok || !data.ok) {
				setError(data?.message ?? "Không gửi được đánh giá, thử lại sau.")
				return
			}
			setDone(true)
			if (!lockProfessorName) setProfessorName("")
			setSubject("")
			setEasy(0)
			setFair(0)
			setClear(0)
			setAttendance(false)
			setBonus(false)
			setTip("")
			if (onCreated && data.review) onCreated(data.review as ProfReview)
			setTimeout(() => setDone(false), 2500)
		} catch {
			setError("Lỗi kết nối, thử lại sau.")
		} finally {
			setBusy(false)
		}
	}

	return (
		<div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
			<h3 className="mb-4 text-lg font-semibold text-foreground">Viết đánh giá giảng viên</h3>

			<div className="grid gap-4 sm:grid-cols-2">
				<label className="block text-sm">
					<span className="mb-1 block font-medium text-foreground">Tên giảng viên *</span>
					<input
						type="text"
						value={professorName}
						disabled={!!lockProfessorName}
						onChange={(e) => setProfessorName(e.target.value)}
						placeholder="VD: TS. Nguyễn Văn A"
						className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary disabled:opacity-60"
					/>
				</label>
				<label className="block text-sm">
					<span className="mb-1 block font-medium text-foreground">Môn dạy</span>
					<input
						type="text"
						value={subject}
						onChange={(e) => setSubject(e.target.value)}
						placeholder="VD: Giải tích 1"
						className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
					/>
				</label>
			</div>

			<div className="mt-4 space-y-3 rounded-xl bg-muted/50 p-4">
				<div className="flex flex-wrap items-center justify-between gap-2">
					<span className="text-sm font-medium text-foreground">Dễ qua môn *</span>
					<StarPicker value={easy} onChange={setEasy} />
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<span className="text-sm font-medium text-foreground">Chấm công bằng *</span>
					<StarPicker value={fair} onChange={setFair} />
				</div>
				<div className="flex flex-wrap items-center justify-between gap-2">
					<span className="text-sm font-medium text-foreground">Dạy dễ hiểu *</span>
					<StarPicker value={clear} onChange={setClear} />
				</div>
			</div>

			<div className="mt-4 flex flex-wrap gap-4">
				<label className="inline-flex items-center gap-2 text-sm text-foreground">
					<input type="checkbox" checked={attendance} onChange={(e) => setAttendance(e.target.checked)} className="h-4 w-4" />
					Có điểm danh
				</label>
				<label className="inline-flex items-center gap-2 text-sm text-foreground">
					<input type="checkbox" checked={bonus} onChange={(e) => setBonus(e.target.checked)} className="h-4 w-4" />
					Bắt mua giáo trình
				</label>
			</div>

			<label className="mt-4 block text-sm">
				<span className="mb-1 block font-medium text-foreground">Mẹo / kinh nghiệm cho sinh viên sau (tùy chọn)</span>
				<textarea
					value={tip}
					onChange={(e) => setTip(e.target.value)}
					rows={3}
					placeholder="VD: Thầy hay gọi phát biểu, nên đi học đầy đủ và làm bài tập về nhà..."
					className="w-full rounded-lg border border-input bg-background px-3 py-2 outline-none focus:border-primary"
				/>
			</label>

			<div className="mt-4 flex flex-wrap items-center justify-between gap-3">
				<label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
					<input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4" />
					Đăng ẩn danh (không hiện tên, không gắn "đã xác minh")
				</label>
				<Button type="button" onClick={submit} disabled={!canSubmit} variant="accent">
					{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
					Gửi đánh giá
				</Button>
			</div>

			{status !== "authenticated" && !anonymous && (
				<p className="mt-2 text-xs text-muted-foreground">
					Bạn đang chưa đăng nhập. Có thể gửi ẩn danh, hoặc{" "}
					<button type="button" onClick={() => signIn("google")} className="font-semibold text-primary underline">
						đăng nhập Google
					</button>{" "}
					để review được gắn nhãn “đã xác minh”.
				</p>
			)}
			{error && <p className="mt-2 text-sm text-destructive">{error}</p>}
			{done && <p className="mt-2 text-sm font-medium text-accent">Đã gửi đánh giá, cảm ơn bạn!</p>}
		</div>
	)
}
