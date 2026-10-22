'use client';

import React, { useState, useEffect } from 'react';
import { Heart, Send, MessageCircle, Clock, Sparkles, User, Database, Smile } from 'lucide-react';
import { GuestbookEntry } from '../types/wedding';
import {
  fetchGuestbook,
  submitGuestbookWish,
  likeGuestbookWish,
  subscribeGuestbookRealtime,
} from '../lib/supabase';
import { ScrollReveal } from './ScrollReveal';

export const Guestbook: React.FC = () => {
  const [wishes, setWishes] = useState<GuestbookEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [relationship, setRelationship] = useState('friend');
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [storageMode, setStorageMode] = useState<'supabase' | 'local'>('local');

  useEffect(() => {
    loadWishes();

    // Subscribe to realtime Supabase changes
    const unsubscribe = subscribeGuestbookRealtime(
      (newEntry) => {
        setWishes((prev) => {
          // Avoid duplicate wish if submitted locally
          if (prev.some((item) => item.id === newEntry.id)) {
            return prev;
          }
          return [newEntry, ...prev];
        });
      },
      (updatedEntry) => {
        setWishes((prev) =>
          prev.map((item) =>
            item.id === updatedEntry.id ? { ...item, ...updatedEntry } : item
          )
        );
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  const loadWishes = async () => {
    setLoading(true);
    try {
      const res = await fetchGuestbook();
      setWishes(res.data);
      setStorageMode(res.mode);
    } catch (err) {
      console.error('Failed to load guestbook:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendWish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim()) return;

    setSubmitting(true);
    try {
      const avatarColors = ['rose', 'amber', 'emerald', 'indigo', 'violet'];
      const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

      const res = await submitGuestbookWish(name, message, relationship, randomColor);
      if (res.success) {
        setWishes((prev) => (prev.some((item) => item.id === res.entry.id) ? prev : [res.entry, ...prev]));
        setName('');
        setMessage('');
        setStorageMode(res.mode);
      }
    } catch (err) {
      console.error('Failed to submit wish:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLike = async (id: string) => {
    if (likedMap[id]) return;

    setLikedMap((prev) => ({ ...prev, [id]: true }));
    setWishes((prev) =>
      prev.map((item) => (item.id === id ? { ...item, likes_count: (item.likes_count || 0) + 1 } : item))
    );

    await likeGuestbookWish(id);
  };

  const formatRelativeTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'Vừa xong';
      if (diffHours < 24) return `${diffHours} giờ trước`;
      if (diffDays === 1) return 'Hôm qua';
      return `${diffDays} ngày trước`;
    } catch {
      return 'Gần đây';
    }
  };

  const getRelationshipLabel = (rel?: string) => {
    switch (rel) {
      case 'family':
        return 'Gia đình';
      case 'friend':
        return 'Bạn bè';
      case 'colleague':
        return 'Đồng nghiệp';
      case 'relative':
        return 'Họ hàng';
      default:
        return 'Bạn bè';
    }
  };

  return (
    <section id="guestbook" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Real Wedding Celebration Backdrop */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="/images/wedding/optimized/_DSC2387.jpg"
          alt="Celebratory wedding backdrop"
          className="w-full h-full object-cover object-center filter blur-[2px] opacity-15 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/95 via-[#FFFDFB]/85 to-[#FFFDFB]/95" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="font-script text-3xl sm:text-4xl text-rose-500 mb-1">
              Guestbook
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance">
              Sổ Lưu Bút &amp; Lời Chúc
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-300" />
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <div className="h-px w-12 bg-rose-300" />
            </div>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-lg mx-auto font-medium">
              Mỗi lời chúc phúc ấm áp từ bạn là một món quà vô giá đồng hành cùng đôi vợ chồng son trên chặng đường mới.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Form to Submit Wish */}
          <div className="lg:col-span-5">
            <ScrollReveal animation="fade-right" delay={150} duration={700}>
              <div className="bg-white/98 backdrop-blur-md p-6 sm:p-8 rounded-3xl border border-rose-100 shadow-xl">
                <div className="flex items-center gap-2 mb-6 text-stone-900 font-serif text-xl font-bold">
                  <MessageCircle className="w-5 h-5 text-rose-600" />
                  <h3>Gửi Lời Chúc Hạnh Phúc</h3>
                </div>

                <form onSubmit={handleSendWish} className="space-y-4">
                  <div>
                    <label htmlFor="guestbook-name" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Tên hoặc Biệt Danh Của Bạn *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="guestbook-name"
                        type="text"
                        required
                        placeholder="VD: Tuấn Anh & Nhóm bạn c3"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="guestbook-relationship" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Mối Quan Hệ
                    </label>
                    <select
                      id="guestbook-relationship"
                      value={relationship}
                      onChange={(e) => setRelationship(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-800 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                    >
                      <option value="friend">Bạn bè của dâu rể</option>
                      <option value="colleague">Đồng nghiệp</option>
                      <option value="family">Gia đình thân thiết</option>
                      <option value="relative">Họ hàng hai bên</option>
                      <option value="other">Người thương mến khác</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="guestbook-message" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                      Lời Chúc Ngọt Ngào *
                    </label>
                    <textarea
                      id="guestbook-message"
                      required
                      rows={4}
                      placeholder="Viết lời chúc mừng tới Phan Long & Thùy Linh..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting || !name.trim() || !message.trim()}
                    className="w-full py-3.5 px-5 text-sm font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 rounded-xl shadow-md shadow-rose-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 cursor-pointer"
                  >
                    {submitting ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Gửi Lời Chúc Ngay</span>
                      </>
                    )}
                  </button>
                </form>

                <div className="mt-4 pt-4 border-t border-rose-100 flex items-center justify-between text-xs text-stone-500 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    {storageMode === 'supabase' ? 'Supabase Realtime Live' : 'Demo Local Storage'}
                  </span>
                  <span>{wishes.length} lời chúc</span>
                </div>
              </div>
            </ScrollReveal>
          </div>

          {/* Right Column: Scrollable List of Wishes */}
          <div className="lg:col-span-7 space-y-4">
            <ScrollReveal animation="fade-left" delay={200} duration={700}>
              <div className="flex items-center justify-between px-1">
                <h4 className="font-serif text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-rose-500" />
                  Lời Chúc Đã Gửi ({wishes.length})
                </h4>
                <button
                  onClick={loadWishes}
                  className="text-xs text-rose-600 hover:underline font-semibold cursor-pointer"
                >
                  Làm mới
                </button>
              </div>

              {loading ? (
                <div className="text-center py-12 bg-white/95 rounded-3xl border border-rose-100">
                  <div className="w-6 h-6 border-2 border-rose-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                  <p className="text-xs text-stone-500">Đang tải lời chúc...</p>
                </div>
              ) : wishes.length === 0 ? (
                <div className="text-center py-12 bg-white/95 rounded-3xl border border-rose-100 p-6">
                  <Smile className="w-8 h-8 text-stone-400 mx-auto mb-2" />
                  <p className="text-sm font-semibold text-stone-700">Chưa có lời chúc nào.</p>
                  <p className="text-xs text-stone-500 mt-1">Hãy là người đầu tiên gửi lời chúc tốt đẹp đến đôi uyên ương!</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
                  {wishes.map((item) => (
                    <div
                      key={item.id}
                      className="bg-white/98 backdrop-blur-md p-5 rounded-3xl border border-rose-100 shadow-sm hover:border-rose-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-rose-100 to-pink-100 text-rose-700 flex items-center justify-center font-bold text-sm font-serif border border-rose-200">
                            {item.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <h5 className="font-bold text-stone-900 text-sm">
                              {item.name}
                            </h5>
                            <div className="flex items-center gap-1.5 text-xs text-stone-500 mt-0.5">
                              <span className="font-medium text-rose-600">{getRelationshipLabel(item.relationship)}</span>
                              <span aria-hidden="true">·</span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3 text-stone-400" />
                                {formatRelativeTime(item.created_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <button
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                            likedMap[item.id]
                              ? 'bg-rose-50 text-rose-600 ring-1 ring-rose-200'
                              : 'bg-stone-50 text-stone-600 hover:bg-rose-50 hover:text-rose-600'
                          }`}
                          title="Thả tim cho lời chúc này"
                        >
                          <Heart
                            className={`w-3.5 h-3.5 ${
                              likedMap[item.id] ? 'fill-rose-500 text-rose-500 scale-110' : 'text-stone-400'
                            }`}
                          />
                          <span className="tabular-nums font-bold">
                            {item.likes_count || 0}
                          </span>
                        </button>
                      </div>

                      <p className="mt-3 text-stone-700 text-sm leading-relaxed whitespace-pre-line pl-13">
                        {item.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollReveal>
          </div>
        </div>
      </div>
    </section>
  );
};
