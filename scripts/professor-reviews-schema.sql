-- =============================================================
-- MIGRATION MỚI: HỆ THỐNG "ĐÁNH GIÁ GIẢNG VIÊN" (PostgreSQL / Neon)
-- -------------------------------------------------------------
-- KHÔNG đụng tới bảng cũ (surveys, reviews, review_comments, contributions,
-- university_overrides, admin_whitelist, universities, user_profiles...).
-- Chỉ THÊM 2 bảng mới: professor_reviews + professor_review_votes.
--
-- GHI CHÚ KIẾN TRÚC (giống hệ thống review trường đang chạy):
--  * App dùng NextAuth-JWT (KHÔNG database adapter) nên bảng neon_auth.users
--    có thể rỗng => KHÔNG đặt FOREIGN KEY cứng trỏ sang users, nếu không mọi
--    INSERT sẽ vỡ. user_id = Google `sub` (ổn định, duy nhất/ tài khoản).
--  * "Trường" (school_id) nằm trong file TypeScript tĩnh src/data (không phải
--    bảng DB) => school_id là khoá chuỗi ổn định (id/slug của trường), KHÔNG
--    có FK cứng. Đây đúng bằng cách reviews.university_id đang làm.
--  * File runtime src/lib/community/professorDb.ts sẽ CREATE IF NOT EXISTS các
--    bảng này (idempotent) nên deploy lần đầu vẫn chạy mà không cần chạy tay.
-- =============================================================

-- 1. Bài đánh giá giảng viên
CREATE TABLE IF NOT EXISTS professor_reviews (
	id                      SERIAL PRIMARY KEY,
	professor_name          VARCHAR(160) NOT NULL,
	professor_slug          VARCHAR(180) NOT NULL,          -- slug không dấu để tra theo [name]
	school_id               VARCHAR(100) NOT NULL,          -- id/slug trường (tĩnh), không FK cứng
	subject                 VARCHAR(160),                    -- môn dạy
	rating_easy_to_pass     INT NOT NULL CHECK (rating_easy_to_pass BETWEEN 1 AND 5),
	rating_fair_grading     INT NOT NULL CHECK (rating_fair_grading BETWEEN 1 AND 5),
	rating_clear_teaching   INT NOT NULL CHECK (rating_clear_teaching BETWEEN 1 AND 5),
	rating_bonus_points     BOOLEAN NOT NULL DEFAULT FALSE, -- có cộng điểm/thưởng không
	rating_attendance_check BOOLEAN NOT NULL DEFAULT FALSE, -- có điểm danh không
	tip_text                TEXT,                            -- mẹo/kinh nghiệm cộng đồng viết
	is_anonymous            BOOLEAN NOT NULL DEFAULT FALSE,
	user_id                 TEXT,                            -- Google sub; NULL nếu ẩn danh
	author_name             TEXT,                            -- denormalize tên hiển thị (ẩn nếu anonymous)
	verified_student        BOOLEAN NOT NULL DEFAULT FALSE,
	upvotes                 INT NOT NULL DEFAULT 0,
	downvotes               INT NOT NULL DEFAULT 0,
	trust_score             INT NOT NULL DEFAULT 0,           -- = upvotes - downvotes (+2 nếu verified)
	created_at              TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_prof_reviews_school ON professor_reviews (school_id);
CREATE INDEX IF NOT EXISTS idx_prof_reviews_slug ON professor_reviews (professor_slug);
CREATE INDEX IF NOT EXISTS idx_prof_reviews_school_slug ON professor_reviews (school_id, professor_slug);

-- 2. Phiếu bầu (chống 1 người bầu nhiều lần cho cùng 1 review).
-- upvotes/downvotes trên professor_reviews là counter được tính lại từ bảng này.
CREATE TABLE IF NOT EXISTS professor_review_votes (
	review_id  INT NOT NULL REFERENCES professor_reviews(id) ON DELETE CASCADE,
	user_id    TEXT NOT NULL,                                 -- Google sub của người bầu
	value      SMALLINT NOT NULL CHECK (value IN (-1, 1)),     -- 1 = upvote, -1 = downvote
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (review_id, user_id)
);

-- =============================================================
-- (Tùy chọn) Nếu về sau bạn triển khai Neon Auth (bảng neon_auth.users có
-- dữ liệu thật), có thể thêm FK cứng:
--   ALTER TABLE professor_reviews
--     ADD CONSTRAINT fk_prof_review_user FOREIGN KEY (user_id)
--     REFERENCES neon_auth.users(id) ON DELETE SET NULL;
-- =============================================================
