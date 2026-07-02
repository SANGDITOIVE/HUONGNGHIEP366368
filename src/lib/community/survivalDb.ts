// =============================================================
// LỚP DỮ LIỆU SURVIVAL GUIDE (wiki cộng đồng theo trường).
// Tự tạo bảng (idempotent). Không FK cứng sang users. Xem đặc tả SQL ở
// scripts/survival-qa-schema.sql. Danh mục category dùng chung file
// survivalCategories.ts (an toàn cho client).
// =============================================================
import { sql } from "@vercel/postgres"
import {
	MODERATION_PLACEHOLDER,
	isHiddenFor,
	type ContentStatus,
} from "@/lib/community/moderation"

export { sql }
export {
	SURVIVAL_CATEGORIES,
	isValidCategory,
	categoryLabel,
	type SurvivalCategory,
} from "@/lib/community/survivalCategories"

let ensured = false
export async function ensureSurvivalTables(): Promise<void> {
	if (ensured) return
	await sql`
		CREATE TABLE IF NOT EXISTS survival_tips (
			id             SERIAL PRIMARY KEY,
			school_id      VARCHAR(100) NOT NULL,
			category       VARCHAR(20)  NOT NULL CHECK (category IN ('checklist','mistakes','food','housing','intern','general')),
			content        TEXT NOT NULL,
			author_user_id TEXT,
			author_name    TEXT,
			is_anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
			upvotes        INT NOT NULL DEFAULT 0,
			trust_score    INT NOT NULL DEFAULT 0,
			status         VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
			created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_survival_school ON survival_tips (school_id)`
	await sql`CREATE INDEX IF NOT EXISTS idx_survival_school_cat ON survival_tips (school_id, category)`
	await sql`
		CREATE TABLE IF NOT EXISTS survival_tip_votes (
			tip_id     INT NOT NULL REFERENCES survival_tips(id) ON DELETE CASCADE,
			user_id    TEXT NOT NULL,
			value      SMALLINT NOT NULL DEFAULT 1 CHECK (value = 1),
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (tip_id, user_id)
		)
	`
	await sql`
		CREATE TABLE IF NOT EXISTS survival_tip_replies (
			id           SERIAL PRIMARY KEY,
			tip_id       INT NOT NULL REFERENCES survival_tips(id) ON DELETE CASCADE,
			user_id      TEXT,
			author_name  TEXT,
			is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
			content      TEXT NOT NULL,
			status       VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
			created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_survival_reply_tip ON survival_tip_replies (tip_id)`
	ensured = true
}

// ------------------------------- Types -------------------------------
export interface PublicSurvivalTip {
	id: number
	schoolId: string
	category: string
	content: string
	authorName: string | null
	isAnonymous: boolean
	upvotes: number
	trustScore: number
	status: ContentStatus
	isHidden: boolean
	replyCount: number
	createdAt: string
}

export interface PublicSurvivalReply {
	id: number
	tipId: number
	content: string
	authorName: string | null
	isAnonymous: boolean
	status: ContentStatus
	isHidden: boolean
	createdAt: string
}

export function toPublicTip(r: Record<string, any>, isAdmin: boolean, replyCount = 0): PublicSurvivalTip {
	const anon = Boolean(r.is_anonymous)
	const hidden = isHiddenFor(r.status, isAdmin)
	return {
		id: Number(r.id),
		schoolId: r.school_id,
		category: r.category,
		content: hidden ? MODERATION_PLACEHOLDER : r.content,
		authorName: anon && !isAdmin ? null : (r.author_name ?? null),
		isAnonymous: anon,
		upvotes: Number(r.upvotes ?? 0),
		trustScore: Number(r.trust_score ?? 0),
		status: (r.status ?? "visible") as ContentStatus,
		isHidden: hidden,
		replyCount: Number(replyCount ?? 0),
		createdAt: r.created_at,
	}
}

export function toPublicReply(r: Record<string, any>, isAdmin: boolean): PublicSurvivalReply {
	const anon = Boolean(r.is_anonymous)
	const hidden = isHiddenFor(r.status, isAdmin)
	return {
		id: Number(r.id),
		tipId: Number(r.tip_id),
		content: hidden ? MODERATION_PLACEHOLDER : r.content,
		authorName: anon && !isAdmin ? null : (r.author_name ?? null),
		isAnonymous: anon,
		status: (r.status ?? "visible") as ContentStatus,
		isHidden: hidden,
		createdAt: r.created_at,
	}
}
