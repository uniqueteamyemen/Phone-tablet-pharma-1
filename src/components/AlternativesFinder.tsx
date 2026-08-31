import React, { useState } from 'react';
import { Drug } from '../types';
import { 
  Repeat, 
  Search, 
  ArrowRightLeft, 
  CheckCircle2, 
  Building2, 
  TrendingDown,
  Pill,
  Sparkles,
  Layers
} from 'lucide-react';

interface AlternativesFinderProps {
  allDrugs: Drug[];
  onSelectDrug: (drug: Drug) => void;
  onAddToPrescription: (drug: Drug) => void;
}

export const AlternativesFinder: React.FC<AlternativesFinderProps> = ({
  allDrugs,
  onSelectDrug,
  onAddToPrescription,
}) => {
  const [searchTarget, setSearchTarget] = useState('');
  const [selectedTargetDrug, setSelectedTargetDrug] = useState<Drug | null>(allDrugs[0] || null);

  // Search matches
  const targetSearchResults = searchTarget.trim()
    ? allDrugs.filter(
        (d) =>
          d.tradeNameAr.includes(searchTarget) ||
          d.tradeNameEn.toLowerCase().includes(searchTarget.toLowerCase()) ||
          d.genericName.toLowerCase().includes(searchTarget.toLowerCase())
      )
    : allDrugs.slice(0, 8);

  // Find exact same generic matches
  const exactEquivalents = selectedTargetDrug
    ? allDrugs.filter(
        (d) =>
          d.genericName.toLowerCase() === selectedTargetDrug.genericName.toLowerCase() &&
          d.id !== selectedTargetDrug.id
      )
    : [];

  // Find category alternatives
  const classAlternatives = selectedTargetDrug
    ? allDrugs.filter(
        (d) =>
          d.category === selectedTargetDrug.category &&
          d.genericName.toLowerCase() !== selectedTargetDrug.genericName.toLowerCase()
      )
    : [];

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-y-auto p-4 sm:p-6">
      <div className="max-w-5xl mx-auto w-full space-y-6">
        
        {/* Header */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
            <Repeat className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-black text-lg sm:text-xl text-slate-900 dark:text-white">
              محرك البحث عن البدائل والمثائل الدوائية (Yemen Generic Finder)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              اعثر على البديل المحلي اليمني الأوفر والمطابق علمياً عند انقطاع الصنف أو لتوفير تكلفة العلاج
            </p>
          </div>
        </div>

        {/* Selection & Target Box */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Target Drug Selector */}
          <div className="lg:col-span-4 bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <span className="text-xs font-extrabold text-slate-900 dark:text-white block">
              1. اختر الدواء المراد إيجاد بدائله:
            </span>

            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTarget}
                onChange={(e) => setSearchTarget(e.target.value)}
                placeholder="ابحث بالاسم التجاري أو العلمي..."
                className="w-full pl-2 pr-9 py-2 rounded-xl text-xs bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-semibold"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-1.5 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {targetSearchResults.map((drug) => {
                const isSelected = selectedTargetDrug?.id === drug.id;
                return (
                  <div
                    key={drug.id}
                    onClick={() => setSelectedTargetDrug(drug)}
                    className={`p-2.5 rounded-2xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-700 shadow-xs'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
                    }`}
                  >
                    <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                      {drug.tradeNameAr} <span className="text-[10px] text-slate-400 font-normal">({drug.tradeNameEn})</span>
                    </div>
                    <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                      {drug.genericName}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center justify-between">
                      <span>{drug.strength}</span>
                      <span className="font-bold text-slate-700 dark:text-slate-300">{drug.priceYER} YER</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Results Pane */}
          <div className="lg:col-span-8 space-y-5">
            {selectedTargetDrug ? (
              <>
                {/* Target Monograph Summary Card */}
                <div className="p-4 rounded-3xl bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 mb-1 inline-block">
                      الدواء المختار حالياً
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-white">
                      {selectedTargetDrug.tradeNameAr} ({selectedTargetDrug.tradeNameEn})
                    </h3>
                    <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      المادة الفعالة: {selectedTargetDrug.genericName} • {selectedTargetDrug.strength}
                    </p>
                  </div>

                  <div className="text-left">
                    <span className="text-[11px] text-slate-400 block">السعر الحالي:</span>
                    <span className="font-black text-base text-emerald-700 dark:text-emerald-400">
                      {selectedTargetDrug.priceYER.toLocaleString()} YER
                    </span>
                  </div>
                </div>

                {/* Section A: Exact Generic Equivalents (المثائل المتطابقة) */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <h4 className="font-black text-sm text-slate-900 dark:text-white">
                        المثائل المتطابقة علمياً 100% (نفس المادة الفعالة والتركيز)
                      </h4>
                    </div>
                    <span className="text-xs font-bold text-slate-400">
                      {exactEquivalents.length} متوفر
                    </span>
                  </div>

                  {exactEquivalents.length === 0 ? (
                    <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl border border-dashed text-center">
                      لا توجد مثائل تجارية أخرى مسجلة بنفس التركيب في قاعدة البيانات الحالية.
                    </p>
                  ) : (
                    <div className="space-y-2.5">
                      {exactEquivalents.map((eq) => {
                        const priceDiff = selectedTargetDrug.priceYER - eq.priceYER;
                        const isCheaper = priceDiff > 0;

                        return (
                          <div
                            key={eq.id}
                            className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                                  {eq.tradeNameAr}
                                </span>
                                <span className="text-xs text-slate-400">({eq.tradeNameEn})</span>
                                {eq.isYemeniLocal && (
                                  <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
                                    🇾🇪 إنتاج يمني ({eq.manufacturer.split('(')[0]})
                                  </span>
                                )}
                              </div>

                              <div className="text-xs text-slate-500 mt-1">
                                {eq.form.split('(')[0]} • {eq.strength} • المخزون: {eq.stockCount} عبوة
                              </div>
                            </div>

                            <div className="flex items-center gap-3 mr-auto sm:mr-0">
                              <div className="text-left">
                                <div className="font-black text-sm text-emerald-700 dark:text-emerald-400">
                                  {eq.priceYER.toLocaleString()} YER
                                </div>
                                {isCheaper && (
                                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                                    <TrendingDown className="w-3 h-3" />
                                    توفير {priceDiff.toLocaleString()} ريال
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => onAddToPrescription(eq)}
                                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                              >
                                صرف البديل
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Section B: Class Alternatives */}
                <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-blue-600" />
                    <h4 className="font-black text-sm text-slate-900 dark:text-white">
                      بدائل علاجية أخرى من نفس الفئة ({selectedTargetDrug.category.split('(')[0]})
                    </h4>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {classAlternatives.slice(0, 4).map((alt) => (
                      <div
                        key={alt.id}
                        onClick={() => setSelectedTargetDrug(alt)}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 cursor-pointer border border-slate-200 dark:border-slate-700 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {alt.tradeNameAr}
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {alt.genericName}
                          </div>
                        </div>
                        <span className="text-xs font-extrabold text-slate-700 dark:text-slate-300">
                          {alt.priceYER.toLocaleString()} YER
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : null}
          </div>

        </div>

      </div>
    </div>
  );
};
