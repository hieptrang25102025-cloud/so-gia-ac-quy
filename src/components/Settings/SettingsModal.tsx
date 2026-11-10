import React, { useState } from 'react';
import { UserRole } from '../../types';
import { storage } from '../../services/storage';
import { authService, UserProfile } from '../../services/auth';
import { getSupabaseConfig, updateSupabaseConfig, isSupabaseConfigured, getSupabase } from '../../services/supabaseClient';
import { 
  X, BookOpen, Shield, Key, Download, Upload, RotateCcw, 
  Type, Check, Database, LogIn, LogOut, User, RefreshCw, AlertCircle 
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  role: UserRole;
  onChangeRole: (role: UserRole) => void;
  isSeniorMode: boolean;
  onToggleSeniorMode: (val: boolean) => void;
  onDataReset: () => void;
}

export const SettingsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenAuth,
  onLogout,
  role,
  onChangeRole,
  isSeniorMode,
  onToggleSeniorMode,
  onDataReset,
}) => {
  const [supabaseConfig, setSupabaseConfig] = useState(() => getSupabaseConfig());
  const [supabaseSaved, setSupabaseSaved] = useState(false);
  const [supabaseTesting, setSupabaseTesting] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSaveSupabase = async () => {
    updateSupabaseConfig(supabaseConfig.url, supabaseConfig.anonKey);
    setSupabaseSaved(true);
    setSupabaseTesting(true);
    setSupabaseStatus(null);

    const client = getSupabase();
    if (client) {
      try {
        const { error } = await client.from('suppliers').select('id').limit(1);
        if (error) {
          setSupabaseStatus(`Kết nối thất bại: ${error.message}`);
        } else {
          setSupabaseStatus('Kết nối Supabase thành công 100%!');
        }
      } catch (err: any) {
        setSupabaseStatus(`Lỗi kiểm tra: ${err.message}`);
      }
    } else {
      setSupabaseStatus('Vui lòng kiểm tra lại URL và Anon Key.');
    }
    setSupabaseTesting(false);
    setTimeout(() => setSupabaseSaved(false), 3000);
  };

  // Export JSON backup
  const handleExportBackup = () => {
    const json = storage.exportData();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sogiacquy-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Import JSON backup
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target?.result as string;
        if (text && storage.importData(text)) {
          alert('Khôi phục dữ liệu thành công!');
          onDataReset();
          onClose();
        } else {
          alert('File dữ liệu không hợp lệ!');
        }
      };
      reader.readAsText(file);
    }
  };

  const handleFactoryReset = () => {
    if (confirm('Bạn có chắc chắn muốn đặt lại dữ liệu về ban đầu không?')) {
      storage.resetToDefault();
      onDataReset();
      alert('Đã khôi phục dữ liệu gốc!');
      onClose();
    }
  };

  const isConnected = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-md max-h-[90vh] bg-white rounded-3xl p-6 shadow-2xl flex flex-col border border-brand-border/40 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-brand-ruby" />
            <h2 className="text-xl font-black text-brand-charcoal">Cài đặt hệ thống</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center active:scale-90"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-5">
          
          {/* 1. Account & Role Card */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Tài khoản & Phân quyền
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                role === 'admin' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
              }`}>
                {role === 'admin' ? 'Quản trị viên (ADMIN)' : 'Người xem (VIEWER)'}
              </span>
            </div>

            {currentUser ? (
              <div className="space-y-2.5">
                <div className="flex items-center space-x-2 text-sm text-stone-800">
                  <User className="w-4 h-4 text-stone-500" />
                  <span className="font-semibold">{currentUser.fullName || currentUser.email}</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <span className="text-xs text-stone-500">{currentUser.email}</span>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="px-3 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 text-xs font-bold flex items-center space-x-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Đăng xuất</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between pt-1">
                <span className="text-xs text-stone-500">Đang truy cập ẩn danh (Viewer)</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-brand-dark to-brand-ruby text-white text-xs font-bold flex items-center space-x-1.5 shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Đăng nhập</span>
                </button>
              </div>
            )}
          </div>

          {/* 2. Text Size Boost Settings */}
          <div className="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <Type className="w-5 h-5 text-brand-ruby" />
                <div>
                  <div className="font-bold text-sm text-brand-charcoal">Cỡ chữ lớn dễ đọc</div>
                  <div className="text-xs text-stone-500">Tăng kích cỡ tên bình và đơn giá để xem rõ ràng</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isSeniorMode}
                onChange={(e) => onToggleSeniorMode(e.target.checked)}
                className="w-5 h-5 accent-brand-ruby rounded cursor-pointer"
              />
            </div>
          </div>

          {/* 3. Supabase Cloud Sync Configuration */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-400">
                Đồng bộ Supabase Cloud
              </label>
              <span className={`text-[11px] font-bold ${isConnected ? 'text-emerald-600' : 'text-stone-400'}`}>
                {isConnected ? '✓ Đã cấu hình' : 'Chưa cấu hình'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div>
                <span className="block text-[11px] font-semibold text-stone-500 mb-1">Supabase Project URL:</span>
                <input
                  type="text"
                  value={supabaseConfig.url}
                  onChange={(e) => setSupabaseConfig(prev => ({ ...prev, url: e.target.value }))}
                  placeholder="https://xxxxx.supabase.co"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-700 focus:bg-white focus:outline-hidden focus:border-brand-ruby"
                />
              </div>

              <div>
                <span className="block text-[11px] font-semibold text-stone-500 mb-1">Supabase Anon Key:</span>
                <input
                  type="password"
                  value={supabaseConfig.anonKey}
                  onChange={(e) => setSupabaseConfig(prev => ({ ...prev, anonKey: e.target.value }))}
                  placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl px-3 py-2 text-xs font-mono text-stone-700 focus:bg-white focus:outline-hidden focus:border-brand-ruby"
                />
              </div>

              {supabaseStatus && (
                <div className={`p-2.5 rounded-xl text-xs flex items-center space-x-1.5 ${
                  supabaseStatus.includes('thành công') ? 'bg-emerald-50 text-emerald-800' : 'bg-red-50 text-red-800'
                }`}>
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{supabaseStatus}</span>
                </div>
              )}

              <button
                type="button"
                onClick={handleSaveSupabase}
                disabled={supabaseTesting}
                className="w-full py-2 px-3 rounded-xl bg-stone-800 hover:bg-stone-900 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-1.5"
              >
                {supabaseTesting ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kiểm tra kết nối...</span>
                  </>
                ) : (
                  <>
                    {supabaseSaved ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Database className="w-3.5 h-3.5" />}
                    <span>{supabaseSaved ? 'Đã lưu cấu hình' : 'Lưu và kiểm tra kết nối'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* 4. Data Backup & Reset */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-400 mb-2">
              Sao lưu và dữ liệu
            </label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-brand-charcoal text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-colors"
              >
                <Download className="w-4 h-4 text-stone-600" />
                <span>Tải file sao lưu dữ liệu (.JSON)</span>
              </button>

              <label className="w-full py-2.5 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-brand-charcoal text-xs sm:text-sm font-bold flex items-center justify-center space-x-2 transition-colors cursor-pointer">
                <Upload className="w-4 h-4 text-stone-600" />
                <span>Khôi phục dữ liệu từ file backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>

              <button
                type="button"
                onClick={handleFactoryReset}
                className="w-full py-2 px-3 rounded-xl text-red-600 hover:bg-red-50 text-xs font-semibold flex items-center justify-center space-x-1 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Đặt lại về dữ liệu ban đầu</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-stone-100 text-center">
          <p className="text-xs text-stone-400">
            SỔ GIÁ ẮC QUY • Bản Production Trực Tuyến
          </p>
        </div>
      </div>
    </div>
  );
};
