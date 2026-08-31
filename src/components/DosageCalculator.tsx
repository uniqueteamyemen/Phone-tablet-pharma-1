import React, { useState } from 'react';
import { 
  PEDIATRIC_PRESETS, 
  PediatricDrugPreset, 
  calculateDose, 
  calculateBSA, 
  calculateCrCl 
} from '../utils/calculator';
import { 
  Calculator, 
  Baby, 
  Activity, 
  Flame, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  Scale,
  Sparkles,
  Droplets
} from 'lucide-react';

export const DosageCalculator: React.FC = () => {
  const [calcTab, setCalcTab] = useState<'pediatric' | 'bsa' | 'renal'>('pediatric');

  // Pediatric states
  const [selectedPresetId, setSelectedPresetId] = useState<string>(PEDIATRIC_PRESETS[0].id);
  const [patientWeightKg, setPatientWeightKg] = useState<number>(12);
  const [patientAgeMonths, setPatientAgeMonths] = useState<number>(24);
  const [selectedStrengthIndex, setSelectedStrengthIndex] = useState<number>(0);
  
  // Custom mode
  const [isCustomMode, setIsCustomMode] = useState<boolean>(false);
  const [customMgPerKg, setCustomMgPerKg] = useState<number>(30);
  const [customDosesPerDay, setCustomDosesPerDay] = useState<number>(3);
  const [customStrengthMg, setCustomStrengthMg] = useState<number>(250);
  const [customStrengthMl, setCustomStrengthMl] = useState<number>(5);

  // BSA states
  const [bsaHeightCm, setBsaHeightCm] = useState<number>(165);
  const [bsaWeightKg, setBsaWeightKg] = useState<number>(65);

  // Renal states
  const [renalAgeYears, setRenalAgeYears] = useState<number>(55);
  const [renalWeightKg, setRenalWeightKg] = useState<number>(70);
  const [renalSerumCr, setRenalSerumCr] = useState<number>(1.2);
  const [renalIsFemale, setRenalIsFemale] = useState<boolean>(false);

  // Calculate current pediatric result
  const currentPreset = PEDIATRIC_PRESETS.find((p) => p.id === selectedPresetId) || PEDIATRIC_PRESETS[0];
  const strength = currentPreset.availableStrengths[selectedStrengthIndex] || currentPreset.availableStrengths[0];

  const pedResult = isCustomMode
    ? calculateDose(
        patientWeightKg,
        customMgPerKg,
        customDosesPerDay,
        customStrengthMg,
        customStrengthMl
      )
    : calculateDose(
        patientWeightKg,
        currentPreset.standardDoseMgPerKgPerDay,
        currentPreset.dosesPerDay,
        strength.mg,
        strength.perMl
      );

  const bsaResult = calculateBSA(bsaHeightCm, bsaWeightKg);
  const crClResult = calculateCrCl(renalAgeYears, renalWeightKg, renalSerumCr, renalIsFemale);

  const getRenalCategory = (crCl: number) => {
    if (crCl >= 90) return { label: 'وظائف كلوية طبيعية (Normal Renal Function)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200' };
    if (crCl >= 60) return { label: 'قصور كلوي خفيف (Mild Impairment G2)', color: 'text-blue-600 bg-blue-50 border-blue-200' };
    if (crCl >= 30) return { label: 'قصور كلوي متوسط (Moderate Impairment G3) - يتطلب تعديل الجرعات', color: 'text-amber-600 bg-amber-50 border-amber-200' };
    if (crCl >= 15) return { label: 'قصور كلوي شديد (Severe Impairment G4) - تخفيض كبير للجرعات', color: 'text-orange-600 bg-orange-50 border-orange-200' };
    return { label: 'فشل كلوي نهائي (End-Stage / ESRD G5) - غسيل كلى', color: 'text-rose-600 bg-rose-50 border-rose-200' };
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Calculator className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                حاسبة الجرعات الصيدلانية والسريرية المعتمدة
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                حساب دقيق لجرعات الأطفال، مساحة سطح الجسم (BSA)، والتصفية الكلوية (eGFR)
              </p>
            </div>
          </div>

          {/* Calculator Category Switcher */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold w-full sm:w-auto">
            <button
              onClick={() => setCalcTab('pediatric')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all ${
                calcTab === 'pediatric'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              جرعات الأطفال
            </button>
            <button
              onClick={() => setCalcTab('bsa')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all ${
                calcTab === 'bsa'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              سطح الجسم (BSA)
            </button>
            <button
              onClick={() => setCalcTab('renal')}
              className={`flex-1 sm:flex-initial px-3.5 py-2 rounded-xl transition-all ${
                calcTab === 'renal'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              التصفية الكلوية (CrCl)
            </button>
          </div>
        </div>

        {/* 1. Pediatric Calculator Tab */}
        {calcTab === 'pediatric' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Input Controls */}
            <div className="lg:col-span-6 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Baby className="w-4 h-4 text-emerald-600" />
                  <span>بيانات الطفل والدواء</span>
                </span>
                
                <button
                  onClick={() => setIsCustomMode(!isCustomMode)}
                  className="text-xs font-bold text-emerald-600 hover:underline"
                >
                  {isCustomMode ? 'التبديل للأدوية الجاهزة' : 'إدخال دواء يدوي مخصص'}
                </button>
              </div>

              {!isCustomMode ? (
                <>
                  {/* Preset Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      اختر الدواء من القائمة الجاهزة:
                    </label>
                    <select
                      value={selectedPresetId}
                      onChange={(e) => {
                        setSelectedPresetId(e.target.value);
                        setSelectedStrengthIndex(0);
                      }}
                      className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                    >
                      {PEDIATRIC_PRESETS.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nameAr}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Strength Selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                      التركيز والشكل المتوفر لديك بالصيدلية:
                    </label>
                    <select
                      value={selectedStrengthIndex}
                      onChange={(e) => setSelectedStrengthIndex(Number(e.target.value))}
                      className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:border-emerald-500"
                    >
                      {currentPreset.availableStrengths.map((st, i) => (
                        <option key={i} value={i}>
                          {st.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </>
              ) : (
                /* Custom inputs */
                <div className="space-y-3 p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        الجرعة (مجم/كجم/يوم)
                      </label>
                      <input
                        type="number"
                        value={customMgPerKg}
                        onChange={(e) => setCustomMgPerKg(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        عدد المرات باليوم
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="6"
                        value={customDosesPerDay}
                        onChange={(e) => setCustomDosesPerDay(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        التركيز: مجم (mg)
                      </label>
                      <input
                        type="number"
                        value={customStrengthMg}
                        onChange={(e) => setCustomStrengthMg(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-600 dark:text-slate-400 mb-1">
                        لكل حجم بالملي (ml)
                      </label>
                      <input
                        type="number"
                        value={customStrengthMl}
                        onChange={(e) => setCustomStrengthMl(Number(e.target.value))}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Weight Slider / Input */}
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    وزن الطفل (كجم):
                  </label>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      step="0.5"
                      min="2"
                      max="70"
                      value={patientWeightKg}
                      onChange={(e) => setPatientWeightKg(Math.max(1, Number(e.target.value)))}
                      className="w-20 p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-black text-sm text-emerald-600 focus:outline-hidden"
                    />
                    <span className="text-xs font-bold text-slate-400">كجم</span>
                  </div>
                </div>

                <input
                  type="range"
                  min="3"
                  max="40"
                  step="0.5"
                  value={patientWeightKg}
                  onChange={(e) => setPatientWeightKg(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
              </div>

              {/* Age (Optional reference) */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>عمر الطفل التقريبي:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {Math.floor(patientWeightKg * 2.5)} شهراً تقريباً (حسب منحنى النمو)
                </span>
              </div>

              {/* Notes */}
              {!isCustomMode && currentPreset.notesAr && (
                <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-900 dark:text-emerald-200 leading-relaxed flex items-start gap-2">
                  <Info className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{currentPreset.notesAr}</span>
                </div>
              )}
            </div>

            {/* Results Display */}
            <div className="lg:col-span-6 bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-6 rounded-3xl shadow-lg shadow-emerald-700/20 flex flex-col justify-between space-y-6">
              
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider bg-white/20 px-3 py-1 rounded-full text-emerald-50">
                    نتيجة الجرعة الصيدلانية الدقيقة
                  </span>
                  <span className="text-xs font-bold text-emerald-100">
                    وزن {patientWeightKg} كجم
                  </span>
                </div>

                {/* Main Single Dose Card */}
                <div className="mt-4 p-4 rounded-2xl bg-white/10 backdrop-blur-sm border border-white/20 text-center">
                  <span className="text-xs text-emerald-100 font-medium block">
                    الجرعة الواحدة لكل مرة:
                  </span>
                  <div className="text-3xl sm:text-4xl font-black mt-1 text-white tracking-tight">
                    {pedResult.singleDoseMl} <span className="text-lg font-bold">مل (ml)</span>
                  </div>
                  <div className="text-xs text-emerald-100 font-bold mt-1">
                    تعادل: {pedResult.singleDoseMg} مليجرام من المادة الفعالة
                  </div>
                </div>
              </div>

              {/* Dosing Schedule Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-emerald-100 block text-[11px]">عدد مرات التكرار:</span>
                  <span className="font-extrabold text-base block mt-0.5">
                    {isCustomMode ? customDosesPerDay : currentPreset.dosesPerDay} مرات يومياً
                  </span>
                  <span className="text-[10px] text-emerald-200">
                    كل {24 / (isCustomMode ? customDosesPerDay : currentPreset.dosesPerDay)} ساعات
                  </span>
                </div>

                <div className="p-3 rounded-2xl bg-white/10 border border-white/15">
                  <span className="text-emerald-100 block text-[11px]">إجمالي الجرعة اليومية:</span>
                  <span className="font-extrabold text-base block mt-0.5">
                    {pedResult.totalDailyMl} مل / يوم
                  </span>
                  <span className="text-[10px] text-emerald-200">
                    ({pedResult.totalDailyMg} مجم/يوم)
                  </span>
                </div>
              </div>

              {/* Measurement Spoon / Syringe Guide */}
              <div className="p-3.5 rounded-2xl bg-emerald-900/40 border border-emerald-400/20 text-xs text-emerald-50 leading-relaxed">
                <div className="font-bold mb-1 flex items-center gap-1.5">
                  <Droplets className="w-3.5 h-3.5" />
                  <span>إرشاد عملي للأم وولي الأمر:</span>
                </div>
                <p className="text-[11px] opacity-90">
                  {pedResult.singleDoseMl === 5
                    ? 'تعادل ملعقة شاي صغيرة كاملة (5 مل) في كل موعد.'
                    : pedResult.singleDoseMl === 2.5
                    ? 'تعادل نصف ملعقة شاي صغيرة (2.5 مل) في كل موعد.'
                    : `يفضل سحب ${pedResult.singleDoseMl} مل باستخدام سرنجة القياس المدرجة للحصول على أدق جرعة علاجية.`}
                </p>
              </div>

            </div>

          </div>
        )}

        {/* 2. BSA Calculator Tab */}
        {calcTab === 'bsa' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2">
              <Scale className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                حاسبة مساحة سطح الجسم (Body Surface Area - Mosteller)
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الطول (سم / cm):
                </label>
                <input
                  type="number"
                  value={bsaHeightCm}
                  onChange={(e) => setBsaHeightCm(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الوزن (كجم / kg):
                </label>
                <input
                  type="number"
                  value={bsaWeightKg}
                  onChange={(e) => setBsaWeightKg(Number(e.target.value))}
                  className="w-full p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-bold text-slate-900 dark:text-white"
                />
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-100 dark:bg-slate-800 text-center border border-slate-200 dark:border-slate-700">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                مساحة سطح الجسم المحسوبة (BSA)
              </span>
              <div className="text-4xl font-black text-emerald-600 mt-2">
                {bsaResult} <span className="text-xl">م² (m²)</span>
              </div>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                تُستخدم معادلة موستيلر في حساب بروتوكولات أدوية الأورام، مدرات البول الوريدية الحادة، والجرعات السريرية المتقدمة.
              </p>
            </div>
          </div>
        )}

        {/* 3. Renal Clearance CrCl Calculator Tab */}
        {calcTab === 'renal' && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-600" />
              <h3 className="font-extrabold text-slate-900 dark:text-white text-base">
                حاسبة تصفية الكرياتينين ووظائف الكلى (Cockcroft-Gault CrCl)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  العمر (سنوات):
                </label>
                <input
                  type="number"
                  value={renalAgeYears}
                  onChange={(e) => setRenalAgeYears(Number(e.target.value))}
                  className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الوزن (كجم):
                </label>
                <input
                  type="number"
                  value={renalWeightKg}
                  onChange={(e) => setRenalWeightKg(Number(e.target.value))}
                  className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  كرياتينين المصل (mg/dL):
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={renalSerumCr}
                  onChange={(e) => setRenalSerumCr(Number(e.target.value))}
                  className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  الجنس:
                </label>
                <select
                  value={renalIsFemale ? 'female' : 'male'}
                  onChange={(e) => setRenalIsFemale(e.target.value === 'female')}
                  className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold"
                >
                  <option value="male">ذكر (Male)</option>
                  <option value="female">أنثى (Female)</option>
                </select>
              </div>
            </div>

            {/* Renal Result Box */}
            <div className="p-6 rounded-3xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-center space-y-3">
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider block">
                معدل تصفية الكرياتينين التقديري (CrCl)
              </span>
              
              <div className="text-4xl font-black text-blue-600 dark:text-blue-400">
                {crClResult} <span className="text-xl">مل/دقيقة (mL/min)</span>
              </div>

              <div className="inline-block px-4 py-1.5 rounded-full border text-xs font-extrabold" style={{ margin: '0 auto' }}>
                <span className={`px-3 py-1 rounded-xl border text-xs font-extrabold ${getRenalCategory(crClResult).color}`}>
                  {getRenalCategory(crClResult).label}
                </span>
              </div>

              <p className="text-xs text-slate-500 max-w-lg mx-auto pt-2 leading-relaxed">
                في حال كانت النتيجة أقل من 50 مل/دقيقة، يلزم مراجعة النشرة الدوائية لأدوية مثل (الميتفورمين، المضادات الحيوية كالسيفامكس والسيبروفلوكساسين، والديجوكسين) وتعديل الفترات الزمنية بين الجرعات.
              </p>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};
