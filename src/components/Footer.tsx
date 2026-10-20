'use client';

import React from 'react';
import { Heart, ArrowUp, Sparkles } from 'lucide-react';
import { WeddingCouple } from '../types/wedding';

interface FooterProps {
  couple: WeddingCouple;
}

export const Footer: React.FC<FooterProps> = ({ couple }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-stone-900 text-stone-300 py-16 px-4 sm:px-6 relative overflow-hidden border-t border-rose-900/30">
      {/* Subtle warm glow background */}
      <div className="absolute inset-0 bg-gradient-to-t from-stone-950 via-stone-900 to-stone-900" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-40 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-4xl mx-auto text-center relative z-10 flex flex-col items-center">
        {/* Monogram */}
        <div className="w-16 h-16 rounded-full border-2 border-rose-400/50 flex items-center justify-center font-serif text-2xl text-rose-300 mb-6 bg-stone-800/80 shadow-lg shadow-rose-950/40">
          PA &amp; NY
        </div>

        <h3 className="font-serif text-3xl sm:text-4xl font-bold text-white tracking-wide">
          {couple.groom.name} &amp; {couple.bride.name}
        </h3>

        <p className="font-script text-3xl sm:text-4xl text-rose-400 mt-2">
          Thank you for celebrating with us!
        </p>

        <p className="mt-4 text-xs sm:text-sm text-stone-300 max-w-md leading-relaxed font-sans font-medium">
          Cảm ơn vì đã là một phần đặc biệt trong ngày trọng đại và trong suốt hành trình thanh xuân của chúng mình.
        </p>

        {/* Scroll To Top Button */}
        <button
          onClick={scrollToTop}
          className="mt-8 p-3 rounded-full bg-rose-600 hover:bg-rose-500 text-white transition-all transform hover:-translate-y-1 shadow-lg shadow-rose-900/50 cursor-pointer"
          aria-label="Cuộn lên đầu trang"
        >
          <ArrowUp className="w-5 h-5" />
        </button>

        {/* Copyright notice */}
        <div className="mt-12 pt-6 border-t border-stone-800/80 w-full text-center text-xs text-stone-400 flex flex-col sm:flex-row items-center justify-center gap-2">
          <span>&copy; 2026 Wedding Invitation · {couple.groom.fullName} &amp; {couple.bride.fullName}.</span>
          <span className="hidden sm:inline">·</span>
          <span className="flex items-center gap-1 text-rose-300">
            Trọn vẹn tình yêu &amp; hạnh phúc viên mãn
          </span>
        </div>
      </div>
    </footer>
  );
};
