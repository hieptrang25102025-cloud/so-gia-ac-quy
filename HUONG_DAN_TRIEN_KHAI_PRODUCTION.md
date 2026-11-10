# 🚀 HƯỚNG DẪN TRIỂN KHAI PRODUCTION – SỔ GIÁ ẮC QUY

Tài liệu này cung cấp toàn bộ quy trình đưa ứng dụng **SỔ GIÁ ẮC QUY** lên Internet thực tế, chạy độc lập 24/7 trên điện thoại và máy tính mà **không cần bật máy tính cá nhân**.

---

## 1. KIẾN TRÚC HỆ THỐNG VÀ CHI PHÍ DỰ KIẾN

Hệ thống được thiết kế theo kiến trúc hiện đại, hợp nhất toàn bộ Frontend và Backend Node.js vào **1 Web Service duy nhất**:

| Thành phần | Nền tảng | Vai trò | Chi phí |
| :--- | :--- | :--- | :--- |
| **Mã nguồn** | **GitHub** | Quản lý mã nguồn an toàn, tự động kích hoạt deploy | **Miễn phí 100%** |
| **Máy chủ Ứng dụng** | **Render (Web Service)** | Chạy Node.js server, phục vụ Web App HTTPS và API | **Miễn phí 100%** (Gói Free) |
| **Cơ sở dữ liệu & Auth** | **Supabase** | Lưu trữ bảng giá, phân quyền tài khoản (Admin/Viewer), Storage ảnh | **Miễn phí 100%** (Gói Free 500MB DB & 1GB Storage) |
| **AI Vision Bóc Tách** | **Google Gemini Flash** | Đọc ảnh báo giá đa trang, bóc tách tên bình và giá Net | **Miễn phí 100%** (15 lượt/phút) |

> 💰 **Tổng chi phí duy trì:** **0 VNĐ / tháng** (vận hành miễn phí lâu dài).

---

## 2. BƯỚC 1: THIẾT LẬP SUPABASE DATABASE & STORAGE

