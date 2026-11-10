import React from 'react';
import { Supplier, SupplierId } from '../../types';
import { Clock, ChevronRight, Layers } from 'lucide-react';

interface Props {
  suppliers: Record<SupplierId, Supplier>;
  onSelectSupplier: (supplierId: SupplierId) => void;
  mostRecentDate: string;
}

export const QuickSupplierCards: React.FC<Props> = ({
  suppliers,
  onSelectSupplier,
  mostRecentDate,
}) => {
  const supplierKeys: SupplierId[] = ['nguyen', 'ngoc', 'nhung'];

  return (
    <div className="w-full space-y-4">
      {/* Last Updated Banner matching Screenshot Mockup */}
      <div className="flex items-center justify-center space-x-2 py-2.5 px-4 rounded-2xl bg-brand-pinkLight border border-brand-border/60 text-brand-charcoal text-sm sm:text-base font-semibold shadow-xs">
        <Clock className="w-5 h-5 text-brand-ruby" />
        <span>Cập nhật gần nhất:</span>
        <span className="font-bold text-brand-dark">{mostRecentDate || '09/04/2026'}</span>
      </div>

      {/* 3 Quick Access Cards */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-brand-charcoal/70">
            Xem nhanh bảng giá theo nhà cung cấp:
          </span>
          <span className="text-xs text-brand-ruby font-semibold">Chạm để xem</span>
        </div>

        {supplierKeys.map(key => {
          const s = suppliers[key];
          if (!s) return null;

          // Supplier styling presets
          const colorStyles = {
            nguyen: {
              cardBg: 'bg-white hover:bg-rose-50/50',
              border: 'border-l-4 border-l-red-600 border-stone-200/80',
              badgeBg: 'bg-red-50 text-red-700',
              dot: 'bg-red-600',
            },
            ngoc: {
              cardBg: 'bg-white hover:bg-amber-50/50',
              border: 'border-l-4 border-l-amber-500 border-stone-200/80',
              badgeBg: 'bg-amber-50 text-amber-700',
              dot: 'bg-amber-500',
            },
            nhung: {
              cardBg: 'bg-white hover:bg-purple-50/50',
              border: 'border-l-4 border-l-purple-600 border-stone-200/80',
              badgeBg: 'bg-purple-50 text-purple-700',
              dot: 'bg-purple-600',
            },
          }[key];

          return (
            <button
              key={key}
              onClick={() => onSelectSupplier(key)}
              className={`w-full p-4 rounded-2xl border shadow-card transition-all duration-200 active:scale-98 flex items-center justify-between text-left ${colorStyles.cardBg} ${colorStyles.border}`}
            >
              <div className="flex items-center space-x-3.5">
                <span className={`w-3.5 h-3.5 rounded-full ${colorStyles.dot} flex-shrink-0`} />
                <div>
                  <div className="text-lg sm:text-xl font-black text-brand-charcoal leading-tight">
                    Nhà cung cấp {s.name}
                  </div>
                  <div className="flex items-center space-x-2 text-xs sm:text-sm text-stone-500 mt-1">
                    <span className="inline-flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1 text-stone-400" />
                      {s.itemCount} mã bình
                    </span>
                    <span>•</span>
                    <span>Ngày {s.lastUpdated}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-1 pl-2">
                <span className={`text-xs sm:text-sm font-bold px-2.5 py-1 rounded-full ${colorStyles.badgeBg}`}>
                  Xem giá
                </span>
                <ChevronRight className="w-5 h-5 text-stone-400" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
