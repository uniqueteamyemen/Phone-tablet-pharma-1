import { PharmaOffer, PharmaRequest, PharmaMatch, PharmaCatalogDrug, INITIAL_NEML_CATALOG } from '../types/pharmayemen';
import { normalizeMedicineSearch } from '../medicineSearch';

// Standardized Dosage Form Categories
export type DosageFormCategory = 
  | 'tablets'
  | 'capsules'
  | 'syrup'
  | 'injection'
  | 'topical'
  | 'drops'
  | 'inhaler'
  | 'suppository'
  | 'other';

export const DOSAGE_FORM_LABELS: Record<DosageFormCategory, { ar: string; en: string }> = {
  tablets: { ar: 'أقراص / حبوب', en: 'Tablets' },
  capsules: { ar: 'كبسولات', en: 'Capsules' },
  syrup: { ar: 'شراب / معلق', en: 'Syrup / Suspension' },
  injection: { ar: 'حقن / فيال / أمبولات', en: 'Injection / Vial' },
  topical: { ar: 'مرهم / كريم / موضعي', en: 'Ointment / Cream' },
  drops: { ar: 'قطرة (عيون/أذن/أنف)', en: 'Drops' },
  inhaler: { ar: 'بخاخ / رذاذ تنفسي', en: 'Inhaler / Spray' },
  suppository: { ar: 'تحاميل / لبوس', en: 'Suppositories' },
  other: { ar: 'هيئة دوائية عامة', en: 'General' },
};

