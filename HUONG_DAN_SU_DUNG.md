# 📖 HƯỚNG DẪN SỬ DỤNG VÀ TRIỂN KHAI: SỔ GIÁ ẮC QUY
## Ứng dụng Quản lý & So sánh Báo giá Ắc quy Chuyên nghiệp (Hỗ trợ bóc tách ảnh đa trang 100%)

---

## 1. GIỚI THIỆU TỔNG QUAN

**SỔ GIÁ ẮC QUY** là ứng dụng Web App dạng **Progressive Web App (PWA)**, được thiết kế theo phong cách Mobile App cao cấp, phục vụ việc tra cứu và quản lý giá ắc quy từ 3 nhà cung cấp chính:
- 🔴 **Nhà cung cấp Nguyên**
- 🟠 **Nhà cung cấp Ngọc**
- 🟣 **Nhà cung cấp Nhung**

### Điểm nổi bật của hệ thống:
1. **Thiết kế Mobile-first cao cấp:** Chữ lớn rõ ràng (18–22px), nút bấm to, độ tương phản cao, thẻ giá nằm trên cùng một hàng không bị tràn màn hình. Có tính năng **đọc to giá tiền bằng giọng nói tiếng Việt**.
2. **Bóc tách ảnh đa trang (2 - 3 trang cùng lúc):** Cho phép tải lên toàn bộ các trang ảnh báo giá dài từ Zalo, AI tự động đọc tuần tự từ Trang 1, Trang 2, Trang 3 mà không bỏ sót bất kỳ dòng sản phẩm nào.
3. **Độ chính xác 100%:** Chỉ trích xuất đúng **Tên bình** và **Đơn giá**, loại bỏ hoàn toàn các thông số phụ gây nhiễu (STT, Kích thước DxRxC, Ah, địa chỉ, bảo hành...).
4. **Bộ đối chiếu ảnh gốc & Rà soát trực tiếp:** Có kính lúp phóng to/thu nhỏ ảnh gốc ngay trên màn hình kiểm tra để đối chiếu từng dòng trước khi lưu.
5. **So sánh giá tức thì:** Tra cứu một mã bình (ví dụ `N100`), hệ thống hiển thị bảng so sánh giá cả 3 nhà và làm nổi bật **"Giá tốt nhất"** cùng số tiền tiết kiệm được.

---

## 2. HƯỚNG DẪN CHẠY THỬ TRÊN ĐIỆN THOẠI TRONG MẠNG WI-FI NỘI BỘ

Thư mục dự án:
`C:\Users\HP\.gemini\antigravity\scratch\so-gia-ac-quy`

- **Địa chỉ IP máy tính:** `192.168.2.6`
- **Cổng kết nối (Port):** `3001`
- **Đường link trên máy tính:** `http://localhost:3001`
- **Đường link trên điện thoại:** `http://192.168.2.6:3001`

### Bước 1: Mở cổng Firewall (Chỉ cần làm 1 lần duy nhất)
- Trong thư mục dự án, nhấp đúp vào tệp **`mo-firewall.bat`**.
- Khi cửa sổ thông báo của Windows hiện lên hỏi quyền Admin, chọn **Yes**.
- Cổng 3001 sẽ được mở an toàn riêng cho mạng Wi-Fi Private (không mở ra Internet).

### Bước 2: Bật máy chủ ứng dụng
- Nhấp đúp vào tệp **`start.bat`**.
- Trình duyệt máy tính sẽ tự động mở trang `http://localhost:3001`.
- Cửa sổ màu đen sẽ hiển thị thông báo máy chủ đang chạy và sẵn sàng kết nối.

### Bước 3: Mở ứng dụng trên điện thoại (Cùng mạng Wi-Fi)
1. Hãy đảm bảo điện thoại của bạn đang bắt **cùng sóng Wi-Fi** với máy tính.
2. Mở trình duyệt trên điện thoại:
   - **Trên iPhone:** Mở trình duyệt **Safari**, gõ vào thanh địa chỉ:
     `http://192.168.2.6:3001`
   - **Trên Samsung / Android:** Mở trình duyệt **Chrome**, gõ vào thanh địa chỉ:
     `http://192.168.2.6:3001`
3. Ứng dụng SỔ GIÁ ẮC QUY sẽ xuất hiện đầy đủ với giao diện Mobile App cao cấp.
4. Thử tìm kiếm tên bình, chuyển giữa 3 nhà cung cấp (Nguyên, Ngọc, Nhung), bấm loa đọc giá và thử tải ảnh báo giá từ camera/thư viện ảnh điện thoại!

---

## 3. QUY TRÌNH TẢI 2 - 3 TRANG ẢNH BÁO GIÁ DÀI (ĐẢM BẢO 100% CHÍNH XÁC)

