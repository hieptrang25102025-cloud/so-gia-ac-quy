/**
 * Battery Brand Utility & Suffix Helpers
 * Standardized Brand Suffixes:
 * - Enimac  -> 'Eni'
 * - GS      -> 'GS'
 * - Đồng Nai -> 'ĐN' (Capital Đ with crossbar and capital N, Unicode NFC)
 */

export type BatteryBrand = 'Eni' | 'GS' | 'ĐN';

export const BRAND_CONFIG: Record<BatteryBrand, { code: BatteryBrand; name: string; color: string; bg: string }> = {
  Eni: { code: 'Eni', name: 'Enimac', color: '#B91C1C', bg: '#FEE2E2' },
  GS: { code: 'GS', name: 'GS Yuasa', color: '#1D4ED8', bg: '#DBEAFE' },
  'ĐN': { code: 'ĐN', name: 'Đồng Nai (Pinaco)', color: '#047857', bg: '#D1FAE5' },
};

export const BRAND_LIST: BatteryBrand[] = ['Eni', 'GS', 'ĐN'];

/**
 * Normalizes input brand string to exact canonical Brand or null
 */
export function normalizeBrand(brand?: string | null): BatteryBrand | null {
  if (!brand) return null;
  const b = brand.normalize('NFC').trim().toLowerCase();
  if (b === 'eni' || b === 'enimac') return 'Eni';
  if (b === 'gs') return 'GS';
  if (b === 'đn' || b === 'dn' || b === 'đồng nai' || b === 'dong nai' || b === 'pinaco') return 'ĐN';
  return null;
}

/**
 * Detect brand from bill title or text content
 */
export function detectBrandFromTitle(text: string): BatteryBrand | null {
  if (!text) return null;
  const t = text.normalize('NFC').toLowerCase();
  if (t.includes('enimac')) return 'Eni';
  if (t.includes('gs')) return 'GS';
  if (t.includes('đồng nai') || t.includes('dong nai') || t.includes('pinaco')) return 'ĐN';
  return null;
}

/**
 * Checks if battery name already has the specified brand suffix (case-insensitive, handles DN/ĐN)
 */
export function hasBrandSuffix(batteryName: string, brand: BatteryBrand): boolean {
  if (!batteryName) return false;
  const name = batteryName.normalize('NFC').trim();
  if (brand === 'Eni') {
    return /(?:[\s\-_\/]+|\b)eni(?:mac)?$/i.test(name);
  }
  if (brand === 'GS') {
    return /(?:[\s\-_\/]+|\b)gs$/i.test(name);
  }
  if (brand === 'ĐN') {
    return /(?:[\s\-_\/]+|\b)(?:đn|dn|đồng nai|dong nai)$/i.test(name);
  }
  return false;
}

/**
 * Strips existing brand suffix from battery name and returns the clean base name + detected suffix
 */
export function stripBrandSuffix(batteryName: string): { cleanName: string; existingBrand: BatteryBrand | null } {
  if (!batteryName) return { cleanName: '', existingBrand: null };
  let name = batteryName.normalize('NFC').trim();
  let existingBrand: BatteryBrand | null = null;

  if (/(?:[\s\-_\/]+|\b)eni(?:mac)?$/i.test(name)) {
    name = name.replace(/(?:[\s\-_\/]+|\b)eni(?:mac)?$/i, '').trim();
    existingBrand = 'Eni';
  } else if (/(?:[\s\-_\/]+|\b)gs$/i.test(name)) {
    name = name.replace(/(?:[\s\-_\/]+|\b)gs$/i, '').trim();
    existingBrand = 'GS';
  } else if (/(?:[\s\-_\/]+|\b)(?:đn|dn|đồng nai|dong nai)$/i.test(name)) {
    name = name.replace(/(?:[\s\-_\/]+|\b)(?:đn|dn|đồng nai|dong nai)$/i, '').trim();
    existingBrand = 'ĐN';
  }

  return { cleanName: name, existingBrand };
}

/**
 * Formats battery name with standard brand suffix: <tên gốc> + 1 khoảng trắng + <đuôi>.
 * - "N50" + "Eni" -> "N50 Eni"
 * - "N50 Eni" + "Eni" -> "N50 Eni" (Does NOT duplicate)
 * - "N50 DN" + "ĐN" -> "N50 ĐN" (Normalizes to standard NFC "ĐN")
 * - If brand is null/undefined -> Keeps clean name without suffix (No guessing)
 */
export function formatBatteryWithBrand(batteryName: string, brand?: BatteryBrand | string | null): string {
  if (!batteryName) return '';
  const canonBrand = normalizeBrand(brand);
  const { cleanName } = stripBrandSuffix(batteryName);

  if (!canonBrand) {
    return cleanName.normalize('NFC');
  }

  return `${cleanName} ${canonBrand}`.normalize('NFC');
}