// Known Brand-to-Generic Canonical Dictionary
const BRAND_TO_GENERIC_MAP: Record<string, { genericEn: string; genericAr: string }> = {
  // Paracetamol
  panadol: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  adol: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  calpol: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  fevadol: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  paramol: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  tylenol: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  cetamol: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  بنادول: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  ادول: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  فيفادول: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },
  باراسيتامول: { genericEn: 'Paracetamol', genericAr: 'باراسيتامول' },

  // Amoxicillin + Clavulanate
  augmentin: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  curam: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  megamox: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  klavox: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  amoclan: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  julmentin: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  اوجمنتين: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  كيرام: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  ميجاموكس: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },
  كلافوكس: { genericEn: 'Amoxicillin + Clavulanic Acid', genericAr: 'أموكسيسيلين + حمض الكلافولانيك' },

  // Amoxicillin Plain
  amoxil: { genericEn: 'Amoxicillin', genericAr: 'أموكسيسيلين' },
  biomox: { genericEn: 'Amoxicillin', genericAr: 'أموكسيسيلين' },
  hiconcil: { genericEn: 'Amoxicillin', genericAr: 'أموكسيسيلين' },
  moxilen: { genericEn: 'Amoxicillin', genericAr: 'أموكسيسيلين' },
  amoxydar: { genericEn: 'Amoxicillin', genericAr: 'أموكسيسيلين' },
  اموكسيل: { genericEn: 'Amoxicillin', genericAr: 'أموكسيسيلين' },
  اموكسيسيلين: { genericEn: 'Amoxicillin', genericAr: 'أموكسيسيلين' },

  // Ibuprofen
  brufen: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },
  profen: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },
  advil: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },
  motrin: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },
  ibugesic: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },
  بروفين: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },
  بروفينال: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },
  ايبوبروفين: { genericEn: 'Ibuprofen', genericAr: 'إيبوبروفين' },

  // Diclofenac
  voltaren: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },
  cataflam: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },
  olfen: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },
  voveran: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },
  diclogesic: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },
  فولتارين: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },
  كتافلام: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },
  ديكلوفيناك: { genericEn: 'Diclofenac', genericAr: 'ديكلوفيناك' },

  // Ciprofloxacin
  ciprodar: { genericEn: 'Ciprofloxacin', genericAr: 'سيبروفلوكساسين' },
  ciprocin: { genericEn: 'Ciprofloxacin', genericAr: 'سيبروفلوكساسين' },
  cipro: { genericEn: 'Ciprofloxacin', genericAr: 'سيبروفلوكساسين' },
  ciflox: { genericEn: 'Ciprofloxacin', genericAr: 'سيبروفلوكساسين' },
  سيبرودار: { genericEn: 'Ciprofloxacin', genericAr: 'سيبروفلوكساسين' },
  سيبروسين: { genericEn: 'Ciprofloxacin', genericAr: 'سيبروفلوكساسين' },
  سيبروفلوكساسين: { genericEn: 'Ciprofloxacin', genericAr: 'سيبروفلوكساسين' },

  // Azithromycin
  zithromax: { genericEn: 'Azithromycin', genericAr: 'أزيثرومايسين' },
  azomycin: { genericEn: 'Azithromycin', genericAr: 'أزيثرومايسين' },
  azitrom: { genericEn: 'Azithromycin', genericAr: 'أزيثرومايسين' },
  زيثروماكس: { genericEn: 'Azithromycin', genericAr: 'أزيثرومايسين' },
  ازوميسين: { genericEn: 'Azithromycin', genericAr: 'أزيثرومايسين' },
  ازيثرومايسين: { genericEn: 'Azithromycin', genericAr: 'أزيثرومايسين' },

  // Metformin
  glucophage: { genericEn: 'Metformin', genericAr: 'ميتفورمين' },
  metfor: { genericEn: 'Metformin', genericAr: 'ميتفورمين' },
  جلوكوفاج: { genericEn: 'Metformin', genericAr: 'ميتفورمين' },
  ميتفورمين: { genericEn: 'Metformin', genericAr: 'ميتفورمين' },

  // Omeprazole
  losec: { genericEn: 'Omeprazole', genericAr: 'أوميبرازول' },
  gasec: { genericEn: 'Omeprazole', genericAr: 'أوميبرازول' },
  omez: { genericEn: 'Omeprazole', genericAr: 'أوميبرازول' },
  hyposec: { genericEn: 'Omeprazole', genericAr: 'أوميبرازول' },
  لوسيك: { genericEn: 'Omeprazole', genericAr: 'أوميبرازول' },
  جاسيك: { genericEn: 'Omeprazole', genericAr: 'أوميبرازول' },
  اوميبرازول: { genericEn: 'Omeprazole', genericAr: 'أوميبرازول' },

  // Esomeprazole
  nexium: { genericEn: 'Esomeprazole', genericAr: 'إيزوميبرازول' },
  نيكسيوم: { genericEn: 'Esomeprazole', genericAr: 'إيزوميبرازول' },
  ايزوميبرازول: { genericEn: 'Esomeprazole', genericAr: 'إيزوميبرازول' },

  // Ceftriaxone
  ceftriaxone: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },
  rocephin: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },
  cefaxone: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },
  mesporin: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },
  روسيفين: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },
  سيفترياكسون: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },
  سفترياكسون: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },
  سفترياكس: { genericEn: 'Ceftriaxone', genericAr: 'سيفترياكسون' },

  // Cefotaxime
  cefotaxime: { genericEn: 'Cefotaxime', genericAr: 'سيفوتاكسيم' },
  claforan: { genericEn: 'Cefotaxime', genericAr: 'سيفوتاكسيم' },
  سيفوتاكسيم: { genericEn: 'Cefotaxime', genericAr: 'سيفوتاكسيم' },
  سفوتاكسيم: { genericEn: 'Cefotaxime', genericAr: 'سيفوتاكسيم' },
  كلافوران: { genericEn: 'Cefotaxime', genericAr: 'سيفوتاكسيم' },

  // Bisoprolol
  concor: { genericEn: 'Bisoprolol', genericAr: 'بيسوبرولول' },
  bisotens: { genericEn: 'Bisoprolol', genericAr: 'بيسوبرولول' },
  كونكور: { genericEn: 'Bisoprolol', genericAr: 'بيسوبرولول' },
  بيسوبرولول: { genericEn: 'Bisoprolol', genericAr: 'بيسوبرولول' },

  // Atorvastatin
  lipitor: { genericEn: 'Atorvastatin', genericAr: 'أتورفاستاتين' },
  atorva: { genericEn: 'Atorvastatin', genericAr: 'أتورفاستاتين' },
  ليبيتور: { genericEn: 'Atorvastatin', genericAr: 'أتورفاستاتين' },
  اتورفاستاتين: { genericEn: 'Atorvastatin', genericAr: 'أتورفاستاتين' },

  // Salbutamol
  ventolin: { genericEn: 'Salbutamol', genericAr: 'سالبوتامول' },
  butalin: { genericEn: 'Salbutamol', genericAr: 'سالبوتامول' },
  فينتولين: { genericEn: 'Salbutamol', genericAr: 'سالبوتامول' },
  سالبوتامول: { genericEn: 'Salbutamol', genericAr: 'سالبوتامول' },

  // Metronidazole
  flagyl: { genericEn: 'Metronidazole', genericAr: 'ميترونيدازول' },
  فلاجيل: { genericEn: 'Metronidazole', genericAr: 'ميترونيدازول' },
  ميترونيدازول: { genericEn: 'Metronidazole', genericAr: 'ميترونيدازول' },
};

