"use client"

// Dynamic import ssr:false — bắt buộc với Leaflet (truy cập window khi render).
import dynamic from "next/dynamic"

const CareerMap = dynamic(() => import("./CareerMap").then((m) => m.CareerMap), {
	ssr: false,
	loading: () => (
		<div className="flex h-[72vh] items-center justify-center rounded-xl border text-sm text-slate-500">
			Đang tải bản đồ tương tác…
		</div>
	),
})

export function CareerMapClient() {
	return <CareerMap />
}
