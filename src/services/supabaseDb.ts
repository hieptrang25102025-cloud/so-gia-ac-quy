import { getSupabase } from './supabaseClient';
import { Supplier, SupplierId, PriceItem, HistoryRecord } from '../types';
import { SUPPLIERS_CONFIG } from '../constants/suppliers';
import { formatVND } from '../utils/formatters';

export const supabaseDb = {
  // 1. Fetch Suppliers
  async fetchSuppliers(): Promise<Record<SupplierId, Supplier> | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*');

      if (error || !data || data.length === 0) return null;

      const result = { ...SUPPLIERS_CONFIG };
      data.forEach((row: any) => {
        const id = row.id as SupplierId;
        if (result[id]) {
          result[id] = {
            ...result[id],
            name: row.name || result[id].name,
            badgeText: row.badge_text || result[id].badgeText,
            color: row.color || result[id].color,
            lightBg: row.light_bg || result[id].lightBg,
            textColor: row.text_color || result[id].textColor,
            borderColor: row.border_color || result[id].borderColor,
            lastUpdated: row.last_updated || 'Chưa có dữ liệu',
            itemCount: row.item_count ?? 0,
          };
        }
      });
      return result;
    } catch (err) {
      console.warn('Error fetching suppliers from Supabase:', err);
      return null;
    }
  },

  // 2. Fetch Prices for a supplier
  async fetchPrices(supplierId: SupplierId): Promise<PriceItem[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('battery_prices')
        .select('*')
        .eq('supplier_id', supplierId)
        .order('created_at', { ascending: true });

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        supplierId: row.supplier_id,
        batteryName: row.battery_name,
        unitPrice: Number(row.unit_price),
        formattedPrice: row.formatted_price || formatVND(Number(row.unit_price)),
        updatedAt: row.updated_at,
        notes: row.notes || undefined,
      }));
    } catch (err) {
      console.warn(`Error fetching prices for ${supplierId}:`, err);
      return null;
    }
  },

  // 3. Fetch All Prices for all suppliers
  async fetchAllPrices(): Promise<Record<SupplierId, PriceItem[]> | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('battery_prices')
        .select('*')
        .order('created_at', { ascending: true });

      if (error || !data) return null;

      const result: Record<SupplierId, PriceItem[]> = {
        nguyen: [],
        ngoc: [],
        nhung: [],
      };

      data.forEach((row: any) => {
        const supId = row.supplier_id as SupplierId;
        if (result[supId]) {
          result[supId].push({
            id: row.id,
            supplierId: supId,
            batteryName: row.battery_name,
            unitPrice: Number(row.unit_price),
            formattedPrice: row.formatted_price || formatVND(Number(row.unit_price)),
            updatedAt: row.updated_at,
            notes: row.notes || undefined,
          });
        }
      });

      return result;
    } catch (err) {
      console.warn('Error fetching all prices:', err);
      return null;
    }
  },

  // 4. Fetch History Records
  async fetchHistory(): Promise<HistoryRecord[] | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const { data, error } = await supabase
        .from('price_history')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error || !data) return null;

      return data.map((row: any) => ({
        id: row.id,
        supplierId: row.supplier_id,
        supplierName: row.supplier_name,
        date: row.date_str,
        timestamp: Number(row.timestamp),
        itemCount: row.item_count,
        imageUrl: row.image_url || undefined,
        note: row.notes || undefined,
        items: row.snapshot_items || undefined,
      }));
    } catch (err) {
      console.warn('Error fetching history:', err);
      return null;
    }
  },

  // 5. Upload Bill Image to Supabase Storage Bucket 'quote-images'
  async uploadQuoteImage(base64DataUrl: string, supplierId: string): Promise<string | null> {
    const supabase = getSupabase();
    if (!supabase) return null;

    try {
      const cleanBase64 = base64DataUrl.includes(',') ? base64DataUrl.split(',')[1] : base64DataUrl;
      const mimeMatch = base64DataUrl.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
      const ext = mimeType === 'image/png' ? 'png' : 'jpg';

      // Convert base64 to Blob
      const byteCharacters = atob(cleanBase64);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });

      const fileName = `${supplierId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from('quote-images')
        .upload(filePath, blob, {
          contentType: mimeType,
          upsert: true,
        });

      if (error) {
        console.warn('Supabase storage upload error:', error.message);
        return null;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('quote-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (err) {
      console.warn('Failed to upload quote image to Supabase:', err);
      return null;
    }
  },

  // 6. Save Price Update to Supabase (Admin only)
  async savePriceUpdate(
    supplierId: SupplierId,
    newItems: { batteryName: string; unitPrice: number }[],
    imageUrl?: string,
    notes?: string
  ): Promise<{ success: boolean; error?: string }> {
    const supabase = getSupabase();
    if (!supabase) return { success: false, error: 'Chưa kết nối Supabase' };

    try {
      const now = new Date();
      const dateFormatted = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
      const timeFormatted = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      const historyDate = `${dateFormatted} - ${timeFormatted}`;
      const timestamp = Date.now();

      // If image is base64, attempt to upload to storage first
      let permanentImageUrl = imageUrl;
      if (imageUrl && imageUrl.startsWith('data:')) {
        const uploadedUrl = await this.uploadQuoteImage(imageUrl, supplierId);
        if (uploadedUrl) {
          permanentImageUrl = uploadedUrl;
        }
      }

      // 6.1. Get existing prices for this supplier
      const { data: existingPrices } = await supabase
        .from('battery_prices')
        .select('*')
        .eq('supplier_id', supplierId);

      const existingMap = new Map<string, any>();
      (existingPrices || []).forEach(p => {
        existingMap.set(p.battery_name.trim().toLowerCase(), p);
      });

      const upsertPayload: any[] = [];

      newItems.forEach(item => {
        const norm = item.batteryName.trim().toLowerCase();
        const existing = existingMap.get(norm);
        const id = existing ? existing.id : `${supplierId}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

        upsertPayload.push({
          id,
          supplier_id: supplierId,
          battery_name: item.batteryName.trim(),
          unit_price: item.unitPrice,
          formatted_price: formatVND(item.unitPrice),
          updated_at: dateFormatted,
        });
      });

      // Execute upsert into battery_prices
      const { error: upsertError } = await supabase
        .from('battery_prices')
        .upsert(upsertPayload, { onConflict: 'id' });

      if (upsertError) {
        throw new Error(upsertError.message);
      }

      // Count total distinct items for supplier after update
      const { count: totalItems } = await supabase
        .from('battery_prices')
        .select('*', { count: 'exact', head: true })
        .eq('supplier_id', supplierId);

      // 6.2. Update supplier record
      await supabase
        .from('suppliers')
        .update({
          last_updated: dateFormatted,
          item_count: totalItems || newItems.length,
        })
        .eq('id', supplierId);

      // 6.3. Insert into price_history
      const historyRecordId = `hist-${supplierId}-${timestamp}`;
      const supplierName = SUPPLIERS_CONFIG[supplierId]?.name || supplierId;

      await supabase
        .from('price_history')
        .insert({
          id: historyRecordId,
          supplier_id: supplierId,
          supplier_name: supplierName,
          date_str: historyDate,
          timestamp,
          item_count: newItems.length,
          image_url: permanentImageUrl,
          notes: notes || `Cập nhật ${newItems.length} mã bình qua ảnh báo giá`,
          snapshot_items: newItems,
        });

      return { success: true };
    } catch (err: any) {
      console.error('Failed to save price update to Supabase:', err);
      return { success: false, error: err.message || 'Lỗi lưu dữ liệu' };
    }
  },

  // 7. Realtime Subscription (All phones receive price changes instantly)
  subscribeToChanges(onUpdate: () => void): { unsubscribe: () => void } {
    const supabase = getSupabase();
    if (!supabase) return { unsubscribe: () => {} };

    try {
      const channel = supabase
        .channel('battery-sync-channel')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'battery_prices' },
          () => onUpdate()
        )
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'suppliers' },
          () => onUpdate()
        )
        .subscribe();

      return {
        unsubscribe: () => {
          supabase.removeChannel(channel);
        },
      };
    } catch (err) {
      console.warn('Realtime subscription error:', err);
      return { unsubscribe: () => {} };
    }
  },
};