/**
 * Extracts and cleans the active ingredient (Generic Name) from any drug string or record
 */
export const resolveActiveIngredient = (
  rawName: string,
  catalog: PharmaCatalogDrug[] = INITIAL_NEML_CATALOG
): { genericEn: string; genericAr: string; canonicalKey: string } => {
  if (!rawName || !rawName.trim()) {
    return { genericEn: '', genericAr: '', canonicalKey: '' };
  }

  const norm = normalizeMedicineSearch(rawName);

  // 1. Direct dictionary match
  for (const [brandKey, val] of Object.entries(BRAND_TO_GENERIC_MAP)) {
    const brandNorm = normalizeMedicineSearch(brandKey);
    if (norm.includes(brandNorm) || brandNorm.includes(norm)) {
      return {
        genericEn: val.genericEn,
        genericAr: val.genericAr,
        canonicalKey: normalizeMedicineSearch(val.genericEn),
      };
    }
  }

  // 2. Lookup in NEML Catalog
  for (const catDrug of catalog) {
    const genNorm = normalizeMedicineSearch(catDrug.genericName);
    const brandNorm = catDrug.brandName ? normalizeMedicineSearch(catDrug.brandName) : '';

    if (genNorm && (norm.includes(genNorm) || genNorm.includes(norm))) {
      return {
        genericEn: catDrug.genericName,
        genericAr: catDrug.genericNameAr || catDrug.genericName,
        canonicalKey: genNorm,
      };
    }

    if (brandNorm && (norm.includes(brandNorm) || brandNorm.includes(norm))) {
      return {
        genericEn: catDrug.genericName,
        genericAr: catDrug.genericNameAr || catDrug.genericName,
        canonicalKey: genNorm,
      };
    }
  }

  // 3. Fallback: Strip dosage & strength tokens to keep the pure active name
  const stripped = norm
    .replace(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|iu|%|units?)\b/gi, '')
    .replace(/\b(?:tablet|tablets|tab|capsule|capsules|cap|syrup|syp|suspension|susp|inj|injection|vial|amp|cream|gel|ointment|drops|spray)\b/gi, '')
    .replace(/\s+/g, ' ')
    .trim();

  return {
    genericEn: rawName.trim(),
    genericAr: rawName.trim(),
    canonicalKey: stripped || norm,
  };
};

/**
 * Extracts and normalizes strength / dose from a string (e.g., "500mg", "1g", "250mg/5ml")
 */
export const extractDrugStrength = (rawInput?: string): string => {
  if (!rawInput) return '';
  const match = String(rawInput).match(/\b\d+(?:\.\d+)?\s*(?:mg|mcg|µg|g|ml|iu|i\.?u\.?|%|units?)(?:\/\d*(?:ml|g))?\b/i);
  if (match) {
    return match[0].toLowerCase().replace(/\s+/g, '');
  }
  // Also match standalone numbers if preceded or followed by standard units
  const numMatch = String(rawInput).match(/\b\d+(?:\.\d+)?\s*(?:ملغم|مجم|جرام|جم|مل|وحدة)\b/i);
  if (numMatch) {
    return numMatch[0].trim();
  }
  return '';
};

