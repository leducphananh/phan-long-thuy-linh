# Hướng Dẫn Thêm Ảnh Cưới Của Bạn

Bạn có thể thay thế toàn bộ ảnh cưới mẫu bằng ảnh cưới thật của bạn theo 1 trong 2 cách sau:

---

### Cách 1: Thả file ảnh vào các thư mục tương ứng (Khuyên dùng)

1. Sao chép các tệp ảnh cưới (`.jpg`, `.jpeg`, `.png`, `.webp`) của bạn vào các thư mục:
   - `public/images/gallery/couple/` — Dành cho **Ảnh chụp chung** của hai bạn
   - `public/images/gallery/bride/` — Dành cho **Ảnh cô dâu (Ngọc Yến)**
   - `public/images/gallery/groom/` — Dành cho **Ảnh chú rể (Phan Anh)**

2. Mở file `src/data/weddingData.ts`, tìm đến mảng `galleryPhotos` và cập nhật đường dẫn ảnh, ví dụ:
   ```typescript
   {
     id: 'photo-1',
     url: '/images/gallery/couple/anh-1.jpg',
     title: 'Khoảnh Khắc Hạnh Phúc',
     category: 'couple',
   },
   {
     id: 'photo-2',
     url: '/images/gallery/bride/anh-co-dau-1.jpg',
     title: 'Nàng Thơ Ngọc Yến',
     category: 'bride',
   },
   {
     id: 'photo-3',
     url: '/images/gallery/groom/anh-chu-re-1.jpg',
     title: 'Chú Rể Phan Anh',
     category: 'groom',
   }
   ```

---

### Cách 2: Dùng trực tiếp đường link ảnh online (Google Drive, Cloudinary, Imgur, v.v.)

Nếu bạn đã tải ảnh lên dịch vụ lưu trữ đám mây, bạn chỉ cần dán đường link trực tiếp vào trường `url` trong `src/data/weddingData.ts`.
Nếu dùng host ngoài, thêm domain vào `remotePatterns` trong file `next.config.ts`.
