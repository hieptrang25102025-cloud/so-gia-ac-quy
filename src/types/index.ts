export type SupplierId = 'nguyen' | 'ngoc' | 'nhung';
export type BatteryBrand = 'Eni' | 'GS' | 'ĐN';

export interface Supplier {
  id: SupplierId;
  name: string;
  badgeText: string;
  color: string;
  lightBg: string;
  textColor: string;
  borderColor: string;
  lastUpdated: string; // ISO or formatted date e.g. "09/04/2026"
  itemCount: number;
}

export interface PriceItem {
  id: string;
  batteryName: string;
  unitPrice: number;
  formattedPrice: string;
  supplierId: SupplierId;
  updatedAt: string;
  brand?: BatteryBrand | null;
  capacityAh?: number | string;
  confidence?: 'high' | 'medium' | 'low';
  note?: string;
}

export interface HistoryRecord {
  id: string;
  date: string; // e.g. "09/04/2026 - 09:41"
  timestamp: number;
  supplierId: SupplierId;
  supplierName: string;
  itemCount: number;
  items: PriceItem[];
  imageUrl?: string;
  note?: string;
}

export interface OCRCandidate {
  id: string;
  batteryName: string;
  rawBatteryName?: string;
  brand?: BatteryBrand | null;
  capacityAh?: number | string;
  unitPrice: number;
  formattedPrice: string;
  confidence: 'high' | 'medium' | 'low';
  isSuspicious: boolean;
  pageNumber?: number;
  notes?: string;
}

export type UserRole = 'admin' | 'viewer' | 'manager' | 'senior';

export type ActiveTab = 'home' | 'price-list' | 'compare' | 'history';
