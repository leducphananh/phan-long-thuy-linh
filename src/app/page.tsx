'use client';

import React, { useState, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/Navbar';
import { Hero } from '@/components/Hero';
import { Story } from '@/components/Story';
import { Invitation } from '@/components/Invitation';
import { Gallery } from '@/components/Gallery';
import { RSVPForm } from '@/components/RSVPForm';
import { Guestbook } from '@/components/Guestbook';
import { GiftBox } from '@/components/GiftBox';
import { Footer } from '@/components/Footer';
import { AudioPlayer, type AudioPlayerHandle } from '@/components/AudioPlayer';
import { FloatingPetals } from '@/components/FloatingPetals';
import { LiveWishNotification } from '@/components/LiveWishNotification';
import { GiftModal } from '@/components/GiftModal';
import { SplashScreen } from '@/components/SplashScreen';
import {
  weddingCoupleData,
  weddingStoryData,
  weddingEvents,
  galleryPhotos,
} from '@/data/weddingData';

const VirtualHallModal = dynamic(
  () => import('@/components/wedding-hall-3d/VirtualHallModal').then((m) => m.VirtualHallModal),
  { ssr: false }
);

export default function WeddingPage() {
  const audioPlayerRef = useRef<AudioPlayerHandle>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [isPlayingMusic, setIsPlayingMusic] = useState(false);
  const [isGiftModalOpen, setIsGiftModalOpen] = useState(false);
  const [isHallModalOpen, setIsHallModalOpen] = useState(false);

  const handleEnter = async () => {
    setShowSplash(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'instant' });
    }
    try {
      await audioPlayerRef.current?.play();
    } catch (err) {
      console.warn('Autoplay failed on splash enter:', err);
    }
  };

  const toggleMusic = () => {
    audioPlayerRef.current?.toggle();
  };

  const scrollToSection = (id: string) => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* 3D Envelope Splash Screen with Wax Seal Stamp */}
      {showSplash && (
        <SplashScreen
          onEnter={handleEnter}
          coupleName="Phan Long & Thuỳ Linh"
          weddingDate="24 · 12 · 2026"
          lunarDate="16 Tháng 11 Năm Bính Ngọ"
        />
      )}

      <div className="min-h-screen bg-[#FFFDFB] text-stone-800 flex flex-col font-sans selection:bg-rose-200 selection:text-rose-900 overflow-x-hidden w-full">
      {/* Falling Romantic Petals Effect */}
      <FloatingPetals />

      {/* Floating Live Wish Notification in Top Right */}
      <LiveWishNotification />

      {/* Floating Audio Player */}
      <AudioPlayer
        ref={audioPlayerRef}
        isPlaying={isPlayingMusic}
        onPlayStateChange={setIsPlayingMusic}
      />

      {/* Top Navigation Bar */}
      <Navbar
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={toggleMusic}
        onOpenVirtualHall={() => setIsHallModalOpen(true)}
      />

      {/* Main Single Page Sections */}
      <main className="flex-1">
        {/* 1. Hero Section (Trang bìa & Đếm ngược, Mở modal Hộp Mừng Cưới) */}
        <Hero
          couple={weddingCoupleData}
          onRSVPClick={() => scrollToSection('rsvp')}
          onGuestbookClick={() => scrollToSection('guestbook')}
          onGiftClick={() => setIsGiftModalOpen(true)}
          onVirtualHallClick={() => setIsHallModalOpen(true)}
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

      {/* Gift Box Modal opened from Hero Section */}
      <GiftModal
        isOpen={isGiftModalOpen}
        onClose={() => setIsGiftModalOpen(false)}
        couple={weddingCoupleData}
      />

      {/* 3D Virtual Wedding Hall Modal */}
      <VirtualHallModal
        isOpen={isHallModalOpen}
        onClose={() => setIsHallModalOpen(false)}
        isPlayingMusic={isPlayingMusic}
        onToggleMusic={toggleMusic}
        onOpenGiftModal={() => setIsGiftModalOpen(true)}
        onOpenGuestbook={() => scrollToSection('guestbook')}
      />
    </div>
  </>
  );
}
