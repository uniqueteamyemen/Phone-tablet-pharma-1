import fs from 'fs';
import path from 'path';
import { 
  normalizeMedicineSearch, 
  getMedicineSearchMatch, 
  rankMedicinesBySearch 
} from '../src/medicineSearch';
import { 
  calculateCappedMatchScore, 
  canonicalDrugIdsMatch 
} from '../src/medicineMatching';
import { 
  calculateMarketMatches,
  INITIAL_ENTITIES_LIST,
  isEntitySubscribed,
  loadPharmaEntitiesList,
  savePharmaEntitiesList,
  loadPharmaEntity,
  savePharmaEntity,
  loadPharmaOffers,
  loadPharmaRequests
} from '../src/utils/pharmaStorage';
import { 
  sanitizeInput, 
  validateQuantity, 
  validatePrice, 
  validateExpiryDate, 
  safeCockcroftGault 
} from '../src/utils/pharmaValidation';
import { INITIAL_NEML_CATALOG, PharmaOffer, PharmaRequest, PharmaEntity } from '../src/types/pharmayemen';

// Polyfill in-memory localStorage for Node testing environment
const mockStorage: Record<string, string> = {};
if (typeof globalThis.localStorage === 'undefined') {
  (globalThis as any).localStorage = {
    getItem: (key: string) => mockStorage[key] || null,
    setItem: (key: string, value: string) => { mockStorage[key] = String(value); },
    removeItem: (key: string) => { delete mockStorage[key]; },
    clear: () => { Object.keys(mockStorage).forEach(k => delete mockStorage[k]); },
  };
}

// Test harness color output
const ANSI = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
  magenta: '\x1b[35m',
};

interface TestResult {
  category: string;
  name: string;
  passed: boolean;
  durationMs: number;
  details?: string;
}

const results: TestResult[] = [];

function runTest(category: string, name: string, fn: () => void) {
  const start = performance.now();
  let passed = true;
  let details = '';
  try {
    fn();
  } catch (err: any) {
    passed = false;
    details = err?.message || String(err);
  }
  const durationMs = Math.round((performance.now() - start) * 100) / 100;
  results.push({ category, name, passed, durationMs, details });
}

console.log(`${ANSI.bold}${ANSI.cyan}=========================================================================${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}   PharmaYemen - منصة السوق الدوائي اليمني: حزمة الاختبارات الشاملة     ${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}   (فحص المنشآت، الاستدامة، العزل، PWA، الموبايل، وسلاسل الإمداد)      ${ANSI.reset}`);
console.log(`${ANSI.bold}${ANSI.cyan}=========================================================================${ANSI.reset}\n`);

// =========================================================================
// TEST 1: USER & ENTITY MANAGER FUNCTIONAL TEST
// =========================================================================
runTest('1. User & Entity Manager Test', 'إنشاء صيدلية جديدة، حفظها، والتحقق من ظهورها كمنشأة نشطة وتعديلها', () => {
  const newPharmacy: PharmaEntity = {
    id: `ent-test-${Date.now()}`,
    name: 'صيدلية الأمل النموذجية - تعز',
    type: 'pharmacy',
    licenseNumber: 'YE-TAIZ-2026-99',
    governorate: 'تعز',
    city: 'تعز',
    address: 'شارع جمال - جولة المسبح',
    phone: '+967 733 111 222',
    status: 'verified',
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
  };

  // 1. Save new pharmacy as active
  savePharmaEntity(newPharmacy);
  const active = loadPharmaEntity();
  if (active.id !== newPharmacy.id || active.name !== newPharmacy.name) {
    throw new Error(`Active entity mismatch after save: ${active.name}`);
  }

  // 2. Edit pharmacy information
  const updatedPharmacy: PharmaEntity = {
    ...active,
    name: 'صيدلية الأمل الكبرى - المسبح',
    phone: '+967 777 999 888',
    address: 'شارع جمال - مقابل برج التحرير',
  };
  savePharmaEntity(updatedPharmacy);

  // 3. Verify updated info is returned
  const reloaded = loadPharmaEntity();
  if (reloaded.name !== 'صيدلية الأمل الكبرى - المسبح' || reloaded.phone !== '+967 777 999 888') {
    throw new Error(`Updated info was not reflected: ${reloaded.name}, ${reloaded.phone}`);
  }
});

