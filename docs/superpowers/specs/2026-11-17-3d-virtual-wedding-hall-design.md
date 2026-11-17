# Thiết Kế Kiến Trúc: Rạp Cưới 3D Lãng Mạn Trực Tuyến (3D Virtual Wedding Hall)

- **Dự án:** Thiệp Cưới Online — Phan Long & Thùy Linh (`phan-long-thuy-linh`)
- **Ngày lập:** 17/11/2026
- **Trạng thái:** Đã thống nhất thiết kế (Approved)

---

## 1. Mục Tiêu & Tổng Quan (Goal & Overview)

Xây dựng tính năng **Rạp Cưới 3D (3D Virtual Wedding Hall)** lộng lẫy, hiện đại và lãng mạn dành cho đám cưới của cặp đôi **Phan Long & Thùy Linh** (ngày cưới: 24/12/2026).

### Yêu cầu cốt lõi:
1. **Trải nghiệm thị giác sang trọng:** Không gian lễ đường hoa cưới phong cách *Modern Romantic Floral Hall*, tông màu trắng ngọc trai, vàng gold ấm áp và hồng pastel. Lối đi trải thảm đỏ nhung dẫn đến sân khấu hoa lộng lẫy mang tên cô dâu chú rể.
2. **Khám phá tranh ảnh cưới 3D:** Khung tranh mạ vàng treo các bức ảnh cưới thật của Phan Long & Thùy Linh dọc sảnh tiệc. Khách mời có thể chạm vào để xem ảnh phóng to kèm lời tựa tình yêu.
3. **Điều khiển thân thiện (Waypoints & 360° Look-around):** Khách vuốt màn hình để xoay nhìn 360° quanh sảnh tiệc và bấm vào 4 điểm neo phát sáng trên sàn nhà để camera lướt êm tới các góc nhìn đẹp nhất.
4. **Không ảnh hưởng hiệu năng trang chính:** Rạp 3D được mở thông qua Modal toàn màn hình (Fullscreen Overlay) tải lười (Lazy Loaded / Dynamic Import), giải phóng bộ nhớ WebGL hoàn toàn khi đóng.

---

## 2. Kiến Trúc Kỹ Thuật (Architecture & Tech Stack)

### Công nghệ sử dụng:
- **Framework:** Next.js 15 (App Router, React 19, TypeScript).
- **3D Graphics Engine:** Three.js (`three`), `@react-three/fiber` (R3F) và `@react-three/drei`.
- **Styling & UI Overlay:** Tailwind CSS v4, Lucide React icons, Motion (`motion/react`).
- **Data Source:** Tái sử dụng dữ liệu ảnh, sự kiện và ngân hàng từ `src/data/weddingData.ts`.

### Cấu trúc mã nguồn:
```
src/
├── types/
│   └── virtual-hall.ts                       # Kiểu dữ liệu Waypoint, PhotoFrame3D, SceneState
├── components/
│   ├── wedding-hall-3d/
│   │   ├── VirtualHallModal.tsx               # Modal toàn màn hình (Quản lý mở/đóng, HUD, Lightbox)
│   │   ├── HallScene.tsx                      # Canvas R3F chính (Lights, Camera, Controls, Environment)
│   │   ├── HallFloorAndCarpet.tsx             # Sàn cẩm thạch trắng bóng nhẹ & Thảm đỏ nhung viền vàng
│   │   ├── StageAndArch.tsx                   # Sân khấu bục nâng, vòm hoa tươi & Backdrop tên cặp đôi
│   │   ├── PhotoFramesGallery.tsx             # Các khung tranh mạ vàng treo ảnh cưới thật
│   │   ├── WaypointsNav.tsx                   # 4 điểm neo tròn ánh sáng phát sáng trên sàn
│   │   ├── HallLighting.tsx                   # Đèn chùm pha lê, hàng nến & ánh sáng spotlight ấm
│   │   └── FloatingPetals3D.tsx               # Hiệu ứng cánh hoa hồng rơi 3D bay bổng
│   ├── Hero.tsx                               # Bổ sung nút bấm "Khám phá Rạp cưới 3D"
│   └── Navbar.tsx                             # Thêm liên kết nhanh mở Rạp cưới 3D
```

### Cơ chế Dynamic Import (Lazy Loading):
Modal 3D chỉ được tải khi người dùng click mở:
```tsx
const VirtualHallModal = dynamic(
  () => import('@/components/wedding-hall-3d/VirtualHallModal').then(m => m.VirtualHallModal),
  { ssr: false, loading: () => <HallLoadingScreen /> }
);
```

---

## 3. Chi Tiết Không Gian 3D (3D Scene Specifications)

### 3.1. Kích thước & Tọa độ không gian
- Không gian sảnh cưới dài 30m ($Z \in [-15, 15]$), rộng 14m ($X \in [-7, 7]$), trần cao 7m ($Y \in [0, 7]$).
- Lối đi thảm đỏ: Rộng 3.2m, chạy dọc từ cổng hoa ($Z = 12$) tới chân sân khấu ($Z = -10$).

### 3.2. Sân khấu & Vòm hoa (Stage & Arches)
- **Sân khấu ($Z = -12$):** Bục sân khấu 2 tầng nâng cao 0.5m, phủ nhung kem viền chỉ vàng.
- **Backdrop:** Khung vòm cung cao 4.8m mang ảnh cưới chính và dòng chữ mạ vàng kim:  
  `Phan Long & Thùy Linh · 24.12.2026`.
