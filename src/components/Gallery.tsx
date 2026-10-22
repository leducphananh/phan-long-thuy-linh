'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Heart } from 'lucide-react';
import { GalleryPhoto } from '../types/wedding';
import { ScrollReveal } from './ScrollReveal';

interface GalleryProps {
  photos: GalleryPhoto[];
}

export const Gallery: React.FC<GalleryProps> = ({ photos }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const handleOpenLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const handleCloseLightbox = useCallback(() => {
    setLightboxIndex(null);
    document.body.style.overflow = 'auto';
  }, []);

  const handlePrev = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : photos.length - 1));
  }, [lightboxIndex, photos.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < photos.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, photos.length]);

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

  const currentPhoto = lightboxIndex !== null ? photos[lightboxIndex] : null;

  return (
    <section id="gallery" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Wedding Photo Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/wedding/optimized/_DSC3261.jpg"
          alt="Wedding gallery backdrop"
          className="w-full h-full object-cover object-center filter blur-[3px] opacity-15 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/95 via-[#FFFDFB]/85 to-[#FFFDFB]/95" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="font-script text-3xl sm:text-4xl text-rose-500 mb-1">
              Sweet Moments
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance">
              Album Ảnh Cưới
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-300" />
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <div className="h-px w-12 bg-rose-300" />
            </div>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-lg mx-auto font-medium">
              Từng nụ cười, từng ánh mắt và những khoảnh khắc ngọt ngào nhất của Phan Long &amp; Thùy Linh trên hành trình chung đôi trọn vẹn yêu thương.
            </p>
          </div>
        </ScrollReveal>

        {/* Masonry Grid Layout with bright white framing */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {photos.map((photo, index) => (
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
                    alt={photo.title}
                    loading="lazy"
                    className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.className += ' flex items-center justify-center bg-rose-50 text-stone-500 p-8 min-h-[220px]';
                        parent.innerHTML = `<span class="text-xs font-serif text-stone-600">${photo.title}</span>`;
                      }
                    }}
                  />
                </div>

                {/* Hover Overlay with Caption */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-stone-950/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5 text-white rounded-3xl m-2.5 sm:m-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-serif text-base sm:text-lg font-bold">
                        {photo.title}
                      </h4>
                      {photo.subtitle && (
                        <p className="text-xs text-stone-200 mt-0.5">
                          {photo.subtitle}
                        </p>
                      )}
                    </div>
                    <div className="p-2 rounded-full bg-white/20 backdrop-blur-xs">
                      <Maximize2 className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxIndex !== null && currentPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={handleCloseLightbox}
        >
          {/* Top Bar Controls */}
          <div 
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm font-semibold text-white px-3.5 py-1.5 bg-white/20 rounded-xl backdrop-blur-xs tabular-nums">
              {lightboxIndex + 1} / {photos.length}
            </div>

            <button
              onClick={handleCloseLightbox}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
              aria-label="Đóng xem ảnh"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Previous Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10 cursor-pointer"
            aria-label="Ảnh trước"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Navigation Next Button */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-2 sm:p-3 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors z-10 cursor-pointer"
            aria-label="Ảnh tiếp theo"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>

          {/* Active Image Container */}
          <div
            className="max-w-4xl max-h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={currentPhoto.fullUrl}
              alt={currentPhoto.title}
              className="max-h-[75vh] w-auto max-w-full object-contain rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200"
            />
            {/* Caption */}
            <div className="mt-4 text-center text-white">
              <h4 className="font-serif text-lg sm:text-xl font-bold">
                {currentPhoto.title}
              </h4>
              {currentPhoto.subtitle && (
                <p className="text-xs sm:text-sm text-stone-300 mt-1">
                  {currentPhoto.subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
