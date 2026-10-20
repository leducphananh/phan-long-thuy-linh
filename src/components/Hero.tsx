'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Heart, ChevronDown } from 'lucide-react';
import { WeddingCouple } from '../types/wedding';
import { ScrollReveal } from './ScrollReveal';

interface HeroProps {
  couple: WeddingCouple;
  onRSVPClick: () => void;
  onGuestbookClick: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

export const Hero: React.FC<HeroProps> = ({
  couple,
  onRSVPClick,
  onGuestbookClick
}) => {
  const targetDate = new Date(couple.weddingDate).getTime();

  const calculateTimeLeft = (): TimeLeft => {
    const now = new Date().getTime();
    const difference = targetDate - now;

    if (difference <= 0) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
    }

    return {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
      isPast: false,
    };
  };

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image: Sun-drenched, radiant and joyous outdoor wedding portrait */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=2000&q=85"
          alt="Phan Long & Thùy Linh Wedding Banner"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Soft, warm, luminous ambient gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 via-stone-900/25 to-stone-900/40" />
        <div className="absolute inset-0 bg-rose-500/10 mix-blend-overlay" />
      </div>

      {/* Decorative floral lace vignette accents */}
      <div className="absolute inset-0 pointer-events-none z-1 border-[10px] sm:border-[16px] border-white/20 m-2 sm:m-4 rounded-3xl" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 py-24 sm:py-32 text-center text-white flex flex-col items-center">
        {/* Subtle romantic script kicker */}
        <p className="font-script text-3xl sm:text-4xl lg:text-5xl text-rose-200 tracking-wide mb-2 drop-shadow-md">
          Save the Date
        </p>

        {/* Clean subtitle tag */}
        <div className="flex items-center gap-2 text-xs sm:text-sm tracking-[0.25em] uppercase text-rose-100 font-semibold mb-4 drop-shadow-sm">
          <span>Hôn Lễ Thiêng Liêng</span>
          <span aria-hidden="true">·</span>
          <span>Trân Trọng Kính Báo</span>
        </div>

        {/* Couple Names */}
        <div className="mb-6">
          <h1 className="font-serif text-4xl sm:text-6xl md:text-7xl font-bold tracking-normal leading-tight text-white drop-shadow-lg text-balance">
            {couple.groom.name} <span className="font-script text-rose-300 font-normal px-2 text-5xl sm:text-7xl md:text-8xl">&</span> {couple.bride.name}
          </h1>
          <p className="mt-2 text-xs sm:text-sm text-stone-100/90 tracking-widest font-sans uppercase font-medium drop-shadow-sm">
            {couple.groom.fullName} &amp; {couple.bride.fullName}
          </p>
        </div>

        {/* Date and Venue information */}
        <div className="flex flex-wrap items-center justify-center gap-y-2 gap-x-4 text-xs sm:text-sm text-stone-100 mb-8 max-w-xl font-medium drop-shadow-sm">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-rose-300" />
            24 Tháng 12, 2026
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="text-stone-200">
            {couple.lunarDate}
          </span>
          <span aria-hidden="true" className="text-stone-300">·</span>
          <span className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-rose-300" />
            TP. Hồ Chí Minh
          </span>
        </div>

        {/* Luminous Frosted Glass Countdown Timer Card */}
        <ScrollReveal animation="zoom-in" delay={200} duration={800}>
          <div className="w-full max-w-lg mb-10 bg-white/20 backdrop-blur-md border border-white/40 p-4 sm:p-6 rounded-3xl shadow-2xl">
            <div className="text-center mb-3">
              <p className="text-xs uppercase tracking-widest text-white font-semibold flex items-center justify-center gap-1.5 drop-shadow-sm">
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 inline animate-pulse" />
                Đếm ngược đến ngày hạnh phúc
                <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-400 inline animate-pulse" />
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2 sm:gap-4">
              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white/35 backdrop-blur-xs rounded-2xl border border-white/50 shadow-xs">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tabular-nums">
                  {String(timeLeft.days).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-700 uppercase tracking-wider font-semibold mt-1">
                  Ngày
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white/35 backdrop-blur-xs rounded-2xl border border-white/50 shadow-xs">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tabular-nums">
                  {String(timeLeft.hours).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-700 uppercase tracking-wider font-semibold mt-1">
                  Giờ
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white/35 backdrop-blur-xs rounded-2xl border border-white/50 shadow-xs">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-stone-900 tabular-nums">
                  {String(timeLeft.minutes).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-700 uppercase tracking-wider font-semibold mt-1">
                  Phút
                </span>
              </div>

              <div className="flex flex-col items-center justify-center p-2.5 sm:p-3 bg-white/35 backdrop-blur-xs rounded-2xl border border-white/50 shadow-xs">
                <span className="font-serif text-2xl sm:text-4xl font-bold text-rose-600 tabular-nums">
                  {String(timeLeft.seconds).padStart(2, '0')}
                </span>
                <span className="text-[10px] sm:text-xs text-stone-700 uppercase tracking-wider font-semibold mt-1">
                  Giây
                </span>
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Action Buttons */}
        <ScrollReveal animation="fade-up" delay={350} duration={700}>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
            <button
              onClick={onRSVPClick}
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 hover:from-rose-600 hover:to-pink-600 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-lg shadow-rose-600/30 whitespace-nowrap active:scale-95 cursor-pointer"
            >
              Xác Nhận Tham Dự (RSVP)
            </button>
            <button
              onClick={onGuestbookClick}
              className="w-full sm:w-auto px-7 py-3 text-sm font-semibold text-stone-800 bg-white/95 hover:bg-white border border-white/80 rounded-xl shadow-md transition-all whitespace-nowrap active:scale-95 cursor-pointer"
            >
              Gửi Lời Chúc Hạnh Phúc
            </button>
          </div>
        </ScrollReveal>

        {/* Romantic quote */}
        <p className="mt-12 text-xs sm:text-sm text-stone-100/90 italic font-cormorant max-w-lg leading-relaxed drop-shadow-sm">
          &ldquo;Gặp gỡ là duyên phận, nắm tay là định mệnh, và cùng nhau già đi là lời hứa trọn đời.&rdquo;
        </p>

        {/* Scroll indicator */}
        <a
          href="#story"
          aria-label="Cuộn xuống xem câu chuyện"
          className="mt-8 text-stone-200 hover:text-white transition-colors animate-bounce p-2"
        >
          <ChevronDown className="w-6 h-6" />
        </a>
      </div>
    </section>
  );
};
