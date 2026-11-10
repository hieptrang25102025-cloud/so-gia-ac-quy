import React, { useState, useEffect } from 'react';
import { 
  SupplierId, Supplier, PriceItem, HistoryRecord, 
  ActiveTab, UserRole, OCRCandidate, BatteryBrand 
} from './types';
import { storage } from './services/storage';
import { processQuoteImages, optimizeImage } from './services/ocr';
import { authService, UserProfile } from './services/auth';
import { supabaseDb } from './services/supabaseDb';
import { isSupabaseConfigured, initSupabaseFromBackend } from './services/supabaseClient';
import { Header } from './components/Layout/Header';
import { BottomNav } from './components/Layout/BottomNav';
import { HomeView } from './components/Home/HomeView';
import { PriceListView } from './components/PriceList/PriceListView';
import { CompareView } from './components/PriceCompare/CompareView';
import { HistoryView } from './components/History/HistoryView';
import { SupplierSelectorModal } from './components/UploadModal/SupplierSelectorModal';
import { OCRReviewModal } from './components/UploadModal/OCRReviewModal';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AuthModal } from './components/Auth/AuthModal';
import { Sparkles, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation State
  const [currentTab, setCurrentTab] = useState<ActiveTab>('home');
  const [activeSupplier, setActiveSupplier] = useState<SupplierId>('nguyen');
  const [compareQuery, setCompareQuery] = useState<string>('N100');

  // Role & Senior Mode
  const [role, setRole] = useState<UserRole>('viewer');
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isSeniorMode, setIsSeniorMode] = useState<boolean>(true);

  // App Data State
  const [suppliers, setSuppliers] = useState<Record<SupplierId, Supplier>>(() => storage.getSuppliers());
  const [prices, setPrices] = useState<Record<SupplierId, PriceItem[]>>(() => ({
    nguyen: storage.getPrices('nguyen'),
    ngoc: storage.getPrices('ngoc'),
    nhung: storage.getPrices('nhung'),
  }));
  const [history, setHistory] = useState<HistoryRecord[]>(() => storage.getHistory());

  // Upload & OCR State
  const [pendingFiles, setPendingFiles] = useState<{ file: File; base64: string }[]>([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrCandidates, setOcrCandidates] = useState<OCRCandidate[]>([]);
  const [targetSupplierForOCR, setTargetSupplierForOCR] = useState<SupplierId>('nguyen');
  const [ocrSourceType, setOcrSourceType] = useState<string>('ai_vision');
  const [showReviewModal, setShowReviewModal] = useState(false);

  // Modals & Feedback
  const [showSettings, setShowSettings] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Refresh data from storage
  const reloadData = () => {
    setSuppliers(storage.getSuppliers());
    setPrices({
      nguyen: storage.getPrices('nguyen'),
      ngoc: storage.getPrices('ngoc'),
      nhung: storage.getPrices('nhung'),
    });
    setHistory(storage.getHistory());
  };

  // Sync with Supabase Cloud & Local Server on startup
  useEffect(() => {
    // 1. Auth Subscription
    const { unsubscribe: unsubAuth } = authService.onAuthStateChange((profile) => {
      setCurrentUser(profile);
      if (profile) {
        setRole(profile.role);
      }
    });

    authService.getCurrentProfile().then(profile => {
      if (profile) {
        setCurrentUser(profile);
        setRole(profile.role);
      }
    });

    // 2. Fetch Supabase Data
    async function loadCloudOrLocalData() {
      await initSupabaseFromBackend();
      if (isSupabaseConfigured()) {
        const cloudSuppliers = await supabaseDb.fetchSuppliers();
        if (cloudSuppliers) setSuppliers(cloudSuppliers);

        const cloudPrices = await supabaseDb.fetchAllPrices();
        if (cloudPrices) setPrices(cloudPrices);

        const cloudHistory = await supabaseDb.fetchHistory();
        if (cloudHistory) setHistory(cloudHistory);
      } else {
        storage.fetchFromServer().then(ok => {
          if (ok) reloadData();
        });
      }
    }

    loadCloudOrLocalData();

    // 3. Realtime Subscription across all phones
    const { unsubscribe: unsubRealtime } = supabaseDb.subscribeToChanges(() => {
      loadCloudOrLocalData();
    });

    return () => {
      unsubAuth();
      unsubRealtime();
    };
  }, []);

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Add more files to pending batch
  const handleAddMoreFiles = async (newFiles: File[]) => {
    const converted = await Promise.all(
      newFiles.map(async file => ({
        file,
        base64: await optimizeImage(file)
      }))
    );
    setPendingFiles(prev => [...prev, ...converted]);
  };

  // Remove a file from pending batch
  const handleRemoveImage = (index: number) => {
    setPendingFiles(prev => prev.filter((_, i) => i !== index));
  };

  // 1. Files selected from camera or gallery
  const handleFilesSelected = async (files: File[]) => {
    if (files.length === 0) return;

    const converted = await Promise.all(
      files.map(async file => ({
        file,
        base64: await optimizeImage(file)
      }))
    );

    setPendingFiles(converted);
    setShowSupplierModal(true);
  };

  // 2. Supplier selected for uploaded image
  const handleSupplierChosenForUpload = async (supplierId: SupplierId) => {
    setShowSupplierModal(false);
    setTargetSupplierForOCR(supplierId);
    setIsOcrProcessing(true);

    try {
      const result = await processQuoteImages(pendingFiles, supplierId);
      setIsOcrProcessing(false);

      if (result.success && result.candidates.length > 0) {
        setOcrCandidates(result.candidates);
        setOcrSourceType(result.sourceType);
        setShowReviewModal(true);
      } else {
        showToast(result.error || 'Không đọc được dữ liệu từ ảnh. Vui lòng thử lại với ảnh rõ hơn.', 'error');
      }
    } catch (err: any) {
      setIsOcrProcessing(false);
      showToast('Có lỗi khi xử lý hình ảnh: ' + (err.message || 'Lỗi mạng'), 'error');
    }
  };

  // 3. Admin confirms OCR result
  const handleConfirmOCRUpdate = async (
    confirmedItems: { batteryName: string; unitPrice: number; brand?: BatteryBrand | null; capacityAh?: number | string }[],
    notes?: string
  ) => {
    setShowReviewModal(false);

    const imageUrl = pendingFiles[0]?.base64 || undefined;

    // Local Storage update
    const { updatedCount, newCount } = storage.applyPriceUpdate(
      targetSupplierForOCR,
      confirmedItems,
      imageUrl,
      notes
    );

    // Supabase Cloud update if connected
    if (isSupabaseConfigured()) {
      supabaseDb.savePriceUpdate(
        targetSupplierForOCR,
        confirmedItems,
        imageUrl,
        notes
      ).catch(err => console.warn('Supabase sync warning:', err));
    }

    reloadData();
    setActiveSupplier(targetSupplierForOCR);
    setCurrentTab('price-list');

    showToast(
      `Đã cập nhật ${updatedCount} mã và thêm ${newCount} mã mới cho nhà ${suppliers[targetSupplierForOCR]?.name}!`,
      'success'
    );

    setPendingFiles([]);
    setOcrCandidates([]);
  };

  // Header dynamic titles
  const getHeaderInfo = () => {
    switch (currentTab) {
      case 'home':
        return {
          title: 'SỔ GIÁ ẮC QUY',
          subtitle: 'Nhanh chóng • Chính xác • Dễ sử dụng',
          onBack: undefined,
        };
      case 'price-list':
        return {
          title: `Bảng giá - ${suppliers[activeSupplier]?.name || 'Nguyên'}`,
          subtitle: `Cập nhật gần nhất: ${suppliers[activeSupplier]?.lastUpdated || 'Chưa có dữ liệu'}`,
          onBack: () => setCurrentTab('home'),
        };
      case 'compare':
        return {
          title: 'So sánh giá 3 nhà',
          subtitle: 'Tìm nhà cung cấp có giá tốt nhất',
          onBack: () => setCurrentTab('home'),
        };
      case 'history':
        return {
          title: 'Lịch sử cập nhật',
          subtitle: 'Nhật ký các lần tải báo giá',
          onBack: () => setCurrentTab('home'),
        };
    }
  };

  const headerInfo = getHeaderInfo();
  const isAdmin = role === 'admin' || role === 'manager';

  return (
    <div className="min-h-screen bg-brand-pinkLight flex justify-center">
      {/* Mobile App Canvas Container */}
      <div className="w-full max-w-md min-h-screen bg-brand-pinkLight flex flex-col relative shadow-2xl">
        
        {/* Header */}
        <Header
          currentTab={currentTab}
          title={headerInfo.title}
          subtitle={headerInfo.subtitle}
          onBack={headerInfo.onBack}
          onOpenSettings={() => setShowSettings(true)}
          role={role}
          onToggleRole={() => {
            const next = role === 'admin' ? 'viewer' : 'admin';
            setRole(next);
            showToast(next === 'admin' ? 'Đã chuyển sang vai trò Quản trị' : 'Đã chuyển sang vai trò Người xem', 'info');
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 px-4 pt-4">
          {currentTab === 'home' && (
            <HomeView
              suppliers={suppliers}
              onSelectSupplier={(supId) => {
                setActiveSupplier(supId);
                setCurrentTab('price-list');
              }}
              onFilesSelected={handleFilesSelected}
              mostRecentDate={suppliers[activeSupplier]?.lastUpdated || 'Chưa có dữ liệu'}
              isAdmin={isAdmin}
              onRequireAdmin={() => setShowAuthModal(true)}
            />
          )}

          {currentTab === 'price-list' && (
            <PriceListView
              activeSupplier={activeSupplier}
              suppliers={suppliers}
              prices={prices}
              onSelectSupplier={(supId) => setActiveSupplier(supId)}
              onOpenUpload={() => {
                if (isAdmin) {
                  handleFilesSelected([]);
                } else {
                  setShowAuthModal(true);
                }
              }}
              onNavigateCompare={(batName) => {
                setCompareQuery(batName);
                setCurrentTab('compare');
              }}
              isSeniorMode={isSeniorMode}
            />
          )}

          {currentTab === 'compare' && (
            <CompareView
              suppliers={suppliers}
              prices={prices}
              initialSearch={compareQuery}
              isSeniorMode={isSeniorMode}
            />
          )}

          {currentTab === 'history' && (
            <HistoryView
              history={history}
              isSeniorMode={isSeniorMode}
            />
          )}
        </main>

        {/* Bottom Navigation Bar */}
        <BottomNav
          currentTab={currentTab}
          onChangeTab={(tab) => setCurrentTab(tab)}
        />

        {/* --- MODALS & OVERLAYS --- */}

        {/* Supplier Selector Modal */}
        <SupplierSelectorModal
          isOpen={showSupplierModal}
          images={pendingFiles}
          onAddMoreFiles={handleAddMoreFiles}
          onRemoveImage={handleRemoveImage}
          onSelectSupplier={handleSupplierChosenForUpload}
          onClose={() => {
            setShowSupplierModal(false);
            setPendingFiles([]);
          }}
        />

        {/* AI OCR Processing Spinner Overlay */}
        {isOcrProcessing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fadeIn">
            <div className="bg-white rounded-3xl p-8 max-w-xs w-full text-center shadow-2xl flex flex-col items-center space-y-4 animate-scaleUp">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-rose-200 border-t-brand-ruby animate-spin flex items-center justify-center" />
                <Sparkles className="w-6 h-6 text-brand-ruby absolute inset-0 m-auto" />
              </div>
              <h3 className="text-xl font-black text-brand-charcoal">
                AI đang đọc {pendingFiles.length} trang ảnh...
              </h3>
              <p className="text-xs text-stone-500 leading-relaxed">
                Đang nhận diện toàn bộ các dòng tên bình và đơn giá từ <strong>{pendingFiles.length} trang</strong> cho nhà <strong>{suppliers[targetSupplierForOCR]?.name}</strong>.
              </p>
            </div>
          </div>
        )}

        {/* OCR Review & Edit Modal */}
        {showReviewModal && (
          <OCRReviewModal
            isOpen={showReviewModal}
            supplierId={targetSupplierForOCR}
            supplier={suppliers[targetSupplierForOCR]}
            initialCandidates={ocrCandidates}
            images={pendingFiles}
            sourceType={ocrSourceType}
            onCancel={() => {
              setShowReviewModal(false);
              setPendingFiles([]);
            }}
            onConfirm={handleConfirmOCRUpdate}
          />
        )}

        {/* Settings & Role Switch Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
          currentUser={currentUser}
          onOpenAuth={() => setShowAuthModal(true)}
          onLogout={async () => {
            await authService.signOut();
            setCurrentUser(null);
            setRole('viewer');
            showToast('Đã đăng xuất.', 'info');
          }}
          role={role}
          onChangeRole={(r) => setRole(r)}
          isSeniorMode={isSeniorMode}
          onToggleSeniorMode={(val) => setIsSeniorMode(val)}
          onDataReset={reloadData}
        />

        {/* Authentication Modal (Sign in / Sign up) */}
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onLoginSuccess={(profile) => {
            setCurrentUser(profile);
            setRole(profile.role);
            showToast(`Chào mừng ${profile.fullName}! Bạn đang truy cập với vai trò ${profile.role === 'admin' ? 'Quản trị viên' : 'Người xem'}.`, 'success');
          }}
        />

        {/* Toast Notification */}
        {toastMessage && (
          <div className="fixed top-5 left-1/2 transform -translate-x-1/2 z-50 max-w-xs w-full px-4 animate-slideDown">
            <div className={`p-3.5 rounded-2xl shadow-xl flex items-center space-x-2.5 text-sm font-bold text-white ${
              toastMessage.type === 'success' ? 'bg-emerald-600' :
              toastMessage.type === 'error' ? 'bg-red-600' : 'bg-stone-800'
            }`}>
              {toastMessage.type === 'success' && <CheckCircle className="w-5 h-5 flex-shrink-0" />}
              {toastMessage.type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
              <span>{toastMessage.text}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
