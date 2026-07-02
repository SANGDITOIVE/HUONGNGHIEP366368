import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth/options"
import type { AdminRole } from "@/lib/community/constants"

// =============================================================
// Helper bảo mật phía SERVER cho các API/route quản trị.
// session.user.role được điền bởi callback của NextAuth (giải mã JWT phía
// server) nên đáng tin cậy — client không thể giả mạo.
// =============================================================
export interface AdminContext {
	email: string | null
	role: AdminRole | null
	isAdmin: boolean
	isSuperAdmin: boolean
}

export async function getAdminContext(): Promise<AdminContext> {
	const session = await getServerSession(authOptions)
	const email = session?.user?.email ?? null
	const role = (session?.user?.role as AdminRole | null | undefined) ?? null
	return {
		email,
		role,
		isAdmin: role === "ADMIN" || role === "SUPER_ADMIN",
		isSuperAdmin: role === "SUPER_ADMIN",
	}
}
