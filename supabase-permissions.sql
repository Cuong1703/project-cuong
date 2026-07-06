-- ============================================================
-- MIGRATION: Thêm hệ thống phân quyền (admin / member / pending)
-- Chạy TOÀN BỘ file này trong Supabase Dashboard > SQL Editor > New query > Run
-- File này không đụng tới bảng "projects" đã tạo trước đó, chỉ bổ sung thêm.
-- ============================================================

-- 1) Bảng profiles: 1 dòng cho mỗi tài khoản, lưu vai trò + trạng thái duyệt
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  role text not null default 'member' check (role in ('admin', 'member')),
  status text not null default 'pending' check (status in ('pending', 'approved', 'blocked')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 2) Trigger: mỗi khi có tài khoản mới đăng ký (auth.users), tự tạo 1 dòng profile
--    mặc định role='member', status='pending' (phải chờ admin duyệt)
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, role, status)
  values (new.id, new.email, 'member', 'pending')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 3) RLS cho bảng profiles
drop policy if exists "profiles: select own" on public.profiles;
create policy "profiles: select own"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "profiles: admin select all" on public.profiles;
create policy "profiles: admin select all"
  on public.profiles for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

drop policy if exists "profiles: admin update all" on public.profiles;
create policy "profiles: admin update all"
  on public.profiles for update
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 4) Cập nhật RLS cho bảng projects: cho phép admin XEM (không sửa/xoá) toàn bộ dự án
drop policy if exists "projects: admin can view all" on public.projects;
create policy "projects: admin can view all"
  on public.projects for select
  using (
    exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
  );

-- 5) Chỉ tài khoản đã được duyệt (status='approved') mới được tạo dự án mới
drop policy if exists "Users can insert own projects" on public.projects;
create policy "Users can insert own projects"
  on public.projects for insert
  with check (
    auth.uid() = user_id
    and exists (select 1 from public.profiles p where p.id = auth.uid() and p.status = 'approved')
  );

-- ============================================================
-- 6) BOOTSTRAP: đưa tài khoản của bạn lên làm admin + duyệt sẵn
--    Đổi email bên dưới thành đúng email bạn đã dùng để đăng ký
-- ============================================================
insert into public.profiles (id, email, role, status)
select id, email, 'admin', 'approved'
from auth.users
where email = 'dinhcuongbk10kttt@gmail.com'
on conflict (id) do update set role = 'admin', status = 'approved';
