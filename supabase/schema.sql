-- =========================================================================
-- WEDDING INVITATION DATABASE SCHEMA (SUPABASE POSTGRESQL DDL)
-- Dự án: Thiệp Cưới Online (Wedding Invitation)
-- Hướng dẫn: Copy toàn bộ đoạn script này dán vào Supabase SQL Editor và bấm Run.
-- =========================================================================

-- 1. BẢNG XÁC NHẬN THAM GIA (RSVP)
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

-- Kích hoạt Row Level Security (RLS) cho bảng rsvp
alter table public.rsvp enable row level security;

-- Policy: Bất kỳ khách truy cập nào cũng có thể gửi form RSVP (Insert)
create policy "Allow public to submit RSVP"
on public.rsvp
for insert
to anon, authenticated
with check (true);

-- Policy: Cho phép đọc thông tin RSVP (Dành cho cô dâu chú rể hoặc thống kê)
create policy "Allow select RSVP"
on public.rsvp
for select
to anon, authenticated
using (true);

-- 2. BẢNG SỔ LƯU BÚT & LỜI CHÚC (GUESTBOOK)
create table if not exists public.guestbook (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    name text not null,
    message text not null,
    relationship text default 'friend' check (relationship in ('family', 'friend', 'colleague', 'relative', 'other')),
    avatar_color text default 'rose',
    likes_count integer default 0 not null check (likes_count >= 0)
);

-- Kích hoạt Row Level Security (RLS) cho bảng guestbook
alter table public.guestbook enable row level security;

-- Policy: Mọi người đều có thể đọc danh sách lời chúc
create policy "Allow public to read guestbook"
on public.guestbook
for select
to anon, authenticated
using (true);

-- Policy: Mọi người đều có thể gửi lời chúc mới
create policy "Allow public to insert guestbook"
on public.guestbook
for insert
to anon, authenticated
with check (true);

-- Policy: Cho phép thả tim / cập nhật số lượt thích
create policy "Allow public to update guestbook likes"
on public.guestbook
for update
to anon, authenticated
using (true)
with check (true);

-- 3. FUNCTION TĂNG LƯỢT THÍCH CHO LỜI CHÚC (RPC)
create or replace function increment_guestbook_like(entry_id uuid)
returns void as $$
begin
  update public.guestbook
  set likes_count = likes_count + 1
  where id = entry_id;
end;
$$ language plpgsql security definer;

-- 4. BẬT REALTIME CHO BẢNG GUESTBOOK (Tùy chọn hiển thị lời chúc tức thì)
alter publication supabase_realtime add table public.guestbook;

-- 5. SEED DỮ LIỆU MẪU BAN ĐẦU CHO SỔ LƯU BÚT
insert into public.guestbook (name, message, relationship, avatar_color, likes_count)
values 
  ('Nguyễn Minh Tuấn & Nhóm bạn Đại học', 'Chúc hai bạn trăm năm hạnh phúc, đầu bạc răng long! Chúc cho tổ ấm nhỏ luôn tràn ngập tiếng cười và yêu thương.', 'friend', 'rose', 12),
  ('Chị Thảo & Gia đình', 'Mừng ngày vui của hai em! Chúc hai em luôn đồng hành, thấu hiểu và chia sẻ mọi niềm vui nỗi buồn trong cuộc sống hôn nhân.', 'family', 'amber', 8),
  ('Đức Huy - Team Công Nghệ', 'Chúc mừng anh Phan Anh và chị Ngọc Yến! Đám cưới tuyệt đẹp, chúc hai bạn trăm năm hạnh phúc và sớm đón thiên thần nhỏ nhé!', 'colleague', 'emerald', 15),
  ('Cô Bảy & Chú Hùng', 'Chúc hai cháu trăm năm tình viên mãn, bạc đầu nghĩa phu thê. Gia đình hai bên luôn tự hào về hai cháu.', 'relative', 'indigo', 6)
on conflict do nothing;
