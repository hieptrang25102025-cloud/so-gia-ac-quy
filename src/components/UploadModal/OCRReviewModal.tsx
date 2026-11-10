import React, { useState } from 'react';
import { OCRCandidate, SupplierId, Supplier } from '../../types';
import { 
  X, AlertTriangle, CheckCircle2, Trash2, Plus, 
  ZoomIn, ZoomOut, RotateCcw, Eye, Sparkles, Check, 
  Layers, ShieldCheck, Filter
} from 'lucide-react';
import { formatVND, parsePrice } from '../../utils/formatters';

interface Props {
  isOpen: boolean;
  supplierId: SupplierId;
  supplier: Supplier;
  initialCandidates: OCRCandidate[];
  images: { file: File; base64: string }[];
  sourceType: string;
  onCancel: () => void;
  onConfirm: (confirmedItems: { batteryName: string; unitPrice: number }[], notes?: string) => void;
}

export const OCRReviewModal: React.FC<Props> = ({
  isOpen,
  supplierId,
  supplier,
  initialCandidates,
  images,
  sourceType,
  onCancel,
  onConfirm,
}) => {
  const [candidates, setCandidates] = useState<OCRCandidate[]>(initialCandidates);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showOriginalImage, setShowOriginalImage] = useState(true); // Default open to verify 100%
  const [imageZoom, setImageZoom] = useState(1);
  const [filterPage, setFilterPage] = useState<number | 'all'>('all');
  const [customNote, setCustomNote] = useState('');

  if (!isOpen) return null;

  // Handle in-place edit of battery name
  const handleNameChange = (id: string, newName: string) => {
    setCandidates(prev =>
      prev.map(c => c.id === id ? { ...c, batteryName: newName } : c)
    );
  };

  // Handle in-place edit of unit price
  const handlePriceChange = (id: string, rawInput: string) => {
    const numeric = parsePrice(rawInput);
    setCandidates(prev =>
      prev.map(c =>
        c.id === id
          ? {
              ...c,
              unitPrice: numeric,
              formattedPrice: formatVND(numeric),
              isSuspicious: numeric < 300000 || numeric > 8000000,
            }
          : c
      )
    );
  };

  // Delete row
  const handleDeleteRow = (id: string) => {
    setCandidates(prev => prev.filter(c => c.id !== id));
  };

  // Add a new row manually
  const handleAddRow = () => {
    const newItem: OCRCandidate = {
      id: `manual-${Date.now()}`,
      batteryName: '',
      unitPrice: 1000000,
      formattedPrice: formatVND(1000000),
      confidence: 'high',
      isSuspicious: false,
      pageNumber: activeImageIndex + 1,
      notes: 'Thêm thủ công'
    };
    setCandidates(prev => [newItem, ...prev]);
  };

  // Filter items by selected page
  const displayedCandidates = filterPage === 'all'
    ? candidates
    : candidates.filter(c => (c.pageNumber || 1) === filterPage);

  // Confirm validation
  const handleConfirm = () => {
    const valid = candidates
      .filter(c => c.batteryName.trim().length > 0 && c.unitPrice > 0)
      .map(c => ({
        batteryName: c.batteryName.trim(),
        unitPrice: c.unitPrice
      }));

    if (valid.length === 0) {
      alert('Vui lòng giữ lại ít nhất 1 dòng sản phẩm hợp lệ có tên và đơn giá!');
      return;
    }

    onConfirm(valid, customNote || undefined);
  };

  const suspiciousCount = candidates.filter(c => c.isSuspicious || c.confidence === 'low').length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-lg max-h-[95vh] bg-white rounded-3xl shadow-2xl flex flex-col border border-brand-border/40 overflow-hidden animate-scaleUp">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-brand-dark via-brand-ruby to-rose-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-bold mb-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Bóc tách từ {images.length} trang ảnh</span>
              <span>•</span>
              <span>Nhà {supplier.name}</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black">
              Kiểm tra kết quả ({candidates.length} mã)
            </h2>
            <p className="text-xs text-rose-100">
              Đối chiếu số liệu với ảnh gốc để đảm bảo độ chính xác 100%
            </p>
          </div>

          <button
            onClick={onCancel}
            aria-label="Đóng"
            className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center active:scale-90"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* 100% Accuracy & Multi-Page View Ribbon */}
        <div className="bg-emerald-50 border-b border-emerald-200 px-4 py-2 flex items-center justify-between text-xs text-emerald-900 font-semibold">
          <div className="flex items-center space-x-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Đã đọc trọn vẹn {candidates.length} mã từ {images.length} trang ảnh</span>
          </div>
          <button
            type="button"
            onClick={() => setShowOriginalImage(!showOriginalImage)}
            className="text-brand-ruby font-bold hover:underline flex items-center space-x-1"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>{showOriginalImage ? 'Thu gọn ảnh' : 'Xem ảnh gốc'}</span>
          </button>
        </div>

        {/* Collapsible High-Resolution Multi-Page Image Viewer with Zoom Controls */}
        {showOriginalImage && images.length > 0 && (
          <div className="bg-stone-900 border-b border-stone-700 p-2 text-white">
            {/* Page selection bar + zoom controls */}
            <div className="flex items-center justify-between pb-2 px-1 text-xs">
              <div className="flex items-center space-x-1">
                <span className="text-stone-400 font-medium">Trang:</span>
                {images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActiveImageIndex(i);
                      setImageZoom(1);
                    }}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-all ${
                      activeImageIndex === i
                        ? 'bg-brand-ruby text-white shadow-xs'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    Trang {i + 1}
                  </button>
                ))}
              </div>

              {/* Zoom buttons */}
              <div className="flex items-center space-x-1">
                <button
                  type="button"
                  onClick={() => setImageZoom(z => Math.max(0.8, z - 0.2))}
                  title="Thu nhỏ"
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] text-stone-400 w-8 text-center">{Math.round(imageZoom * 100)}%</span>
                <button
                  type="button"
                  onClick={() => setImageZoom(z => Math.min(2.5, z + 0.2))}
                  title="Phóng to"
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setImageZoom(1)}
                  title="Đặt lại"
                  className="p-1 rounded bg-stone-800 hover:bg-stone-700 text-stone-300 ml-1"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable image box */}
            <div className="max-h-44 overflow-auto rounded-xl bg-black/60 flex items-center justify-center p-2 border border-stone-800">
              <img
                src={images[activeImageIndex].base64}
                alt={`Ảnh báo giá trang ${activeImageIndex + 1}`}
                style={{ transform: `scale(${imageZoom})`, transformOrigin: 'top center', transition: 'transform 0.15s ease-out' }}
                className="max-h-36 object-contain rounded"
              />
            </div>
          </div>
        )}

        {/* Filter per page & Add row strip */}
        <div className="p-3 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between text-xs sm:text-sm">
          {images.length > 1 ? (
            <div className="flex items-center space-x-1 overflow-x-auto no-scrollbar">
              <button
                type="button"
                onClick={() => setFilterPage('all')}
                className={`px-2.5 py-1 rounded-lg font-bold text-xs ${
                  filterPage === 'all'
                    ? 'bg-stone-800 text-white'
                    : 'bg-white text-stone-600 border border-stone-200'
                }`}
              >
                Tất cả ({candidates.length})
              </button>
              {images.map((_, i) => {
                const count = candidates.filter(c => (c.pageNumber || 1) === i + 1).length;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setFilterPage(i + 1)}
                    className={`px-2.5 py-1 rounded-lg font-bold text-xs whitespace-nowrap ${
                      filterPage === i + 1
                        ? 'bg-brand-ruby text-white'
                        : 'bg-white text-stone-600 border border-stone-200'
                    }`}
                  >
                    Trang {i + 1} ({count})
                  </button>
                );
              })}
            </div>
          ) : (
            <span className="text-xs text-stone-500 font-semibold">
              Tổng cộng: {candidates.length} mã sản phẩm
            </span>
          )}

          <button
            type="button"
            onClick={handleAddRow}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-white text-emerald-700 border border-emerald-300 hover:bg-emerald-50 font-bold transition-all text-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm dòng</span>
          </button>
        </div>

        {/* Suspicious warning banner if any */}
        {suspiciousCount > 0 && (
          <div className="mx-4 mt-3 p-2.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center space-x-2 text-xs font-semibold text-amber-900">
            <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>
              Có {suspiciousCount} dòng cần rà soát lại (viền vàng). Vui lòng đối chiếu với ảnh gốc.
            </span>
          </div>
        )}

        {/* Candidate List (Editable Cards with page number tag) */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5">
          {displayedCandidates.map((item, idx) => {
            const isAlert = item.isSuspicious || item.confidence === 'low';

            return (
              <div
                key={item.id}
                className={`p-3 rounded-2xl border transition-all ${
                  isAlert
                    ? 'bg-amber-50/60 border-amber-300 shadow-xs'
                    : 'bg-white border-stone-200 hover:border-stone-300 shadow-xs'
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  {/* Left: Battery Name Input + Page Tag */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <label className="text-[10px] font-bold uppercase text-stone-400">
                        Mã {idx + 1}
                      </label>
                      {images.length > 1 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 border border-stone-200">
                          Trang {item.pageNumber || 1}
                        </span>
                      )}
                    </div>
                    <input
                      type="text"
                      value={item.batteryName}
                      onChange={(e) => handleNameChange(item.id, e.target.value)}
                      placeholder="Tên bình (ví dụ: N100)"
                      className="w-full font-black text-brand-charcoal text-base bg-transparent border-b border-stone-200 focus:border-brand-ruby focus:outline-hidden py-0.5"
                    />
                  </div>

                  {/* Right: Unit Price Input */}
                  <div className="w-36 flex-shrink-0">
                    <label className="block text-[10px] font-bold uppercase text-stone-400 mb-0.5 text-right">
                      Đơn giá (đ)
                    </label>
                    <input
                      type="text"
                      value={item.formattedPrice}
                      onChange={(e) => handlePriceChange(item.id, e.target.value)}
                      placeholder="0"
                      className="w-full text-right font-black text-brand-dark text-base bg-rose-50 border border-rose-200 rounded-xl px-2.5 py-1 focus:ring-1 focus:ring-brand-ruby focus:outline-hidden"
                    />
                  </div>

                  {/* Delete Button */}
                  <button
                    type="button"
                    onClick={() => handleDeleteRow(item.id)}
                    className="p-2 text-stone-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors"
                    title="Xóa dòng này"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {isAlert && (
                  <div className="mt-1.5 flex items-center text-[11px] text-amber-700 font-medium">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    <span>{item.notes || 'Cần kiểm tra lại đơn giá'}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer with CANCEL & CONFIRM buttons */}
        <div className="p-4 bg-stone-50 border-t border-stone-200 flex items-center space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-3.5 px-4 rounded-2xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-bold text-base transition-all active:scale-98"
          >
            HỦY BỎ
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            className="flex-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brand-dark via-brand-ruby to-rose-600 hover:from-brand-ruby hover:to-red-700 text-white font-black text-base shadow-button transition-all active:scale-98 flex items-center justify-center space-x-2"
          >
            <Check className="w-5 h-5 stroke-[2.5]" />
            <span>LƯU {candidates.length} MÃ VÀO SỔ</span>
          </button>
        </div>

      </div>
    </div>
  );
};
