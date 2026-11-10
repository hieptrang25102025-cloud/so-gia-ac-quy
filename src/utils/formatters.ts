/**
 * Utility functions for battery price formatting, date formatting, and text normalization.
 */

export function formatVND(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) return '0';
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parsePrice(input: string | number): number {
  if (typeof input === 'number') return input;
  if (!input) return 0;
  
  // Clean all dots, commas, spaces, currency symbols
  const cleaned = input.toString().replace(/[^\d]/g, '');
  const parsed = parseInt(cleaned, 10);
  
  if (isNaN(parsed)) return 0;
  
  // Handle case where user or OCR wrote "554" meaning 554.000 (often in thousands)
  // If price is less than 2000, it's likely raw thousand (e.g. 554 -> 554000)
  if (parsed > 0 && parsed < 2000) {
    return parsed * 1000;
  }
  
  return parsed;
}

export function normalizeSearch(str: string): string {
  if (!str) return '';
  return str
    .toLowerCase()
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[-_/\s\(\)]/g, '');
}

/**
 * Converts price number to friendly spoken Vietnamese for senior read-aloud
 */
export function priceToSpeechText(price: number, batteryName: string, supplierName: string): string {
  const formatted = formatVND(price);
  return `Bình ${batteryName}, nhà ${supplierName}, giá ${formatted} đồng`;
}
