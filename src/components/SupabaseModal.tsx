'use client';

import React, { useState } from 'react';
import { X, Copy, Check, Database, Code2, Server, FolderTree, ExternalLink } from 'lucide-react';
import { getSupabaseConfig, saveSupabaseConfig } from '../lib/supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA = `-- 1. BẢNG XÁC NHẬN THAM GIA (RSVP)
create table if not exists public.rsvp (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    phone text not null,
    attending boolean default true not null,
    guests_count integer default 1 not null check (guests_count >= 1 and guests_count <= 10),
    side text default 'both' check (side in ('groom', 'bride', 'both')),
    message text,
    dietary_requirements text
);

alter table public.rsvp enable row level security;

create policy "Allow public to submit RSVP"
on public.rsvp for insert to anon, authenticated with check (true);

create policy "Allow select RSVP"
on public.rsvp for select to anon, authenticated using (true);

-- 2. BẢNG SỔ LƯU BÚT (GUESTBOOK)
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

create policy "Allow public to read guestbook"
on public.guestbook for select to anon, authenticated using (true);

create policy "Allow public to insert guestbook"
on public.guestbook for insert to anon, authenticated with check (true);

create policy "Allow public to update guestbook likes"
on public.guestbook for update to anon, authenticated using (true) with check (true);

-- 3. FUNCTION TĂNG LIKE LỜI CHÚC
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
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'config' | 'structure'>('sql');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveSupabaseConfig(url, anonKey);
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

  return (
    <div 
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900">
                Tài Liệu Kỹ Thuật &amp; Supabase
              </h3>
              <p className="text-xs text-stone-500">
                Mã nguồn SQL DDL, cấu trúc thư mục &amp; cấu hình kết nối
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
        <div className="flex border-b border-stone-200 bg-stone-50/30 px-6 pt-2">
          <button
            onClick={() => setActiveTab('sql')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            Mã SQL (DDL)
          </button>

          <button
            onClick={() => setActiveTab('config')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'config'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <Server className="w-4 h-4" />
            Kết Nối Supabase
          </button>

          <button
            onClick={() => setActiveTab('structure')}
            className={`py-3 px-4 text-xs sm:text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'structure'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-stone-600 hover:text-stone-900'
            }`}
          >
            <FolderTree className="w-4 h-4" />
            Cấu Trúc Thư Mục
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm text-stone-700">
          {activeTab === 'sql' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs text-stone-500">
                  Dán vào <strong>Supabase Dashboard &gt; SQL Editor</strong> rồi nhấn <strong>Run</strong>:
                </span>
                <button
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-xs font-medium transition-colors"
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

              <div className="relative rounded-2xl bg-stone-900 text-stone-100 p-4 font-mono text-xs overflow-x-auto max-h-96">
                <pre>{SQL_SCHEMA}</pre>
              </div>

              <p className="text-xs text-stone-500">
                Đã bao gồm đầy đủ Row Level Security (RLS) để khách vãng lai gửi RSVP, xem và đăng lời chúc, cùng hàm RPC tăng lượt thích.
              </p>
            </div>
          )}

          {activeTab === 'config' && (
            <form onSubmit={handleSave} className="space-y-5">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 leading-relaxed">
                <strong>Trạng thái hiện tại:</strong>{' '}
                {currentConfig.isConfigured
                  ? 'Đã kết nối với Supabase! Mọi thao tác RSVP và lời chúc được ghi nhận trực tiếp vào database.'
                  : 'Đang chạy chế độ Dự phòng (Local Storage). Khi chưa có URL/Key, app vẫn hoạt động 100% không bị crash!'}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  VITE_SUPABASE_URL
                </label>
                <input
                  type="text"
                  placeholder="https://xyzcompany.supabase.co"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  VITE_SUPABASE_ANON_KEY
                </label>
                <input
                  type="password"
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  value={anonKey}
                  onChange={(e) => setAnonKey(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setUrl('');
                    setAnonKey('');
                    saveSupabaseConfig('', '');
                    window.location.reload();
                  }}
                  className="text-xs text-rose-600 hover:underline"
                >
                  Xóa cấu hình (Về chế độ Demo)
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-xl text-xs sm:text-sm transition-colors shadow-xs"
                >
                  {savedSuccess ? 'Đã lưu & Đang tải lại...' : 'Lưu Cấu Hình'}
                </button>
              </div>
            </form>
          )}

          {activeTab === 'structure' && (
            <div className="space-y-4">
              <p className="text-xs text-stone-600">
                Cấu trúc thư mục chuẩn tách module sạch sẽ, dễ dàng triển khai lên Vercel:
              </p>
              <div className="bg-stone-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto">
                <pre>{`├── index.html
├── metadata.json
├── package.json
├── supabase/
│   └── schema.sql        # Toàn bộ SQL DDL tạo bảng rsvp & guestbook
├── src/
│   ├── main.tsx          # Điểm khởi chạy React SPA
│   ├── App.tsx           # Single Page Application tích hợp mọi section
│   ├── index.css         # Tailwind CSS v4 & Animation hoa rơi
│   ├── types/
│   │   └── wedding.ts    # TypeScript Data Models
│   ├── lib/
│   │   ├── supabase.ts   # Client Supabase + Offline Local Fallback
│   │   └── calendar.ts   # Google Calendar & Apple .ics generator
│   ├── data/
│   │   └── weddingData.ts# Dữ liệu thiệp cưới, timeline, ảnh & sự kiện
│   └── components/
│       ├── Navbar.tsx    # Header theo 3-Zone Contract
│       ├── Hero.tsx      # Bìa cưới, Countdown thời gian thực
│       ├── Story.tsx     # Timeline Chuyện Chúng Mình
│       ├── Invitation.tsx# Chi tiết hôn lễ, Google Maps, Add to Calendar
│       ├── Gallery.tsx   # Masonry Grid & Lightbox phóng to ảnh
│       ├── RSVPForm.tsx  # Form xác nhận tham dự Supabase + Confetti
│       ├── Guestbook.tsx # Sổ lưu bút, thả tim, gửi lời chúc Supabase
│       ├── GiftBox.tsx   # Hộp mừng VietQR & Sao chép STK
│       ├── AudioPlayer.tsx# Nhạc cưới phát nền có đĩa than xoay
│       ├── FloatingPetals.tsx# Hiệu ứng cánh hoa rơi lãng mạn
│       └── Footer.tsx    # Chân trang chúc phúc`}</pre>
              </div>

              <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 text-xs space-y-2">
                <strong className="text-stone-900">Deploy lên Vercel:</strong>
                <ol className="list-decimal pl-5 space-y-1 text-stone-600">
                  <li>Đẩy code lên GitHub repository.</li>
                  <li>Import repository vào dashboard Vercel.</li>
                  <li>Thêm 2 biến môi trường: <code>VITE_SUPABASE_URL</code> và <code>VITE_SUPABASE_ANON_KEY</code>.</li>
                  <li>Nhấn Deploy để website thiệp cưới online hoạt động toàn cầu!</li>
                </ol>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
