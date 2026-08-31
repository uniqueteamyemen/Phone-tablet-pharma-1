import React, { useState } from 'react';
import { 
  Drug, 
  PregnancyCategory 
} from '../types';
import { 
  X, 
  Heart, 
  Printer, 
  ArrowLeftRight, 
  Plus, 
  Building2, 
  ShieldAlert, 
  AlertCircle, 
  Clock, 
  Baby, 
  Pill, 
  Boxes, 
  Sparkles, 
  DollarSign,
  Share2,
  CheckCircle2,
  Copy
} from 'lucide-react';

interface DrugDetailPaneProps {
  drug: Drug | null;
  allDrugs: Drug[];
  onClose: () => void;
  onToggleFavorite: (drugId: string) => void;
  onAddToInteractions: (drug: Drug) => void;
  onAddToPrescription: (drug: Drug) => void;
  onSelectAlternativeDrug: (drug: Drug) => void;
  onUpdateStock: (drugId: string, newStock: number) => void;
}

export const DrugDetailPane: React.FC<DrugDetailPaneProps> = ({
  drug,
  allDrugs,
  onClose,
  onToggleFavorite,
  onAddToInteractions,
  onAddToPrescription,
  onSelectAlternativeDrug,
  onUpdateStock,
}) => {
  const [activeDetailTab, setActiveDetailTab] = useState<'overview' | 'dosing' | 'safety' | 'alternatives'>('overview');
  const [copied, setCopied] = useState(false);
  const [stockEditValue, setStockEditValue] = useState<number | null>(null);

  if (!drug) {
    return (
      <div className="hidden lg:flex flex-col items-center justify-center h-full p-8 text-center bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-96 xl:w-[450px]">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center mb-4">
          <Pill className="w-8 h-8 rotate-45" />
        </div>
        <h3 className="font-extrabold text-slate-800 dark:text-slate-200 text-lg">
          حدد دواءً لعرض النشرة الدوائية الكاملة
        </h3>
        <p className="text-xs text-slate-400 mt-2 max-w-xs leading-relaxed">
          انقر على أي بطاقة صنف لعرض دواعي الاستعمال، الجرعات الدقيقة للكبار والأطفال، بدائل الدواء، وموانع الاستخدام وفئات أمان الحمل.
        </p>
      </div>
    );
  }

  // Find exact same generic alternatives
  const genericAlternatives = allDrugs.filter(
    (d) => d.genericName.toLowerCase() === drug.genericName.toLowerCase() && d.id !== drug.id
  );

  // Find category alternatives
  const categoryAlternatives = allDrugs.filter(
    (d) => d.category === drug.category && d.id !== drug.id && d.genericName !== drug.genericName
  ).slice(0, 3);

  const getPregnancyBadgeColor = (cat: PregnancyCategory) => {
    switch (cat) {
      case 'A': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'C': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300';
      case 'X': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 border-slate-300';
    }
  };

  const handleCopySummary = () => {
    const text = `دواء: ${drug.tradeNameAr} (${drug.tradeNameEn})
الاسم العلمي: ${drug.genericName}
التركيز والشكل: ${drug.strength} - ${drug.form}
الشركة المصنعة: ${drug.manufacturer} (${drug.country})
السعر التقريبي: ${drug.priceYER} ريال يمني
الجرعة للبالغين: ${drug.dosageAdult}
دواعي الاستعمال: ${drug.indications.join('، ')}
موانع الاستعمال: ${drug.contraindications.join('، ')}`;

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 w-full lg:w-[420px] xl:w-[480px] shrink-0 z-20 shadow-lg lg:shadow-none overflow-hidden">
      
      {/* Top Header with Actions */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-2 bg-slate-50/70 dark:bg-slate-850/70">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-extrabold text-xl text-slate-900 dark:text-white">
              {drug.tradeNameAr}
            </h2>
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              ({drug.tradeNameEn})
            </span>
          </div>
          <p className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400 mt-0.5">
            {drug.genericName}
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggleFavorite(drug.id)}
            className={`p-2 rounded-xl transition-colors ${
              drug.isFavorite
                ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                : 'text-slate-400 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
            title="المفضلة"
          >
            <Heart className={`w-4 h-4 ${drug.isFavorite ? 'fill-amber-500' : ''}`} />
          </button>
          
          <button
            onClick={handleCopySummary}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="نسخ ملخص النشرة"
          >
            {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handlePrint}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="طباعة النشرة الطبية"
          >
            <Printer className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="إغلاق"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Summary Pill Bar */}
      <div className="px-4 py-3 bg-slate-100/60 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold px-2 py-0.5 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
            {drug.form.split('(')[0].trim()} • {drug.strength}
          </span>
          {drug.isYemeniLocal && (
            <span className="font-extrabold px-2 py-0.5 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300">
              🇾🇪 يمني ({drug.manufacturer.split('(')[0]})
            </span>
          )}
        </div>

        <div className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
          {drug.priceYER.toLocaleString()} YER
        </div>
      </div>

      {/* Detail Navigation Subtabs */}
      <div className="flex items-center border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 text-xs font-bold">
        <button
          onClick={() => setActiveDetailTab('overview')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
            activeDetailTab === 'overview'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          نظرة عامة ودواعي الاستعمال
        </button>
        <button
          onClick={() => setActiveDetailTab('dosing')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
            activeDetailTab === 'dosing'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          الجرعات وطريقة الاستخدام
        </button>
        <button
          onClick={() => setActiveDetailTab('safety')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
            activeDetailTab === 'safety'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          الأمان وموانع الاستعمال
        </button>
        <button
          onClick={() => setActiveDetailTab('alternatives')}
          className={`flex-1 py-2.5 text-center border-b-2 transition-all ${
            activeDetailTab === 'alternatives'
              ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          البدائل والمثائل ({genericAlternatives.length})
        </button>
      </div>

      {/* Tab Body */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
        
        {/* Tab 1: Overview */}
        {activeDetailTab === 'overview' && (
          <div className="space-y-4">
            {/* Category */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                التصنيف العلاجي
              </div>
              <p className="font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700">
                {drug.category}
              </p>
            </div>

            {/* Indications */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>دواعي الاستعمال المعتمدة</span>
              </div>
              <ul className="space-y-1.5">
                {drug.indications.map((ind, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-emerald-50/50 dark:bg-emerald-950/30 p-2 rounded-xl border border-emerald-100 dark:border-emerald-900/60"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-1.5 shrink-0" />
                    <span className="font-medium text-slate-800 dark:text-slate-200">{ind}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Manufacturer & Country */}
            <div className="grid grid-cols-2 gap-2">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">الشركة المصنعة</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{drug.manufacturer}</span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">بلد المنشأ</span>
                <span className="font-bold text-slate-900 dark:text-white mt-0.5 block">{drug.country}</span>
              </div>
            </div>

            {/* Storage */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <span className="text-[10px] text-slate-400 block font-bold">ظروف الحفظ والتخزين</span>
              <span className="font-medium text-slate-800 dark:text-slate-200 mt-0.5 block">{drug.storage}</span>
            </div>

            {/* Stock Manager in Monograph */}
            <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 block">
                  رصيد المخزون الحالي
                </span>
                <span className="text-[10px] text-slate-400">
                  تنبيه النواقص عند: {drug.minStockAlert} عبوات
                </span>
              </div>
              
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onUpdateStock(drug.id, Math.max(0, drug.stockCount - 1))}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-200"
                >
                  -
                </button>
                <span className="font-extrabold text-sm px-2 text-emerald-700 dark:text-emerald-400">
                  {drug.stockCount}
                </span>
                <button
                  onClick={() => onUpdateStock(drug.id, drug.stockCount + 1)}
                  className="w-7 h-7 rounded-lg bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold border border-slate-300 dark:border-slate-600 flex items-center justify-center hover:bg-slate-200"
                >
                  +
                </button>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Dosing */}
        {activeDetailTab === 'dosing' && (
          <div className="space-y-4">
            {/* Adult Dosing */}
            <div className="p-3.5 bg-blue-50/60 dark:bg-blue-950/40 rounded-2xl border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-1.5 font-bold text-blue-900 dark:text-blue-200 text-xs mb-1.5">
                <Clock className="w-4 h-4 text-blue-600" />
                <span>جرعة البالغين وكبار السن (Adults)</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {drug.dosageAdult}
              </p>
            </div>

            {/* Pediatric Dosing */}
            <div className="p-3.5 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 dark:text-emerald-200 text-xs mb-1.5">
                <Baby className="w-4 h-4 text-emerald-600" />
                <span>جرعة الأطفال والرضع (Pediatrics)</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {drug.dosagePediatric}
              </p>
            </div>

            {/* Interactions Summary */}
            <div className="p-3.5 bg-amber-50/60 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-1.5 font-bold text-amber-900 dark:text-amber-200 text-xs mb-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>تداخلات الأغذية والأدوية الرئيسية</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed">
                {drug.interactionsSummary}
              </p>
            </div>
          </div>
        )}

        {/* Tab 3: Safety & Contraindications */}
        {activeDetailTab === 'safety' && (
          <div className="space-y-4">
            {/* Pregnancy & Lactation Safety */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white">فئة أمان الحمل (FDA Category)</span>
                <span className={`px-2.5 py-1 rounded-xl border text-xs font-black ${getPregnancyBadgeColor(drug.pregnancyCategory)}`}>
                  الفئة {drug.pregnancyCategory}
                </span>
              </div>

              <div>
                <span className="text-[10px] text-slate-400 font-bold block mb-1">السلامة أثناء الرضاعة الطبيعية</span>
                <p className="font-medium text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 p-2 rounded-xl border border-slate-200 dark:border-slate-700">
                  {drug.lactationSafety}
                </p>
              </div>
            </div>

            {/* Contraindications */}
            <div>
              <div className="text-[11px] font-bold text-rose-600 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>موانع الاستعمال والتحذيرات الصارمة</span>
              </div>
              <ul className="space-y-1.5">
                {drug.contraindications.map((contra, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 bg-rose-50/60 dark:bg-rose-950/30 p-2 rounded-xl border border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200 font-medium"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-600 mt-1.5 shrink-0" />
                    <span>{contra}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Side Effects */}
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                الآثار والأعراض الجانبية الشائعة
              </div>
              <div className="flex flex-wrap gap-1.5">
                {drug.sideEffects.map((side, i) => (
                  <span
                    key={i}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-[11px] font-medium"
                  >
                    {side}
                  </span>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* Tab 4: Alternatives */}
        {activeDetailTab === 'alternatives' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mb-2">
                المثائل المتطابقة تماماً (نفس المادة الفعالة والتركيز)
              </h4>

              {genericAlternatives.length === 0 ? (
                <p className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 p-3 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 text-center">
                  لا توجد مثائل تجارية أخرى مسجلة حالياً بنفس الاسم العلمي في الدليل.
                </p>
              ) : (
                <div className="space-y-2">
                  {genericAlternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => onSelectAlternativeDrug(alt)}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200 dark:border-slate-700 hover:border-emerald-400 cursor-pointer transition-all flex items-center justify-between"
                    >
                      <div>
                        <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                          <span>{alt.tradeNameAr}</span>
                          <span className="text-[10px] text-slate-400">({alt.tradeNameEn})</span>
                          {alt.isYemeniLocal && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800">
                              🇾🇪 يمني
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {alt.manufacturer} • {alt.strength}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-extrabold text-xs text-emerald-700 dark:text-emerald-400">
                          {alt.priceYER.toLocaleString()} YER
                        </div>
                        <div className="text-[10px] text-slate-400">
                          المخزون: {alt.stockCount}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Category Alternatives */}
            {categoryAlternatives.length > 0 && (
              <div>
                <h4 className="font-extrabold text-slate-900 dark:text-white text-xs mb-2">
                  بدائل علاجية أخرى من نفس الفئة ({drug.category.split('(')[0]})
                </h4>
                <div className="space-y-2">
                  {categoryAlternatives.map((alt) => (
                    <div
                      key={alt.id}
                      onClick={() => onSelectAlternativeDrug(alt)}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700 cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 dark:text-white text-xs">
                          {alt.tradeNameAr}
                        </span>
                        <span className="text-[10px] text-slate-400 block font-mono">
                          {alt.genericName}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                        {alt.priceYER.toLocaleString()} YER
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Bottom Action Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
        <button
          id="detail-pane-btn-add-interaction"
          onClick={() => onAddToInteractions(drug)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/50 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200 dark:border-slate-700"
        >
          <ArrowLeftRight className="w-4 h-4 text-rose-500" />
          <span>فاحص التداخلات</span>
        </button>

        <button
          id="detail-pane-btn-add-rx"
          onClick={() => onAddToPrescription(drug)}
          className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة للروشتة</span>
        </button>
      </div>

    </div>
  );
};
