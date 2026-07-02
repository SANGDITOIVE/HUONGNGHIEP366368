// =============================================================
// DB persistence cho Discovery Journey — KHÔNG BẮT BUỘC.
// Mọi thao tác bọc try/catch: lỗi DB KHÔNG làm hỏng trải nghiệm
// (frontend vẫn chạy bằng localStorage). user_id = Google sub (NextAuth JWT).
// =============================================================
import { sql } from "@vercel/postgres"

let ensured = false

export async function ensureDjTables(): Promise<void> {
	if (ensured) return
	try {
		await sql`CREATE TABLE IF NOT EXISTS dj_layer1 (
			id BIGSERIAL PRIMARY KEY,
			user_id TEXT,
			riasec_json JSONB,
			aptitude_json JSONB,
			values_json JSONB,
			constraints_json JSONB,
			holland_code TEXT,
			hypotheses_json JSONB,
			source TEXT,
			created_at TIMESTAMPTZ DEFAULT now()
		)`
		await sql`CREATE TABLE IF NOT EXISTS dj_attempt (
			id BIGSERIAL PRIMARY KEY,
			user_id TEXT,
			task_id TEXT,
			cluster_id TEXT,
			submission TEXT,
			time_spent_sec INT,
			self_feeling INT,
			want_more INT,
			competence_score INT,
			interest_signal INT,
			grade_json JSONB,
			source TEXT,
			created_at TIMESTAMPTZ DEFAULT now()
		)`
		await sql`CREATE TABLE IF NOT EXISTS dj_task_cache (
			task_id TEXT PRIMARY KEY,
			cluster_id TEXT,
			spec_json JSONB,
			created_at TIMESTAMPTZ DEFAULT now()
		)`
		ensured = true
	} catch (e) {
		console.error("[dj/db] ensureDjTables skipped:", (e as Error)?.message)
	}
}

export async function saveLayer1(userId: string | null, payload: Record<string, unknown>): Promise<void> {
	try {
		await ensureDjTables()
		await sql`INSERT INTO dj_layer1 (user_id, riasec_json, aptitude_json, values_json, constraints_json, holland_code, hypotheses_json, source)
			VALUES (${userId}, ${JSON.stringify(payload.riasec ?? {})}, ${JSON.stringify(payload.aptitude ?? {})}, ${JSON.stringify(payload.values ?? {})}, ${JSON.stringify(payload.constraints ?? {})}, ${String(payload.hollandCode ?? "")}, ${JSON.stringify(payload.hypotheses ?? [])}, ${String(payload.source ?? "rule")})`
	} catch (e) {
		console.error("[dj/db] saveLayer1 skipped:", (e as Error)?.message)
	}
}

export async function saveAttempt(userId: string | null, payload: Record<string, unknown>): Promise<void> {
	try {
		await ensureDjTables()
		await sql`INSERT INTO dj_attempt (user_id, task_id, cluster_id, submission, time_spent_sec, self_feeling, want_more, competence_score, interest_signal, grade_json, source)
			VALUES (${userId}, ${String(payload.taskId ?? "")}, ${String(payload.clusterId ?? "")}, ${String(payload.submission ?? "")}, ${Number(payload.timeSpentSec ?? 0)}, ${Number(payload.selfFeeling ?? 0)}, ${Number(payload.wantMore ?? 0)}, ${Number(payload.competenceScore ?? 0)}, ${Number(payload.interestSignal ?? 0)}, ${JSON.stringify(payload.grade ?? {})}, ${String(payload.source ?? "rule")})`
	} catch (e) {
		console.error("[dj/db] saveAttempt skipped:", (e as Error)?.message)
	}
}

export async function getCachedTask(taskId: string): Promise<Record<string, unknown> | null> {
	try {
		await ensureDjTables()
		const { rows } = await sql`SELECT spec_json FROM dj_task_cache WHERE task_id = ${taskId} LIMIT 1`
		return rows.length ? (rows[0].spec_json as Record<string, unknown>) : null
	} catch (e) {
		console.error("[dj/db] getCachedTask skipped:", (e as Error)?.message)
		return null
	}
}

export async function cacheTask(taskId: string, clusterId: string, spec: Record<string, unknown>): Promise<void> {
	try {
		await ensureDjTables()
		await sql`INSERT INTO dj_task_cache (task_id, cluster_id, spec_json) VALUES (${taskId}, ${clusterId}, ${JSON.stringify(spec)})
			ON CONFLICT (task_id) DO UPDATE SET spec_json = EXCLUDED.spec_json`
	} catch (e) {
		console.error("[dj/db] cacheTask skipped:", (e as Error)?.message)
	}
}
