# Hướng Nghiệp — Định hướng chọn ngành sau lớp 12

Ứng dụng web tiếng Việt giúp học sinh THPT định hướng chọn ngành/nghề sau lớp 12.

## Tech stack

- Next.js 14 (App Router) + TypeScript
- Tailwind CSS + UI components phong cách shadcn/ui (tự viết, không cần CLI)
- Lucide icons
- Dữ liệu tĩnh trong `src/data` (không cần backend)

## Chạy local

```bash
npm install
npm run dev
```

Mở http://localhost:3000

## Triển khai Vercel

Push lên GitHub rồi import vào Vercel — không cần biến môi trường, không cần backend.

## Tiến độ

- ✅ Phase 1: Kiến trúc, mô hình dữ liệu, engine + hệ thống điểm (đặc tả)
- ✅ Phase 2: Wizard đánh giá + trắc nghiệm tính cách (MBTI rút gọn)
- ⏳ Phase 3: Engine gợi ý + trang kết quả chi tiết
- ⏳ Phase 4: Khám phá ngành + bộ lọc + trang chi tiết ngành
- ⏳ Phase 5: Hoàn thiện UI/UX, accessibility, deploy

## Cấu trúc dữ liệu

Mọi nội dung tách khỏi logic, sửa trong `src/data`. Trọng số chấm điểm trong `src/config/scoring.ts`.
