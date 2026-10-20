# Đặc tả thiết kế kỹ thuật: Chuyển đổi Thiệp Cưới Online sang Next.js App Router & TypeScript

- **Ngày tạo:** 2026-10-20
- **Dự án:** Thiệp Cưới Online (Wedding Invitation) - Phan Anh & Ngọc Yến
- **Trạng thái:** Bản thảo đã thống nhất phương án (Approved by User)

---

## 1. Mục tiêu & Phạm vi

Chuyển đổi toàn bộ ứng dụng thiệp cưới hiện tại (đang chạy trên nền Vite + React 19 SPA) sang **Next.js 15 (App Router)** với **TypeScript** và **Tailwind CSS v4**, nhằm:
- Tối ưu hóa SEO và OpenGraph Metadata khi gửi link thiệp mời qua mạng xã hội (Facebook, Zalo, iMessage).
- Giữ nguyên 100% giao diện tươi sáng, lãng mạn, các hiệu ứng animation (hoa rơi, scroll reveal, countdown, confetti, audio player đĩa than quay, lightbox ảnh).
- Sẵn sàng triển khai trực tiếp lên Vercel hoặc bất kỳ môi trường Node.js nào.
- **RSVP lưu vào Google Sheet:** Tích hợp endpoint Next.js `/api/rsvp` gửi dữ liệu đến Google Apps Script Web App gắn với file Google Sheet của bạn (kèm hướng dẫn tạo file & script 1-click).
- **Sổ lưu bút lưu Supabase Realtime:** Đồng bộ tức thì (Realtime Channel `postgres_changes`) khi có lời chúc mới hoặc lượt thả tim mà không cần tải lại trang.
- **Album ảnh dạng modular:** Thiết kế sẵn sàng để dễ dàng thay thế toàn bộ bằng folder ảnh của bạn ngay khi bạn cung cấp.

---

## 2. Kiến trúc tổng thể

### 2.1. Phân loại Server & Client Components
Theo triết lý của Next.js App Router:
- **Server Components:**
  - `src/app/layout.tsx`: Quản lý thẻ `<html>`, `<body>`, nạp phông chữ qua `next/font/google` (`Playfair Display`, `Cormorant Garamond`, `Montserrat`, `Alex Brush`), cấu hình `metadata` (title, description, openGraph, twitter, viewport).
  - `src/app/page.tsx`: Khung trang chính, render các section theo đúng thứ tự.
- **Client Components (chứa chỉ thị `'use client'`):**
  - `Navbar.tsx`: Xử lý scroll header, mobile drawer menu, nút bật tắt nhạc.
  - `Hero.tsx`: Đồng hồ đếm ngược thời gian thực (`useState`, `useEffect`).
  - `Story.tsx`: Hiệu ứng cuộn và hình ảnh mốc thời gian.
  - `Invitation.tsx`: Tab chuyển đổi lễ thành hôn / tiệc cưới, Google Maps iframe, nút tải file `.ics` và thêm Google Calendar.
  - `Gallery.tsx`: Lọc 3 tab (Ảnh chụp chung, Ảnh cô dâu, Ảnh chú rể), Lightbox tương tác bàn phím (ESC, Prev, Next).
  - `RSVPForm.tsx`: Xử lý form, tương tác Supabase, hiệu ứng pháo hoa `canvas-confetti`.
  - `Guestbook.tsx`: Xử lý form chúc phúc, realtime sync, nút thả tim `likes_count`.
  - `GiftBox.tsx`: Tab QR VietQR và chức năng copy số tài khoản vào clipboard.
  - `AudioPlayer.tsx`: Điều khiển Web Audio HTML5 và xoay đĩa than vinyl.
  - `FloatingPetals.tsx`: Hiệu ứng cánh hoa rơi nhẹ nhàng với nút bật/tắt.
  - `SupabaseModal.tsx`: Modal hướng dẫn SQL DDL và nhập key trực tiếp trên trình duyệt.
  - `ScrollReveal.tsx`: Sử dụng `IntersectionObserver` kích hoạt hoạt họa trượt vào màn hình.

### 2.2. Xử lý Dữ liệu: Google Sheet & Supabase Realtime
1. **RSVP -> Google Sheet:**
   - Tạo Route Handler `src/app/api/rsvp/route.ts` trong Next.js.
   - Khi khách gửi form RSVP, API tiếp nhận và chuyển tiếp dữ liệu tới **Google Apps Script Web App URL** (`GOOGLE_SHEET_WEBHOOK_URL`).
   - Cung cấp sẵn đoạn mã Google Apps Script 1-click (chỉ cần paste vào Google Sheet > Extensions > Apps Script) để tự động ghi các cột: *Thời gian gửi, Họ tên, Số điện thoại, Tham dự, Số người đi cùng, Khách nhà trai/gái, Lời nhắn, Ghi chú ăn uống*.
   - Dự phòng: Nếu chưa cấu hình webhook URL, form vẫn lưu demo ở trình duyệt để kiểm thử mượt mà.
2. **Sổ lưu bút -> Supabase Realtime:**
   - Sử dụng Supabase Realtime Channel (`supabase.channel('public:guestbook')`) lắng nghe sự kiện `INSERT` và `UPDATE` trên bảng `guestbook`.
   - Bất kỳ khách nào gửi lời chúc hoặc bấm thả tim, danh sách trên màn hình của tất cả mọi người đang mở web sẽ cập nhật ngay lập tức mà không cần bấm F5.
