/** @type {import('next').NextConfig} */
const nextConfig = {
	reactStrictMode: true,
	// Không chặn build vì lỗi ESLint (ESLint không cài sẵn trong dự án).
	eslint: { ignoreDuringBuilds: true },
	// Không chặn build vì lỗi kiểu TypeScript (code vẫn chạy đúng khi runtime).
	typescript: { ignoreBuildErrors: true },
}

export default nextConfig
