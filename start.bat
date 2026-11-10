@echo off
chcp 65001 > nul
title SỔ GIÁ ẮC QUY - Máy chủ Wi-Fi Nội bộ (Port 3001)

cd /d "%~dp0"

echo ===================================================================
echo               ỨNG DỤNG SỔ GIÁ ẮC QUY - MẠNG WI-FI NỘI BỘ
echo ===================================================================
echo.
echo [1] Máy tính đang mở tại:       http://localhost:3001
echo [2] Điện thoại trong cùng Wi-Fi: http://192.168.2.6:3001
echo.
echo * HƯỚNG DẪN KẾT NỐI ĐIỆN THOẠI:
echo   - Kết nối điện thoại vào cùng mạng Wi-Fi với máy tính này.
echo   - Trên iPhone (Safari) hoặc Samsung (Chrome), truy cập:
echo     👉 http://192.168.2.6:3001
echo.
echo * Nếu điện thoại không tải được trang, hãy nhấp đúp vào file:
echo   "mo-firewall.bat" để cho phép Windows Firewall mở cổng 3001.
echo ===================================================================
echo.

:: Tự động thêm rule firewall nếu đã có quyền
netsh advfirewall firewall show rule name="SoGiaAcQuy-Port3001" >nul 2>&1
if %errorlevel% neq 0 (
    netsh advfirewall firewall add rule name="SoGiaAcQuy-Port3001" dir=in action=allow protocol=TCP localport=3001 profile=private >nul 2>&1
)

:: Giải phóng cổng 3001 nếu phiên bản cũ đang chạy ngầm
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :3001') do taskkill /f /pid %%a >nul 2>&1

:: Mở trình duyệt trên máy tính
start http://localhost:3001

:: Khởi chạy máy chủ Node.js phục vụ cả Frontend và Backend API
node server/index.js
pause
