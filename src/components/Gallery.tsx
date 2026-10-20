'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Maximize2, Heart } from 'lucide-react';
import { GalleryPhoto } from '../types/wedding';
import { ScrollReveal } from './ScrollReveal';

interface GalleryProps {
  photos: GalleryPhoto[];
}

export const Gallery: React.FC<GalleryProps> = ({ photos }) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'bride' | 'groom'>('all');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filteredPhotos = activeCategory === 'all'
    ? photos.filter((p) => p.category === 'couple' || p.category === 'all')
    : photos.filter((p) => p.category === activeCategory);

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
    setLightboxIndex((prev) => (prev! > 0 ? prev! - 1 : filteredPhotos.length - 1));
  }, [lightboxIndex, filteredPhotos.length]);

  const handleNext = useCallback(() => {
    if (lightboxIndex === null) return;
    setLightboxIndex((prev) => (prev! < filteredPhotos.length - 1 ? prev! + 1 : 0));
  }, [lightboxIndex, filteredPhotos.length]);

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

  const currentPhoto = lightboxIndex !== null ? filteredPhotos[lightboxIndex] : null;

  return (
    <section id="gallery" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Bright Floral Garden Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1526047932273-341f2a7631f9?auto=format&fit=crop&w=2000&q=80"
          alt="Bright floral backdrop"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter blur-[2px] opacity-25 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/90 via-[#FFFDFB]/75 to-[#FFFDFB]/90" />
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
              Nụ cười rạng rỡ của cô dâu, ánh nhìn kiên định của chú rể và những khoảnh khắc ngọt ngào bên nhau trọn đời.
            </p>
          </div>
        </ScrollReveal>

        {/* Filter Tabs - 3 clean tabs: Ảnh chụp chung, Ảnh cô dâu, Ảnh chú rể */}
        <ScrollReveal animation="fade-up" delay={150} duration={600}>
          <div className="flex items-center justify-center gap-1.5 sm:gap-2 p-1.5 bg-white/95 backdrop-blur-md rounded-2xl max-w-md mx-auto mb-10 shadow-md border border-rose-100">
            {[
              { key: 'all', label: 'Ảnh Chụp Chung' },
              { key: 'bride', label: 'Ảnh Cô Dâu' },
              { key: 'groom', label: 'Ảnh Chú Rể' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveCategory(tab.key as any)}
                className={`flex-1 py-2 sm:py-2.5 px-3 sm:px-4 text-xs sm:text-sm font-semibold rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                  activeCategory === tab.key
                    ? 'bg-gradient-to-r from-rose-500 to-pink-500 text-white shadow-md shadow-rose-500/25'
                    : 'text-stone-600 hover:text-stone-900 hover:bg-rose-50/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </ScrollReveal>

        {/* Masonry / Bento Grid Layout with bright white framing */}
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 space-y-5">
          {filteredPhotos.map((photo, index) => (
            <ScrollReveal
              key={photo.id}
              animation="fade-up"
              delay={(index % 3) * 120}
              duration={650}
              className="break-inside-avoid"
            >
              <div
                onClick={() => handleOpenLightbox(index)}
                className="group relative cursor-pointer overflow-hidden rounded-3xl bg-white p-2.5 sm:p-3 border border-rose-100 shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <div className="relative overflow-hidden rounded-2xl">
                  <img
                    src={photo.thumbnailUrl}
                    alt={photo.title}
                    referrerPolicy="no-referrer"
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

                {/* Subtle category badge on hover */}
                <div className="absolute top-5 left-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/90 text-rose-700 shadow-sm backdrop-blur-xs">
                    {photo.category === 'bride' ? 'Cô Dâu' : photo.category === 'groom' ? 'Chú Rể' : 'Chung Đôi'}
                  </span>
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
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6"
          onClick={handleCloseLightbox}
        >
          {/* Top Bar Controls */}
          <div 
            className="absolute top-4 left-4 right-4 flex items-center justify-between text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-xs sm:text-sm font-semibold text-white px-3.5 py-1.5 bg-white/20 rounded-xl backdrop-blur-xs tabular-nums">
              {lightboxIndex + 1} / {filteredPhotos.length}
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
              referrerPolicy="no-referrer"
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
