"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useSession, signIn, signOut } from "next-auth/react"
import {
	BadgeCheck,
	ChevronDown,
	ChevronUp,
	Heart,
	LogIn,
	LogOut,
	MessageSquare,
	ShieldCheck,
	Sparkles,
	Star,
	UserRound,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { SURVEY_QUESTIONS, type SurveyPayload } from "@/lib/survey/shared"
import {
	claimGuestProfileFor,
	hasGuestProfile,
	migrateLegacyProfile,
	readProfileFor,
} from "@/lib/survey/profileStore"

// Tài khoản lưu trên máy, gắn theo email Google đã liên kết.
const ACCOUNT_STORAGE_KEY = "huong-nghiep:account:v1"

interface LocalAccount {
	email: string
	username: string
	linkedAt: string
}

type AccountMap = Record<string, LocalAccount>

function readAccounts(): AccountMap {
	try {
		const raw = localStorage.getItem(ACCOUNT_STORAGE_KEY)
		if (!raw) return {}
		const parsed = JSON.parse(raw)
		return parsed && typeof parsed === "object" ? (parsed as AccountMap) : {}
	} catch {
		return {}
	}
}

function writeAccount(account: LocalAccount) {
	const all = readAccounts()
	all[account.email] = account
	try {
		localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(all))
	} catch {
		/* bỏ qua */
	}
}

