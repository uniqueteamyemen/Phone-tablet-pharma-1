import React, { useState } from 'react';
import { Drug, DetectedInteraction, InteractionSeverity } from '../types';
import { INTERACTIONS_DATABASE } from '../data/interactionsDatabase';
import { 
  ArrowLeftRight, 
  Trash2, 
  AlertTriangle, 
  CheckCircle2, 
  Plus, 
  Search, 
  ShieldAlert, 
  Printer, 
  Info,
  Layers,
  Sparkles
} from 'lucide-react';

interface InteractionCheckerProps {
  selectedDrugs: Drug[];
  allDrugs: Drug[];
  onAddDrug: (drug: Drug) => void;
  onRemoveDrug: (drugId: string) => void;
  onClearAll: () => void;
}

export const InteractionChecker: React.FC<InteractionCheckerProps> = ({
  selectedDrugs,
  allDrugs,
  onAddDrug,
  onRemoveDrug,
  onClearAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Search candidate drugs
  const searchResults = searchQuery.trim()
    ? allDrugs
        .filter(
          (d) =>
            !selectedDrugs.some((sd) => sd.id === d.id) &&
            (d.tradeNameAr.includes(searchQuery) ||
              d.tradeNameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
              d.genericName.toLowerCase().includes(searchQuery.toLowerCase()))
        )
        .slice(0, 8)
    : [];

  // Analyze all combinations of selected drugs
  const detectedInteractions: DetectedInteraction[] = [];

  for (let i = 0; i < selectedDrugs.length; i++) {
    for (let j = i + 1; j < selectedDrugs.length; j++) {
      const d1 = selectedDrugs[i];
      const d2 = selectedDrugs[j];

      // 1. Check duplicate active ingredient / same category duplication
      if (d1.genericName.toLowerCase() === d2.genericName.toLowerCase()) {
        detectedInteractions.push({
          drug1: d1,
          drug2: d2,
          severity: 'severe',
          title: 'ازدواجية مفرطة في نفس المادة الفعالة (خطر الجرعة الزائدة)',
          description: `كلا الدواءين يحتويان على نفس المركب الدوائي (${d1.genericName}) مما يضاعف الجرعة ويعرض المريض للتسمم.`,
          clinicalEffect: 'تسمم دوائي، فشل كلوي أو كبدي بحسب نوع المادة.',
          recommendation: 'احذف أحدهما واكتفِ بصنف واحد بالجرعة الموصى بها.'
        });
      }

      // 2. Check clinical interaction database
      const matchedRule = INTERACTIONS_DATABASE.find(
        (rule) =>
          (d1.genericName.toLowerCase().includes(rule.drug1Generic.toLowerCase()) &&
            d2.genericName.toLowerCase().includes(rule.drug2Generic.toLowerCase())) ||
          (d2.genericName.toLowerCase().includes(rule.drug1Generic.toLowerCase()) &&
            d1.genericName.toLowerCase().includes(rule.drug2Generic.toLowerCase()))
      );

      if (matchedRule) {
        detectedInteractions.push({
          drug1: d1,
          drug2: d2,
          severity: matchedRule.severity,
          title: matchedRule.title,
          description: matchedRule.description,
          clinicalEffect: matchedRule.clinicalEffect,
          recommendation: matchedRule.recommendation,
        });
      }
    }
  }

  const severeCount = detectedInteractions.filter((i) => i.severity === 'severe').length;
  const moderateCount = detectedInteractions.filter((i) => i.severity === 'moderate').length;

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header Title & Info */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <ArrowLeftRight className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
                فاحص التداخلات والتعارضات الدوائية السريرية
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                أضف دوائين أو أكثر لفحص التداخلات الكيميائية، ازدواجية الجرعة، والآثار العكسية على الكلى والقلب
              </p>
            </div>
          </div>

          {selectedDrugs.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>طباعة التقرير</span>
              </button>

              <button
                onClick={onClearAll}
                className="px-3 py-2 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 hover:bg-rose-100 text-xs font-bold flex items-center gap-1.5 transition-colors border border-rose-200 dark:border-rose-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>مسح الكل</span>
              </button>
            </div>
          )}
        </div>

        {/* Drug Selection & Add Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
          <div className="relative">
            <Search className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="interaction-search-drug-input"
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearching(true);
              }}
              placeholder="ابحث عن دواء لإضافته لقائمة الفحص (اسم تجاري أو علمي)..."
              className="w-full pl-3 pr-10 py-2.5 rounded-2xl text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-hidden focus:border-emerald-500"
            />

            {/* Dropdown Autocomplete */}
            {isSearching && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-30 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700">
                {searchResults.map((drug) => (
                  <div
                    key={drug.id}
                    onClick={() => {
                      onAddDrug(drug);
                      setSearchQuery('');
                      setIsSearching(false);
                    }}
                    className="p-3 hover:bg-emerald-50 dark:hover:bg-slate-700/80 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900 dark:text-white">
                        {drug.tradeNameAr} <span className="text-xs text-slate-400 font-normal">({drug.tradeNameEn})</span>
                      </div>
                      <div className="text-xs text-emerald-600 dark:text-emerald-400 font-mono">
                        {drug.genericName} • {drug.strength}
                      </div>
                    </div>
                    <button className="px-3 py-1 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center gap-1">
                      <Plus className="w-3.5 h-3.5" />
                      <span>إضافة</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Currently Selected Drugs Chips */}
          <div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              الأدوية قيد الفحص حالياً ({selectedDrugs.length}):
            </div>

            {selectedDrugs.length === 0 ? (
              <div className="p-6 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
                لم تقم باختيار أي أدوية بعد. ابحث في الحقل أعلاه أو انقر على أيقونة التداخلات 🔁 في قائمة الأدوية لإضافة أصناف هنا.
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {selectedDrugs.map((drug) => (
                  <div
                    key={drug.id}
                    className="flex items-center gap-2 pl-2 pr-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-bold shadow-xs"
                  >
                    <div className="text-right">
                      <div>{drug.tradeNameAr} ({drug.tradeNameEn})</div>
                      <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono font-normal">
                        {drug.genericName}
                      </div>
                    </div>
                    <button
                      onClick={() => onRemoveDrug(drug.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      title="إزالة"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Results Analysis */}
        {selectedDrugs.length < 2 ? (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <Info className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h4 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              أضف دواءً ثانياً على الأقل لبدء الفحص التلقائي
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              سيقوم المحرك بتحليل كافة الأزواج الدوائية المحتملة وإظهار التحذيرات السريرية وتوصيات الصرف.
            </p>
          </div>
        ) : detectedInteractions.length === 0 ? (
          /* Safe Result */
          <div className="p-6 bg-emerald-50 dark:bg-emerald-950/40 rounded-3xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-4">
            <div className="p-3 rounded-2xl bg-emerald-600 text-white shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-emerald-900 dark:text-emerald-200 text-base">
                لم يتم رصد أي تداخلات خطيرة أو تعارضات سريرية معروفة بين هذه الأدوية
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300/80 mt-1 leading-relaxed">
                التركيبة تبدو آمنة سريرياً من حيث التداخلات الدوائية المباشرة. يُنصح دائماً بمراجعة الجرعات الموصوفة وتوجيه المريض لأوقات التناول الصحيحة.
              </p>
            </div>
          </div>
        ) : (
          /* Interaction Warnings */
          <div className="space-y-4">
            {/* Status Summary Banner */}
            <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 flex items-center justify-between gap-3 text-xs font-bold text-rose-900 dark:text-rose-200">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600" />
                <span>
                  تم رصد {detectedInteractions.length} تعارض دوائي ({severeCount} حرج، {moderateCount} متوسط)
                </span>
              </div>
              <span className="text-[11px] px-2.5 py-1 rounded-xl bg-rose-600 text-white font-extrabold">
                تنبيه سريري للصيدلي
              </span>
            </div>

            {/* Interactions List */}
            <div className="space-y-3">
              {detectedInteractions.map((item, idx) => (
                <div
                  key={idx}
                  className={`p-5 rounded-3xl border transition-all ${
                    item.severity === 'severe'
                      ? 'bg-white dark:bg-slate-900 border-rose-300 dark:border-rose-900 shadow-sm'
                      : 'bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-900 shadow-sm'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`px-3 py-1 rounded-xl text-xs font-black ${
                          item.severity === 'severe'
                            ? 'bg-rose-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.severity === 'severe' ? '🔴 تعارض حرج وشديد' : '🟡 تعارض متوسط'}
                      </span>

                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {item.title}
                      </h4>
                    </div>

                    <div className="text-xs font-bold text-slate-400 shrink-0">
                      {item.drug1.tradeNameAr} ✕ {item.drug2.tradeNameAr}
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="mt-3.5 space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                      <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                        الآلية الكيميائية والتأثير السريري:
                      </span>
                      <p className="leading-relaxed">{item.description}</p>
                      <p className="text-rose-600 dark:text-rose-400 font-semibold mt-1">
                        النتيجة: {item.clinicalEffect}
                      </p>
                    </div>

                    <div className="p-3 bg-emerald-50/70 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-900/60">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 block mb-0.5">
                        التوصية الصيدلانية السريرية للتعامل مع الحالة:
                      </span>
                      <p className="text-emerald-950 dark:text-emerald-200 font-medium leading-relaxed">
                        {item.recommendation}
                      </p>
                    </div>
                  </div>

                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
