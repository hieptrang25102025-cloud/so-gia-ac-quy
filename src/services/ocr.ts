import { OCRCandidate } from '../types';
import { formatVND, parsePrice } from '../utils/formatters';

export interface OCRProcessResult {
  success: boolean;
  candidates: OCRCandidate[];
  error?: string;
  sourceType: 'ai_vision' | 'smart_parser' | 'simulation';
  pageCount: number;
}

/**
 * Compress and optimize an image file for fast mobile upload and high-accuracy OCR.
 * Resizes images exceeding 1920px while preserving sharp crisp text.
 */
export async function optimizeImage(file: File, maxDim = 1920, quality = 0.88): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawBase64 = e.target?.result as string;
      if (typeof window === 'undefined' || !window.document) {
        resolve(rawBase64);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          resolve(rawBase64);
        }
      };
      img.onerror = () => resolve(rawBase64);
      img.src = rawBase64;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

/**
 * Intelligent Multi-Page OCR Parser & Processor
 * Supports 1, 2, 3+ quote images, backend AI Gemini Vision, and full-catalog parser.
 */
export async function processQuoteImages(
  images: { file: File; base64: string }[],
  supplierId: string,
  apiKey?: string
): Promise<OCRProcessResult> {
  const pageCount = images.length;

  try {
    // 1. Call server AI OCR endpoint with all images
    const response = await fetch('/api/ocr', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        images: images.map(img => img.base64),
        supplierId,
        apiKey: apiKey || localStorage.getItem('gemini_api_key') || ''
      })
    });

    if (response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.items) && data.items.length > 0) {
        return {
          success: true,
          candidates: data.items.map((item: any, idx: number) => {
            const price = parsePrice(item.unitPrice || item.price);
            const isSuspicious = price < 100000 || price > 15000000 || !item.batteryName;
            return {
              id: `ocr-${idx}-${Date.now()}`,
              batteryName: cleanBatteryName(item.batteryName || `Bình ${idx + 1}`),
              unitPrice: price,
              formattedPrice: formatVND(price),
              confidence: isSuspicious ? 'low' : (item.confidence || 'high'),
              isSuspicious,
              pageNumber: item.pageNumber || 1,
              notes: item.notes || (isSuspicious ? 'Cần kiểm tra lại giá hoặc tên bình' : undefined)
            };
          }),
          sourceType: 'ai_vision',
          pageCount
        };
      } else {
        return {
          success: false,
          candidates: [],
          error: data.message || data.details || 'Không thể bóc tách dữ liệu từ hình ảnh.',
          sourceType: 'ai_vision',
          pageCount
        };
      }
    } else {
      const errData = await response.json().catch(() => ({}));
      return {
        success: false,
        candidates: [],
        error: errData.details || errData.error || `Lỗi máy chủ (${response.status}) khi bóc tách ảnh.`,
        sourceType: 'ai_vision',
        pageCount
      };
    }
  } catch (err: any) {
    console.error('OCR Processing error:', err);
    return {
      success: false,
      candidates: [],
      error: 'Không thể kết nối đến máy chủ bóc tách: ' + (err.message || 'Lỗi mạng'),
      sourceType: 'ai_vision',
      pageCount
    };
  }
}

/**
 * Clean battery name to keep only the pure model designation (ignoring dimensions, Ah, STT, company addresses)
 */
export function cleanBatteryName(raw: string): string {
  if (!raw) return '';
  return raw
    .replace(/^\s*\d+[\.\-\s]+/g, '') // remove leading STT e.g. "1. " or "02 - "
    .replace(/\(.*(?:kích thước|kt|DxRxC|ah|dung lượng|dài|rộng|cao|bảo hành|tháng).*\)/gi, '') // remove parenthesized specs
    .replace(/(?:kích thước|kt|DxRxC|ah|dung lượng|dài|rộng|cao|bảo hành|tháng).*/gi, '') // remove trailing spec notes
    .replace(/[\(\[\{:\-\s]+$/, '') // remove trailing open bracket or dash
    .replace(/\s+/g, ' ')
    .trim();
}


