import { MedicineSearchRecord } from '../medicineSearch';

export type PharmaSubscriptionPlan = 'free' | 'pro' | 'enterprise';
export type PharmaUserRole = 'admin' | 'pharmacy' | 'visitor';

export type PharmaItemCategoryType = 
  | 'medicine' 
  | 'oncology' 
  | 'chronic' 
  | 'diet_nutrition' 
  | 'skincare_cosmetics' 
  | 'medical_device' 
  | 'diagnostic_tool' 
  | 'other';

export const CATEGORY_TYPE_LABELS: Record<PharmaItemCategoryType, { label: string; icon: string; color: string }> = {
  medicine: { label: 'أدوية عامة وأساسية', icon: '💊', color: 'emerald' },
  oncology: { label: 'أدوية أورام وأمراض نادرة وخبيثة', icon: '🎗️', color: 'rose' },
  chronic: { label: 'أدوية الأمراض المزمنة', icon: '❤️', color: 'sky' },
  diet_nutrition: { label: 'أدوية ومكملات الدايت والتغذية', icon: '🥗', color: 'amber' },
  skincare_cosmetics: { label: 'مستحضرات علاجية وبشرة وتجميل', icon: '✨', color: 'purple' },
  medical_device: { label: 'أجهزة ومستلزمات طبية (قياس ضغط، تنفس، إلخ)', icon: '🩺', color: 'teal' },
  diagnostic_tool: { label: 'لاصقات وشرائط قياس السكر (FreeStyle Libre وغيرها)', icon: '🩹', color: 'indigo' },
  other: { label: 'أصناف ومستلزمات أخرى حرة', icon: '📦', color: 'slate' },
};

export interface DeliveryCourierPartner {
  id: string;
  name: string;
  coverageGovernorates: string[];
  phone: string;
  whatsapp: string;
  rating: number;
  deliverySpeed: string;
  isVerified: boolean;
  notes: string;
}

export interface EarlyWarningShortageAlert {
  id: string;
  drugName: string;
  genericName?: string;
  governorate: string;
  requestsCountIn48h: number;
  criticality: 'red_alert' | 'high_warning';
  estimatedPatientNeed: string;
  recommendedAction: string;
  createdAt: string;
}

export interface PharmaStockAlert {
  id: string;
  entityId: string;
  entityName: string;
  drugName: string;
  genericName?: string;
  brandName?: string;
  type: 'near_expiry' | 'stagnant_stock' | 'market_shortage' | 'price_disruption';
  severity: 'low' | 'medium' | 'high' | 'critical';
  quantity: number;
  unit: string;
  expiryDate?: string;
  daysUntilExpiry?: number;
  governorate?: string;
  recommendedAction: string;
  isProOnly: boolean;
  createdAt: string;
}

export interface SocialBroadcastPayload {
  id?: string;
  type: 'offer' | 'request' | 'urgent_shortage';
  drugName: string;
  genericName?: string;
  brandName?: string;
  strength?: string;
  quantity: number;
  unit: string;
  price?: number;
  currency?: string;
  entityName?: string;
  governorate: string;
  phone?: string;
  expiryDate?: string;
  urgency?: string;
  notes?: string;
  categoryType?: PharmaItemCategoryType;
  imageUrl?: string;
  createdAt?: string;
  status?: 'queued' | 'dispatched_simulated';
  directUrl?: string;
  formattedText?: {
    telegram: string;
    facebook: string;
    instagram: string;
    whatsapp: string;
  };
}

export interface PharmaEntity {
  id: string;
  name: string;
  type: 
    | 'pharmacy' 
    | 'hospital' 
    | 'distributor' 
    | 'clinic' 
    | 'wholesaler'
    | 'individual_supplier'
    | 'beauty_skincare'
    | 'supplements_nutrition';
  licenseNumber: string;
  governorate: string;
  city: string;
  address: string;
  phone: string;
  isPhoneVerified?: boolean;
  status: 'verified' | 'pending' | 'rejected';
  trustScore?: number; // 0 - 100%
  successfulMatchesCount?: number;
  rating?: number;
  subscriptionPlan?: PharmaSubscriptionPlan;
  subscriptionExpiresAt?: string;
  createdAt: string;
}

export interface PharmaOffer {
  id: string;
  entityId: string;
  entityName: string;
  drugId?: string;
  isFreeText: boolean;
  freeTextName?: string;
  genericName?: string;
  brandName?: string;
  strength?: string;
  category?: string;
  categoryType?: PharmaItemCategoryType;
  imageUrl?: string;
  quantity: number;
  unit: string;
  price?: number; // optional, user-defined or empty
  currency: string;
  batchNumber?: string;
  expiryDate: string;
  needsDelivery?: boolean;
  deliveryNotes?: string;
  acknowledgedResponsibility?: boolean;
  status: 'active' | 'closed' | 'expired';
  notes?: string;
  createdAt: string;
}

