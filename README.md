# Manager – Quản lý dự án công nghiệp

Ứng dụng React quản lý dự án theo dạng Kanban (Báo giá → Đặt hàng → Sản xuất → Giao hàng → Thi công).
Dữ liệu được lưu ngay trên trình duyệt của bạn (localStorage).

## Cách deploy lên GitHub Pages (miễn phí)

### Bước 1: Tạo repo trên GitHub
1. Vào https://github.com/new
2. Đặt tên repo, ví dụ `project-manager` (Public hoặc Private đều được)
3. **Không** tick "Add a README" (vì mình đã có sẵn)
4. Nhấn "Create repository"

### Bước 2: Đẩy code lên GitHub
Mở terminal tại thư mục project này và chạy:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<TEN-USER-CUA-BAN>/<TEN-REPO>.git
git push -u origin main
```

### Bước 3: Bật GitHub Pages
1. Vào repo trên GitHub → **Settings** → **Pages**
2. Ở mục "Build and deployment" → **Source**, chọn **GitHub Actions**
3. Xong! Workflow trong `.github/workflows/deploy.yml` sẽ tự động build và deploy mỗi khi bạn push code lên nhánh `main`.

### Bước 4: Xem kết quả
Sau khi Actions chạy xong (xem tab **Actions** trên GitHub), trang web sẽ có ở địa chỉ:

```
https://<TEN-USER-CUA-BAN>.github.io/<TEN-REPO>/
```

## Chạy thử ở máy local (tuỳ chọn)

```bash
npm install
npm run dev
```

Mở trình duyệt tại địa chỉ hiện ra (thường là http://localhost:5173).

## Lưu ý về dữ liệu
- Dữ liệu dự án được lưu trong `localStorage` của trình duyệt — nghĩa là mỗi máy/trình duyệt sẽ có dữ liệu riêng, không đồng bộ giữa các thiết bị.
- Nếu xoá cache/dữ liệu trình duyệt, dữ liệu dự án sẽ mất. Nếu cần lưu trữ dùng chung nhiều người/nhiều máy, sẽ cần thêm một backend (ví dụ Firebase, Supabase) — cứ nói nếu bạn muốn mình làm thêm phần đó.
