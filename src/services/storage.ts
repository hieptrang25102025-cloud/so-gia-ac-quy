import { PriceItem, HistoryRecord, SupplierId, Supplier } from '../types';
import { SUPPLIERS_CONFIG } from '../constants/suppliers';
import { 
  INITIAL_PRICES_NGUYEN, 
  INITIAL_PRICES_NGOC, 
  INITIAL_PRICES_NHUNG, 
  INITIAL_HISTORY 
} from '../constants/initialData';
import { formatVND } from '../utils/formatters';

const STORAGE_KEY_PREFIX = 'sogiacquy_';

export interface AppStateData {
  suppliers: Record<SupplierId, Supplier>;
  prices: Record<SupplierId, PriceItem[]>;
  history: HistoryRecord[];
}

export class StorageService {
  private static instance: StorageService;
  
  private constructor() {
    // Ensure clean blank slate for user testing (v7)
    if (typeof window !== 'undefined' && window.localStorage) {
      const isBlankV7 = localStorage.getItem(`${STORAGE_KEY_PREFIX}clean_blank_v7`);
      if (!isBlankV7) {
        this.resetToDefault();
        localStorage.setItem(`${STORAGE_KEY_PREFIX}clean_blank_v7`, 'true');
      }
    }
  }

  public static getInstance(): StorageService {
    if (!StorageService.instance) {
      StorageService.instance = new StorageService();
    }
    return StorageService.instance;
  }

  // Load prices for a specific supplier
  public getPrices(supplierId: SupplierId): PriceItem[] {
    try {
      const local = localStorage.getItem(`${STORAGE_KEY_PREFIX}prices_${supplierId}`);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.warn('Could not read from localStorage', e);
    }

    // Default fallbacks
    switch (supplierId) {
      case 'nguyen': return INITIAL_PRICES_NGUYEN;
      case 'ngoc': return INITIAL_PRICES_NGOC;
      case 'nhung': return INITIAL_PRICES_NHUNG;
    }
  }