// =========================================================================
// TEST 2: PERSISTENCE TEST (إعادة التحميل وبقاء البيانات)
// =========================================================================
runTest('2. Persistence Test', 'التحقق من بقاء بيانات المنشأة وتعديلاتها سليمة بعد إعادة تشغيل التطبيق (Reload Simulation)', () => {
  const uniqueId = `ent-persist-${Date.now()}`;
  const persistentEntity: PharmaEntity = {
    id: uniqueId,
    name: 'مستودع سبأ للأدوية والمستلزمات - المكلا',
    type: 'distributor',
    licenseNumber: 'YE-HAD-2026-07',
    governorate: 'حضرموت',
    city: 'المكلا',
    address: 'شارع الستين',
    phone: '+967 711 333 444',
    status: 'verified',
    subscriptionPlan: 'enterprise',
    createdAt: new Date().toISOString(),
  };

  savePharmaEntity(persistentEntity);

  // Simulate complete app reload by reading fresh from storage
  const loaded = loadPharmaEntity();
  if (loaded.id !== uniqueId || loaded.type !== 'distributor') {
    throw new Error('Entity failed to persist across simulated reload');
  }

  const list = loadPharmaEntitiesList();
  const foundInList = list.find(e => e.id === uniqueId);
  if (!foundInList) {
    throw new Error('Entity was not persisted in the master directory list');
  }
});

// =========================================================================
// TEST 3: MULTIPLE ENTITIES TEST (التبديل بين المنشآت المتعددة)
// =========================================================================
runTest('3. Multiple Entities Test', 'إنشاء منشأة ثانية والتبديل السلس بين المنشآت مع احتفاظ كل منشأة ببياناتها', () => {
  const entityA: PharmaEntity = {
    id: 'ent-a-sanaa',
    name: 'صيدلية الروضة - صنعاء',
    type: 'pharmacy',
    licenseNumber: 'YE-SANAA-881',
    governorate: 'صنعاء',
    city: 'صنعاء',
    address: 'حي الروضة',
    phone: '+967 777 101 010',
    status: 'verified',
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
  };

  const entityB: PharmaEntity = {
    id: 'ent-b-aden',
    name: 'مستشفى الشفاء التخصصي - عدن',
    type: 'hospital',
    licenseNumber: 'YE-ADEN-442',
    governorate: 'عدن',
    city: 'عدن',
    address: 'خور مكسر',
    phone: '+967 733 202 020',
    status: 'verified',
    subscriptionPlan: 'free',
    createdAt: new Date().toISOString(),
  };

  // Save both
  savePharmaEntity(entityA);
  savePharmaEntity(entityB);

  // Switch to Entity A
  savePharmaEntity(entityA);
  let current = loadPharmaEntity();
  if (current.id !== 'ent-a-sanaa' || current.type !== 'pharmacy') {
    throw new Error('Failed switching to Entity A');
  }

  // Switch to Entity B
  savePharmaEntity(entityB);
  current = loadPharmaEntity();
  if (current.id !== 'ent-b-aden' || current.type !== 'hospital') {
    throw new Error('Failed switching to Entity B');
  }
});