Khi nhà cung cấp gửi bảng báo giá dài gồm nhiều ảnh qua Zalo:

### Bước 1: Chọn tất cả các ảnh cùng lúc
- Tại Trang chủ, nhấn nút đỏ: **"TẢI ẢNH BÁO GIÁ"**.
- Có thể quét chọn cùng lúc **2 hoặc 3 ảnh** từ thư viện điện thoại/máy tính.
- Nếu chụp ảnh bằng camera, bạn có thể chụp ảnh trang 1, sau đó nhấn nút **"➕ Thêm trang nữa"** để chụp tiếp trang 2 và trang 3.

### Bước 2: Chọn nhà cung cấp
- Màn hình sẽ hiển thị danh sách các trang ảnh đã chọn (Trang 1, Trang 2, Trang 3...).
- Nhấn chọn nút nhà cung cấp tương ứng: **Nguyên** (đỏ), **Ngọc** (cam) hoặc **Nhung** (tím).

### Bước 3: AI bóc tách gộp toàn bộ các trang
- Hệ thống AI sẽ đọc tuần tự từng trang từ đầu đến cuối và ghép thành danh sách đầy đủ tất cả các sản phẩm.
- Mỗi dòng sản phẩm được đánh dấu rõ trích xuất từ **Trang 1**, **Trang 2** hay **Trang 3**.

### Bước 4: Kiểm tra và đối chiếu ảnh gốc (Đảm bảo 100%)
- Màn hình kiểm tra hiển thị bộ công cụ đối chiếu:
  - Bấm chọn các tab **Trang 1 / Trang 2 / Trang 3** để xem ảnh gốc của từng trang.
  - Sử dụng nút **Phóng to (+)**, **Thu nhỏ (-)** để soi rõ từng con số trên báo giá gốc.
  - Các dòng sản phẩm đều có thể bấm vào để sửa trực tiếp nếu ảnh gốc bị mờ.
  - Có thể xóa dòng thừa hoặc bấm **"Thêm dòng"** nếu muốn bổ sung.

### Bước 5: Xác nhận lưu vào sổ
- Nhấn **"LƯU MÃ VÀO SỔ"**.
- Dữ liệu được cập nhật ngay lập tức vào đúng nhà cung cấp đó.
- Các sản phẩm cũ không xuất hiện trong báo giá mới vẫn được bảo toàn nguyên vẹn 100%.

---

## 4. HƯỚNG DẪN CÀI ĐẶT RA MÀN HÌNH CHÍNH ĐIỆN THOẠI (PWA)

### Trên iPhone (Trình duyệt Safari):
1. Mở Safari và truy cập vào đường link ứng dụng.
2. Bấm vào biểu tượng **Chia sẻ** (hình ô vuông có mũi tên chỉ lên ở thanh công cụ Safari).
3. Cuộn xuống và chọn **"Thêm vào Màn hình chính" (Add to Home Screen)**.
4. Bấm **"Thêm" (Add)**.

### Trên điện thoại Samsung & Android (Trình duyệt Chrome):
1. Mở Chrome và truy cập vào đường link ứng dụng.
2. Bấm vào biểu tượng **3 dấu chấm** ở góc trên bên phải.
3. Chọn **"Cài đặt ứng dụng" (Install app)** hoặc **"Thêm vào màn hình chính"**.
4. Bấm **"Cài đặt"**.

---

## 5. HƯỚNG DẪN TRA CỨU & SO SÁNH GIÁ

1. **Xem bảng giá:** Chạm vào thẻ nhà cung cấp (Nguyên, Ngọc, Nhung) để xem toàn bộ danh mục bình và đơn giá. Bấm vào biểu tượng loa 🔊 để nghe đọc to giá tiền.
2. **Tìm kiếm nhanh:** Gõ mã bình vào thanh tìm kiếm hoặc bấm các nút chọn nhanh (`N100`, `N50`, `NS70`, `N25`...).
3. **So sánh giá 3 nhà:** Bấm nút **"So sánh giá"** (biểu tượng chiếc cân ⚖️) ở menu dưới cùng để xem ngay giá cả 3 nhà song song và biết ngay nhà nào có giá tốt nhất.

---

## 6. TRIỂN KHAI LÊN INTERNET ĐỂ DÙNG CHUNG CẢ GIA ĐÌNH

1. Đăng ký tài khoản miễn phí tại [vercel.com](https://vercel.com).
2. Tải mã nguồn lên GitHub hoặc triển khai qua Vercel CLI:
   - Build Command: `npm run build`
   - Output Directory: `dist`
3. Vercel sẽ cấp 1 đường link cố định (ví dụ: `https://so-gia-ac-quy.vercel.app`) để mọi điện thoại trong gia đình đều truy cập được và đồng bộ dữ liệu với nhau.
