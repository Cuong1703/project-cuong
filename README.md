# Manager – Quản lý dự án công nghiệp

Ứng dụng React quản lý dự án theo dạng Kanban (Báo giá → Đặt hàng → Sản xuất → Giao hàng → Thi công).
Có đăng nhập (email/mật khẩu), mỗi người dùng có dữ liệu riêng, lưu trên **Supabase**.

## Phần 1: Tạo backend trên Supabase

### 1.1 Tạo project
1. Vào https://supabase.com → đăng nhập/đăng ký → **New project**
2. Đặt tên project, chọn mật khẩu database, chọn region gần bạn (Singapore là gần VN nhất)
3. Đợi ~2 phút để Supabase khởi tạo xong

### 1.2 Tạo bảng dữ liệu
1. Trong project vừa tạo, vào menu **SQL Editor** (icon `</>` bên trái)
2. Bấm **New query**
3. Mở file `supabase-schema.sql` (đi kèm trong project này), copy toàn bộ nội dung, dán vào ô query
4. Bấm **Run** (hoặc Ctrl+Enter)
5. Nếu thấy "Success. No rows returned" là đã tạo xong bảng `projects` + bảo mật theo user

### 1.3 Lấy API key
1. Vào **Project Settings** (icon bánh răng) → **API**
2. Copy 2 giá trị:
   - **Project URL** (dạng `https://xxxxx.supabase.co`)
   - **anon public** key (chuỗi dài ở mục Project API keys)

### 1.4 (Tuỳ chọn) Tắt xác nhận email khi đăng ký
Mặc định Supabase bắt xác nhận email trước khi đăng nhập được. Nếu muốn test nhanh không cần check email:
1. Vào **Authentication** → **Providers** → **Email**
2. Tắt **Confirm email**
3. Save

## Phần 2: Chạy thử ở máy local (tuỳ chọn)

1. Copy file `.env.example` thành `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Mở `.env.local`, dán Project URL và anon key đã lấy ở Phần 1.3 vào
3. Chạy:
   ```bash
   npm install
   npm run dev
   ```
4. Mở http://localhost:5173, đăng ký tài khoản thử

## Phần 3: Deploy lên Vercel

### 3.1 Đẩy code lên GitHub
Nếu đã có repo GitHub từ trước, chỉ cần commit và push code mới:
```bash
git add .
git commit -m "Thêm đăng nhập và lưu dữ liệu qua Supabase"
git push
```

### 3.2 Import project vào Vercel
1. Vào https://vercel.com → đăng nhập (dùng tài khoản GitHub cho tiện)
2. Bấm **Add New** → **Project**
3. Chọn repo GitHub của bạn → **Import**
4. Vercel tự nhận diện đây là project Vite, không cần đổi gì ở phần Build Settings

### 3.3 Khai báo biến môi trường (QUAN TRỌNG)
Trước khi bấm Deploy, cuộn xuống mục **Environment Variables**, thêm 2 biến:

| Name | Value |
|---|---|
| `VITE_SUPABASE_URL` | Project URL đã lấy ở Phần 1.3 |
| `VITE_SUPABASE_ANON_KEY` | anon public key đã lấy ở Phần 1.3 |

Nếu quên bước này, web sẽ deploy được nhưng đăng nhập/lưu dữ liệu sẽ báo lỗi.

### 3.4 Deploy
Bấm **Deploy**, đợi khoảng 1 phút. Xong, Vercel sẽ cho bạn 1 link dạng:
```
https://ten-project.vercel.app
```

### Cập nhật sau này
Từ giờ mỗi lần bạn push code lên GitHub, Vercel sẽ **tự động build và deploy lại** — không cần làm lại bước nào ở trên.

## Lưu ý bảo mật
- File `.env.local` chứa key, đã được thêm vào `.gitignore` — không bao giờ commit lên GitHub.
- `anon public` key là an toàn để lộ ra frontend (đây là thiết kế của Supabase) — vì mọi quyền truy cập dữ liệu đã được kiểm soát bởi Row Level Security (RLS) đã tạo trong `supabase-schema.sql`, đảm bảo mỗi người chỉ đọc/sửa được dữ liệu của chính mình.
