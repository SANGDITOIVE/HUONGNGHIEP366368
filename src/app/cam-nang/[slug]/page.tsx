import Link from "next/link"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { ArrowLeft, ArrowRight, Clock, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { DisclaimerBanner } from "@/components/layout/DisclaimerBanner"
import { ARTICLES, ARTICLE_BY_SLUG } from "@/data/articles"

export function generateStaticParams() {
	return ARTICLES.map((a) => ({ slug: a.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
	const article = ARTICLE_BY_SLUG[params.slug]
	if (!article) return { title: "Không tìm thấy bài viết" }
	return {
		title: article.title,
		description: article.description,
	}
}

export default function ArticleDetailPage({ params }: { params: { slug: string } }) {
	const article = ARTICLE_BY_SLUG[params.slug]
	if (!article) notFound()

	const others = ARTICLES.filter((a) => a.slug !== article.slug).slice(0, 3)

	return (
		<div className="container max-w-3xl py-10">
			<Button asChild variant="ghost" className="mb-4 -ml-2">
				<Link href="/cam-nang"><ArrowLeft className="h-4 w-4" /> Quay lại cẩm nang</Link>
			</Button>

			<div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
				<Badge variant="muted">{article.category}</Badge>
				<span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {article.readingMinutes} phút đọc</span>
			</div>
			<h1 className="mt-3 text-3xl font-bold sm:text-4xl">{article.title}</h1>
			<p className="mt-3 text-lg text-muted-foreground">{article.description}</p>

			<article className="mt-8 space-y-8">
				{article.sections.map((section) => (
					<section key={section.heading} className="animate-fade-in">
						<h2 className="text-xl font-semibold">{section.heading}</h2>
						<div className="mt-2 space-y-3">
							{section.paragraphs.map((p, i) => (
								<p key={i} className="leading-relaxed text-muted-foreground">{p}</p>
							))}
						</div>
					</section>
				))}
			</article>

			{article.sources && article.sources.length > 0 && (
				<div className="mt-10 rounded-lg border bg-muted/30 p-4">
					<h2 className="flex items-center gap-2 text-sm font-semibold">
						<ExternalLink className="h-4 w-4 text-primary" /> Nguồn tham khảo
					</h2>
					<ul className="mt-3 space-y-2">
						{article.sources.map((src, i) => (
							<li key={i} className="text-sm text-muted-foreground">
								<a href={src.url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary hover:underline">
									{src.label}
								</a>
								{" — "}{src.publisher}{src.year ? ` (${src.year})` : ""}
							</li>
						))}
					</ul>
					<p className="mt-3 text-xs text-muted-foreground">
						Số liệu có thể thay đổi theo thời điểm công bố; hãy kiểm tra lại tại nguồn gốc.
					</p>
				</div>
			)}

			<div className="mt-10">
				<DisclaimerBanner />
			</div>

			{others.length > 0 && (
				<div className="mt-10">
					<h2 className="text-lg font-semibold">Bài viết khác</h2>
					<div className="mt-3 space-y-2">
						{others.map((a) => (
							<Link
								key={a.slug}
								href={`/cam-nang/${a.slug}`}
								className="group flex items-center justify-between gap-3 rounded-lg border bg-card p-3 transition-colors hover:border-primary hover:bg-muted/50"
							>
								<span className="text-sm font-medium group-hover:text-primary">{a.title}</span>
								<ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
							</Link>
						))}
					</div>
				</div>
			)}
		</div>
	)
}
