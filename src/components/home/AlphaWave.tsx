"use client"

import { useEffect, useRef } from "react"

// Hiệu ứng nền ở trang chủ: các dải uốn lượn màu vàng nhạt / trắng và
// các ký hiệu alpha (α) màu đỏ trải ngang. Khi cuộn xuống, dải sóng giãn
// rộng và hiện rõ dần (biến --p theo scroll). Tôn trọng prefers-reduced-motion.
export function AlphaWave() {
	const ref = useRef<HTMLDivElement>(null)

	useEffect(() => {
		const el = ref.current
		if (!el) return
		if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
			el.style.setProperty("--p", "1")
			return
		}
		let raf = 0
		const update = () => {
			const p = Math.max(0, Math.min(1, window.scrollY / 500))
			el.style.setProperty("--p", p.toFixed(3))
			raf = 0
		}
		const onScroll = () => {
			if (!raf) raf = window.requestAnimationFrame(update)
		}
		window.addEventListener("scroll", onScroll, { passive: true })
		update()
		return () => {
			window.removeEventListener("scroll", onScroll)
			if (raf) window.cancelAnimationFrame(raf)
		}
	}, [])

	return (
		<div ref={ref} className="alpha-wave" aria-hidden="true">
			<svg className="alpha-wave__svg" viewBox="0 0 1440 360" preserveAspectRatio="xMidYMid slice">
				<path
					className="alpha-wave__ribbon alpha-wave__ribbon--yellow"
					d="M-120,190 C180,70 420,310 720,190 S1260,70 1560,190"
				/>
				<path
					className="alpha-wave__ribbon alpha-wave__ribbon--white"
					d="M-120,220 C220,100 470,330 770,220 S1300,100 1560,220"
				/>
				<text className="alpha-wave__a alpha-wave__a--s1" x="120" y="215">α</text>
				<text className="alpha-wave__a alpha-wave__a--s2" x="430" y="160">α</text>
				<text className="alpha-wave__a alpha-wave__a--big" x="720" y="245">α</text>
				<text className="alpha-wave__a alpha-wave__a--s3" x="1010" y="160">α</text>
				<text className="alpha-wave__a alpha-wave__a--s4" x="1320" y="215">α</text>
			</svg>
		</div>
	)
}
