# Rạp Cưới 3D Trực Tuyến (3D Virtual Wedding Hall) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Xây dựng tính năng Rạp Cưới 3D (3D Virtual Wedding Hall) phong cách Modern Romantic Floral Hall cho đám cưới Phan Long & Thùy Linh, cho phép khách mời xoay 360°, di chuyển qua 4 điểm neo, ngắm tranh ảnh cưới và tương tác chúc phúc/mừng cưới qua modal toàn màn hình.

**Architecture:** Sử dụng kiến trúc Lazy Loaded Fullscreen Modal với Three.js WebGL Canvas. Toàn bộ không gian tiệc cưới (thảm đỏ, vòm hoa, sân khấu, khung tranh ảnh cưới, đèn chùm, điểm neo phát sáng) được module hóa thành các component độc lập, chỉ nạp khi khách kích hoạt và giải phóng bộ nhớ WebGL hoàn toàn khi đóng.

**Tech Stack:** Next.js 15 (App Router, React 19, TypeScript), Three.js (`three`, `@types/three`), Tailwind CSS v4, Lucide React, Motion.

**Spec:** [docs/superpowers/specs/2026-11-17-3d-virtual-wedding-hall-design.md](file:///Users/phananh/Documents/workspace/PhanAnh/self/phan-long-thuy-linh/docs/superpowers/specs/2026-11-17-3d-virtual-wedding-hall-design.md)

## Global Constraints

- Không tăng bundle tải ban đầu của website cưới (`next/dynamic` với `ssr: false` cho toàn bộ module 3D).
- Sử dụng ảnh cưới đã nén tối ưu tại `/images/wedding/optimized/_DSC*.jpg`, không load ảnh gốc $\ge 10\text{MB}$.
- Mượt mà trên mobile với giới hạn `dpr = [1, Math.min(window.devicePixelRatio, 2)]`.
- Đảm bảo giải phóng WebGL Context và textures khi đóng modal để chống rò rỉ bộ nhớ.
- Màu sắc chủ đạo: Trắng kem ngọc trai (`#FFFDFB`), vàng gold ấm áp (`#D4AF37`), thảm đỏ nhung (`#9E1B32`), ánh đèn vàng ấm (`#FFF5EA`).

## Review Focus

- WebGL context loss hoặc trình duyệt cũ không hỗ trợ: Hiển thị giao diện fallback thông báo thân thiện kèm nút xem album thường.
- Thiết bị di động màn hình cảm ứng: Thao tác vuốt 1 ngón tay xoay 360° mượt mà, không bị xung đột với hành vi kéo cuộn trang trình duyệt.
- Tương tác chạm (touch) vào điểm neo / khung tranh trên màn hình nhỏ: Hitbox đủ lớn ($\ge 44\text{px}$) để dễ bấm trúng.
- Khi đóng modal rạp 3D: Nhạc nền và vị trí cuộn trang chính vẫn được bảo toàn nguyên vẹn.
- Kiểm tra tính tương thích TypeScript và Next.js build không lỗi (`npm run build`).

---

### Task 1: Setup Thư Viện 3D & Định Nghĩa Kiểu Dữ Liệu (Types)

**Files:**
- Create: `src/types/virtual-hall.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `Waypoint`, `PhotoFrameData`, `HallSceneState`, `CameraViewTarget` trong `src/types/virtual-hall.ts`.

- [ ] **Step 1: Cài đặt thư viện `three` và `@types/three`**

Cài đặt `three` và `@types/three` qua npm (sử dụng cờ `--legacy-peer-deps` nếu cần để tương thích mượt mà với React 19).
Command: `npm install three @types/three`

- [ ] **Step 2: Tạo file định nghĩa types `src/types/virtual-hall.ts`**

Khai báo các interface cho điểm neo camera, dữ liệu khung tranh cưới, và trạng thái scene:
```typescript
export interface Waypoint {
  id: string;
  name: string;
  shortName: string;
  cameraPosition: [number, number, number];
  targetPosition: [number, number, number];
  icon?: string;
}

export interface PhotoFrameData {
  id: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  fullUrl: string;
  position: [number, number, number];
  rotation: [number, number, number];
  width: number;
  height: number;
}

export interface HallSceneState {
  currentWaypointId: string;
  activePhoto: PhotoFrameData | null;
  isMuted: boolean;
  isLoading: boolean;
}
```

- [ ] **Step 3: Khai báo hằng số danh sách 4 điểm neo chuẩn**

Trong `src/types/virtual-hall.ts`, xuất mảng `HALL_WAYPOINTS`:
- `wp-entrance`: Cổng hoa đón khách, Camera `[0, 1.7, 12]`, Target `[0, 1.8, -10]`
- `wp-gallery-left`: Triển lãm ảnh trái, Camera `[-3.2, 1.7, 2]`, Target `[-6.5, 1.8, 2]`
- `wp-gallery-right`: Triển lãm ảnh phải, Camera `[3.2, 1.7, -2]`, Target `[6.5, 1.8, -2]`
- `wp-stage`: Sân khấu hôn lễ, Camera `[0, 1.7, -7]`, Target `[0, 2.2, -12]`

- [ ] **Step 4: Kiểm tra type check**

Run: `npx tsc --noEmit`
Expected: PASS (không có lỗi type trong `virtual-hall.ts`).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/types/virtual-hall.ts
git commit -m "feat(3d): add three.js dependencies and virtual hall types"
```

---

### Task 2: Dựng Kiến Trúc Không Gian 3D (Sàn, Thảm Đỏ, Ánh Sáng & Sân Khấu)

**Files:**
- Create: `src/components/wedding-hall-3d/HallFloorAndCarpet.tsx`
- Create: `src/components/wedding-hall-3d/HallLighting.tsx`
- Create: `src/components/wedding-hall-3d/StageAndArch.tsx`

**Interfaces:**
- Consumes: Three.js core geometries, materials & textures.
- Produces: Components dựng nền tảng không gian kiến trúc sảnh cưới lãng mạn.

- [ ] **Step 1: Tạo component `HallFloorAndCarpet.tsx`**

Xây dựng sàn đá cẩm thạch trắng ngọc trai bóng nhẹ ($14\text{m} \times 32\text{m}$) và thảm đỏ nhung ($3.2\text{m} \times 24\text{m}$) viền nẹp vàng hai bên dẫn từ cổng tới chân sân khấu.

- [ ] **Step 2: Tạo component `HallLighting.tsx`**

Thiết lập hệ thống chiếu sáng ấm áp:
- Ambient light: Ánh sáng tổng thể vàng dịu (`#fff5ea`, intensity ~0.7).
- Directional light: Góc nghiêng tạo bóng đổ mềm (`#ffe8d6`, intensity ~0.9).
- 3 Cụm đèn chùm pha lê thả trần cách điệu phát quang tại $Z = 8, 0, -8$ với point lights tỏa ấm.

- [ ] **Step 3: Tạo component `StageAndArch.tsx`**

Dựng sân khấu hôn lễ tại $Z = -12$:
- Bục nâng 2 tầng bọc nhung viền vàng.
- Cổng hoa vòm cung cong mềm mại kết hoa hồng pastel và mẫu đơn trắng.
- Backdrop chữ mạ vàng kim phát sáng nhẹ: **"Phan Long & Thùy Linh · 24.12.2026"** và ảnh cưới chính.

- [ ] **Step 4: Kiểm tra import và type**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/wedding-hall-3d/HallFloorAndCarpet.tsx src/components/wedding-hall-3d/HallLighting.tsx src/components/wedding-hall-3d/StageAndArch.tsx
git commit -m "feat(3d): implement floor, lighting, stage and floral arches"
```

---

### Task 3: Triển Lãm Tranh Ảnh Cưới & Hiệu Ứng Cánh Hoa Bay 3D

**Files:**
- Create: `src/components/wedding-hall-3d/PhotoFramesGallery.tsx`
- Create: `src/components/wedding-hall-3d/FloatingPetals3D.tsx`

**Interfaces:**
- Consumes: `galleryPhotos` từ `src/data/weddingData.ts`, `PhotoFrameData` từ `src/types/virtual-hall.ts`.
- Produces: Danh sách khung tranh tương tác 3D và hiệu ứng hạt hoa bay.

- [ ] **Step 1: Tạo `PhotoFramesGallery.tsx`**

- Chọn lọc 10 bức ảnh đẹp nhất từ `galleryPhotos` (`_DSC1879.jpg`, `_DSC2007.jpg`, `_DSC2145.jpg`, `_DSC2387.jpg`, `_DSC2695.jpg`, `_DSC2943.jpg`, `_DSC3182.jpg`, `_DSC3261.jpg`, `_DSC3551.jpg`, `_DSC3563.jpg`).
- Tạo khung tranh mạ viền vàng mỏng nổi 3D, tải texture ảnh cưới bằng `THREE.TextureLoader`.
- Hỗ trợ sự kiện hover chuột (phát sáng viền vàng) và chạm/click để kích hoạt callback `onSelectPhoto(photo)`.

- [ ] **Step 2: Tạo `FloatingPetals3D.tsx`**

- Tạo 40 hạt cánh hoa hồng 3D (`THREE.InstancedMesh` hoặc `Points`) bay bồng bềnh nhẹ nhàng trong không gian sảnh tiệc từ trần xuống sàn rồi vòng lặp lại.
- Tối ưu hiệu năng: Cập nhật vị trí bằng ma trận biến đổi nhẹ trong render loop.

- [ ] **Step 3: Kiểm tra compile & type**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/wedding-hall-3d/PhotoFramesGallery.tsx src/components/wedding-hall-3d/FloatingPetals3D.tsx
git commit -m "feat(3d): add interactive 3D photo frames and floating rose petals"
```

---

### Task 4: Hệ Thống Điểm Neo (Waypoints) & Bộ Điều Khiển Camera 360°

**Files:**
- Create: `src/components/wedding-hall-3d/WaypointsNav.tsx`
- Create: `src/components/wedding-hall-3d/HallScene.tsx`

**Interfaces:**
- Consumes: `HALL_WAYPOINTS` từ `src/types/virtual-hall.ts`, các components từ Task 2 và Task 3.
- Produces: Canvas Three.js chính điều phối toàn bộ Scene, camera nội suy mượt và vòng tròn ánh sáng.

- [ ] **Step 1: Tạo `WaypointsNav.tsx`**

- Dựng 4 vòng tròn ánh sáng phát quang nhấp nháy êm dịu trên mặt sàn tại tọa độ 4 điểm neo.
- Hiển thị nhãn text nhỏ thanh lịch trên đầu điểm neo ("Cổng hoa", "Ảnh cưới 1", "Ảnh cưới 2", "Sân khấu").
- Khi click vào vòng tròn ánh sáng $\rightarrow$ gọi `onSelectWaypoint(wp.id)`.

- [ ] **Step 2: Tạo `HallScene.tsx` điều phối Scene và Camera**

- Khởi tạo Canvas Three.js với `THREE.WebGLRenderer`, `THREE.PerspectiveCamera`.
- Tích hợp điều khiển xoay 360° (Orbit Look-around) hỗ trợ cả chạm vuốt điện thoại (touch) và kéo chuột (mouse drag).
- Cơ chế camera chuyển mượt: Khi đổi waypoint, camera di chuyển vị trí và góc nhìn tới tọa độ mục tiêu bằng phép nội suy lerp (`alpha = 0.05`) trong vòng 1.2s.
- Khóa góc nghiêng `polarAngle` để tránh camera lộn ngược hoặc chui xuống đất.

- [ ] **Step 3: Kiểm tra biên dịch**

Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**

```bash
git add src/components/wedding-hall-3d/WaypointsNav.tsx src/components/wedding-hall-3d/HallScene.tsx
git commit -m "feat(3d): implement waypoint markers and smooth camera orbit controls"
```

---

### Task 5: Modal Toàn Màn Hình, Giao Diện Điều Khiển (HUD) & Xem Ảnh Lightbox

**Files:**
- Create: `src/components/wedding-hall-3d/VirtualHallModal.tsx`

**Interfaces:**
- Consumes: `HallScene`, `weddingCoupleData` từ `src/data/weddingData.ts`.
- Produces: Modal hoàn chỉnh chứa Canvas 3D, thanh Header, thanh Dock điều khiển và popup xem ảnh to.

- [ ] **Step 1: Tạo giao diện thanh trên (Header Bar)**

- Nút Đóng `✕` nổi bật góc phải (hỗ trợ phím `Esc`).
- Tên sảnh cưới: *"Rạp Cưới Online · Phan Long & Thùy Linh"*.
- Nút bật/tắt nhạc nền tiệc cưới (đồng bộ âm thanh).

- [ ] **Step 2: Tạo thanh điều khiển phía dưới (Bottom Dock)**

- 4 Nút chọn nhanh điểm neo có icon và tên: `[Cổng hoa]` `[Ảnh cưới 1]` `[Ảnh cưới 2]` `[Sân khấu]`.
- Nút hành động nhanh:
  - **💌 Gửi lời chúc:** Mở popup lời chúc nhanh.
  - **🎁 Mừng cưới:** Mở popup tài khoản VietQR của Chú Rể (Techcombank) & Cô Dâu (BIDV).

- [ ] **Step 3: Tích hợp Popup Lightbox xem ảnh to**

- Khi khách chạm vào một khung tranh cưới 3D: Modal hiển thị popup Lightbox nổi với ảnh độ nét cao, tiêu đề, phụ đề và nút đóng lightbox.

- [ ] **Step 4: Dọn dẹp bộ nhớ WebGL khi Unmount**

- Bổ sung cleanup hook trong `VirtualHallModal`: Khi `isOpen = false`, gọi hàm dispose toàn bộ renderer, textures, geometry để giải phóng 100% RAM / GPU.

- [ ] **Step 5: Commit**

```bash
git add src/components/wedding-hall-3d/VirtualHallModal.tsx
git commit -m "feat(3d): create fullscreen virtual hall modal with HUD and lightbox"
```

---

### Task 6: Tích Hợp Vào Trang Chủ (Hero & Navbar) & Kiểm Thử Toàn Diện

**Files:**
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/Navbar.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `VirtualHallModal` qua `next/dynamic`.
- Produces: Trải nghiệm hoàn chỉnh từ nút bấm kích hoạt trên trang chủ đến rạp cưới 3D.

- [ ] **Step 1: Thêm nút mở Rạp 3D trong `Hero.tsx`**

- Bổ sung nút bấm sang trọng mạ viền vàng có hiệu ứng lấp lánh (Sparkles icon): **"Khám phá Rạp cưới 3D"** cạnh nút Mừng cưới và RSVP.
- Thêm prop `onVirtualHallClick: () => void`.

- [ ] **Step 2: Thêm liên kết nhanh trong `Navbar.tsx`**

- Thêm mục menu *"Rạp 3D"* trên thanh điều hướng để khách có thể mở xem bất cứ lúc nào khi đang cuộn trang.

- [ ] **Step 3: Kết nối State trong `src/app/page.tsx`**

- Khai báo state `isHallModalOpen` và nạp động `VirtualHallModal`:
  ```tsx
  const VirtualHallModal = dynamic(
    () => import('@/components/wedding-hall-3d/VirtualHallModal').then(m => m.VirtualHallModal),
    { ssr: false }
  );
  ```

- [ ] **Step 4: Kiểm thử build hệ thống**

Run: `npm run build`
Expected: Build Next.js thành công 100%, không phát sinh lỗi SSR hay TypeScript.

- [ ] **Step 5: Kiểm tra trực quan trên mobile & desktop**

Chạy `npm run dev` và mở thử trên trình duyệt (màn hình di động & máy tính):
- Bấm nút "Khám phá Rạp cưới 3D" $\rightarrow$ Modal mở mượt mà.
- Vuốt xoay 360°, chạm đổi 4 điểm neo $\rightarrow$ Camera lướt êm ái.
- Chạm vào ảnh cưới $\rightarrow$ Lightbox phóng to ảnh sắc nét.
- Bấm nút Đóng $\rightarrow$ Quay về vị trí trang chủ bình thường.

- [ ] **Step 6: Commit hoàn thiện**

```bash
git add src/components/Hero.tsx src/components/Navbar.tsx src/app/page.tsx
git commit -m "feat: integrate 3D virtual wedding hall modal into main page"
```
