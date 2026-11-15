'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Heart } from 'lucide-react';
import { GalleryPhoto } from '../types/wedding';
import { ScrollReveal } from './ScrollReveal';

interface GalleryProps {
  photos: GalleryPhoto[];
}

const PREVIEW_COUNT = 9;

export const Gallery: React.FC<GalleryProps> = ({ photos }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [activePhotos, setActivePhotos] = useState<GalleryPhoto[]>(photos);

  // Touch swipe state for mobile lightbox
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  // Hiển thị 9 ảnh đầu tiên trên lưới (3 hàng x 3 cột cân đối)
  const previewPhotos = photos.slice(0, PREVIEW_COUNT);

  // Mở lightbox từ ảnh cụ thể trên lưới (thứ tự gốc)
  const handleOpenLightbox = (index: number) => {
    setActivePhotos(photos);
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  // Mở xem thêm: Đưa các ảnh mới (chưa hiển thị trên lưới) lên đầu, 9 ảnh đã xem ở lưới đưa xuống cuối
  const handleViewMore = () => {
    const unseenPhotos = photos.slice(PREVIEW_COUNT);
    const seenPhotos = photos.slice(0, PREVIEW_COUNT);
    setActivePhotos([...unseenPhotos, ...seenPhotos]);
    setLightboxIndex(0);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = 'auto';
  }, []);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : activePhotos.length - 1));
  }, [lightboxIndex, activePhotos.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < activePhotos.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, activePhotos.length]);

  // Touch swipe gesture handlers (vuốt trái/phải trên điện thoại)
  const minSwipeDistance = 45;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    if (distance > minSwipeDistance) {
      handleNext();
    } else if (distance < -minSwipeDistance) {
      handlePrev();
    }
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (lightboxIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleCloseLightbox();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, handleCloseLightbox, handlePrev, handleNext]);

  const currentPhoto = lightboxIndex !== null ? activePhotos[lightboxIndex] : null;

  return (
    <section id="gallery" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Wedding Photo Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/wedding/optimized/_DSC3261.jpg"
          alt="Wedding gallery backdrop"
          className="w-full h-full object-cover object-center filter blur-[0.5px] opacity-55 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/70 via-[#FFFDFB]/40 to-[#FFFDFB]/70" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="font-script text-3xl sm:text-4xl text-rose-600 mb-1 drop-shadow-xs">
              Sweet Moments
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance drop-shadow-xs">
              Album Ảnh Cưới
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-400" />
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
              <div className="h-px w-12 bg-rose-400" />
            </div>
            <div className="mt-4 inline-block bg-white/80 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-rose-100/80 shadow-xs max-w-xl mx-auto">
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
                Từng nụ cười, từng ánh mắt và những khoảnh khắc ngọt ngào nhất của Phan Long &amp; Thùy Linh trên hành trình chung đôi trọn vẹn yêu thương.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Masonry Grid Layout - Thuần khiết, không chữ */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {previewPhotos.map((photo, index) => (
            <ScrollReveal
              key={photo.id}
              animation="fade-up"
              delay={(index % 3) * 100}
              duration={600}
              className="break-inside-avoid"
            >
              <div
                onClick={() => handleOpenLightbox(index)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-2.5 sm:p-3 border border-rose-100 shadow-md hover:shadow-2xl hover:border-rose-300 transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-2xl bg-stone-100">
                  <img
                    src={photo.thumbnailUrl}
                    alt="Ảnh cưới Phan Long & Thuỳ Linh"
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                    }}
                  />
                </div>

                {/* Hover Overlay with Caption on Desktop */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/85 via-stone-950/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white rounded-3xl m-2.5 sm:m-3 pointer-events-none">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold text-white drop-shadow-sm">
                        {photo.title}
                      </h4>
                      {photo.subtitle && (
                        <p className="text-xs text-rose-200 mt-0.5 font-medium drop-shadow-sm">
                          {photo.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="p-2.5 rounded-full bg-white/25 backdrop-blur-md text-white group-hover:scale-110 transition-transform shrink-0 ml-3">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        {/* Nút Xem Thêm mở ngay Lightbox Preview với thứ tự ưu tiên ảnh mới */}
        <ScrollReveal animation="fade-up" delay={150} duration={600}>
          <div className="mt-12 text-center">
            <button
              onClick={handleViewMore}
              className="inline-flex items-center gap-2.5 px-9 sm:px-11 py-3.5 sm:py-4 rounded-full bg-gradient-to-r from-rose-600 via-rose-500 to-pink-500 hover:from-rose-500 hover:to-pink-600 text-white font-serif font-bold text-sm sm:text-base shadow-xl shadow-rose-600/30 hover:shadow-rose-600/50 hover:-translate-y-0.5 transition-all duration-300 active:scale-95 cursor-pointer group"
            >
              <Maximize2 className="w-4 h-4 text-rose-100 group-hover:scale-110 transition-transform" />
              <span>Xem Thêm Ảnh Cưới ({photos.length} Ảnh)</span>
            </button>
          </div>
        </ScrollReveal>
      </div>

      {/* Fullscreen Lightbox Preview Modal - Không có chữ, thuần ảnh chất lượng cao */}
      {lightboxIndex !== null && currentPhoto && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-3 sm:p-6 select-none animate-in fade-in duration-200"
          onClick={handleCloseLightbox}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
        >
          {/* Top Bar Controls */}
          <div
            className="w-full max-w-5xl flex items-center justify-between text-white z-20 shrink-0 pt-2 px-2"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm font-semibold text-white px-4 py-1.5 bg-white/15 rounded-full backdrop-blur-md border border-white/20 tabular-nums shadow-lg">
              {lightboxIndex + 1} / {activePhotos.length}
            </div>

            <button
              onClick={handleCloseLightbox}
              className="p-2 sm:p-2.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-colors cursor-pointer border border-white/20 shadow-lg active:scale-90"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>

          {/* Main Photo Center Container */}
          <div
            className="relative flex-1 w-full max-w-5xl flex items-center justify-center py-2 sm:py-6 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation Previous Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handlePrev();
              }}
              className="absolute left-1 sm:left-4 top-1/2 -translate-y-1/2 p-2 sm:p-3.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all z-20 cursor-pointer border border-white/20 backdrop-blur-md shadow-xl active:scale-90 hover:scale-105"
              aria-label="Ảnh trước"
            >
              <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>

            {/* The Image (Pure, clean, max screen area) */}
            <img
              key={currentPhoto.id}
              src={currentPhoto.fullUrl}
              alt="Ảnh cưới Phan Long & Thuỳ Linh"
              className="max-h-[82vh] sm:max-h-[86vh] w-auto max-w-[92vw] sm:max-w-[85vw] object-contain rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 animate-in zoom-in-95 duration-200"
            />

            {/* Navigation Next Button */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleNext();
              }}
              className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 p-2 sm:p-3.5 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all z-20 cursor-pointer border border-white/20 backdrop-blur-md shadow-xl active:scale-90 hover:scale-105"
              aria-label="Ảnh tiếp theo"
            >
              <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
            </button>
          </div>

          {/* Bottom spacing */}
          <div className="h-4 shrink-0" />
        </div>
      )}
    </section>
  );
};
