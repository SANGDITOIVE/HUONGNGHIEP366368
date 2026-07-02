import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import {
	REACTION_KINDS,
	SOCIAL_TARGET_TYPES,
	getReactionSummary,
	getTargetOwner,
	setReaction,
	upsertAppUser,
	type ReactionKind,
	type SocialTargetType,
} from "@/lib/community/socialDb"
import { createNotification } from "@/lib/community/notificationsDb"

const REACTION_LABEL: Record<ReactionKind, string> = {
	like: "Thích",
	love: "Yêu",
	haha: "Haha",
	wow: "Wow",
	sad: "Buồn",
	angry: "Phẫn nộ",
}

export async function GET(req: NextRequest) {
	const targetType = req.nextUrl.searchParams.get("targetType") as SocialTargetType | null
	const targetId = Number(req.nextUrl.searchParams.get("targetId"))
	if (!targetType || !SOCIAL_TARGET_TYPES.includes(targetType) || !Number.isFinite(targetId)) {
		return NextResponse.json({ ok: false, error: "INVALID" }, { status: 400 })
	}
	const session = await getServerSession(authOptions)
	const viewerId = (session?.user as { id?: string } | undefined)?.id ?? null
	const summary = await getReactionSummary(targetType, targetId, viewerId)
	return NextResponse.json({ ok: true, summary })
}

export async function POST(req: NextRequest) {
	const session = await getServerSession(authOptions)
	const user = session?.user as { id?: string; name?: string; email?: string } | undefined
	if (!user?.id) return NextResponse.json({ ok: false, error: "UNAUTHORIZED" }, { status: 401 })

	let payload: Record<string, unknown>
	try {
		payload = (await req.json()) as Record<string, unknown>
	} catch {
		return NextResponse.json({ ok: false, error: "BAD_JSON" }, { status: 400 })
	}

	const targetType = payload.targetType as SocialTargetType
	const targetId = Number(payload.targetId)
	const reaction = (payload.reaction ?? null) as ReactionKind | null
	if (!SOCIAL_TARGET_TYPES.includes(targetType) || !Number.isFinite(targetId)) {
		return NextResponse.json({ ok: false, error: "INVALID" }, { status: 400 })
	}
	if (reaction !== null && !REACTION_KINDS.includes(reaction)) {
		return NextResponse.json({ ok: false, error: "INVALID_REACTION" }, { status: 400 })
	}

	await upsertAppUser(user.id, user.email, user.name)
	const changed = await setReaction(targetType, targetId, user.id, reaction)

	if ((changed === "added" || changed === "changed") && reaction) {
		try {
			const owner = await getTargetOwner(targetType, targetId)
			if (owner?.userId && String(owner.userId) !== String(user.id)) {
				await createNotification({
					userId: owner.userId,
					type: "reaction",
					title: `${user.name ?? "Ai đó"} đã bày tỏ cảm xúc "${REACTION_LABEL[reaction]}" về ${owner.label}`,
					link: owner.link,
					actorName: user.name ?? null,
				})
			}
		} catch (err) {
			console.error("reaction notify failed", err)
		}
	}

	const summary = await getReactionSummary(targetType, targetId, user.id)
	return NextResponse.json({ ok: true, summary, changed })
}