### 2.1. Đăng nhập hoặc Tạo dự án Supabase mới
1. Truy cập: [https://supabase.com/](https://supabase.com/) và đăng nhập.
2. Bấm **"New project"**, đặt tên: `so-gia-ac-quy`.
3. Đặt mật khẩu cơ sở dữ liệu và chọn Region gần nhất: **Singapore (Southeast Asia)**.
4. Bấm **"Create new project"** và chờ khoảng 1-2 phút để hoàn tất khởi tạo.

### 2.2. Khởi tạo Cơ sở dữ liệu và Phân quyền (SQL Editor)
1. Tại thanh menu bên trái của Supabase Dashboard, chọn **SQL Editor**.
2. Mở file [`supabase_schema.sql`](file:///C:/Users/HP/.gemini/antigravity/scratch/so-gia-ac-quy/supabase_schema.sql) trong thư mục dự án, sao chép toàn bộ nội dung.
3. Dán vào khung soạn thảo SQL của Supabase và bấm **"Run" (Chạy)**.
4. Hệ thống sẽ tự động tạo:
   - Bảng phân quyền người dùng: `user_profiles` (Admin / Viewer).
   - Bảng 3 nhà cung cấp: `suppliers` (Nguyên, Ngọc, Nhung).
   - Bảng đơn giá bình: `battery_prices`.
   - Bảng lịch sử cập nhật: `price_history`.
   - Kích hoạt cơ chế bảo vệ dữ liệu **Row Level Security (RLS)**.
   - Tạo Bucket lưu trữ ảnh báo giá gốc: `quote-images`.

### 2.3. Lấy thông tin kết nối Supabase
1. Vào **Project Settings** (biểu tượng bánh răng ở góc dưới bên trái) -> Chọn tab **API**.
2. Ghi lại 2 thông số:
   - **Project URL:** Dạng `https://xxxxxxxxxxxxxxxxxxxx.supabase.co`
   - **Project API Keys (anon / public):** Dạng `eyJhbGciOiJIUzI1NiIsIn...`

---

## 3. BƯỚC 2: TẢI MÃ NGUỒN LÊN GITHUB

Mã nguồn sạch, an toàn (đã loại bỏ toàn bộ `.env` và `node_modules`) đã được chuẩn bị sẵn tại:
- **Thư mục tải lên:** `C:\Users\HP\.gemini\antigravity\scratch\so-gia-ac-quy-upload`
- **Tệp nén sẵn sàng:** `C:\Users\HP\.gemini\antigravity\scratch\so_gia_ac_quy_deploy.zip`

### Cách đưa lên GitHub:
1. Đăng nhập vào [https://github.com/](https://github.com/).
2. Bấm nút **"New"** (hoặc dấu `+` góc trên phải) để tạo Repository mới:
   - **Repository name:** `so-gia-ac-quy`
   - Chọn chế độ: **Private** (Riêng tư - chỉ bạn và gia đình truy cập).
   - Không tích chọn "Add a README file" (vì đã có sẵn mã nguồn).
   - Bấm **"Create repository"**.
3. Tại trang hiển thị repository mới:
   - Chọn liên kết: **"uploading an existing file"**.
   - Kéo toàn bộ các tệp và thư mục trong thư mục [`so-gia-ac-quy-upload`](file:///C:/Users/HP/.gemini/antigravity/scratch/so-gia-ac-quy-upload) thả vào màn hình tải lên của GitHub.
   - Bấm **"Commit changes"**.

---

## 4. BƯỚC 3: CẤU HÌNH VÀ TRIỂN KHAI TRÊN RENDER

1. Truy cập: [https://render.com/](https://render.com/) và đăng nhập (chọn Sign in with GitHub).
2. Tại bảng điều khiển Render Dashboard, bấm nút **"New +"** ở góc trên -> Chọn **"Web Service"**.
3. Chọn repository `so-gia-ac-quy` từ danh sách GitHub của bạn -> Bấm **"Connect"**.
4. Điền các thông số triển khai:
   - **Name:** `so-gia-ac-quy` *(đây sẽ là tên miền của bạn, ví dụ: `https://so-gia-ac-quy.onrender.com`)*.
   - **Region:** **Singapore (Southeast Asia)**.
   - **Branch:** `main` (hoặc `master`).
   - **Runtime:** **Node**.
   - **Build Command:**
     ```bash
     npm install && npm run build
     ```
   - **Start Command:**
     ```bash
     node server/index.js
     ```
   - **Instance Type:** Chọn gói **Free**.

5. **Cấu hình Biến môi trường (Environment Variables):**
   Cuộn xuống mục **Environment Variables**, bấm **"Add Environment Variable"** và thêm đủ các biến sau:

| Tên biến (Key) | Giá trị (Value) | Mô tả |
| :--- | :--- | :--- |
| `NODE_VERSION` | `20` | Phiên bản Node.js ổn định |
| `GEMINI_API_KEY` | *(Khóa API Gemini của bạn)* | Dùng cho backend bóc tách ảnh AI |
| `VITE_SUPABASE_URL` | `https://xxxxxxxx.supabase.co` | Project URL từ bước 2.3 |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUz...` | Anon/Public Key từ bước 2.3 |

6. Bấm **"Create Web Service"**.
7. Render sẽ tự động kéo code từ GitHub về, chạy `npm install`, dịch `vite build` và khởi động Node.js server. Quá trình mất khoảng 1-2 phút.
8. Khi màn hình hiện chữ **"Live"**, bạn sẽ có đường link HTTPS chính thức:
   👉 **`https://so-gia-ac-quy.onrender.com`**

---

## 5. BƯỚC 4: TẠO TÀI KHOẢN VÀ THIẾT LẬP PHÂN QUYỀN

### 5.1. Tạo tài khoản Quản trị viên (ADMIN)
1. Mở ứng dụng tại đường link HTTPS của bạn.
2. Bấm biểu tượng **Bánh răng Cài đặt** ở góc trên bên phải -> Chọn **"Đăng nhập"**.
3. Bấm **"Chưa có tài khoản? Đăng ký tài khoản mới"**:
   - Nhập Email (ví dụ: `admin@gmail.com`).
   - Nhập Mật khẩu (tối thiểu 6 ký tự).
   - Chọn vai trò: **Quản trị (Admin)**.
   - Bấm **"Đăng ký tài khoản"**.
4. Tài khoản Admin có toàn quyền: Tải ảnh báo giá, chạy bóc tách AI, sửa xóa đơn giá và xác nhận cập nhật.

### 5.2. Tạo tài khoản Người xem (VIEWER)
- Đăng ký tương tự cho các thành viên khác với vai trò **Người xem (Viewer)**.
- Tài khoản Viewer chỉ có thể xem bảng giá, tìm kiếm, so sánh giá 3 nhà. Nút cập nhật giá sẽ tự động bị khóa và yêu cầu quyền Admin nếu có ai bấm vào.

---

## 6. BƯỚC 5: CÀI ĐẶT ỨNG DỤNG LÊN ĐIỆN THOẠI (PWA)

### Trên iPhone (Trình duyệt Safari):
1. Mở trình duyệt Safari trên iPhone và truy cập đường link HTTPS Render của bạn.
2. Bấm vào biểu tượng **Chia sẻ** (hình ô vuông có mũi tên chỉ lên ở thanh điều hướng dưới cùng).
3. Cuộn xuống và chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
4. Đổi tên thành **Sổ Giá Ắc Quy** và bấm **"Thêm" (Add)**.
5. Biểu tượng hình bình ắc quy màu đỏ ruby sang trọng sẽ xuất hiện trên màn hình iPhone, bấm mở lên sẽ chạy toàn màn hình như ứng dụng tải từ App Store!

### Trên Samsung & Android (Trình duyệt Chrome):
1. Mở trình duyệt Chrome trên điện thoại và truy cập đường link HTTPS của bạn.
2. Chạm vào biểu tượng **3 dấu chấm** ở góc trên bên phải.
3. Chọn **"Cài đặt ứng dụng"** hoặc **"Thêm vào màn hình chính"**.
4. Bấm **"Cài đặt"**.

---

## 7. BẢO MẬT & SAO LƯU DỮ LIỆU ĐỊNH KỲ

* **Bảo mật tuyệt đối:** Mã nguồn trên GitHub không chứa bất kỳ API key bí mật nào. Toàn bộ API key đều được lưu an toàn trong bảng điều khiển biến môi trường của Render.
* **Cơ chế sao lưu dự phòng:**
  1. Trong ứng dụng, bấm vào biểu tượng bánh răng Cài đặt.
  2. Tại mục **Sao lưu và dữ liệu**, bấm nút **"Tải file sao lưu dữ liệu (.JSON)"** để lưu về máy tính hoặc điện thoại một bản sao lưu an toàn bất kỳ lúc nào.
  3. Nếu muốn khôi phục lại, chỉ cần bấm **"Khôi phục dữ liệu từ file backup"** và chọn tệp `.json` đã lưu.
