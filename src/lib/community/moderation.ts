// =============================================================
// LỚP KIỂM DUYỆT DÙNG CHUNG cho Survival Guide + Q&A.
// Cơ chế AUTO-MODERATION: mỗi nội dung (tip/reply/question/answer) khi nhận
// >= REPORT_THRESHOLD report ĐỘC LẬP (mỗi user chỉ tính 1 lần) sẽ tự động bị
// ẩn: status -> 'pending_review'. Khi hiển thị cho người thường, nội dung thật
// được thay bằng MODERATION_PLACEHOLDER. Chỉ admin mới thấy nội dung gốc.
// =============================================================
import { sql } from "@vercel/postgres"

export const REPORT_THRESHOLD = 5
export const MODERATION_PLACEHOLDER = "[Nội dung đang được kiểm duyệt]"

export type ContentStatus = "visible" | "pending_review" | "removed"
export type ReportTargetType = "survival_tip" | "survival_reply" | "question" | "answer"

const VALID_TARGETS: ReportTargetType[] = [
	"survival_tip",
	"survival_reply",
	"question",
	"answer",
]

export function isValidReportTarget(t: string): t is ReportTargetType {
	return (VALID_TARGETS as string[]).includes(t)
}

/** Nội dung có bị ẩn với người xem hiện tại không (admin luôn thấy nội dung gốc). */
export function isHiddenFor(status: string | null | undefined, isAdmin: boolean): boolean {
	return !isAdmin && status !== "visible" && status != null
}

let reportsEnsured = false
export async function ensureReportsTable(): Promise<void> {
	if (reportsEnsured) return
	await sql`
		CREATE TABLE IF NOT EXISTS content_reports (
			id          SERIAL PRIMARY KEY,
			target_type VARCHAR(30) NOT NULL,
			target_id   INT NOT NULL,
			user_id     TEXT NOT NULL,
			reason      TEXT,
			created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT uq_report UNIQUE (target_type, target_id, user_id)
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_reports_target ON content_reports (target_type, target_id)`
	reportsEnsured = true
}

// Set 'pending_review' đúng bảng theo target (tên bảng KHÔNG tham số hoá được
// với template tag sql nên phải switch từng câu lệnh tường minh).
async function setPendingReview(targetType: ReportTargetType, targetId: number): Promise<void> {
	switch (targetType) {
		case "survival_tip":
			await sql`UPDATE survival_tips SET status = 'pending_review' WHERE id = ${targetId} AND status = 'visible'`
			return
		case "survival_reply":
			await sql`UPDATE survival_tip_replies SET status = 'pending_review' WHERE id = ${targetId} AND status = 'visible'`
			return
		case "question":
			await sql`UPDATE questions SET status = 'pending_review' WHERE id = ${targetId} AND status = 'visible'`
			return
		case "answer":
			await sql`UPDATE answers SET status = 'pending_review' WHERE id = ${targetId} AND status = 'visible'`
			return
	}
}

/**
 * Ghi 1 report (idempotent theo user) rồi tự ẩn nếu chạm ngưỡng.
 * Trả về số report hiện tại + đã bị ẩn hay chưa.
 */
export async function reportContent(args: {
	targetType: ReportTargetType
	targetId: number
	userId: string
	reason?: string | null
}): Promise<{ reportCount: number; hidden: boolean }> {
	const { targetType, targetId, userId } = args
	const reason = (args.reason ?? null) ? String(args.reason).slice(0, 500) : null

	await ensureReportsTable()
	await sql`
		INSERT INTO content_reports (target_type, target_id, user_id, reason)
		VALUES (${targetType}, ${targetId}, ${userId}, ${reason})
		ON CONFLICT (target_type, target_id, user_id) DO NOTHING
	`
	const res = await sql`
		SELECT COUNT(*)::int AS c FROM content_reports
		WHERE target_type = ${targetType} AND target_id = ${targetId}
	`
	const reportCount = Number(res.rows[0]?.c ?? 0)
	const hidden = reportCount >= REPORT_THRESHOLD
	if (hidden) await setPendingReview(targetType, targetId)
	return { reportCount, hidden }
}
