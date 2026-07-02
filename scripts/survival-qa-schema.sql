-- =============================================================
-- MIGRATION MỚI: SURVIVAL GUIDE (wiki cộng đồng theo trường) + Q&A (Reddit-style)
-- -------------------------------------------------------------
-- KHÔNG đụng bảng cũ. Thêm các bảng mới + 1 bảng report dùng chung.
-- Cùng triết lý với phần cộng đồng đang chạy:
--  * KHÔNG FK cứng sang neon_auth.users (NextAuth-JWT, bảng có thể rỗng).
--  * user_id = Google sub. Denormalize author_name để hiển thị, KHÔNG lộ email.
--  * school_id = id/slug trường (dữ liệu tĩnh trong src/data), không FK cứng.
--  * Các file src/lib/community/*Db.ts sẽ CREATE IF NOT EXISTS (idempotent).
-- =============================================================

-- ========================== SURVIVAL GUIDE ==========================
-- category enum (giá trị ngắn) <-> mã dài:
--   checklist = CHECKLIST_PRE_ENROLLMENT   mistakes = COMMON_MISTAKES
--   food      = FOOD_SPOTS                 housing  = HOUSING_REVIEW
--   intern    = INTERN_EXPERIENCE          general  = GENERAL
CREATE TABLE IF NOT EXISTS survival_tips (
	id             SERIAL PRIMARY KEY,
	school_id      VARCHAR(100) NOT NULL,
	category       VARCHAR(20)  NOT NULL CHECK (category IN ('checklist','mistakes','food','housing','intern','general')),
	content        TEXT NOT NULL,
	author_user_id TEXT,                    -- Google sub; NULL nếu bản ghi cũ
	author_name    TEXT,                    -- ẩn nếu is_anonymous (chỉ admin thấy tên thật)
	is_anonymous   BOOLEAN NOT NULL DEFAULT FALSE,
	upvotes        INT NOT NULL DEFAULT 0,
	trust_score    INT NOT NULL DEFAULT 0,  -- = upvotes (đếm lại từ survival_tip_votes)
	status         VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
	created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_survival_school ON survival_tips (school_id);
CREATE INDEX IF NOT EXISTS idx_survival_school_cat ON survival_tips (school_id, category);

-- Phiếu upvote (chống 1 người vote nhiều lần). upvotes là counter tính lại từ đây.
CREATE TABLE IF NOT EXISTS survival_tip_votes (
	tip_id     INT NOT NULL REFERENCES survival_tips(id) ON DELETE CASCADE,
	user_id    TEXT NOT NULL,
	value      SMALLINT NOT NULL DEFAULT 1 CHECK (value = 1),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (tip_id, user_id)
);

-- Trả lời (reply) dưới mỗi tip.
CREATE TABLE IF NOT EXISTS survival_tip_replies (
	id           SERIAL PRIMARY KEY,
	tip_id       INT NOT NULL REFERENCES survival_tips(id) ON DELETE CASCADE,
	user_id      TEXT,
	author_name  TEXT,
	is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
	content      TEXT NOT NULL,
	status       VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
	created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_survival_reply_tip ON survival_tip_replies (tip_id);

-- ============================== Q&A ==============================
CREATE TABLE IF NOT EXISTS questions (
	id           SERIAL PRIMARY KEY,
	school_id    VARCHAR(100),              -- NULL = hỏi chung (không gắn trường)
	title        VARCHAR(300) NOT NULL,
	body         TEXT NOT NULL,
	tags         TEXT,                      -- JSON array chuỗi, vd ["cntt","hoc-bong"]
	is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
	user_id      TEXT NOT NULL,             -- BẮT BUỘC đăng nhập để post (chống spam)
	author_name  TEXT,
	view_count   INT NOT NULL DEFAULT 0,
	upvotes      INT NOT NULL DEFAULT 0,
	downvotes    INT NOT NULL DEFAULT 0,
	status       VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
	created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_questions_school ON questions (school_id);
CREATE INDEX IF NOT EXISTS idx_questions_created ON questions (created_at DESC);

CREATE TABLE IF NOT EXISTS answers (
	id           SERIAL PRIMARY KEY,
	question_id  INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
	body         TEXT NOT NULL,
	is_anonymous BOOLEAN NOT NULL DEFAULT FALSE,
	user_id      TEXT NOT NULL,
	author_name  TEXT,
	upvotes      INT NOT NULL DEFAULT 0,
	downvotes    INT NOT NULL DEFAULT 0,
	status       VARCHAR(20) NOT NULL DEFAULT 'visible' CHECK (status IN ('visible','pending_review','removed')),
	created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers (question_id);

-- Phiếu bầu câu hỏi (spec) + phiếu bầu câu trả lời (thêm, vì answers có up/downvotes).
CREATE TABLE IF NOT EXISTS question_votes (
	question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
	user_id     TEXT NOT NULL,
	vote_type   SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
	created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (question_id, user_id)
);
CREATE TABLE IF NOT EXISTS answer_votes (
	answer_id  INT NOT NULL REFERENCES answers(id) ON DELETE CASCADE,
	user_id    TEXT NOT NULL,
	vote_type  SMALLINT NOT NULL CHECK (vote_type IN (-1, 1)),
	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	PRIMARY KEY (answer_id, user_id)
);

-- ===================== REPORT / AUTO-MODERATION =====================
-- Dùng chung cho survival_tip / survival_reply / question / answer.
-- >= 5 report cho 1 target => tự set status='pending_review' (ẩn nội dung thật).
CREATE TABLE IF NOT EXISTS content_reports (
	id          SERIAL PRIMARY KEY,
	target_type VARCHAR(30) NOT NULL,      -- survival_tip | survival_reply | question | answer
	target_id   INT NOT NULL,
	user_id     TEXT NOT NULL,
	reason      TEXT,
	created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT uq_report UNIQUE (target_type, target_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_reports_target ON content_reports (target_type, target_id);
