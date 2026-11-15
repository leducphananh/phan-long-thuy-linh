'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface SplashScreenProps {
  onEnter: () => void;
  coupleName?: string;
  weddingDate?: string;
  lunarDate?: string;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onEnter,
  coupleName = 'Phan Long & Thuỳ Linh',
  weddingDate = '24 · 12 · 2026',
  lunarDate = '16 Tháng 11 Năm Bính Ngọ',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExiting, setIsExiting] = useState(false);

  // Khóa cuộn trang khi đang hiển thị màn hình mở thiệp
  useEffect(() => {
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  const handleOpen = () => {
    if (isOpen) return;
    setIsOpen(true);

    // Bắn pháo hoa giấy chúc phúc ánh kim sang trọng
    try {
      confetti({
        particleCount: 90,
        spread: 80,
        origin: { y: 0.55 },
        colors: ['#D4AF37', '#E6C665', '#9E1C38', '#C42B4E', '#FFF8DC'],
      });
    } catch {
      // Ignore confetti errors if any
    }

    // Thời gian mở nắp phong bì và thiệp trượt lên mượt mà trước khi vào trang chính
    setTimeout(() => {
      setIsExiting(true);
      setTimeout(() => {
        onEnter();
      }, 550);
    }, 750);
  };

  return (
    <AnimatePresence>
      {!isExiting && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.03 }}
          transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden px-4 select-none"
          style={{
            background: 'radial-gradient(ellipse at 50% 35%, #42111E 0%, #250912 55%, #120308 100%)',
          }}
        >
          {/* Ambient Warm Golden Glows */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-rose-600/15 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[400px] h-[250px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none" />

          {/* Decorative Fine Gold Lines Frame */}
          <div className="absolute inset-4 sm:inset-8 border border-amber-400/20 rounded-2xl pointer-events-none">
            <div className="absolute -top-1.5 -left-1.5 w-3 h-3 border-t-2 border-l-2 border-amber-300/60" />
            <div className="absolute -top-1.5 -right-1.5 w-3 h-3 border-t-2 border-r-2 border-amber-300/60" />
            <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 border-b-2 border-l-2 border-amber-300/60" />
            <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 border-b-2 border-r-2 border-amber-300/60" />
          </div>

          {/* Envelope & Calligraphy Container */}
          <motion.div
            initial={{ scale: 0.92, y: 16 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-md mx-auto flex flex-col items-center z-10"
          >
            {/* Elegant Header Tag */}
            <div className="text-center mb-6 sm:mb-8">
              <span className="text-[11px] sm:text-xs font-sans uppercase tracking-[0.35em] text-amber-200/80 font-semibold block mb-1.5">
                Trân Trọng Kính Mời
              </span>
              <h1 className="font-script text-4xl sm:text-5xl text-amber-100 tracking-wide drop-shadow-[0_2px_12px_rgba(212,175,55,0.35)]">
                {coupleName}
              </h1>
            </div>

            {/* 3D Physical Luxury Envelope */}
            <div
              style={{ perspective: '1400px' }}
              className="relative w-[310px] sm:w-[380px] h-[210px] sm:h-[240px] rounded-xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8),0_0_40px_rgba(212,175,55,0.15)] bg-gradient-to-b from-[#FDFBF7] via-[#F8F2E8] to-[#EEE5D5] border border-[#D4AF37]/50 p-3 sm:p-4 flex flex-col justify-between overflow-visible"
            >
              {/* Gold Inset Border on Envelope Body */}
              <div className="absolute inset-2 sm:inset-2.5 border border-[#D4AF37]/35 rounded-lg pointer-events-none" />

              {/* Inner Letter Card (slides up smoothly when opened) */}
              <motion.div
                initial={{ y: 0, opacity: 0 }}
                animate={
                  isOpen
                    ? { y: -95, opacity: 1, scale: 1.02 }
                    : { y: 0, opacity: 0.85, scale: 0.98 }
                }
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="absolute inset-x-3.5 sm:inset-x-4 top-3.5 sm:top-4 h-[180px] sm:h-[205px] rounded-lg bg-gradient-to-b from-white via-[#FFFDF9] to-[#FBF7F0] shadow-[0_10px_25px_rgba(0,0,0,0.18)] border border-[#D4AF37]/45 p-4 text-center flex flex-col items-center justify-center z-10"
              >
                <div className="w-8 h-px bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent mb-2" />
                <span className="text-[10px] sm:text-[11px] uppercase tracking-[0.25em] text-[#9E1C38] font-bold block mb-1">
                  Save The Date
                </span>
                <h2 className="font-serif text-lg sm:text-xl font-bold text-stone-900 tracking-wide leading-tight">
                  {coupleName}
                </h2>
                <div className="my-2 flex items-center justify-center gap-2">
                  <span className="w-6 h-px bg-[#D4AF37]/60" />
                  <span className="text-xs text-[#D4AF37] font-serif">❦</span>
                  <span className="w-6 h-px bg-[#D4AF37]/60" />
                </div>
                <p className="font-serif text-sm sm:text-base font-semibold text-stone-800 tracking-widest">
                  {weddingDate}
                </p>
                <p className="text-[10px] text-stone-500 font-serif italic mt-0.5">
                  ({lunarDate})
                </p>
              </motion.div>

              {/* Envelope Flap (Triangle Top Fold with 3D RotateX) */}
              <motion.div
                initial={{ rotateX: 0 }}
                animate={isOpen ? { rotateX: 180, zIndex: 1 } : { rotateX: 0, zIndex: 25 }}
                transition={{ duration: 0.65, ease: [0.4, 0, 0.2, 1] }}
                style={{ transformOrigin: 'top center', transformStyle: 'preserve-3d' }}
                className="absolute inset-x-0 top-0 h-[115px] sm:h-[135px] bg-gradient-to-b from-[#EFE5D5] via-[#F5EEDB] to-[#FAF4E8] border-b border-[#D4AF37]/60 shadow-[0_4px_12px_rgba(0,0,0,0.15)] [clip-path:polygon(0_0,100%_0,50%_100%)] flex items-center justify-center"
              >
                {/* Thin gold accent line inside triangle flap */}
                <div className="absolute inset-0 [clip-path:polygon(4%_0,96%_0,50%_92%)] border-b border-[#D4AF37]/35 pointer-events-none" />
              </motion.div>

              {/* Handcrafted Royal Wax Seal Stamp (Monogram PL & TL) */}
              <motion.div
                animate={isOpen ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
                transition={{ duration: 0.3 }}
                className="absolute left-1/2 top-[100px] sm:top-[120px] -translate-x-1/2 -translate-y-1/2 z-30 pointer-events-none"
              >
                {/* Organic wax perimeter */}
                <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-gradient-to-br from-[#8E1728] via-[#6B0D1B] to-[#45050F] shadow-[0_6px_20px_rgba(0,0,0,0.55),inset_0_2px_4px_rgba(255,255,255,0.25)] border-2 border-[#D4AF37]/75 flex flex-col items-center justify-center text-[#F6E29F] ring-4 ring-[#6B0D1B]/40">
                  {/* Embossed inner gold ring */}
                  <div className="absolute inset-1.5 rounded-full border border-[#D4AF37]/50 flex flex-col items-center justify-center">
                    <span className="font-serif text-[11px] sm:text-xs font-bold tracking-[0.15em] text-[#F9E9B8] leading-none drop-shadow-xs">
                      PL
                    </span>
                    <span className="text-[9px] text-[#D4AF37] my-0.5 leading-none">
                      ✦
                    </span>
                    <span className="font-serif text-[10px] sm:text-[11px] font-bold tracking-[0.15em] text-[#F9E9B8] leading-none drop-shadow-xs">
                      TL
                    </span>
                  </div>
                </div>
              </motion.div>

              {/* Bottom Pocket Cover (Polygon overlay for letter depth) */}
              <div className="absolute inset-x-0 bottom-0 h-[115px] sm:h-[135px] bg-gradient-to-t from-[#F8F2E7] via-[#F5EDDD] to-transparent [clip-path:polygon(0_100%,100%_100%,50%_0)] pointer-events-none z-15 border-t border-[#D4AF37]/20" />
            </div>

            {/* Luxurious Gold Button: MỞ THIỆP MỜI */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="mt-9 sm:mt-11 text-center"
            >
              <button
                onClick={handleOpen}
                disabled={isOpen}
                className="group relative inline-flex items-center justify-center px-9 sm:px-11 py-3.5 sm:py-4 rounded-full font-serif text-sm sm:text-base font-bold tracking-[0.2em] uppercase text-[#241208] cursor-pointer active:scale-95 transition-all shadow-[0_8px_30px_rgba(212,175,55,0.45)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.65)] hover:-translate-y-0.5 border border-[#FFF4D0]"
                style={{
                  background: 'linear-gradient(135deg, #E6C86E 0%, #C89C32 50%, #E8CE7D 100%)',
                }}
              >
                <span className="relative z-10 flex items-center gap-2">
                  <span className="text-xs">✦</span>
                  <span>Mở Thiệp Mời</span>
                  <span className="text-xs">✦</span>
                </span>
                {/* Glossy highlight sweep */}
                <div className="absolute inset-0 rounded-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
