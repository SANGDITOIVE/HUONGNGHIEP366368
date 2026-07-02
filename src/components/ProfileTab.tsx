"use client"

import Link from "next/link"
import { useCallback, useEffect, useState, type CSSProperties } from "react"
import {
	Building2,
	CalendarDays,
	Compass,
	GraduationCap,
	Heart,
	Lightbulb,
	MapPin,
	Phone,
	Scale,
	Sparkles,
	Trash2,
	UserRound,
	X,
} from "lucide-react"
import { useSession } from "next-auth/react"
import { cn } from "@/lib/utils"
import { useFavorites } from "@/lib/store/favoritesStore"
import { StarDisplay } from "@/components/community/StarRating"
import { MAJOR_BY_ID } from "@/data/majors"
import { FIELD_BY_ID } from "@/data/majorFields"
import { SKILLS } from "@/data/taxonomies"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
	INSTITUTIONS,
	INSTITUTIONS_FAV_KEY,
	REGION_LABEL,
	SCHOOLS_FAV_NS,
	Stars,
	topScore,
	TYPE_LABEL,
} from "@/components/InstitutionsTab"
import {
	SURVEY_QUESTIONS,
	type SurveyPayload,
} from "@/lib/survey/shared"
import { migrateLegacyProfile, readProfileFor } from "@/lib/survey/profileStore"
import {
	migrateLegacyScoped,
	readScoped,
	SCOPED_EVENT,
	writeScoped,
} from "@/lib/store/scopedStore"
import { DJ_SNAPSHOT_NS, type DjSnapshot } from "@/lib/dj/snapshot"

const COST_LABEL: Record<string, string> = { low: "Thấp", medium: "Trung bình", high: "Cao" }

function skillLabel(id: string) {
	return SKILLS.find((s) => s.id === id)?.label ?? id
}

const PAPER_STYLE: CSSProperties = {
	backgroundColor: "#fcfaf3",
	backgroundImage:
		"repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(59,130,246,0.10) 28px), repeating-linear-gradient(to right, transparent 0px, transparent 27px, rgba(59,130,246,0.05) 28px)",
}

