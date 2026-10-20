# Next.js App Router & TypeScript Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Chuyển đổi toàn bộ ứng dụng Thiệp Cưới Online từ Vite SPA sang Next.js 15 (App Router) + TypeScript, tích hợp RSVP lưu Google Sheet, Sổ lưu bút Supabase Realtime và chuẩn bị sẵn sàng cho folder ảnh cưới của người dùng.

**Architecture:** Sử dụng Next.js 15 App Router với Server Component cho `layout.tsx` và `page.tsx` nhằm tối ưu SEO, các component giao diện đánh dấu `'use client'`. Cung cấp API Route `/api/rsvp` chuyển tiếp dữ liệu vào Google Sheet qua Webhook, đồng thời giữ Supabase Realtime Channel cho Guestbook.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4 (`@tailwindcss/postcss`), Supabase JS Client (Realtime), Canvas Confetti, Lucide React, Motion.

**Spec:** `docs/superpowers/specs/2026-10-20-nextjs-typescript-migration-design.md`

## Global Constraints

- Không làm thay đổi giao diện tươi sáng, lãng mạn, các hiệu ứng animation (hoa rơi, countdown, confetti, audio player đĩa than quay, lightbox ảnh).
- Next.js biến môi trường cho client phải bắt đầu bằng `NEXT_PUBLIC_`.
- Tên cô dâu - chú rể: Phan Anh & Ngọc Yến.
- Album ảnh cưới duy trì đúng 3 mục lọc: "Ảnh chụp chung", "Ảnh cô dâu", "Ảnh chú rể".

## Review Focus

1. **Hydration Mismatch:** Các component dùng thời gian động (`Date.now()`, countdown trong Hero, audio player) phải render an toàn không gây lỗi Hydration giữa SSR và Client.
2. **Missing Google Sheet Webhook:** Khi chưa cấu hình URL Google Sheet, form RSVP phải tự động fallback về demo/local storage mượt mà không crash.
3. **Supabase Realtime Connection:** Khi Supabase chưa có key thật hoặc offline, guestbook vẫn hoạt động ổn định và có thông báo trực quan.
4. **Tailwind CSS v4 trong Next.js:** Đảm bảo tất cả lớp tiện ích, phông chữ và keyframe animation trong `globals.css` hoạt động chính xác qua `@tailwindcss/postcss`.
5. **Image Remote Patterns:** Cấu hình đầy đủ host `images.unsplash.com` và `img.vietqr.io` trong `next.config.ts`.

---

### Task 1: Package Dependencies & Next.js Scaffolding

**Files:**
- Modify: `package.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Modify: `tsconfig.json`

**Interfaces:**
- Produces: Môi trường Next.js chạy được lệnh `next dev`, `next build`.

- [ ] **Step 1: Cập nhật `package.json`**
  - Thêm `next@latest`, `@tailwindcss/postcss`, `postcss`.
  - Gỡ bỏ `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `express`, `tsx`.
  - Đổi scripts sang:
    ```json
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "next lint"
    ```
- [ ] **Step 2: Cài đặt packages với npm**
  - Chạy `npm install` để cập nhật node_modules và lockfile.
- [ ] **Step 3: Tạo `postcss.config.mjs`**
  - Cấu hình plugin `@tailwindcss/postcss`.
- [ ] **Step 4: Tạo `next.config.ts`**
  - Cấu hình `images.remotePatterns` cho `images.unsplash.com` và `img.vietqr.io`.
- [ ] **Step 5: Cập nhật `tsconfig.json` cho Next.js**
  - Đặt `jsx: "preserve"`, thêm plugin `next`, cấu hình path aliases `@/*`.
- [ ] **Step 6: Xác minh cài đặt Next.js**
  - Chạy: `npx next --version`
  - Kết quả mong đợi: Hiển thị phiên bản Next.js (15.x / 16.x).

---

### Task 2: Root Layout, Global Styles & App Router Entry

**Files:**
- Create: `src/app/globals.css`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Delete: `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`

