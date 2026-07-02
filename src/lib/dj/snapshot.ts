// =============================================================
// DJ Snapshot — ảnh chụp gọn kết quả "Khám phá bản thân" để lưu
// THEO TÀI KHOẢN (scopedStore theo email). Dùng ở trang Cá nhân.
// =============================================================
import type { DjState } from "@/lib/dj/useDiscovery"
import { getCluster } from "@/data/dj/clusters"
import { quadrantLabel } from "@/lib/dj/scoring"

export const DJ_SNAPSHOT_NS = "dj-snapshot"

export interface DjSnapshotCluster {
	id: string
	name: string
	icon: string
	competence: number
	interest: number
	quadrant: string
	sampleMajors: string[]
}

export interface DjSnapshot {
	updatedAt: string
	hollandCode: string
	personType: string
	topClusters: DjSnapshotCluster[]
	advice: string[]
	framing: string
	completedLayer3: boolean
}

// Trả về null nếu chưa có tín hiệu nào (chưa làm gì).
export function buildDjSnapshot(state: DjState): DjSnapshot | null {
	if (!state) return null

	let topClusters: DjSnapshotCluster[] = []

	const conf = [...(state.confidence ?? [])].sort(
		(a, b) => b.competenceAxis + b.interestAxis - (a.competenceAxis + a.interestAxis),
	)

	if (conf.length > 0) {
		topClusters = conf.slice(0, 3).map((c) => {
			const def = getCluster(c.clusterId)
			return {
				id: c.clusterId,
				name: def?.name ?? c.clusterId,
				icon: def?.icon ?? "",
				competence: Math.round(c.competenceAxis),
				interest: Math.round(c.interestAxis),
				quadrant: quadrantLabel(c.competenceAxis, c.interestAxis),
				sampleMajors: (def?.sampleMajors ?? []).slice(0, 4),
			}
		})
	} else if (state.layer1?.hypotheses?.length) {
		topClusters = state.layer1.hypotheses.slice(0, 3).map((h) => {
			const def = getCluster(h.clusterId)
			return {
				id: h.clusterId,
				name: def?.name ?? h.clusterId,
				icon: def?.icon ?? "",
				competence: 0,
				interest: 0,
				quadrant: "Chưa thử việc thật (chưa có bằng chứng năng lực)",
				sampleMajors: (def?.sampleMajors ?? []).slice(0, 4),
			}
		})
	} else {
		return null
	}

	const hollandCode = state.layer1?.hollandCode ?? ""
	const best = topClusters[0]
	const personType = best
		? `${best.icon} Thiên hướng ${best.name}${hollandCode ? ` · mã Holland ${hollandCode}` : ""}`
		: hollandCode
			? `Mã Holland ${hollandCode}`
			: "Chưa đủ dữ liệu"

	const advice: string[] = []
	if (best) advice.push(`Ưu tiên khám phá sâu: ${best.name} (${best.quadrant}).`)
	if (state.layer3?.dataGaps?.length) {
		advice.push(`Cần bổ sung để chắc chắn hơn: ${state.layer3.dataGaps.slice(0, 3).join("; ")}.`)
	} else if (state.layer1?.hypotheses?.length && state.layer1.hypotheses[0].confirmIf) {
		advice.push(`Cách kiểm chứng: ${state.layer1.hypotheses[0].confirmIf}`)
	}

	const framing = state.layer3?.framing ?? state.layer1?.disclaimer ?? ""

	return {
		updatedAt: new Date().toISOString(),
		hollandCode,
		personType,
		topClusters,
		advice,
		framing,
		completedLayer3: !!state.layer3,
	}
}
