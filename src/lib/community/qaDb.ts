// =============================================================
// LỚP DỮ LIỆU Q&A (Reddit-style): questions + answers + votes.
// Tự tạo bảng (idempotent). BẮT BUỘC đăng nhập để post (chống spam); khi
// is_anonymous=true thì người đọc thấy "Sinh viên ẩn danh", chỉ admin thấy tên thật.
// =============================================================
import { sql } from "@vercel/postgres"
import {
	MODERATION_PLACEHOLDER,
	isHiddenFor,
	type ContentStatus,
} from "@/lib/community/moderation"

export { sql }

let ensured = false
export async function ensureQaTables(): Promise<void> {
	if (ensured) return
	await sql`
		CREATE TABLE IF NOT EXISTS questions (
			id           SERIAL PRIMARY KEY,
			school_id    VARCHAR(100),
			title        VARCHAR(300) NOT NULL,
			body         TEXT NOT NULL,
			tags         TEXT,
			is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
			user_id      TEXT NOT NULL,
			author_name  TEXT,
			view_count   INT NOT NULL DEFAULT 0,
			upvotes      INT NOT NULL DEFAULT 0,
			downvotes    INT NOT NULL DEFAULT 0,
			status       VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
			created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_questions_school ON questions (school_id)`
	await sql`CREATE INDEX IF NOT EXISTS idx_questions_created ON questions (created_at DESC)`
	await sql`
		CREATE TABLE IF NOT EXISTS answers (
			id           SERIAL PRIMARY KEY,
			question_id  INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
			body         TEXT NOT NULL,
			is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
			user_id      TEXT NOT NULL,
			author_name  TEXT,
			upvotes      INT NOT NULL DEFAULT 0,
			downvotes    INT NOT NULL DEFAULT 0,
			status       VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
			created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_answers_question ON answers (question_id)`
	await sql`
		CREATE TABLE IF NOT EXISTS question_votes (
			question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
			user_id     TEXT NOT NULL,
			vote_type   SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
			created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (question_id, user_id)
		)
	`
	await sql`
		CREATE TABLE IF NOT EXISTS answer_votes (
			answer_id  INT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
			user_id    TEXT NOT NULL,
			vote_type  SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (answer_id, user_id)
		)
	`
	ensured = true
}

// ------------------------------- Helpers -------------------------------
export function parseTags(raw: unknown): string[] {
	if (!raw) return []
	if (Array.isArray(raw)) return raw.map((t) => String(t))
	try {
		const arr = JSON.parse(String(raw))
		return Array.isArray(arr) ? arr.map((t) => String(t)) : []
	} catch {
		return []
	}
}

export function normalizeTags(input: unknown): string[] {
	const arr = Array.isArray(input)
		? input
		: typeof input === "string"
			? input.split(",")
			: []
	const cleaned = arr
		.map((t) => String(t).trim().toLowerCase().slice(0, 40))
		.filter((t) => t.length > 0)
	return Array.from(new Set(cleaned)).slice(0, 8)
}

// ------------------------------- Types -------------------------------
export interface PublicQuestion {
	id: number
	schoolId: string | null
	title: string
	body: string
	tags: string[]
	authorName: string | null
	isAnonymous: boolean
	viewCount: number
	upvotes: number
	downvotes: number
	score: number
	status: ContentStatus
	isHidden: boolean
	answerCount: number
	isMine: boolean
	createdAt: string
}

export interface PublicAnswer {
	id: number
	questionId: number
	body: string
	authorName: string | null
	isAnonymous: boolean
	upvotes: number
	downvotes: number
	score: number
	status: ContentStatus
	isHidden: boolean
	isMine: boolean
	createdAt: string
}

export function toPublicQuestion(r: Record<string, any>, isAdmin: boolean, answerCount = 0, viewerId: string | null = null): PublicQuestion {
	const anon = Boolean(r.is_anonymous)
	const hidden = isHiddenFor(r.status, isAdmin)
	const up = Number(r.upvotes ?? 0)
	const down = Number(r.downvotes ?? 0)
	return {
		id: Number(r.id),
		schoolId: r.school_id ?? null,
		title: r.title,
		body: hidden ? MODERATION_PLACEHOLDER : r.body,
		tags: parseTags(r.tags),
		authorName: anon && !isAdmin ? null : (r.author_name ?? null),
		isAnonymous: anon,
		viewCount: Number(r.view_count ?? 0),
		upvotes: up,
		downvotes: down,
		score: up - down,
		status: (r.status ?? "visible") as ContentStatus,
		isHidden: hidden,
		answerCount: Number(answerCount ?? 0),
		isMine: Boolean(viewerId && String(r.user_id) === String(viewerId)),
		createdAt: r.created_at,
	}
}

export function toPublicAnswer(r: Record<string, any>, isAdmin: boolean, viewerId: string | null = null): PublicAnswer {
	const anon = Boolean(r.is_anonymous)
	const hidden = isHiddenFor(r.status, isAdmin)
	const up = Number(r.upvotes ?? 0)
	const down = Number(r.downvotes ?? 0)
	return {
		id: Number(r.id),
		questionId: Number(r.question_id),
		body: hidden ? MODERATION_PLACEHOLDER : r.body,
		authorName: anon && !isAdmin ? null : (r.author_name ?? null),
		isAnonymous: anon,
		upvotes: up,
		downvotes: down,
		score: up - down,
		status: (r.status ?? "visible") as ContentStatus,
		isHidden: hidden,
		isMine: Boolean(viewerId && String(r.user_id) === String(viewerId)),
		createdAt: r.created_at,
	}
}
