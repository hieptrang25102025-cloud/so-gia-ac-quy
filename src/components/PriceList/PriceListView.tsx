import React, { useState, useMemo } from 'react';
import { SupplierId, Supplier, PriceItem } from '../../types';
import { SupplierTabs } from './SupplierTabs';
import { PriceCard } from './PriceCard';
import { PriceDetailModal } from './PriceDetailModal';
import { Search, X, Calendar, RefreshCw, Layers } from 'lucide-react';
import { normalizeSearch } from '../../utils/formatters';

interface Props {
  activeSupplier: SupplierId;
  suppliers: Record<SupplierId, Supplier>;
  prices: Record<SupplierId, PriceItem[]>;
  onSelectSupplier: (id: SupplierId) => void;
  onOpenUpload: () => void;
  onNavigateCompare: (batteryName: string) => void;
  isSeniorMode: boolean;
}

export const PriceListView: React.FC<Props> = ({
  activeSupplier,
  suppliers,
  prices,
  onSelectSupplier,
  onOpenUpload,
  onNavigateCompare,
  isSeniorMode,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState<PriceItem | null>(null);

  const currentSupplier = suppliers[activeSupplier];
  const currentPrices = prices[activeSupplier] || [];

  // Filter prices by search term
  const filteredPrices = useMemo(() => {
    if (!searchTerm.trim()) return currentPrices;
    const term = normalizeSearch(searchTerm);
    return currentPrices.filter(item => normalizeSearch(item.batteryName).includes(term));
  }, [currentPrices, searchTerm]);

  // Quick filter chips for easy 1-touch search
  const quickFilters = ['Tất cả', 'N100', 'N50', 'NS70', 'N25', 'N30', 'DIN'];

  return (
    <div className="w-full pb-28 space-y-4">
      {/* 3 Supplier Selector Tabs */}
      <SupplierTabs
        activeSupplier={activeSupplier}
        suppliers={suppliers}
        onSelectSupplier={onSelectSupplier}
      />

      {/* Subheader with Update Date and Total Count */}
      <div className="flex items-center justify-between px-2 text-xs sm:text-sm font-semibold text-brand-charcoal/70 bg-white/70 py-2 px-3 rounded-xl border border-brand-border/40">
        <div className="flex items-center space-x-1.5 text-stone-600">
          <Calendar className="w-4 h-4 text-brand-ruby" />
          <span>Cập nhật: <strong className="text-brand-dark">{currentSupplier?.lastUpdated || 'Chưa rõ'}</strong></span>
        </div>
        <div className="flex items-center space-x-1 text-stone-500">
          <Layers className="w-4 h-4" />
          <span>{filteredPrices.length} / {currentPrices.length} bình</span>
        </div>
      </div>

      {/* Search Input matching Screenshot */}
      <div className="relative w-full">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-stone-400 stroke-[2.2]" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Tìm tên bình... (Ví dụ: N100, N50)"
          className={`w-full bg-white border border-brand-border/70 rounded-full pl-11 pr-11 py-3 text-brand-charcoal placeholder-stone-400 font-medium focus:outline-hidden focus:ring-2 focus:ring-brand-ruby/30 focus:border-brand-ruby shadow-xs transition-all ${
            isSeniorMode ? 'text-lg py-3.5' : 'text-base'
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

      {/* Quick Filter Chips (helps seniors tap without typing!) */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1 pt-0.5 no-scrollbar">
        {quickFilters.map(filter => {
          const isSelected = filter === 'Tất cả' ? searchTerm === '' : searchTerm.toLowerCase() === filter.toLowerCase();
          return (
            <button
              key={filter}
              onClick={() => setSearchTerm(filter === 'Tất cả' ? '' : filter)}
              className={`px-3 py-1.5 rounded-full text-xs sm:text-sm font-bold whitespace-nowrap transition-all active:scale-95 ${
                isSelected
                  ? 'bg-brand-ruby text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-brand-border/50 hover:bg-rose-50'
              }`}
            >
              {filter}
            </button>
          );
        })}
      </div>

      {/* List of Battery Cards */}
      <div className="space-y-2.5">
        {filteredPrices.length > 0 ? (
          filteredPrices.map(item => (
            <PriceCard
              key={item.id}
              item={item}
              isSeniorMode={isSeniorMode}
              onCardClick={(clicked) => setSelectedItem(clicked)}
            />
          ))
        ) : currentPrices.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300 space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-brand-ruby mx-auto flex items-center justify-center font-bold text-xl">
              0
            </div>
            <p className="text-base text-brand-charcoal font-bold">
              Chưa có bảng giá cho nhà {currentSupplier?.name || ''}
            </p>
            <p className="text-xs text-stone-500 max-w-xs mx-auto">
              Bấm nút "Cập nhật báo giá mới" bên dưới để tải ảnh báo giá Zalo và AI sẽ tự động bóc tách.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300">
            <p className="text-base text-stone-500 font-medium">
              Không tìm thấy bình nào khớp với từ khóa "{searchTerm}".
            </p>
            <button
              onClick={() => setSearchTerm('')}
              className="mt-3 px-4 py-2 rounded-full bg-rose-50 text-brand-ruby font-bold text-sm"
            >
              Xóa tìm kiếm
            </button>
          </div>
        )}
      </div>

      {/* Floating or Bottom "Cập nhật" Red Button matching Mockup #3 */}
      <div className="fixed bottom-20 left-0 right-0 max-w-md mx-auto px-4 z-30 pointer-events-none">
        <button
          onClick={onOpenUpload}
          className="w-full pointer-events-auto h-13 rounded-full bg-gradient-to-r from-brand-dark via-brand-ruby to-rose-600 hover:from-brand-ruby hover:to-red-700 active:scale-98 text-white font-black text-lg shadow-button flex items-center justify-center space-x-2 border border-rose-300/40 transition-all"
        >
          <RefreshCw className="w-5 h-5 stroke-[2.5]" />
          <span>Cập nhật báo giá mới</span>
        </button>
      </div>

      {/* Price Detail & Read Aloud Modal */}
      <PriceDetailModal
        item={selectedItem}
        supplier={currentSupplier}
        onClose={() => setSelectedItem(null)}
        onCompare={onNavigateCompare}
      />
    </div>
  );
};
