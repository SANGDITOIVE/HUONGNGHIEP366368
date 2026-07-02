"use client"

import { useEffect } from "react"
import { trackMany } from "@/lib/personalization/tracker"
import type { InterestDimension } from "@/lib/personalization/interests"

// Component "vô hình" (render null): mount trên trang ngành/trường để ghi nhận
// hành vi xem vào hồ sơ sở thích (localStorage + server nếu đăng nhập).
// Ví dụ: <TrackView dim="field" keys={[fieldId]} /> trên trang ngành.
export function TrackView({
	dim,
	keys,
	weight = 1,
}: {
	dim: InterestDimension
	keys: string[]
	weight?: number
}) {
	const signature = keys.join("|")
	useEffect(() => {
		if (keys.length > 0) trackMany(dim, keys, weight)
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [dim, signature, weight])
	return null
}
