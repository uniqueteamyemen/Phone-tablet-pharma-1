import { 
  PharmaEntity, 
  PharmaOffer, 
  PharmaRequest, 
  PharmaMatch, 
  PharmaCatalogDrug, 
  INITIAL_NEML_CATALOG,
  DeliveryCourierPartner,
  EarlyWarningShortageAlert
} from '../types/pharmayemen';
import { getMedicineSearchMatch, rankMedicinesBySearch, normalizeMedicineSearch } from '../medicineSearch';
import { evaluateClinicalDrugMatch } from './pharmaClinicalMatcher';

const ENTITY_STORAGE_KEY = 'pharmayemen_entity_v2';
const ENTITIES_LIST_STORAGE_KEY = 'pharmayemen_entities_list_v4';
const OFFERS_STORAGE_KEY = 'pharmayemen_offers_v4';
const REQUESTS_STORAGE_KEY = 'pharmayemen_requests_v4';
const MATCHES_STORAGE_KEY = 'pharmayemen_matches_v2';
const CUSTOM_DRUGS_STORAGE_KEY = 'pharmayemen_custom_drugs_v1';

// Initial Demo Entities list with Trust Scores & Ratings
export const INITIAL_ENTITIES_LIST: PharmaEntity[] = [
  {
    id: 'ent-106',
    name: 'مهذب للمنتجات الطبيعية والعناية',
    type: 'individual_supplier',
    licenseNumber: 'YE-SAN-NAT-772',
    governorate: 'صنعاء',
    city: 'السبعين',
    address: 'شارع السبعين - بالقرب من مركز العناية',
    phone: '+967 771 234 567',
    status: 'verified',
    trustScore: 97,
    successfulMatchesCount: 14,
    rating: 4.9,
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
    isPhoneVerified: true,
  },
  {
    id: 'ent-107',
    name: 'سعيد - تاجر وموزع مستحضرات تجميل',
    type: 'individual_supplier',
    licenseNumber: 'YE-ADN-COS-309',
    governorate: 'عدن',
    city: 'المنصورة',
    address: 'شارع الكثيري - المنصورة',
    phone: '+967 733 556 778',
    status: 'verified',
    trustScore: 94,
    successfulMatchesCount: 8,
    rating: 4.8,
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
    isPhoneVerified: true,
  },
  {
    id: 'ent-101',
    name: 'صيدلية النور الحديثة - صنعاء',
    type: 'pharmacy',
    licenseNumber: 'YE-SAN-2024-8841',
    governorate: 'صنعاء',
    city: 'أمانة العاصمة',
    address: 'شارع الزبيري - جولة كنتاكي',
    phone: '+967 777 123 456',
    status: 'verified',
    trustScore: 98,
    successfulMatchesCount: 19,
    rating: 4.9,
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ent-102',
    name: 'مستودع الشفاء الدوائي - عدن',
    type: 'distributor',
    licenseNumber: 'YE-ADN-2023-4412',
    governorate: 'عدن',
    city: 'المنصورة',
    address: 'شارع التسعين - قرب مجمع الشفاء',
    phone: '+967 733 987 654',
    status: 'verified',
    trustScore: 95,
    successfulMatchesCount: 34,
    rating: 4.8,
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ent-103',
    name: 'صيدلية الأمل التخصصية - تعز',
    type: 'pharmacy',
    licenseNumber: 'YE-TAZ-2024-1109',
    governorate: 'تعز',
    city: 'صالة',
    address: 'شارع جمال - مقابل مستشفى الثورة',
    phone: '+967 711 456 789',
    status: 'verified',
    trustScore: 92,
    successfulMatchesCount: 11,
    rating: 4.7,
    subscriptionPlan: 'free',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ent-104',
    name: 'مستشفى الثورة العام - تعز',
    type: 'hospital',
    licenseNumber: 'YE-TAZ-GOV-001',
    governorate: 'تعز',
    city: 'وسط المدينة',
    address: 'حي الثورة',
    phone: '+967 04 221 000',
    status: 'verified',
    trustScore: 99,
    successfulMatchesCount: 52,
    rating: 5.0,
    subscriptionPlan: 'enterprise',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'ent-105',
    name: 'مؤسسة يمن كير للأجهزة والمستلزمات الطبية',
    type: 'wholesaler',
    licenseNumber: 'YE-SAN-MED-550',
    governorate: 'صنعاء',
    city: 'حدة',
    address: 'شارع حدة - تقاطع الرويشان',
    phone: '+967 775 554 433',
    status: 'verified',
    trustScore: 96,
    successfulMatchesCount: 23,
    rating: 4.9,
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
  }
];

