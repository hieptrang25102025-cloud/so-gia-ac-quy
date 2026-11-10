import React, { useState } from 'react';
import { HistoryRecord } from '../../types';
import { ChevronRight, Calendar, Layers, X, Eye, FileText } from 'lucide-react';
import { formatVND } from '../../utils/formatters';

interface Props {
  history: HistoryRecord[];
  isSeniorMode: boolean;
}

export const HistoryView: React.FC<Props> = ({ history, isSeniorMode }) => {
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);

  return (
    <div className="w-full pb-28 space-y-4">
      {/* Intro info pill */}
      <div className="bg-white/80 p-3 rounded-2xl border border-brand-border/40 text-xs sm:text-sm text-stone-600 flex items-center justify-between">
        <span className="font-semibold">Lưu trữ toàn bộ các lần tải báo giá</span>
        <span className="text-brand-ruby font-bold">{history.length} lần cập nhật</span>
      </div>

      {/* Timeline items matching Mockup #5 */}
      {history.length > 0 ? (
        <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-rose-200">
          {history.map((rec) => {
            const supplierStyles = {
              nguyen: 'border-l-4 border-l-red-600',
              ngoc: 'border-l-4 border-l-amber-500',
              nhung: 'border-l-4 border-l-purple-600',
            }[rec.supplierId] || 'border-l-4 border-l-brand-ruby';

            return (
              <div key={rec.id} className="relative group">
                {/* Red Timeline Dot Marker */}
                <div className="absolute -left-6 top-5 w-4 h-4 rounded-full bg-brand-ruby border-2 border-white shadow-xs group-hover:scale-125 transition-transform" />

                {/* Card Container */}
                <div
                  onClick={() => setSelectedRecord(rec)}
                  className={`bg-white rounded-2xl p-4 shadow-card hover:shadow-card-hover border border-stone-200/80 transition-all cursor-pointer active:scale-98 flex items-center justify-between ${supplierStyles}`}
                >
                  <div className="space-y-1">
                    {/* Timestamp */}
                    <div className="flex items-center space-x-1.5 text-xs sm:text-sm text-stone-500 font-semibold">
                      <Calendar className="w-3.5 h-3.5 text-stone-400" />
                      <span>{rec.date}</span>
                    </div>

                    {/* Supplier Name */}
                    <div className="text-lg sm:text-xl font-black text-brand-charcoal">
                      Nhà cung cấp: <span className="text-brand-dark">{rec.supplierName}</span>
                    </div>

                    {/* Item count */}
                    <div className="flex items-center space-x-1 text-xs sm:text-sm text-stone-600 font-medium">
                      <Layers className="w-3.5 h-3.5 text-brand-ruby" />
                      <span>Cập nhật <strong>{rec.itemCount}</strong> mã bình</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 text-stone-400 pl-2">
                    <span className="text-xs font-bold text-brand-ruby hidden sm:inline">Chi tiết</span>
                    <ChevronRight className="w-5 h-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-dashed border-stone-300 space-y-2">
          <p className="text-base text-brand-charcoal font-bold">
            Chưa có lịch sử cập nhật báo giá
          </p>
          <p className="text-xs text-stone-500 max-w-xs mx-auto">
            Mỗi lần bạn tải ảnh báo giá mới và nhấn "Xác nhận cập nhật", hệ thống sẽ tự động lưu lại một bản chụp lịch sử tại đây.
          </p>
        </div>
      )}

      {/* History Detail Snapshot Modal */}
      {selectedRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md max-h-[85vh] bg-white rounded-3xl p-6 shadow-2xl flex flex-col border border-brand-border/40 animate-scaleUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <div>
                <span className="text-xs font-bold uppercase tracking-wide text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full">
                  Ảnh chụp lịch sử
                </span>
                <h3 className="text-xl font-black text-brand-charcoal mt-1">
                  Bảng giá: {selectedRecord.supplierName}
                </h3>
                <p className="text-xs text-stone-400">{selectedRecord.date}</p>
              </div>

              <button
                onClick={() => setSelectedRecord(null)}
                className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center active:scale-90"
              >
                <X className="w-5 h-5 stroke-[2.5]" />
              </button>
            </div>

            {/* Note if available */}
            {selectedRecord.note && (
              <div className="mt-3 p-2.5 rounded-xl bg-stone-50 text-xs text-stone-600 italic border border-stone-200/60">
                "{selectedRecord.note}"
              </div>
            )}

            {/* List of items in this snapshot */}
            <div className="flex-1 overflow-y-auto my-3 space-y-2 pr-1">
              <div className="text-xs font-bold uppercase text-stone-400 tracking-wider">
                Danh sách {selectedRecord.items.length} bình tại thời điểm này:
              </div>
              {selectedRecord.items.map((it, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-stone-50 border border-stone-200/60 flex items-center justify-between text-sm"
                >
                  <span className="font-bold text-brand-charcoal">{it.batteryName}</span>
                  <span className="font-black text-brand-dark px-2.5 py-0.5 rounded-full bg-rose-100 text-xs sm:text-sm">
                    {it.formattedPrice} đ
                  </span>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="pt-2 border-t border-stone-100 flex justify-end">
              <button
                onClick={() => setSelectedRecord(null)}
                className="w-full py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-brand-charcoal font-bold text-sm"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
