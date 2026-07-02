"use client"

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react"
import {
	ArrowUpDown,
	BookOpen,
	Building2,
	ExternalLink,
	GraduationCap,
	Heart,
	LandPlot,
	MapPin,
	MessageCircle,
	Scale,
	Search,
	Sparkles,
	Star,
	Target,
	Wallet,
	X,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { MAJOR_FIELDS } from "@/data/majorFields"
import { UNIVERSITIES, UNIVERSITY_PROGRAMS } from "@/data/universities"
import { MAJOR_BY_ID } from "@/data/majors"
import { ADMISSION_2025, admissionRangeLabel } from "@/data/admissionScores2025"
import Link from "next/link"
import { findSchoolProfile } from "@/data/schoolDirectory"
import { findSchoolBySlug } from "@/lib/schools/resolve"
import type { UniversityProgram } from "@/types"
import { ReviewSection } from "@/components/community/ReviewSection"
import { ContributeButton } from "@/components/community/ContributeButton"
import { AddSchoolButton } from "@/components/community/AddSchoolButton"
import { useSession } from "next-auth/react"
import {
	migrateLegacyScoped, readScoped, slotFor, writeScoped,
} from "@/lib/store/scopedStore"

// Định dạng điểm chuẩn kiểu Việt Nam (dấu phẩy thập phân, bỏ số 0 thừa).
function fmtScore(n: number): string {
	return n.toFixed(2).replace(/\.?0+$/, "").replace(".", ",")
}

// =============================================================
// InstitutionsTab — Tra cứu Nơi đào tạo sau Trung học (Việt Nam)
// Dữ liệu trường được tổng hợp tự động từ kho dữ liệu ngành học
// (universities.ts + majorFields.ts) nên bao phủ TẤT CẢ các trường.
// Bấm vào một trường để mở popup xem thông tin chi tiết.
// Dữ liệu mang tính tham khảo, KHÔNG phải điểm chuẩn chính thức.
// =============================================================

// ---------- Kiểu dữ liệu ----------
type RegionId = "bac" | "trung" | "nam"
type InstType = "dai-hoc" | "hoc-vien" | "cao-dang"
type Ownership = "cong-lap" | "tu-thuc"
type FieldId = string

interface InstProgram {
	majorId: string
	name: string
	index: number // chỉ số chương trình 0–100
}

export interface Institution {
	id: string
	name: string
	shortName: string
	code: string
	address: string
	region: RegionId
	type: InstType
	ownership: Ownership
	fields: FieldId[]
	intro: string
	website?: string
	programs: InstProgram[]
	review: {
		facilities: number // số sao 1–5
		faculty: number // số sao 1–5
		summary: string
	}
	tuition: string
}

// ---------- Từ điển hiển thị ----------
export const REGION_LABEL: Record<RegionId, string> = {
	bac: "Miền Bắc",
	trung: "Miền Trung",
	nam: "Miền Nam",
}

export const TYPE_LABEL: Record<InstType, string> = {
	"dai-hoc": "Đại học",
	"hoc-vien": "Học viện",
	"cao-dang": "Cao đẳng",
}

const OWNERSHIP_LABEL: Record<Ownership, string> = {
	"cong-lap": "Công lập",
	"tu-thuc": "Tư thục",
}

const TYPE_ORDER: InstType[] = ["dai-hoc", "hoc-vien", "cao-dang"]

// Lĩnh vực (khối ngành) — gom gọn để lọc nhanh.
const EXTRA_FIELDS: { id: string; name: string; icon: string }[] = [
	{ id: "hang-hai", name: "Hàng hải – Logistics", icon: "⚓" },
	{ id: "cong-an-quan-doi", name: "Công an – Quân đội", icon: "🛡️" },
	{ id: "van-hoa-nghe-thuat", name: "Văn hóa – Nghệ thuật", icon: "🎭" },
]

const FIELD_DEFS: { id: string; name: string; icon: string }[] = [
	...MAJOR_FIELDS.map((f) => ({ id: f.id, name: f.name, icon: f.icon })),
	...EXTRA_FIELDS,
]

const FIELD_LABEL: Record<string, string> = Object.fromEntries(
	FIELD_DEFS.map((f) => [f.id, f.name]),
)
const FIELD_ICON: Record<string, string> = Object.fromEntries(
	FIELD_DEFS.map((f) => [f.id, f.icon]),
)
const FIELD_OPTIONS: string[] = FIELD_DEFS.map((f) => f.id)

// ---------- Sinh dữ liệu trường từ kho dữ liệu ----------
const MAJOR_TO_FIELD: Record<string, string> = {}
for (const f of MAJOR_FIELDS) {
	for (const mId of f.majorIds) MAJOR_TO_FIELD[mId] = f.id
}

const PROGRAMS_BY_UNI: Record<string, UniversityProgram[]> = {}
for (const p of UNIVERSITY_PROGRAMS) {
	;(PROGRAMS_BY_UNI[p.universityId] ||= []).push(p)
}

function programIndex(p: UniversityProgram): number {
	const s = p.scores
	return (
		(s.programReputation + s.trainingStrength + s.relevance + s.recognitionBreadth) / 4
	)
}

function inferType(name: string): InstType {
	if (name.includes("Học viện")) return "hoc-vien"
	if (name.includes("Cao đẳng")) return "cao-dang"
	return "dai-hoc"
}

// Suy luận thêm lĩnh vực từ tên trường (bổ sung cho dữ liệu chương trình).
function keywordFields(name: string): string[] {
	const out: string[] = []
	const add = (id: string) => {
		if (!out.includes(id)) out.push(id)
	}
	const n = name
	if (n.includes("Công nghệ Thông tin") || n.includes("FPT")) add("cong-nghe")
	if (n.includes("Bách khoa")) {
		add("ky-thuat")
		add("cong-nghe")
	}
	if (n.includes("Xây dựng")) add("ky-thuat")
	if (n.includes("Kiến trúc") || n.includes("Mỹ thuật")) add("kien-truc-thiet-ke")
	if (n.includes("Kinh tế") || n.includes("Ngoại thương") || n.includes("Thương mại")) add("kinh-te")
	if (n.includes("Tài chính") || n.includes("Ngân hàng")) add("tai-chinh")
	if (n.includes("Luật")) add("phap-luat")
	if (n.includes("Y –") || n.includes("Dược") || n.includes("Điều dưỡng") || n.includes("Y khoa") || n.includes("Y Dược") || n.includes("Y Hà")) add("y-duoc")
	if (n.includes("Sư phạm")) add("su-pham")
	if (n.includes("Ngoại ngữ") || n.includes("Ngôn ngữ")) add("ngon-ngu")
	if (n.includes("Khoa học Xã hội") || n.includes("Nhân văn") || n.includes("KHXH")) add("tam-ly-xa-hoi")
	if (n.includes("Báo chí") || n.includes("Tuyên truyền")) add("truyen-thong")
	if (n.includes("Văn hóa")) add("van-hoa-nghe-thuat")
	if (n.includes("Du lịch")) add("du-lich")
	if (n.includes("Hàng hải")) add("hang-hai")
	if (n.includes("An ninh") || n.includes("Cảnh sát") || n.includes("Quân")) add("cong-an-quan-doi")
	return out
}

function clampStar(v: number): number {
	const r = Math.round(v * 2) / 2
	return Math.max(3, Math.min(5, r))
}

function tuitionNote(ownership: Ownership): string {
	return ownership === "cong-lap"
		? "Tham khảo theo đề án tuyển sinh (khối công lập thường ~15–35 triệu đồng/năm tùy ngành)."
		: "Học phí khối tư thục, vui lòng xem đề án tuyển sinh chính thức của trường."
}

const GENERATED_INSTITUTIONS: Institution[] = UNIVERSITIES.map((u) => {
	const progs = PROGRAMS_BY_UNI[u.id] ?? []
	const fieldSet: string[] = []
	const addField = (id: string) => {
		if (id && !fieldSet.includes(id)) fieldSet.push(id)
	}
	for (const p of progs) addField(MAJOR_TO_FIELD[p.majorId])
	for (const fid of keywordFields(u.name)) addField(fid)

	const programs: InstProgram[] = progs
		.map((p) => ({
			majorId: p.majorId,
			name: MAJOR_BY_ID[p.majorId]?.name ?? p.majorId,
			index: programIndex(p),
		}))
		.sort((a, b) => b.index - a.index)

	const overall = programs.length ? programs[0].index : 80
	const type = inferType(u.name)
	const fieldNames = fieldSet.map((id) => FIELD_LABEL[id]).filter(Boolean)
	const intro =
		`${TYPE_LABEL[type]} ${OWNERSHIP_LABEL[u.type].toLowerCase()} tại ${u.city}` +
		(fieldNames.length
			? `. Thế mạnh đào tạo: ${fieldNames.slice(0, 4).join(", ")}.`
			: ".")

	return {
		id: u.id,
		name: u.name,
		shortName: u.shortName,
		code: u.shortName,
		address: u.city,
		region: u.region,
		type,
		ownership: u.type,
		fields: fieldSet,
		intro,
		website: u.website,
		programs,
		review: {
			facilities: clampStar(overall / 20 - 0.1),
			faculty: clampStar(overall / 20 + 0.1),
			summary:
				programs.length > 0
					? `Được đánh giá tốt ở các ngành: ${programs.slice(0, 3).map((p) => p.name).join(", ")}.`
					: "Thông tin chi tiết tham khảo tại website chính thức của trường.",
		},
		tuition: tuitionNote(u.type),
	}
})

// Một số trường đặc thù chưa có trong kho dữ liệu ngành — bổ sung thủ công.
const SPECIAL_INSTITUTIONS: Institution[] = [
	{
		id: "vimaru",
		name: "Đại học Hàng hải Việt Nam",
		shortName: "Hàng hải VN",
		code: "HHA",
		address: "Hải Phòng",
		region: "bac",
		type: "dai-hoc",
		ownership: "cong-lap",
		fields: ["hang-hai", "ky-thuat", "kinh-te"],
		intro:
			"Trường trọng điểm quốc gia về hàng hải, logistics và kinh tế biển, có đội tàu huấn luyện và buồng lái mô phỏng phục vụ thực hành đi biển.",
		website: "https://vimaru.edu.vn",
		programs: [
			{ majorId: "logistics-chuoi-cung-ung", name: "Logistics & Quản lý chuỗi cung ứng", index: 82 },
			{ majorId: "khoa-hoc-hang-hai", name: "Khoa học Hàng hải (Điều khiển tàu biển)", index: 78 },
		],
		review: {
			facilities: 4,
			faculty: 4,
			summary: "Cơ sở thực hành đặc thù ngành biển hiếm trường có; môi trường kỷ luật, sát nghề.",
		},
		tuition: "~18–26 triệu đồng/năm; một số ngành đặc thù có thể khác.",
	},
	{
		id: "acvn",
		name: "Học viện An ninh Nhân dân",
		shortName: "An ninh ND",
		code: "ANH",
		address: "Hà Nội",
		region: "bac",
		type: "hoc-vien",
		ownership: "cong-lap",
		fields: ["cong-an-quan-doi", "phap-luat"],
		intro:
			"Cơ sở đào tạo sĩ quan an ninh hệ chính quy. Tuyển sinh c�� sơ tuyển sức khỏe, lý lịch và yêu cầu riêng; sinh viên được bao cấp ăn ở theo quy định.",
		programs: [
			{ majorId: "nghiep-vu-an-ninh", name: "Nghiệp vụ An ninh", index: 85 },
		],
		review: {
			facilities: 4.5,
			faculty: 4.5,
			summary: "Môi trường kỷ luật cao, rèn luyện toàn diện; đầu ra ổn định trong ngành công an.",
		},
		tuition: "Được bao cấp ăn ở và miễn học phí theo quy định của ngành công an.",
	},
	{
		id: "caothang",
		name: "Trường Cao đẳng Kỹ thuật Cao Thắng",
		shortName: "CĐ Cao Thắng",
		code: "CKC",
		address: "TP.HCM",
		region: "nam",
		type: "cao-dang",
		ownership: "cong-lap",
		fields: ["ky-thuat", "cong-nghe"],
		intro:
			"Trường cao đẳng kỹ thuật uy tín, học nhanh – ra nghề sớm. Xét tuyển chủ yếu bằng học bạ, chú trọng thực hành và liên kết doanh nghiệp.",
		website: "https://caothang.edu.vn",
		programs: [
			{ majorId: "cong-nghe-o-to", name: "Công nghệ Ô tô", index: 74 },
			{ majorId: "cong-nghe-thong-tin", name: "Công nghệ Thông tin", index: 72 },
		],
		review: {
			facilities: 4,
			faculty: 4,
			summary: "Thực hành nhiều, gắn với doanh nghiệp; chi phí hợp lý, phù hợp bạn muốn ra nghề nhanh.",
		},
		tuition: "~10–16 triệu đồng/năm, học phí cao đẳng hợp lý.",
	},
]

export const INSTITUTIONS: Institution[] = [
	...GENERATED_INSTITUTIONS,
	...SPECIAL_INSTITUTIONS,
]

// ---------- Cơ sở đào tạo do cộng đồng đóng góp (đã được admin duyệt) ----------
// Lấy từ GET /api/universities (status APPROVED) rồi hợp nhất vào danh sách hiển thị.
export interface CommunityUniversity {
	slug: string
	name: string
	code: string
	address: string
	website: string
	nganhTieuBieu: string
	region: string
	heDaoTao: string
	ownership: string
}

function communityType(heDaoTao: string): InstType {
	if (heDaoTao === "cao-dang") return "cao-dang"
	if (heDaoTao === "hoc-vien") return "hoc-vien"
	return "dai-hoc"
}

function communityRegion(region: string): RegionId {
	if (region === "trung") return "trung"
	if (region === "nam") return "nam"
	return "bac"
}

export function mapCommunityToInstitution(u: CommunityUniversity): Institution {
	const type = communityType(u.heDaoTao)
	const region = communityRegion(u.region)
	const ownership: Ownership = u.ownership === "tu-thuc" ? "tu-thuc" : "cong-lap"
	const fields = keywordFields(u.name)
	const programs: InstProgram[] = u.nganhTieuBieu
		.split(/[,;]/)
		.map((s) => s.trim())
		.filter(Boolean)
		.map((name, i) => ({ majorId: `community-${u.slug}-${i}`, name, index: 75 }))
	return {
		id: `community:${u.slug}`,
		name: u.name,
		shortName: u.code || u.name,
		code: u.code || "—",
		address: u.address,
		region,
		type,
		ownership,
		fields,
		intro: `${TYPE_LABEL[type]} ${OWNERSHIP_LABEL[ownership].toLowerCase()} tại ${u.address || "Việt Nam"} (do cộng đồng đóng góp, đã được duyệt).`,
		website: u.website || undefined,
		programs,
		review: {
			facilities: 4,
			faculty: 4,
			summary:
				programs.length > 0
					? `Thông tin do cộng đồng đóng góp. Ngành tiêu biểu: ${programs.slice(0, 3).map((p) => p.name).join(", ")}.`
					: "Thông tin do cộng đồng đóng góp, đã được quản trị viên duyệt.",
		},
		tuition: tuitionNote(ownership),
	}
}

// ---------- Tiện ích ----------
export const INSTITUTIONS_FAV_KEY = "huong-nghiep:truong-yeu-thich:v1"
// Namespace trường yêu thích — tách riêng theo từng tài khoản Google.
export const SCHOOLS_FAV_NS = "favorites-schools"
const MAX_COMPARE = 3

type SortId = "chi-so-cao" | "ten-az" | "danh-gia"

const SORT_OPTIONS: { id: SortId; label: string }[] = [
	{ id: "chi-so-cao", label: "Chỉ số chương trình cao → thấp" },
	{ id: "ten-az", label: "Tên trường A → Z" },
	{ id: "danh-gia", label: "Đánh giá cao nhất" },
]

// Bỏ dấu tiếng Việt để tìm kiếm dễ chịu hơn.
function normalize(str: string): string {
	return str
		.toLowerCase()
		.normalize("NFD")
		.replace(/[\u0300-\u036f]/g, "")
		.replace(/đ/g, "d")
}

// Chỉ số đại diện = chỉ số chương trình cao nhất (0–100).
export function topScore(inst: Institution): number {
	let best = 0
	for (const p of inst.programs) if (p.index > best) best = p.index
	return best || 80
}

function avgRating(inst: Institution): number {
	return (inst.review.facilities + inst.review.faculty) / 2
}

const REGION_OPTIONS: RegionId[] = ["bac", "trung", "nam"]

// ---------- Component sao đánh giá ----------
export function Stars({ value }: { value: number }) {
	return (
		<span className="inline-flex items-center gap-0.5" aria-label={`${value} trên 5 sao`}>
			{[1, 2, 3, 4, 5].map((i) => {
				const fill = Math.max(0, Math.min(1, value - (i - 1)))
				return (
					<span key={i} className="relative inline-block h-3.5 w-3.5">
						<Star className="absolute inset-0 h-3.5 w-3.5 text-amber-300" />
						<span className="absolute inset-0 overflow-hidden" style={ { width: `${fill * 100}%` } }>
							<Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
						</span>
					</span>
				)
			})}
			<span className="ml-1 text-xs font-medium text-slate-500">{value.toFixed(1)}</span>
		</span>
	)
}

// ---------- Nền giấy ô ly ----------
const PAPER_STYLE: CSSProperties = {
	backgroundColor: "#fcfaf3",
	backgroundImage:
		"repeating-linear-gradient(to bottom, transparent 0px, transparent 27px, rgba(59,130,246,0.10) 28px), repeating-linear-gradient(to right, transparent 0px, transparent 27px, rgba(59,130,246,0.05) 28px)",
}

// =============================================================
export function InstitutionsTab() {
	const [query, setQuery] = useState("")
	const [regions, setRegions] = useState<RegionId[]>([])
	const [field, setField] = useState<FieldId | "all">("all")
	const [sort, setSort] = useState<SortId>("chi-so-cao")

	const { data: session, status } = useSession()
	const email = session?.user?.email ?? null
	const loadedSlotRef = useRef<string | null>(null)

	const [favorites, setFavorites] = useState<string[]>([])
	const [compare, setCompare] = useState<string[]>([])
	const [hydrated, setHydrated] = useState(false)
	const [showCompare, setShowCompare] = useState(false)
	const [selected, setSelected] = useState<Institution | null>(null)
	const [community, setCommunity] = useState<Institution[]>([])

	// Nạp các cơ sở đào tạo do cộng đồng đóng góp đã được duyệt (hiển thị cùng trường tĩnh).
	const reloadCommunity = useCallback(async () => {
		try {
			const res = await fetch("/api/universities", { cache: "no-store" })
			const data = await res.json()
			if (data?.ok && Array.isArray(data.items)) {
				setCommunity(data.items.map(mapCommunityToInstitution))
			}
		} catch {
			/* bỏ qua lỗi tải danh sách cộng đồng */
		}
	}, [])

	useEffect(() => {
		reloadCommunity()
	}, [reloadCommunity])

	// Nạp trường yêu thích của đúng tài khoản mỗi khi phiên đăng nhập thay đổi.
	useEffect(() => {
		if (status === "loading") return
		migrateLegacyScoped(SCHOOLS_FAV_NS, INSTITUTIONS_FAV_KEY)
		const stored = readScoped<string[]>(SCHOOLS_FAV_NS, email, [])
		setFavorites(Array.isArray(stored) ? stored.filter((x): x is string => typeof x === "string") : [])
		loadedSlotRef.current = slotFor(email)
		setHydrated(true)
	}, [email, status])

	// Ghi lại CHỈ khi đã nạp đúng tài khoản hiện tại (tránh ghi đè nhầm).
	useEffect(() => {
		if (!hydrated || loadedSlotRef.current !== slotFor(email)) return
		writeScoped(SCHOOLS_FAV_NS, email, favorites)
	}, [favorites, hydrated, email])

	// Đóng popup bằng phím Esc.
	useEffect(() => {
		if (!selected) return
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setSelected(null)
		}
		window.addEventListener("keydown", onKey)
		return () => window.removeEventListener("keydown", onKey)
	}, [selected])

	const toggleFavorite = (id: string) =>
		setFavorites((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))

	const toggleRegion = (r: RegionId) =>
		setRegions((prev) => (prev.includes(r) ? prev.filter((x) => x !== r) : [...prev, r]))

	const toggleCompare = (id: string) =>
		setCompare((prev) => {
			if (prev.includes(id)) return prev.filter((x) => x !== id)
			if (prev.length >= MAX_COMPARE) return prev
			return [...prev, id]
		})

	const resetFilters = () => {
		setQuery("")
		setRegions([])
		setField("all")
	}

	// Hợp nhất trường tĩnh + trường cộng đồng đã duyệt (bỏ trùng theo tên).
	const allInstitutions = useMemo(() => {
		if (community.length === 0) return INSTITUTIONS
		const seen = new Set(INSTITUTIONS.map((i) => normalize(i.name)))
		const extra = community.filter((i) => !seen.has(normalize(i.name)))
		return [...INSTITUTIONS, ...extra]
	}, [community])

	const filtered = useMemo(() => {
		const q = normalize(query.trim())
		const list = allInstitutions.filter((inst) => {
			if (
				q &&
				!normalize(inst.name).includes(q) &&
				!normalize(inst.shortName).includes(q) &&
				!normalize(inst.code).includes(q) &&
				!normalize(inst.address).includes(q)
			)
				return false
			if (regions.length > 0 && !regions.includes(inst.region)) return false
			if (field !== "all" && !inst.fields.includes(field)) return false
			return true
		})

		const sorted = [...list].sort((a, b) => {
			switch (sort) {
				case "chi-so-cao":
					return topScore(b) - topScore(a)
				case "ten-az":
					return a.name.localeCompare(b.name, "vi")
				case "danh-gia":
					return avgRating(b) - avgRating(a)
				default:
					return 0
			}
		})
		return sorted
	}, [query, regions, field, sort, allInstitutions])

	const grouped = useMemo(() => {
		const map: Record<InstType, Institution[]> = { "dai-hoc": [], "hoc-vien": [], "cao-dang": [] }
		for (const inst of filtered) map[inst.type].push(inst)
		return map
	}, [filtered])

	const compareList = compare
		.map((id) => allInstitutions.find((x) => x.id === id))
		.filter((x): x is Institution => Boolean(x))

	const activeFilterCount = (query ? 1 : 0) + regions.length + (field !== "all" ? 1 : 0)

	return (
		<div className="relative overflow-hidden rounded-2xl border border-slate-200 shadow-sm" style={PAPER_STYLE}>
			{/* Gáy lò xo gợi cảm giác trang vở (ẩn bớt trên điện thoại) */}
			<div className="pointer-events-none absolute inset-y-0 left-6 hidden w-px bg-red-400/30 sm:left-12 sm:block" />
			<div className="pointer-events-none absolute inset-y-0 left-1.5 flex flex-col justify-around py-6 sm:left-3">
				{Array.from({ length: 22 }).map((_, i) => (
					<span key={i} className="block h-1 w-3 rounded-full border border-slate-300/50 bg-slate-200/50 sm:w-6" />
				))}
			</div>

			<div className="relative px-4 py-6 pl-9 sm:px-8 sm:py-7 sm:pl-16">
				{/* Tiêu đề */}
				<header className="mb-5 sm:mb-6">
					<h2 className="font-heading flex items-center gap-2 text-xl font-bold text-slate-800 sm:text-3xl">
						<LandPlot className="h-6 w-6 shrink-0 text-primary sm:h-7 sm:w-7" /> Tra cứu Nơi đào tạo
					</h2>
					<p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-600">
						Tìm Đại học, Học viện, Cao đẳng theo khu vực và lĩnh vực. Bấm vào một trường để xem
						chi tiết, lưu trường yêu thích và so sánh tối đa {MAX_COMPARE} trường.
					</p>
					<p className="mt-1 text-xs italic text-slate-400">
						* Thông tin mang tính tham khảo, vui lòng đối chiếu đề án tuyển sinh chính thức của trường.
					</p>
				</header>

				{/* Thanh tìm kiếm + sắp xếp */}
				<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
					<div className="relative flex-1">
						<Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
						<input
							type="text"
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							placeholder="Tìm tên trường, mã hoặc thành phố (VD: Bách khoa, NEU, Hà Nội)…"
							className="w-full rounded-xl border border-slate-300 bg-white/80 py-2.5 pl-9 pr-9 text-sm shadow-inner outline-none transition focus:border-primary focus:ring-2 focus:ring-primary/30"
						/>
						{query && (
							<button
								type="button"
								onClick={() => setQuery("")}
								aria-label="Xóa tìm kiếm"
								className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
							>
								<X className="h-4 w-4" />
							</button>
						)}
					</div>
					<label className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white/80 px-3 py-2 text-sm">
						<ArrowUpDown className="h-4 w-4 shrink-0 text-slate-400" />
						<select
							value={sort}
							onChange={(e) => setSort(e.target.value as SortId)}
							className="w-full bg-transparent outline-none"
							aria-label="Sắp xếp"
						>
							{SORT_OPTIONS.map((o) => (
								<option key={o.id} value={o.id}>{o.label}</option>
							))}
						</select>
					</label>
				</div>

				{/* Bộ lọc */}
				<div className="mt-4 space-y-3 rounded-xl border border-slate-200 bg-white/60 p-3 sm:p-4">
					{/* Khu vực */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="w-full shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-24">Khu vực</span>
						{REGION_OPTIONS.map((r) => (
							<button
								key={r}
								type="button"
								onClick={() => toggleRegion(r)}
								className={cn(
									"rounded-full border px-3 py-1 text-sm transition",
								regions.includes(r)
									? "border-primary bg-primary/10 font-medium text-primary"
									: "border-slate-300 bg-white text-slate-600 hover:border-primary/50",
							)}
							>
								{REGION_LABEL[r]}
							</button>
						))}
					</div>
					{/* Lĩnh vực */}
					<div className="flex flex-wrap items-center gap-2">
						<span className="w-full shrink-0 text-xs font-semibold uppercase tracking-wide text-slate-500 sm:w-24">Lĩnh vực</span>
						<button
							type="button"
							onClick={() => setField("all")}
							className={cn(
								"rounded-full border px-3 py-1 text-sm transition",
							field === "all"
								? "border-primary bg-primary/10 font-medium text-primary"
								: "border-slate-300 bg-white text-slate-600 hover:border-primary/50",
						)}
						>
							Tất cả
						</button>
						{FIELD_OPTIONS.map((f) => (
							<button
								key={f}
								type="button"
								onClick={() => setField((prev) => (prev === f ? "all" : f))}
								className={cn(
									"rounded-full border px-3 py-1 text-sm transition",
								field === f
									? "border-primary bg-primary/10 font-medium text-primary"
									: "border-slate-300 bg-white text-slate-600 hover:border-primary/50",
							)}
							>
								<span className="mr-1">{FIELD_ICON[f]}</span>{FIELD_LABEL[f]}
							</button>
						))}
					</div>
					{activeFilterCount > 0 && (
						<button
							type="button"
							onClick={resetFilters}
							className="inline-flex items-center gap-1.5 rounded-full border border-slate-300 px-3 py-1 text-xs text-slate-500 transition hover:bg-slate-100"
						>
							<X className="h-3.5 w-3.5" /> Xóa {activeFilterCount} bộ lọc
						</button>
					)}
				</div>

				{/* Thanh trạng thái so sánh */}
				{compare.length > 0 && (
					<div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent/5 px-4 py-3">
						<div className="flex flex-wrap items-center gap-2 text-sm">
							<Scale className="h-4 w-4 text-accent" />
							<span className="font-medium text-slate-700">Đang chọn so sánh ({compare.length}/{MAX_COMPARE}):</span>
							{compareList.map((inst) => (
								<span key={inst.id} className="inline-flex items-center gap-1 rounded-full bg-white px-2 py-0.5 text-xs text-slate-600 shadow-sm">
									{inst.code}
									<button type="button" onClick={() => toggleCompare(inst.id)} aria-label={`Bỏ ${inst.name}`}>
										<X className="h-3 w-3 hover:text-red-500" />
									</button>
								</span>
							))}
						</div>
						<div className="flex items-center gap-2">
							<button
								type="button"
								onClick={() => setShowCompare((v) => !v)}
								disabled={compare.length < 2}
								className="rounded-lg bg-accent px-3 py-1.5 text-sm font-medium text-accent-foreground transition hover:bg-accent/90 disabled:opacity-50"
							>
								{showCompare ? "Ẩn bảng" : "Xem bảng so sánh"}
							</button>
							<button type="button" onClick={() => setCompare([])} className="text-xs text-slate-500 hover:text-slate-700">
								Bỏ hết
							</button>
						</div>
					</div>
				)}

				{showCompare && compareList.length >= 2 && <CompareTable items={compareList} />}

				{/* Kết qu�� theo 3 danh mục */}
				<div className="mt-6 space-y-8">
					{filtered.length === 0 ? (
						<div className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-14 text-center text-sm text-slate-500">
							Không tìm thấy trường phù hợp. Hãy nới lỏng bộ lọc hoặc thử từ khóa khác.
						</div>
					) : (
						TYPE_ORDER.map((t) =>
							grouped[t].length === 0 ? null : (
								<section key={t}>
									<h3 className="font-heading mb-3 flex items-center gap-2 text-lg font-bold text-slate-700">
										{t === "cao-dang" ? <Building2 className="h-5 w-5 text-primary" /> : <GraduationCap className="h-5 w-5 text-primary" />}
										{TYPE_LABEL[t]}
										<span className="rounded-full bg-slate-200/70 px-2 py-0.5 text-xs font-medium text-slate-500">{grouped[t].length}</span>
									</h3>
									<div className="grid gap-3 sm:gap-4 md:grid-cols-2">
										{grouped[t].map((inst) => (
											<InstitutionCard
												key={inst.id}
												inst={inst}
												favorite={hydrated && favorites.includes(inst.id)}
												onToggleFavorite={() => toggleFavorite(inst.id)}
												comparing={compare.includes(inst.id)}
												compareFull={compare.length >= MAX_COMPARE}
												onToggleCompare={() => toggleCompare(inst.id)}
												onOpen={() => setSelected(inst)}
										/>
										))}
									</div>
								</section>
							),
						)
					)}
				</div>

				{hydrated && favorites.length > 0 && (
					<p className="mt-6 flex items-center gap-1.5 text-sm text-slate-500">
						<Heart className="h-4 w-4 fill-rose-400 text-rose-400" />
						Đã lưu {favorites.length} trường vào sổ tay cá nhân (lưu ngay trên máy của bạn).
					</p>
				)}

				{/* Dấu cộng cuối trang — đề xuất thêm cơ sở đào tạo mới */}
				<div className="mt-8 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-primary/40 bg-primary/5 px-4 py-7 text-center">
					<p className="text-sm font-medium text-slate-600">
						Không tìm thấy trường bạn cần? Hãy đóng góp cho cộng đồng!
					</p>
					<p className="max-w-md text-xs text-slate-500">
						Bấm nút bên dưới để gửi thông tin một cơ sở đào tạo mới. Đề xuất sẽ được quản trị viên duyệt trước khi hiển thị công khai.
					</p>
					<div className="mt-1">
						<AddSchoolButton onSubmitted={reloadCommunity} />
					</div>
				</div>
			</div>

			{/* Popup chi tiết trường */}
			{selected && (
				<InstitutionModal
					inst={selected}
					favorite={hydrated && favorites.includes(selected.id)}
					onToggleFavorite={() => toggleFavorite(selected.id)}
					comparing={compare.includes(selected.id)}
					compareFull={compare.length >= MAX_COMPARE}
					onToggleCompare={() => toggleCompare(selected.id)}
					onClose={() => setSelected(null)}
				/>
			)}
		</div>
	)
}

// ---------- Thẻ trường (gọn, bấm để mở popup) ----------
function InstitutionCard({
	inst,
	favorite,
	onToggleFavorite,
	comparing,
	compareFull,
	onToggleCompare,
	onOpen,
}: {
	inst: Institution
	favorite: boolean
	onToggleFavorite: () => void
	comparing: boolean
	compareFull: boolean
	onToggleCompare: () => void
	onOpen: () => void
}) {
	const rep = topScore(inst)
	const dc2025 = admissionRangeLabel(inst.id)
	const shownFields = inst.fields.slice(0, 3)
	const moreFields = inst.fields.length - shownFields.length

	return (
		<div
			role="button"
			tabIndex={0}
			onClick={onOpen}
			onKeyDown={(e) => {
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault()
					onOpen()
				}
			}}
			className="flex cursor-pointer flex-col rounded-xl border border-slate-200 bg-white/85 p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/30"
		>
			<div className="flex items-start justify-between gap-2">
				<div className="min-w-0">
					<h4 className="font-heading text-base font-bold leading-snug text-slate-800" title={inst.name}>
						{inst.name}
					</h4>
					<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
						<span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-slate-600">{inst.code}</span>
						<span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {inst.address}</span>
						<span>· {OWNERSHIP_LABEL[inst.ownership]}</span>
					</div>
				</div>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						onToggleFavorite()
					}}
					aria-pressed={favorite}
					aria-label={favorite ? `Bỏ yêu thích ${inst.name}` : `Yêu thích ${inst.name}`}
					title={favorite ? "Bỏ khỏi yêu thích" : "Thêm vào yêu thích"}
					className={cn(
						"flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
						favorite ? "border-rose-300 bg-rose-50 text-rose-500" : "border-slate-200 text-slate-400 hover:border-rose-300 hover:text-rose-500",
					)}
				>
					<Heart className={cn("h-4 w-4", favorite && "fill-current")} />
				</button>
			</div>

			<div className="mt-2 flex flex-wrap gap-1">
				{shownFields.map((f) => (
					<span key={f} className="rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
						{FIELD_ICON[f]} {FIELD_LABEL[f]}
					</span>
				))}
				{moreFields > 0 && (
					<span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500">+{moreFields}</span>
				)}
			</div>

			<p className="mt-2 text-sm leading-relaxed text-slate-600 line-clamp-2">{inst.intro}</p>

			<div className="mt-3 flex items-center justify-between gap-2 rounded-lg bg-slate-50 px-3 py-2">
				<div className="flex items-center gap-2">
					<span className="text-xs text-slate-400">Chỉ số</span>
					<span className="font-heading text-lg font-bold text-primary">{Math.round(rep)}</span>
				</div>
				<Stars value={avgRating(inst)} />
			</div>

			{dc2025 && (
				<div className="mt-2 flex items-center gap-1.5 rounded-lg border border-emerald-100 bg-emerald-50 px-3 py-1.5 text-xs">
					<GraduationCap className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
					<span className="text-slate-500">Điểm chuẩn 2025:</span>
					<span className="font-semibold text-emerald-700">{dc2025}</span>
				</div>
			)}

			<div className="mt-3 flex items-center justify-between gap-2">
				<span className="text-xs font-medium text-primary">Xem chi tiết →</span>
				<button
					type="button"
					onClick={(e) => {
						e.stopPropagation()
						onToggleCompare()
					}}
					disabled={!comparing && compareFull}
					className={cn(
						"inline-flex items-center justify-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition",
						comparing
							? "border-accent bg-accent/10 text-accent"
							: "border-slate-300 text-slate-600 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40",
					)}
				>
					<Scale className="h-3.5 w-3.5" />
					{comparing ? "Đang so sánh" : compareFull ? "Đủ 3" : "So sánh"}
				</button>
			</div>
		</div>
	)
}