export interface PharmaRequest {
  id: string;
  entityId: string;
  entityName: string;
  drugId?: string;
  isFreeText: boolean;
  freeTextName?: string;
  genericName?: string;
  brandName?: string;
  strength?: string;
  category?: string;
  categoryType?: PharmaItemCategoryType;
  imageUrl?: string;
  quantity: number;
  unit: string;
  urgency: 'low' | 'medium' | 'high' | 'critical';
  needsDelivery?: boolean;
  deliveryNotes?: string;
  acknowledgedResponsibility?: boolean;
  status: 'open' | 'fulfilled' | 'closed';
  notes?: string;
  createdAt: string;
}

// In-App Direct Match Chat & Coordination Tickets
export interface MatchChatMessage {
  id: string;
  senderEntityId: string;
  senderName: string;
  senderRole: 'sender' | 'receiver' | 'admin';
  text: string;
  timestamp: string;
}

export interface PharmaMatchTicket {
  id: string;
  matchId: string;
  targetType: 'offer' | 'request';
  targetItemId: string;
  drugName: string;
  quantity: number;
  unit: string;
  governorate: string;
  // Participating parties
  initiatorEntityId: string;
  initiatorName: string;
  initiatorPhone: string;
  ownerEntityId: string;
  ownerName: string;
  ownerPhone: string;
  // Security & Approval Status
  coordinationStatus: 'pending_approval' | 'approved_open' | 'completed' | 'declined';
  phoneExchanged: boolean;
  messages: MatchChatMessage[];
  lastActivityAt: string;
  createdAt: string;
}

export interface PharmaMatch {
  id: string;
  offerId: string;
  requestId: string;
  drugName: string;
  activeIngredient: string;
  activeIngredientAr?: string;
  offeringEntity: string;
  requestingEntity: string;
  offerQuantity: number;
  requestQuantity: number;
  matchScore?: number; // legacy optional
  matchType: 'exact' | 'prefix' | 'fuzzy' | 'clinical';
  createdAt: string;
  status: 'new' | 'viewed' | 'connected';
  ticketId?: string;
  // Clinical Matching Attributes
  offerStrength?: string;
  requestStrength?: string;
  isSameStrength: boolean;
  offerDosageForm?: string;
  requestDosageForm?: string;
  isSameDosageForm: boolean;
  clinicalMatchKind: 'exact_clinical' | 'alt_strength' | 'alt_form' | 'alt_both';
  clinicalMatchLabel: string;
  clinicalNotes?: string;
  matchReasons?: {
    drugMatch?: number;
    distanceScore?: number;
    notes?: string;
  };
}

export interface PharmaCatalogDrug extends MedicineSearchRecord {
  id: string;
  genericName: string;
  genericNameAr?: string;
  brandName?: string;
  brandNameAr?: string;
  dosageForm?: string;
  strength?: string;
  category: string;
  nemlCategory?: string;
  isYemeniLocal?: boolean;
  manufacturer?: string;
}

// Common Brand Aliases and Arabic Names dictionary mapped to generic names
export const COMMON_TRADE_NAMES_DICT: Record<string, { brandEn: string[]; brandAr: string[]; activeAr?: string }> = {
  'amoxicillin + clavulanic acid': {
    brandEn: ['Augmentin', 'Curam', 'Megamox', 'Klavox', 'Amoclan', 'Julmentin'],
    brandAr: ['اوجمنتين', 'كيرام', 'ميجاموكس', 'كلافوكس', 'اموكلان', 'جولمنتين', 'اوجم'],
    activeAr: 'أموكسيسيلين + حمض الكلافولانيك',
  },
  'amoxicillin': {
    brandEn: ['Amoxil', 'Biomox', 'Hiconcil', 'Moxilen', 'Amoxydar'],
    brandAr: ['اموكسيل', 'بيوموكس', 'هايكونسيل', 'اموكسيسيلين', 'اموكسي'],
    activeAr: 'أموكسيسيلين',
  },
  'paracetamol': {
    brandEn: ['Panadol', 'Adol', 'Calpol', 'Fevadol', 'Paramol', 'Tylenol', 'Cetamol'],
    brandAr: ['بنادول', 'ادول', 'كالبول', 'فيفادول', 'بارامول', 'تايلينول', 'سيتامول', 'باراسيتامول'],
    activeAr: 'باراسيتامول',
  },
  'ibuprofen': {
    brandEn: ['Brufen', 'Profen', 'Advil', 'Motrin', 'Ibugesic', 'Profinal'],
    brandAr: ['بروفين', 'بروفينال', 'ادفيل', 'ايبوجيسيك', 'ايبوبروفين'],
    activeAr: 'إيبوبروفين',
  },
  'diclofenac': {
    brandEn: ['Voltaren', 'Cataflam', 'Olfen', 'Voveran', 'Diclogesic'],
    brandAr: ['فولتارين', 'كتافلام', 'اولفين', 'ديكلوجيسيك', 'ديكلوفيناك'],
    activeAr: 'ديكلوفيناك',
  },
  'ciprofloxacin': {
    brandEn: ['Ciprodar', 'Ciprocin', 'Cipro', 'Ciflox'],
    brandAr: ['سيبرودار', 'سيبروسين', 'سيبرو', 'سيبروفلوكساسين'],
    activeAr: 'سيبروفلوكساسين',
  },
  'azithromycin': {
    brandEn: ['Zithromax', 'Azomycin', 'Azitrom'],
    brandAr: ['زيثروماكس', 'ازوميسين', 'ازيثرومايسين'],
    activeAr: 'أزيثرومايسين',
  },
  'metformin': {
    brandEn: ['Glucophage', 'Metfor'],
    brandAr: ['جلوكوفاج', 'ميتفور', 'ميتفورمين'],
    activeAr: 'ميتفورمين',
  },
  'omeprazole': {
    brandEn: ['Losec', 'Gasec', 'Omez', 'Hyposec'],
    brandAr: ['لوسيك', 'جاسيك', 'اوميز', 'هايبوسيك', 'اوميبرازول'],
    activeAr: 'أوميبرازول',
  },
  'esomeprazole': {
    brandEn: ['Nexium'],
    brandAr: ['نيكسيوم', 'ايزوميبرازول'],
    activeAr: 'إيزوميبرازول',
  },
  'ceftriaxone': {
    brandEn: ['Rocephin', 'Cefaxone', 'Mesporin'],
    brandAr: ['روسيفين', 'سيفاكسون', 'سيفترياكسون', 'سفترياكسون'],
    activeAr: 'سيفترياكسون',
  },
  'salbutamol': {
    brandEn: ['Ventolin', 'Butalin'],
    brandAr: ['فينتولين', 'بوتالين', 'سالبوتامول'],
    activeAr: 'سالبوتامول',
  },
  'metronidazole': {
    brandEn: ['Flagyl'],
    brandAr: ['فلاجيل', 'ميترونيدازول'],
    activeAr: 'ميترونيدازول',
  },
  'bisoprolol': {
    brandEn: ['Concor', 'Bisotens'],
    brandAr: ['كونكور', 'بيسوتنس', 'بيسوبرولول'],
    activeAr: 'بيسوبرولول',
  },
  'atorvastatin': {
    brandEn: ['Lipitor', 'Atorva'],
    brandAr: ['ليبيتور', 'اتورفا', 'أتورفاستاتين'],
    activeAr: 'أتورفاستاتين',
  },
};

