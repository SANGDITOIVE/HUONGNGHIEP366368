// POST /api/dj/task — trả đề micro-task cho 1 cụm.
// Thứ tự: cache DB -> Gemini sinh (nếu có key) -> đề mẫu tĩnh.
import { NextResponse } from "next/server"
import { getTaskByCluster } from "@/data/dj/tasks"
import { getCluster } from "@/data/dj/clusters"
import { geminiJson } from "@/lib/dj/gemini"
import { promptGenerateTask } from "@/lib/dj/prompts"
import { getCachedTask, cacheTask } from "@/lib/dj/db"
import type { TaskSpec } from "@/lib/dj/types"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

function isValidTask(t: any): t is TaskSpec {
	return (
		t && typeof t.title === "string" && typeof t.scenario === "string" &&
		Array.isArray(t.rubric) && t.rubric.length > 0 &&
		["essay", "choice", "steps", "design_brief"].includes(t.deliverable_format)
	)
}

export async function POST(req: Request) {
	try {
		const body = await req.json().catch(() => ({}))
		const clusterId = String(body?.clusterId ?? "")
		const cluster = getCluster(clusterId)
		const fallback = getTaskByCluster(clusterId)
		if (!cluster || !fallback) {
			return NextResponse.json({ error: "unknown_cluster" }, { status: 400 })
		}

		// 1) cache
		const cached = await getCachedTask(fallback.task_id)
		if (cached && isValidTask(cached)) {
			return NextResponse.json({ task: cached, source: "cache" })
		}

		// 2) Gemini sinh biến thể (nếu có key)
		const ai = await geminiJson<TaskSpec>(promptGenerateTask(clusterId, cluster.name, fallback), {
			hard: false,
			temperature: 0.9,
		})
		if (isValidTask(ai)) {
			const task: TaskSpec = { ...ai, task_id: fallback.task_id, cluster_id: clusterId }
			void cacheTask(task.task_id, clusterId, task as unknown as Record<string, unknown>)
			return NextResponse.json({ task, source: "ai" })
		}

		// 3) đề mẫu tĩnh
		return NextResponse.json({ task: fallback, source: "static" })
	} catch (e) {
		console.error("[api/dj/task]", e)
		return NextResponse.json({ error: "task_failed" }, { status: 500 })
	}
}
