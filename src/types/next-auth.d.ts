// Mở rộng type của NextAuth để session.user có thêm `id` (Google sub) và `role`
// (phân quyền động lấy từ bảng admin_whitelist). Nhờ vậy mọi API/route
// handler dùng session.user.id / session.user.role một cách type-safe.
import "next-auth"
import "next-auth/jwt"

type AppRole = "SUPER_ADMIN" | "ADMIN"

declare module "next-auth" {
	interface Session {
		user: {
			/** Google `sub` — định danh ổn định & duy nhất theo từng tài khoản Google. */
			id?: string
			/** Vai trò quản trị (nếu email nằm trong admin_whitelist). undefined = người dùng thường. */
			role?: AppRole | null
			name?: string | null
			email?: string | null
			image?: string | null
		}
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		sub?: string
		role?: AppRole | null
	}
}
