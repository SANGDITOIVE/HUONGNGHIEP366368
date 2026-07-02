import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import {
	getTargetOwner,
	insertComment,
	listCommentsForAnswer,
	upsertAppUser,
} from "@/lib/community/socialDb"
import { createNotification } from "@/lib/community/notificationsDb"

function isAdminRole(role?: string | null): boolean {
	return role === "ADMIN" || role === "SUPER_ADMIN"
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
	const answerId = Number(params.id)
	if (!Number.isFinite(answerId)) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })
	const session = await getServerSession(authOptions)
	const viewer = session?.user as { id?: string; role?: string } | undefined
	const comments = await listCommentsForAnswer(answerId, viewer?.id ?? null, isAdminRole(viewer?.role))
	return NextResponse.json({ ok: true, comments })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
	const answerId = Number(params.id)
	if (!Number.isFinite(answerId)) return NextResponse.json({ ok: false, error: "INVALID_ID" }, { status: 400 })

	const session = await getServerSession(authOptions)
	const user = session?.user as { id?: string; name?: string; email?: string } | undefined
	if (!user?.id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	let payload: Record<string, unknown>
	try {
		payload = (await req.json()) as Record<string, unknown>
	} catch {
		return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 })
	}

	const body = String(payload.body ?? "").trim()
	if (body.length < 1) return NextResponse.json({ ok: false, error: "EMPTY" }, { status: 400 })
	if (body.length > 2000) return NextResponse.json({ ok: false, error: "TOO_LONG" }, { status: 400 })
	const isAnonymous = !!payload.isAnonymous
	const parentCommentId = payload.parentCommentId != null ? Number(payload.parentCommentId) : null
	const mentions: string[] = Array.isArray(payload.mentions)
		? (payload.mentions as unknown[]).map((x) => String(x)).slice(0, 20)
		: []

	await upsertAppUser(user.id, user.email, user.name)
	const row = await insertComment({
		answerId,
		parentCommentId,
		body,
		userId: user.id,
		authorName: user.name ?? null,
		isAnonymous,
	})

	const actorLabel = isAnonymous ? "Một người dùng ẩn danh" : user.name ?? "Ai đó"
	const actorName = isAnonymous ? null : user.name ?? null
	const preview = body.slice(0, 140)

	try {
		const notified = new Set<string>([String(user.id)])
		const ownerAnswer = await getTargetOwner("answer", answerId)
		const link = ownerAnswer?.link ?? "/hoi-dap"
		if (ownerAnswer?.userId && !notified.has(String(ownerAnswer.userId))) {
			await createNotification({
				userId: ownerAnswer.userId,
				type: "comment_on_answer",
				title: `${actorLabel} đã bình luận về câu trả lời của bạn`,
				body: preview,
				link,
				actorName,
			})
			notified.add(String(ownerAnswer.userId))
		}
		if (parentCommentId) {
			const ownerParent = await getTargetOwner("comment", parentCommentId)
			if (ownerParent?.userId && !notified.has(String(ownerParent.userId))) {
				await createNotification({
					userId: ownerParent.userId,
					type: "reply_on_comment",
					title: `${actorLabel} đã trả lời bình luận của bạn`,
					body: preview,
					link: ownerParent.link ?? link,
					actorName,
				})
				notified.add(String(ownerParent.userId))
			}
		}
		for (const mid of mentions) {
			if (notified.has(String(mid))) continue
			await createNotification({
				userId: mid,
				type: "mention",
				title: `${actorLabel} đã nhắc đến bạn trong một bình luận`,
				body: preview,
				link,
				actorName,
			})
			notified.add(String(mid))
		}
	} catch (err) {
		console.error("comment notify failed", err)
	}

	const createdAt = row.created_at instanceof Date ? row.created_at.toISOString() : String(row.created_at)
	const comment = {
		id: Number(row.id),
		answerId: Number(row.answer_id),
		parentCommentId: row.parent_comment_id != null ? Number(row.parent_comment_id) : null,
		body: String(row.body ?? ""),
		authorName: (row.author_name as string) ?? null,
		isAnonymous: !!row.is_anonymous,
		isMine: true,
		isHidden: false,
		status: (row.status as string) ?? "visible",
		createdAt,
		reactions: { counts: { like: 0, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 }, total: 0, mine: null },
	}
	return NextResponse.json({ ok: true, comment })
}
