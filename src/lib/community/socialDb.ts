import { sql } from "@vercel/postgres"
import { isHiddenFor, MODERATION_PLACEHOLDER } from "@/lib/community/moderation"

export { sql }

// ===== Kiểu dữ liệu =====
export type ReactionKind = "like" | "love" | "haha" | "wow" | "sad" | "angry"
export const REACTION_KINDS: ReactionKind[] = ["like", "love", "haha", "wow", "sad", "angry"]

export type SocialTargetType = "question" | "answer" | "comment"
export const SOCIAL_TARGET_TYPES: SocialTargetType[] = ["question", "answer", "comment"]

export interface ReactionSummary {
	counts: Record<ReactionKind, number>
	total: number
	mine: ReactionKind | null
}

export interface PublicComment {
	id: number
	answerId: number
	parentCommentId: number | null
	body: string
	authorName: string | null
	isAnonymous: boolean
	isMine: boolean
	isHidden: boolean
	status: string
	createdAt: string
	reactions: ReactionSummary
}

export interface DirectoryUser {
	id: string
	name: string
	email: string | null
}

export function emptyReactionSummary(): ReactionSummary {
	return { counts: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }, total: 0, mine: null }
}

// ===== Migration tự chạy (KHÔNG đụng bảng cũ) =====
let ensured = false
export async function ensureSocialTables(): Promise<void> {
	if (ensured) return
	await sql`CREATE TABLE IF NOT EXISTS reactions (
		id SERIAL PRIMARY KEY,
		target_type TEXT NOT NULL,
		target_id INTEGER NOT NULL,
		user_id TEXT NOT NULL,
		reaction TEXT NOT NULL,
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`
	await sql`CREATE UNIQUE INDEX IF NOT EXISTS reactions_unique_idx ON reactions (target_type, target_id, user_id)`
	await sql`CREATE INDEX IF NOT EXISTS reactions_target_idx ON reactions (target_type, target_id)`

	await sql`CREATE TABLE IF NOT EXISTS answer_comments (
		id SERIAL PRIMARY KEY,
		answer_id INTEGER NOT NULL,
		parent_comment_id INTEGER,
		body TEXT NOT NULL,
		user_id TEXT,
		author_name TEXT,
		is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
		status TEXT NOT NULL DEFAULT 'visible',
		created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`
	await sql`CREATE INDEX IF NOT EXISTS answer_comments_answer_idx ON answer_comments (answer_id)`

	await sql`CREATE TABLE IF NOT EXISTS app_users (
		user_id TEXT PRIMARY KEY,
		email TEXT,
		name TEXT,
		updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`
	await sql`CREATE INDEX IF NOT EXISTS app_users_name_idx ON app_users (lower(name))`
	await sql`CREATE INDEX IF NOT EXISTS app_users_email_idx ON app_users (lower(email))`

	ensured = true
}

// ===== Danh bạ người dùng (để tag @) =====
export async function upsertAppUser(userId?: string | null, email?: string | null, name?: string | null): Promise<void> {
	if (!userId) return
	try {
		await ensureSocialTables()
		await sql`INSERT INTO app_users (user_id, email, name, updated_at)
			VALUES (${userId}, ${email ?? null}, ${name ?? null}, NOW())
			ON CONFLICT (user_id) DO UPDATE SET email = EXCLUDED.email, name = EXCLUDED.name, updated_at = NOW()`
	} catch (err) {
		console.error("upsertAppUser failed", err)
	}
}

export async function searchAppUsers(query: string, limit = 8): Promise<DirectoryUser[]> {
	const q = query.trim().toLowerCase()
	if (!q) return []
	await ensureSocialTables()
	const term = `%${q}%`
	const { rows } = await sql`SELECT user_id, name, email FROM app_users
		WHERE lower(name) LIKE ${term} OR lower(email) LIKE ${term}
		ORDER BY updated_at DESC LIMIT ${limit}`
	return rows.map((r: Record<string, unknown>) => ({
		id: String(r.user_id),
		name: (r.name as string) ?? "Người dùng HoaTieu",
		email: (r.email as string) ?? null,
	}))
}

// ===== Reactions =====
export async function getReactionSummaries(
	targetType: SocialTargetType,
	targetIds: number[],
	viewerId: string | null,
): Promise<Map<number, ReactionSummary>> {
	const map = new Map<number, ReactionSummary>()
	for (const id of targetIds) map.set(id, emptyReactionSummary())
	if (targetIds.length === 0) return map
	await ensureSocialTables()
	const { rows } = await sql`SELECT target_id, reaction, user_id FROM reactions
		WHERE target_type = ${targetType} AND target_id = ANY(${targetIds}::int[])`
	for (const r of rows as Array<Record<string, unknown>>) {
		const tid = Number(r.target_id)
		const summary = map.get(tid)
		if (!summary) continue
		const kind = r.reaction as ReactionKind
		if (!REACTION_KINDS.includes(kind)) continue
		summary.counts[kind] = (summary.counts[kind] ?? 0) + 1
		summary.total += 1
		if (viewerId && String(r.user_id) === String(viewerId)) summary.mine = kind
	}
	return map
}

export async function getReactionSummary(
	targetType: SocialTargetType,
	targetId: number,
	viewerId: string | null,
): Promise<ReactionSummary> {
	const map = await getReactionSummaries(targetType, [targetId], viewerId)
	return map.get(targetId) ?? emptyReactionSummary()
}

