@echo off
chcp 65001 > nul
title MỞ CỔNG FIREWALL 3001 CHO SỔ GIÁ ẮC QUY

:: Tự động yêu cầu quyền Administrator nếu chưa có
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Đang yêu cầu quyền Administrator để mở cổng Firewall...
    powershell -Command "Start-Process cmd -ArgumentList '/c \"%~fn0\"' -Verb RunAs"
    exit /b
)

echo ==================================================================
echo   ĐANG CẤU HÌNH WINDOWS FIREWALL CHO PHÉP TRUY CẬP CỔNG 3001
echo   (Chỉ áp dụng trên mạng Private/Nội bộ - Không mở ra Internet)
echo ==================================================================
echo.

:: Xóa rule cũ nếu có
netsh advfirewall firewall delete rule name="SoGiaAcQuy-Port3001" >nul 2>&1

:: Thêm rule mới cho port 3001 trên Private profile
netsh advfirewall firewall add rule name="SoGiaAcQuy-Port3001" dir=in action=allow protocol=TCP localport=3001 profile=private

if %errorlevel% equ 0 (
    echo [THÀNH CÔNG] Đã mở cổng 3001 trên mạng Wi-Fi nội bộ!
    echo Bây giờ điện thoại (192.168.2.6:3001) có thể kết nối bình thường.
) else (
    echo [LƯU Ý] Không thể thêm rule tự động. Bạn có thể kiểm tra lại quyền Admin.
)

echo.
pause
