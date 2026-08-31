import React, { useState } from 'react';
import { Drug, PrescriptionItem, Prescription } from '../types';
import { INTERACTIONS_DATABASE } from '../data/interactionsDatabase';
import { 
  FileText, 
  User, 
  Plus, 
  Trash2, 
  Printer, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  DollarSign, 
  Calendar, 
  Pill,
  Baby,
  HeartPulse,
  Share2
} from 'lucide-react';

interface PrescriptionAssistantProps {
  prescriptionItems: PrescriptionItem[];
  allDrugs: Drug[];
  onUpdateItems: (items: PrescriptionItem[]) => void;
  onClearPrescription: () => void;
}

export const PrescriptionAssistant: React.FC<PrescriptionAssistantProps> = ({
  prescriptionItems,
  allDrugs,
  onUpdateItems,
  onClearPrescription,
}) => {
  const [patientName, setPatientName] = useState('مريض تجريبي');
  const [patientAge, setPatientAge] = useState<number>(35);
  const [patientGender, setPatientGender] = useState<'ذكر' | 'أنثى'>('ذكر');
  const [isPregnant, setIsPregnant] = useState(false);
  const [isLactating, setIsLactating] = useState(false);
  const [selectedConditions, setSelectedConditions] = useState<string[]>([]);
  const [doctorName, setDoctorName] = useState('د. استشاري العيادة');
  const [diagnosis, setDiagnosis] = useState('التهاب الجهاز التنفسي العلوي');
  const [searchDrugQuery, setSearchDrugQuery] = useState('');

  const chronicOptions = [
    'ارتفاع ضغط الدم',
    'داء السكري',
    'الربو القصبي وحساسية الصدر',
    'قرحة المعدة والارتجاع',
    'قصور الكلى',
    'أمراض القلب والشرايين',
  ];

  const handleToggleCondition = (cond: string) => {
    if (selectedConditions.includes(cond)) {
      setSelectedConditions(selectedConditions.filter((c) => c !== cond));
    } else {
      setSelectedConditions([...selectedConditions, cond]);
    }
  };

  const handleAddDrug = (drug: Drug) => {
    if (prescriptionItems.some((item) => item.drug.id === drug.id)) return;
    const newItem: PrescriptionItem = {
      drug,
      dosageText: drug.dosageAdult || 'قرص واحد كل 12 ساعة بعد الأكل',
      frequency: 'مرتين يومياً',
      durationDays: 7,
      quantity: 1,
      instructions: 'تناول الدواء مع كوب ماء كامل',
    };
    onUpdateItems([...prescriptionItems, newItem]);
    setSearchDrugQuery('');
  };

  const handleRemoveItem = (drugId: string) => {
    onUpdateItems(prescriptionItems.filter((i) => i.drug.id !== drugId));
  };

  const handleUpdateItem = (drugId: string, updates: Partial<PrescriptionItem>) => {
    onUpdateItems(
      prescriptionItems.map((item) =>
        item.drug.id === drugId ? { ...item, ...updates } : item
      )
    );
  };

  // Perform Clinical Rx Safety Audit
  const warnings: { type: 'danger' | 'warning' | 'info'; title: string; desc: string }[] = [];

  // 1. Pregnancy Warnings
  if (isPregnant) {
    prescriptionItems.forEach((item) => {
      if (item.drug.pregnancyCategory === 'X') {
        warnings.push({
          type: 'danger',
          title: `خطر شديد - تشوهات جنينية (Category X): ${item.drug.tradeNameAr}`,
          desc: `الدواء محظور تماماً أثناء الحمل (${item.drug.tradeNameEn}) ويسبب تشوهات قاتلة للجنين. يجب استبداله فوراً.`,
        });
      } else if (item.drug.pregnancyCategory === 'D') {
        warnings.push({
          type: 'danger',
          title: `تحذير عالي الخطورة للحامل (Category D): ${item.drug.tradeNameAr}`,
          desc: `يوجد إثبات خطورة على الجنين البشري، يُمنع الاستخدام إلا عند الضرورة القصوى المهددة للحياة.`,
        });
      } else if (item.drug.pregnancyCategory === 'C') {
        warnings.push({
          type: 'warning',
          title: `دواء يحتاج تقييم منفعة/خطر (Category C): ${item.drug.tradeNameAr}`,
          desc: `دراسات غير كافية، يُفضل البحث عن بديل فئة A أو B كخيار أول للحامل.`,
        });
      }
    });
  }

  // 2. Duplicate active ingredients
  for (let i = 0; i < prescriptionItems.length; i++) {
    for (let j = i + 1; j < prescriptionItems.length; j++) {
      const d1 = prescriptionItems[i].drug;
      const d2 = prescriptionItems[j].drug;

      if (d1.genericName.toLowerCase() === d2.genericName.toLowerCase()) {
        warnings.push({
          type: 'danger',
          title: `ازدواجية المادة الفعالة: ${d1.tradeNameAr} و ${d2.tradeNameAr}`,
          desc: `كلا الدواءين يحتويان على نفس المادة (${d1.genericName}) مما يعرض المريض لمخاطر الجرعة الزائدة والتسمم.`,
        });
      }

      // Check interaction database
      const interaction = INTERACTIONS_DATABASE.find(
        (rule) =>
          (d1.genericName.toLowerCase().includes(rule.drug1Generic.toLowerCase()) &&
            d2.genericName.toLowerCase().includes(rule.drug2Generic.toLowerCase())) ||
          (d2.genericName.toLowerCase().includes(rule.drug1Generic.toLowerCase()) &&
            d1.genericName.toLowerCase().includes(rule.drug2Generic.toLowerCase()))
      );

      if (interaction) {
        warnings.push({
          type: interaction.severity === 'severe' ? 'danger' : 'warning',
          title: `تعارض دوائي بالروشتة: ${d1.tradeNameAr} ✕ ${d2.tradeNameAr}`,
          desc: `${interaction.title}: ${interaction.clinicalEffect}`,
        });
      }
    }
  }

  // 3. Chronic disease contraindications
  if (selectedConditions.includes('الربو القصبي وحساسية الصدر')) {
    prescriptionItems.forEach((item) => {
      if (item.drug.genericName.includes('Bisoprolol') || item.drug.genericName.includes('Ibuprofen') || item.drug.genericName.includes('Diclofenac')) {
        warnings.push({
          type: 'danger',
          title: `تعارض مع مرض الربو: ${item.drug.tradeNameAr}`,
          desc: `المسكنات NSAIDs وحاصرات بيتا قد تؤدي إلى تشنج قصبي حاد ونوبة ربو مفاجئة.`,
        });
      }
    });
  }

  if (selectedConditions.includes('قرحة المعدة والارتجاع')) {
    prescriptionItems.forEach((item) => {
      if (item.drug.genericName.includes('Ibuprofen') || item.drug.genericName.includes('Diclofenac')) {
        warnings.push({
          type: 'danger',
          title: `تعارض مع قرحة المعدة: ${item.drug.tradeNameAr}`,
          desc: `مسكنات NSAIDs تهيج بطانة المعدة وتسبب نزيفاً هضمياً. يفضل وصف باراسيتامول وواقي معدة.`,
        });
      }
    });
  }

  // Calculate total price
  const totalPriceYER = prescriptionItems.reduce(
    (sum, item) => sum + item.drug.priceYER * (item.quantity || 1),
    0
  );

  const searchResults = searchDrugQuery.trim()
    ? allDrugs
        .filter(
          (d) =>
            !prescriptionItems.some((pi) => pi.drug.id === d.id) &&
            (d.tradeNameAr.includes(searchDrugQuery) ||
              d.tradeNameEn.toLowerCase().includes(searchDrugQuery.toLowerCase()) ||
              d.genericName.toLowerCase().includes(searchDrugQuery.toLowerCase()))
        )
        .slice(0, 6)
    : [];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Title Header */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                مراجع ومدقق الروشتات الطبية الذكي
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                فحص فوري للتعارضات، ملاءمة الحمل والأمراض المزمنة، واحتساب إجمالي تكلفة الأدوية
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              disabled={prescriptionItems.length === 0}
              className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>طباعة الروشتة الرسمية</span>
            </button>

            {prescriptionItems.length > 0 && (
              <button
                onClick={onClearPrescription}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                title="إفراغ الروشتة"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Patient Profile Card */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center gap-2 font-extrabold text-sm text-slate-900 dark:text-white">
            <User className="w-4 h-4 text-emerald-600" />
            <span>بيانات المريض والحالة الصحية الخاصة</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                اسم المريض:
              </label>
              <input
                type="text"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                العمر (سنوات):
              </label>
              <input
                type="number"
                value={patientAge}
                onChange={(e) => setPatientAge(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                الجنس:
              </label>
              <select
                value={patientGender}
                onChange={(e) => setPatientGender(e.target.value as any)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
              >
                <option value="ذكر">ذكر</option>
                <option value="أنثى">أنثى</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">
                التشخيص الطبي:
              </label>
              <input
                type="text"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Female Special Status (Pregnancy & Lactation) */}
          {patientGender === 'أنثى' && (
            <div className="flex flex-wrap items-center gap-3 p-3 bg-pink-50/70 dark:bg-pink-950/30 rounded-2xl border border-pink-200 dark:border-pink-900/60">
              <span className="text-xs font-extrabold text-pink-900 dark:text-pink-300 flex items-center gap-1.5">
                <Baby className="w-4 h-4 text-pink-600" />
                <span>حالة الحمل والرضاعة:</span>
              </span>

              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isPregnant}
                  onChange={(e) => setIsPregnant(e.target.checked)}
                  className="rounded text-pink-600 accent-pink-600 w-4 h-4"
                />
                <span>المريضة حامل (فحص فئات سلامة الحمل A, B, C, D, X)</span>
              </label>

              <label className="flex items-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isLactating}
                  onChange={(e) => setIsLactating(e.target.checked)}
                  className="rounded text-pink-600 accent-pink-600 w-4 h-4"
                />
                <span>مرضعة (فحص الأمان للرضيع)</span>
              </label>
            </div>
          )}

          {/* Chronic Conditions Checklist */}
          <div>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-400 block mb-2">
              الأمراض المزمنة للمريض (للتحقق التلقائي من موانع الاستعمال):
            </span>
            <div className="flex flex-wrap gap-2">
              {chronicOptions.map((cond) => {
                const isSelected = selectedConditions.includes(cond);
                return (
                  <button
                    key={cond}
                    type="button"
                    onClick={() => handleToggleCondition(cond)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                      isSelected
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    {cond}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Prescription Auditor Warnings Banner */}
        {warnings.length > 0 ? (
          <div className="space-y-2.5">
            <div className="p-3 bg-rose-100 dark:bg-rose-950 text-rose-900 dark:text-rose-200 rounded-2xl font-black text-xs flex items-center gap-2 border border-rose-300 dark:border-rose-800">
              <ShieldAlert className="w-4 h-4 text-rose-600" />
              <span>
                تنبيه سريري فوري: تم رصد {warnings.length} ملاحظة أو تعارض يستوجب المراجعة قبل الصرف
              </span>
            </div>

            {warnings.map((w, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-2xl text-xs leading-relaxed border ${
                  w.type === 'danger'
                    ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-200'
                    : 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-200'
                }`}
              >
                <div className="font-extrabold text-sm mb-0.5">{w.title}</div>
                <div>{w.desc}</div>
              </div>
            ))}
          </div>
        ) : prescriptionItems.length > 0 ? (
          <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 rounded-2xl text-xs font-bold border border-emerald-200 dark:border-emerald-800 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>الروشتة مدققة ومطابقة للأمان الدوائي مع الملف الصحي للمريض.</span>
          </div>
        ) : null}

        {/* Drug Adder to Prescription */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
              <Pill className="w-4 h-4 text-emerald-600 rotate-45" />
              <span>الأدوية الموصوفة ({prescriptionItems.length})</span>
            </span>

            <span className="text-xs font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1 rounded-xl border border-emerald-200 dark:border-emerald-800">
              إجمالي القيمة: {totalPriceYER.toLocaleString()} ريال يمني
            </span>
          </div>

          {/* Search box to add items */}
          <div className="relative">
            <input
              type="text"
              value={searchDrugQuery}
              onChange={(e) => setSearchDrugQuery(e.target.value)}
              placeholder="ابحث عن صنف لإضافته للروشتة..."
              className="w-full p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border text-xs font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />

            {searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-52 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {searchResults.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => handleAddDrug(d)}
                    className="p-2.5 hover:bg-emerald-50 dark:hover:bg-slate-700 cursor-pointer flex items-center justify-between text-xs transition-colors"
                  >
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {d.tradeNameAr} ({d.tradeNameEn})
                      </span>
                      <span className="text-[10px] text-slate-400 block font-mono">
                        {d.genericName} • {d.strength}
                      </span>
                    </div>
                    <span className="font-bold text-emerald-600">
                      {d.priceYER.toLocaleString()} YER
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Items List Table */}
          {prescriptionItems.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
              الروشتة فارغة حالياً. ابحث في الحقل أعلاه أو انقر على زر (+) في قائمة الأدوية لإضافة أصناف هنا.
            </div>
          ) : (
            <div className="space-y-3">
              {prescriptionItems.map((item, index) => (
                <div
                  key={item.drug.id}
                  className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black text-xs flex items-center justify-center">
                        {index + 1}
                      </span>
                      <div>
                        <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                          {item.drug.tradeNameAr}{' '}
                          <span className="text-xs text-slate-400 font-normal">
                            ({item.drug.tradeNameEn})
                          </span>
                        </div>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-mono">
                          {item.drug.genericName} • {item.drug.form.split('(')[0]} • {item.drug.strength}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="font-black text-xs text-slate-800 dark:text-slate-200">
                        {(item.drug.priceYER * (item.quantity || 1)).toLocaleString()} YER
                      </span>
                      <button
                        onClick={() => handleRemoveItem(item.drug.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Dosage & Duration Inputs */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        الجرعة والمواعيد:
                      </label>
                      <input
                        type="text"
                        value={item.dosageText}
                        onChange={(e) => handleUpdateItem(item.drug.id, { dosageText: e.target.value })}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        مدة العلاج (أيام):
                      </label>
                      <input
                        type="number"
                        value={item.durationDays}
                        onChange={(e) => handleUpdateItem(item.drug.id, { durationDays: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 mb-0.5">
                        الكمية المصروفة (عبوات):
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleUpdateItem(item.drug.id, { quantity: Number(e.target.value) })}
                        className="w-full p-2 rounded-xl bg-white dark:bg-slate-900 border text-xs font-semibold"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