export type ReactionChange = "added" | "removed" | "changed" | "none"

export async function setReaction(
	targetType: SocialTargetType,
	targetId: number,
	userId: string,
	reaction: ReactionKind | null,
): Promise<ReactionChange> {
	await ensureSocialTables()
	const { rows } = await sql`SELECT reaction FROM reactions
		WHERE target_type = ${targetType} AND target_id = ${targetId} AND user_id = ${userId}`
	const existing = rows[0]?.reaction as ReactionKind | undefined
	if (reaction === null || existing === reaction) {
		if (existing) {
			await sql`DELETE FROM reactions WHERE target_type = ${targetType} AND target_id = ${targetId} AND user_id = ${userId}`
			return "removed"
		}
		return "none"
	}
	if (existing) {
		await sql`UPDATE reactions SET reaction = ${reaction}, created_at = NOW()
			WHERE target_type = ${targetType} AND target_id = ${targetId} AND user_id = ${userId}`
		return "changed"
	}
	await sql`INSERT INTO reactions (target_type, target_id, user_id, reaction)
		VALUES (${targetType}, ${targetId}, ${userId}, ${reaction})`
	return "added"
}

// ===== Bình luận =====
function toPublicComment(
	r: Record<string, unknown>,
	isAdmin: boolean,
	viewerId: string | null,
	summary?: ReactionSummary,
): PublicComment {
	const status = (r.status as string) ?? "visible"
	const hidden = isHiddenFor(status, isAdmin)
	const createdAt = r.created_at instanceof Date ? r.created_at.toISOString() : String(r.created_at)
	return {
		id: Number(r.id),
		answerId: Number(r.answer_id),
		parentCommentId: r.parent_comment_id != null ? Number(r.parent_comment_id) : null,
		body: hidden ? MODERATION_PLACEHOLDER : String(r.body ?? ""),
		authorName: (r.author_name as string) ?? null,
		isAnonymous: !!r.is_anonymous,
		isMine: viewerId != null && r.user_id != null && String(r.user_id) === String(viewerId),
		isHidden: hidden,
		status,
		createdAt,
		reactions: summary ?? emptyReactionSummary(),
	}
}

export async function listCommentsForAnswer(
	answerId: number,
	viewerId: string | null,
	isAdmin: boolean,
): Promise<PublicComment[]> {
	await ensureSocialTables()
	const { rows } = await sql`SELECT * FROM answer_comments WHERE answer_id = ${answerId} ORDER BY created_at ASC`
	const ids = rows.map((r: Record<string, unknown>) => Number(r.id))
	const reactMap = await getReactionSummaries("comment", ids, viewerId)
	return rows.map((r: Record<string, unknown>) => toPublicComment(r, isAdmin, viewerId, reactMap.get(Number(r.id))))
}

export async function insertComment(input: {
	answerId: number
	parentCommentId?: number | null
	body: string
	userId: string
	authorName: string | null
	isAnonymous: boolean
}): Promise<Record<string, unknown>> {
	await ensureSocialTables()
	const { rows } = await sql`INSERT INTO answer_comments
		(answer_id, parent_comment_id, body, user_id, author_name, is_anonymous, status)
		VALUES (${input.answerId}, ${input.parentCommentId ?? null}, ${input.body}, ${input.userId}, ${input.authorName}, ${input.isAnonymous}, 'visible')
		RETURNING *`
	return rows[0] as Record<string, unknown>
}

export async function softDeleteComment(
	id: number,
	viewerId: string,
	isAdmin: boolean,
): Promise<{ ok: boolean; notFound?: boolean; forbidden?: boolean }> {
	await ensureSocialTables()
	const { rows } = await sql`SELECT user_id FROM answer_comments WHERE id = ${id}`
	if (rows.length === 0) return { ok: false, notFound: true }
	const owner = rows[0].user_id
	if (!isAdmin && String(owner) !== String(viewerId)) return { ok: false, forbidden: true }
	await sql`UPDATE answer_comments SET status = 'removed' WHERE id = ${id}`
	return { ok: true }
}

// ===== Tra chủ sở hữu của một target (để bắn thông báo) =====
export async function getTargetOwner(
	targetType: SocialTargetType,
	targetId: number,
): Promise<{ userId: string | null; link: string; label: string } | null> {
	await ensureSocialTables()
	if (targetType === "question") {
		const { rows } = await sql`SELECT user_id, title FROM questions WHERE id = ${targetId}`
		if (!rows[0]) return null
		return { userId: (rows[0].user_id as string) ?? null, link: `/hoi-dap/${targetId}`, label: "câu hỏi của bạn" }
	}
	if (targetType === "answer") {
		const { rows } = await sql`SELECT user_id, question_id FROM answers WHERE id = ${targetId}`
		if (!rows[0]) return null
		return { userId: (rows[0].user_id as string) ?? null, link: `/hoi-dap/${rows[0].question_id}`, label: "câu trả lời của bạn" }
	}
	const { rows } = await sql`SELECT c.user_id AS uid, a.question_id AS qid
		FROM answer_comments c JOIN answers a ON a.id = c.answer_id WHERE c.id = ${targetId}`
	if (!rows[0]) return null
	return { userId: (rows[0].uid as string) ?? null, link: `/hoi-dap/${rows[0].qid}`, label: "bình luận của bạn" }
}
