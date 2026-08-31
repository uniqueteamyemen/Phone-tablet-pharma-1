/**
 * Comprehensive Automated Test Suite for PharmaYemen Clinical Matching Engine
 * Tests the strict pharmacological active-ingredient rules and dosage comparisons.
 */

import { 
  resolveActiveIngredient, 
  extractDrugStrength, 
  isSameStrengthValues, 
  extractDosageForm, 
  evaluateClinicalDrugMatch 
} from './pharmaClinicalMatcher';
import { calculateMarketMatches } from './pharmaStorage';
import { PharmaOffer, PharmaRequest } from '../types/pharmayemen';

// Test counters
let passed = 0;
let failed = 0;

function assert(condition: boolean, testName: string, details?: string) {
  if (condition) {
    console.log(`  ✅ PASS: ${testName}`);
    passed++;
  } else {
    console.error(`  ❌ FAIL: ${testName} ${details ? `(${details})` : ''}`);
    failed++;
  }
}

console.log('\n======================================================');
console.log('🧪 Starting PharmaYemen Clinical Matching Engine Tests');
console.log('======================================================\n');

// 1. TEST: Active Ingredient Resolution
console.log('--- Test Suite 1: Active Ingredient Resolution ---');
{
  const testCases = [
    { input: 'Panadol Extra 500mg', expected: 'paracetamol' },
    { input: 'Adol 500mg Tablets', expected: 'paracetamol' },
    { input: 'بنادول أزرق أقراص', expected: 'paracetamol' },
    { input: 'Augmentin 1g Tablets', expected: 'amoxicillin + clavulanic acid' },
    { input: 'أوجمنتين 625 ملجم', expected: 'amoxicillin + clavulanic acid' },
    { input: 'Amoclan 1000mg', expected: 'amoxicillin + clavulanic acid' },
    { input: 'Brufen 400mg', expected: 'ibuprofen' },
    { input: 'بروفين فوار', expected: 'ibuprofen' },
    { input: 'Flagyl 500mg Infusion', expected: 'metronidazole' },
    { input: 'فلاجيل 500 شراب', expected: 'metronidazole' },
    { input: 'Ceftriaxone 1g Vial', expected: 'ceftriaxone' },
    { input: 'سفترياكسون حقن', expected: 'ceftriaxone' },
    { input: 'Glucophage 500mg', expected: 'metformin' },
    { input: 'جلوكوفاج منظم السكر', expected: 'metformin' },
  ];

  for (const tc of testCases) {
    const res = resolveActiveIngredient(tc.input);
    assert(
      (res.genericEn || '').toLowerCase() === tc.expected.toLowerCase(), 
      `Resolve [${tc.input}] -> Expected: "${tc.expected}", Got: "${res.genericEn}"`
    );
  }
}

// 2. TEST: Strength Extraction & Equivalence (including unit conversions)
console.log('\n--- Test Suite 2: Strength Extraction & Unit Normalization ---');
{
  assert(isSameStrengthValues('1g', '1000mg'), '1g is equivalent to 1000mg');
  assert(isSameStrengthValues('0.5g', '500mg'), '0.5g is equivalent to 500mg');
  assert(isSameStrengthValues('500mg', '500 mg'), 'Whitespace tolerance: 500mg vs 500 mg');
  assert(!isSameStrengthValues('500mg', '250mg'), '500mg is NOT equivalent to 250mg');
  assert(!isSameStrengthValues('1g', '500mg'), '1g is NOT equivalent to 500mg');
}

// 3. TEST: Dosage Form Extraction & Comparison
console.log('\n--- Test Suite 3: Dosage Form Categorization ---');
{
  const form1 = extractDosageForm('Panadol 500mg Tablets');
  const form2 = extractDosageForm('Panadol 500mg Caplets');
  const form3 = extractDosageForm('Adol Syrup 120mg/5ml');
  const form4 = extractDosageForm('Ceftriaxone 1g Vial IV/IM');
  const form5 = extractDosageForm('Gentasol Eye Drops');

  assert(form1.category === 'tablets', 'Panadol Tablets -> tablets');
  assert(form2.category === 'tablets', 'Panadol Caplets -> tablets');
  assert(form3.category === 'syrup', 'Adol Syrup -> syrup');
  assert(form4.category === 'injection', 'Ceftriaxone Vial -> injection');
  assert(form5.category === 'drops', 'Gentasol Drops -> drops');

  assert(form1.category === form2.category, 'Tablets and Caplets belong to the same tablets category');
  assert(form1.category !== form3.category, 'Tablets and Syrup are different dosage forms');
}

