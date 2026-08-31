import { PharmaEntity, PharmaOffer, PharmaRequest, PharmaMatch, PharmaCatalogDrug, INITIAL_NEML_CATALOG } from '../types/pharmayemen';
import { getMedicineSearchMatch, rankMedicinesBySearch, normalizeMedicineSearch } from '../medicineSearch';
import { evaluateClinicalDrugMatch } from './pharmaClinicalMatcher';

const ENTITY_STORAGE_KEY = 'pharmayemen_entity_v1';
const ENTITIES_LIST_STORAGE_KEY = 'pharmayemen_entities_list_v2';
const OFFERS_STORAGE_KEY = 'pharmayemen_offers_v1';
const REQUESTS_STORAGE_KEY = 'pharmayemen_requests_v1';
const MATCHES_STORAGE_KEY = 'pharmayemen_matches_v1';
const CUSTOM_DRUGS_STORAGE_KEY = 'pharmayemen_custom_drugs_v1';

// Initial Demo Entities list (User can add their own pharmacy, hospital or warehouse anytime)
export const INITIAL_ENTITIES_LIST: PharmaEntity[] = [
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
    subscriptionPlan: 'pro',
    createdAt: new Date().toISOString(),
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
    // Also ensure it is present/updated in the full entities list
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

// Initial Demo Offers (Market Supply signals)
const INITIAL_OFFERS: PharmaOffer[] = [
  {
    id: 'off-1',
    entityId: 'ent-101',
    entityName: 'صيدلية النور الحديثة - صنعاء',
    drugId: 'neml-1',
    isFreeText: false,
    genericName: 'Amoxicillin + Clavulanic acid',
    brandName: 'Augmentin 1g / Klamentin',
    category: 'ANTI-INFECTIVE MEDICINES',
    quantity: 50,
    unit: 'باكت (Box)',
    price: 3200,
    currency: 'YER',
    batchNumber: 'BT-8841',
    expiryDate: '2027-06-30',
    status: 'active',
    notes: 'متوفر بكميات ممتازة من الوكيل مع خصم للكميات',
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
    quantity: 200,
    unit: 'شريط (Strip)',
    price: 250,
    currency: 'YER',
    batchNumber: 'YD-2024',
    expiryDate: '2028-01-15',
    status: 'active',
    notes: 'منتج محلي يمني عالي الجودة',
    createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
  {
    id: 'off-3',
    entityId: 'ent-103',
    entityName: 'صيدلية الأمل التخصصية - تعز',
    isFreeText: true,
    freeTextName: 'Omeprazole 20mg Capsules',
    category: 'GASTROINTESTINAL MEDICINES',
    quantity: 80,
    unit: 'باكت (Box)',
    price: 1800,
    currency: 'YER',
    expiryDate: '2026-11-30',
    status: 'active',
    notes: 'تاريخ صلاحية مضمون',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

// Initial Demo Requests (Market Demand signals)
const INITIAL_REQUESTS: PharmaRequest[] = [
  {
    id: 'req-1',
    entityId: 'ent-104',
    entityName: 'مستشفى الثورة العام - تعز',
    drugId: 'neml-1',
    isFreeText: false,
    genericName: 'Amoxicillin + Clavulanic acid',
    category: 'ANTI-INFECTIVE MEDICINES',
    quantity: 100,
    unit: 'باكت (Box)',
    urgency: 'high',
    status: 'open',
    notes: 'احتياج طارئ لقسم الرقود والعناية',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: 'req-2',
    entityId: 'ent-105',
    entityName: 'مركز الحياة الخيري - صنعاء',
    drugId: 'neml-12',
    isFreeText: false,
    genericName: 'Paracetamol',
    category: 'ANALGESICS, ANTIPYRETICS, NSAIDS',
    quantity: 150,
    unit: 'شريط (Strip)',
    urgency: 'medium',
    status: 'open',
    notes: 'للصرف المجاني للمرضى المتعففين',
    createdAt: new Date(Date.now() - 3600000 * 8).toISOString(),
  },
  {
    id: 'req-3',
    entityId: 'ent-101',
    entityName: 'صيدلية النور الحديثة - صنعاء',
    isFreeText: true,
    freeTextName: 'Ceftriaxone 1g Vial IV/IM',
    category: 'ANTI-INFECTIVE MEDICINES',
    quantity: 40,
    unit: 'فيال (Vial)',
    urgency: 'critical',
    status: 'open',
    notes: 'مطلوب بصورة عاجلة جداً لنقص حاد بالسوق',
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
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