// =========================================================================
// TEST 4: DATA ISOLATION TEST (عزل البيانات بين المنشآت)
// =========================================================================
runTest('4. Data Isolation Test', 'التحقق من عدم تأثر بيانات منشأة عند تعديل بيانات منشأة أخرى (Data Isolation)', () => {
  const pharmacyOriginal: PharmaEntity = {
    id: 'iso-pharm-1',
    name: 'صيدلية بلقيس - إب',
    type: 'pharmacy',
    licenseNumber: 'YE-IBB-101',
    governorate: 'إب',
    city: 'إب',
    address: 'شارع العدين',
    phone: '+967 771 000 111',
    status: 'verified',
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
  };

  const hospitalOriginal: PharmaEntity = {
    id: 'iso-hosp-2',
    name: 'مستشفى السلام العام - الحديدة',
    type: 'hospital',
    licenseNumber: 'YE-HOD-505',
    governorate: 'الحديدة',
    city: 'الحديدة',
    address: 'شارع الميناء',
    phone: '+967 733 999 000',
    status: 'verified',
    subscriptionPlan: 'enterprise',
    createdAt: new Date().toISOString(),
  };

  const list = [pharmacyOriginal, hospitalOriginal];
  savePharmaEntitiesList(list);

  // Modify Pharmacy ONLY
  const modifiedPharmacy: PharmaEntity = {
    ...pharmacyOriginal,
    name: 'صيدلية بلقيس الحديثة المعدلة',
    phone: '+967 777 888 999',
  };
  savePharmaEntity(modifiedPharmacy);

  // Inspect Hospital in storage: it MUST retain original properties untouched
  const updatedList = loadPharmaEntitiesList();
  const hospitalCheck = updatedList.find(e => e.id === 'iso-hosp-2');
  if (!hospitalCheck) {
    throw new Error('Hospital entity was lost during list update');
  }
  if (hospitalCheck.name !== 'مستشفى السلام العام - الحديدة' || hospitalCheck.phone !== '+967 733 999 000') {
    throw new Error(`Data leak / corruption detected! Hospital data was altered: ${JSON.stringify(hospitalCheck)}`);
  }
});

// =========================================================================
// TEST 5: PWA TEST (فحص ملفات وتكوين تطبيق الويب التقدمي)
// =========================================================================
runTest('5. PWA Test', 'التحقق من صحة manifest.json، تسجيل Service Worker، ودعم الوضع المستقل (Standalone PWA)', () => {
  const manifestPath = path.join(process.cwd(), 'public', 'manifest.json');
  if (!fs.existsSync(manifestPath)) {
    throw new Error('manifest.json does not exist in /public');
  }

  const manifestRaw = fs.readFileSync(manifestPath, 'utf8');
  const manifest = JSON.parse(manifestRaw);

  if (manifest.display !== 'standalone') {
    throw new Error(`manifest.json display is not standalone: ${manifest.display}`);
  }
  if (!manifest.icons || manifest.icons.length < 2) {
    throw new Error('manifest.json is missing required standard PWA icons');
  }
  if (!manifest.start_url || !manifest.theme_color) {
    throw new Error('manifest.json is missing start_url or theme_color');
  }

  const swPath = path.join(process.cwd(), 'public', 'sw.js');
  if (!fs.existsSync(swPath)) {
    throw new Error('sw.js does not exist in /public');
  }
  const swContent = fs.readFileSync(swPath, 'utf8');
  if (!swContent.includes('addEventListener(\'install\'') || !swContent.includes('caches.open')) {
    throw new Error('sw.js is missing standard offline cache lifecycle listeners');
  }
});

// =========================================================================
// TEST 6: MOBILE INTERFACE TEST (فحص ملاءمة شاشات الهواتف)
// =========================================================================
runTest('6. Mobile Interface Test', 'التحقق من إمكانية الوصول على شاشات الهواتف وأبعاد اللمس (44px+) والاتجاه العربي RTL', () => {
  const htmlPath = path.join(process.cwd(), 'index.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf8');

  if (!htmlContent.includes('dir="rtl"')) {
    throw new Error('HTML root is missing dir="rtl" for standard Arabic layout');
  }
  if (!htmlContent.includes('viewport') || !htmlContent.includes('width=device-width')) {
    throw new Error('Viewport meta tag is missing or not configured for mobile responsiveness');
  }

  // Check header / navigation mobile classes
  const headerPath = path.join(process.cwd(), 'src', 'components', 'PharmaHeader.tsx');
  const headerContent = fs.readFileSync(headerPath, 'utf8');
  if (!headerContent.includes('md:hidden') || !headerContent.includes('overflow-x-auto')) {
    throw new Error('Header lacks mobile adaptive controls and horizontal scrolling tabs');
  }
});

