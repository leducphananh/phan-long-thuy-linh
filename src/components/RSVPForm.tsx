'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Send, User, Phone, AlertCircle, Heart } from 'lucide-react';
import { RSVPFormData } from '../types/wedding';
import { submitRSVP } from '../lib/supabase';
import { ScrollReveal } from './ScrollReveal';

export const RSVPForm: React.FC = () => {
  const [formData, setFormData] = useState<RSVPFormData>({
    name: '',
    phone: '',
    attending: true,
    guestsCount: 1,
    side: 'both',
    message: '',
    dietaryRequirements: '',
  });

  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [storageMode, setStorageMode] = useState<'supabase' | 'local'>('local');

  const triggerConfetti = () => {
    confetti({
      particleCount: 90,
      spread: 75,
      origin: { y: 0.6 },
      colors: ['#f43f5e', '#ec4899', '#fb7185', '#fda4af', '#fecdd3']
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!formData.name.trim()) {
      setErrorMessage('Vui lòng nhập họ và tên của bạn.');
      return;
    }

    if (!formData.phone.trim() || formData.phone.trim().length < 8) {
      setErrorMessage('Vui lòng nhập số điện thoại hợp lệ để gia đình tiện liên hệ.');
      return;
    }

    setLoading(true);

    try {
      const result = await submitRSVP(formData);
      if (result.success) {
        setSubmitted(true);
        setStorageMode(result.mode);
        triggerConfetti();
      } else {
        setErrorMessage(result.message);
      }
    } catch (err: any) {
      setErrorMessage('Đã xảy ra lỗi khi gửi form. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="rsvp" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Bright Celebratory Banquet Background Image */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img
          src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=2000&q=80"
          alt="Bright wedding celebration background"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover object-center filter blur-[1px] opacity-20 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/90 via-[#FFFDFB]/75 to-[#FFFDFB]/90" />
      </div>

      <div className="relative z-10 max-w-3xl mx-auto">
        {/* Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="font-script text-3xl sm:text-4xl text-rose-500 mb-1">
              RSVP
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance">
              Xác Nhận Tham Dự
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-300" />
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
              <div className="h-px w-12 bg-rose-300" />
            </div>
            <p className="mt-4 text-sm sm:text-base text-stone-600 max-w-lg mx-auto font-medium">
              Để gia đình có thể chuẩn bị đón tiếp chu đáo nhất, xin Quý khách vui lòng xác nhận sự hiện diện trước ngày <strong className="text-stone-900">15 Tháng 11, 2026</strong>.
            </p>
          </div>
        </ScrollReveal>

        {/* Form Card */}
        <ScrollReveal animation="zoom-in" delay={150} duration={750}>
          <div className="bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-10 shadow-xl border border-rose-100">
            {submitted ? (
              <div className="text-center py-8 animate-in fade-in duration-300">
                <div className="w-16 h-16 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                  Cảm Ơn Bạn Rất Nhiều!
                </h3>
                <p className="mt-2 text-stone-600 max-w-md mx-auto text-sm sm:text-base leading-relaxed">
                  Chúng mình đã nhận được phản hồi của bạn <strong className="text-stone-900">({formData.name})</strong>.
                  {formData.attending
                    ? ' Sự hiện diện của bạn là niềm vinh dự to lớn đối với chúng mình!'
                    : ' Thật tiếc khi bạn không thể tham dự, nhưng rất cảm ơn bạn đã gửi lời báo trước cho gia đình.'}
                </p>

                {/* Storage Mode Notice */}
                <div className="mt-4 inline-flex items-center gap-2 text-xs text-stone-600 px-3.5 py-1.5 rounded-xl bg-rose-50/60 border border-rose-200">
                  <span>Trạng thái:</span>
                  <span className="font-semibold text-rose-700">
                    {storageMode === 'supabase' ? 'Đã đồng bộ trực tiếp lên Supabase' : 'Đã ghi nhận dữ liệu'}
                  </span>
                </div>

                <div className="mt-8">
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setFormData({
                        name: '',
                        phone: '',
                        attending: true,
                        guestsCount: 1,
                        side: 'both',
                        message: '',
                        dietaryRequirements: '',
                      });
                    }}
                    className="px-5 py-2.5 text-xs sm:text-sm font-semibold border border-stone-300 rounded-xl hover:bg-stone-50 text-stone-700 transition-colors cursor-pointer"
                  >
                    Gửi phản hồi khác
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMessage && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Attendance Choice */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-3">
                    Bạn sẽ tham dự chứ? *
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attending: true })}
                      className={`py-3.5 px-4 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        formData.attending
                          ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs ring-2 ring-rose-400'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <CheckCircle2 className={`w-4 h-4 ${formData.attending ? 'text-rose-600' : 'text-stone-400'}`} />
                      Có, tôi chắc chắn sẽ tham dự
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, attending: false })}
                      className={`py-3.5 px-4 rounded-2xl border text-sm font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                        !formData.attending
                          ? 'border-rose-500 bg-rose-50 text-rose-900 shadow-xs ring-2 ring-rose-400'
                          : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                      }`}
                    >
                      <AlertCircle className={`w-4 h-4 ${!formData.attending ? 'text-rose-600' : 'text-stone-400'}`} />
                      Rất tiếc, tôi không thể tham dự
                    </button>
                  </div>
                </div>

                {/* Name & Phone Fields */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="rsvp-name" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Họ và Tên *
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="rsvp-name"
                        type="text"
                        required
                        placeholder="VD: Nguyễn Văn An"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="rsvp-phone" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                      Số Điện Thoại *
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        id="rsvp-phone"
                        type="tel"
                        required
                        placeholder="VD: 0912 345 678"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Attending Details (Only show if attending) */}
                {formData.attending && (
                  <div className="space-y-5 pt-2 border-t border-rose-100">
                    {/* Side Selector */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Bạn là khách của ai?
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { key: 'groom', label: 'Nhà Trai (Phan Anh)' },
                          { key: 'bride', label: 'Nhà Gái (Ngọc Yến)' },
                          { key: 'both', label: 'Cả Hai' },
                        ].map((item) => (
                          <button
                            key={item.key}
                            type="button"
                            onClick={() => setFormData({ ...formData, side: item.key as any })}
                            className={`py-2 px-3 text-xs sm:text-sm font-semibold rounded-xl border transition-all cursor-pointer ${
                              formData.side === item.key
                                ? 'border-rose-500 bg-rose-50 text-rose-900 ring-2 ring-rose-400'
                                : 'border-stone-200 text-stone-600 hover:bg-stone-50'
                            }`}
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Number of Guests */}
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                        Số người cùng tham dự
                      </label>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-stone-200 rounded-xl overflow-hidden bg-stone-50/70">
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, guestsCount: Math.max(1, formData.guestsCount - 1) })}
                            className="px-3.5 py-2 text-stone-600 hover:bg-stone-200 font-bold transition-colors cursor-pointer"
                          >
                            -
                          </button>
                          <span className="px-4 py-2 text-sm font-bold text-stone-900 tabular-nums">
                            {formData.guestsCount} người
                          </span>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, guestsCount: Math.min(6, formData.guestsCount + 1) })}
                            className="px-3.5 py-2 text-stone-600 hover:bg-stone-200 font-bold transition-colors cursor-pointer"
                          >
                            +
                          </button>
                        </div>
                        <span className="text-xs text-stone-500 font-medium">
                          (Bao gồm cả bạn)
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Message to Couple */}
                <div>
                  <label htmlFor="rsvp-message" className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-2">
                    Lời nhắn gửi / Lưu ý chế độ ăn uống (Ăn chay, dị ứng...)
                  </label>
                  <div className="relative">
                    <textarea
                      id="rsvp-message"
                      rows={3}
                      placeholder="Gửi vài lời chúc mừng hoặc nhắn gửi về chế độ ăn uống đặc biệt..."
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="w-full p-3 rounded-xl border border-stone-200 bg-stone-50/50 text-stone-900 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 focus:bg-white transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 text-sm sm:text-base font-semibold text-white bg-gradient-to-r from-rose-500 via-rose-600 to-pink-500 hover:from-rose-600 hover:to-pink-600 disabled:opacity-50 rounded-xl shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] cursor-pointer"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Xác Nhận Tham Dự</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