  // Save prices for a supplier
  public savePrices(supplierId: SupplierId, items: PriceItem[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}prices_${supplierId}`, JSON.stringify(items));
      this.syncToServer();
    } catch (e) {
      console.error('Failed to save prices', e);
    }
  }

  // Load suppliers info
  public getSuppliers(): Record<SupplierId, Supplier> {
    try {
      const local = localStorage.getItem(`${STORAGE_KEY_PREFIX}suppliers`);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.warn('Could not read suppliers from localStorage', e);
    }
    return SUPPLIERS_CONFIG;
  }

  // Save suppliers info
  public saveSuppliers(suppliers: Record<SupplierId, Supplier>): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}suppliers`, JSON.stringify(suppliers));
      this.syncToServer();
    } catch (e) {
      console.error('Failed to save suppliers', e);
    }
  }

  // Load history
  public getHistory(): HistoryRecord[] {
    try {
      const local = localStorage.getItem(`${STORAGE_KEY_PREFIX}history`);
      if (local) {
        return JSON.parse(local);
      }
    } catch (e) {
      console.warn('Could not read history from localStorage', e);
    }
    return INITIAL_HISTORY;
  }

  // Save history
  public saveHistory(history: HistoryRecord[]): void {
    try {
      localStorage.setItem(`${STORAGE_KEY_PREFIX}history`, JSON.stringify(history));
      this.syncToServer();
    } catch (e) {
      console.error('Failed to save history', e);
    }
  }

  /**
   * Apply OCR confirmation:
   * 1. Updates prices non-destructively: updates existing, appends new, keeps unmentioned.
   * 2. Updates supplier lastUpdated timestamp.
   * 3. Appends new history record.
   */
  public applyPriceUpdate(
    supplierId: SupplierId, 
    newItems: { batteryName: string; unitPrice: number }[],
    imageUrl?: string,
    notes?: string
  ): { updatedCount: number; newCount: number } {
    const existing = [...this.getPrices(supplierId)];
    const now = new Date();
    const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
    const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const historyDate = `${dateFormatted} - ${timeFormatted}`;

    let updatedCount = 0;
    let newCount = 0;

    newItems.forEach(item => {
      // Find matching battery by normalized name
      const norm = item.batteryName.trim().toLowerCase();
      const existingIdx = existing.findIndex(e => e.batteryName.trim().toLowerCase() === norm);

      if (existingIdx >= 0) {
        // Update existing price
        existing[existingIdx] = {
          ...existing[existingIdx],
          batteryName: item.batteryName.trim(),
          unitPrice: item.unitPrice,
          formattedPrice: formatVND(item.unitPrice),
          updatedAt: dateFormatted
        };
        updatedCount++;
      } else {
        // Append new item
        existing.push({
          id: `${supplierId}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          batteryName: item.batteryName.trim(),
          unitPrice: item.unitPrice,
          formattedPrice: formatVND(item.unitPrice),
          supplierId,
          updatedAt: dateFormatted
        });
        newCount++;
      }
    });

    // Save updated prices
    this.savePrices(supplierId, existing);

    // Update supplier metadata
    const suppliers = { ...this.getSuppliers() };
    if (suppliers[supplierId]) {
      suppliers[supplierId] = {
        ...suppliers[supplierId],
        lastUpdated: dateFormatted,
        itemCount: existing.length
      };
      this.saveSuppliers(suppliers);
    }

    // Add to history
    const history = [...this.getHistory()];
    const historyRecord: HistoryRecord = {
      id: `hist-${Date.now()}`,
      date: historyDate,
      timestamp: Date.now(),
      supplierId,
      supplierName: suppliers[supplierId]?.name || supplierId,
      itemCount: newItems.length,
      items: existing,
      imageUrl,
      note: notes || `Cập nhật ${newItems.length} mã bình qua ảnh báo giá`
    };
    history.unshift(historyRecord);
    this.saveHistory(history);

    return { updatedCount, newCount };
  }

  // Backup / Export all data to JSON
  public exportData(): string {
    const data: AppStateData = {
      suppliers: this.getSuppliers(),
      prices: {
        nguyen: this.getPrices('nguyen'),
        ngoc: this.getPrices('ngoc'),
        nhung: this.getPrices('nhung'),
      },
      history: this.getHistory()
    };
    return JSON.stringify(data, null, 2);
  }

  // Import / Restore data from JSON
  public importData(jsonString: string): boolean {
    try {
      const data: AppStateData = JSON.parse(jsonString);
      if (data.suppliers) this.saveSuppliers(data.suppliers);
      if (data.prices) {
        if (data.prices.nguyen) this.savePrices('nguyen', data.prices.nguyen);
        if (data.prices.ngoc) this.savePrices('ngoc', data.prices.ngoc);
        if (data.prices.nhung) this.savePrices('nhung', data.prices.nhung);
      }
      if (data.history) this.saveHistory(data.history);
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  // Reset to factory initial data
  public resetToDefault(): void {
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}prices_nguyen`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}prices_ngoc`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}prices_nhung`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}suppliers`);
    localStorage.removeItem(`${STORAGE_KEY_PREFIX}history`);
  }

  // Asynchronous sync to backend server
  public async syncToServer(): Promise<void> {
    try {
      const payload: AppStateData = {
        suppliers: this.getSuppliers(),
        prices: {
          nguyen: this.getPrices('nguyen'),
          ngoc: this.getPrices('ngoc'),
          nhung: this.getPrices('nhung'),
        },
        history: this.getHistory()
      };

      await fetch('/api/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch {
      // Offline mode or server unavailable is gracefully ignored
    }
  }

  // Pull latest updates from server if available
  public async fetchFromServer(): Promise<boolean> {
    try {
      const res = await fetch('/api/data');
      if (res.ok) {
        const data: AppStateData = await res.json();
        if (data && data.suppliers && data.prices) {
          this.saveSuppliers(data.suppliers);
          if (data.prices.nguyen) this.savePrices('nguyen', data.prices.nguyen);
          if (data.prices.ngoc) this.savePrices('ngoc', data.prices.ngoc);
          if (data.prices.nhung) this.savePrices('nhung', data.prices.nhung);
          if (data.history) this.saveHistory(data.history);
          return true;
        }
      }
    } catch {
      // Offline
    }
    return false;
  }
}

export const storage = StorageService.getInstance();