// Verified Shipping / Courier Partners for Inter-city Drug Transits
export const INITIAL_DELIVERY_PARTNERS: DeliveryCourierPartner[] = [
  {
    id: 'dlv-1',
    name: 'المسرع الطبي للشحن الدوائي المبرد (PharmaExpress)',
    coverageGovernorates: ['صنعاء', 'عدن', 'تعز', 'إب', 'الحديدة', 'حضرموت'],
    phone: '+967 778 880 011',
    whatsapp: '967778880011',
    rating: 4.9,
    deliverySpeed: 'نفس اليوم / خلال 24 ساعة (صناديق مبردة 2-8°C)',
    isVerified: true,
    notes: 'متخصص بنقل أدوية الأورام، الإنسولين، واللقاحات الحساسة للحرارة.',
  },
  {
    id: 'dlv-2',
    name: 'الأمانة للنقل السريع بين المدن',
    coverageGovernorates: ['صنعاء', 'عمران', 'ذمار', 'إب', 'تعز'],
    phone: '+967 733 445 566',
    whatsapp: '967733445566',
    rating: 4.7,
    deliverySpeed: 'خلال 4-12 ساعة',
    isVerified: true,
    notes: 'شحن مستلزمات طبية، أجهزة تشخيص، ولاصقات السكر.',
  },
  {
    id: 'dlv-3',
    name: 'ساعي حضرموت وعدن اللوجستي',
    coverageGovernorates: ['عدن', 'المكلا', 'سيئون', 'شبوة', 'المهرة'],
    phone: '+967 711 223 344',
    whatsapp: '967711223344',
    rating: 4.8,
    deliverySpeed: 'خلال 24-48 ساعة',
    isVerified: true,
    notes: 'تغطية واسعة للمحافظات الشرقية والجنوبية مع إمكانية التوصيل لباب الصيدلية.',
  }
];

// Emergency Early Warning Shortage Alerts (Red Alert Zone)
export const INITIAL_EARLY_WARNING_ALERTS: EarlyWarningShortageAlert[] = [
  {
    id: 'alert-red-1',
    drugName: 'Trastuzumab 440mg (Herceptin) فيال حقن أورام',
    genericName: 'Trastuzumab',
    governorate: 'تعز',
    requestsCountIn48h: 4,
    criticality: 'red_alert',
    estimatedPatientNeed: 'أكثر من 8 مرضى أورام بحاجة عاجلة للجرعة الأسبوعية',
    recommendedAction: 'تنبيه عاجل لكافة وكلاء ومستوردي أدوية الأورام في صنعاء وعدن لتوجيه إرسالية استثنائية لتعز فوراً.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'alert-red-2',
    drugName: 'FreeStyle Libre 2 Sensors (لاصقات قياس السكر المستمر)',
    genericName: 'Continuous Glucose Monitor Sensor',
    governorate: 'صنعاء',
    requestsCountIn48h: 5,
    criticality: 'high_warning',
    estimatedPatientNeed: 'شح شديد لدى مرضى السكري من النوع الأول والأطفال',
    recommendedAction: 'تنبيه موزعي المستلزمات الطبية بتوفير شحنات إضافية مع التحقق من تواريخ الصلاحية.',
    createdAt: new Date(Date.now() - 3600000 * 7).toISOString(),
  },
  {
    id: 'alert-red-3',
    drugName: 'Albumin Human 20% 50ml / 100ml Infusion',
    genericName: 'Albumin Human',
    governorate: 'عدن',
    requestsCountIn48h: 3,
    criticality: 'red_alert',
    estimatedPatientNeed: 'عجز في أقسام العناية المركزة والغسيل الكلوي',
    recommendedAction: 'تنسيق فائض المستشفيات الخاصة مع مستشفيات الطوارئ العامة.',
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  }
];

export const isEntitySubscribed = (entity: PharmaEntity | null | undefined): boolean => {
  if (!entity) return false;
  return entity.subscriptionPlan === 'pro' || entity.subscriptionPlan === 'enterprise';
};

const DEFAULT_ENTITY: PharmaEntity = INITIAL_ENTITIES_LIST[0];

