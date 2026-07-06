-- Chạy toàn bộ file này trong Supabase Dashboard > SQL Editor > New query > Run

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  customer text,
  value numeric,
  deadline date,
  notes text,
  stage int not null default 0,
  created_at timestamptz not null default now()
);

-- Bật Row Level Security (bắt buộc để mỗi người chỉ thấy dữ liệu của mình)
alter table public.projects enable row level security;

-- Chỉ được xem dự án của chính mình
create policy "Users can view own projects"
  on public.projects for select
  using (auth.uid() = user_id);

-- Chỉ được tạo dự án gắn với user_id của chính mình
create policy "Users can insert own projects"
  on public.projects for insert
  with check (auth.uid() = user_id);

-- Chỉ được sửa dự án của chính mình
create policy "Users can update own projects"
  on public.projects for update
  using (auth.uid() = user_id);

-- Chỉ được xoá dự án của chính mình
create policy "Users can delete own projects"
  on public.projects for delete
  using (auth.uid() = user_id);

-- (Tuỳ chọn) đánh index cho truy vấn theo user nhanh hơn
create index if not exists projects_user_id_idx on public.projects(user_id);