/**
 * Normalizes strength for comparison (e.g. 1000mg == 1g)
 */
export const isSameStrengthValues = (s1?: string, s2?: string): boolean => {
  if (!s1 || !s2) return true; // If one is not specified, do not reject
  const clean1 = s1.toLowerCase().replace(/\s+/g, '');
  const clean2 = s2.toLowerCase().replace(/\s+/g, '');
  if (clean1 === clean2) return true;

  // Convert 1g <-> 1000mg
  if ((clean1 === '1g' && clean2 === '1000mg') || (clean1 === '1000mg' && clean2 === '1g')) return true;
  if ((clean1 === '500mg' && clean2 === '0.5g') || (clean1 === '0.5g' && clean2 === '500mg')) return true;
  if ((clean1 === '250mg' && clean2 === '0.25g') || (clean1 === '0.25g' && clean2 === '250mg')) return true;

  return false;
};

/**
 * Classifies dosage form into standard categories
 */
export const extractDosageForm = (text?: string): { category: DosageFormCategory; labelAr: string; labelEn: string } => {
  const getResult = (cat: DosageFormCategory) => ({
    category: cat,
    labelAr: DOSAGE_FORM_LABELS[cat].ar,
    labelEn: DOSAGE_FORM_LABELS[cat].en,
  });

  if (!text) return getResult('other');
  const str = text.toLowerCase();

  if (str.includes('tab') || str.includes('قرص') || str.includes('حبوب') || str.includes('اقراص') || str.includes('tablets') || str.includes('caplet')) {
    return getResult('tablets');
  }
  if (str.includes('cap') || str.includes('كبسول') || str.includes('capsules') || str.includes('capsule')) {
    return getResult('capsules');
  }
  if (str.includes('syr') || str.includes('شراب') || str.includes('معلق') || str.includes('susp') || str.includes('syrup') || str.includes('oral solution')) {
    return getResult('syrup');
  }
  if (str.includes('inj') || str.includes('حقن') || str.includes('امبول') || str.includes('فيال') || str.includes('vial') || str.includes('amp') || str.includes('iv') || str.includes('im')) {
    return getResult('injection');
  }
  if (str.includes('cream') || str.includes('كريم') || str.includes('مرهم') || str.includes('ointment') || str.includes('gel') || str.includes('جل') || str.includes('lotion')) {
    return getResult('topical');
  }
  if (str.includes('drop') || str.includes('قطرة') || str.includes('قطره')) {
    return getResult('drops');
  }
  if (str.includes('spray') || str.includes('بخاخ') || str.includes('رذاذ') || str.includes('inhaler')) {
    return getResult('inhaler');
  }
  if (str.includes('supp') || str.includes('تحاميل') || str.includes('لبوس')) {
    return getResult('suppository');
  }

  return getResult('other');
};

/**
 * STRICT CLINICAL PHARMACOLOGICAL MATCHER:
 * If active ingredient is different => RETURN NULL (No Match / تطابق منعدم).
 * If active ingredient matches => Compares Dose/Strength and Dosage Form and labels clearly.
 */
