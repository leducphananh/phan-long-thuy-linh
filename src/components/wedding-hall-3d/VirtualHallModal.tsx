'use client';

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  HelpCircle,
  Sparkles,
  Gift,
  Heart,
  Send,
  Copy,
  Check,
  ChevronLeft,
  ChevronRight,
  RotateCw,
  DoorOpen,
  Image as ImageIcon,
  Images,
  Crown,
  QrCode,
  Loader2,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { HALL_WAYPOINTS, Waypoint, PhotoFrameData } from '../../types/virtual-hall';
import { weddingCoupleData, galleryPhotos } from '../../data/weddingData';
import { submitGuestbookWish } from '../../lib/supabase';
import { HallScene } from './HallScene';

export interface VirtualHallModalProps {
  isOpen: boolean;
  onClose: () => void;
  isPlayingMusic?: boolean;
  onToggleMusic?: () => void;
  onOpenGiftModal?: () => void;
  onOpenGuestbook?: () => void;
}

const QUICK_WISHES = [
  'Trăm năm hạnh phúc, đầu bạc răng long! 💍',
  'Chúc hai bạn mãi ngọt ngào, thấu hiểu và bình yên bên nhau! ✨',
  'Hôn nhân viên mãn, sớm đón thiên thần nhỏ nhé! 👶',
  'Chúc mừng hạnh phúc đôi uyên ương đẹp nhất hôm nay! 🥂',
];

const RELATIONSHIPS = [
  { value: 'friend', label: 'Bạn bè' },
  { value: 'groom_friend', label: 'Bạn Chú Rể' },
  { value: 'bride_friend', label: 'Bạn Cô Dâu' },
  { value: 'colleague', label: 'Đồng nghiệp' },
  { value: 'family', label: 'Người thân' },
];

/**
 * VirtualHallModal: Fullscreen interactive 3D virtual wedding hall modal
 * Orchestrates:
 * - 3D HallScene WebGL canvas with high-performance rendering & complete memory disposal
 * - Elegant luxury HUD header bar with title, date badge, music toggle, help guide, and exit
 * - Bottom floating dock with 4 glowing waypoint markers and quick gift/wish actions
 * - High-resolution interactive photo lightbox with Next/Prev navigation
 * - Integrated 3D inline VietQR gift popup and Guestbook wish submission popup
 * - Interactive help overlay and auto-dismissing 360° tour guidance banner
 */