// Arabic Category Translation Map
export const CATEGORY_TRANSLATIONS: Record<string, string> = {
  'all': 'جميع الفئات العلاجية',
  'ANTI-INFECTIVE MEDICINES': 'المضادات الحيوية والعدوى',
  'ANALGESICS, ANTIPYRETICS, NSAIDS': 'المسكنات ومضادات الالتهاب',
  'CARDIOVASCULAR MEDICINES': 'أدوية القلب والدورة الدموية والضغط',
  'MEDICINES AFFECTING THE BLOOD': 'أدوية الدم والتخثر',
  'GASTROINTESTINAL MEDICINES': 'أدوية الجهاز الهضمي والمعدة',
  'RESPIRATORY MEDICINES': 'أدوية الجهاز التنفسي والربو',
  'CENTRAL NERVOUS SYSTEM': 'أدوية الجهاز العصبي والنفسي',
  'HORMONES, OTHER ENDOCRINE MEDICINES AND CONTRACEPTIVES': 'الهرمونات والغدد والسكري',
  'IMMUNOLOGICALS': 'اللقاحات والأمصال والمناعة',
  'OPHTHALMOLOGICAL PREPARATIONS': 'مستحضرات العيون',
  'DERMATOLOGICAL MEDICINES (TOPICAL)': 'الأدوية الجلدية والموضعية',
  'DISINFECTANTS AND ANTISEPTICS': 'المطهرات والمعقمات',
  'DIURETICS': 'مدرات البول',
  'VITAMINS AND MINERALS': 'الفيتامينات والمعادن',
  'EAR, NOSE AND THROAT PREPARATIONS': 'مستحضرات الأنف والأذن والحنجرة',
  'MEDICINES FOR REPRODUCTIVE HEALTH AND PERINATAL CARE': 'الصحة الإنجابية والنساء والولادة',
};

import rawNemlJson from '../data/nemlCatalog.json';

export const INITIAL_NEML_CATALOG: PharmaCatalogDrug[] = (rawNemlJson.catalog || []).map((item: any, index: number) => {
  const genericClean = (item.genericName || '').trim();
  const lowerGeneric = genericClean.toLowerCase();
  const matchAlias = COMMON_TRADE_NAMES_DICT[lowerGeneric];

  return {
    id: `neml-${index + 1}`,
    genericName: genericClean,
    genericNameAr: matchAlias?.activeAr || undefined,
    brandName: matchAlias?.brandEn?.join(' / ') || undefined,
    brandNameAr: matchAlias?.brandAr?.join(' / ') || undefined,
    dosageForm: item.dosageForm || 'Tablet',
    strength: item.strength ? item.strength.replace(/^:\s*/, '').trim() : '',
    category: item.category || 'General',
    nemlCategory: item.category || 'General',
    isYemeniLocal: false,
  };
});