// =============================================================
export function ProfileTab() {
	const { ids: majorIds, remove: removeMajor, clear: clearMajors, hydrated } = useFavorites()
	const { data: session } = useSession()
	const email = session?.user?.email ?? null

	const [profile, setProfile] = useState<SurveyPayload | null>(null)
	const [schoolIds, setSchoolIds] = useState<string[]>([])
	const [ready, setReady] = useState(false)

	// Đồng bộ hồ sơ + trường yêu thích THEO ĐÚNG tài khoản đang đăng nhập.
	const syncFromStorage = useCallback(() => {
		migrateLegacyProfile()
		migrateLegacyScoped(SCHOOLS_FAV_NS, INSTITUTIONS_FAV_KEY)
		setProfile(readProfileFor(email))
		const stored = readScoped<string[]>(SCHOOLS_FAV_NS, email, [])
		setSchoolIds(Array.isArray(stored) ? stored.filter((x): x is string => typeof x === "string") : [])
	}, [email])

	useEffect(() => {
		syncFromStorage()
		setReady(true)
		// Lắng nghe cập nhật từ tab khác (storage), từ SurveyNote và store theo account.
		const onCustom = () => syncFromStorage()
		window.addEventListener("storage", onCustom)
		window.addEventListener("hoatieu:profile-updated", onCustom)
		window.addEventListener(SCOPED_EVENT, onCustom)
		return () => {
			window.removeEventListener("storage", onCustom)
			window.removeEventListener("hoatieu:profile-updated", onCustom)
			window.removeEventListener(SCOPED_EVENT, onCustom)
		}
	}, [syncFromStorage])

	const removeSchool = useCallback((id: string) => {
		setSchoolIds((prev) => {
			const next = prev.filter((x) => x !== id)
			writeScoped(SCHOOLS_FAV_NS, email, next)
			return next
		})
	}, [email])

	const majors = majorIds.map((id) => MAJOR_BY_ID[id]).filter(Boolean)
	const schools = schoolIds.map((id) => INSTITUTIONS.find((s) => s.id === id)).filter(Boolean) as typeof INSTITUTIONS

	if (!ready || !hydrated) {
		return <div className="py-16 text-center text-sm text-slate-400">Đang tải hồ sơ của bạn…</div>
	}

	return (
		<div className="space-y-8">
			{/* Kết quả Khám phá bản thân — neo theo tài khoản, chỉ chủ tài khoản thấy */}
			<DiscoverySection />
			{/* 0) Đánh giá của tôi (lịch sử review gắn theo tài khoản Google) */}
			<MyReviewsSection />
{/* 2) So sánh ngành đã lưu (đưa lên trên) */}
			<section>
				<div className="mb-3 flex items-center justify-between">
					<h3 className="font-heading flex items-center gap-2 text-lg font-bold text-slate-800">
						<Scale className="h-5 w-5 text-primary" /> So sánh ngành đã lưu
						<span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-500">{majors.length}</span>
					</h3>
					{majors.length > 0 && (
						<Button variant="outline" onClick={clearMajors}>
							<Trash2 className="h-4 w-4" /> Bỏ tất cả
						</Button>
					)}
				</div>
				{majors.length === 0 ? (
					<EmptyState>
						Bạn chưa lưu ngành nào. Vào{" "}
						<Link href="/nganh-hoc" className="font-medium text-primary underline">Danh sách ngành</Link>{" "}
						và bấm biểu tượng lưu để thêm vào so sánh.
					</EmptyState>
				) : (
					<div className="overflow-x-auto rounded-xl border border-slate-200 bg-white/80">
						<table className="w-full min-w-[640px] border-collapse text-sm">
							<thead>
								<tr>
									<th className="sticky left-0 z-10 w-40 bg-white/90 p-3 text-left align-bottom text-xs font-medium uppercase tracking-wide text-slate-400">Tiêu chí</th>
									{majors.map((m) => (
										<th key={m.id} className="min-w-[200px] border-l border-slate-100 p-3 text-left align-bottom">
											<div className="flex items-start justify-between gap-2">
												<Link href={`/nganh-hoc/${m.id}`} className="font-heading font-semibold text-slate-800 hover:text-primary hover:underline">{m.name}</Link>
												<button
													type="button"
													onClick={() => removeMajor(m.id)}
													aria-label={`Bỏ ${m.name}`}
													className="shrink-0 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
												>
													<X className="h-4 w-4" />
												</button>
											</div>
										</th>
									))}
								</tr>
							</thead>
							<tbody className="align-top">
								<Row label="Lĩnh vực">
									{majors.map((m) => <Cell key={m.id}>{FIELD_BY_ID[m.fieldId]?.name ?? "—"}</Cell>)}
								</Row>
								<Row label="Thời gian đào tạo">
									{majors.map((m) => <Cell key={m.id}>{m.feasibility.durationYears} năm</Cell>)}
								</Row>
								<Row label="Chi phí tương đối">
									{majors.map((m) => <Cell key={m.id}>{COST_LABEL[m.feasibility.relativeCost] ?? m.feasibility.relativeCost}</Cell>)}
								</Row>
								<Row label="Bản chất">
									{majors.map((m) => <Cell key={m.id}><span className="text-slate-500">{m.nature}</span></Cell>)}
								</Row>
								<Row label="Phù hợp với">
									{majors.map((m) => <Cell key={m.id}><span className="text-slate-500">{m.suitableFor}</span></Cell>)}
								</Row>
								<Row label="Kỹ năng chính">
									{majors.map((m) => (
										<Cell key={m.id}>
											<div className="flex flex-wrap gap-1">
												{m.requiredSkills.map((s) => <Badge key={s} variant="outline">{skillLabel(s)}</Badge>)}
											</div>
										</Cell>
									))}
								</Row>
								<Row label="Nghề tiêu biểu">
									{majors.map((m) => (
										<Cell key={m.id}>
											<ul className="space-y-1 text-slate-500">
												{m.careers.slice(0, 5).map((c) => <li key={c}>• {c}</li>)}
											</ul>
										</Cell>
									))}
								</Row>
								<Row label="Nơi làm việc phổ biến">
									{majors.map((m) => (
										<Cell key={m.id}>
											<ul className="space-y-1 text-slate-500">
												{(m.workplaces ?? []).slice(0, 4).map((w) => <li key={w}>• {w}</li>)}
											</ul>
										</Cell>
									))}
								</Row>
							</tbody>
						</table>
					</div>
				)}
			</section>

			{/* 3) Trường đã yêu thích */}
			<section>
				<div className="mb-3 flex items-center justify-between">
					<h3 className="font-heading flex items-center gap-2 text-lg font-bold text-slate-800">
						<Building2 className="h-5 w-5 text-primary" /> Trường đã yêu thích
						<span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-500">{schools.length}</span>
					</h3>
					<Link href="/noi-dao-tao" className="text-sm font-medium text-primary hover:underline">+ Thêm trường</Link>
				</div>
				{schools.length === 0 ? (
					<EmptyState>
						Chưa có trường nào. Vào{" "}
						<Link href="/noi-dao-tao" className="font-medium text-primary underline">Tra cứu Nơi đào tạo</Link>{" "}
						và bấm trái tim để lưu.
					</EmptyState>
				) : (
					<div className="grid gap-3 sm:grid-cols-2">
						{schools.map((s) => (
							<div key={s.id} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-white/85 p-4 shadow-sm">
								<div className="min-w-0">
									<h4 className="font-heading truncate font-bold text-slate-800">{s.name}</h4>
									<div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
										<span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono">{s.code}</span>
										<span>{TYPE_LABEL[s.type]}</span>
										<span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {REGION_LABEL[s.region]}</span>
									</div>
									<div className="mt-1.5 flex items-center gap-3 text-xs text-slate-500">
										<span>Chỉ số chương trình: <b className="text-primary">{Math.round(topScore(s))}</b></span>
										<Stars value={(s.review.facilities + s.review.faculty) / 2} />
									</div>
									<div className="mt-1 text-xs text-slate-500">Học phí: <span className="font-medium text-slate-700">{s.tuition}</span></div>
								</div>
								<button
									type="button"
									onClick={() => removeSchool(s.id)}
									aria-label={`Bỏ ${s.name}`}
									className="shrink-0 rounded-full border border-rose-200 bg-rose-50 p-1.5 text-rose-500 transition hover:bg-rose-100"
								>
									<Heart className="h-4 w-4 fill-current" />
								</button>
							</div>
						))}
					</div>
				)}
			</section>
		</div>
	)
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value?: string }) {
	return (
		<div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white/70 px-3 py-2">
			<span className="text-slate-400">{icon}</span>
			<span className="w-32 shrink-0 text-slate-400">{label}</span>
			<span className="truncate font-medium text-slate-700">{value && value.length > 0 ? value : "—"}</span>
		</div>
	)
}

