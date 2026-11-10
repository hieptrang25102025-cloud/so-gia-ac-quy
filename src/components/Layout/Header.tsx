import React from 'react';
import { ArrowLeft, Settings } from 'lucide-react';
import { UserRole, ActiveTab } from '../../types';

interface HeaderProps {
  currentTab: ActiveTab;
  title?: string;
  subtitle?: string;
  onBack?: () => void;
  onOpenSettings: () => void;
  role: UserRole;
  onToggleRole: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  title,
  subtitle,
  onBack,
  onOpenSettings,
  role,
  onToggleRole,
}) => {
  return (
    <header className="relative w-full bg-gradient-to-b from-brand-dark via-brand-dark to-brand-ruby text-white pt-3 pb-5 px-4 shadow-md rounded-b-[28px] overflow-hidden">
      {/* Decorative ambient background wave/light */}
      <div className="absolute -top-10 -right-10 w-44 h-44 bg-red-400/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 h-3 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />

      {/* Top Action Row */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          {onBack ? (
            <button
              onClick={onBack}
              aria-label="Quay lại"
              className="w-10 h-10 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-transform active:scale-95"
            >
              <ArrowLeft className="w-6 h-6 text-white stroke-[2.5]" />
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide uppercase">Sổ Giá Điện Tử</span>
            </div>
          )}
        </div>

        {/* Right actions: Role indicator & Settings Gear */}
        <div className="flex items-center space-x-2">
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-white/15 backdrop-blur-sm text-xs font-bold text-white hover:bg-white/25 active:scale-95 transition-all"
            title="Nhấn để xem cài đặt và tài khoản"
          >
            <span>{role === 'admin' ? '🛡 Quản trị' : '👁 Người xem'}</span>
          </button>

          <button
            onClick={onOpenSettings}
            aria-label="Cài đặt hệ thống"
            className="w-9 h-9 rounded-full bg-white/15 active:bg-white/30 flex items-center justify-center transition-transform active:scale-95"
          >
            <Settings className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      {/* Main Title Section */}
      <div className="text-center pt-1 pb-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight drop-shadow-sm font-sans">
          {title || 'SỔ GIÁ ẮC QUY'}
        </h1>
        <p className="text-sm sm:text-base text-rose-100/90 font-medium mt-0.5">
          {subtitle || 'Nhanh chóng • Chính xác • Dễ sử dụng'}
        </p>
      </div>
    </header>
  );
};