**Interfaces:**
- Consumes: Google Fonts (`Playfair_Display`, `Cormorant_Garamond`, `Montserrat`, `Alex_Brush`), all components from `src/components/`.
- Produces: Trang chủ hoàn chỉnh được render qua App Router.

- [ ] **Step 1: Tạo `src/app/globals.css`**
  - Chuyển toàn bộ nội dung từ `src/index.css` (Tailwind directive `@import "tailwindcss";`, font family classes, `.bg-romantic-pattern`, `.animate-petal`, custom scrollbar).
- [ ] **Step 2: Tạo `src/app/layout.tsx`**
  - Nạp Google Fonts thông qua `next/font/google`.
  - Khai báo `metadata` chuẩn SEO: Title "Thiệp Cưới Online - Phan Anh & Ngọc Yến", Description, OpenGraph, Viewport.
  - Cấu hình thẻ `<html>` và `<body>` với nền sáng `bg-[#FFFDFB] text-stone-800`.
- [ ] **Step 3: Tạo `src/app/page.tsx`**
  - Chuyển logic từ `src/App.tsx` sang `src/app/page.tsx`.
  - Lắp ráp các Section: `FloatingPetals`, `AudioPlayer`, `Navbar`, `Hero`, `Story`, `Invitation`, `Gallery`, `RSVPForm`, `Guestbook`, `GiftBox`, `Footer`, `SupabaseModal`.
- [ ] **Step 4: Dọn dẹp các tệp tin Vite cũ**
  - Xóa `index.html`, `vite.config.ts`, `src/main.tsx`, `src/App.tsx`, `src/index.css`.
- [ ] **Step 5: Kiểm tra type check bước đầu**
  - Chạy: `npx tsc --noEmit`
  - Ghi nhận và chuẩn bị cho Task 3.

---

### Task 3: Client Components Directives & Environment Migration

**Files:**
- Modify: Tất cả 13 file components trong `src/components/`
- Modify: `src/lib/supabase.ts`
- Modify: `.env.example`, `.env`

