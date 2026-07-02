import { sql, db } from "@vercel/postgres"
import { SUPER_ADMIN_EMAIL, type AdminRole } from "@/lib/community/constants"
import { PROVINCES } from "@/data/geo/provinces"
import { REGIONAL_DEMAND_SEED } from "@/data/geo/regionalDemand"

// Re-export để các route handler dùng chung 1 nguồn kết nối.
export { sql, db }

// =============================================================
// LỚP Dữ LIỆU CỘNG ĐỒNG (Review + Comment + Wiki Contributions)
// -------------------------------------------------------------
// GHI CHÚ KIẾN TRÚC QUAN TRỌNG:
// Hệ thống đang chạy NextAuth (Google) ở chế độ JWT, KHÔNG dùng database
// adapter → NextAuth KHÔNG tự ghi user vào bảng neon_auth.users. Vì vậy nếu
// đặt FOREIGN KEY cứng trỏ sang neon_auth.users(id), mọi lệnh INSERT sẽ bị
// từ chối (user chưa tồn tại trong bảng đó) → tính năng vỡ ngay lập tức.
//
// Giải pháp production an toàn:
//  1. user_id = Google `sub` (ổn định, duy nhất theo từng tài khoản Google).
//  2. Denormalize sẵn author_name + author_image (lấy từ session lúc ghi) để
//     hiển thị công khai mà KHÔNG bao giờ lộ email/phone, và không phụ thuộc
//     vào việc JOIN sang neon_auth.users (bảng có thể rỗng với NextAuth-JWT).
//  3. FK thật sang neon_auth.users(id) vẫn được đặc tả đầy đủ trong
//     scripts/community-schema.sql để dùng khi triển khai kèm Neon Auth.
// =============================================================

let ensured = false

/**
 * Tự tạo các bảng nếu chưa có (idempotent, an toàn khi deploy lần đầu).
 * Mỗi câu lệnh DDL chạy riêng vì template tag `sql` chỉ nhận 1 statement.
 */
