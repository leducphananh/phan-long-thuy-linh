# Background Visibility, Footer Redesign & Header Gift Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make section backgrounds clearly visible and aesthetic, completely revamp the footer with a romantic photo backdrop and luxury frosted card, and add a "Mừng Cưới" button to the header opening an interactive Gift Box modal.

**Architecture:** 
- Create `GiftModal.tsx` for quick access to VietQR and bank transfer info anywhere on the page.
- Update `Navbar.tsx` to add "Mừng Cưới" CTA in both desktop bar and mobile menu, managing modal visibility state.
- Tune background opacities and gradient scrims across all sections (`Story`, `Invitation`, `Gallery`, `RSVPForm`, `Guestbook`, `GiftBox`) to achieve high visual presence without compromising text legibility.
- Redesign `Footer.tsx` with a high-opacity wedding landscape backdrop, luxury dark glassmorphism card, glowing monogram, and navigation links.

**Tech Stack:** Next.js 15, React 19, TypeScript, Tailwind CSS v4, Lucide React, VietQR.

---

### Task 1: Create `GiftModal.tsx` Component

**Files:**
- Create: `src/components/GiftModal.tsx`

**Interfaces:**
- Consumes: `WeddingCouple` from `src/types/wedding.ts`, `weddingCoupleData` from `src/data/weddingData.ts`
- Produces: `GiftModal: React.FC<{ isOpen: boolean; onClose: () => void; couple: WeddingCouple }>`

- [ ] **Step 1: Implement `GiftModal.tsx`**
  - Tabs: "Mừng Chú Rể (Phan Long)" & "Mừng Cô Dâu (Thùy Linh)".
  - Display VietQR code image with image loading error fallback.
  - Display Bank name, Account number, Account holder, and Copy button with feedback text.
  - Suggest transfer memo format (`Mung cuoi Phan Long Thuy Linh`).
  - Listen for `Escape` key and prevent background body scroll when open.
  - Outside click closes modal.

- [ ] **Step 2: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: 0 errors.

---

### Task 2: Integrate "Mừng Cưới" Action in `Navbar.tsx`

**Files:**
- Modify: `src/components/Navbar.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: `GiftModal`, `weddingCoupleData`
- Produces: Header button with `Gift` icon in desktop and mobile view, opening `GiftModal`.

- [ ] **Step 1: Update `Navbar.tsx`**
  - Add state `isGiftModalOpen` or pass callback.
  - Add "Mừng Cưới" button with `Gift` icon next to RSVP button on desktop.
  - Add "Mừng Cưới" button in mobile header bar and drawer menu.
  - Mount `GiftModal` in `Navbar` (or `page.tsx`).

- [ ] **Step 2: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: 0 errors.

---

### Task 3: Enhance Background Image Visibility Across Sections

**Files:**
- Modify: `src/components/Story.tsx`
- Modify: `src/components/Invitation.tsx`
- Modify: `src/components/Gallery.tsx`
- Modify: `src/components/RSVPForm.tsx`
- Modify: `src/components/Guestbook.tsx`
- Modify: `src/components/GiftBox.tsx`

- [ ] **Step 1: Update `Story.tsx`**
  - Set `/images/wedding/optimized/_DSC2387.jpg` to `opacity-65`, `blur-[0.5px]`.
  - Lighten scrim to `from-white/60 via-white/35 to-white/60`.

- [ ] **Step 2: Update `Invitation.tsx`**
  - Set `/images/wedding/optimized/_DSC3447.jpg` to `opacity-65`, `blur-[0.5px]`.
  - Lighten scrim to `from-[#FFFDFB]/60 via-[#FFFDFB]/35 to-[#FFFDFB]/60`.

- [ ] **Step 3: Update `Gallery.tsx`**
  - Set `/images/wedding/optimized/_DSC3261.jpg` to `opacity-55`, `blur-[0.5px]`.
  - Lighten scrim to `from-[#FFFDFB]/65 via-[#FFFDFB]/40 to-[#FFFDFB]/65`.

- [ ] **Step 4: Update `RSVPForm.tsx`**
  - Set `/images/wedding/optimized/_DSC2695.jpg` to `opacity-65`, `blur-[0.5px]`.
  - Lighten scrim to `from-[#FFFDFB]/60 via-[#FFFDFB]/35 to-[#FFFDFB]/60`.

- [ ] **Step 5: Update `Guestbook.tsx`**
  - Set `/images/wedding/optimized/_DSC3563.jpg` to `opacity-65`, `blur-[0.5px]`.
  - Lighten scrim to `from-[#FFFDFB]/60 via-[#FFFDFB]/35 to-[#FFFDFB]/60`.

- [ ] **Step 6: Update `GiftBox.tsx`**
  - Set `/images/wedding/optimized/_DSC2014.jpg` to `opacity-65`, `blur-[0.5px]`.
  - Lighten scrim to `from-[#FFFDFB]/60 via-[#FFFDFB]/35 to-[#FFFDFB]/60`.

---

### Task 4: Complete Redesign of `Footer.tsx`

**Files:**
- Modify: `src/components/Footer.tsx`

- [ ] **Step 1: Redesign `Footer.tsx`**
  - Background image: `/images/wedding/optimized/_DSC3216.jpg` with `opacity-75`, `blur-[0.5px]`.
  - Cinematic gradient: `from-stone-950/95 via-stone-900/70 to-stone-900/60`.
  - Frosted glass centerpiece card (`bg-stone-950/50 backdrop-blur-md rounded-3xl p-8 sm:p-12 border border-white/15 shadow-2xl`).
  - Monogram with gold glow ring: `PL & TL`.
  - Elegant typography for bride & groom names, thank you note, and wedding date.
  - Navigation links and stylish scroll-to-top button.

- [ ] **Step 2: Verify TypeScript compilation**
  Run: `npx tsc --noEmit`
  Expected: 0 errors.

---

### Task 5: End-to-End Verification with Browser Subagent

- [ ] **Step 1: Visual & functional testing in browser**
  - Open `http://localhost:3000`.
  - Verify section background photos are clearly visible and vivid.
  - Verify "Mừng Cưới" button in header opens `GiftModal`.
  - Test modal switching between Groom and Bride, copy button, and close.
  - Scroll down to footer and verify new romantic design with background photo.
