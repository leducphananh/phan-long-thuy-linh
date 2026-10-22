'use client';

import React from 'react';
import { Heart, ArrowUp, Sparkles, MapPin, Calendar, Compass } from 'lucide-react';
import { WeddingCouple } from '../types/wedding';

interface FooterProps {
  couple: WeddingCouple;
}

export const Footer: React.FC<FooterProps> = ({ couple }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navLinks = [
    { label: 'Trang Đầu', href: '#hero' },
    { label: 'Chuyện Chúng Mình', href: '#story' },
    { label: 'Thiệp Mời Báo Hỉ', href: '#invitation' },
    { label: 'Album Ảnh Cưới', href: '#gallery' },
    { label: 'Xác Nhận Tham Dự', href: '#rsvp' },
    { label: 'Sổ Lưu Bút', href: '#guestbook' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="relative py-20 sm:py-28 px-4 sm:px-6 overflow-hidden bg-stone-950 text-stone-300 border-t border-rose-900/40">
      {/* Stunning Wedding Photo Background - High Visibility & Romantic Depth */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/wedding/optimized/_DSC3216.jpg"
          alt="Phan Long & Thùy Linh wedding footer backdrop"
          className="w-full h-full object-cover object-center filter blur-[0.5px] opacity-75 transform scale-105"
        />
        {/* Cinematic dark & warm gold/rose gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-950/80 to-stone-900/75" />
      </div>

      {/* Atmospheric Ambient Glows */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[650px] h-64 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
        {/* Luxury Glassmorphic Centerpiece Card */}
        <div className="w-full bg-stone-950/65 backdrop-blur-xl rounded-3xl p-8 sm:p-12 md:p-16 border border-white/20 shadow-2xl text-center relative overflow-hidden">
          {/* Subtle Vintage Gold Corner Flourishes */}
          <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-amber-300/40 rounded-tl-3xl m-3.5 pointer-events-none" />
          <div className="absolute top-0 right-0 w-16 h-16 border-t-2 border-r-2 border-amber-300/40 rounded-tr-3xl m-3.5 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-b-2 border-l-2 border-amber-300/40 rounded-bl-3xl m-3.5 pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-amber-300/40 rounded-br-3xl m-3.5 pointer-events-none" />

          {/* Monogram Badge */}
          <div className="w-20 h-20 mx-auto rounded-full border-2 border-amber-400/60 bg-gradient-to-br from-stone-900 via-rose-950/50 to-stone-900 flex items-center justify-center font-serif text-2xl font-bold text-amber-200 mb-6 shadow-xl shadow-rose-950/60 ring-4 ring-rose-500/20">
            <span>PL &amp; TL</span>
          </div>

          <p className="font-script text-3xl sm:text-5xl text-rose-300 mb-2 drop-shadow-md">
            Thank you for celebrating with us!
          </p>

          <h3 className="font-serif text-2xl sm:text-4xl font-bold text-white tracking-wider mb-4 drop-shadow-sm">
            {couple.groom.fullName} <span className="text-rose-400 font-sans font-light">&amp;</span> {couple.bride.fullName}
          </h3>

          <div className="flex items-center justify-center gap-3 my-4">
            <div className="h-px w-16 bg-gradient-to-r from-transparent to-amber-300/70" />
            <Heart className="w-4 h-4 fill-rose-500 text-rose-500 animate-pulse" />
            <div className="h-px w-16 bg-gradient-to-l from-transparent to-amber-300/70" />
          </div>

          <p className="mt-4 text-xs sm:text-sm text-stone-200 max-w-xl mx-auto leading-relaxed font-sans font-medium">
            Hạnh phúc trọn vẹn nhất là được sẻ chia khoảnh khắc thiêng liêng cùng những người thân yêu. Cảm ơn vì đã luôn đồng hành, yêu thương và gửi trọn lời chúc phúc cho hành trình hôn nhân son sắt của chúng mình!
          </p>

          {/* Event date & location pill badge */}
          <div className="mt-8 inline-flex flex-wrap items-center justify-center gap-3 px-5 py-2.5 rounded-2xl bg-white/10 border border-white/15 backdrop-blur-md text-xs sm:text-sm text-stone-200">
            <span className="flex items-center gap-1.5 font-medium text-amber-200">
              <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
              24 Tháng 12, 2026
            </span>
            <span className="text-stone-400">•</span>
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-4 h-4 text-rose-400 shrink-0" />
              Trống Đồng Palace, Hà Nội
            </span>
          </div>

          {/* Quick Nav Links */}
          <div className="mt-8 pt-6 border-t border-stone-800/80 flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-xs">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/15 text-stone-300 hover:text-white transition-all border border-transparent hover:border-white/20 whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Scroll To Top Button */}
          <div className="mt-8 flex flex-col items-center">
            <button
              onClick={scrollToTop}
              className="group p-3.5 rounded-full bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white transition-all transform hover:-translate-y-1 shadow-lg shadow-rose-900/60 ring-2 ring-rose-400/40 cursor-pointer flex items-center justify-center"
              aria-label="Cuộn lên đầu trang"
              title="Về đầu trang"
            >
              <ArrowUp className="w-5 h-5 group-hover:animate-bounce" />
            </button>
            <span className="text-[11px] text-stone-400 mt-2 font-medium">Về đầu trang</span>
          </div>
        </div>

        {/* Copyright notice */}
        <div className="mt-10 text-center text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>&copy; 2026 Wedding Invitation · {couple.groom.fullName} &amp; {couple.bride.fullName}.</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1 text-rose-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 inline" />
            Trọn vẹn tình yêu &amp; hạnh phúc trăm năm
          </span>
        </div>
      </div>
    </footer>
  );
};
