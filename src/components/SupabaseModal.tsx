'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Database, Code2, Server, FolderTree, Sheet, ExternalLink } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GOOGLE_APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    const data = JSON.parse(e.postData.contents);
    
    // Nếu trang tính trống, tự động tạo tiêu đề các cột
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Thời gian gửi',
        'Họ và tên khách',
        'Số điện thoại',
        'Xác nhận tham dự',
        'Số người đi cùng',
        'Khách bên',
        'Lời chúc / Lời nhắn',
        'Ghi chú / Ăn uống'
      ]);
    }
    
    // Ghi dữ liệu khách mời vào hàng mới nhất
    sheet.appendRow([
      new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
      data.name || '',
      data.phone || '',
      data.attending ? 'Có tham dự' : 'Rất tiếc không thể đến',
      data.guestsCount || 1,
      data.side === 'groom' ? 'Nhà trai' : (data.side === 'bride' ? 'Nhà gái' : 'Cả hai bên'),
      data.message || '',
      data.dietaryRequirements || ''
    ]);
    
    return ContentService.createTextOutput(JSON.stringify({ result: 'success' }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ result: 'error', message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

const SQL_SCHEMA = `-- 1. BẢNG SỔ LƯU BÚT (GUESTBOOK)
create table if not exists public.guestbook (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    message text not null,
    relationship text default 'friend',
    avatar_color text default 'rose',
    likes_count integer default 0 not null check (likes_count >= 0)
);

alter table public.guestbook enable row level security;

-- Cho phép khách đọc toàn bộ lời chúc
create policy "Allow public to read guestbook"
on public.guestbook for select to anon, authenticated using (true);

-- Cho phép khách gửi lời chúc mới
create policy "Allow public to insert guestbook"
on public.guestbook for insert to anon, authenticated with check (true);

-- Cho phép khách thả tim cập nhật số like
create policy "Allow public to update guestbook likes"
on public.guestbook for update to anon, authenticated using (true) with check (true);

-- 2. KÍCH HOẠT SUPABASE REALTIME ĐỂ ĐỒNG BỘ TỨC THÌ
alter publication supabase_realtime add table public.guestbook;

-- 3. HÀM TĂNG LƯỢT THÍCH (RPC)
create or replace function increment_guestbook_like(entry_id uuid)
returns void as $$
begin
  update public.guestbook set likes_count = likes_count + 1 where id = entry_id;
end;
$$ language plpgsql security definer;`;

export const SupabaseModal: React.FC<SupabaseModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.anonKey);
  const [googleSheetWebhook, setGoogleSheetWebhook] = useState(() => {
    return typeof window !== 'undefined' ? localStorage.getItem('wedding_google_sheet_webhook') || '' : '';
  });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedAppsScript, setCopiedAppsScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'sheet' | 'sql' | 'config' | 'structure'>('sheet');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
    if (typeof window !== 'undefined') {
      if (googleSheetWebhook) {
        localStorage.setItem('wedding_google_sheet_webhook', googleSheetWebhook.trim());
      } else {
        localStorage.removeItem('wedding_google_sheet_webhook');
      }
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      window.location.reload();
    }, 1000);
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleCopyAppsScript = () => {
    navigator.clipboard.writeText(GOOGLE_APPS_SCRIPT_CODE);
    setCopiedAppsScript(true);
    setTimeout(() => setCopiedAppsScript(false), 2500);
  };

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600 border border-rose-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Tài Liệu Cấu Hình Backend
              </h3>
              <p className="text-xs text-stone-500">
                Google Sheets RSVP, Supabase Realtime &amp; Cấu trúc Next.js 15
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Navigation Tabs */}
        <div className="flex border-b border-stone-200 bg-stone-50/30 px-6 pt-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('sheet')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sheet'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sheet className="w-4 h-4 text-emerald-600" />
            1. Google Sheet RSVP
          </button>

          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'sql'
                ? 'border-rose-600 text-rose-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Code2 className="w-4 h-4 text-rose-600" />
            2. Supabase Realtime SQL
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'config'
                ? 'border-amber-600 text-amber-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Server className="w-4 h-4 text-amber-600" />
            3. Cài Đặt Kết Nối
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'structure'
                ? 'border-blue-600 text-blue-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FolderTree className="w-4 h-4 text-blue-600" />
            4. Cấu Trúc Dự Án
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-700">
          {activeTab === 'sheet' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-2">
                <strong className="text-sm font-bold block text-emerald-950">
                  Hướng Dẫn 3 Bước Lưu RSVP Vào Google Sheet Trực Tiếp:
                </strong>
                <ol className="list-decimal pl-5 space-y-1.5 leading-relaxed text-emerald-900 font-medium">
                  <li>Tạo một file <strong>Google Trang tính (Google Sheets)</strong> mới trên Google Drive của bạn.</li>
                  <li>Vào menu <strong>Tiện ích mở rộng (Extensions) &gt; Apps Script</strong>, dán toàn bộ đoạn mã bên dưới rồi nhấn <strong>Lưu (Ctrl+S)</strong>.</li>
                  <li>Nhấn <strong>Triển khai (Deploy) &gt; Tùy chọn triển khai mới (New deployment)</strong> &gt; Chọn loại <strong>Ứng dụng web (Web app)</strong> &gt; Chọn người có quyền truy cập: <strong>Bất kỳ ai (Anyone)</strong> &gt; Nhấn Triển khai.</li>
                  <li>Sao chép <strong>URL ứng dụng web</strong> nhận được và gán vào biến môi trường <code>GOOGLE_SHEET_WEBHOOK_URL</code> (hoặc tab Cài Đặt Kết Nối bên cạnh).</li>
                </ol>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-600 font-semibold">
                  Mã Google Apps Script (Apps Script Web App):
                </span>
                <button
                  onClick={handleCopyAppsScript}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium transition-colors shadow-xs"
                >
                  {copiedAppsScript ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Đã sao chép Apps Script!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sao chép Mã Apps Script
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-stone-900 text-emerald-300 p-4 font-mono text-xs overflow-x-auto max-h-80">
                <pre>{GOOGLE_APPS_SCRIPT_CODE}</pre>
              </div>
            </div>
          )}

          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Dán vào <strong>Supabase Dashboard &gt; SQL Editor</strong> rồi nhấn <strong>Run</strong>:
                </span>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-medium transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Đã sao chép!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Sao chép SQL DDL
                    </>
                  )}
                </button>
              </div>

              <div className="relative rounded-2xl bg-stone-900 text-stone-100 p-4 font-mono text-xs overflow-x-auto max-h-80">
                <pre>{SQL_SCHEMA}</pre>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 leading-relaxed">
                <strong>Lưu ý về Supabase Realtime:</strong> Dòng <code>alter publication supabase_realtime add table public.guestbook;</code> kích hoạt đồng bộ thời gian thực cho bảng lưu bút. Khi có khách gửi lời chúc mới hoặc thả tim, trang web sẽ tự động cập nhật ngay lập tức mà không cần tải lại trang!
              </div>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs text-stone-700 leading-relaxed">
                <strong>Trạng thái kết nối hiện tại:</strong>{' '}
                {currentConfig.isConfigured
                  ? 'Supabase đã kết nối thành công! Lời chúc được đồng bộ trực tiếp qua Realtime.'
                  : 'Đang chạy chế độ Dự phòng (Local Cache). Khi chưa cấu hình key thật, website vẫn hoạt động 100% trơn tru mượt mà!'}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  NEXT_PUBLIC_SUPABASE_URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  NEXT_PUBLIC_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  GOOGLE_SHEET_WEBHOOK_URL
                </label>
                <input
                  type="text"
                  placeholder="https://script.google.com/macros/s/AKfycb.../exec"
                  value={googleSheetWebhook}
                  onChange={(e) => setGoogleSheetWebhook(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  URL ứng dụng web Apps Script (hoặc đặt trong file .env / Vercel Environment Variables).
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setAnonKey('');
                    setGoogleSheetWebhook('');
                    saveSupabaseConfig('', '');
                    if (typeof window !== 'undefined') {
                      localStorage.removeItem('wedding_google_sheet_webhook');
                    }
                    window.location.reload();
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Xóa cấu hình (Về chế độ Demo)
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-xl text-xs sm:text-sm transition-colors shadow-xs"
                >
                  {savedSuccess ? 'Đã lưu & Đang tải lại...' : 'Lưu Cấu Hình'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Cấu trúc thư mục Next.js 15 (App Router) chuẩn mực, sẵn sàng deploy ngay lên Vercel:
              </p>
              <div className="bg-stone-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto">
                <pre>{`├── next.config.ts        # Cấu hình Next.js (remote patterns ảnh)
├── postcss.config.mjs    # Cấu hình PostCSS với @tailwindcss/postcss
├── tsconfig.json         # Cấu hình TypeScript Next.js
├── public/
│   └── images/gallery/   # Thư mục chứa ảnh cưới ({couple, bride, groom})
├── src/
│   ├── app/
│   │   ├── layout.tsx    # Root Layout, tối ưu Google Fonts & SEO Metadata
│   │   ├── page.tsx      # Single Page tổng hợp toàn bộ các Section
│   │   ├── globals.css   # Tailwind CSS v4 & Animation cánh hoa bay
│   │   └── api/
│   │       └── rsvp/
│   │           └── route.ts # API Route nhận form & đẩy vào Google Sheet
│   ├── types/
│   │   └── wedding.ts    # TypeScript Data Models
│   ├── lib/
│   │   ├── supabase.ts   # Supabase Client, Realtime Subscriptions & Local Fallback
│   │   └── calendar.ts   # Google Calendar & Apple .ics generator
│   ├── data/
│   │   └── weddingData.ts# Dữ liệu thiệp cưới, timeline, sự kiện, link ảnh
│   └── components/
│       ├── Navbar.tsx    # Header theo 3-Zone Contract
│       ├── Hero.tsx      # Bìa cưới, Countdown thời gian thực
│       ├── Story.tsx     # Timeline Chuyện Chúng Mình
│       ├── Invitation.tsx# Chi tiết hôn lễ, Google Maps, Add to Calendar
│       ├── Gallery.tsx   # Masonry Grid & Lightbox phóng to ảnh (3 tab chuẩn)
│       ├── RSVPForm.tsx  # Form xác nhận tham dự đẩy vào Google Sheet
│       ├── Guestbook.tsx # Sổ lưu bút, thả tim, gửi lời chúc Supabase Realtime
│       ├── GiftBox.tsx   # Hộp mừng VietQR & Sao chép STK
│       ├── AudioPlayer.tsx# Nhạc cưới phát nền có đĩa than xoay
│       ├── FloatingPetals.tsx# Hiệu ứng cánh hoa rơi lãng mạn
│       ├── SupabaseModal.tsx # Modal hướng dẫn cấu hình Google Sheet & Supabase
│       └── Footer.tsx    # Chân trang chúc phúc`}</pre>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <strong className="text-stone-900">Cách Deploy Lên Vercel Siêu Nhanh:</strong>
                <ol className="list-decimal pl-5 space-y-1 text-stone-600">
                  <li>Đẩy code lên GitHub repository.</li>
                  <li>Import repository vào dashboard Vercel (chọn Framework: Next.js).</li>
                  <li>Thêm các biến môi trường:
                    <ul className="list-disc pl-5 mt-1 space-y-0.5">
                      <li><code>GOOGLE_SHEET_WEBHOOK_URL</code>: URL Web App từ Google Apps Script.</li>
                      <li><code>NEXT_PUBLIC_SUPABASE_URL</code>: URL dự án Supabase.</li>
                      <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code>: Anon key công khai của Supabase.</li>
                    </ul>
                  </li>
                  <li>Nhấn <strong>Deploy</strong> là website thiệp cưới online đã hoạt động toàn cầu!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