// 4. TEST: Strict Clinical Drug Match Evaluation
console.log('\n--- Test Suite 4: Strict Clinical Match Evaluation ---');
{
  // Match Case 1: Exact active ingredient, same dose, same form
  const offer1: PharmaOffer = {
    id: 'off-test-1',
    entityId: 'ent-1',
    entityName: 'صيدلية النور',
    isFreeText: true,
    freeTextName: 'Panadol 500mg Tablets',
    quantity: 100,
    unit: 'شريط',
    currency: 'YER',
    expiryDate: '2027-01-01',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const request1: PharmaRequest = {
    id: 'req-test-1',
    entityId: 'ent-2',
    entityName: 'مستشفى الثورة',
    isFreeText: true,
    freeTextName: 'Adol 500mg Tablets',
    quantity: 80,
    unit: 'شريط',
    urgency: 'high',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  const match1 = evaluateClinicalDrugMatch(offer1, request1);
  assert(match1 !== null, 'Panadol 500mg vs Adol 500mg produces a clinical match');
  assert(match1?.clinicalMatchKind === 'exact_clinical', 'Panadol 500mg vs Adol 500mg is exact_clinical');
  assert(match1?.isSameStrength === true, 'Panadol 500mg vs Adol 500mg has same strength (500mg)');
  assert(match1?.isSameDosageForm === true, 'Panadol 500mg vs Adol 500mg has same dosage form (tablets)');

  // Match Case 2: Same active ingredient, different dose (500mg vs 1000mg)
  const offer2: PharmaOffer = {
    id: 'off-test-2',
    entityId: 'ent-1',
    entityName: 'صيدلية النور',
    isFreeText: true,
    freeTextName: 'Augmentin 1g Tablets',
    quantity: 50,
    unit: 'باكت',
    currency: 'YER',
    expiryDate: '2027-01-01',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const request2: PharmaRequest = {
    id: 'req-test-2',
    entityId: 'ent-2',
    entityName: 'مستشفى الثورة',
    isFreeText: true,
    freeTextName: 'Amoclan 625mg Tablets',
    quantity: 50,
    unit: 'باكت',
    urgency: 'medium',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  const match2 = evaluateClinicalDrugMatch(offer2, request2);
  assert(match2 !== null, 'Augmentin 1g vs Amoclan 625mg produces a clinical match');
  assert(match2?.clinicalMatchKind === 'alt_strength', 'Augmentin 1g vs Amoclan 625mg is alt_strength');
  assert(match2?.isSameStrength === false, 'Augmentin 1g vs Amoclan 625mg flags isSameStrength = false');

  // Match Case 3: Same active ingredient, different form (Tablets vs Syrup)
  const offer3: PharmaOffer = {
    id: 'off-test-3',
    entityId: 'ent-1',
    entityName: 'صيدلية النور',
    isFreeText: true,
    freeTextName: 'Paracetamol 500mg Tablets',
    quantity: 50,
    unit: 'شريط',
    currency: 'YER',
    expiryDate: '2027-01-01',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const request3: PharmaRequest = {
    id: 'req-test-3',
    entityId: 'ent-2',
    entityName: 'مستشفى الثورة',
    isFreeText: true,
    freeTextName: 'Paracetamol 120mg/5ml Syrup',
    quantity: 30,
    unit: 'قارورة',
    urgency: 'medium',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  const match3 = evaluateClinicalDrugMatch(offer3, request3);
  assert(match3 !== null, 'Paracetamol Tablets vs Syrup produces match under same active ingredient');
  assert(match3?.isSameDosageForm === false, 'Tablets vs Syrup flags isSameDosageForm = false');

  // Strict Exclusion Case 4: DIFFERENT Active Ingredients -> MUST BE NULL
  const offer4: PharmaOffer = {
    id: 'off-test-4',
    entityId: 'ent-1',
    entityName: 'صيدلية النور',
    isFreeText: true,
    freeTextName: 'Ceftriaxone 1g Injection',
    quantity: 100,
    unit: 'فيال',
    currency: 'YER',
    expiryDate: '2027-01-01',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const request4: PharmaRequest = {
    id: 'req-test-4',
    entityId: 'ent-2',
    entityName: 'مستشفى الثورة',
    isFreeText: true,
    freeTextName: 'Cefotaxime 1g Injection', // Different active ingredient!
    quantity: 100,
    unit: 'فيال',
    urgency: 'high',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  const match4 = evaluateClinicalDrugMatch(offer4, request4);
  assert(match4 === null, 'Ceftriaxone 1g vs Cefotaxime 1g returns NULL (Strict Exclusion for different active ingredient)');

  // Strict Exclusion Case 5: Omeprazole vs Metformin -> MUST BE NULL
  const offer5: PharmaOffer = {
    id: 'off-test-5',
    entityId: 'ent-1',
    entityName: 'صيدلية النور',
    isFreeText: true,
    freeTextName: 'Omeprazole 20mg Capsules',
    quantity: 50,
    unit: 'باكت',
    currency: 'YER',
    expiryDate: '2027-01-01',
    status: 'active',
    createdAt: new Date().toISOString(),
  };

  const request5: PharmaRequest = {
    id: 'req-test-5',
    entityId: 'ent-2',
    entityName: 'مستشفى الثورة',
    isFreeText: true,
    freeTextName: 'Glucophage 500mg Metformin',
    quantity: 50,
    unit: 'باكت',
    urgency: 'medium',
    status: 'open',
    createdAt: new Date().toISOString(),
  };

  const match5 = evaluateClinicalDrugMatch(offer5, request5);
  assert(match5 === null, 'Omeprazole vs Metformin returns NULL (Strict Exclusion for unrelated medicines)');
}

// 5. TEST: Full Market Matching Loop (calculateMarketMatches)
console.log('\n--- Test Suite 5: Market Matching Loop (calculateMarketMatches) ---');
{
  const sampleOffers: PharmaOffer[] = [
    {
      id: 'off-p1',
      entityId: 'ent-sanaa-1',
      entityName: 'صيدلية صنعاء الحديثة',
      isFreeText: true,
      freeTextName: 'Panadol Extra 500mg',
      quantity: 100,
      unit: 'شريط',
      currency: 'YER',
      expiryDate: '2027-01-01',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'off-p2',
      entityId: 'ent-aden-1',
      entityName: 'مستودع عدن للأدوية',
      isFreeText: true,
      freeTextName: 'Augmentin 1g',
      quantity: 50,
      unit: 'باكت',
      currency: 'YER',
      expiryDate: '2027-01-01',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
    {
      id: 'off-p3',
      entityId: 'ent-taiz-1',
      entityName: 'صيدلية تعز',
      isFreeText: true,
      freeTextName: 'Ciprofloxacin 500mg',
      quantity: 30,
      unit: 'باكت',
      currency: 'YER',
      expiryDate: '2027-01-01',
      status: 'active',
      createdAt: new Date().toISOString(),
    },
  ];

  const sampleRequests: PharmaRequest[] = [
    // Matches off-p1 (Paracetamol)
    {
      id: 'req-r1',
      entityId: 'ent-sanaa-2',
      entityName: 'مستشفى الثورة بصنعاء',
      isFreeText: true,
      freeTextName: 'Adol 500mg',
      quantity: 80,
      unit: 'شريط',
      urgency: 'high',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
    // Matches off-p2 (Amoxicillin + Clavulanic acid)
    {
      id: 'req-r2',
      entityId: 'ent-aden-2',
      entityName: 'صيدلية السلام بعدن',
      isFreeText: true,
      freeTextName: 'Amoclan 625mg',
      quantity: 40,
      unit: 'باكت',
      urgency: 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
    // Request with no active ingredient match (Metformin)
    {
      id: 'req-r3',
      entityId: 'ent-sanaa-3',
      entityName: 'مجمع آزال الطبي',
      isFreeText: true,
      freeTextName: 'Glucophage 850mg Metformin',
      quantity: 60,
      unit: 'باكت',
      urgency: 'medium',
      status: 'open',
      createdAt: new Date().toISOString(),
    },
  ];

  const results = calculateMarketMatches(sampleOffers, sampleRequests);
  
  assert(results.length === 2, `Expected exactly 2 matches, got ${results.length}`);
  
  const paracetamolMatch = results.find(m => m.offerId === 'off-p1' && m.requestId === 'req-r1');
  assert(Boolean(paracetamolMatch), 'Panadol Extra matched with Adol under Paracetamol');
  
  const augmentinMatch = results.find(m => m.offerId === 'off-p2' && m.requestId === 'req-r2');
  assert(Boolean(augmentinMatch), 'Augmentin matched with Amoclan under Amoxicillin + Clavulanic acid');

  const metforminMatch = results.find(m => m.requestId === 'req-r3');
  assert(!metforminMatch, 'Glucophage (Metformin) correctly yielded 0 matches because no metformin offer exists');
}

console.log('\n======================================================');
console.log(`📊 Test Results: Passed: ${passed} | Failed: ${failed}`);
console.log('======================================================\n');

if (failed > 0) {
  process.exit(1);
} else {
  console.log('🎉 All Clinical Matching Engine tests completed successfully!');
  process.exit(0);
}
