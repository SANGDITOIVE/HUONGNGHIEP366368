-- =============================================================
-- Script tạo bảng lưu dữ liệu khảo sát trên Vercel Postgres (neon)
-- -------------------------------------------------------------
-- Cách chạy:
--   1. Vào Vercel → Storage → chọn database "neon" → tab "Query"
--   2. Dán toàn bộ đoạn dưới đây và bấm Run.
--   (API /api/survey cũng tự chạy CREATE TABLE IF NOT EXISTS nên
--    nếu quên chạy tay thì bảng vẫn được tạo lần gọi POST đầu tiên.)
-- =============================================================

CREATE TABLE IF NOT EXISTS surveys (
  id             SERIAL PRIMARY KEY,            -- mã tự tăng
  full_name      TEXT        NOT NULL,          -- Họ tên
  location       TEXT,                          -- Nơi ở
  birth_year     INTEGER,                        -- Năm sinh
  phone_zalo     TEXT,                          -- Số điện thoại (Zalo)
  email          TEXT,                          -- Email
  target_goal    TEXT,                          -- Mục tiêu (Đỗ ĐH / Cao đẳng / Du học / Đi làm)
  favorite_field TEXT,                          -- Khối ngành yêu thích
  score_target   TEXT,                          -- Mức điểm mục tiêu (thang 30)
  priority       TEXT,                          -- Tiêu chí chọn trường (bổ sung)
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()  -- Ngày giờ nộp
);

-- Chỉ mục hỗ trợ lọc/marketing
CREATE INDEX IF NOT EXISTS idx_surveys_created_at ON surveys (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_surveys_email      ON surveys (email);
CREATE INDEX IF NOT EXISTS idx_surveys_phone      ON surveys (phone_zalo);
