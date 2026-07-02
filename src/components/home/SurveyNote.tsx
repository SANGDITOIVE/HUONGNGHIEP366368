"use client"

import Link from "next/link"
import { useState, type ChangeEvent, type FormEvent } from "react"
import { AnimatePresence, motion, type Variants } from "framer-motion"
import { useSession } from "next-auth/react"
import { ArrowLeft, Check, Gift, Loader2, Shield } from "lucide-react"
import { X } from "lucide-react"
import {
	SURVEY_QUESTIONS,
	type SurveyPayload,
} from "@/lib/survey/shared"
import { writeProfileFor } from "@/lib/survey/profileStore"

type Props = { onClose?: () => void; embedded?: boolean }

const QUESTIONS = SURVEY_QUESTIONS
const FORM_STEP = QUESTIONS.length
const DONE_STEP = QUESTIONS.length + 1

const slide: Variants = {
	enter: (dir: number) => ({ x: dir > 0 ? 48 : -48, opacity: 0 }),
	center: { x: 0, opacity: 1 },
	exit: (dir: number) => ({ x: dir > 0 ? -48 : 48, opacity: 0 }),
}

type ContactForm = {
	name: string
	place: string
	birthYear: string
	phone: string
	email: string
}

const EMPTY_FORM: ContactForm = { name: "", place: "", birthYear: "", phone: "", email: "" }

/**
 * Tờ khảo sát nhiều bước (bộ câu hỏi đại chúng).
 * - Mặc định: thẻ kính mờ độc lập (có nút đóng / bỏ qua).
 * - embedded: nhúng vào khối khác, bỏ chrome.
 * Dữ liệu được gửi lên /api/survey để Admin quản lý,
 * đồng thời lưu localStorage để Tab cá nhân hiển thị ngay.
 */
