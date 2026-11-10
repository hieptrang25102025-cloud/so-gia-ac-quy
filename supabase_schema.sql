-- ==============================================================
-- SỔ GIÁ ẮC QUY - SUPABASE PRODUCTION DATABASE SCHEMA
-- Hỗ trợ: Đa thiết bị, Phân quyền Admin / Viewer, RLS và Storage
-- ==============================================================

-- 1. BẢNG PHÂN QUYỀN NGƯỜI DÙNG (user_profiles)
-- Liên kết trực tiếp với bảng tài khoản auth.users của Supabase
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'viewer' CHECK (role IN ('admin', 'viewer')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Chỉ mục tìm kiếm người dùng
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);

-- 2. HÀM KIỂM TRA QUYỀN ADMIN (Dùng trong RLS Policies)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. TRIGGER TỰ ĐỘNG TẠO USER PROFILE KHI CÓ TÀI KHOẢN MỚI
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        -- Nếu là email đầu tiên hoặc có đánh dấu admin trong metadata thì cấp admin, ngược lại là viewer
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer')
    )
    ON CONFLICT (id) DO UPDATE
    SET email = EXCLUDED.email;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. BẢNG NHÀ CUNG CẤP (suppliers)
CREATE TABLE IF NOT EXISTS public.suppliers (
    id VARCHAR(50) PRIMARY KEY, -- 'nguyen', 'ngoc', 'nhung'
    name VARCHAR(100) NOT NULL,
    badge_text VARCHAR(150),
    color VARCHAR(20) NOT NULL,
    light_bg VARCHAR(20),
    text_color VARCHAR(20),
    border_color VARCHAR(20),
    last_updated VARCHAR(50) DEFAULT 'Chưa có dữ liệu',
    item_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Khởi tạo 3 nhà cung cấp mặc định
INSERT INTO public.suppliers (id, name, badge_text, color, light_bg, text_color, border_color, last_updated, item_count)
VALUES 
    ('nguyen', 'Nguyên', 'Nhà cung cấp Nguyên', '#C93642', '#FDECEE', '#8E1722', '#F7B4BB', 'Chưa có dữ liệu', 0),
    ('ngoc', 'Ngọc', 'Nhà cung cấp Ngọc', '#E06D10', '#FFF2E6', '#A64805', '#F8C89F', 'Chưa có dữ liệu', 0),
    ('nhung', 'Nhung', 'Nhà cung cấp Nhung', '#7B3FA8', '#F5ECFA', '#58217E', '#D8B3F2', 'Chưa có dữ liệu', 0)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    badge_text = EXCLUDED.badge_text,
    color = EXCLUDED.color;

-- 5. BẢNG ĐƠN GIÁ BÌNH ẮC QUY (battery_prices)
CREATE TABLE IF NOT EXISTS public.battery_prices (
    id VARCHAR(100) PRIMARY KEY,
    supplier_id VARCHAR(50) REFERENCES public.suppliers(id) ON DELETE CASCADE,
    battery_name VARCHAR(200) NOT NULL,
    unit_price BIGINT NOT NULL,
    formatted_price VARCHAR(50),
    updated_at VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_battery_prices_supplier ON public.battery_prices(supplier_id);
CREATE INDEX IF NOT EXISTS idx_battery_prices_name ON public.battery_prices(battery_name);

-- 6. BẢNG LỊCH SỬ CẬP NHẬT (price_history)
CREATE TABLE IF NOT EXISTS public.price_history (
    id VARCHAR(100) PRIMARY KEY,
    supplier_id VARCHAR(50) REFERENCES public.suppliers(id) ON DELETE CASCADE,
    supplier_name VARCHAR(100) NOT NULL,
    date_str VARCHAR(100) NOT NULL,
    timestamp BIGINT NOT NULL,
    item_count INT NOT NULL,
    image_url TEXT,
    notes TEXT,
    snapshot_items JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_price_history_supplier ON public.price_history(supplier_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created ON public.price_history(created_at DESC);

-- ==============================================================
-- 7. CẤU HÌNH BẢO MẬT ROW LEVEL SECURITY (RLS)
-- ==============================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.battery_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.price_history ENABLE ROW LEVEL SECURITY;

-- 7.1. Chính sách cho bảng user_profiles
CREATE POLICY "Người dùng tự xem hồ sơ của mình"
ON public.user_profiles FOR SELECT
TO authenticated
USING (id = auth.uid() OR public.is_admin());

CREATE POLICY "Admin có thể cập nhật phân quyền người dùng"
ON public.user_profiles FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7.2. Chính sách ĐỌC dữ liệu bảng giá (Áp dụng cho mọi tài khoản đã đăng nhập - cả Admin và Viewer)
CREATE POLICY "Cho phép người dùng đã đăng nhập xem nhà cung cấp"
ON public.suppliers FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Cho phép người dùng đã đăng nhập xem giá ắc quy"
ON public.battery_prices FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Cho phép người dùng đã đăng nhập xem lịch sử"
ON public.price_history FOR SELECT
TO authenticated
USING (true);

-- 7.3. Chính sách GHI dữ liệu bảng giá (Chỉ dành riêng cho ADMIN)
CREATE POLICY "Chỉ Admin được cập nhật nhà cung cấp"
ON public.suppliers FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Chỉ Admin được thêm sửa xóa giá ắc quy"
ON public.battery_prices FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Chỉ Admin được thêm lịch sử cập nhật"
ON public.price_history FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================
-- 8. CẤU HÌNH STORAGE LƯU ẢNH BÁO GIÁ GỐC (Bucket: quote-images)
-- ==============================================================
-- Tạo bucket lưu ảnh báo giá
INSERT INTO storage.buckets (id, name, public)
VALUES ('quote-images', 'quote-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Cho phép người dùng đã đăng nhập xem ảnh báo giá
CREATE POLICY "Xem ảnh báo giá"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'quote-images');

-- Chỉ Admin được tải ảnh báo giá lên Storage
CREATE POLICY "Admin tải ảnh báo giá"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'quote-images' AND public.is_admin());
