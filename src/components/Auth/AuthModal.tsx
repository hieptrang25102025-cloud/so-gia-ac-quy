import React, { useState } from 'react';
import { authService, UserProfile } from '../../services/auth';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { UserRole } from '../../types';
import { X, Lock, Mail, User, Shield, Eye, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (profile: UserProfile) => void;
  initialMode?: 'signin' | 'signup';
}

export const AuthModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialMode = 'signin',
}) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('viewer');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!email || !password) {
      setErrorMsg('Vui lòng nhập đầy đủ Email và Mật khẩu.');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Mật khẩu cần có ít nhất 6 ký tự.');
      return;
    }

    setIsLoading(true);

    if (isSignUp) {
      // Sign up / Create account
      const res = await authService.signUp(email, password, selectedRole, fullName);
      setIsLoading(false);

      if (res.success) {
        setSuccessMsg('Tạo tài khoản thành công! Bạn có thể đăng nhập ngay.');
        setTimeout(() => {
          setIsSignUp(false);
          setSuccessMsg(null);
        }, 1800);
      } else {
        setErrorMsg(res.error || 'Không thể tạo tài khoản.');
      }
    } else {
      // Sign in
      const res = await authService.signIn(email, password);
      setIsLoading(false);

      if (res.success && res.profile) {
        onLoginSuccess(res.profile);
        onClose();
      } else {
        setErrorMsg(res.error || 'Email hoặc mật khẩu không chính xác.');
      }
    }
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl flex flex-col border border-brand-border/40 overflow-hidden animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-brand-ruby" />
            <h2 className="text-xl font-black text-brand-charcoal">
              {isSignUp ? 'Tạo tài khoản mới' : 'Đăng nhập hệ thống'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-stone-100 hover:bg-stone-200 text-stone-600 flex items-center justify-center active:scale-90"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Supabase Status Banner */}
        {!configured && (
          <div className="mt-3 p-3 bg-amber-50 rounded-2xl border border-amber-200 flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-800">
              <span className="font-bold">Chưa kết nối Supabase Cloud:</span> Ứng dụng hiện đang dùng phân quyền quản lý nội bộ. Bạn có thể thiết lập Supabase URL trong mục Cài đặt.
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1">
                Họ và tên
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Ví dụ: Nguyễn Văn A"
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-800 focus:bg-white focus:outline-hidden focus:border-brand-ruby"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Email đăng nhập <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@email.com"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-800 focus:bg-white focus:outline-hidden focus:border-brand-ruby"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-600 mb-1">
              Mật khẩu <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="w-full bg-stone-50 border border-stone-200 rounded-xl pl-10 pr-3.5 py-2.5 text-sm text-stone-800 focus:bg-white focus:outline-hidden focus:border-brand-ruby"
              />
            </div>
          </div>

          {isSignUp && (
            <div>
              <label className="block text-xs font-bold text-stone-600 mb-1.5">
                Vai trò truy cập
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('viewer')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'viewer'
                      ? 'bg-rose-50 border-brand-ruby text-brand-dark font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 font-medium'
                  }`}
                >
                  <Eye className="w-4 h-4 mx-auto mb-1 text-stone-500" />
                  <div className="text-xs">Người xem (Viewer)</div>
                  <div className="text-[10px] text-stone-400">Xem và so sánh giá</div>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    selectedRole === 'admin'
                      ? 'bg-stone-900 border-stone-900 text-white font-bold'
                      : 'bg-stone-50 border-stone-200 text-stone-600 font-medium'
                  }`}
                >
                  <Shield className="w-4 h-4 mx-auto mb-1 text-amber-400" />
                  <div className="text-xs">Quản trị (Admin)</div>
                  <div className={`text-[10px] ${selectedRole === 'admin' ? 'text-stone-300' : 'text-stone-400'}`}>Tải ảnh & bóc tách AI</div>
                </button>
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 rounded-xl border border-red-200 flex items-center space-x-2 text-xs text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center space-x-2 text-xs text-emerald-700">
              <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-brand-dark to-brand-ruby text-white font-bold text-sm shadow-md hover:opacity-95 active:scale-98 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <span>{isSignUp ? 'Đăng ký tài khoản' : 'Đăng nhập ngay'}</span>
            )}
          </button>
        </form>

        {/* Toggle sign in / sign up */}
        <div className="mt-4 pt-3 border-t border-stone-100 text-center">
          <button
            type="button"
            onClick={() => {
              setIsSignUp(!isSignUp);
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className="text-xs font-bold text-brand-ruby hover:underline"
          >
            {isSignUp
              ? 'Đã có tài khoản? Nhấn vào đây để Đăng nhập'
              : 'Chưa có tài khoản? Đăng ký tài khoản mới'}
          </button>
        </div>
      </div>
    </div>
  );
};
