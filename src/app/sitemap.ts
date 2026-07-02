import type { MetadataRoute } from "next"
import { MAJORS } from "@/data/majors"
import { ARTICLES } from "@/data/articles"

function baseUrl(): string {
	if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL
	if (process.env.VERCEL_URL) return "https://" + process.env.VERCEL_URL
	return "http://localhost:3000"
}

export default function sitemap(): MetadataRoute.Sitemap {
	const base = baseUrl()
	const now = new Date()
	const staticRoutes = [
		"", "/danh-gia", "/trac-nghiem-tinh-cach", "/ket-qua", "/nganh-hoc", "/so-sanh", "/ban-do-mon-hoc", "/noi-dao-tao", "/ca-nhan", "/cam-nang", "/cau-hoi-thuong-gap", "/danh-cho-phu-huynh",
	].map((path) => ({
		url: base + path,
		lastModified: now,
		changeFrequency: "monthly" as const,
		priority: path === "" ? 1 : 0.7,
	}))
	const majorRoutes = MAJORS.map((m) => ({
		url: base + "/nganh-hoc/" + m.id,
		lastModified: now,
		changeFrequency: "monthly" as const,
		priority: 0.6,
	}))
	const articleRoutes = ARTICLES.map((a) => ({
		url: base + "/cam-nang/" + a.slug,
		lastModified: now,
		changeFrequency: "monthly" as const,
		priority: 0.5,
	}))
	return [...staticRoutes, ...majorRoutes, ...articleRoutes]
}
