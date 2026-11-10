import React from 'react';
import { PriceItem, Supplier } from '../../types';
import { X, Scale, Calendar } from 'lucide-react';

interface Props {
  item: PriceItem | null;
  supplier: Supplier | null;
  onClose: () => void;
  onCompare: (batteryName: string) => void;
}

export const PriceDetailModal: React.FC<Props> = ({
  item,
  supplier,
  onClose,
  onCompare,
}) => {
  if (!item || !supplier) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-brand-border/40 animate-scaleUp">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center transition-colors active:scale-90"
        >
          <X className="w-5 h-5 stroke-[2.5]" />
        </button>

        {/* Supplier Badge */}
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-rose-50 text-brand-dark text-xs font-bold mb-3">
          <span className="w-2 h-2 rounded-full bg-brand-ruby" />
          <span>Nhà cung cấp {supplier.name}</span>
        </div>

        {/* Battery Name */}
        <h2 className="text-2xl font-black text-brand-charcoal mb-4">
          {item.batteryName}
        </h2>

        {/* Price Box */}
        <div className="bg-gradient-to-br from-rose-50 via-rose-100/60 to-rose-50 rounded-2xl p-4 border border-rose-200 text-center mb-5">
          <div className="text-xs uppercase tracking-wider font-bold text-brand-charcoal/60 mb-1">
            Đơn giá hiện tại
          </div>
          <div className="text-3xl sm:text-4xl font-black text-brand-dark tracking-tight">
            {item.formattedPrice}
            <span className="text-base font-bold ml-1 text-brand-ruby">đ</span>
          </div>
          <div className="flex items-center justify-center text-xs text-stone-500 mt-2 space-x-1">
            <Calendar className="w-3.5 h-3.5 text-stone-400" />
            <span>Ngày cập nhật: {item.updatedAt}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Compare this battery */}
          <button
            onClick={() => {
              onClose();
              onCompare(item.batteryName);
            }}
            className="w-full py-3.5 px-4 rounded-xl bg-brand-ruby hover:bg-brand-dark text-white font-bold flex items-center justify-center space-x-2 transition-all active:scale-98 shadow-sm"
          >
            <Scale className="w-5 h-5" />
            <span>So sánh giá bình này ở 3 nhà</span>
          </button>
        </div>
      </div>
    </div>
  );
};
