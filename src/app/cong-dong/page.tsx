import { getCommunityFeed } from "@/lib/community/feedDb"
import { NewsFeed } from "@/components/community/NewsFeed"

export const dynamic = "force-dynamic"

// Trang mặc định của khu Cộng đồng: bảng tin tổng hợp kiểu Reddit.
export default async function CongDongPage() {
	let initial = [] as Awaited<ReturnType<typeof getCommunityFeed>>
	try {
		initial = await getCommunityFeed({ perSource: 40 })
	} catch {
		initial = []
	}
	return <NewsFeed initial={initial} />
}