export const loadPharmaEntitiesList = (): PharmaEntity[] => {
  try {
    const raw = localStorage.getItem(ENTITIES_LIST_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
    return INITIAL_ENTITIES_LIST;
  } catch {
    return INITIAL_ENTITIES_LIST;
  }
};

export const savePharmaEntitiesList = (entities: PharmaEntity[]): void => {
  try {
    localStorage.setItem(ENTITIES_LIST_STORAGE_KEY, JSON.stringify(entities));
  } catch (e) {
    console.error('Error saving entities list', e);
  }
};

export const loadPharmaEntity = (): PharmaEntity => {
  try {
    const raw = localStorage.getItem(ENTITY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : DEFAULT_ENTITY;
  } catch {
    return DEFAULT_ENTITY;
  }
};

export const savePharmaEntity = (entity: PharmaEntity): void => {
  try {
    localStorage.setItem(ENTITY_STORAGE_KEY, JSON.stringify(entity));
    const currentList = loadPharmaEntitiesList();
    const index = currentList.findIndex((e) => e.id === entity.id);
    if (index >= 0) {
      currentList[index] = entity;
    } else {
      currentList.unshift(entity);
    }
    savePharmaEntitiesList(currentList);
  } catch (e) {
    console.error('Error saving entity', e);
  }
};

// Initial Demo Offers (Supply Signals including Non-Registered & Medical Devices)
const INITIAL_OFFERS: PharmaOffer[] = [
  {
    id: 'off-mohathab-1',
    entityId: 'ent-106',
    entityName: 'مهذب للمنتجات الطبيعية والعناية',
    isFreeText: true,
    freeTextName: 'عسل تقشير هندي أصلي لتفتيح البشرة وتجديد الخلايا',
    brandName: 'Indian Herbal Peeling Honey (150ml)',
    category: 'عناية جلدية وتجميل علاجي',
    categoryType: 'skincare_cosmetics',
    quantity: 35,
    unit: 'علبة (Jar 150ml)',
    price: 4800,
    currency: 'YER',
    expiryDate: '2028-08-30',
    needsDelivery: true,
    acknowledgedResponsibility: true,
    status: 'active',
    notes: 'مستحضر طبيعي هندي فاخر لتقشير الوجه وإزالة الكلف والتصبغات، متوفر بكميات للجملة والقطاعي.',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'off-1',
    entityId: 'ent-101',
    entityName: 'صيدلية النور الحديثة - صنعاء',
    drugId: 'neml-1',
    isFreeText: false,
    genericName: 'Amoxicillin + Clavulanic acid',
    brandName: 'Augmentin 1g / Klamentin',
    category: 'ANTI-INFECTIVE MEDICINES',
    categoryType: 'medicine',
    quantity: 50,
    unit: 'باكت (Box)',
    price: 3200,
    currency: 'YER',
    batchNumber: 'BT-8841',
    expiryDate: '2027-06-30',
    needsDelivery: true,
    deliveryNotes: 'يمكن الشحن عبر المسرع الطبي لكافة المحافظات',
    acknowledgedResponsibility: true,
    status: 'active',
    notes: 'متوفر بكميات ممتازة من الوكيل مع تخزين مثالي',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: 'off-2',
    entityId: 'ent-102',
    entityName: 'مستودع الشفاء الدوائي - عدن',
    drugId: 'neml-12',
    isFreeText: false,
    genericName: 'Paracetamol',
    brandName: 'Adol 500mg (Yedco / Shaphaco)',
    category: 'ANALGESICS, ANTIPYRETICS, NSAIDS',
    categoryType: 'medicine',
    quantity: 200,
    unit: 'شريط (Strip)',
    price: 250,
    currency: 'YER',
    batchNumber: 'YD-2024',
    expiryDate: '2028-01-15',
    acknowledgedResponsibility: true,
    status: 'active',
    notes: 'إنتاج محلي يمني عالي الجودة',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'off-3',
    entityId: 'ent-105',
    entityName: 'مؤسسة يمن كير للأجهزة والمستلزمات الطبية',
    isFreeText: true,
    freeTextName: 'FreeStyle Libre 2 Sensors (لاصقات قياس السكر بالذراع)',
    brandName: 'Abbott FreeStyle Libre 2',
    category: 'أجهزة ومستلزمات تشخيصية',
    categoryType: 'diagnostic_tool',
    quantity: 15,
    unit: 'قطعة / لاصقة (Sensor)',
    price: 45000,
    currency: 'YER',
    expiryDate: '2027-09-30',
    needsDelivery: true,
    acknowledgedResponsibility: true,
    status: 'active',
    notes: 'أصلية وارد وكالة، صالحة لمدة 14 يوماً لكل مجس وتعمل مع تطبيقات الهواتف الذكية.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'off-4',
    entityId: 'ent-101',
    entityName: 'صيدلية النور الحديثة - صنعاء',
    isFreeText: true,
    freeTextName: 'Orlistat 120mg كبسولات دايت وتخسيس طبية',
    brandName: 'Xenical / QuickSlim',
    category: 'دايت ومكملات علاجية',
    categoryType: 'diet_nutrition',
    quantity: 25,
    unit: 'باكت (Box)',
    price: 6500,
    currency: 'YER',
    expiryDate: '2027-11-30',
    acknowledgedResponsibility: true,
    status: 'active',
    notes: 'مرخصة وتعمل على تقليل امتصاص الدهون الغذائية.',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'off-5',
    entityId: 'ent-103',
    entityName: 'صيدلية الأمل التخصصية - تعز',
    isFreeText: true,
    freeTextName: 'سيروم نياسيناميد 10% + زنك 1% المعالج للبشرة وحب الشباب',
    brandName: 'The Ordinary Niacinamide 10%',
    category: 'عناية جلدية وتجميل علاجي',
    categoryType: 'skincare_cosmetics',
    quantity: 12,
    unit: 'عبوة (Bottle 30ml)',
    price: 7000,
    currency: 'YER',
    expiryDate: '2028-03-31',
    acknowledgedResponsibility: true,
    status: 'active',
    notes: 'أصلي 100% مستورد من كندا، مناسب للبشرة المعرضة للحبوب والتصبغات.',
    createdAt: new Date(Date.now() - 3600000 * 18).toISOString(),
  },
];

// Initial Demo Requests (Demand signals)
const INITIAL_REQUESTS: PharmaRequest[] = [
  {
    id: 'req-saeed-1',
    entityId: 'ent-107',
    entityName: 'سعيد - تاجر وموزع مستحضرات تجميل',
    isFreeText: true,
    freeTextName: 'عسل تقشير أعشاب طبيعية للوجه والجسم',
    brandName: 'Herbal Face Peeling Honey',
    category: 'عناية جلدية وتجميل علاجي',
    categoryType: 'skincare_cosmetics',
    quantity: 15,
    unit: 'علبة (Jar)',
    urgency: 'medium',
    needsDelivery: true,
    acknowledgedResponsibility: true,
    status: 'open',
    notes: 'مطلوب كمية 15 علبة عسل تقشير طبيعي للبشرة لطلبيات زبائن في عدن.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'req-1',
    entityId: 'ent-104',
    entityName: 'مستشفى الثورة العام - تعز',
    drugId: 'neml-1',
    isFreeText: false,
    genericName: 'Amoxicillin + Clavulanic acid',
    category: 'ANTI-INFECTIVE MEDICINES',
    categoryType: 'medicine',
    quantity: 100,
    unit: 'باكت (Box)',
    urgency: 'high',
    needsDelivery: true,
    acknowledgedResponsibility: true,
    status: 'open',
    notes: 'احتياج طارئ لقسم الرقود والعناية',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'req-2',
    entityId: 'ent-104',
    entityName: 'مستشفى الثورة العام - تعز',
    isFreeText: true,
    freeTextName: 'Trastuzumab 440mg فيال حقن أورام الثدي',
    brandName: 'Herceptin / Ogivri',
    category: 'أدوية أورام ومناعة',
    categoryType: 'oncology',
    quantity: 6,
    unit: 'فيال (Vial)',
    urgency: 'critical',
    needsDelivery: true,
    deliveryNotes: 'يلزم شحن مبرد بدرجة حرارة 2-8 مئوية حصراً',
    acknowledgedResponsibility: true,
    status: 'open',
    notes: 'حاجة إنقاذ حياة عاجلة لمريضتين في مركز الأورام بتعز، نرجو من أي صيدلية أو مستودع لديه الصنف إشعارنا فوراً.',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'req-3',
    entityId: 'ent-103',
    entityName: 'صيدلية الأمل التخصصية - تعز',
    isFreeText: true,
    freeTextName: 'FreeStyle Libre 2 Sensors (لاصقات قياس السكر بالذراع)',
    category: 'أجهزة ومستلزمات تشخيصية',
    categoryType: 'diagnostic_tool',
    quantity: 10,
    unit: 'قطعة (Sensor)',
    urgency: 'high',
    needsDelivery: true,
    acknowledgedResponsibility: true,
    status: 'open',
    notes: 'مطلوب لمرضى سكري أطفال منقطعة عنهم اللاصقات منذ أسبوعين.',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: 'req-4',
    entityId: 'ent-101',
    entityName: 'صيدلية النور الحديثة - صنعاء',
    isFreeText: true,
    freeTextName: 'Ceftriaxone 1g Vial IV/IM',
    category: 'ANTI-INFECTIVE MEDICINES',
    categoryType: 'medicine',
    quantity: 40,
    unit: 'فيال (Vial)',
    urgency: 'critical',
    acknowledgedResponsibility: true,
    status: 'open',
    notes: 'مطلوب بصورة عاجلة جداً لنقص حاد بالسوق',
    createdAt: new Date(Date.now() - 3600000 * 6).toISOString(),
  },
];

export const loadPharmaCatalog = (): PharmaCatalogDrug[] => {
  try {
    if (typeof localStorage === 'undefined') return INITIAL_NEML_CATALOG;
    const raw = localStorage.getItem(CUSTOM_DRUGS_STORAGE_KEY);
    if (!raw) return INITIAL_NEML_CATALOG;
    const customList = JSON.parse(raw);
    if (Array.isArray(customList) && customList.length > 0) {
      // Merge custom approved drugs with initial catalog
      return [...INITIAL_NEML_CATALOG, ...customList];
    }
    return INITIAL_NEML_CATALOG;
  } catch {
    return INITIAL_NEML_CATALOG;
  }
};

export const savePharmaCatalog = (customDrugs: PharmaCatalogDrug[]): void => {
  try {
    if (typeof localStorage === 'undefined') return;
    localStorage.setItem(CUSTOM_DRUGS_STORAGE_KEY, JSON.stringify(customDrugs));
  } catch (e) {
    console.error('Error saving custom drugs catalog', e);
  }
};

export const loadPharmaOffers = (): PharmaOffer[] => {
  try {
    const raw = localStorage.getItem(OFFERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_OFFERS;
  } catch {
    return INITIAL_OFFERS;
  }
};

export const savePharmaOffers = (offers: PharmaOffer[]): void => {
  try {
    localStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
  } catch (e) {
    console.error('Error saving offers', e);
  }
};

export const loadPharmaRequests = (): PharmaRequest[] => {
  try {
    const raw = localStorage.getItem(REQUESTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : INITIAL_REQUESTS;
  } catch {
    return INITIAL_REQUESTS;
  }
};

export const savePharmaRequests = (requests: PharmaRequest[]): void => {
  try {
    localStorage.setItem(REQUESTS_STORAGE_KEY, JSON.stringify(requests));
  } catch (e) {
    console.error('Error saving requests', e);
  }
};

// Automatic Match Engine: Matches active offers with open requests with strict Active Ingredient & Clinical compatibility
export const calculateMarketMatches = (offers: PharmaOffer[], requests: PharmaRequest[]): PharmaMatch[] => {
  const matches: PharmaMatch[] = [];

  const activeOffers = offers.filter((o) => o.status === 'active');
  const openRequests = requests.filter((r) => r.status === 'open');

  if (activeOffers.length === 0 || openRequests.length === 0) {
    return matches;
  }

  const catalog = loadPharmaCatalog();

  for (const req of openRequests) {
    for (const off of activeOffers) {
      // Prevent self-matching across the same pharmacy/entity
      if (req.entityId && off.entityId && req.entityId === off.entityId) {
        continue;
      }

      // STRICT CLINICAL EVALUATION:
      // If Active Ingredient is DIFFERENT => returns null (NO MATCH / تطابق منعدم).
      const clinicalMatch = evaluateClinicalDrugMatch(off, req, catalog);

      if (clinicalMatch) {
        matches.push(clinicalMatch);
      }
    }
  }

  return matches;
};

// Check and mark expired offers/requests (7 days lifetime policy)
export const checkAndApply7DaysExpiry = <T extends PharmaOffer | PharmaRequest>(items: T[]): { items: T[]; expiredCount: number } => {
  const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;
  const now = Date.now();
  let expiredCount = 0;

  const updated = items.map((item) => {
    if ((item.status === 'active' || item.status === 'open') && item.createdAt) {
      const createdTime = new Date(item.createdAt).getTime();
      if (!isNaN(createdTime) && now - createdTime > SEVEN_DAYS_MS) {
        expiredCount++;
        return {
          ...item,
          status: item.status === 'active' ? 'expired' : 'closed',
          notes: item.notes ? `${item.notes} (انتهت صلاحية الإشارة تلقائياً بعد 7 أيام)` : 'انتهت صلاحية الإشارة تلقائياً بعد 7 أيام',
        };
      }
    }
    return item;
  });

  return { items: updated, expiredCount };
};
