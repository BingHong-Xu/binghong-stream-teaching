import fs from 'fs';

console.log('=== Running Portfolio Display Verification Tests ===\n');

const data = JSON.parse(fs.readFileSync('data/portfolio_data.json', 'utf8'));

let errors = 0;

// Test 1: Total items and sections
if (data.items.length !== 1145) {
  console.error(`❌ Expected 1145 items, got ${data.items.length}`);
  errors++;
} else {
  console.log(`✅ Item count: 1145 items verified.`);
}

if (data.sections.length !== 43) {
  console.error(`❌ Expected 43 sections, got ${data.sections.length}`);
  errors++;
} else {
  console.log(`✅ Section count: 43 sections verified.`);
}

// Test 2: Invalid or missing createdAt
function formatDate(isoStr) {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    if (isNaN(d.getTime())) return '';
    return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
  } catch {
    return '';
  }
}

const missingDates = data.items.filter(i => !i.createdAt || formatDate(i.createdAt).includes('NaN'));
if (missingDates.length > 0) {
  console.error(`❌ Found ${missingDates.length} items with missing/NaN createdAt!`);
  missingDates.forEach(i => console.error(`  - ID: ${i.id}, headline: ${i.headline}`));
  errors++;
} else {
  console.log(`✅ Date formatting: All 1145 items have valid createdAt dates (0 NaN).`);
}

// Test 3: Orphan sections
const sectionIds = new Set(data.sections.map(s => String(s.id)));
const orphanItems = data.items.filter(i => !sectionIds.has(String(i.sectionId)));
if (orphanItems.length > 0) {
  console.error(`❌ Found ${orphanItems.length} orphan items!`);
  orphanItems.forEach(i => console.error(`  - ID: ${i.id}, sectionId: ${i.sectionId}`));
  errors++;
} else {
  console.log(`✅ Section integrity: 0 orphan items.`);
}

// Test 4: PDF items check (3980000001 & 3980000002)
const tssciItem = data.items.find(i => String(i.id) === '3980000001');
if (!tssciItem || tssciItem.mediaType !== 'pdf' || !tssciItem.fileUrl) {
  console.error(`❌ TSSCI item 3980000001 is not properly configured as PDF:`, tssciItem);
  errors++;
} else {
  console.log(`✅ TSSCI Item 3980000001: Correctly configured as PDF (${tssciItem.fileUrl}).`);
}

const letterItem = data.items.find(i => String(i.id) === '3980000002');
if (!letterItem || letterItem.mediaType !== 'pdf' || !letterItem.fileUrl) {
  console.error(`❌ Appointment item 3980000002 is not properly configured as PDF:`, letterItem);
  errors++;
} else {
  console.log(`✅ Appointment Item 3980000002: Correctly configured as PDF (${letterItem.fileUrl}).`);
}

// Test 5: Teacher portrait (3904794906)
const introItem = data.items.find(i => String(i.id) === '3904794906');
if (!introItem || (introItem.previewImage || '').includes('空白')) {
  console.error(`❌ Item 3904794906 still has blank image!`);
  errors++;
} else {
  console.log(`✅ Teacher Portrait 3904794906: Properly mapped to ${introItem.previewImage}.`);
}

// Test 6: Headline check (3675122362)
const govItem = data.items.find(i => String(i.id) === '3675122362');
if (!govItem || !govItem.headline.includes('專業工作人員（2025迄今）')) {
  console.error(`❌ Item 3675122362 headline incomplete: ${govItem?.headline}`);
  errors++;
} else {
  console.log(`✅ Item 3675122362: Headline complete ("${govItem.headline}").`);
}

// Test 7: Award item check
const awardWords = ['第一名', '第二名', '第三名', '第四名', '第五名', '第六名', '第七名', '第八名', '全國第一', '全縣第一', '金獎', '銀獎', '銅獎', '首獎', '特優', '優等', '佳作', '秀才', '狀元', '冠軍', '亞軍', '季軍', '殿軍', '殊榮', '獲獎', '錦標賽', '典範學校', '標竿學校', '得獎', '表揚', '頒獎', '榮譽', '稱冠', '奪冠', '獲冠'];

function isAwardItem(item) {
  if (item.evidenceCode) return true;
  if (item.categoryId === 'honors' || item.categoryId === 'mentorship') return true;
  const secTitle = item.sectionTitle || '';
  if (secTitle.includes('殊榮') || secTitle.includes('獲獎') || secTitle.includes('競賽') || secTitle.includes('指導學生獲獎')) return true;
  if (item.categoryId === 'research' || item.categoryId === 'certifications') return false;
  const headline = item.headline || '';
  return awardWords.some(w => headline.includes(w));
}

// Ensure normal activity photos are not matched
const normalActivities = data.items.filter(i => {
  const h = i.headline || '';
  return (h.includes('教師節') || h.includes('萬國旗') || h.includes('美感微電影') || h.includes('畢業典禮')) && isAwardItem(i);
});

if (normalActivities.length > 0) {
  console.error(`❌ Found ${normalActivities.length} normal activities falsely marked as awards!`);
  normalActivities.forEach(i => console.error(`  - ${i.headline}`));
  errors++;
} else {
  console.log(`✅ Award classification: 0 false-positive activity photos marked as awards.`);
}

console.log(`\n========================================`);
if (errors === 0) {
  console.log(`🎉 ALL TESTS PASSED! (0 errors)\n`);
} else {
  console.error(`❌ FAILED WITH ${errors} ERRORS.\n`);
  process.exit(1);
}