export async function ensureCommunityTables(): Promise<void> {
	if (ensured) return

	// 1. Bài đánh giá
	await sql`
		CREATE TABLE IF NOT EXISTS reviews (
			id            SERIAL PRIMARY KEY,
			university_id VARCHAR(100) NOT NULL,
			user_id       TEXT NOT NULL,
			author_name   TEXT,
			author_image  TEXT,
			rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
			content       TEXT NOT NULL,
			created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_reviews_university ON reviews (university_id)`
	await sql`CREATE INDEX IF NOT EXISTS idx_reviews_user ON reviews (user_id)`

	// 2. Bình luận phản biện dưới mỗi bài đánh giá
	await sql`
		CREATE TABLE IF NOT EXISTS review_comments (
			id           SERIAL PRIMARY KEY,
			review_id    INT NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
			user_id      TEXT NOT NULL,
			author_name  TEXT,
			author_image TEXT,
			content      TEXT NOT NULL,
			created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_comments_review ON review_comments (review_id)`

	// 3. Đóng góp dữ liệu kiểu Wiki (chờ duyệt)
	await sql`
		CREATE TABLE IF NOT EXISTS contributions (
			id            SERIAL PRIMARY KEY,
			university_id VARCHAR(100) NOT NULL,
			user_id       TEXT NOT NULL,
			author_name   TEXT,
			field_name    VARCHAR(100) NOT NULL,
			old_value     TEXT,
			new_value     TEXT NOT NULL,
			status        VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
			reviewed_by   TEXT,
			reviewed_at   TIMESTAMP,
			created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_contrib_status ON contributions (status)`
	await sql`CREATE INDEX IF NOT EXISTS idx_contrib_university ON contributions (university_id)`

	// 4. Bảng OVERRIDE dữ liệu trường — nơi lưu "dữ liệu gốc" đã được duyệt.
	// Dữ liệu trường gốc nằm trong file TypeScript tĩnh (src/data) nên không thể
	// ghi đè lúc runtime. Khi admin duyệt 1 đóng góp, ta upsert vào bảng này;
	// client merge override lên dữ liệu tĩnh → phản ánh trực tiếp ra web công khai.
	await sql`
		CREATE TABLE IF NOT EXISTS university_overrides (
			id            SERIAL PRIMARY KEY,
			university_id VARCHAR(100) NOT NULL,
			field_name    VARCHAR(100) NOT NULL,
			value         TEXT NOT NULL,
			updated_by    TEXT,
			updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT uq_override UNIQUE (university_id, field_name)
		)
	`

	// 5. Bảng PHÂN QUYỀN ĐỘNG — danh sách email được cấp quyền Admin.
	await sql`
		CREATE TABLE IF NOT EXISTS admin_whitelist (
			id         SERIAL PRIMARY KEY,
			email      VARCHAR(255) UNIQUE NOT NULL,
			role       VARCHAR(50) DEFAULT 'ADMIN' CHECK (role IN ('SUPER_ADMIN','ADMIN')),
			granted_by TEXT,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	// Định danh ban đầu cho SUPER ADMIN cố định (Quang Đại). Idempotent.
	await sql`
		INSERT INTO admin_whitelist (email, role, granted_by)
		VALUES (${SUPER_ADMIN_EMAIL}, 'SUPER_ADMIN', 'system')
		ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN'
	`

	// 6. CƠ SỞ ĐÀO TẠO DO CỘNG ĐỒNG ĐỀ XUẤT (Crowdsourced Map).
	// CHỈ chứa trường do người dùng thêm (trường có sẵn nằm trong file TypeScript
	// tĩnh src/data). Mặc định status = 'PENDING' → chờ admin duyệt.
	// slug sinh ngay lúc tạo (UNIQUE) để làm khóa ổn định cho review/comment/đóng góp
	// → khi duyệt là trường lập tức "thừa kế" mọi tính năng cộng đồng, không lỗi 404.
	await sql`
		CREATE TABLE IF NOT EXISTS universities (
			id              SERIAL PRIMARY KEY,
			slug            VARCHAR(160) UNIQUE NOT NULL,
			name            VARCHAR(255) NOT NULL,
			code            VARCHAR(50),
			address         TEXT,
			website         VARCHAR(255),
			nganh_tieu_bieu TEXT,
			region          VARCHAR(10)  DEFAULT 'bac',
			he_dao_tao      VARCHAR(20)  DEFAULT 'dai-hoc',
			ownership       VARCHAR(20)  DEFAULT 'cong-lap',
			status          VARCHAR(20)  DEFAULT 'PENDING' CHECK (status IN ('PENDING','APPROVED','REJECTED')),
			reject_reason   TEXT,
			created_by      TEXT,
			author_name     TEXT,
			created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_universities_status ON universities (status)`
	await sql`CREATE INDEX IF NOT EXISTS idx_universities_slug ON universities (slug)`

	// 7. HỒ SƠ TÀI KHOẢN (tên người dùng) theo Google user_id (sub).
	// Lưu ở SERVER để đồng bộ trên MỌI THIẾT BỊ khi đăng nhập cùng tài khoản
	// (trước đây tên chỉ nằm trong localStorage từng máy nên điện thoại và
	// máy tính hiển thị khác nhau). user_id = Google sub (ổn định, duy nhất).
	await sql`
		CREATE TABLE IF NOT EXISTS user_profiles (
			user_id    TEXT PRIMARY KEY,
			email      TEXT,
			username   VARCHAR(80) NOT NULL,
			created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
		)
	`

	ensured = true
}

// =============================================================
// LỚP Dữ LIỆU ĐỊA LÝ & KINH TẾ (PHASE 1 — Bản đồ cơ hội nghề nghiệp)
// -------------------------------------------------------------
// administrative_regions: danh mục đơn vị hành chính (Tỉnh, và Huyện về sau).
// regional_career_demand: nhu cầu nhân lực theo ngành ở mỗi tỉnh (vẽ heatmap).
// universities (+cột toạ độ/mã vùng): để ghim trường lên bản đồ.
//
// GHI CHÚ: KHÔNG đặt FOREIGN KEY cứng (giống triết lý phần cộng đồng) để mọi
// INSERT luôn an toàn kể cả khi seed chạy lệch thứ tự. industry_name lưu MÃ
// ngành ổn định (IndustryTag) — nhãn tiếng Việt resolve ở client/API.
// =============================================================

let geoEnsured = false

export async function ensureGeoTables(): Promise<void> {
	if (geoEnsured) return
	// Bảng universities (crowdsourced) phải tồn tại trước khi thêm cột toạ độ.
	await ensureCommunityTables()

	await sql`
		CREATE TABLE IF NOT EXISTS administrative_regions (
			code           VARCHAR(20) PRIMARY KEY,
			name           VARCHAR(150) NOT NULL,
			parent_code    VARCHAR(20),
			type           VARCHAR(50),
			region         VARCHAR(10),
			latitude       NUMERIC(10,7),
			longitude      NUMERIC(10,7),
			economic_focus TEXT[]
		)
	`

	// Bổ sung cột toạ độ & mã vùng cho universities (idempotent).
	await sql`ALTER TABLE universities ADD COLUMN IF NOT EXISTS province_code VARCHAR(20)`
	await sql`ALTER TABLE universities ADD COLUMN IF NOT EXISTS district_code VARCHAR(20)`
	await sql`ALTER TABLE universities ADD COLUMN IF NOT EXISTS latitude NUMERIC(10,7)`
	await sql`ALTER TABLE universities ADD COLUMN IF NOT EXISTS longitude NUMERIC(10,7)`

	// Hồ sơ người dùng: gắn tỉnh/huyện để cá nhân hoá gợi ý theo vị trí (Phần 4).
	await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS province_code VARCHAR(20)`
	await sql`ALTER TABLE user_profiles ADD COLUMN IF NOT EXISTS district_code VARCHAR(20)`

	await sql`
		CREATE TABLE IF NOT EXISTS regional_career_demand (
			id                 SERIAL PRIMARY KEY,
			province_code      VARCHAR(20),
			industry_name      VARCHAR(100) NOT NULL,
			demand_score       INT CHECK (demand_score BETWEEN 1 AND 100),
			job_openings_count INT,
			updated_at         TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
			CONSTRAINT uq_demand UNIQUE (province_code, industry_name)
		)
	`
	await sql`CREATE INDEX IF NOT EXISTS idx_demand_industry ON regional_career_demand (industry_name)`
	await sql`CREATE INDEX IF NOT EXISTS idx_demand_province ON regional_career_demand (province_code)`

	geoEnsured = true
}

let geoSeeded = false

/**
 * Seed 63 tỉnh + nhu cầu nhân lực mẫu (idempotent upsert). Gọi an toàn nhiều lần.
 * economic_focus là TEXT[] -> dùng string_to_array để truyền 1 tham số chuỗi
 * (tránh giới hạn kiểu Primitive của template tag `sql`).
 */
export async function seedGeoData(): Promise<void> {
	if (geoSeeded) return
	await ensureGeoTables()

	for (const p of PROVINCES) {
		const focus = p.economicFocus.join(",")
		await sql`
			INSERT INTO administrative_regions
				(code, name, parent_code, type, region, latitude, longitude, economic_focus)
			VALUES
				(${p.code}, ${p.name}, NULL, 'PROVINCE', ${p.region}, ${p.lat}, ${p.lng}, string_to_array(${focus}, ','))
			ON CONFLICT (code) DO UPDATE SET
				name = EXCLUDED.name,
				type = EXCLUDED.type,
				region = EXCLUDED.region,
				latitude = EXCLUDED.latitude,
				longitude = EXCLUDED.longitude,
				economic_focus = EXCLUDED.economic_focus
		`
	}

	for (const d of REGIONAL_DEMAND_SEED) {
		await sql`
			INSERT INTO regional_career_demand
				(province_code, industry_name, demand_score, job_openings_count)
			VALUES
				(${d.provinceCode}, ${d.industry}, ${d.demandScore}, ${d.jobOpenings})
			ON CONFLICT (province_code, industry_name) DO UPDATE SET
				demand_score = EXCLUDED.demand_score,
				job_openings_count = EXCLUDED.job_openings_count,
				updated_at = CURRENT_TIMESTAMP
		`
	}

	geoSeeded = true
}

// =============================================================
// HELPER PHÂN QUYỀN (admin_whitelist)
// =============================================================
export interface AdminRow {
	email: string
	role: AdminRole
	grantedBy: string | null
	createdAt: string
}

/**
 * Tra vai trò của 1 email. Trả null nếu không phải admin.
 * Dùng try/catch để KHÔNG bao giờ làm sập luồng đăng nhập nếu DB lỗi.
 */
export async function getAdminRole(email?: string | null): Promise<AdminRole | null> {
	const e = (email ?? "").trim().toLowerCase()
	if (!e) return null
	// Super Admin gốc luôn có quyền dù DB có vấn đề.
	if (e === SUPER_ADMIN_EMAIL) return "SUPER_ADMIN"
	try {
		await ensureCommunityTables()
		const res = await sql`SELECT role FROM admin_whitelist WHERE email = ${e} LIMIT 1`
		const role = res.rows[0]?.role as AdminRole | undefined
		return role ?? null
	} catch (err) {
		console.error("[getAdminRole] failed", err)
		return null
	}
}

export async function listAdmins(): Promise<AdminRow[]> {
	await ensureCommunityTables()
	const res = await sql`
		SELECT email, role, granted_by, created_at
		FROM admin_whitelist
		ORDER BY (role = 'SUPER_ADMIN') DESC, created_at ASC
	`
	return res.rows.map((r) => ({
		email: r.email,
		role: r.role,
		grantedBy: r.granted_by ?? null,
		createdAt: r.created_at,
	}))
}

export async function addAdmin(email: string, grantedBy: string): Promise<void> {
	await ensureCommunityTables()
	const e = email.trim().toLowerCase()
	// Luôn thêm với vai trò ADMIN (Super Admin gốc đã được seed sẵn).
	await sql`
		INSERT INTO admin_whitelist (email, role, granted_by)
		VALUES (${e}, 'ADMIN', ${grantedBy})
		ON CONFLICT (email) DO NOTHING
	`
}

export async function removeAdmin(email: string): Promise<void> {
	await ensureCommunityTables()
	const e = email.trim().toLowerCase()
	// KHÔNG cho phép xóa Super Admin gốc.
	await sql`DELETE FROM admin_whitelist WHERE email = ${e} AND role <> 'SUPER_ADMIN'`
}

// ---------- Kiểu dữ liệu trả ra API công khai (ĐÃ ẨN email/phone) ----------
export interface PublicComment {
	id: number
	reviewId: number
	authorName: string
	authorImage: string | null
	content: string
	createdAt: string
}

export interface PublicReview {
	id: number
	universityId: string
	authorName: string
	authorImage: string | null
	rating: number
	content: string
	createdAt: string
	comments: PublicComment[]
}

export interface RatingAggregate {
	average: number
	count: number
}