**Interfaces:**
- Consumes: `process.env.NEXT_PUBLIC_SUPABASE_URL`, `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Produces: Toàn bộ component hoạt động trơn tru trong môi trường Next.js SSR/Client.

- [ ] **Step 1: Thêm `'use client'` vào đầu các components**
  - `src/components/Navbar.tsx`
  - `src/components/Hero.tsx`
  - `src/components/Story.tsx`
  - `src/components/Invitation.tsx`
  - `src/components/Gallery.tsx`
  - `src/components/RSVPForm.tsx`
  - `src/components/Guestbook.tsx`
  - `src/components/GiftBox.tsx`
  - `src/components/AudioPlayer.tsx`
  - `src/components/FloatingPetals.tsx`
  - `src/components/SupabaseModal.tsx`
  - `src/components/ScrollReveal.tsx`
- [ ] **Step 2: Cập nhật biến môi trường trong `src/lib/supabase.ts`**
  - Thay `(import.meta as any).env?.VITE_SUPABASE_URL` bằng `process.env.NEXT_PUBLIC_SUPABASE_URL`.
  - Thay `(import.meta as any).env?.VITE_SUPABASE_ANON_KEY` bằng `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- [ ] **Step 3: Cập nhật `.env.example` và `.env`**
  - Đổi tiền tố sang `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
  - Bổ sung biến `GOOGLE_SHEET_WEBHOOK_URL`.
- [ ] **Step 4: Kiểm tra không còn tàn dư `import.meta.env` trong codebase**
  - Chạy tìm kiếm chuỗi `import.meta` để đảm bảo 100% sạch.

---

### Task 4: Google Sheets RSVP Route & Integration

**Files:**
- Create: `src/app/api/rsvp/route.ts`
- Modify: `src/components/RSVPForm.tsx`
- Modify: `src/components/SupabaseModal.tsx` (hoặc modal cài đặt) để hiển thị mã Google Apps Script

**Interfaces:**
- Consumes: POST body `{ name, phone, attending, guestsCount, side, message, dietaryRequirements }`.
- Produces: API response `{ success: boolean, message: string, mode: 'google_sheet' | 'local' }`.

- [ ] **Step 1: Tạo Route Handler `src/app/api/rsvp/route.ts`**
  - Nhận request POST JSON.
  - Nếu có biến môi trường `GOOGLE_SHEET_WEBHOOK_URL`, gửi fetch POST tới webhook Google Apps Script.
  - Trả về status 200 kèm phản hồi thành công.
  - Xử lý lỗi try/catch để trả về fallback rõ ràng.
- [ ] **Step 2: Cập nhật `src/components/RSVPForm.tsx`**
  - Gọi `/api/rsvp` khi người dùng nhấn xác nhận tham dự.
  - Lưu trữ local fallback nếu request lỗi hoặc chưa có webhook.
  - Bắn pháo hoa confetti khi xác nhận thành công.
- [ ] **Step 3: Cung cấp mã Google Apps Script 1-click**
  - Đưa đoạn mã Google Apps Script mẫu vào tab tài liệu / hướng dẫn cấu hình để người dùng copy trực tiếp vào Google Sheet của họ.

---

### Task 5: Supabase Realtime Guestbook Integration

**Files:**
- Modify: `src/lib/supabase.ts`
- Modify: `src/components/Guestbook.tsx`

**Interfaces:**
- Consumes: Supabase Realtime Client (`supabase.channel('guestbook-realtime')`).
- Produces: Tự động cập nhật danh sách lời chúc khi có INSERT / UPDATE mới.

- [ ] **Step 1: Bổ sung hàm `subscribeGuestbookRealtime` vào `src/lib/supabase.ts`**
  - Lắng nghe sự kiện `postgres_changes` trên bảng `guestbook`.
  - Gọi callback cập nhật state lời chúc khi có row mới hoặc update like.
- [ ] **Step 2: Cập nhật `src/components/Guestbook.tsx`**
  - Trong `useEffect`, kích hoạt subscription khi đã kết nối Supabase.
  - Tự động hủy (cleanup) channel khi unmount component để tránh memory leak.
- [ ] **Step 3: Kiểm tra hành vi realtime và fallback**
  - Đảm bảo khi chạy offline/local demo, gửi lời chúc và thả tim vẫn cập nhật state cục bộ bình thường.

---

### Task 6: Thư mục & Cấu trúc Album ảnh sẵn sàng cho User

**Files:**
- Create: Thư mục `public/images/gallery/couple/`, `public/images/gallery/bride/`, `public/images/gallery/groom/`
- Modify: `src/data/weddingData.ts` (chuẩn bị sẵn comment hướng dẫn thay ảnh)

**Interfaces:**
- Consumes: Cấu trúc 3 danh mục: `couple`, `bride`, `groom`.
- Produces: Bộ sưu tập ảnh cưới sẵn sàng nhận ảnh thật từ người dùng mà không cần sửa đổi component.

- [ ] **Step 1: Tạo cấu trúc thư mục chứa ảnh trong `public/images/gallery/`**
- [ ] **Step 2: Hướng dẫn rõ ràng trong `src/data/weddingData.ts`**
  - Giữ danh mục chuẩn: `category: 'couple' | 'bride' | 'groom'`.
  - Người dùng có thể copy ảnh vào `public/images/gallery/` hoặc truyền link trực tiếp.

---

### Task 7: Build & Verification

**Files:** Toàn bộ dự án.

- [ ] **Step 1: Chạy Type Check**
  - Chạy: `npx tsc --noEmit`
  - Đạt: 0 lỗi.
- [ ] **Step 2: Chạy Next.js Production Build**
  - Chạy: `npx next build`
  - Đạt: Build thành công trang `/` và Route `/api/rsvp`.
- [ ] **Step 3: Kiểm tra chạy ứng dụng**
  - Khởi động dev server và xác minh các tính năng chính: Hero countdown, Chuyện chúng mình, Thiệp cưới Google Maps, Album ảnh 3 tab, RSVP form Google Sheet, Sổ lưu bút realtime, Hộp mừng VietQR, Nhạc cưới.
