/**
 * AI OCR Service - Google Gemini Vision Multi-Page Processor
 * Extracts (batteryName, unitPrice) from Vietnamese battery price sheets (Enimac, GS, Troy, Dong Nai Pinaco, Rocket, etc.).
 * Designed for 100% complete row-by-row extraction without any truncation or fake fallbacks.
 */

const CANDIDATE_MODELS = [
  'gemini-3.1-flash-lite',
  'gemini-flash-lite-latest',
  'gemini-3.8-flash'
];

export async function processImagesWithGemini(imagesBase64, supplierId, userApiKey) {
  const apiKey = userApiKey || process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: 'NO_API_KEY',
      message: 'Chưa cấu hình API Key Gemini trong hệ thống.',
      items: []
    };
  }

  const pageCount = imagesBase64.length;

  const systemInstruction = `Bạn là chuyên gia bóc tách dữ liệu bảng báo giá bình ắc quy hàng đầu tại Việt Nam (các hãng Enimac, Troy, GS, Đồng Nai Pinaco, Rocket, AtlasBX, v.v.).
NHIỆM VỤ CỐT LÕI:
Phân tích kỹ lưỡng TOÀN BỘ ${pageCount} trang ảnh bảng báo giá. Trích xuất ĐẦY ĐỦ 100% tất cả các dòng sản phẩm có trong hình ảnh, từ STT 1 đến dòng cuối cùng (kể cả bảng có 50, 56, 70 hay 100+ dòng). Tuyệt đối không được bỏ sót dòng nào.

QUY TẮC BÓC TÁCH GIÁ BẮT BUỘC:
1. TÊN BÌNH / MÃ BÌNH (batteryName):
   - Lấy đúng tên sản phẩm tại cột "Chủng Loại" hoặc "Mã Bình" (Ví dụ: "N25 - 2 cọc", "N30 - 2 cọc", "N32 - 2 cọc", "N70", "NS40 R", "NS60 R/L (S)", "CMF 36B20R/L", "DIN45L", "EFB N55/65B24L", "EFB DIN80L LN4"...).
   - Bỏ qua STT và các thông số kích thước, thông số dung lượng AH, Dài x Rộng x Cao.
2. ĐƠN GIÁ (unitPrice):
   - LUÔN LUÔN LẤY CỘT GIÁ CUỐI CÙNG HOẶC CỘT CÓ CHỮ "GIÁ NET" / "GIÁ NEX" (Giá bán sỉ / giá đại lý sau chiết khấu).
   - Ví dụ: Nếu bảng giá có các cột "Giá bán (chưa VAT)", "Giá bán (CÓ VAT)", "Giá NET THÁNG 7" -> BẮT BUỘC PHẢI LẤY CỘT "Giá NET THÁNG 7" (CỘT NGOÀI CÙNG BÊN PHẢI).
   - Tuyệt đối không lấy cột giá chưa VAT hay giá có VAT nếu bảng có cột Giá NET/Giá NEX/cột giá cuối cùng.
   - Nếu bảng chỉ có duy nhất 1 cột đơn giá (ví dụ "ĐƠN GIÁ"), hãy lấy cột đó.
   - Đơn giá phải là số nguyên (ví dụ: 593630, 656311, 722575, 1349378...). Bỏ dấu chấm, dấu phẩy, chữ đ.
3. BÓC TÁCH ĐỦ 100%: Trong bảng có bao nhiêu dòng sản phẩm thì trích xuất đầy đủ bấy nhiêu dòng, không được dừng giữa chừng.
4. Trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng:
{
  "items": [
    { "batteryName": "N25 - 2 cọc", "unitPrice": 593630, "confidence": "high", "pageNumber": 1 }
  ]
}`;

  try {
    const contentsParts = [];

    // Attach all pages
    imagesBase64.forEach((b64, index) => {
      const cleanBase64 = b64.includes(',') ? b64.split(',')[1] : b64;
      const mimeMatch = b64.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

      contentsParts.push({
        text: `--- TRANG BÁO GIÁ SỐ ${index + 1}/${pageCount} ---`
      });

      contentsParts.push({
        inlineData: {
          mimeType,
          data: cleanBase64
        }
      });
    });

    contentsParts.push({
      text: `Hãy đọc toàn bộ tất cả các dòng sản phẩm trong bảng báo giá cho nhà cung cấp "${supplierId}". Bóc tách Chủng Loại và Đơn giá (nhớ lấy cột Giá NET / Giá NEX hoặc cột giá cuối cùng bên phải). Trích xuất đủ 100% tất cả các dòng sản phẩm. Trả về JSON.`
    });

    let lastError = null;

    // Try candidate models with graceful fallback
    for (const model of CANDIDATE_MODELS) {
      try {
        console.log(`[OCR] Đang bóc tách ảnh với mô hình: ${model}...`);
        const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;

        const apiRes = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey
          },
          body: JSON.stringify({
            contents: [{ parts: contentsParts }],
            systemInstruction: {
              parts: [{ text: systemInstruction }]
            },
            generationConfig: {
              temperature: 0.1,
              maxOutputTokens: 8192,
              responseMimeType: "application/json"
            }
          })
        });

        if (!apiRes.ok) {
          const errText = await apiRes.text();
          console.warn(`[OCR] Mô hình ${model} trả về lỗi HTTP ${apiRes.status}:`, errText);
          lastError = errText;
          continue; // Try next model
        }

        const data = await apiRes.json();
        const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!candidateText) {
          lastError = 'Không nhận được văn bản phản hồi từ AI';
          continue;
        }

        const parsedJson = JSON.parse(candidateText);
        const rawItems = parsedJson.items || parsedJson.products || [];

        const formattedItems = rawItems
          .map((item, idx) => ({
            batteryName: (item.batteryName || item.name || '').trim(),
            unitPrice: parseInt(String(item.unitPrice || item.price).replace(/[^0-9]/g, ''), 10) || 0,
            confidence: item.confidence || 'high',
            pageNumber: item.pageNumber || 1
          }))
          .filter(i => i.batteryName && i.unitPrice > 0);

        console.log(`[OCR] Thành công! Đã bóc tách được ${formattedItems.length} dòng sản phẩm bằng ${model}`);

        return {
          success: true,
          items: formattedItems,
          sourceType: 'ai_vision',
          modelUsed: model,
          pageCount
        };
      } catch (innerErr) {
        console.warn(`[OCR] Lỗi khi gọi mô hình ${model}:`, innerErr.message);
        lastError = innerErr.message;
      }
    }

    return {
      success: false,
      error: 'ALL_MODELS_FAILED',
      details: lastError || 'Không thể trích xuất dữ liệu từ các mô hình AI.'
    };

  } catch (err) {
    console.error('OCR Processing Exception:', err);
    return {
      success: false,
      error: 'EXCEPTION',
      details: err.message
    };
  }
}
