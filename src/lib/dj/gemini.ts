// =============================================================
// GEMINI CLIENT — gọi REST trực tiếp (KHÔNG cần cài thêm package).
// NẾU thiếu GEMINI_API_KEY -> trả null để caller dùng fallback rule-based.
// => Hệ thống chạy được ngay cả khi chưa gắn API. Gắn key là chạy "xịn".
// =============================================================

const BASE = "https://generativelanguage.googleapis.com/v1beta/models"

export function geminiEnabled(): boolean {
	return !!process.env.GEMINI_API_KEY
}

function modelFor(hard: boolean): string {
	if (hard) return process.env.GEMINI_MODEL_HARD || "gemini-2.5-flash"
	return process.env.GEMINI_MODEL || "gemini-2.5-flash-lite"
}

export interface GeminiJsonOptions {
	hard?: boolean
	responseSchema?: Record<string, unknown>
	temperature?: number
}

// Trả object JSON đã parse, hoặc null nếu không có key / lỗi.
export async function geminiJson<T = unknown>(
	prompt: string,
	opts: GeminiJsonOptions = {},
): Promise<T | null> {
	const key = process.env.GEMINI_API_KEY
	if (!key) return null
	const model = modelFor(!!opts.hard)
	const url = `${BASE}/${model}:generateContent?key=${key}`
	const generationConfig: Record<string, unknown> = {
		responseMimeType: "application/json",
		temperature: opts.temperature ?? 0.7,
	}
	if (opts.responseSchema) generationConfig.responseSchema = opts.responseSchema
	try {
		const controller = new AbortController()
		const timeout = setTimeout(() => controller.abort(), 25000)
		const res = await fetch(url, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				contents: [{ role: "user", parts: [{ text: prompt }] }],
				generationConfig,
			}),
			signal: controller.signal,
		})
		clearTimeout(timeout)
		if (!res.ok) {
			console.error("[dj/gemini] HTTP", res.status, await res.text().catch(() => ""))
			return null
		}
		const data = (await res.json()) as any
		const text: string | undefined =
			data?.candidates?.[0]?.content?.parts?.map((p: any) => p?.text).filter(Boolean).join("\n")
		if (!text) return null
		return safeParseJson<T>(text)
	} catch (e) {
		console.error("[dj/gemini] error", e)
		return null
	}
}

// Parse JSON chịu được rác quanh (```json ... ``` hoặc text thừa).
export function safeParseJson<T = unknown>(raw: string): T | null {
	if (!raw) return null
	let s = raw.trim()
	// bỏ fence code
	if (s.startsWith("```")) {
		s = s.replace(/^```(json)?/i, "").replace(/```$/,"").trim()
	}
	try {
		return JSON.parse(s) as T
	} catch {}
	// thử cắt từ { đầu tiên đến } cuối cùng
	const first = s.indexOf("{")
	const last = s.lastIndexOf("}")
	if (first >= 0 && last > first) {
		try {
			return JSON.parse(s.slice(first, last + 1)) as T
		} catch {}
	}
	// thử mảng
	const fa = s.indexOf("[")
	const la = s.lastIndexOf("]")
	if (fa >= 0 && la > fa) {
		try {
			return JSON.parse(s.slice(fa, la + 1)) as T
		} catch {}
	}
	return null
}