export const VirtualHallModal: React.FC<VirtualHallModalProps> = ({
  isOpen,
  onClose,
  isPlayingMusic = true,
  onToggleMusic,
  onOpenGiftModal,
  onOpenGuestbook,
}) => {
  // Navigation & 3D state
  const [currentWaypointId, setCurrentWaypointId] = useState<string>('wp-entrance');
  const [activePhoto, setActivePhoto] = useState<PhotoFrameData | null>(null);
  const [isLoadingScene, setIsLoadingScene] = useState<boolean>(true);
  const [showGuideBadge, setShowGuideBadge] = useState<boolean>(true);
  const [showHelpModal, setShowHelpModal] = useState<boolean>(false);

  // Inline Popups state
  const [showGiftPopup, setShowGiftPopup] = useState<boolean>(false);
  const [showWishPopup, setShowWishPopup] = useState<boolean>(false);

  // Gift Popup state
  const [activeGiftTab, setActiveGiftTab] = useState<'groom' | 'bride'>('groom');
  const [copiedAccount, setCopiedAccount] = useState<boolean>(false);
  const [copiedSyntax, setCopiedSyntax] = useState<boolean>(false);

  // Wish Popup state
  const [wishName, setWishName] = useState<string>('');
  const [wishMessage, setWishMessage] = useState<string>('');
  const [wishRelationship, setWishRelationship] = useState<string>('friend');
  const [isSubmittingWish, setIsSubmittingWish] = useState<boolean>(false);
  const [wishSuccess, setWishSuccess] = useState<boolean>(false);
  const [wishError, setWishError] = useState<string>('');

  const modalRef = useRef<HTMLDivElement | null>(null);

  // Auto-dismiss initial 360° navigation guide badge after 6 seconds
  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      setShowGuideBadge(false);
    }, 6000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Lock body scroll and handle keyboard events (Escape, ArrowLeft, ArrowRight)
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (activePhoto) {
          setActivePhoto(null);
        } else if (showGiftPopup) {
          setShowGiftPopup(false);
        } else if (showWishPopup) {
          setShowWishPopup(false);
        } else if (showHelpModal) {
          setShowHelpModal(false);
        } else {
          onClose();
        }
      } else if (activePhoto) {
        if (e.key === 'ArrowRight') {
          handleNextPhoto();
        } else if (e.key === 'ArrowLeft') {
          handlePrevPhoto();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, activePhoto, showGiftPopup, showWishPopup, showHelpModal, onClose]);

  // Safety fallback: auto-dismiss loading overlay after max 2.5s if scene hasn't signaled
  useEffect(() => {
    if (!isOpen) return;
    const fallbackTimer = setTimeout(() => {
      setIsLoadingScene(false);
    }, 2500);
    return () => clearTimeout(fallbackTimer);
  }, [isOpen]);

  // Reset internal states on modal close/open
  useEffect(() => {
    if (isOpen) {
      setCurrentWaypointId('wp-entrance');
      setActivePhoto(null);
      setShowGuideBadge(true);
      setShowGiftPopup(false);
      setShowWishPopup(false);
      setShowHelpModal(false);
      setWishSuccess(false);
    }
  }, [isOpen]);

  // Find index in galleryPhotos corresponding to activePhoto
  const currentPhotoIndex = useMemo(() => {
    if (!activePhoto) return -1;
    return galleryPhotos.findIndex(
      (p) =>
        p.fullUrl === activePhoto.fullUrl ||
        p.id === activePhoto.id ||
        (activePhoto.imageUrl && p.thumbnailUrl === activePhoto.imageUrl)
    );
  }, [activePhoto]);

  const handleNextPhoto = useCallback(() => {
    if (!galleryPhotos || galleryPhotos.length === 0) return;
    const nextIdx =
      currentPhotoIndex >= 0 ? (currentPhotoIndex + 1) % galleryPhotos.length : 0;
    const target = galleryPhotos[nextIdx];
    setActivePhoto({
      id: target.id,
      title: target.title,
      subtitle: target.subtitle,
      imageUrl: target.thumbnailUrl,
      fullUrl: target.fullUrl,
      position: activePhoto?.position || [0, 0, 0],
      rotation: activePhoto?.rotation || [0, 0, 0],
      width: activePhoto?.width || 1.8,
      height: activePhoto?.height || 2.4,
    });
  }, [currentPhotoIndex, activePhoto]);

  const handlePrevPhoto = useCallback(() => {
    if (!galleryPhotos || galleryPhotos.length === 0) return;
    const prevIdx =
      currentPhotoIndex >= 0
        ? (currentPhotoIndex - 1 + galleryPhotos.length) % galleryPhotos.length
        : galleryPhotos.length - 1;
    const target = galleryPhotos[prevIdx];
    setActivePhoto({
      id: target.id,
      title: target.title,
      subtitle: target.subtitle,
      imageUrl: target.thumbnailUrl,
      fullUrl: target.fullUrl,
      position: activePhoto?.position || [0, 0, 0],
      rotation: activePhoto?.rotation || [0, 0, 0],
      width: activePhoto?.width || 1.8,
      height: activePhoto?.height || 2.4,
    });
  }, [currentPhotoIndex, activePhoto]);

  // Gift Copy Actions
  const currentGiftPerson =
    activeGiftTab === 'groom' ? weddingCoupleData.groom : weddingCoupleData.bride;
  const syntaxSuggestion = `Mung cuoi ${weddingCoupleData.groom.name} ${weddingCoupleData.bride.name}`;

  const handleCopyAccount = () => {
    if (currentGiftPerson.bankInfo?.accountNumber) {
      navigator.clipboard.writeText(currentGiftPerson.bankInfo.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(syntaxSuggestion);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2500);
  };

  // Wish Submission Handler
  const handleSubmitWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wishName.trim() || !wishMessage.trim()) {
      setWishError('Vui lòng nhập tên và lời chúc của bạn');
      return;
    }

    setIsSubmittingWish(true);
    setWishError('');

    try {
      const avatarColors = ['rose', 'amber', 'emerald', 'indigo', 'violet'];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      const res = await submitGuestbookWish(
        wishName.trim(),
        wishMessage.trim(),
        wishRelationship,
        randomColor
      );

      if (res.success) {
        setWishSuccess(true);
        setWishName('');
        setWishMessage('');

        // Trigger celebratory confetti in 3D modal
        if (typeof window !== 'undefined') {
          try {
            confetti({
              particleCount: 80,
              spread: 70,
              origin: { y: 0.6 },
              colors: ['#D4AF37', '#e11d48', '#fda4af', '#fef08a'],
            });
          } catch {
            // Ignore confetti errors if canvas unavailable
          }
        }
      } else {
        setWishError('Không thể gửi lời chúc. Vui lòng thử lại!');
      }
    } catch (err) {
      console.error('Failed to submit wish in 3D hall:', err);
      setWishError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setIsSubmittingWish(false);
    }
  };

  // Helper for Waypoint Icon
  const getWaypointIcon = (wpId: string) => {
    switch (wpId) {
      case 'wp-entrance':
        return <DoorOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
      case 'wp-gallery-left':
        return <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
      case 'wp-gallery-right':
        return <Images className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
      case 'wp-stage':
        return <Crown className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
      default:
        return <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />;
    }
  };

  // If modal is closed, unmount completely to release 100% WebGL RAM/GPU
  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      role="dialog"
      aria-modal="true"
      aria-label="Rạp cưới ảo 3D Phan Long & Thùy Linh"
      className="fixed inset-0 z-50 bg-stone-950 flex flex-col select-none overflow-hidden"
    >
      {/* =========================================================================
          1. TOP HEADER BAR (HUD)
      ========================================================================= */}
      <header className="relative z-20 flex items-center justify-between px-3 sm:px-6 py-3 bg-gradient-to-b from-stone-950/95 via-stone-950/80 to-transparent backdrop-blur-md border-b border-amber-500/20">
        {/* Left: Romantic Title & Date */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-amber-400/20 to-rose-500/30 border border-amber-400/40 flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.3)] shrink-0">
            <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-serif text-sm sm:text-base md:text-lg font-bold bg-gradient-to-r from-amber-200 via-rose-200 to-amber-100 bg-clip-text text-transparent truncate tracking-wide">
                Rạp Cưới Online · Phan Long &amp; Thùy Linh
              </h1>
              <span className="hidden md:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-500/15 text-amber-300 border border-amber-500/30">
                Không gian 3D 360°
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-stone-400 font-sans flex items-center gap-1.5">
              <span>Hôn Lễ: 24.12.2026</span>
              <span className="text-amber-500/60">·</span>
              <span className="text-rose-300/80">Khám phá không gian thực tế ảo</span>
            </p>
          </div>
        </div>

        {/* Right: Controls & Exit */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Music Toggle */}
          {onToggleMusic && (
            <button
              type="button"
              onClick={onToggleMusic}
              className={`p-2 sm:p-2.5 rounded-full transition-all cursor-pointer border ${
                isPlayingMusic
                  ? 'bg-amber-500/20 border-amber-400/50 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]'
                  : 'bg-stone-900/80 border-stone-700/60 text-stone-400 hover:text-stone-200'
              }`}
              title={isPlayingMusic ? 'Tạm dừng nhạc nền' : 'Bật nhạc nền'}
              aria-label={isPlayingMusic ? 'Tắt nhạc nền' : 'Bật nhạc nền'}
            >
              {isPlayingMusic ? (
                <Volume2 className="w-4 h-4 text-amber-300" />
              ) : (
                <VolumeX className="w-4 h-4 text-stone-400" />
              )}
            </button>
          )}

          {/* Help / Guide Button */}
          <button
            type="button"
            onClick={() => setShowHelpModal(true)}
            className="p-2 sm:p-2.5 rounded-full bg-stone-900/80 hover:bg-stone-800 border border-stone-700/60 text-stone-300 hover:text-amber-300 transition-all cursor-pointer"
            title="Hướng dẫn điều khiển 3D"
            aria-label="Hướng dẫn điều khiển 3D"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Exit / Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="group flex items-center gap-1.5 py-1.5 px-3 sm:px-3.5 rounded-full bg-rose-950/60 hover:bg-rose-900/90 border border-rose-500/40 text-rose-200 hover:text-white transition-all shadow-md cursor-pointer active:scale-95"
            title="Thoát rạp cưới (Esc)"
            aria-label="Thoát rạp cưới"
          >
            <span className="text-xs font-medium hidden sm:inline">Thoát</span>
            <X className="w-4 h-4 transition-transform group-hover:rotate-90 duration-200" />
          </button>
        </div>
      </header>

      {/* =========================================================================
          2. CANVAS AREA (HallScene + Atmospheric Overlays)
      ========================================================================= */}
      <main className="relative flex-1 w-full h-full overflow-hidden">
        {/* 3D WebGL Canvas */}
        <HallScene
          activeWaypointId={currentWaypointId}
          onWaypointChange={setCurrentWaypointId}
          onPhotoClick={(photo) => setActivePhoto(photo)}
          onLoaded={() => setIsLoadingScene(false)}
          className="w-full h-full"
        />

        {/* Loading Overlay */}
        {isLoadingScene && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-stone-950 text-center px-4 transition-opacity duration-500">
            <div className="relative mb-5">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-amber-400/30 border-t-amber-400 animate-spin" />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-7 h-7 text-amber-300 animate-pulse" />
              </div>
            </div>
            <h2 className="font-serif text-lg sm:text-xl font-bold text-amber-200 tracking-wide mb-1.5">
              Đang mở cửa rạp cưới lộng lẫy...
            </h2>
            <p className="text-xs sm:text-sm text-stone-400 font-sans max-w-sm">
              Đang nạp không gian thực tế ảo, hoa tươi và ánh đèn pha lê lung linh
            </p>
          </div>
        )}

        {/* 360° Interaction Hint Badge (Auto-dismiss or dismiss on click) */}
        {showGuideBadge && !isLoadingScene && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
            <div className="flex items-center gap-2.5 px-3.5 sm:px-4 py-2 rounded-full bg-stone-950/85 backdrop-blur-md border border-amber-500/35 text-amber-200 text-xs sm:text-sm shadow-[0_4px_20px_rgba(0,0,0,0.5)] animate-fade-in">
              <RotateCw className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-spin" style={{ animationDuration: '4s' }} />
              <span className="font-medium whitespace-nowrap">
                Vuốt để xoay 360° · Chạm điểm neo hoặc tranh để khám phá
              </span>
              <button
                type="button"
                onClick={() => setShowGuideBadge(false)}
                className="p-1 text-stone-400 hover:text-white rounded-full transition-colors cursor-pointer ml-1"
                aria-label="Đóng gợi ý"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* =========================================================================
          3. BOTTOM DOCK (Waypoints Navigation & Quick Actions)
      ========================================================================= */}
      <footer className="relative z-20 pointer-events-none pb-4 sm:pb-6 px-3 flex justify-center">
        <div className="pointer-events-auto w-full max-w-fit bg-stone-950/85 backdrop-blur-xl border border-amber-500/30 rounded-2xl sm:rounded-3xl p-1.5 sm:p-2 shadow-[0_10px_35px_rgba(0,0,0,0.6)] flex flex-wrap items-center justify-center gap-1.5 sm:gap-2">
          {/* Waypoints List */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            {HALL_WAYPOINTS.map((wp: Waypoint) => {
              const isActive = currentWaypointId === wp.id;
              return (
                <button
                  key={wp.id}
                  type="button"
                  onClick={() => setCurrentWaypointId(wp.id)}
                  className={`group relative flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-amber-500/25 to-rose-500/20 text-amber-200 border border-amber-400/70 shadow-[0_0_15px_rgba(245,158,11,0.35)] scale-102'
                      : 'text-stone-300 hover:text-white hover:bg-stone-900/80 border border-transparent'
                  }`}
                  title={wp.name}
                >
                  <span
                    className={`transition-colors ${
                      isActive ? 'text-amber-300' : 'text-stone-400 group-hover:text-amber-200'
                    }`}
                  >
                    {getWaypointIcon(wp.id)}
                  </span>
                  <span className="whitespace-nowrap">{wp.shortName}</span>
                  {isActive && (
                    <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-amber-400 shadow-[0_0_6px_#f59e0b]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Vertical Divider */}
          <div className="hidden sm:block w-[1px] h-6 bg-stone-700/60 mx-0.5" />

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            {/* Quick Wish Button */}
            <button
              type="button"
              onClick={() => {
                setShowWishPopup(true);
                setShowGiftPopup(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium bg-rose-950/70 hover:bg-rose-900/90 text-rose-200 border border-rose-500/40 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400/40 shrink-0" />
              <span className="whitespace-nowrap">Gửi lời chúc</span>
            </button>

            {/* Quick Gift Button */}
            <button
              type="button"
              onClick={() => {
                setShowGiftPopup(true);
                setShowWishPopup(false);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-medium bg-amber-950/70 hover:bg-amber-900/90 text-amber-200 border border-amber-500/40 transition-all shadow-sm cursor-pointer active:scale-95"
            >
              <Gift className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span className="whitespace-nowrap">Mừng cưới</span>
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          4. PHOTO LIGHTBOX MODAL
      ========================================================================= */}
      {activePhoto && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={activePhoto.title || 'Xem ảnh cưới'}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-stone-950/90 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActivePhoto(null);
          }}
        >
          {/* Lightbox Inner Container */}
          <div className="relative max-w-4xl w-full max-h-[92vh] flex flex-col items-center justify-center">
            {/* Close Button Top Right */}
            <button
              type="button"
              onClick={() => setActivePhoto(null)}
              className="absolute -top-12 right-0 sm:right-2 p-2 rounded-full bg-stone-900/90 hover:bg-rose-950 border border-stone-700/80 text-stone-300 hover:text-white transition-all shadow-lg cursor-pointer z-20"
              title="Đóng xem ảnh (Esc)"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image & Navigation Frame */}
            <div className="relative flex items-center justify-center w-full">
              {/* Prev Button */}
              {galleryPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={handlePrevPhoto}
                  className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-stone-900/80 hover:bg-amber-500/30 border border-amber-500/40 text-stone-200 hover:text-amber-200 backdrop-blur-sm transition-all shadow-lg cursor-pointer active:scale-95"
                  title="Ảnh trước (Mũi tên trái)"
                  aria-label="Ảnh trước"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}

              {/* Photo Display */}
              <div className="relative rounded-2xl overflow-hidden border border-amber-500/40 shadow-[0_0_35px_rgba(0,0,0,0.8)] bg-stone-900/90 max-h-[72vh] flex items-center justify-center">
                <img
                  src={activePhoto.fullUrl || activePhoto.imageUrl}
                  alt={activePhoto.title || 'Ảnh cưới Phan Long & Thùy Linh'}
                  className="max-h-[70vh] w-auto max-w-full object-contain rounded-xl select-none"
                  loading="eager"
                />
              </div>

              {/* Next Button */}
              {galleryPhotos.length > 1 && (
                <button
                  type="button"
                  onClick={handleNextPhoto}
                  className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-stone-900/80 hover:bg-amber-500/30 border border-amber-500/40 text-stone-200 hover:text-amber-200 backdrop-blur-sm transition-all shadow-lg cursor-pointer active:scale-95"
                  title="Ảnh kế tiếp (Mũi tên phải)"
                  aria-label="Ảnh kế tiếp"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              )}
            </div>

            {/* Plaque / Caption Underneath */}
            <div className="mt-3 w-full max-w-md bg-stone-900/90 backdrop-blur-md border border-amber-500/30 rounded-2xl px-5 py-3 text-center shadow-xl">
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <h3 className="font-serif text-base sm:text-lg font-bold text-amber-200 tracking-wide">
                  {activePhoto.title || 'Khoảnh Khắc Hạnh Phúc'}
                </h3>
              </div>
              {activePhoto.subtitle && (
                <p className="text-xs sm:text-sm text-stone-300 font-sans italic">
                  {activePhoto.subtitle}
                </p>
              )}
              {currentPhotoIndex >= 0 && (
                <div className="mt-1.5 text-[11px] text-stone-400 font-medium">
                  Ảnh {currentPhotoIndex + 1} / {galleryPhotos.length}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          5. INLINE VIETQR GIFT POPUP
      ========================================================================= */}
      {showGiftPopup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="virtual-gift-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowGiftPopup(false);
          }}
        >
          <div className="relative w-full max-w-md bg-stone-900/95 border border-amber-500/30 rounded-3xl shadow-2xl p-5 sm:p-6 text-stone-100 flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-inner">
                  <Gift className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="virtual-gift-title" className="font-serif text-base sm:text-lg font-bold text-amber-200">
                    Mừng Cưới 3D
                  </h3>
                  <p className="text-xs text-stone-400">
                    Gửi quà mừng hạnh phúc tới đôi uyên ương
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowGiftPopup(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                aria-label="Đóng hộp mừng cưới"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Groom / Bride Switcher */}
            <div className="mt-4 flex items-center p-1 bg-stone-950/80 rounded-2xl border border-stone-800">
              <button
                type="button"
                onClick={() => {
                  setActiveGiftTab('groom');
                  setCopiedAccount(false);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeGiftTab === 'groom'
                    ? 'bg-amber-500/25 text-amber-200 border border-amber-400/50 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Mừng Chú Rể</span>
                <span className="text-[11px] font-normal opacity-75 ml-1">
                  ({weddingCoupleData.groom.name})
                </span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveGiftTab('bride');
                  setCopiedAccount(false);
                }}
                className={`flex-1 py-2 px-3 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                  activeGiftTab === 'bride'
                    ? 'bg-rose-500/25 text-rose-200 border border-rose-400/50 shadow-sm'
                    : 'text-stone-400 hover:text-stone-200'
                }`}
              >
                <span>Mừng Cô Dâu</span>
                <span className="text-[11px] font-normal opacity-75 ml-1">
                  ({weddingCoupleData.bride.name})
                </span>
              </button>
            </div>

            {/* QR Code Container */}
            <div className="mt-4 flex flex-col items-center">
              <div className="p-3 bg-white rounded-2xl border-2 border-amber-400/40 shadow-lg max-w-[200px] w-full aspect-square flex items-center justify-center">
                <img
                  src={currentGiftPerson.bankInfo?.qrCodeUrl}
                  alt={`Mã VietQR Mừng Cưới ${currentGiftPerson.fullName}`}
                  className="w-full h-full object-contain rounded-xl"
                  loading="eager"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-xs text-stone-700 flex flex-col items-center text-center p-2">
                          <span class="font-bold">VietQR</span>
                          <span>Quét mã chuyển khoản</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>
              <p className="text-[11px] text-stone-400 mt-2 flex items-center gap-1 text-center font-medium">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                Mở ứng dụng ngân hàng bất kỳ để quét mã VietQR tự động
              </p>
            </div>

            {/* Bank Info Card */}
            <div className="mt-4 bg-stone-950/60 rounded-2xl p-4 border border-amber-500/20 space-y-2.5">
              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-800">
                <span className="text-stone-400">Ngân hàng:</span>
                <strong className="text-amber-200 font-semibold">
                  {currentGiftPerson.bankInfo?.bankName}
                </strong>
              </div>

              <div className="flex items-center justify-between text-xs pb-1.5 border-b border-stone-800">
                <span className="text-stone-400">Chủ tài khoản:</span>
                <strong className="text-stone-200 font-bold uppercase">
                  {currentGiftPerson.bankInfo?.accountName}
                </strong>
              </div>

              <div className="flex items-center justify-between pt-0.5">
                <div>
                  <span className="text-[11px] text-stone-400 block">Số tài khoản:</span>
                  <span className="font-mono text-base sm:text-lg font-bold text-amber-300 tracking-wider">
                    {currentGiftPerson.bankInfo?.accountNumber}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyAccount}
                  className="py-1.5 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/40 text-amber-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer active:scale-95"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-300">Đã chép</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Sao chép</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Transfer Syntax Suggestion */}
            <div className="mt-3 bg-stone-950/40 rounded-xl p-2.5 border border-stone-800 flex items-center justify-between gap-2">
              <div className="min-w-0 flex-1">
                <span className="text-[10px] text-stone-400 block">Nội dung chuyển khoản gợi ý:</span>
                <span className="text-xs font-medium text-stone-200 truncate block">
                  {syntaxSuggestion}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopySyntax}
                className="p-1.5 text-stone-400 hover:text-amber-300 transition-colors cursor-pointer shrink-0"
                title="Sao chép cú pháp chuyển khoản"
              >
                {copiedSyntax ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Heartfelt Note */}
            <p className="mt-3.5 text-center text-xs text-stone-400 italic flex items-center justify-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 shrink-0" />
              Sự hiện diện &amp; lời chúc phúc của bạn là món quà trân quý nhất!
            </p>
          </div>
        </div>
      )}

      {/* =========================================================================
          6. INLINE GUESTBOOK WISH POPUP
      ========================================================================= */}
      {showWishPopup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="virtual-wish-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowWishPopup(false);
          }}
        >
          <div className="relative w-full max-w-md bg-stone-900/95 border border-rose-500/30 rounded-3xl shadow-2xl p-5 sm:p-6 text-stone-100 flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3.5 border-b border-rose-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-rose-500/20 border border-rose-400/40 text-rose-300 flex items-center justify-center shadow-inner">
                  <Heart className="w-4 h-4 fill-rose-400/40" />
                </div>
                <div>
                  <h3 id="virtual-wish-title" className="font-serif text-base sm:text-lg font-bold text-rose-200">
                    Gửi Lời Chúc Hạnh Phúc
                  </h3>
                  <p className="text-xs text-stone-400">
                    Lưu bút trực tiếp vào tiệc cưới Phan Long &amp; Thùy Linh
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowWishPopup(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                aria-label="Đóng bảng lời chúc"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Success State */}
            {wishSuccess ? (
              <div className="py-6 flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-400 flex items-center justify-center shadow-lg">
                  <Check className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg font-bold text-emerald-300">
                  Cảm ơn bạn rất nhiều! 🎉
                </h4>
                <p className="text-xs sm:text-sm text-stone-300 max-w-xs">
                  Lời chúc yêu thương của bạn đã được ghi lại trong sổ lưu bút tiệc cưới của Phan Long &amp; Thùy Linh.
                </p>
                <div className="pt-3 flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setWishSuccess(false);
                      setWishMessage('');
                    }}
                    className="px-4 py-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-medium transition-colors cursor-pointer"
                  >
                    Gửi thêm lời chúc khác
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWishPopup(false)}
                    className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-md"
                  >
                    Quay lại rạp cưới
                  </button>
                </div>
              </div>
            ) : (
              /* Form State */
              <form onSubmit={handleSubmitWish} className="mt-4 space-y-3.5">
                {/* Guest Name */}
                <div>
                  <label htmlFor="wish-name" className="block text-xs font-medium text-stone-300 mb-1">
                    Tên của bạn <span className="text-rose-400">*</span>
                  </label>
                  <input
                    id="wish-name"
                    type="text"
                    required
                    value={wishName}
                    onChange={(e) => setWishName(e.target.value)}
                    placeholder="VD: Bạn Mai, Anh Tuấn..."
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950/80 border border-stone-700/80 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-rose-400 transition-colors"
                  />
                </div>

                {/* Relationship Selector */}
                <div>
                  <label htmlFor="wish-relationship" className="block text-xs font-medium text-stone-300 mb-1">
                    Mối quan hệ
                  </label>
                  <select
                    id="wish-relationship"
                    value={wishRelationship}
                    onChange={(e) => setWishRelationship(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-stone-950/80 border border-stone-700/80 text-stone-200 text-xs sm:text-sm focus:outline-none focus:border-rose-400 transition-colors cursor-pointer"
                  >
                    {RELATIONSHIPS.map((rel) => (
                      <option key={rel.value} value={rel.value} className="bg-stone-900 text-stone-100">
                        {rel.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quick Wishes Pills */}
                <div>
                  <span className="block text-[11px] text-stone-400 mb-1.5">
                    Gợi ý lời chúc nhanh:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_WISHES.map((quick, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setWishMessage(quick)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-stone-800/80 hover:bg-rose-900/40 text-stone-300 hover:text-rose-200 border border-stone-700/60 transition-colors cursor-pointer text-left"
                      >
                        {quick}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Wish Message */}
                <div>
                  <label htmlFor="wish-message" className="block text-xs font-medium text-stone-300 mb-1">
                    Lời chúc của bạn <span className="text-rose-400">*</span>
                  </label>
                  <textarea
                    id="wish-message"
                    required
                    rows={3}
                    value={wishMessage}
                    onChange={(e) => setWishMessage(e.target.value)}
                    placeholder="Viết những lời chúc yêu thương nhất tới cô dâu & chú rể..."
                    className="w-full px-3.5 py-2 rounded-xl bg-stone-950/80 border border-stone-700/80 text-stone-100 placeholder-stone-500 text-xs sm:text-sm focus:outline-none focus:border-rose-400 transition-colors resize-none"
                  />
                </div>

                {/* Error Banner */}
                {wishError && (
                  <p className="text-xs text-rose-400 font-medium">{wishError}</p>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingWish}
                  className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all active:scale-98 disabled:opacity-60"
                >
                  {isSubmittingWish ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Đang gửi lời chúc...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Gửi Lời Chúc Mừng</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          7. INTERACTIVE HELP & INSTRUCTIONS MODAL
      ========================================================================= */}
      {showHelpModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="virtual-help-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/80 backdrop-blur-md animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowHelpModal(false);
          }}
        >
          <div className="relative w-full max-w-md bg-stone-900/95 border border-amber-500/30 rounded-3xl shadow-2xl p-5 sm:p-6 text-stone-100 flex flex-col max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3.5 border-b border-amber-500/20">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-300 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 id="virtual-help-title" className="font-serif text-base sm:text-lg font-bold text-amber-200">
                    Hướng Dẫn Khám Phá
                  </h3>
                  <p className="text-xs text-stone-400">Cách tương tác trong rạp cưới 3D</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded-full transition-colors cursor-pointer"
                aria-label="Đóng hướng dẫn"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-stone-300 font-sans">
              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                <span className="text-lg shrink-0">🔄</span>
                <div>
                  <strong className="text-amber-200 block mb-0.5">Xoay nhìn 360°</strong>
                  <span>
                    Nhấn giữ chuột trái hoặc vuốt ngón tay trên màn hình để quay mọi góc nhìn xung quanh rạp cưới.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                <span className="text-lg shrink-0">📍</span>
                <div>
                  <strong className="text-amber-200 block mb-0.5">Điểm ngắm (Waypoints)</strong>
                  <span>
                    Chạm vào 4 nút ở thanh phía dưới hoặc nhấp vào các cột sáng vàng dưới sàn để camera lướt mượt mà đến Cổng hoa, Triển lãm ảnh hay Sân khấu.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                <span className="text-lg shrink-0">🖼️</span>
                <div>
                  <strong className="text-amber-200 block mb-0.5">Triển lãm ảnh cưới</strong>
                  <span>
                    Chạm trực tiếp vào bất kỳ khung tranh cưới nào trên tường để phóng to xem ảnh độ nét cao và lướt qua album.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                <span className="text-lg shrink-0">💌</span>
                <div>
                  <strong className="text-amber-200 block mb-0.5">Chúc phúc &amp; Mừng cưới</strong>
                  <span>
                    Gửi lời chúc ấm áp hoặc quét mã VietQR mừng cưới đôi uyên ương ngay trong không gian 3D mà không bị gián đoạn.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-3 p-2.5 rounded-2xl bg-stone-950/60 border border-stone-800">
                <span className="text-lg shrink-0">⌨️</span>
                <div>
                  <strong className="text-amber-200 block mb-0.5">Phím tắt nhanh</strong>
                  <span>
                    Nhấn phím <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-amber-200 font-mono text-[11px]">Esc</kbd> để đóng ảnh hoặc thoát rạp cưới. Dùng phím mũi tên <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-amber-200 font-mono text-[11px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded bg-stone-800 text-amber-200 font-mono text-[11px]">→</kbd> để chuyển ảnh.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-400/50 text-amber-200 font-semibold text-xs transition-colors cursor-pointer"
            >
              Đã hiểu &amp; Bắt đầu khám phá
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default VirtualHallModal;
