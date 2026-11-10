import React, { useRef } from 'react';
import { SupplierId } from '../../types';
import { X, Plus, Trash2, Images, Sparkles, AlertCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  images: { file: File; base64: string }[];
  onAddMoreFiles: (files: File[]) => void;
  onRemoveImage: (index: number) => void;
  onSelectSupplier: (supplierId: SupplierId) => void;
  onClose: () => void;
}

export const SupplierSelectorModal: React.FC<Props> = ({
  isOpen,
  images,
  onAddMoreFiles,
  onRemoveImage,
  onSelectSupplier,
  onClose,
}) => {
  const addFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleAddFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onAddMoreFiles(Array.from(e.target.files));
      e.target.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-xs animate-fadeIn">
      <div 
        className="relative w-full max-w-md bg-white rounded-3xl p-5 sm:p-6 shadow-2xl border border-brand-border/40 max-h-[92vh] flex flex-col overflow-hidden animate-scaleUp"
        role="dialog"
      >
        {/* Hidden input to add more pages */}
        <input
          type="file"
          ref={addFileInputRef}
          onChange={handleAddFiles}
          accept="image/*"
          multiple
          className="hidden"
        />

        {/* Close X Button top-right */}
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors active:scale-90"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Header */}
        <div className="flex flex-col items-center text-center mt-1 mb-3">
          <div className="w-14 h-14 rounded-full bg-gradient-to-tr from-brand-ruby to-rose-400 text-white flex items-center justify-center shadow-md mb-2">
            <Images className="w-7 h-7" />
          </div>
          
          <h2 className="text-xl sm:text-2xl font-black text-brand-charcoal leading-snug">
            Bảng giá của nhà cung cấp nào?
          </h2>

          <div className="inline-flex items-center space-x-1.5 mt-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-brand-dark text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-brand-ruby" />
            <span>Đang chọn {images.length} trang ảnh báo giá</span>
          </div>
        </div>

        {/* Multi-page Thumbnail Grid & Add page button */}
        <div className="mb-4 bg-stone-50 p-3 rounded-2xl border border-stone-200/80">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
              Các trang ảnh đã chọn ({images.length}):
            </span>
            <button
              type="button"
              onClick={() => addFileInputRef.current?.click()}
              className="inline-flex items-center space-x-1 text-xs font-bold text-brand-ruby hover:text-brand-dark bg-white px-2.5 py-1 rounded-lg border border-rose-200 shadow-2xs active:scale-95 transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Thêm trang nữa</span>
            </button>
          </div>

          <div className="flex items-center space-x-2.5 overflow-x-auto pb-1 no-scrollbar">
            {images.map((img, idx) => (
              <div
                key={idx}
                className="relative flex-shrink-0 w-20 h-24 rounded-xl overflow-hidden border-2 border-brand-ruby/50 bg-stone-900 group shadow-xs"
              >
                <img
                  src={img.base64}
                  alt={`Trang ${idx + 1}`}
                  className="w-full h-full object-cover opacity-90"
                />
                <span className="absolute bottom-0 inset-x-0 bg-black/75 text-white text-[10px] font-bold text-center py-0.5">
                  Trang {idx + 1}
                </span>
                {images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(idx);
                    }}
                    title="Xóa trang này"
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center shadow-md active:scale-90"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            ))}
          </div>

          <p className="text-[11px] text-stone-500 mt-2 text-center">
            💡 AI sẽ đọc gộp toàn bộ {images.length} trang và bóc tách đầy đủ 100% các dòng báo giá.
          </p>
        </div>

        {/* 3 Supplier Action Pills */}
        <div className="space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-stone-400 text-center mb-1">
            Chọn nhà cung cấp để bắt đầu đọc:
          </div>

          {/* Nguyên */}
          <button
            onClick={() => onSelectSupplier('nguyen')}
            className="w-full h-13 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-bold text-base shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <span>Nhà cung cấp Nguyên</span>
          </button>

          {/* Ngọc */}
          <button
            onClick={() => onSelectSupplier('ngoc')}
            className="w-full h-13 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-bold text-base shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <span>Nhà cung cấp Ngọc</span>
          </button>

          {/* Nhung */}
          <button
            onClick={() => onSelectSupplier('nhung')}
            className="w-full h-13 rounded-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-700 text-white font-bold text-base shadow-md hover:shadow-lg active:scale-98 transition-all flex items-center justify-center space-x-2"
          >
            <span>Nhà cung cấp Nhung</span>
          </button>

          {/* Hủy */}
          <button
            onClick={onClose}
            className="w-full h-11 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition-all active:scale-98 mt-1 flex items-center justify-center"
          >
            Hủy bỏ
          </button>
        </div>
      </div>
    </div>
  );
};
