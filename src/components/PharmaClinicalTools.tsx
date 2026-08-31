import React, { useState } from 'react';
import { 
  Calculator, 
  AlertTriangle, 
  Sparkles, 
  Pill, 
  Baby, 
  Scale, 
  Activity, 
  Heart,
  Layers,
  Search,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { rankMedicinesBySearch } from '../medicineSearch';
import { PharmaCatalogDrug } from '../types/pharmayemen';

interface PharmaClinicalToolsProps {
  catalog: PharmaCatalogDrug[];
}

export const PharmaClinicalTools: React.FC<PharmaClinicalToolsProps> = ({ catalog }) => {
  const [activeSubTab, setActiveSubTab] = useState<'dose' | 'interactions' | 'iv' | 'gfr'>('dose');

  // Pediatric Dose Calculator State
  const [childWeight, setChildWeight] = useState('15');
  const [childAge, setChildAge] = useState('4');
  const [selectedDoseDrug, setSelectedDoseDrug] = useState('amoxicillin');

  // Drug Interactions Checker State
  const [interactionSearch, setInteractionSearch] = useState('');
  const [selectedDrugsForCheck, setSelectedDrugsForCheck] = useState<string[]>([
    'Warfarin',
    'Ciprofloxacin'
  ]);

  // eGFR Creatinine Clearance Calculator
  const [patientAge, setPatientAge] = useState('60');
  const [patientWeight, setPatientWeight] = useState('70');
  const [serumCreatinine, setSerumCreatinine] = useState('1.4');
  const [isFemale, setIsFemale] = useState(false);

  // Dose calculation logic
  const calculatePediatricDose = () => {
    const w = parseFloat(childWeight) || 0;
    if (selectedDoseDrug === 'amoxicillin') {
      const minDose = Math.round(w * 40);
      const maxDose = Math.round(w * 90);
      return {
        dailyMg: `${minDose} - ${maxDose} mg/يوم`,
        frequency: 'مقسمة على 2 إلى 3 جرعات يومياً',
        suspensionExample: `شراب Amoxicillin 250mg/5ml: تقريباً ${(minDose / 50).toFixed(1)} مل إلى ${(maxDose / 50).toFixed(1)} مل يومياً`,
        note: 'في حالات التهاب الأذن الوسطى الحاد يفضل استخدام الجرعة العالية (80-90 mg/kg/day)'
      };
    } else if (selectedDoseDrug === 'paracetamol') {
      const singleDose = Math.round(w * 15);
      return {
        dailyMg: `${singleDose} mg للجرعة الواحدة`,
        frequency: 'كل 4 إلى 6 ساعات عند اللزوم (بحد أقصى 4 جرعات باليوم)',
        suspensionExample: `شراب Paracetamol 120mg/5ml: تقريباً ${(singleDose / 24).toFixed(1)} مل في الجرعة الواحدة`,
        note: 'تجنب تجاوز الحد الأقصى اليومي 60 mg/kg/day لتفادي التسمم الكبدي'
      };
    } else {
      const singleDose = Math.round(w * 10);
      return {
        dailyMg: `${singleDose} mg للجرعة الواحدة`,
        frequency: 'كل 6 إلى 8 ساعات بعد الأكل مع وفرة ماء',
        suspensionExample: `شراب Ibuprofen 100mg/5ml: تقريباً ${(singleDose / 20).toFixed(1)} مل بالجرعة`,
        note: 'لا يستخدم للرضع أقل من 3 أشهر أو أقل من 5 كجم'
      };
    }
  };

  // eGFR Calculation (Cockcroft-Gault)
  const calculateCrCl = () => {
    const age = parseFloat(patientAge) || 0;
    const wt = parseFloat(patientWeight) || 0;
    const scr = parseFloat(serumCreatinine) || 1;
    if (age <= 0 || wt <= 0 || scr <= 0) return 0;
    let crcl = ((140 - age) * wt) / (72 * scr);
    if (isFemale) crcl *= 0.85;
    return Math.round(crcl * 10) / 10;
  };

  const crclResult = calculateCrCl();
  const doseInfo = calculatePediatricDose();

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-600" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            حقيبة أدوات الصيدلي السريرية المتقدمة (Clinical Suite)
          </h2>
        </div>
        <p className="text-xs text-slate-500 mt-1">
          أدوات حسابية وسريرية مساعدة للصيادلة في الصيدليات والمستشفيات مع دعم الأدوية المسجلة
        </p>
      </div>

      {/* Sub tabs */}
      <div className="flex bg-slate-200 dark:bg-slate-800/80 p-1 rounded-xl max-w-lg">
        <button
          onClick={() => setActiveSubTab('dose')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'dose' ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Baby className="w-3.5 h-3.5" />
          جرعات الأطفال
        </button>
        <button
          onClick={() => setActiveSubTab('interactions')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'interactions' ? 'bg-white dark:bg-slate-700 text-rose-600 shadow' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <AlertTriangle className="w-3.5 h-3.5" />
          فاحص التداخلات
        </button>
        <button
          onClick={() => setActiveSubTab('gfr')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
            activeSubTab === 'gfr' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow' : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          وظائف الكلى (CrCl)
        </button>
      </div>

      {/* Subtab 1: Pediatric Dose Calculator */}
      {activeSubTab === 'dose' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-slate-900 dark:text-white">
              <Baby className="w-4 h-4 text-emerald-600" />
              حاسبة جرعات الأطفال بالوزن (Pediatric Dosing)
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">اختر الدواء:</label>
                <select
                  value={selectedDoseDrug}
                  onChange={(e) => setSelectedDoseDrug(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="amoxicillin">Amoxicillin (أموكسيسيلين - مضاد حيوي)</option>
                  <option value="paracetamol">Paracetamol (باراسيتامول - مسكن وخافض حرارة)</option>
                  <option value="ibuprofen">Ibuprofen (إيبوبروفين - خافض ومسكن التهاب)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">وزن الطفل (كجم):</label>
                  <input
                    type="number"
                    value={childWeight}
                    onChange={(e) => setChildWeight(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">العمر التقديري (سنوات):</label>
                  <input
                    type="number"
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Result Card */}
          <div className="bg-emerald-50/60 dark:bg-slate-800/90 rounded-2xl p-5 border border-emerald-500/30 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
                الجرعة المحسوبة لوزن {childWeight} كجم
              </span>
              <div className="mt-3 space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">إجمالي الجرعة:</span>
                  <span className="text-base font-black text-slate-900 dark:text-white">{doseInfo.dailyMg}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">نظام الإعطاء:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{doseInfo.frequency}</span>
                </div>
                <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-emerald-200 dark:border-emerald-900/60">
                  <span className="font-bold text-emerald-700 dark:text-emerald-400 block mb-1">معايرة الشراب التجاري:</span>
                  <p className="text-slate-700 dark:text-slate-300 leading-relaxed">{doseInfo.suspensionExample}</p>
                </div>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed border-t border-emerald-200 dark:border-slate-700 pt-2">
              💡 {doseInfo.note}
            </p>
          </div>
        </div>
      )}

      {/* Subtab 2: Drug Interactions */}
      {activeSubTab === 'interactions' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
              فحص التداخلات الدوائية المزدوجة (Interaction Checker)
            </h3>
            
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs text-slate-500">الأدوية المحددة للفحص:</span>
              {selectedDrugsForCheck.map((drug, idx) => (
                <span
                  key={idx}
                  className="bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5"
                >
                  <Pill className="w-3 h-3" />
                  {drug}
                </span>
              ))}
            </div>

            {/* Interaction Result */}
            <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-500/40 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-rose-700 dark:text-rose-300 text-sm">
                  ⚠️ تداخل عالي الخطورة (Major Clinical Interaction)
                </span>
                <span className="bg-rose-600 text-white px-2 py-0.5 rounded text-[10px] font-bold">Severe</span>
              </div>
              <p className="text-slate-800 dark:text-slate-200 leading-relaxed">
                <strong>Warfarin + Ciprofloxacin:</strong> يعمل السيبروفلوكساسين على تثبيط استقلاب الوارفارين في الكبد (عبر إنزيم CYP1A2 و CYP3A4)، مما يؤدي لارتفاع حاد في قيمة INR وخطر حدوث نزيف شديد.
              </p>
              <div className="p-2.5 bg-white dark:bg-slate-900 rounded-lg text-slate-600 dark:text-slate-400">
                <strong>التوصية السريرية:</strong> تجنب الجمع إن أمكن، أو تقليل جرعة الوارفارين بنسبة 30-50% مع مراقبة يومية لـ INR واختيار بديل مناسب مثل Azithromycin.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Subtab 3: CrCl GFR */}
      {activeSubTab === 'gfr' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700/80 shadow-sm space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2 text-blue-600">
              <Activity className="w-4 h-4" />
              حاسبة تصفية الكرياتينين (Cockcroft-Gault CrCl)
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">العمر (سنة):</label>
                  <input
                    type="number"
                    value={patientAge}
                    onChange={(e) => setPatientAge(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">الوزن (كجم):</label>
                  <input
                    type="number"
                    value={patientWeight}
                    onChange={(e) => setPatientWeight(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">كرياتينين المصل (mg/dL):</label>
                <input
                  type="number"
                  step="0.1"
                  value={serumCreatinine}
                  onChange={(e) => setSerumCreatinine(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={!isFemale}
                    onChange={() => setIsFemale(false)}
                    className="text-blue-600"
                  />
                  <span>ذكر (Male)</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    checked={isFemale}
                    onChange={() => setIsFemale(true)}
                    className="text-blue-600"
                  />
                  <span>أنثى (Female - ضرب 0.85)</span>
                </label>
              </div>
            </div>
          </div>

          {/* CrCl Result */}
          <div className="bg-blue-50/60 dark:bg-slate-800/90 rounded-2xl p-5 border border-blue-500/30 shadow-sm flex flex-col justify-between space-y-4">
            <div>
              <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-950 px-2 py-0.5 rounded-md">
                معدل تصفية الكرياتينين المقدر
              </span>
              <div className="mt-3 space-y-2">
                <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                  {crclResult} <span className="text-sm font-semibold text-slate-500">mL/min</span>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                  {crclResult >= 90
                    ? 'وظائف كلوية طبيعية (Normal Renal Function)'
                    : crclResult >= 60
                    ? 'قصور كلوي خفيف (Mild Impairment)'
                    : crclResult >= 30
                    ? 'قصور كلوي متوسط (Moderate Impairment) - يتطلب تعديل جرعات معظم المضادات'
                    : 'قصور كلوي شديد (Severe Impairment) - تعديل إلزامي ومراقبة دقيقة'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white dark:bg-slate-900 rounded-xl text-xs text-slate-500 leading-relaxed border border-slate-200 dark:border-slate-800">
              💡 <strong>تعديل الجرعة:</strong> للأدوية التي تطرح كلوياً (مثل Ciprofloxacin, Ceftriaxone, Levofloxacin, Vancomycin) يجب تخفيض الجرعة أو مباعدة الفترات الزمنية عند انخفاض CrCl تحت 50 mL/min.
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
