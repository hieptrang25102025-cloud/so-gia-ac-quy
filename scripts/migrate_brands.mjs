/**
 * SỔ GIÁ ẮC QUY - SCRIPT CHUYỂN ĐỔI HÃNG CHO DỮ LIỆU CŨ (MIGRATE BRANDS)
 * 
 * Hướng dẫn sử dụng:
 * 1. Chạy thử nghiệm (Dry run - không thay đổi file):
 *    node scripts/migrate_brands.mjs --dry-run
 * 
 * 2. Gán hãng cho một nhà cung cấp cụ thể (ví dụ: gán hãng Eni cho tất cả bình chưa có đuôi của nhà Nguyên):
 *    node scripts/migrate_brands.mjs --supplier nguyen --brand Eni
 * 
 * 3. Chạy chuyển đổi chính thức có sao lưu:
 *    node scripts/migrate_brands.mjs --apply
 * 
 * Các hãng hỗ trợ:
 * - Eni : Hãng Enimac
 * - GS  : Hãng GS
 * - ĐN  : Hãng Đồng Nai
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const STORE_PATH = path.resolve(__dirname, '../server/data/store.json');

// Quy tắc kiểm tra và tách đuôi
const BRAND_SUFFIXES = ['Eni', 'GS', 'ĐN'];

function stripBrandSuffix(name) {
  if (!name) return { cleanName: '', existingBrand: null };
  const trimmed = name.trim().normalize('NFC');
  
  // Kiểm tra đuôi Eni, GS, ĐN (hoặc DN không dấu)
  const pattern = /\s+(Eni|GS|ĐN|DN)$/i;
  const match = trimmed.match(pattern);
  
  if (match) {
    const rawSuffix = match[1].toUpperCase();
    let normalizedBrand = 'Eni';
    if (rawSuffix === 'GS') normalizedBrand = 'GS';
    else if (rawSuffix === 'ĐN' || rawSuffix === 'DN') normalizedBrand = 'ĐN';
    else if (rawSuffix === 'ENI') normalizedBrand = 'Eni';

    const clean = trimmed.replace(pattern, '').trim();
    return { cleanName: clean, existingBrand: normalizedBrand };
  }
  
  return { cleanName: trimmed, existingBrand: null };
}

function formatBatteryWithBrand(name, brand) {
  const { cleanName, existingBrand } = stripBrandSuffix(name);
  const targetBrand = brand || existingBrand;
  if (!targetBrand) return cleanName;
  return `${cleanName} ${targetBrand}`.normalize('NFC');
}

// Đọc tham số dòng lệnh
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run') || !args.includes('--apply');
const targetSupplierArg = args.indexOf('--supplier') !== -1 ? args[args.indexOf('--supplier') + 1] : null;
const targetBrandArg = args.indexOf('--brand') !== -1 ? args[args.indexOf('--brand') + 1] : null;

async function runMigration() {
  console.log('====================================================');
  console.log('   SỔ GIÁ ẮC QUY - CÔNG CỤ CHUYỂN ĐỔI HÃNG BÌNH');
  console.log('====================================================');
  console.log(`Chế độ: ${isDryRun ? '🔍 DRY-RUN (Xem trước, KHÔNG ghi đè file)' : '⚡ APPLY (Ghi đè và cập nhật)'}`);
  
  if (!fs.existsSync(STORE_PATH)) {
    console.error(`❌ Không tìm thấy file dữ liệu tại: ${STORE_PATH}`);
    process.exit(1);
  }

  const rawData = fs.readFileSync(STORE_PATH, 'utf-8');
  let store;
  try {
    store = JSON.parse(rawData);
  } catch (err) {
    console.error('❌ File store.json không hợp lệ:', err.message);
    process.exit(1);
  }

  // Tự động sao lưu nếu ở chế độ --apply
  if (!isDryRun) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.resolve(__dirname, `../server/data/store.backup.${timestamp}.json`);
    fs.writeFileSync(backupPath, rawData, 'utf-8');
    console.log(`💾 Đã tạo file sao lưu an toàn tại: ${backupPath}\n`);
  }

  let totalItems = 0;
  let alreadyHasSuffixCount = 0;
  let migratedCount = 0;
  let skippedCount = 0;

  const suppliers = ['nguyen', 'ngoc', 'nhung'];

  suppliers.forEach(supId => {
    if (targetSupplierArg && targetSupplierArg !== supId) return;

    const list = store.prices?.[supId] || [];
    console.log(`📦 Đang kiểm tra nhà cung cấp [${supId.toUpperCase()}] (${list.length} bình):`);

    list.forEach(item => {
      totalItems++;
      const { cleanName, existingBrand } = stripBrandSuffix(item.batteryName);

      if (existingBrand) {
        alreadyHasSuffixCount++;
        // Đã có đuôi hợp lệ
        console.log(`  ✓ Đã có đuôi: "${item.batteryName}" (Hãng: ${existingBrand})`);
      } else {
        // Chưa có đuôi
        let assignedBrand = targetBrandArg || null;

        // Nhận diện theo tên nếu chưa truyền tham số
        if (!assignedBrand) {
          const lower = item.batteryName.toLowerCase();
          if (lower.includes('enimac') || lower.includes('eni')) assignedBrand = 'Eni';
          else if (lower.includes('đồng nai') || lower.includes('dong nai') || lower.includes('pinaco')) assignedBrand = 'ĐN';
          else if (lower.includes('gs')) assignedBrand = 'GS';
        }

        if (assignedBrand) {
          const newName = formatBatteryWithBrand(cleanName, assignedBrand);
          console.log(`  🔄 Chuyển đổi: "${item.batteryName}" ➔ "${newName}"`);
          item.batteryName = newName;
          item.brand = assignedBrand;
          migratedCount++;
        } else {
          console.log(`  ⚠️ Chưa gán hãng (giữ nguyên): "${item.batteryName}"`);
          skippedCount++;
        }
      }
    });
    console.log('');
  });

  console.log('----------------------------------------------------');
  console.log('THỐNG KÊ KẾT QUẢ:');
  console.log(`- Tổng số bình kiểm tra: ${totalItems}`);
  console.log(`- Bình đã có sẵn đuôi hãng: ${alreadyHasSuffixCount}`);
  console.log(`- Bình được cập nhật đuôi: ${migratedCount}`);
  console.log(`- Bình giữ nguyên (chưa rõ hãng): ${skippedCount}`);
  console.log('----------------------------------------------------');

  if (isDryRun) {
    console.log('\n💡 Ghi chú: Để thực hiện cập nhật thật, hãy chạy:');
    console.log('   node scripts/migrate_brands.mjs --apply');
    if (targetBrandArg) {
      console.log(`   (Hoặc: node scripts/migrate_brands.mjs --supplier ${targetSupplierArg || 'nguyen'} --brand ${targetBrandArg} --apply)`);
    }
  } else {
    fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf-8');
    console.log('\n✅ ĐÃ CẬP NHẬT THÀNH CÔNG VÀO FILE store.json!');
  }
}

runMigration().catch(err => {
  console.error('Lỗi khi thực thi migration:', err);
  process.exit(1);
});
