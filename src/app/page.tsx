'use client';

import React, { useState } from 'react';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Story } from '@/components/Story';
import { Invitation } from '@/components/Invitation';
import { Gallery } from '@/components/Gallery';
import { RSVPForm } from '@/components/RSVPForm';
import { Guestbook } from '@/components/Guestbook';
import { GiftBox } from '@/components/GiftBox';
import { Footer } from '@/components/Footer';
import { AudioPlayer } from '@/components/AudioPlayer';
import { FloatingPetals } from '@/components/FloatingPetals';
import {
  weddingCoupleData,
  weddingStoryData,
  weddingEvents,
  galleryPhotos,
} from '@/data/weddingData';

export default function WeddingPage() {
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFDFB] text-stone-800 flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900">
      {/* Falling Romantic Petals Effect */}
      <FloatingPetals />

      {/* Floating Audio Player */}
      <AudioPlayer
        isPlaying={isPlayingMusic}
        onToggle={() => setIsPlayingMusic(!isPlayingMusic)}
      />

      {/* Top Navigation Bar */}
      <Navbar
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={() => setIsPlayingMusic(!isPlayingMusic)}
      />

      {/* Main Single Page Sections */}
      <main className="flex-1">
        {/* 1. Hero Section (Trang bìa & Đếm ngược) */}
        <Hero
          couple={weddingCoupleData}
          onRSVPClick={() => scrollToSection('rsvp')}
          onGuestbookClick={() => scrollToSection('guestbook')}
        />

        {/* 2. Chuyện Chúng Mình (Our Love Story) */}
        <Story story={weddingStoryData} />

        {/* 3. Thiệp Mời & Chi Tiết Lễ Cưới (Google Maps & Add to Calendar) */}
        <Invitation
          couple={weddingCoupleData}
          events={weddingEvents}
        />

        {/* 4. Album Ảnh Cưới (Masonry Grid & Fullscreen Lightbox) */}
        <Gallery photos={galleryPhotos} />

        {/* 5. Xác Nhận Tham Gia (RSVP Form with Google Sheet & Supabase Integration) */}
        <RSVPForm />

        {/* 6. Sổ Lưu Bút & Lời Chúc (Guestbook with Supabase Realtime) */}
        <Guestbook />

        {/* 7. Hộp Mừng Cưới (VietQR & Tài khoản mừng hạnh phúc) */}
        <GiftBox couple={weddingCoupleData} />
      </main>

      {/* Footer */}
      <Footer couple={weddingCoupleData} />
    </div>
  );
}