export function AccountPanel() {
	const { data: session, status } = useSession()
	const email = session?.user?.email ?? ""
	const googleName = session?.user?.name ?? ""
	const avatar = session?.user?.image ?? ""

	const [account, setAccount] = useState<LocalAccount | null>(null)
	const [profile, setProfile] = useState<SurveyPayload | null>(null)
	const [guestAvailable, setGuestAvailable] = useState(false)
	const [usernameInput, setUsernameInput] = useState("")
	const [showDetails, setShowDetails] = useState(false)
	const [ready, setReady] = useState(false)
	const [saving, setSaving] = useState(false)

	// Nạp hồ sơ khảo sát THEO EMAIL tài khoản + nghe thay đổi từ SurveyNote.
	useEffect(() => {
		migrateLegacyProfile()
		const refresh = () => {
			setProfile(readProfileFor(email))
			setGuestAvailable(hasGuestProfile())
		}
		refresh()
		setReady(true)
		window.addEventListener("hoatieu:profile-updated", refresh)
		window.addEventListener("storage", refresh)
		return () => {
			window.removeEventListener("hoatieu:profile-updated", refresh)
			window.removeEventListener("storage", refresh)
		}
	}, [email])

	function handleClaimGuest() {
		if (!email) return
		const claimed = claimGuestProfileFor(email)
		setProfile(claimed)
		setGuestAvailable(false)
	}

	// Khi đăng nhập: nạp NHANH từ cache trên máy (nếu có) để tránh nháy màn hình,
	// rồi LẤY BẢN CHÍNH THỨC TỪ SERVER — nhờ vậy mọi thiết bị đăng nhập cùng
	// tài khoản Google đều hiển thị cùng tên người dùng & nút Đăng xuất.
	useEffect(() => {
		if (!email) {
			setAccount(null)
			return
		}
		// 1) Cache cục bộ cho cảm giác tức thì.
		setAccount(readAccounts()[email] ?? null)

		// 2) Nguồn sự thật: hồ sơ lưu ở máy chủ theo tài khoản Google.
		let aborted = false
		;(async () => {
			try {
				const res = await fetch("/api/profile", { cache: "no-store" })
				if (!res.ok || aborted) return
				const data = await res.json()
				if (aborted || !data?.ok) return
				if (data.account?.username) {
					const serverAccount: LocalAccount = {
						email,
						username: data.account.username,
						linkedAt: data.account.linkedAt ?? new Date().toISOString(),
					}
					setAccount(serverAccount)
					writeAccount(serverAccount) // đồng bộ lại cache cục bộ
				} else if (data.account === null) {
					// Server xác nhận CHƯA có hồ sơ -> hiện form đặt tên.
					setAccount(null)
				}
			} catch {
				/* mất mạng -> tạm dùng cache cục bộ */
			}
		})()
		return () => {
			aborted = true
		}
	}, [email])

	const hasSurvey = !!profile

	async function handleSaveUsername() {
		const username = usernameInput.trim()
		if (username.length < 2 || !email || saving) return
		setSaving(true)
		try {
			// Lưu LÊN SERVER (theo tài khoản Google) để đồng bộ mọi thiết bị.
			const res = await fetch("/api/profile", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ username }),
			})
			const data = await res.json().catch(() => null)
			const next: LocalAccount = {
				email,
				username: data?.account?.username ?? username,
				linkedAt: data?.account?.linkedAt ?? new Date().toISOString(),
			}
			writeAccount(next)
			setAccount(next)
			setUsernameInput("")
		} catch {
			// Lỗi mạng: vẫn lưu cache cục bộ để không chặn người dùng.
			const next: LocalAccount = { email, username, linkedAt: new Date().toISOString() }
			writeAccount(next)
			setAccount(next)
			setUsernameInput("")
		} finally {
			setSaving(false)
		}
	}

	// 1) Đang kiểm tra phiên.
	if (status === "loading" || !ready) {
		return (
			<section className="rounded-2xl border border-slate-200 bg-white/70 p-6 text-center text-sm text-slate-400">
				Đang kiểm tra tài khoản…
			</section>
		)
	}

	// 2) Chưa đăng nhập → mời liên kết Google.
	if (status !== "authenticated") {
		return (
			<section className="rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5 p-6 shadow-sm">
				<h2 className="font-heading flex items-center gap-2 text-2xl font-bold text-slate-800">
					<ShieldCheck className="h-6 w-6 text-primary" /> Tài khoản HoaTieu
				</h2>
				<p className="mt-2 max-w-xl text-sm text-slate-600">
					Liên kết với Google để lưu hồ sơ hướng nghiệp và xem lại trên mọi thiết bị. HoaTieu chỉ đọc tên và email cơ bản, không đăng gì thay bạn.
				</p>
				<div className="mt-4 rounded-xl border border-primary/15 bg-white/60 p-4">
					<p className="text-sm font-semibold text-slate-800">Lợi ích khi đăng ký tài khoản</p>
					<ul className="mt-2 space-y-1.5 text-sm text-slate-600">
						<li className="flex items-start gap-2"><Heart className="mt-0.5 h-4 w-4 shrink-0 text-rose-500" /> Lưu sở thích: ngành &amp; trường yêu thích để so sánh về sau</li>
						<li className="flex items-start gap-2"><UserRound className="mt-0.5 h-4 w-4 shrink-0 text-primary" /> Lưu thông tin hồ sơ &amp; kết quả “Khám phá bản thân” theo tài khoản</li>
						<li className="flex items-start gap-2"><MessageSquare className="mt-0.5 h-4 w-4 shrink-0 text-sky-500" /> Bình luận &amp; trao đổi trong cộng đồng</li>
						<li className="flex items-start gap-2"><Star className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" /> Đánh giá, chấm sao các trường bạn quan tâm</li>
					</ul>
				</div>
				<Button onClick={() => signIn("google")} className="mt-4 gap-2">
					<LogIn className="h-4 w-4" /> Liên kết với Google
				</Button>
			</section>
		)
	}

	// 3) Đã đăng nhập nhưng chưa đặt tên → hoàn tất tạo tài khoản.
	if (!account) {
		return (
			<section className="rounded-2xl border border-primary/20 bg-white/85 p-6 shadow-sm">
				<h2 className="font-heading flex items-center gap-2 text-2xl font-bold text-slate-800">
					<UserRound className="h-6 w-6 text-primary" /> Hoàn tất tạo tài khoản
				</h2>
				<div className="mt-4 flex items-center gap-3">
					<Avatar src={avatar} />
					<div className="min-w-0 text-sm">
						<p className="font-medium text-slate-800">{googleName || "Tài khoản Google"}</p>
						<p className="truncate text-slate-500">{email}</p>
					</div>
				</div>
				<div className="mt-5">
					<label htmlFor="hoatieu-username" className="text-sm font-medium text-slate-700">
						Đặt tên người dùng
					</label>
					<div className="mt-1.5 flex flex-wrap gap-2">
						<input
							id="hoatieu-username"
							value={usernameInput}
							onChange={(e) => setUsernameInput(e.target.value)}
							placeholder="Ví dụ: dai2008"
							className="h-10 w-full max-w-xs rounded-lg border border-slate-300 bg-white px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
						/>
						<Button onClick={handleSaveUsername} disabled={usernameInput.trim().length < 2 || saving} className="gap-2">
							<BadgeCheck className="h-4 w-4" /> {saving ? "Đang lưu…" : "Tạo tài khoản"}
						</Button>
					</div>
				</div>
				{hasSurvey ? (
					<p className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
						Đã tìm thấy hồ sơ khảo sát của bạn — đặt tên xong là tài khoản sẵn sàng.
					</p>
				) : (
					<p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
						Bạn chưa làm khảo sát. Sau khi đặt tên, hãy{" "}
						<Link href="/" className="font-medium underline">làm phiếu khảo sát ở trang chủ</Link>{" "}
						để HoaTieu hiểu bạn hơn.
					</p>
				)}
			</section>
		)
	}

	// 4) Đã có tài khoản đầy đủ.
	return (
		<section className="rounded-2xl border border-emerald-200 bg-white/90 p-6 shadow-sm">
			<div className="flex flex-wrap items-start justify-between gap-4">
				<div className="flex items-center gap-3">
					<Avatar src={avatar} />
					<div className="min-w-0">
						<span className="font-heading text-xl font-bold text-slate-800">{account.username}</span>
						<p className="text-sm text-slate-500">{googleName} · {email}</p>
						<button
							type="button"
							onClick={() => signOut()}
							title="Đăng xuất khỏi tài khoản HoaTieu"
							className="group mt-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-600"
						>
							<BadgeCheck className="h-3.5 w-3.5 group-hover:hidden" />
							<LogOut className="hidden h-3.5 w-3.5 group-hover:inline" />
							<span className="group-hover:hidden">Đã đăng ký · Đăng xuất</span>
							<span className="hidden group-hover:inline">Đăng xuất ngay</span>
						</button>
					</div>
				</div>
			</div>

			<div className="mt-5 border-t border-slate-100 pt-5">
				{hasSurvey ? (
					<>
						<Button
							variant="outline"
							onClick={() => setShowDetails((v) => !v)}
							className="gap-2"
						>
							<Sparkles className="h-4 w-4 text-primary" /> Xem thêm về bản thân
							{showDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
						</Button>
						{showDetails ? (
							<div className="mt-4 grid gap-4 sm:grid-cols-2">
								<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
									<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Định hướng đã chọn</p>
									<ul className="space-y-1.5 text-sm">
										{SURVEY_QUESTIONS.map((q) => (
											<li key={q.id} className="flex justify-between gap-3">
												<span className="text-slate-500">{q.label}</span>
												<span className="text-right font-medium text-slate-700">{profile?.answers?.[q.id] ?? "—"}</span>
											</li>
										))}
									</ul>
									<div className="mt-3 border-t border-slate-200 pt-3 text-sm text-slate-600">
										<p>Họ tên: <b className="text-slate-800">{profile?.name ?? "—"}</b></p>
										<p>Nơi ở: <b className="text-slate-800">{profile?.place ?? "—"}</b></p>
										<p>Năm sinh: <b className="text-slate-800">{profile?.birthYear ?? "—"}</b></p>
									</div>
								</div>
								<div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
									<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">Thông tin Google đã liên kết</p>
									<ul className="space-y-1.5 text-sm text-slate-700">
										<li>Tên Google: <b className="text-slate-800">{googleName || "—"}</b></li>
										<li>Email: <b className="text-slate-800">{email || "—"}</b></li>
										<li>Tên người dùng: <b className="text-slate-800">{account.username}</b></li>
									</ul>
								</div>
							</div>
						) : null}
					</>
				) : (
					<p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
						Bạn chưa có hồ sơ khảo sát.{" "}
						<Link href="/" className="font-medium underline">Làm phiếu khảo sát ở trang chủ</Link>{" "}
						để mở khóa mục “Xem thêm về bản thân”.
					</p>
				)}
			</div>
		</section>
	)
}

function Avatar({ src }: { src: string }) {
	if (src) {
		// eslint-disable-next-line @next/next/no-img-element
		return <img src={src} alt="" className="h-12 w-12 rounded-full border border-slate-200 object-cover" />
	}
	return (
		<span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
			<UserRound className="h-6 w-6" />
		</span>
	)
}
