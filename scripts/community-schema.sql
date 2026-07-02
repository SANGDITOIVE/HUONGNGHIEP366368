-- =============================================================
-- SCHEMA CHẶT CHẼ CHO HỆ THỐNG REVIEW + WIKI ĐÓNG GÓP (PostgreSQL / Neon)
-- -------------------------------------------------------------
-- File này là đặc tả "chuẩn" theo đúng yêu cầu, có FOREIGN KEY trỏ sang
-- neon_auth.users(id). Hãy CHẠY FILE NÀY khi bạn triển khai kèm Neon Auth
-- (Stack Auth) — tức khi bảng neon_auth.users được đồng bộ người dùng thật.
--
-- LƯU Ý: app hiện tại dùng NextAuth-JWT (không adapter) nên bảng
-- neon_auth.users có thể RỘNG. Khi đó phần runtime (src/lib/community/db.ts)
-- sẽ tự tạo bản KHÔNG có FK cứng để INSERT luôn chạy được, đồng thời
-- denormalize author_name/author_image phục vụ hiển thị (không lộ email/phone).
-- =============================================================

-- 1. Bài đánh giá của sinh viên về trường học
CREATE TABLE IF NOT EXISTS public.reviews (
	id            SERIAL PRIMARY KEY,
	university_id VARCHAR(100) NOT NULL,                       -- Mã định danh trường
	user_id       TEXT NOT NULL,                               -- FK -> neon_auth.users(id)
	author_name   TEXT,                                        -- denormalize: họ tên hiển thị
	author_image  TEXT,                                        -- denormalize: ảnh đại diện
	rating        INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
	content       TEXT NOT NULL,
	created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_review_user FOREIGN KEY (user_id)
		REFERENCES neon_auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reviews_university ON public.reviews (university_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON public.reviews (user_id);

-- 2. Bình luận phản biện dưới mỗi bài đánh giá
CREATE TABLE IF NOT EXISTS public.review_comments (
	id           SERIAL PRIMARY KEY,
	review_id    INT NOT NULL,                                 -- FK -> public.reviews(id)
	user_id      TEXT NOT NULL,                                -- FK -> neon_auth.users(id)
	author_name  TEXT,
	author_image TEXT,
	content      TEXT NOT NULL,
	created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_comment_review FOREIGN KEY (review_id)
		REFERENCES public.reviews(id) ON DELETE CASCADE,
	CONSTRAINT fk_comment_user FOREIGN KEY (user_id)
		REFERENCES neon_auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_comments_review ON public.review_comments (review_id);

-- 3. Đóng góp chỉnh sửa dữ liệu kiểu Wiki
CREATE TABLE IF NOT EXISTS public.contributions (
	id            SERIAL PRIMARY KEY,
	university_id VARCHAR(100) NOT NULL,
	user_id       TEXT NOT NULL,                               -- FK -> neon_auth.users(id)
	author_name   TEXT,
	field_name    VARCHAR(100) NOT NULL,                        -- vd: 'nganh_tieu_bieu', 'diem_chuan_2025'
	old_value     TEXT,
	new_value     TEXT NOT NULL,
	status        VARCHAR(20) DEFAULT 'PENDING'
		CHECK (status IN ('PENDING','APPROVED','REJECTED')),
	reviewed_by   TEXT,
	reviewed_at   TIMESTAMP,
	created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_contribution_user FOREIGN KEY (user_id)
		REFERENCES neon_auth.users(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_contrib_status ON public.contributions (status);
CREATE INDEX IF NOT EXISTS idx_contrib_university ON public.contributions (university_id);

-- 4. Bảng override dữ liệu trường đã được admin duyệt (phản ánh ra web công khai)
CREATE TABLE IF NOT EXISTS public.university_overrides (
	id            SERIAL PRIMARY KEY,
	university_id VARCHAR(100) NOT NULL,
	field_name    VARCHAR(100) NOT NULL,
	value         TEXT NOT NULL,
	updated_by    TEXT,
	updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uq_override UNIQUE (university_id, field_name)
);

-- 5. Bảng PHÂN QUYỀN ĐỘNG — danh sách email được cấp quyền Admin (Role-based).
CREATE TABLE IF NOT EXISTS public.admin_whitelist (
	id         SERIAL PRIMARY KEY,
	email      VARCHAR(255) UNIQUE NOT NULL,                  -- Email được cấp quyền admin
	role       VARCHAR(50) DEFAULT 'ADMIN'
		CHECK (role IN ('SUPER_ADMIN','ADMIN')),                  -- Phân cấp Admin
	granted_by TEXT,                                          -- Email/ID người cấp quyền
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Định danh ban đầu cho SUPER ADMIN cố định (Quang Đại):
INSERT INTO public.admin_whitelist (email, role, granted_by)
VALUES ('lequangdai.spc@gmail.com', 'SUPER_ADMIN', 'system')
ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN';

-- =============================================================
-- TRUY VẤN HIỂN THỊ "CHUẨN PRIVACY" (khi có neon_auth.users):
-- Chỉ JOIN lấy name + image, TUYỆT ĐỐI không trả email/phone.
--
--   SELECT r.id, r.rating, r.content, r.created_at,
--          u.name  AS author_name,
--          u.image AS author_image
--   FROM public.reviews r
--   JOIN neon_auth.users u ON u.id = r.user_id
--   WHERE r.university_id = $1
--   ORDER BY r.created_at DESC;
-- =============================================================
