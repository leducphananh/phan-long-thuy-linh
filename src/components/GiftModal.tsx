'use client';

import React, { useState, useEffect } from 'react';
import { X, Gift, Copy, Check, QrCode, Heart, Sparkles } from 'lucide-react';
import { WeddingCouple } from '../types/wedding';

interface GiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  couple: WeddingCouple;
}

export const GiftModal: React.FC<GiftModalProps> = ({ isOpen, onClose, couple }) => {
  const [activeTab, setActiveTab] = useState<'groom' | 'bride'>('groom');
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedSyntax, setCopiedSyntax] = useState(false);

  // Close on Escape key and prevent background scrolling
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const currentPerson = activeTab === 'groom' ? couple.groom : couple.bride;
  const syntaxSuggestion = `Mung cuoi ${couple.groom.name} ${couple.bride.name}`;

  const handleCopyAccount = () => {
    if (currentPerson.bankInfo?.accountNumber) {
      navigator.clipboard.writeText(currentPerson.bankInfo.accountNumber);
      setCopiedAccount(true);
      setTimeout(() => setCopiedAccount(false), 2500);
    }
  };

  const handleCopySyntax = () => {
    navigator.clipboard.writeText(syntaxSuggestion);
    setCopiedSyntax(true);
    setTimeout(() => setCopiedSyntax(false), 2500);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="gift-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-stone-950/70 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-rose-100 overflow-hidden animate-in zoom-in-95 duration-200 max-h-[92vh] flex flex-col">
        {/* Modal Top Header with subtle floral rose gradient */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-rose-50 via-amber-50/50 to-rose-50 border-b border-rose-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-600 text-white flex items-center justify-center shadow-md shadow-rose-600/30">
              <Gift className="w-5 h-5" />
            </div>
            <div>
              <h3 id="gift-modal-title" className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-tight">
                Hộp Mừng Cưới
              </h3>
              <p className="text-xs text-stone-500 font-medium">
                Gửi quà mừng hạnh phúc tới đôi uyên ương
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
            aria-label="Đóng hộp mừng cưới"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body (Scrollable if necessary) */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5">
          {/* Couple Tab Switcher */}
          <div className="flex items-center p-1 bg-stone-100/80 rounded-2xl border border-stone-200/60">
            <button
              type="button"
              onClick={() => {
                setActiveTab('groom');
                setCopiedAccount(false);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'groom'
                  ? 'bg-white text-rose-700 shadow-sm border border-rose-100'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Mừng Chú Rể</span>
              <span className="text-[11px] font-normal opacity-75">({couple.groom.name})</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('bride');
                setCopiedAccount(false);
              }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                activeTab === 'bride'
                  ? 'bg-white text-rose-700 shadow-sm border border-rose-100'
                  : 'text-stone-600 hover:text-stone-900'
              }`}
            >
              <span>Mừng Cô Dâu</span>
              <span className="text-[11px] font-normal opacity-75">({couple.bride.name})</span>
            </button>
          </div>

          {/* QR Code Container */}
          <div className="flex flex-col items-center">
            <div className="p-3 bg-gradient-to-b from-stone-50 to-white rounded-2xl border-2 border-rose-100 shadow-md max-w-[210px] w-full aspect-square flex items-center justify-center relative">
              <img
                src={currentPerson.bankInfo?.qrCodeUrl}
                alt={`Mã VietQR Mừng Cưới ${currentPerson.fullName}`}
                referrerPolicy="no-referrer"
                loading="eager"
                className="w-full h-full object-contain rounded-xl"
                onError={(e) => {
                  const target = e.currentTarget;
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = `
                      <div class="text-xs text-stone-500 flex flex-col items-center text-center p-2">
                        <QrCode class="w-10 h-10 text-rose-500 mb-1" />
                        <span class="font-bold text-stone-800">VietQR</span>
                        <span>Quét mã chuyển khoản</span>
                      </div>
                    `;
                  }
                }}
              />
            </div>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-2 flex items-center gap-1 text-center font-medium">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              Mở ứng dụng ngân hàng bất kỳ để quét mã VietQR tự động điền thông tin
            </p>
          </div>

          {/* Bank Info Card */}
          <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100/90 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-rose-100/60">
              <span className="text-xs text-stone-500 font-medium">Ngân hàng</span>
              <strong className="text-sm font-semibold text-stone-900">
                {currentPerson.bankInfo?.bankName}
              </strong>
            </div>

            <div className="flex items-center justify-between pb-2 border-b border-rose-100/60">
              <span className="text-xs text-stone-500 font-medium">Chủ tài khoản</span>
              <strong className="text-sm font-bold text-stone-900 uppercase">
                {currentPerson.bankInfo?.accountName}
              </strong>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500 font-medium block">Số tài khoản</span>
                <span className="font-mono text-base sm:text-lg font-bold text-rose-700 tracking-wider">
                  {currentPerson.bankInfo?.accountNumber}
                </span>
              </div>
              <button
                type="button"
                onClick={handleCopyAccount}
                className="py-1.5 px-3 rounded-xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer active:scale-95"
              >
                {copiedAccount ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700">Đã chép</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Sao chép</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Transfer syntax suggestion */}
          <div className="bg-stone-50 rounded-2xl p-3 sm:p-3.5 border border-stone-200/80 flex items-center justify-between gap-2">
            <div className="min-w-0 flex-1">
              <span className="text-[11px] text-stone-500 block">Nội dung chuyển khoản gợi ý:</span>
              <span className="text-xs sm:text-sm font-medium text-stone-800 truncate block">
                {syntaxSuggestion}
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopySyntax}
              className="p-2 text-stone-500 hover:text-stone-800 hover:bg-white rounded-lg transition-colors shrink-0 cursor-pointer"
              title="Sao chép cú pháp chuyển khoản"
            >
              {copiedSyntax ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Appreciation note */}
          <p className="text-center text-xs text-stone-500 italic pt-1 flex items-center justify-center gap-1">
            <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 shrink-0" />
            Sự hiện diện &amp; lời chúc phúc của bạn là món quà trân quý nhất với chúng mình!
          </p>
        </div>
      </div>
    </div>
  );
};
