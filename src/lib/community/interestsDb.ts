// =============================================================
// LỚP DỮ LIỆU SỞ THÍCH NGƯỜI DÙNG (cá nhân hoá đa thiết bị).
// Lưu trọng số hành vi theo (user_id, dimension, key). user_id = Google sub.
// Không FK cứng (đồng bộ triết lý với community/db.ts). Idempotent qua ensure*.
// =============================================================
import { sql } from "@vercel/postgres"
import {
	type InterestProfile,
	type InterestDimension,
	emptyProfile,
} from "@/lib/personalization/interests"

const DIMENSIONS: InterestDimension[] = ["school", "field", "tag"]

let ensured = false
export async function ensureInterestTables(): Promise<void> {
	if (ensured) return
	await sql`
		CREATE TABLE IF NOT EXISTS user_interests (
			user_id    TEXT NOT NULL,
			dimension  VARCHAR(20) NOT NULL,
			key        VARCHAR(160) NOT NULL,
			weight     DOUBLE PRECISION NOT NULL DEFAULT 0,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			PRIMARY KEY (user_id, dimension, key)
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_user_interests_user ON user_interests (user_id)`
	ensured = true
}

function isValidDimension(v: string): v is InterestDimension {
	return DIMENSIONS.includes(v as InterestDimension)
}

/** Cộng dồn trọng số cho 1 sở thích. Trả về false nếu dimension không hợp lệ. */
export async function bumpInterest(
	userId: string,
	dimension: string,
	key: string,
	weight: number,
): Promise<boolean> {
	if (!isValidDimension(dimension)) return false
	const k = (key ?? "").trim().slice(0, 160)
	if (!k) return false
	const w = Number.isFinite(weight) ? Math.max(-5, Math.min(5, weight)) : 1
	await ensureInterestTables()
	await sql`
		INSERT INTO user_interests (user_id, dimension, key, weight, updated_at)
		VALUES (${userId}, ${dimension}, ${k}, ${w}, CURRENT_TIMESTAMP)
		ON CONFLICT (user_id, dimension, key)
		DO UPDATE SET weight = user_interests.weight + ${w}, updated_at = CURRENT_TIMESTAMP
	`
	return true
}

/** Đọc toàn bộ hồ sơ sở thích của 1 user thành InterestProfile. */
export async function getUserProfile(userId: string): Promise<InterestProfile> {
	const profile = emptyProfile()
	if (!userId) return profile
	try {
		await ensureInterestTables()
		const { rows } = await sql`
			SELECT dimension, key, weight FROM user_interests
			WHERE user_id = ${userId} AND weight > 0
			ORDER BY weight DESC LIMIT 500`
		for (const r of rows) {
			const dim = String(r.dimension)
			if (!isValidDimension(dim)) continue
			profile[dim][String(r.key)] = Number(r.weight ?? 0)
		}
	} catch (err) {
		console.error("[interestsDb] getUserProfile failed", err)
	}
	return profile
}