function EmptyState({ children }: { children: React.ReactNode }) {
	return (
		<div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-center text-sm text-slate-500">
			{children}
		</div>
	)
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
	return (
		<tr className="border-t border-slate-100">
			<th scope="row" className="sticky left-0 z-10 bg-white/90 p-3 text-left text-xs font-medium uppercase tracking-wide text-slate-400">{label}</th>
			{children}
		</tr>
	)
}

function Cell({ children }: { children: React.ReactNode }) {
	return <td className="border-l border-slate-100 p-3">{children}</td>
}

// =============================================================
// DiscoverySection — Kết quả "Khám phá bản thân" (Discovery Journey).
// NEO THEO TÀI KHOẢN: chỉ hiện khi đã đăng nhập và đọc snapshot theo email,
// nên mỗi người chỉ thấy kết quả của chính mình.
// =============================================================
function DiscoverySection() {
	const { data: session, status } = useSession()
	const email = session?.user?.email ?? null
	const [snap, setSnap] = useState<DjSnapshot | null>(null)

	useEffect(() => {
		const refresh = () => setSnap(readScoped<DjSnapshot | null>(DJ_SNAPSHOT_NS, email, null))
		refresh()
		window.addEventListener(SCOPED_EVENT, refresh)
		window.addEventListener("storage", refresh)
		return () => {
			window.removeEventListener(SCOPED_EVENT, refresh)
			window.removeEventListener("storage", refresh)
		}
	}, [email])

	if (status !== "authenticated") return null

	return (
		<section>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-heading flex items-center gap-2 text-lg font-bold text-slate-800">
					<Compass className="h-5 w-5 text-primary" /> Kết quả Khám phá bản thân
				</h3>
				<Link href="/kham-pha" className="text-sm font-medium text-primary hover:underline">
					{snap ? "Làm lại / cập nhật" : "Bắt đầu"}
				</Link>
			</div>
			{!snap ? (
				<EmptyState>
					Bạn chưa có dữ liệu. Vào{" "}
					<Link href="/kham-pha" className="font-medium text-primary underline">Khám phá bản thân</Link>{" "}
					để nhận “kiểu người – ngành phù hợp – lời khuyên”. Kết quả sẽ tự lưu vào tài khoản này.
				</EmptyState>
			) : (
				<div className="space-y-4">
					<div className="rounded-xl border border-primary/15 bg-white/80 p-4">
						<p className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">Kiểu người của bạn</p>
						<p className="text-base font-semibold text-slate-800">{snap.personType}</p>
						{snap.hollandCode ? <p className="mt-0.5 text-sm text-slate-500">Mã Holland: <b className="text-slate-700">{snap.hollandCode}</b></p> : null}
					</div>

					<div className="rounded-xl border border-slate-200 bg-white/80 p-4">
						<p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500"><Sparkles className="h-3.5 w-3.5 text-primary" /> Nhóm ngành phù hợp</p>
						<div className="space-y-3">
							{snap.topClusters.map((c) => (
								<div key={c.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
									<div className="flex items-center justify-between gap-2">
										<span className="font-semibold text-slate-800">{c.icon} {c.name}</span>
										<span className="text-xs text-slate-500">Năng lực {c.competence} · Hứng thú {c.interest}</span>
									</div>
									<p className="mt-1 text-xs text-slate-500">{c.quadrant}</p>
									{c.sampleMajors.length ? <p className="mt-1 text-xs text-slate-600">Ngành gợi ý: {c.sampleMajors.join(", ")}</p> : null}
								</div>
							))}
						</div>
					</div>

					{(snap.advice.length || snap.framing) ? (
						<div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
							<p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-amber-700"><Lightbulb className="h-3.5 w-3.5" /> Lời khuyên</p>
							{snap.framing ? <p className="text-sm leading-relaxed text-slate-700">{snap.framing}</p> : null}
							{snap.advice.length ? (
								<ul className="mt-2 space-y-1 text-sm text-slate-700">
									{snap.advice.map((a, i) => <li key={i}>• {a}</li>)}
								</ul>
							) : null}
						</div>
					) : null}
					<p className="text-xs text-slate-400">Cập nhật lần cuối: {new Date(snap.updatedAt).toLocaleString("vi-VN")}. Dữ liệu này chỉ hiển thị cho tài khoản của bạn.</p>
				</div>
			)}
		</section>
	)
}

// =============================================================
// MyReviewsSection — Lịch sử đánh giá của chính người dùng (Tab cá nhân).
// Chỉ hiển thị khi đã đăng nhập. Khi đăng xuất rồi đăng nhập lại đúng tài
// khoản Google, user_id (Google sub) không đổi nên review cũ hiện lại đầy đủ.
// =============================================================
interface MyReview {
	id: number
	universityId: string
	rating: number
	content: string
	createdAt: string
}

function MyReviewsSection() {
	const { status } = useSession()
	const [reviews, setReviews] = useState<MyReview[]>([])
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState<string | null>(null)

	useEffect(() => {
		if (status !== "authenticated") {
			setReviews([])
			return
		}
		let cancelled = false
		;(async () => {
			setLoading(true)
			setError(null)
			try {
				const res = await fetch("/api/reviews/mine", { cache: "no-store" })
				const data = await res.json()
				if (!res.ok || !data.ok) throw new Error(data?.error || "FETCH_FAILED")
				if (!cancelled) setReviews(data.reviews ?? [])
			} catch {
				if (!cancelled) setError("Không tải được đánh giá của bạn.")
			} finally {
				if (!cancelled) setLoading(false)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [status])

	// Chưa đăng nhập → không hiển thị section (tránh lộ / gây rối)
	if (status !== "authenticated") return null

	const nameOf = (id: string) => INSTITUTIONS.find((s) => s.id === id)?.name ?? id

	return (
		<section>
			<div className="mb-3 flex items-center justify-between">
				<h3 className="font-heading flex items-center gap-2 text-lg font-bold text-slate-800">
					<GraduationCap className="h-5 w-5 text-amber-500" /> Đánh giá của tôi
					<span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-500">{reviews.length}</span>
				</h3>
			</div>
			{loading ? (
				<EmptyState>Đang tải đánh giá của bạn…</EmptyState>
			) : error ? (
				<EmptyState>{error}</EmptyState>
			) : reviews.length === 0 ? (
				<EmptyState>Bạn chưa viết đánh giá nào. Mở chi tiết một trường để chia sẻ cảm nhận nhé!</EmptyState>
			) : (
				<ul className="space-y-3">
					{reviews.map((r) => (
						<li key={r.id} className="rounded-xl border border-slate-200 bg-white/70 p-4">
							<div className="flex items-center justify-between gap-2">
								<span className="font-medium text-slate-700">{nameOf(r.universityId)}</span>
								<StarDisplay value={r.rating} size={14} />
							</div>
							<p className="mt-1.5 whitespace-pre-line text-sm leading-relaxed text-slate-600">{r.content}</p>
						</li>
					))}
				</ul>
			)}
		</section>
	)
}
