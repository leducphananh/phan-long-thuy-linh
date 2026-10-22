'use client';

import React, { useState } from 'react';
import { Gift, Copy, Check, QrCode } from 'lucide-react';
import { WeddingCouple } from '../types/wedding';
import { ScrollReveal } from './ScrollReveal';

interface GiftBoxProps {
  couple: WeddingCouple;
}

export const GiftBox: React.FC<GiftBoxProps> = ({ couple }) => {
  const [copiedGroom, setCopiedGroom] = useState(false);
  const [copiedBride, setCopiedBride] = useState(false);
  const [activeTab, setActiveTab] = useState<'groom' | 'bride'>('groom');

  const handleCopy = (text: string, type: 'groom' | 'bride') => {
    navigator.clipboard.writeText(text);
    if (type === 'groom') {
      setCopiedGroom(true);
      setTimeout(() => setCopiedGroom(false), 2500);
    } else {
      setCopiedBride(true);
      setTimeout(() => setCopiedBride(false), 2500);
    }
  };

  return (
    <section id="gift" className="relative py-24 sm:py-32 px-4 sm:px-6 overflow-hidden">
      {/* Scenic Real Wedding Celebration Backdrop - Vivid & festive */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <img
          src="/images/wedding/optimized/_DSC2014.jpg"
          alt="Gift Box Backdrop"
          className="w-full h-full object-cover object-center filter blur-[0.5px] opacity-65 transform scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#FFFDFB]/65 via-[#FFFDFB]/35 to-[#FFFDFB]/65" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto">
        {/* Section Header */}
        <ScrollReveal animation="fade-up" duration={700}>
          <div className="text-center mb-12 sm:mb-16">
            <p className="font-script text-3xl sm:text-4xl text-rose-600 mb-1 drop-shadow-xs">
              Wedding Gift
            </p>
            <h2 className="font-serif text-3xl sm:text-5xl font-bold text-stone-900 tracking-tight text-balance drop-shadow-xs">
              Hộp Mừng Hạnh Phúc
            </h2>
            <div className="mt-4 flex items-center justify-center gap-3">
              <div className="h-px w-12 bg-rose-400" />
              <Gift className="w-4 h-4 text-rose-500 animate-bounce" />
              <div className="h-px w-12 bg-rose-400" />
            </div>
            <div className="mt-4 inline-block bg-white/80 backdrop-blur-sm px-6 py-2.5 rounded-2xl border border-rose-100/80 shadow-xs max-w-xl mx-auto">
              <p className="text-sm sm:text-base text-stone-700 leading-relaxed font-medium">
                Sự hiện diện và lời chúc phúc của Quý khách là món quà ý nghĩa nhất. Nếu muốn gửi tặng một món quà mừng từ xa, Quý khách có thể gửi tới hộp mừng dưới đây.
              </p>
            </div>
          </div>
        </ScrollReveal>

        {/* Tab switch for mobile view */}
        <div className="flex md:hidden items-center justify-center gap-2 p-1.5 bg-rose-50/70 rounded-2xl max-w-xs mx-auto mb-8 shadow-xs border border-rose-100">
          <button
            onClick={() => setActiveTab('groom')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'groom' ? 'bg-rose-600 text-white shadow-xs' : 'text-stone-600'
            }`}
          >
            Mừng Chú Rể
          </button>
          <button
            onClick={() => setActiveTab('bride')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === 'bride' ? 'bg-rose-600 text-white shadow-xs' : 'text-stone-600'
            }`}
          >
            Mừng Cô Dâu
          </button>
        </div>

        {/* Banking Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Chú Rể Card */}
          <ScrollReveal animation="fade-right" delay={150} duration={700}>
            <div
              className={`bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xl flex flex-col items-center text-center transition-all ${
                activeTab === 'groom' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <QrCode className="w-6 h-6" />
              </div>

              <span className="text-xs uppercase tracking-widest text-rose-600 font-bold mb-1">
                CHÚ RỂ
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-4">
                {couple.groom.fullName}
              </h3>

              {/* QR Code Container */}
              <div className="p-3 bg-stone-50/80 rounded-2xl border border-rose-100 mb-6 w-52 h-52 flex items-center justify-center shadow-inner">
                <img
                  src={couple.groom.bankInfo?.qrCodeUrl}
                  alt="QR Mừng Cưới Chú Rể"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-xs text-stone-500 flex flex-col items-center">
                          <span class="font-bold text-stone-800">VietQR</span>
                          <span>Quét mã chuyển khoản</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              {/* Bank details */}
              <div className="w-full bg-rose-50/30 rounded-2xl p-4 border border-rose-100 text-left text-sm space-y-2 mb-4">
                <div>
                  <span className="text-xs text-stone-500 block">Ngân hàng</span>
                  <strong className="text-stone-900 font-semibold">{couple.groom.bankInfo?.bankName}</strong>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Chủ tài khoản</span>
                  <strong className="text-stone-900 font-semibold">{couple.groom.bankInfo?.accountName}</strong>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-stone-500 block">Số tài khoản</span>
                    <span className="font-mono text-base font-bold text-stone-900 tracking-wider">
                      {couple.groom.bankInfo?.accountNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(couple.groom.bankInfo?.accountNumber || '', 'groom')}
                    className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedGroom ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {copiedGroom && (
                <span className="text-xs text-emerald-600 font-semibold animate-in fade-in duration-200">
                  Đã sao chép số tài khoản vào bộ nhớ tạm!
                </span>
              )}
            </div>
          </ScrollReveal>

          {/* Cô Dâu Card */}
          <ScrollReveal animation="fade-left" delay={200} duration={700}>
            <div
              className={`bg-white/98 backdrop-blur-md rounded-3xl p-6 sm:p-8 border border-rose-100 shadow-xl flex flex-col items-center text-center transition-all ${
                activeTab === 'bride' ? 'flex' : 'hidden md:flex'
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mb-3">
                <QrCode className="w-6 h-6" />
              </div>

              <span className="text-xs uppercase tracking-widest text-rose-600 font-bold mb-1">
                CÔ DÂU
              </span>
              <h3 className="font-serif text-2xl font-bold text-stone-900 mb-4">
                {couple.bride.fullName}
              </h3>

              {/* QR Code Container */}
              <div className="p-3 bg-stone-50/80 rounded-2xl border border-rose-100 mb-6 w-52 h-52 flex items-center justify-center shadow-inner">
                <img
                  src={couple.bride.bankInfo?.qrCodeUrl}
                  alt="QR Mừng Cưới Cô Dâu"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                  className="w-full h-full object-contain rounded-xl"
                  onError={(e) => {
                    const target = e.currentTarget;
                    target.style.display = 'none';
                    const parent = target.parentElement;
                    if (parent) {
                      parent.innerHTML = `
                        <div class="text-xs text-stone-500 flex flex-col items-center">
                          <span class="font-bold text-stone-800">VietQR</span>
                          <span>Quét mã chuyển khoản</span>
                        </div>
                      `;
                    }
                  }}
                />
              </div>

              {/* Bank details */}
              <div className="w-full bg-rose-50/30 rounded-2xl p-4 border border-rose-100 text-left text-sm space-y-2 mb-4">
                <div>
                  <span className="text-xs text-stone-500 block">Ngân hàng</span>
                  <strong className="text-stone-900 font-semibold">{couple.bride.bankInfo?.bankName}</strong>
                </div>
                <div>
                  <span className="text-xs text-stone-500 block">Chủ tài khoản</span>
                  <strong className="text-stone-900 font-semibold">{couple.bride.bankInfo?.accountName}</strong>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="text-xs text-stone-500 block">Số tài khoản</span>
                    <span className="font-mono text-base font-bold text-stone-900 tracking-wider">
                      {couple.bride.bankInfo?.accountNumber}
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(couple.bride.bankInfo?.accountNumber || '', 'bride')}
                    className="p-2 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors shadow-xs cursor-pointer"
                    title="Sao chép số tài khoản"
                  >
                    {copiedBride ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {copiedBride && (
                <span className="text-xs text-emerald-600 font-semibold animate-in fade-in duration-200">
                  Đã sao chép số tài khoản vào bộ nhớ tạm!
                </span>
              )}
            </div>
          </ScrollReveal>
        </div>

        {/* Heartfelt Note */}
        <ScrollReveal animation="fade-up" delay={250} duration={600}>
          <div className="mt-12 text-center">
            <p className="font-cormorant text-lg text-stone-600 italic">
              &ldquo;Sự chúc phúc và tình cảm của mọi người là hành trang quý giá nhất cho tổ ấm tương lai của chúng con.&rdquo;
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
};
