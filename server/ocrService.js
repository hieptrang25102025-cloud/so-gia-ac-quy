/**
 * AI OCR Service - Google Gemini Vision Multi-Page Processor
 * Extracts (batteryName, capacityAh, unitPrice, brand) from Vietnamese battery price sheets (Enimac, GS, Troy, Dong Nai Pinaco, Rocket, etc.).
 * Designed for 100% complete row-by-row extraction without any truncation or fake fallbacks.
 */

const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3.1-flash-lite',
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
1. NHẬN BIẾT HÃNG SẢN XUẤT (brand):
   - Đọc kỹ TIÊU ĐỀ, PHẦN ĐẦU hoặc LOGO của từng bảng giá/trang ảnh để nhận biết hãng:
     * Tiêu đề có "ENIMAC", "BẢNG GIÁ ẮC ENIMAC", "ENIMAC - CMF"... -> brand: "Eni"
     * Tiêu đề có "GS", "GIÁ ẮC QUY GS"... -> brand: "GS"
     * Tiêu đề có "ĐỒNG NAI", "BẢNG GIÁ ẮC QUY ĐỒNG NAI", "PINACO"... -> brand: "ĐN"
     * Nếu không chắc chắn hoặc không thấy tên hãng -> brand: null
   - QUAN TRỌNG: KHÔNG ĐƯỢC TỰ ĐỘNG GHÉP ĐUÔI HÃNG VÀO TÊN BÌNH. Trường batteryName chỉ chứa tên gốc của bình. Việc ghép đuôi sẽ do hệ thống xử lý.

2. BÓC TÁCH ĐỦ 100% CÁC DÒNG:
   - Trích xuất toàn bộ tất cả các dòng sản phẩm từ STT 1 đến dòng cuối cùng (${pageCount} trang). Tuyệt đối không được bỏ sót dòng nào.

3. TÊN BÌNH / MÃ BÌNH (batteryName):
   - Lấy đúng tên sản phẩm tại cột "LOẠI BÌNH" hoặc "Chủng Loại" hoặc "Mã Bình" (Ví dụ: "CMF 36B20 R/L (Cọc nhỏ)", "CMF 46B24LS (Cọc lớn)", "MF 46B24LS (Cọc lớn)", "N50", "CMF 40B20"...).
   - Giữ nguyên các ghi chú quan trọng trong ngoặc như "(Cọc nhỏ)", "(Cọc lớn)" nếu có trong tên loại bình.
   - Bỏ qua STT và các thông số kích thước, Dài x Rộng x Cao.

4. DUNG LƯỢNG (capacityAh):
   - Lấy giá trị dung lượng từ cột "AH" nếu có (ví dụ: 35, 45, 50, 60, 100...).

5. ĐƠN GIÁ (unitPrice):
   - LUÔN LUÔN LẤY CỘT GIÁ CUỐI CÙNG HOẶC CỘT CÓ CHỮ "GIÁ NET" / "GIÁ NEX" (Giá bán sỉ sau chiết khấu).
   - Nếu bảng chỉ có 1 cột đơn giá (ví dụ "ĐƠN GIÁ"), hãy lấy cột đó.
   - Đơn giá là số nguyên không dấu chấm (ví dụ: 726000, 895000, 962000, 1010000, 827000, 958000...).

Trả về DUY NHẤT một chuỗi JSON hợp lệ theo định dạng:
{
  "detectedBrand": "Eni",
  "items": [
    {
      "batteryName": "CMF 36B20 R/L (Cọc nhỏ)",
      "capacityAh": 35,
      "unitPrice": 726000,
      "brand": "Eni",
      "confidence": "high",
      "pageNumber": 1
    }
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
      text: `Hãy nhận diện hãng từ tiêu đề/đầu trang và bóc tách toàn bộ tất cả các dòng sản phẩm trong bảng báo giá cho nhà cung cấp "${supplierId}". Bóc tách LOẠI BÌNH, AH và Đơn giá (cột Giá NET / Giá NEX hoặc cột giá cuối cùng bên phải). Trả về JSON.`
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
        const pageDetectedBrand = parsedJson.detectedBrand || null;

        const formattedItems = rawItems
          .map((item, idx) => {
            const rawName = (item.batteryName || item.name || '').trim();
            const brandVal = item.brand || pageDetectedBrand || null;
            let capacity = null;
            if (item.capacityAh !== undefined && item.capacityAh !== null) {
              const numAh = parseInt(String(item.capacityAh).replace(/[^0-9]/g, ''), 10);
              capacity = !isNaN(numAh) ? numAh : item.capacityAh;
            }

            return {
              batteryName: rawName,
              rawBatteryName: rawName,
              brand: brandVal,
              capacityAh: capacity,
              unitPrice: parseInt(String(item.unitPrice || item.price).replace(/[^0-9]/g, ''), 10) || 0,
              confidence: item.confidence || 'high',
              pageNumber: item.pageNumber || 1
            };
          })
          .filter(i => i.batteryName && i.unitPrice > 0);

        console.log(`[OCR] Thành công! Đã bóc tách được ${formattedItems.length} dòng sản phẩm bằng ${model} (Hãng: ${pageDetectedBrand || 'Không rõ'})`);

        return {
          success: true,
          items: formattedItems,
          detectedBrand: pageDetectedBrand,
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
