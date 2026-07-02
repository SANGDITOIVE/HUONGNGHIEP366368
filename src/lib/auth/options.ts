import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { getAdminRole } from "@/lib/community/db"

// Cấu hình NextAuth dùng chung. Tách riêng khỏi route.ts để tránh lỗi
// "invalid export" của Next.js App Router (route chỉ được export GET/POST...).

// Thời hạn phiên: 90 ngày. NextAuth dùng cookie BỀN (persistent) khi có maxAge
// → đóng trình duyệt / mở lại máy vẫn còn đăng nhập, trừ khi bấm Đăng xuất.
const SESSION_MAX_AGE = 60 * 60 * 24 * 90 // 90 ngày (giây)

export const authOptions: NextAuthOptions = {
	providers: [
		GoogleProvider({
			clientId: process.env.GOOGLE_CLIENT_ID ?? "",
			clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
		}),
	],
	// JWT: không cần database adapter — đơn giản và đủ cho nhu cầu đăng nhập.
	// maxAge dài + cookie bền → duy trì đăng nhập qua nhiều phiên trình duyệt.
	session: { strategy: "jwt", maxAge: SESSION_MAX_AGE },
	jwt: { maxAge: SESSION_MAX_AGE },
	callbacks: {
		// Lưu Google `sub` (định danh ổn định, duy nhất cho mỗi tài khoản Google)
		// vào token. Đây chính là user_id ta dùng xuyên suốt hệ thống review/đóng góp.
		async jwt({ token, account, profile }) {
			const sub = (profile as { sub?: string } | undefined)?.sub
			if (account && sub) token.sub = sub
			// Tra vai trò quản trị theo email (phân quyền động từ admin_whitelist).
			// Tra lại mỗi lần token được làm mới để việc cấp/gỡ quyền phản ánh sớm.
			try {
				token.role = await getAdminRole(token.email as string | undefined)
			} catch {
				token.role = token.role ?? null
			}
			return token
		},
		// Expose user_id + role ra session.user. Khi đăng xuất rồi đăng nhập lại
		// bằng ĐÚNG tài khoản Google cũ, `sub` không đổi → map lại đúng review lịch sử.
		async session({ session, token }) {
			if (session.user) {
				if (token.sub) session.user.id = token.sub
				session.user.role = (token.role as "SUPER_ADMIN" | "ADMIN" | null | undefined) ?? null
			}
			return session
		},
	},
}
