import type { Metadata, Viewport } from "next"
import { Lora } from "next/font/google"
import "./globals.css"
import { AssessmentProvider } from "@/lib/store/assessmentStore"
import { SiteHeader } from "@/components/layout/SiteHeader"
import { SiteFooter } from "@/components/layout/SiteFooter"
import { FavoritesProvider } from "@/lib/store/favoritesStore"
import { AuthSessionProvider } from "@/components/auth/AuthSessionProvider"

const lora = Lora({
	subsets: ["latin", "vietnamese"],
	weight: ["400", "500", "600", "700"],
	variable: "--font-heading",
	display: "swap",
})

export const metadata: Metadata = {
	title: {
		default: "HoaTieu — Hạ tầng thông tin sau THPT của Việt Nam",
		template: "%s | HoaTieu",
	},
	description:
		"Discovery Journey — nơi mọi sinh viên Việt Nam chia sẻ, tra cứu và đưa ra quyết định sau THPT: đánh giá trường, review giảng viên, chi phí thật, trải nghiệm thật.",
	keywords: ["trường đại học", "review giảng viên", "học phí", "ngành học", "sau THPT", "sinh viên"],
}

export const viewport: Viewport = {
	width: "device-width",
	initialScale: 1,
	themeColor: "#163a5f",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="vi">
			<body className={`${lora.variable} flex min-h-screen flex-col`}>
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-primary-foreground focus:shadow"
				>
					Bỏ qua tới nội dung chính
				</a>
				<script
					dangerouslySetInnerHTML={{
						__html:
							"try{if(localStorage.getItem('hoatieu-sidebar')==='collapsed'){document.documentElement.setAttribute('data-sidebar','collapsed')}}catch(e){}",
					}}
				/>
				<AuthSessionProvider>
					<AssessmentProvider>
						<FavoritesProvider>
							<SiteHeader />
							<div className="app-shell flex flex-1 flex-col">
								<main id="main-content" className="flex-1">{children}</main>
								<SiteFooter />
							</div>
						</FavoritesProvider>
					</AssessmentProvider>
				</AuthSessionProvider>
			</body>
		</html>
	)
}
