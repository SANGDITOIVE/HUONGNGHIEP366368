"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"

type Particle = {
	id: number
	left: number
	size: number
	delay: number
	duration: number
	drift: number
	rise: number
}

/**
 * Hat bui li ti bay len nhe nhang quanh quyen vo.
 * Sinh ngau nhien trong useEffect (chi chay o client) de tranh lech hydration.
 */
export function Particles({ count = 20 }: { count?: number }) {
	const [items, setItems] = useState<Particle[]>([])

	useEffect(() => {
		setItems(
			Array.from({ length: count }, (_, i) => ({
				id: i,
				left: Math.random() * 100,
				size: 2 + Math.random() * 4,
				delay: Math.random() * 5,
				duration: 7 + Math.random() * 9,
				drift: (Math.random() - 0.5) * 60,
				rise: 180 + Math.random() * 160,
			})),
		)
	}, [count])

	return (
		<div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
			{items.map((p) => (
				<motion.span
					key={p.id}
					className="absolute rounded-full bg-primary/30"
					style={ { left: `${p.left}%`, bottom: -12, width: p.size, height: p.size } }
					initial={ { opacity: 0, y: 0, x: 0 } }
					animate={ { opacity: [0, 0.7, 0], y: -p.rise, x: p.drift } }
					transition={ { duration: p.duration, delay: p.delay, repeat: Infinity, ease: "easeInOut" } }
				/>
			))}
		</div>
	)
}
