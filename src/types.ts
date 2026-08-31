export type PregnancyCategory = 'A' | 'B' | 'C' | 'D' | 'X' | 'N/A';

export type DrugForm = 
  | 'أقراص (Tablets)' 
  | 'كبسولات (Capsules)' 
  | 'شراب (Syrup)' 
  | 'معلق فموي (Suspension)' 
  | 'حقن عضلي/وريدي (Injections)' 
  | 'مرهم/كريم (Ointment/Cream)' 
  | 'قطرات عينية/أذنية (Drops)' 
  | 'بخاخ استنشاق (Inhaler)' 
  | 'تحاميل (Suppositories)' 
  | 'جل فموي/موضعي (Gel)' 
  | 'بودرة للحل (Sachet/Powder)';

export type TherapeuticCategory = 
  | 'المضادات الحيوية والعدوى (Antibiotics & Anti-infectives)'
  | 'مسكنات ومضادات الالتهاب (Analgesics & NSAIDs)'
  | 'أدوية القلب والضغط (Cardiovascular & Antihypertensives)'
  | 'أدوية السكري والغدد (Diabetes & Endocrine)'
  | 'أدوية الجهاز الهضمي (Gastrointestinal)'
  | 'أدوية الجهاز التنفسي والحساسية (Respiratory & Antihistamines)'
  | 'أدوية الجهاز العصبي والنفسي (CNS & Neurology)'
  | 'الكورتيزونات ومعدلات المناعة (Corticosteroids)'
  | 'الفيتامينات والمكملات والمعادن (Vitamins & Supplements)'
  | 'أدوية العيون والأنف والأذن (Ophthalmic & ENT)'
  | 'الأدوية الجلدية والتجميلية (Dermatology)'
  | 'أدوية النساء والولادة والمسالك (Gynecology & Urology)';

export interface Drug {
  id: string;
  tradeNameAr: string;
  tradeNameEn: string;
  genericName: string;
  category: TherapeuticCategory;
  form: DrugForm;
  strength: string;
  manufacturer: string;
  country: string;
  isYemeniLocal?: boolean;
  priceYER: number;
  priceUSD?: number;
  indications: string[];
  contraindications: string[];
  sideEffects: string[];
  dosageAdult: string;
  dosagePediatric: string;
  pregnancyCategory: PregnancyCategory;
  lactationSafety: string;
  interactionsSummary: string;
  storage: string;
  barcode?: string;
  stockCount: number;
  minStockAlert: number;
  expiryDate?: string;
  isFavorite?: boolean;
  notes?: string;
}

export type InteractionSeverity = 'severe' | 'moderate' | 'minor' | 'safe';

export interface DrugInteractionRule {
  drug1Generic: string;
  drug2Generic: string;
  severity: InteractionSeverity;
  title: string;
  description: string;
  clinicalEffect: string;
  recommendation: string;
}

export interface DetectedInteraction {
  drug1: Drug;
  drug2: Drug;
  severity: InteractionSeverity;
  title: string;
  description: string;
  clinicalEffect: string;
  recommendation: string;
}

export interface PrescriptionItem {
  drug: Drug;
  dosageText: string;
  frequency: string; // e.g. "كل 8 ساعات بعد الأكل"
  durationDays: number;
  quantity: number;
  instructions?: string;
}

export interface Prescription {
  id: string;
  patientName: string;
  patientAge?: number;
  patientWeight?: number;
  patientGender?: 'ذكر' | 'أنثى';
  isPregnant?: boolean;
  isLactating?: boolean;
  chronicConditions?: string[];
  items: PrescriptionItem[];
  diagnosis?: string;
  doctorName?: string;
  date: string;
  totalPriceYER: number;
  warnings: string[];
}

export type ActiveTab = 
  | 'formulary' 
  | 'interactions' 
  | 'calculator' 
  | 'prescription' 
  | 'alternatives' 
  | 'inventory' 
  | 'pregnancy' 
  | 'ai-assistant';
