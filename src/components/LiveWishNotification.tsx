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
    name: 'Nguyễn Minh Tuấn & Nhóm ĐH',
    message: 'Chúc mừng hạnh phúc Phan Long & Thùy Linh! Chúc hai bạn trăm năm viên mãn!',
    relationship: 'friend',
    avatar_color: 'rose',
    likes_count: 5
  },
  {
    id: 'sample-2',
    created_at: new Date().toISOString(),
    name: 'Chị Mai Thảo & Gia đình',
    message: 'Chúc hai em mãi mãi yêu thương, thấu hiểu và cùng nhau xây đắp tổ ấm trọn vẹn.',
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
  const userDismissedRef = useRef<boolean>(false);

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
        // Real-time wish always shows even if user previously dismissed periodic toasts
        userDismissedRef.current = false;
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

  // Periodically pick and show a wish every 30 seconds (gentle & non-intrusive)
  useEffect(() => {
    if (wishes.length === 0) return;

    // Show first toast after 8 seconds of entering page
    const initialTimer = setTimeout(() => {
      if (wishes.length > 0 && !userDismissedRef.current) {
        lastIndexRef.current = 0;
        triggerPopup(wishes[0]);
      }
    }, 8000);

    const interval = setInterval(() => {
      if (wishes.length === 0 || userDismissedRef.current) return;
      const nextIndex = (lastIndexRef.current + 1) % wishes.length;
      lastIndexRef.current = nextIndex;
      triggerPopup(wishes[nextIndex]);
    }, 30000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [wishes]);

  const handleDismiss = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsVisible(false);
    // Mark as dismissed so periodic toasts pause and don't bother the user
    userDismissedRef.current = true;
    setTimeout(() => {
      userDismissedRef.current = false;
    }, 180000); // 3 minutes pause
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
      className={`fixed bottom-20 sm:bottom-6 left-3 sm:left-6 right-3 sm:right-auto z-40 max-w-[360px] sm:max-w-sm w-auto mx-auto sm:mx-0 transition-all duration-500 transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100 pointer-events-auto'
          : 'translate-y-6 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      {/* Readable & Elegant Toast Card at Bottom - Clear sender name & clear wish text */}
      <div
        onClick={handleScrollToGuestbook}
        className="group relative cursor-pointer bg-white/98 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-rose-200/90 shadow-2xl shadow-rose-950/15 hover:border-rose-300 transition-all"
      >
        {/* Subtle top indicator bar */}
        <div className="absolute top-0 left-6 right-6 h-0.5 bg-gradient-to-r from-rose-300 via-rose-500 to-pink-400 rounded-full" />

        {/* Header row: Status tag + Close button */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping inline-block shrink-0" />
            <MessageCircleHeart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
            <span className="uppercase tracking-wider">Lời chúc mới</span>
          </div>

          <button
            onClick={handleDismiss}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors shrink-0"
            title="Đóng thông báo"
            aria-label="Đóng thông báo"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Main content: Avatar + Sender Name + Message */}
        <div className="flex items-start gap-2.5 sm:gap-3">
          {/* Avatar icon */}
          <div className="w-9 h-9 shrink-0 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 flex items-center justify-center font-bold text-xs font-serif border border-rose-200 shadow-xs">
            {currentWish.name ? currentWish.name.charAt(0).toUpperCase() : <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />}
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0">
            {/* Sender Name + Relationship Badge */}
            <div className="flex items-center justify-between gap-1.5 flex-wrap">
              <h5 className="font-bold text-stone-900 text-xs sm:text-sm leading-tight">
                {currentWish.name}
              </h5>
              <span className="text-[10px] text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full font-semibold border border-rose-100 shrink-0">
                {currentWish.relationship === 'family'
                  ? 'Gia đình'
                  : currentWish.relationship === 'colleague'
                  ? 'Đồng nghiệp'
                  : currentWish.relationship === 'relative'
                  ? 'Họ hàng'
                  : 'Bạn bè'}
              </span>
            </div>

            {/* Clear, readable message (2-3 lines with nice line-height) */}
            <p className="mt-1 text-xs text-stone-700 line-clamp-3 leading-relaxed italic font-sans">
              &ldquo;{currentWish.message}&rdquo;
            </p>
          </div>
        </div>

        {/* Footer hint */}
        <div className="mt-2.5 pt-2 border-t border-rose-100 flex items-center justify-between text-[10px] text-stone-400">
          <span className="flex items-center gap-1 text-rose-600 group-hover:underline font-medium">
            <Sparkles className="w-3 h-3 text-rose-500" />
            Chạm để mở Sổ lưu bút
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
