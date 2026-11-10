import React, { useState, useMemo } from 'react';
import { SupplierId, Supplier, PriceItem } from '../../types';
import { Search, X, Award, Lightbulb, Calendar, ArrowRight } from 'lucide-react';
import { normalizeSearch, formatVND } from '../../utils/formatters';

interface Props {
  suppliers: Record<SupplierId, Supplier>;
  prices: Record<SupplierId, PriceItem[]>;
  initialSearch?: string;
  isSeniorMode: boolean;
}

interface BatteryComparisonResult {
  batteryName: string;
  quotes: {
    supplierId: SupplierId;
    supplierName: string;
    price: number | null;
    formattedPrice: string;
    updatedAt: string;
    color: string;
  }[];
  bestSupplierId: SupplierId | null;
  bestPrice: number | null;
  maxSavings: number;
}

export const CompareView: React.FC<Props> = ({
  suppliers,
  prices,
  initialSearch = 'N100',
  isSeniorMode,
}) => {
  const [searchTerm, setSearchTerm] = useState(initialSearch);

  // Popular quick pick chips for quick comparison
  const quickPicks = ['N100', 'N50', 'NS70', 'N25', 'N30', 'N32', 'NS40 R/L', 'N120', 'N150', 'N200', 'DIN 60'];

  // Aggregate all unique battery names across all 3 suppliers
  const allUniqueBatteries = useMemo(() => {
    const map = new Map<string, string>(); // normalized -> original display name
    (['nguyen', 'ngoc', 'nhung'] as SupplierId[]).forEach(supId => {
      (prices[supId] || []).forEach(p => {
        const norm = normalizeSearch(p.batteryName);
        if (!map.has(norm)) {
          map.set(norm, p.batteryName);
        }
      });
    });
    return Array.from(map.entries()).map(([norm, name]) => ({ norm, name }));
  }, [prices]);

  // Compute comparison for matching items
  const matchedComparisons: BatteryComparisonResult[] = useMemo(() => {
    const term = normalizeSearch(searchTerm);
    if (!term) return [];

    const matched = allUniqueBatteries.filter(b => b.norm.includes(term));

    return matched.slice(0, 8).map(b => {
      const supKeys: SupplierId[] = ['nguyen', 'ngoc', 'nhung'];
      let bestPrice: number | null = null;
      let highestPrice: number | null = null;
      let bestSupplierId: SupplierId | null = null;

      const quotes = supKeys.map(supId => {
        const sup = suppliers[supId];
        const item = (prices[supId] || []).find(p => normalizeSearch(p.batteryName) === b.norm);
        
        const price = item ? item.unitPrice : null;

        if (price !== null) {
          if (bestPrice === null || price < bestPrice) {
            bestPrice = price;
            bestSupplierId = supId;
          }
          if (highestPrice === null || price > highestPrice) {
            highestPrice = price;
          }
        }

        return {
          supplierId: supId,
          supplierName: sup?.name || supId,
          price,
          formattedPrice: price !== null ? formatVND(price) : 'Chưa có dữ liệu',
          updatedAt: item?.updatedAt || sup?.lastUpdated || 'Chưa cập nhật',
          color: sup?.color || '#C93642'
        };
      });

      const maxSavings = (highestPrice !== null && bestPrice !== null && highestPrice > bestPrice)
        ? (highestPrice - bestPrice)
        : 0;

      return {
        batteryName: b.name,
        quotes,
        bestSupplierId,
        bestPrice,
        maxSavings
      };
    });
  }, [searchTerm, allUniqueBatteries, prices, suppliers]);

  return (
    <div className="w-full pb-28 space-y-4">
      {/* Search Input matching Mockup #4 */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-stone-400 stroke-[2.2]" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên bình cần so sánh... (ví dụ: N100)"
          className={`w-full bg-white border border-brand-border/70 rounded-full pl-11 pr-11 py-3.5 text-brand-charcoal placeholder-stone-400 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-ruby/30 focus:border-brand-ruby shadow-xs transition-all ${
            isSeniorMode ? 'text-lg' : 'text-base'
          }`}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-stone-400 hover:text-stone-600"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Pick Chips */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {quickPicks.map(chip => (
          <button
            key={chip}
            onClick={() => setSearchTerm(chip)}
            className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
              searchTerm.toLowerCase() === chip.toLowerCase()
                ? 'bg-brand-ruby text-white shadow-xs'
                : 'bg-white text-stone-600 border border-brand-border/50 hover:bg-rose-50'
            }`}
          >
            {chip}
          </button>
        ))}
      </div>

      {/* Comparisons Result Cards */}
      <div className="space-y-4">
        {matchedComparisons.length > 0 ? (
          matchedComparisons.map((comp, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 shadow-card border border-brand-border/40 space-y-4"
            >
              {/* Battery Title */}
              <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                <h3 className="text-2xl sm:text-3xl font-black text-brand-charcoal tracking-tight">
                  {comp.batteryName}
                </h3>
                {comp.maxSavings > 0 && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Award className="w-3.5 h-3.5 mr-1" />
                    Tiết kiệm {formatVND(comp.maxSavings)} đ
                  </span>
                )}
              </div>

              {/* 3 Supplier Price Columns matching Mockup #4 */}
              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {comp.quotes.map(q => {
                  const isBest = comp.bestSupplierId === q.supplierId && q.price !== null;

                  const pillColors = {
                    nguyen: 'bg-red-600 text-white',
                    ngoc: 'bg-amber-500 text-white',
                    nhung: 'bg-purple-600 text-white',
                  }[q.supplierId];

                  return (
                    <div
                      key={q.supplierId}
                      className={`relative rounded-2xl p-2.5 sm:p-3 text-center flex flex-col items-center justify-between transition-all ${
                        isBest
                          ? 'bg-rose-50/80 border-2 border-brand-ruby shadow-xs'
                          : 'bg-stone-50 border border-stone-200/80'
                      }`}
                    >
                      {/* Supplier Badge Pill */}
                      <span className={`w-full py-1 px-1 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider ${pillColors}`}>
                        {q.supplierName}
                      </span>

                      {/* Price Display */}
                      <div className="my-2.5">
                        {q.price !== null ? (
                          <div
                            className={`font-black tracking-tight leading-none ${
                              isBest ? 'text-brand-dark text-lg sm:text-xl' : 'text-stone-700 text-base sm:text-lg'
                            }`}
                          >
                            {q.formattedPrice}
                          </div>
                        ) : (
                          <span className="text-xs text-stone-400 italic">
                            Chưa có dữ liệu
                          </span>
                        )}
                      </div>

                      {/* Best Badge or Date */}
                      <div className="text-[11px] text-stone-400">
                        {isBest ? (
                          <span className="font-extrabold text-brand-ruby">★ Tốt nhất</span>
                        ) : (
                          <span>{q.updatedAt.split(' - ')[0]}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Notice Tip Box matching Mockup #4 */}
              <div className="flex items-center space-x-2 p-3 rounded-2xl bg-amber-50/90 border border-amber-200/80 text-amber-900 text-xs sm:text-sm font-semibold">
                <Lightbulb className="w-4 h-4 text-amber-600 flex-shrink-0" />
                <span>Giá có thể thay đổi theo thời điểm. Hãy kiểm tra ngày cập nhật của từng nhà.</span>
              </div>
            </div>
          ))
        ) : allUniqueBatteries.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300 space-y-2">
            <p className="text-base text-brand-charcoal font-bold">
              Chưa có dữ liệu báo giá nào để so sánh
            </p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Vui lòng tải ảnh báo giá của các nhà cung cấp tại Trang chủ. Khi có dữ liệu, bạn có thể so sánh giá cả 3 nhà song song tại đây.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300">
            <p className="text-base text-stone-600 font-semibold">
              Chưa tìm thấy bình "{searchTerm}"
            </p>
            <p className="text-xs text-stone-400 mt-1">
              Hãy chọn một trong các mã bình phổ biến phía trên (ví dụ N100, N50, NS70).
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