export function SurveyNote({ onClose, embedded = false }: Props) {
	const { data: session } = useSession()
	const email = session?.user?.email ?? null
	const [step, setStep] = useState(0)
	const [dir, setDir] = useState(1)
	const [answers, setAnswers] = useState<Record<string, string>>({})
	const [form, setForm] = useState<ContactForm>(EMPTY_FORM)
	const [status, setStatus] = useState<"idle" | "sending" | "saved" | "offline">("idle")

	function choose(id: string, value: string) {
		setAnswers((prev) => ({ ...prev, [id]: value }))
		setDir(1)
		setStep((s) => s + 1)
	}

	function goBack() {
		setDir(-1)
		setStep((s) => Math.max(0, s - 1))
	}

	function onField(key: keyof ContactForm) {
		return (e: ChangeEvent<HTMLInputElement>) =>
			setForm((prev) => ({ ...prev, [key]: e.target.value }))
	}

	async function submit(e: FormEvent) {
		e.preventDefault()
		const payload: SurveyPayload = {
			name: form.name.trim(),
			place: form.place.trim(),
			birthYear: form.birthYear.trim(),
			phone: form.phone.trim(),
			email: form.email.trim(),
			answers,
			submittedAt: new Date().toISOString(),
		}

		// 1) Lưu localStorage trước — Tab cá nhân dùng ngay, không phụ thuộc mạng.
		// Gắn theo email tài khoản đang đăng nhập (hoặc slot khách nếu chưa đăng nhập)
		// để mỗi tài khoản Google chỉ thấy hồ sơ của chính mình.
		writeProfileFor(email, payload)

		// 2) Chuyển sang màn cảm ơn NGAY (không chặn trải nghiệm), gửi server ngầm.
		setDir(1)
		setStep(DONE_STEP)
		setStatus("sending")
		try {
			const res = await fetch("/api/survey", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			})
			setStatus(res.ok ? "saved" : "offline")
		} catch {
			setStatus("offline")
		}
	}

	const progress = Math.min(step, FORM_STEP)
	const wrapperClass = embedded
		? "relative"
		: "relative rounded-2xl rounded-tr-[2.2rem] border border-white/20 bg-white/30 p-5 shadow-2xl backdrop-blur-md sm:p-6"

	return (
		<div className={wrapperClass}>
			{/* Thanh trên: bước + (bỏ qua/đóng khi không nhúng) */}
			<div className="mb-4 flex items-center justify-between">
				<span className="text-xs font-medium text-slate-500">
					{step < DONE_STEP ? `Bước ${progress + 1}/${FORM_STEP + 1}` : "Hoàn tất"}
				</span>
				{!embedded && onClose && (
					<div className="flex items-center gap-3">
						<button
							type="button"
							onClick={onClose}
							className="text-xs font-medium text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
						>
							Bỏ qua
						</button>
						<button
							type="button"
							onClick={onClose}
							aria-label="Đóng"
							className="flex h-7 w-7 items-center justify-center rounded-full border border-white/40 bg-white/40 text-slate-600 transition hover:bg-white/70"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				)}
			</div>

			{/* Thanh tiến độ */}
			{step < DONE_STEP && (
				<div className="mb-4 flex gap-1.5">
					{Array.from({ length: FORM_STEP + 1 }).map((_, i) => (
						<span
							key={i}
							className={i <= progress ? "h-1.5 flex-1 rounded-full bg-primary" : "h-1.5 flex-1 rounded-full bg-slate-300/60"}
						/>
					))}
				</div>
			)}

			<div className="relative min-h-[240px]">
				<AnimatePresence mode="wait" custom={dir} initial={false}>
					{step < FORM_STEP && (
						<motion.div
							key={`q-${step}`}
							custom={dir}
							variants={slide}
							initial="enter"
							animate="center"
							exit="exit"
							transition={ { duration: 0.28, ease: "easeInOut" } }
						>
							<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">{QUESTIONS[step].label}</p>
							<h3 className="mb-4 text-lg font-bold text-slate-800">{QUESTIONS[step].q}</h3>
							<div className="flex flex-col gap-2.5">
								{QUESTIONS[step].options.map((opt) => (
									<button
										key={opt}
										type="button"
										onClick={() => choose(QUESTIONS[step].id, opt)}
										className={
											answers[QUESTIONS[step].id] === opt
												? "w-full rounded-xl border border-primary bg-primary/10 px-4 py-3 text-left text-sm font-medium text-primary shadow-sm transition"
												: "w-full rounded-xl border border-white/50 bg-white/45 px-4 py-3 text-left text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:bg-white/80"
										}
									>
										{opt}
									</button>
								))}
							</div>
							{step > 0 && (
								<button
									type="button"
									onClick={goBack}
									className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-700"
								>
									<ArrowLeft className="h-3.5 w-3.5" /> Quay lại
								</button>
							)}
						</motion.div>
					)}

					{step === FORM_STEP && (
						<motion.form
							key="form"
							custom={dir}
							variants={slide}
							initial="enter"
							animate="center"
							exit="exit"
							transition={ { duration: 0.28, ease: "easeInOut" } }
							onSubmit={submit}
							className="flex flex-col gap-2.5"
						>
							<div>
								<h3 className="text-lg font-bold text-slate-800">Nhận lộ trình định hướng miễn phí 🎁</h3>
								<p className="mt-1 text-xs text-slate-500">Để lại thông tin để HoaTieu gửi gợi ý trường & ngành phù hợp với bạn.</p>
							</div>
							<input
								required
								type="text"
								placeholder="Họ và tên"
								value={form.name}
								onChange={onField("name")}
								className="w-full rounded-lg border border-white/50 bg-white/55 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
							<div className="flex gap-2.5">
								<input
									type="text"
									placeholder="Nơi ở (Tỉnh/Thành)"
									value={form.place}
									onChange={onField("place")}
									className="w-full rounded-lg border border-white/50 bg-white/55 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
								/>
								<input
									type="number"
									inputMode="numeric"
									min={1990}
									max={2020}
									placeholder="Năm sinh"
									value={form.birthYear}
									onChange={onField("birthYear")}
									className="w-32 shrink-0 rounded-lg border border-white/50 bg-white/55 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
								/>
							</div>
							<input
								required
								type="tel"
								placeholder="Số điện thoại (Zalo)"
								value={form.phone}
								onChange={onField("phone")}
								className="w-full rounded-lg border border-white/50 bg-white/55 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
							<input
								required
								type="email"
								placeholder="Email"
								value={form.email}
								onChange={onField("email")}
								className="w-full rounded-lg border border-white/50 bg-white/55 px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
							/>
							<p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
								<Shield className="mt-0.5 h-3 w-3 shrink-0" />
								Chúng tôi cam kết bảo mật và chỉ sử dụng thông tin này để cải thiện trải nghiệm học tập, tối ưu hóa nội dung và hỗ trợ tư vấn lộ trình cá nhân hóa cho bạn.
							</p>
							<div className="mt-1 flex items-center gap-2">
								<button
									type="button"
									onClick={goBack}
									className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/50 bg-white/45 text-slate-600 transition hover:bg-white/70"
									aria-label="Quay lại"
								>
									<ArrowLeft className="h-4 w-4" />
								</button>
								<button
									type="submit"
									className="flex h-10 flex-1 items-center justify-center gap-2 rounded-lg bg-primary text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
								>
									<Gift className="h-4 w-4" /> Hoàn tất & Nhận gợi ý
								</button>
							</div>
						</motion.form>
					)}

					{step === DONE_STEP && (
						<motion.div
							key="done"
							custom={dir}
							variants={slide}
							initial="enter"
							animate="center"
							exit="exit"
							transition={ { duration: 0.28, ease: "easeInOut" } }
							className="flex flex-col items-center gap-3 py-4 text-center"
						>
							<div className="flex h-14 w-14 items-center justify-center rounded-full bg-accent/15 text-accent">
								<Check className="h-7 w-7" />
							</div>
							<h3 className="text-lg font-bold text-slate-800">Cảm ơn bạn! 🎉</h3>
							<p className="max-w-xs text-sm text-slate-600">
								HoaTieu đã ghi nhận thông tin của bạn. Hãy vào <span className="font-medium text-primary">Tab cá nhân</span> để xem hồ sơ, ngành & trường đã lưu.
							</p>
							<p className="flex items-center gap-1.5 text-xs text-slate-400">
								{status === "sending" && (<><Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang đồng bộ lên hệ thống…</>)}
								{status === "saved" && (<><Check className="h-3.5 w-3.5 text-accent" /> Đã lưu vào hệ thống</>)}
								{status === "offline" && "Đã lưu trên thiết bị của bạn (sẽ đồng bộ khi có mạng)."}
							</p>
							<div className="mt-1 flex gap-2">
								<Link
									href="/ca-nhan"
									onClick={onClose}
									className="rounded-lg border border-primary/30 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/5"
								>
									Tab cá nhân
								</Link>
								<Link
									href="/kham-pha"
									onClick={onClose}
									className="rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground shadow-md transition hover:bg-primary/90"
								>
									Khám phá ngành
								</Link>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>
		</div>
	)
}