// ---------- Popup chi tiết ----------
function InstitutionModal({
	inst,
	favorite,
	onToggleFavorite,
	comparing,
	compareFull,
	onToggleCompare,
	onClose,
}: {
	inst: Institution
	favorite: boolean
	onToggleFavorite: () => void
	comparing: boolean
	compareFull: boolean
	onToggleCompare: () => void
	onClose: () => void
}) {
	const maxIndex = Math.max(1, ...inst.programs.map((p) => p.index))
	const admission = ADMISSION_2025[inst.id]
	const profile = findSchoolProfile(inst.name)
	const communitySlug = findSchoolBySlug(inst.id) ? inst.id : null
	return (
		<div
			className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-0 backdrop-blur-sm sm:items-center sm:p-4"
			role="dialog"
			aria-modal="true"
			aria-label={inst.name}
			onClick={onClose}
		>
			<div
				onClick={(e) => e.stopPropagation()}
				className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-xl sm:rounded-2xl"
			>
				{/* Header */}
				<div className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-slate-100 bg-white/95 px-5 py-4 backdrop-blur">
					<div className="min-w-0">
						<h3 className="font-heading text-lg font-bold leading-snug text-slate-800">{inst.name}</h3>
						<div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
							<span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono font-medium text-slate-600">{inst.code}</span>
							<span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">{TYPE_LABEL[inst.type]}</span>
							<span>{OWNERSHIP_LABEL[inst.ownership]}</span>
							<span className="inline-flex items-center gap-0.5"><MapPin className="h-3 w-3" /> {inst.address} · {REGION_LABEL[inst.region]}</span>
						</div>
					</div>
					<button
						type="button"
						onClick={onClose}
						aria-label="Đóng"
						className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100"
					>
						<X className="h-4 w-4" />
					</button>
				</div>

				<div className="space-y-4 px-5 py-4">
					{/* Giới thiệu */}
					<p className="text-sm leading-relaxed text-slate-600">{profile?.intro || inst.intro}</p>

					{/* Lĩnh vực */}
					<div className="flex flex-wrap gap-1.5">
						{inst.fields.map((f) => (
							<span key={f} className="rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">
								{FIELD_ICON[f]} {FIELD_LABEL[f]}
							</span>
						))}
					</div>

					{/* Đánh giá */}
					<div className="grid grid-cols-1 gap-2 rounded-xl bg-slate-50 p-3 sm:grid-cols-2">
						<div className="flex items-center justify-between sm:flex-col sm:items-start">
							<span className="text-xs text-slate-400">Chỉ số chương trình</span>
							<span className="font-heading text-2xl font-bold text-primary">{Math.round(topScore(inst))}</span>
						</div>
						<div className="space-y-1">
							<div className="flex items-center justify-between gap-2"><span className="text-xs text-slate-400">Cơ sở vật chất</span><Stars value={inst.review.facilities} /></div>
							<div className="flex items-center justify-between gap-2"><span className="text-xs text-slate-400">Giảng viên</span><Stars value={inst.review.faculty} /></div>
						</div>
					</div>
					<p className="text-xs leading-relaxed text-slate-500">{inst.review.summary}</p>

					{/* Ngành tiêu biểu */}
					{inst.programs.length > 0 && (
						<div>
							<div className="mb-2 flex items-center justify-between gap-2">
								<p className="flex items-center gap-1 text-sm font-semibold text-slate-700"><GraduationCap className="h-4 w-4 text-primary" /> Ngành tiêu biểu</p>
								<ContributeButton universityId={inst.id} universityName={inst.name} fieldName="nganh_tieu_bieu" fieldLabel="Ngành học tiêu biểu" currentValue={inst.programs.map((p) => p.name).join(", ")} />
							</div>
							<ul className="space-y-2">
								{inst.programs.map((p) => (
									<li key={p.majorId} className="text-sm">
										<div className="flex items-center justify-between gap-2">
											<span className="text-slate-700">{p.name}</span>
											<span className="shrink-0 font-medium text-primary">{Math.round(p.index)}</span>
										</div>
										<div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
											<span className="block h-full rounded-full bg-primary/70" style={ { width: `${(p.index / maxIndex) * 100}%` } } />
										</div>
									</li>
								))}
							</ul>
						</div>
					)}

					{/* Điểm chuẩn 2025 */}
					{admission && (
						<div>
							<p className="mb-2 flex items-center gap-1 text-sm font-semibold text-slate-700">
								<GraduationCap className="h-4 w-4 text-emerald-600" /> Điểm chuẩn 2025
								{admission.thang && admission.thang !== 30 ? ` (thang ${admission.thang})` : ""}
							</p>
							{admission.phuongThuc && (
								<p className="mb-1.5 text-xs text-slate-400">{admission.phuongThuc}{admission.congBo ? ` · công bố ${admission.congBo}` : ""}</p>
							)}
							<ul className="space-y-1">
								{admission.nganh.map((n, idx) => (
									<li key={idx} className="flex items-center justify-between gap-2 text-sm">
										<span className="text-slate-700">
											{n.nganh}
											{n.toHop ? <span className="text-slate-400"> · {n.toHop}</span> : null}
											{n.ghiChu ? <span className="text-xs italic text-slate-400"> ({n.ghiChu})</span> : null}
										</span>
										<span className="shrink-0 font-semibold text-emerald-700">{n.diem != null ? fmtScore(n.diem) : "—"}</span>
									</li>
								))}
							</ul>
							{admission.ghiChu && <p className="mt-1.5 text-xs italic text-slate-400">{admission.ghiChu}</p>}
							<p className="mt-1 text-xs italic text-slate-400">Nguồn: công bố chính thức của trường + tổng hợp (mùa 2025). Cần đối chiếu trước khi dùng.</p>
						</div>
					)}

					{/* Thông tin tổng hợp (từ danh bạ cơ sở đào tạo) */}
					{profile && (
						<div className="space-y-3">
							<div>
								<p className="mb-1 flex items-center gap-1 text-sm font-semibold text-slate-700"><Sparkles className="h-4 w-4 text-amber-500" /> Ngành mạnh</p>
								<p className="text-sm text-slate-600">{profile.strongMajors}</p>
							</div>
							<div>
								<p className="mb-1 flex items-center gap-1 text-sm font-semibold text-slate-700"><GraduationCap className="h-4 w-4 text-emerald-600" /> Tuyển sinh & đầu vào</p>
								<p className="text-sm text-slate-600">{profile.admission}</p>
							</div>
							<div>
								<p className="mb-1 flex items-center gap-1 text-sm font-semibold text-slate-700"><Target className="h-4 w-4 text-rose-500" /> Đầu ra / Phù hợp với ai</p>
								<p className="text-sm text-slate-600">{profile.output}</p>
							</div>
						</div>
					)}

					{/* Học phí */}
					<div className="flex items-start gap-1.5 rounded-lg border border-slate-200 bg-slate-50/70 p-3 text-xs text-slate-600">
						<Wallet className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
						<span>Học phí tham khảo: <span className="font-medium text-slate-700">{profile?.tuition || inst.tuition}</span></span>
					</div>

					<div className="border-t border-slate-100 pt-4">
						<ReviewSection universityId={inst.id} universityName={inst.name} />
					</div>

					{/* Cộng đồng của trường: Hỏi đáp + Cẩm nang & câu chuyện + Review giảng viên */}
					<div className="rounded-xl border border-primary/20 bg-primary/5 p-3">
						<p className="mb-2 text-sm font-semibold text-slate-700">Cộng đồng sinh viên trường này</p>
						<div className="flex flex-wrap gap-2">
							{communitySlug ? (
								<>
									<Link href={`/hoi-dap?school_id=${encodeURIComponent(communitySlug)}`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-sm ring-1 ring-primary/20 transition hover:bg-primary/10">
										<MessageCircle className="h-4 w-4" /> Hỏi đáp của trường
									</Link>
									<Link href={`/truong/${communitySlug}/survival-guide`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-amber-700 shadow-sm ring-1 ring-amber-300/50 transition hover:bg-amber-50">
										<BookOpen className="h-4 w-4" /> Cẩm nang & câu chuyện
									</Link>
									<Link href={`/truong/${communitySlug}/giang-vien`} className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50">
										<GraduationCap className="h-4 w-4" /> Review giảng viên
									</Link>
								</>
							) : (
								<Link href="/hoi-dap" className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-medium text-primary shadow-sm ring-1 ring-primary/20 transition hover:bg-primary/10">
									<MessageCircle className="h-4 w-4" /> Xem Hỏi đáp cộng đồng
								</Link>
							)}
						</div>
					</div>

					{inst.website && (
						<a
							href={inst.website}
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
						>
							<ExternalLink className="h-4 w-4" /> Trang web chính thức
						</a>
					)}

					{/* Báo cáo / đề xuất chỉnh sửa thông tin trường */}
					<div className="flex flex-col gap-2 rounded-xl border border-amber-200 bg-amber-50/60 p-3 sm:flex-row sm:items-center sm:justify-between">
						<p className="text-xs text-slate-600">
							Thấy thông tin chưa chính xác? Gửi đề xuất chỉnh sửa để quản trị viên xem xét.
						</p>
						<ContributeButton
							variant="button"
							universityId={inst.id}
							universityName={inst.name}
							fieldName="thong_tin_chung"
							fieldLabel="Thông tin chung của trường"
							triggerLabel="Đề xuất chỉnh sửa"
						/>
					</div>
				</div>

				{/* Hành động */}
				<div className="sticky bottom-0 flex items-center gap-2 border-t border-slate-100 bg-white/95 px-5 py-3 backdrop-blur">
					<button
						type="button"
						onClick={onToggleFavorite}
						className={cn(
							"inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition",
							favorite ? "border-rose-300 bg-rose-50 text-rose-500" : "border-slate-300 text-slate-600 hover:border-rose-300 hover:text-rose-500",
						)}
					>
						<Heart className={cn("h-4 w-4", favorite && "fill-current")} /> {favorite ? "Đã lưu" : "Lưu trường"}
					</button>
					<button
						type="button"
						onClick={onToggleCompare}
						disabled={!comparing && compareFull}
						className={cn(
							"inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-sm font-medium transition",
							comparing ? "border-accent bg-accent/10 text-accent" : "border-slate-300 text-slate-600 hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40",
						)}
					>
						<Scale className="h-4 w-4" /> {comparing ? "Đang so sánh" : compareFull ? "Đủ 3 trường" : "So sánh"}
					</button>
				</div>
			</div>
		</div>
	)
}

// ---------- Bảng so sánh ----------
function CompareTable({ items }: { items: Institution[] }) {
	const rows: { label: string; render: (inst: Institution) => ReactNode }[] = [
		{ label: "Mã trường", render: (i) => <span className="font-mono">{i.code}</span> },
		{ label: "Loại hình", render: (i) => TYPE_LABEL[i.type] },
		{ label: "Khu vực", render: (i) => `${i.address} · ${REGION_LABEL[i.region]}` },
		{ label: "Sở hữu", render: (i) => OWNERSHIP_LABEL[i.ownership] },
		{ label: "Lĩnh vực", render: (i) => i.fields.map((f) => FIELD_LABEL[f]).join(", ") },
		{ label: "Chỉ số chương trình", render: (i) => <span className="font-bold text-primary">{Math.round(topScore(i))}</span> },
		{ label: "Điểm chuẩn 2025", render: (i) => {
			const a = ADMISSION_2025[i.id]
			if (!a) return <span className="text-xs text-slate-400">Đang cập nhật</span>
			const label = admissionRangeLabel(i.id)
			return (
				<div className="text-xs">
					{label && <div className="font-semibold text-emerald-700">{label}</div>}
					<ul className="mt-0.5 space-y-0.5 text-slate-500">
						{a.nganh.slice(0, 3).map((n, idx) => (
							<li key={idx}>{n.nganh}: {n.diem != null ? fmtScore(n.diem) : "—"}</li>
						))}
					</ul>
				</div>
			)
		} },
		{ label: "Ngành tiêu biểu", render: (i) => (
			<ul className="space-y-0.5 text-xs text-slate-500">
				{i.programs.slice(0, 4).map((p) => <li key={p.majorId}>{p.name}</li>)}
				{i.programs.length === 0 && <li>—</li>}
			</ul>
		) },
		{ label: "Học phí tham khảo", render: (i) => <span className="text-xs text-slate-600">{i.tuition}</span> },
		{ label: "Cơ sở vật chất", render: (i) => <Stars value={i.review.facilities} /> },
		{ label: "Giảng viên", render: (i) => <Stars value={i.review.faculty} /> },
	]

	return (
		<div className="mt-4 overflow-x-auto rounded-xl border border-accent/30 bg-white/80">
			<table className="w-full border-collapse text-sm">
				<thead>
					<tr className="bg-accent/10">
						<th className="sticky left-0 bg-accent/10 px-3 py-2.5 text-left font-semibold text-slate-600">Tiêu chí</th>
						{items.map((i) => (
							<th key={i.id} className="px-3 py-2.5 text-left font-heading font-bold text-slate-800">{i.name}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{rows.map((row) => (
						<tr key={row.label} className="border-t border-slate-100 align-top">
							<td className="sticky left-0 bg-white/90 px-3 py-2 font-medium text-slate-500">{row.label}</td>
							{items.map((i) => (
								<td key={i.id} className="px-3 py-2 text-slate-700">{row.render(i)}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		</div>
	)
}
