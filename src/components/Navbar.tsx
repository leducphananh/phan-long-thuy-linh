'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Menu, X, Music, Volume2, VolumeX } from 'lucide-react';

interface NavbarProps {
  isPlayingMusic: boolean;
  onToggleMusic: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isPlayingMusic,
  onToggleMusic,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 40);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Câu Chuyện', href: '#story' },
    { label: 'Thiệp Mời', href: '#invitation' },
    { label: 'Album Ảnh', href: '#gallery' },
    { label: 'Xác Nhận', href: '#rsvp' },
    { label: 'Sổ Lưu Bút', href: '#guestbook' },
    { label: 'Mừng Cưới', href: '#gift' },
  ];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    setMobileMenuOpen(false);
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-stone-200/70 py-2 sm:py-2.5'
          : 'bg-gradient-to-b from-stone-950/75 via-stone-900/35 to-transparent py-2.5 sm:py-3.5 text-white'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 flex items-center justify-between gap-2 sm:gap-4 flex-nowrap">
        {/* Zone 1: Wordmark */}
        <a
          href="#hero"
          onClick={(e) => handleLinkClick(e, '#hero')}
          className={`font-serif text-base sm:text-lg md:text-xl font-bold tracking-tight sm:tracking-wider flex items-center gap-1 sm:gap-1.5 shrink-0 whitespace-nowrap transition-colors ${
            isScrolled ? 'text-stone-900 hover:text-rose-700' : 'text-white hover:text-rose-200'
          }`}
        >
          <span>Phan Long</span>
          <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500 inline-block animate-pulse shrink-0" />
          <span>Thùy Linh</span>
        </a>

        {/* Zone 2: Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-7 shrink-0">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(e) => handleLinkClick(e, link.href)}
              className={`text-xs xl:text-sm font-medium tracking-wide transition-colors whitespace-nowrap shrink-0 py-1 hover:text-rose-600 ${
                isScrolled ? 'text-stone-600' : 'text-stone-100/90 drop-shadow-xs'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: Primary Actions (Music toggle + RSVP CTA + Mobile Menu Button) */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Music Quick Toggle */}
          <button
            onClick={onToggleMusic}
            aria-label="Bật/Tắt nhạc nền"
            className={`p-1.5 sm:p-2 rounded-full transition-colors flex items-center justify-center shrink-0 ${
              isScrolled
                ? 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                : 'bg-white/20 text-white backdrop-blur-xs hover:bg-white/30'
            }`}
            title={isPlayingMusic ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền'}
          >
            {isPlayingMusic ? <Volume2 className="w-4 h-4 text-rose-600 animate-pulse shrink-0" /> : <VolumeX className="w-4 h-4 shrink-0" />}
          </button>

          {/* Primary Action Button (RSVP) */}
          <a
            href="#rsvp"
            onClick={(e) => handleLinkClick(e, '#rsvp')}
            className="px-3 sm:px-4 py-1.5 text-xs sm:text-sm font-semibold text-white bg-rose-600 rounded-xl hover:bg-rose-700 transition-colors shadow-xs whitespace-nowrap shrink-0 active:scale-95"
          >
            <span className="hidden sm:inline">Xác Nhận Tham Dự</span>
            <span className="sm:hidden">RSVP</span>
          </a>

          {/* Mobile/Tablet hamburger toggle button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className={`lg:hidden p-1.5 sm:p-2 rounded-xl transition-colors shrink-0 ${
              isScrolled ? 'text-stone-800 hover:bg-stone-100' : 'text-white hover:bg-white/10'
            }`}
            aria-label="Mở menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile/Tablet dropdown drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white/98 backdrop-blur-lg border-b border-stone-200 px-4 pt-3 pb-5 shadow-xl animate-in slide-in-from-top duration-200">
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className="text-stone-700 hover:text-rose-600 font-medium py-2 px-3 rounded-xl hover:bg-rose-50/50 transition-colors text-sm sm:text-base whitespace-nowrap"
              >
                {link.label}
              </a>
            ))}

            <div className="pt-3 mt-2 border-t border-stone-100 flex items-center justify-between">
              <span className="text-xs text-stone-500 font-medium">Nhạc nền cưới:</span>
              <button
                onClick={onToggleMusic}
                className="py-1.5 px-3.5 text-xs font-semibold bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-100 flex items-center gap-1.5 whitespace-nowrap transition-colors"
              >
                <Music className="w-3.5 h-3.5 shrink-0" />
                {isPlayingMusic ? 'Đang phát nhạc' : 'Bật nhạc'}
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