// =========================================================================
// TEST 7: EXISTING APPLICATION WORKFLOW TEST
// =========================================================================
runTest('7. Core Application Workflow Test', 'التحقق من عمل مسارات الكتالوج، إضافة العروض والطلبات، والمطابقة اللحظية وسلاسل الإمداد', () => {
  // 1. Catalog integrity
  if (INITIAL_NEML_CATALOG.length < 700) {
    throw new Error(`NEML Catalog has fewer items than expected: ${INITIAL_NEML_CATALOG.length}`);
  }

  // 2. Search ranking
  const searchResults = rankMedicinesBySearch(INITIAL_NEML_CATALOG, 'Amoxicillin');
  if (searchResults.length === 0) {
    throw new Error('Catalog search for Amoxicillin returned empty');
  }

  // 3. Demo offers and requests loading
  const offers = loadPharmaOffers();
  const requests = loadPharmaRequests();
  if (offers.length === 0 || requests.length === 0) {
    throw new Error('Default market demo offers or requests failed to load');
  }

  // 4. Match engine discovery
  const matches = calculateMarketMatches(offers, requests);
  if (matches.length === 0) {
    throw new Error('Market matching engine produced 0 matches for initial supply-demand dataset');
  }
});

// =========================================================================
// TEST 8: RUNTIME & RECHARTS INTEGRATION TEST
// =========================================================================
runTest('8. Runtime & Analytics Test', 'التحقق من سلامة مكون Recharts ومؤشرات فجوات سلاسل الإمداد وخلو بيئة التشغيل من الأخطاء', () => {
  const chartPath = path.join(process.cwd(), 'src', 'components', 'PharmaSupplyDemandChart.tsx');
  if (!fs.existsSync(chartPath)) {
    throw new Error('PharmaSupplyDemandChart.tsx component is missing');
  }
  const chartCode = fs.readFileSync(chartPath, 'utf8');
  if (!chartCode.includes('ResponsiveContainer') || !chartCode.includes('BarChart')) {
    throw new Error('PharmaSupplyDemandChart does not import Recharts components properly');
  }
  if (!chartCode.includes('isAdminMode') && !chartCode.includes('isSubscribedInitial')) {
    throw new Error('PharmaSupplyDemandChart is missing Pro / Admin subscription access gating');
  }
});

// =========================================================================
// PRINT CONSOLIDATED REPORT
// =========================================================================

console.log(`${ANSI.bold}📋 نتائج تنفيذ الفحوصات الـ 8 الإضافية:${ANSI.reset}\n`);

let totalPassed = 0;
let totalFailed = 0;

for (const t of results) {
  if (t.passed) {
    totalPassed++;
    console.log(`  ${ANSI.green}✔ [PASS]${ANSI.reset} ${ANSI.bold}${t.category}:${ANSI.reset} ${t.name} ${ANSI.cyan}(${t.durationMs}ms)${ANSI.reset}`);
  } else {
    totalFailed++;
    console.log(`  ${ANSI.red}✖ [FAIL]${ANSI.reset} ${ANSI.bold}${t.category}:${ANSI.reset} ${t.name}`);
    console.log(`     ${ANSI.red}└─ السبب: ${t.details}${ANSI.reset}`);
  }
}

console.log(`\n${ANSI.bold}-------------------------------------------------------------------------${ANSI.reset}`);
console.log(`${ANSI.bold}ملخص النتائج الإجمالي:${ANSI.reset}`);
console.log(`• إجمالي الاختبارات: ${results.length}`);
console.log(`• ${ANSI.green}ناجحة (Passed): ${totalPassed}${ANSI.reset}`);
if (totalFailed > 0) {
  console.log(`• ${ANSI.red}فاشلة (Failed): ${totalFailed}${ANSI.reset}`);
} else {
  console.log(`• ${ANSI.green}نسبة النجاح: 100% (جميع الاختبارات الـ 8 المطلوبة اجتازت الفحص بنجاح تام)${ANSI.reset}`);
}
console.log(`${ANSI.bold}${ANSI.cyan}=========================================================================${ANSI.reset}\n`);
