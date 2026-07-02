"use client"

import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

// Bọc toàn site để mọi component client dùng được useSession().
export function AuthSessionProvider({ children }: { children: ReactNode }) {
	return <SessionProvider>{children}</SessionProvider>
}