export const evaluateClinicalDrugMatch = (
  offer: PharmaOffer,
  request: PharmaRequest,
  catalog: PharmaCatalogDrug[] = INITIAL_NEML_CATALOG
): PharmaMatch | null => {
  // 1. Resolve Active Ingredients
  const offerRaw = (offer.genericName || offer.brandName || offer.freeTextName || '').trim();
  const reqRaw = (request.genericName || request.brandName || request.freeTextName || '').trim();

  if (!offerRaw || !reqRaw) return null;

  const offerIngredient = resolveActiveIngredient(offerRaw, catalog);
  const reqIngredient = resolveActiveIngredient(reqRaw, catalog);

  // STRICT SCIENTIFIC RULE: If Active Ingredient canonical key is completely different => NO MATCH
  const key1 = offerIngredient.canonicalKey;
  const key2 = reqIngredient.canonicalKey;

  const isExactGeneric = key1 === key2;
  const isContainedGeneric = key1.length >= 4 && key2.length >= 4 && (key1.includes(key2) || key2.includes(key1));

  // Multi-word token overlap for free-text, natural herbal products, and cosmetics
  const words1 = key1.split(/\s+/).filter((w) => w.length >= 3);
  const words2 = key2.split(/\s+/).filter((w) => w.length >= 3);
  const sharedWords = words1.filter((w) => words2.includes(w));
  const hasSharedCorePhrase = 
    (sharedWords.length >= 2 && sharedWords.join(' ').length >= 6) || 
    (sharedWords.length >= 1 && sharedWords[0].length >= 7);

  if (!isExactGeneric && !isContainedGeneric && !hasSharedCorePhrase) {
    // Different Active Ingredient -> STOPS HERE (NO MATCH)
    return null;
  }

  // 2. Dose & Strength Comparison
  const offStrength = offer.strength || extractDrugStrength(offerRaw);
  const reqStrength = request.strength || extractDrugStrength(reqRaw);
  const isSameStrength = isSameStrengthValues(offStrength, reqStrength);

  // 3. Dosage Form Comparison
  const offForm = extractDosageForm(offerRaw);
  const reqForm = extractDosageForm(reqRaw);
  const isSameDosageForm = offForm.category === 'other' || reqForm.category === 'other' || offForm.category === reqForm.category;

  // 4. Clinical Classification
  let clinicalMatchKind: 'exact_clinical' | 'alt_strength' | 'alt_form' | 'alt_both' = 'exact_clinical';
  let clinicalMatchLabel = 'تطابق سريري تام (نفس المادة، الجرعة والهيئة)';
  let clinicalNotes = 'تطابق كامل في المادة الفعالة والجرعة والشكل الصيدلاني.';

  if (!isSameStrength && !isSameDosageForm) {
    clinicalMatchKind = 'alt_both';
    clinicalMatchLabel = 'تطابق المادة الفعالة (بجرعة وشكل صيدلاني بديل)';
    clinicalNotes = `المادة الفعالة متطابقة (${offerIngredient.genericAr})، مع اختلاف الجرعة (${offStrength || 'غير محدد'} مقابل ${reqStrength || 'غير محدد'}) والشكل (${offForm.labelAr} مقابل ${reqForm.labelAr}).`;
  } else if (!isSameStrength) {
    clinicalMatchKind = 'alt_strength';
    clinicalMatchLabel = 'تطابق المادة الفعالة (بجرعة بديلة)';
    clinicalNotes = `المادة الفعالة متطابقة (${offerIngredient.genericAr})، مع اختلاف تركيز الجرعة: العرض (${offStrength || 'غير محدد'}) ⚠️ الطلب (${reqStrength || 'غير محدد'}).`;
  } else if (!isSameDosageForm) {
    clinicalMatchKind = 'alt_form';
    clinicalMatchLabel = 'تطابق المادة الفعالة (بهيئة صيدلانية بديلة)';
    clinicalNotes = `المادة الفعالة متطابقة (${offerIngredient.genericAr})، مع اختلاف الهيئة: العرض (${offForm.labelAr}) ⚠️ الطلب (${reqForm.labelAr}).`;
  }

  const activeIngredient = offerIngredient.genericEn;
  const activeIngredientAr = offerIngredient.genericAr;

  return {
    id: `match-${offer.id}-${request.id}`,
    offerId: offer.id,
    requestId: request.id,
    drugName: activeIngredient || offerRaw,
    activeIngredient,
    activeIngredientAr,
    offeringEntity: offer.entityName,
    requestingEntity: request.entityName,
    offerQuantity: offer.quantity,
    requestQuantity: request.quantity,
    matchType: 'clinical',
    createdAt: new Date().toISOString(),
    status: 'new',
    offerStrength: offStrength,
    requestStrength: reqStrength,
    isSameStrength,
    offerDosageForm: offForm.labelAr,
    requestDosageForm: reqForm.labelAr,
    isSameDosageForm,
    clinicalMatchKind,
    clinicalMatchLabel,
    clinicalNotes,
  };
};
