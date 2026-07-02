"use client"

import { SelectableChip } from "@/components/ui/SelectableChip"
import type { Option } from "@/data/taxonomies"

interface MultiSelectGroupProps<T extends string> {
	options: Option<T>[]
	value: T[]
	onChange: (next: T[]) => void
	max?: number
}

export function MultiSelectGroup<T extends string>({
	options, value, onChange, max,
}: MultiSelectGroupProps<T>) {
	const toggle = (id: T) => {
		if (value.includes(id)) {
			onChange(value.filter((v) => v !== id))
		} else {
			if (max && value.length >= max) return
			onChange([...value, id])
		}
	}
	return (
		<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{options.map((opt) => (
				<SelectableChip
					key={opt.id}
					label={opt.label}
					hint={opt.hint}
					selected={value.includes(opt.id)}
					onToggle={() => toggle(opt.id)}
				/>
			))}
		</div>
	)
}

interface SingleSelectGroupProps<T extends string> {
	options: Option<T>[]
	value: T | null
	onChange: (next: T) => void
}

export function SingleSelectGroup<T extends string>({
	options, value, onChange,
}: SingleSelectGroupProps<T>) {
	return (
		<div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
			{options.map((opt) => (
				<SelectableChip
					key={opt.id}
					label={opt.label}
					hint={opt.hint}
					selected={value === opt.id}
					onToggle={() => onChange(opt.id)}
				/>
			))}
		</div>
	)
}
