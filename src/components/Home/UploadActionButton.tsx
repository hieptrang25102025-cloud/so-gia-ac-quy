import React, { useRef } from 'react';
import { Camera, Image as ImageIcon } from 'lucide-react';

interface Props {
  onFilesSelected: (files: File[]) => void;
  disabled?: boolean;
  isAdmin?: boolean;
  onRequireAdmin?: () => void;
}

export const UploadActionButton: React.FC<Props> = ({ 
  onFilesSelected, 
  disabled = false,
  isAdmin = true,
  onRequireAdmin,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleTriggerUpload = () => {
    if (!isAdmin) {
      if (onRequireAdmin) onRequireAdmin();
      return;
    }
    fileInputRef.current?.click();
  };

  const handleTriggerCamera = () => {
    if (!isAdmin) {
      if (onRequireAdmin) onRequireAdmin();
      return;
    }
    cameraInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const fileList = Array.from(e.target.files);
      onFilesSelected(fileList);
      e.target.value = '';
    }
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Hidden standard file input (gallery & multi-select) */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        className="hidden"
      />

      {/* Hidden camera direct capture input */}
      <input
        type="file"
        ref={cameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Main Big Red Upload Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={handleTriggerUpload}
        className={`w-full relative overflow-hidden group text-white py-4 px-6 rounded-3xl shadow-button transition-all duration-200 flex items-center justify-center space-x-4 border-2 border-rose-300/40 ${
          isAdmin
            ? 'bg-gradient-to-r from-brand-dark via-brand-ruby to-rose-600 hover:from-brand-ruby hover:to-red-700 active:scale-98'
            : 'bg-stone-700 hover:bg-stone-800'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center backdrop-blur-xs flex-shrink-0">
          <Camera className="w-7 h-7 text-white stroke-[2.2]" />
        </div>

        <div className="text-left flex-1">
          <div className="text-lg sm:text-xl font-black tracking-tight leading-tight uppercase">
            {isAdmin ? 'TẢI ẢNH BÁO GIÁ' : 'CẬP NHẬT GIÁ (ADMIN)'}
          </div>
          <div className="text-xs sm:text-sm text-rose-100/90 font-medium">
            {isAdmin ? 'Chụp ảnh hoặc chọn từ thư viện (Nhiều ảnh)' : 'Chạm để đăng nhập tài khoản Quản trị'}
          </div>
        </div>
      </button>

      {/* Quick Camera Shortcut button */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleTriggerCamera}
          className="inline-flex items-center space-x-2 text-xs font-semibold text-brand-ruby hover:text-brand-dark px-3 py-1.5 rounded-full bg-rose-50 hover:bg-rose-100 transition-colors"
        >
          <Camera className="w-4 h-4" />
          <span>Chụp ảnh trực tiếp bằng Camera</span>
        </button>
      </div>
    </div>
  );
};
