export interface PediatricDrugPreset {
  id: string;
  nameAr: string;
  nameEn: string;
  genericName: string;
  standardDoseMgPerKgPerDay: number;
  dosesPerDay: number;
  availableStrengths: {
    label: string;
    mg: number;
    perMl: number;
  }[];
  maxDailyDoseMg?: number;
  notesAr: string;
}

export const PEDIATRIC_PRESETS: PediatricDrugPreset[] = [
  {
    id: 'amox-clav',
    nameAr: 'أموكسيسيلين + كلافولانيك (أوجمنتين / كلافوكس)',
    nameEn: 'Amoxicillin / Clavulanate',
    genericName: 'Amoxicillin + Clavulanic Acid',
    standardDoseMgPerKgPerDay: 40,
    dosesPerDay: 2,
    availableStrengths: [
      { label: 'شراب 228 مجم / 5 مل (Augmentin/Clavox 228mg/5ml)', mg: 200, perMl: 5 },
      { label: 'شراب 457 مجم / 5 مل (Augmentin/Clavox 457mg/5ml)', mg: 400, perMl: 5 },
      { label: 'شراب 312 مجم / 5 مل (312.5mg/5ml)', mg: 250, perMl: 5 },
      { label: 'شراب 156 مجم / 5 مل (156.25mg/5ml)', mg: 125, perMl: 5 }
    ],
    maxDailyDoseMg: 2000,
    notesAr: 'يعطى مع بداية الوجبة لتقليل اضطرابات الجهاز الهضمي وتحسين الامتصاص. مدة العلاج المعتادة 7-10 أيام.'
  },
  {
    id: 'paracetamol',
    nameAr: 'باراسيتامول (أدول / بانادول / فيفادول)',
    nameEn: 'Paracetamol / Acetaminophen',
    genericName: 'Paracetamol',
    standardDoseMgPerKgPerDay: 45, // 15 mg/kg every 6-8 hours = ~45-60 mg/kg/day
    dosesPerDay: 4,
    availableStrengths: [
      { label: 'شراب معلق 120 مجم / 5 مل (120mg/5ml)', mg: 120, perMl: 5 },
      { label: 'شراب معلق 250 مجم / 5 مل (250mg/5ml)', mg: 250, perMl: 5 },
      { label: 'قطرات للرضع 100 مجم / 1 مل (100mg/1ml Drops)', mg: 100, perMl: 1 }
    ],
    maxDailyDoseMg: 2000,
    notesAr: 'الجرعة 10-15 مجم/كجم لكل جرعة كل 4-6 ساعات. الحد الأقصى 4-5 جرعات في 24 ساعة لتجنب التسمم الكبدي.'
  },
  {
    id: 'ibuprofen',
    nameAr: 'إيبوبروفين (بروفين شراب للأطفال)',
    nameEn: 'Ibuprofen',
    genericName: 'Ibuprofen',
    standardDoseMgPerKgPerDay: 30, // 10 mg/kg 3 times daily
    dosesPerDay: 3,
    availableStrengths: [
      { label: 'شراب 100 مجم / 5 مل (Brufen 100mg/5ml)', mg: 100, perMl: 5 },
      { label: 'شراب 200 مجم / 5 مل (Brufen Forte 200mg/5ml)', mg: 200, perMl: 5 }
    ],
    maxDailyDoseMg: 1200,
    notesAr: 'يعطى بعد الأكل مباشرة. مخصص للأطفال فوق 6 أشهر فقط. تجنب استخدامه في حالات الجفاف أو قرحة المعدة.'
  },
  {
    id: 'azithromycin',
    nameAr: 'أزيترومايسين (زيثرومكس / زوماكس)',
    nameEn: 'Azithromycin',
    genericName: 'Azithromycin',
    standardDoseMgPerKgPerDay: 10,
    dosesPerDay: 1,
    availableStrengths: [
      { label: 'شراب 200 مجم / 5 مل (Zithromax 200mg/5ml)', mg: 200, perMl: 5 },
      { label: 'شراب 100 مجم / 5 مل (100mg/5ml)', mg: 100, perMl: 5 }
    ],
    maxDailyDoseMg: 500,
    notesAr: 'يعطى كجرعة واحدة يومياً لمدة 3 أيام فقط (أو 5 أيام حسب البروتوكول) قبل الأكل بساعة أو بعده بساعتين.'
  },
  {
    id: 'ceftriaxone',
    nameAr: 'سيفترياكسون حقن (سيفامكس / روسيفين)',
    nameEn: 'Ceftriaxone',
    genericName: 'Ceftriaxone',
    standardDoseMgPerKgPerDay: 60,
    dosesPerDay: 1,
    availableStrengths: [
      { label: 'فيال 500 مجم حقن (Vial 500mg)', mg: 500, perMl: 5 },
      { label: 'فيال 1000 مجم (1 جم) حقن (Vial 1g)', mg: 1000, perMl: 10 }
    ],
    maxDailyDoseMg: 2000,
    notesAr: 'حقن عضلي مع ليدوكائين 1% أو وريدي بطيء. يمنع خلطه نهائياً مع المحاليل المحتوية على الكالسيوم.'
  }
];

export const calculateDose = (
  weightKg: number,
  doseMgPerKgPerDay: number,
  dosesPerDay: number,
  strengthMg: number,
  strengthMl: number
) => {
  const totalDailyMg = weightKg * doseMgPerKgPerDay;
  const singleDoseMg = totalDailyMg / (dosesPerDay || 1);
  const singleDoseMl = (singleDoseMg * strengthMl) / strengthMg;
  const totalDailyMl = singleDoseMl * dosesPerDay;

  return {
    totalDailyMg: Math.round(totalDailyMg * 10) / 10,
    singleDoseMg: Math.round(singleDoseMg * 10) / 10,
    singleDoseMl: Math.round(singleDoseMl * 100) / 100,
    totalDailyMl: Math.round(totalDailyMl * 100) / 100,
  };
};

export const calculateBSA = (heightCm: number, weightKg: number): number => {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  // Mosteller formula: BSA (m²) = sqrt((height in cm * weight in kg) / 3600)
  return Math.round(Math.sqrt((heightCm * weightKg) / 3600) * 100) / 100;
};

export const calculateCrCl = (
  ageYears: number,
  weightKg: number,
  serumCrMgDl: number,
  isFemale: boolean
): number => {
  if (ageYears <= 0 || weightKg <= 0 || serumCrMgDl <= 0) return 0;
  // Cockcroft-Gault equation
  const rawCrCl = ((140 - ageYears) * weightKg) / (72 * serumCrMgDl);
  const adjusted = isFemale ? rawCrCl * 0.85 : rawCrCl;
  return Math.round(adjusted * 10) / 10;
};