3. **Quản lý Album ảnh:**
   - Chuẩn bị sẵn thư mục `public/images/gallery/` với 3 danh mục con (`couple/`, `bride/`, `groom/`) hoặc file cấu hình `src/data/weddingData.ts`.
   - Khi bạn gửi folder ảnh, chỉ cần chép ảnh vào thư mục hoặc cập nhật danh sách tên file là album tự nhận diện hoàn chỉnh.

```text
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── rsvp/
│   │   │       └── route.ts   # Route Handler ghi nhận RSVP và gửi Google Sheet
│   │   ├── layout.tsx         # Root layout + Fonts + Metadata
│   │   ├── page.tsx           # Main page rendering
│   │   └── globals.css        # Tailwind CSS v4 directives & keyframe animations
│   ├── components/            # 13 components giao diện
│   │   ├── AudioPlayer.tsx
│   │   ├── FloatingPetals.tsx
│   │   ├── Footer.tsx
│   │   ├── Gallery.tsx
│   │   ├── GiftBox.tsx
│   │   ├── Guestbook.tsx
│   │   ├── Hero.tsx
│   │   ├── Invitation.tsx
│   │   ├── Navbar.tsx
│   │   ├── RSVPForm.tsx
│   │   ├── ScrollReveal.tsx
│   │   ├── Story.tsx
│   │   └── SupabaseModal.tsx
│   ├── data/
│   │   └── weddingData.ts     # Dữ liệu cặp đôi, mốc tình yêu, ảnh & sự kiện
│   ├── lib/
│   │   ├── calendar.ts        # Tiện ích Google Calendar & .ics file
│   │   └── supabase.ts        # Supabase client dùng NEXT_PUBLIC_ env
│   └── types/
│       └── wedding.ts         # TypeScript interfaces
├── supabase/
│   └── schema.sql             # SQL DDL cho rsvp & guestbook
├── docs/
│   └── superpowers/specs/     # Tài liệu thiết kế
├── next.config.ts             # Cấu hình Next.js (remote patterns, etc.)
├── postcss.config.mjs         # Cấu hình PostCSS cho Tailwind CSS v4
├── tsconfig.json              # TypeScript configuration cho Next.js
├── .env.example               # Mẫu NEXT_PUBLIC_SUPABASE_*
├── .env                       # Biến môi trường local
└── package.json               # Dependencies & scripts
```

---

## 4. Chi tiết thay đổi kỹ thuật

### 4.1. Gói thư viện (`package.json`)
- Thêm: `next@latest`, `@tailwindcss/postcss`, `postcss`.
- Gỡ bỏ: `vite`, `@vitejs/plugin-react`, `@tailwindcss/vite`, `express`, `tsx`.
- Cập nhật scripts:
  ```json
  "scripts": {
    "dev": "next dev --port 3000",
    "build": "next build",
    "start": "next start --port 3000",
    "lint": "next lint"
  }
  ```

### 4.2. Cấu hình Tailwind CSS v4 cho Next.js
- Tạo file `postcss.config.mjs`:
  ```javascript
  const config = {
    plugins: {
      '@tailwindcss/postcss': {},
    },
  };
  export default config;
  ```
- File `src/app/globals.css` chứa:
  ```css
  @import "tailwindcss";
  /* Custom font utilities, scrollbar, animations */
  ```

### 4.3. Cập nhật Biến môi trường (`src/lib/supabase.ts`)
- Thay thế `(import.meta as any).env?.VITE_SUPABASE_URL` bằng `process.env.NEXT_PUBLIC_SUPABASE_URL`.
- Thay thế `(import.meta as any).env?.VITE_SUPABASE_ANON_KEY` bằng `process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Giữ nguyên cơ chế `localStorage` lưu tạm khi người dùng kiểm tra key qua `SupabaseModal` hoặc chế độ demo.

### 4.4. Cấu hình hình ảnh ngoài (`next.config.ts`)
Cho phép tải ảnh từ Unsplash và VietQR:
```typescript
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'img.vietqr.io' },
    ],
  },
};

export default nextConfig;
```

---

## 5. Kế hoạch kiểm thử & Tiêu chuẩn hoàn thành

1. **Type Check:** Chạy `tsc --noEmit` đạt 0 lỗi TypeScript.
2. **Build Test:** Chạy `npm run build` tạo bundle production Next.js thành công.
3. **Chức năng nghiệp vụ:**
   - [x] Hero Section hiển thị countdown chính xác.
   - [x] Timeline Chuyện chúng mình hoạt động mượt mà.
   - [x] Lễ cưới hiển thị bản đồ Google Maps và nút thêm Calendar (.ics).
   - [x] Album ảnh lọc chuẩn 3 mục: "Ảnh chụp chung", "Ảnh cô dâu", "Ảnh chú rể" và Lightbox phóng to.
   - [x] Form RSVP gửi xác nhận, bắn pháo hoa confetti.
   - [x] Sổ lưu bút gửi lời chúc và thả tim tăng like.
   - [x] Hộp mừng cưới quét mã VietQR và copy số tài khoản.
   - [x] Nhạc nền cưới và cánh hoa rơi bật/tắt bình thường.
