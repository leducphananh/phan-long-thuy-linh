'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Heart, X, MessageCircleHeart, Sparkles } from 'lucide-react';
import { GuestbookEntry } from '../types/wedding';
import { fetchGuestbook, subscribeGuestbookRealtime } from '../lib/supabase';

// Sample gentle celebratory toasts used if database has no wishes yet
const FALLBACK_TOASTS: GuestbookEntry[] = [
  {
    id: 'sample-1',
    created_at: new Date().toISOString(),
    name: 'Bạn bè & Đồng nghiệp',
    message: 'Chúc mừng hạnh phúc Phan Long & Thùy Linh! Chúc hai bạn trăm năm viên mãn!',
    relationship: 'friend',
    avatar_color: 'rose',
    likes_count: 5
  },
  {
    id: 'sample-2',
    created_at: new Date().toISOString(),
    name: 'Gia đình & Người thân',
    message: 'Chúc hai con mãi mãi yêu thương, thấu hiểu và cùng nhau xây đắp tổ ấm trọn vẹn.',
    relationship: 'family',
    avatar_color: 'amber',
    likes_count: 8
  }
];

export const LiveWishNotification: React.FC = () => {
  const [wishes, setWishes] = useState<GuestbookEntry[]>([]);
  const [currentWish, setCurrentWish] = useState<GuestbookEntry | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastIndexRef = useRef<number>(-1);

  // Load existing wishes & subscribe to Realtime
  useEffect(() => {
    let isMounted = true;

    const loadInitial = async () => {
      try {
        const res = await fetchGuestbook();
        if (isMounted) {
          if (res.data && res.data.length > 0) {
            setWishes(res.data);
          } else {
            setWishes(FALLBACK_TOASTS);
          }
        }
      } catch {
        if (isMounted) setWishes(FALLBACK_TOASTS);
      }
    };

    loadInitial();

    // Subscribe to realtime changes: trigger notification immediately upon new wish!
    const unsubscribe = subscribeGuestbookRealtime(
      (newEntry) => {
        if (!isMounted) return;
        setWishes((prev) => [newEntry, ...prev.filter((w) => w.id !== newEntry.id)]);
        triggerPopup(newEntry);
      },
      (updatedEntry) => {
        if (!isMounted) return;
        setWishes((prev) =>
          prev.map((item) => (item.id === updatedEntry.id ? { ...item, ...updatedEntry } : item))
        );
      }
    );

    return () => {
      isMounted = false;
      unsubscribe();
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    };
  }, []);

  const triggerPopup = (wish: GuestbookEntry) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    setCurrentWish(wish);
    setIsVisible(true);

    // Auto hide after 6 seconds
    hideTimeoutRef.current = setTimeout(() => {
      setIsVisible(false);
    }, 6000);
  };

  // Periodically pick and show a wish every 15 seconds
  useEffect(() => {
    if (wishes.length === 0) return;

    // Show first toast after 4 seconds of entering page
    const initialTimer = setTimeout(() => {
      if (wishes.length > 0) {
        lastIndexRef.current = 0;
        triggerPopup(wishes[0]);
      }
    }, 4000);

    const interval = setInterval(() => {
      if (wishes.length === 0) return;
      const nextIndex = (lastIndexRef.current + 1) % wishes.length;
      lastIndexRef.current = nextIndex;
      triggerPopup(wishes[nextIndex]);
    }, 15000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [wishes]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
  };

  const handleScrollToGuestbook = () => {
    if (typeof window !== 'undefined') {
      const el = document.getElementById('guestbook');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
    setIsVisible(false);
  };

  if (!currentWish) return null;

  return (
    <aside 
      aria-label="Thông báo lời chúc mới"
      className={`fixed top-20 right-4 sm:right-6 z-40 max-w-[340px] sm:max-w-sm w-full transition-all duration-500 transform ${
        isVisible
          ? 'translate-x-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-x-12 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div
        onClick={handleScrollToGuestbook}
        className="group relative cursor-pointer bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-rose-200/90 shadow-xl shadow-rose-950/10 hover:shadow-2xl hover:border-rose-300 transition-all"
      >
        {/* Subtle top indicator bar */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-rose-300 via-rose-500 to-pink-400 rounded-full" />

        {/* Header row */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block" />
            <MessageCircleHeart className="w-3.5 h-3.5 text-rose-500" />
            <span className="uppercase tracking-wider">Lời chúc vừa gửi</span>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Body content */}
        <div className="flex items-start gap-3">
          {/* Avatar icon */}
          <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 flex items-center justify-center font-bold text-xs font-serif border border-rose-200 shadow-xs">
            {currentWish.name ? currentWish.name.charAt(0).toUpperCase() : <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h5 className="font-bold text-stone-900 text-xs sm:text-sm truncate">
                {currentWish.name}
              </h5>
              <span className="text-[10px] text-rose-500 bg-rose-50 px-2 py-0.5 rounded-full font-medium shrink-0">
                {currentWish.relationship === 'family'
                  ? 'Gia đình'
                  : currentWish.relationship === 'colleague'
                  ? 'Đồng nghiệp'
                  : currentWish.relationship === 'relative'
                  ? 'Họ hàng'
                  : 'Bạn bè'}
              </span>
            </div>

            <p className="mt-1 text-xs text-stone-600 line-clamp-2 leading-relaxed italic font-sans">
              &ldquo;{currentWish.message}&rdquo;
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-2.5 pt-2 border-t border-rose-100/70 flex items-center justify-between text-[10px] text-stone-400">
          <span className="flex items-center gap-1 text-rose-500 group-hover:underline font-medium">
            <Sparkles className="w-3 h-3" />
            Nhấn để xem Sổ lưu bút
          </span>
          <span className="flex items-center gap-1 font-semibold text-rose-600">
            <Heart className="w-2.5 h-2.5 fill-rose-500 text-rose-500" />
            {currentWish.likes_count || 1} yêu thích
          </span>
        </div>
      </div>
    </aside>
  );
};