- **Cổng & Vòm hoa tươi:** 3 vòm hoa hình vòng cung cong mềm mại bố trí tại $Z = 10, Z = 0, Z = -8$, kết hoa hồng phấn, hoa mẫu đơn và lá xanh rủ.

### 3.3. Trưng bày tranh ảnh cưới (Photo Frames)
- Bố trí 10 khung tranh cưới mạ vàng mờ (Gold Brushed Metal) treo dọc hai bên vách sảnh tiệc và trên các giá đỡ tranh nghệ thuật.
- Sử dụng ảnh nén tối ưu sẵn tại `/images/wedding/optimized/_DSC*.jpg`.
- Ánh sáng đèn rọi nhỏ (Spotlight 3000K ấm áp) hướng vào từng bức tranh.

### 3.4. Bàn tiệc & Đèn chùm pha lê
- Bàn tiệc tròn bố trí đối xứng hai bên thảm đỏ, phủ khăn trắng, cắm bình hoa tươi nhỏ và chân nến phát ánh sáng vàng ấm lung linh.
- 3 đèn chùm pha lê thả từ trần nhà tại các vị trí $Z = 8, 0, -8$ với ánh sáng tỏa dịu (`#fff5ea`).

---

## 4. Hệ Thống Điều Khiển & Tương Tác (Controls & Interactions)

### 4.1. 4 Điểm neo di chuyển (Waypoints)
| Điểm neo | Tên hiển thị | Tọa độ Camera $(X, Y, Z)$ | Góc nhìn mục tiêu $(X, Y, Z)$ |
| :--- | :--- | :--- | :--- |
| **WP 1** | Cổng hoa đón khách | $(0, 1.7, 12)$ | $(0, 1.8, -10)$ |
| **WP 2** | Triển lãm ảnh bên trái | $(-3.5, 1.7, 2)$ | $(-6, 2, 2)$ |
| **WP 3** | Triển lãm ảnh bên phải | $(3.5, 1.7, -2)$ | $(6, 2, -2)$ |
| **WP 4** | Sân khấu hôn lễ | $(0, 1.7, -7)$ | $(0, 2.2, -12)$ |

- Khi chạm vào điểm neo trên sàn hoặc bấm nút trên thanh HUD, camera sử dụng chuyển động nội suy mượt mà (Smooth lerp damping trong 1.2s) để tới đích.

### 4.2. Xoay nhìn 360° (Orbit / Look-around)
- Vuốt chạm (touch drag) hoặc kéo chuột để quan sát xung quanh.
- Giới hạn góc nghiêng camera: `minPolarAngle = Math.PI / 3` (~60°), `maxPolarAngle = Math.PI / 1.9` (~95°) nhằm tránh việc camera đâm xuyên sàn hoặc lộn ngược trần.

### 4.3. Xem chi tiết ảnh cưới (Interactive Lightbox)
- Click/tap vào bất kỳ khung tranh nào: Mở ngay popup xem ảnh to với hiệu ứng fade-in, hiển thị tiêu đề bức ảnh và lời tựa kỷ niệm, hỗ trợ nút xem ảnh tiếp theo / quay lại.

### 4.4. Giao diện HUD tiện ích
- **Header:** Nút bật/tắt nhạc tiệc cưới, tên rạp cưới, nút đóng `✕`.
- **Bottom Dock:**
  - 4 nút chọn nhanh điểm neo: `[ Cổng hoa ]` `[ Ảnh cưới 1 ]` `[ Ảnh cưới 2 ]` `[ Sân khấu ]`.
  - Nút **💌 Gửi lời chúc**: Mở modal gửi lời chúc nhanh (lưu vào Supabase Guestbook).
  - Nút **🎁 Mừng cưới**: Mở modal VietQR của Chú Rể (Techcombank) & Cô Dâu (BIDV).

---

## 5. Tối Ưu Hiệu Năng & Xử Lý Lỗi (Performance & Robustness)

1. **Hiệu năng WebGL trên Mobile:**
   - DPR giới hạn: `dpr = [1, Math.min(window.devicePixelRatio, 2)]`.
   - Chia sẻ chung Geometries & Materials cho các cụm ghế, chân nến, khung tranh để giữ Draw Calls $\le 35$.
   - Sử dụng ảnh đã resize tối ưu ($\le 300\text{KB}$/ảnh).
2. **Dọn dẹp tài nguyên (Memory Lifecycle):**
   - Khi modal đóng: Unmount Canvas, gọi `renderer.dispose()`, dispose textures và geometries để giải phóng 100% RAM / VRAM.
3. **Phím tắt & Khả năng truy cập:**
   - Nhấn phím `Esc` để đóng modal an toàn.
   - Fallback tự động khi thiết bị không hỗ trợ WebGL (hiển thị album 360°/lightbox thay vì màn hình đen).

---

## 6. Kế Hoạch Xác Minh (Verification)
- Kiểm tra tính tương thích TypeScript và Next.js build không lỗi (`npm run build`).
- Xác minh chuyển động camera êm ái giữa 4 điểm neo không bị giật lag.
- Xác minh trải nghiệm trên màn hình điện thoại (cảm ứng vuốt xoay 360°, chạm mở ảnh to).
