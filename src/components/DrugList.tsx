import React, { useState } from 'react';
import { 
  Drug, 
  TherapeuticCategory 
} from '../types';
import { 
  Heart, 
  Eye, 
  ArrowLeftRight, 
  Plus, 
  Building2, 
  ShieldAlert, 
  SlidersHorizontal,
  Layers,
  LayoutGrid,
  List as ListIcon
} from 'lucide-react';

interface DrugListProps {
  drugs: Drug[];
  selectedDrug: Drug | null;
  onSelectDrug: (drug: Drug) => void;
  onToggleFavorite: (drugId: string) => void;
  onAddToInteractions: (drug: Drug) => void;
  onAddToPrescription: (drug: Drug) => void;
  interactionDrugIds: string[];
  prescriptionDrugIds: string[];
}

export const DrugList: React.FC<DrugListProps> = ({
  drugs,
  selectedDrug,
  onSelectDrug,
  onToggleFavorite,
  onAddToInteractions,
  onAddToPrescription,
  interactionDrugIds,
  prescriptionDrugIds,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'yemeni' | 'imported' | 'pregnancy-safe' | 'low-stock'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'price-asc' | 'price-desc' | 'stock'>('name');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Filter
  const filteredDrugs = drugs.filter((drug) => {
    if (filterType === 'yemeni') return drug.isYemeniLocal;
    if (filterType === 'imported') return !drug.isYemeniLocal;
    if (filterType === 'pregnancy-safe') return drug.pregnancyCategory === 'A' || drug.pregnancyCategory === 'B';
    if (filterType === 'low-stock') return drug.stockCount <= drug.minStockAlert;
    return true;
  });

  // Sort
  const sortedDrugs = [...filteredDrugs].sort((a, b) => {
    if (sortBy === 'name') return a.tradeNameAr.localeCompare(b.tradeNameAr, 'ar');
    if (sortBy === 'price-asc') return a.priceYER - b.priceYER;
    if (sortBy === 'price-desc') return b.priceYER - a.priceYER;
    if (sortBy === 'stock') return a.stockCount - b.stockCount;
    return 0;
  });

  const getPregnancyBadgeColor = (cat: string) => {
    switch (cat) {
      case 'A': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-300';
      case 'B': return 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border-blue-300';
      case 'C': return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border-amber-300';
      case 'D': return 'bg-orange-100 text-orange-800 dark:bg-orange-950 dark:text-orange-300 border-orange-300';
      case 'X': return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border-rose-300';
      default: return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-300';
    }
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      
      {/* Control Bar: Filters & View Modes */}
      <div className="p-3 sm:p-4 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        
        {/* Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            الكل ({drugs.length})
          </button>
          
          <button
            onClick={() => setFilterType('yemeni')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1 ${
              filterType === 'yemeni'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900 border border-emerald-200 dark:border-emerald-800'
            }`}
          >
            <span>🇾🇪 صناعة محلية يمنية</span>
            <span className="text-[10px] opacity-80">
              ({drugs.filter(d => d.isYemeniLocal).length})
            </span>
          </button>

          <button
            onClick={() => setFilterType('imported')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterType === 'imported'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            مستورد وعالمي ({drugs.filter(d => !d.isYemeniLocal).length})
          </button>

          <button
            onClick={() => setFilterType('pregnancy-safe')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterType === 'pregnancy-safe'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            آمن للحمل (A/B)
          </button>

          <button
            onClick={() => setFilterType('low-stock')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
              filterType === 'low-stock'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
            }`}
          >
            النواقص
          </button>
        </div>

        {/* Sort & Grid/List View Toggles */}
        <div className="flex items-center gap-2 mr-auto">
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl px-2 py-1 border border-slate-200 dark:border-slate-700 text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-slate-700 dark:text-slate-200 focus:outline-hidden font-medium cursor-pointer"
            >
              <option value="name">الترتيب أبجدياً</option>
              <option value="price-asc">السعر: من الأقل للأعلى</option>
              <option value="price-desc">السعر: من الأعلى للأقل</option>
              <option value="stock">الكمية المتوفرة بالمخزون</option>
            </select>
          </div>

          <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-0.5 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="عرض كبطاقات شبكية"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
              }`}
              title="عرض كقائمة مفصلة"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>

      {/* Drug Cards Display */}
      <div className="flex-1 p-3 sm:p-5 overflow-y-auto">
        {sortedDrugs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-3">
              <Layers className="w-6 h-6" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300 text-base">
              لم يتم العثور على أدوية مطابقة للبحث أو التصفية
            </p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              جرب تغيير عبارة البحث أو اختر تصنيفاً آخر، أو أضف دواءً جديداً لقاعدة البيانات.
            </p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 sm:gap-4">
            {sortedDrugs.map((drug) => {
              const isSelected = selectedDrug?.id === drug.id;
              const isInInteractions = interactionDrugIds.includes(drug.id);
              const isInRx = prescriptionDrugIds.includes(drug.id);
              const isLowStock = drug.stockCount <= drug.minStockAlert;

              return (
                <div
                  key={drug.id}
                  id={`drug-card-${drug.id}`}
                  onClick={() => onSelectDrug(drug)}
                  className={`relative p-4 rounded-2xl bg-white dark:bg-slate-900 border transition-all duration-200 cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                      : 'border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-400/80 dark:hover:border-emerald-600/80 hover:shadow-md'
                  }`}
                >
                  <div>
                    {/* Header: Names, Favorite & Yemen badge */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="font-extrabold text-base text-slate-900 dark:text-white leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                            {drug.tradeNameAr}
                          </h3>
                          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            / {drug.tradeNameEn}
                          </span>
                        </div>
                        <p className="text-xs font-medium text-emerald-700 dark:text-emerald-400 mt-0.5 tracking-tight font-mono">
                          {drug.genericName}
                        </p>
                      </div>

                      <button
                        id={`btn-fav-${drug.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleFavorite(drug.id);
                        }}
                        className={`p-1.5 rounded-xl transition-colors ${
                          drug.isFavorite
                            ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/60'
                            : 'text-slate-300 dark:text-slate-600 hover:text-amber-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                        }`}
                        title="إضافة للمفضلة"
                      >
                        <Heart className={`w-4 h-4 ${drug.isFavorite ? 'fill-amber-500' : ''}`} />
                      </button>
                    </div>

                    {/* Meta Badges: Form, Strength, Local/Origin */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-3">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {drug.form.split('(')[0].trim()}
                      </span>
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700">
                        {drug.strength}
                      </span>
                      
                      {drug.isYemeniLocal ? (
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                          🇾🇪 يمني ({drug.manufacturer.split('(')[0].trim()})
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                          {drug.country}
                        </span>
                      )}

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-lg border ${getPregnancyBadgeColor(
                          drug.pregnancyCategory
                        )}`}
                        title={`فئة أمان الحمل: ${drug.pregnancyCategory}`}
                      >
                        حمل: {drug.pregnancyCategory}
                      </span>
                    </div>

                    {/* Indications Snippet */}
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 line-clamp-2 leading-relaxed">
                      {drug.indications.join(' • ')}
                    </p>
                  </div>

                  {/* Footer: Price, Stock, & Quick Add Actions */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-extrabold text-sm">
                          {drug.priceYER.toLocaleString()}
                        </span>
                        <span className="text-[11px] text-slate-500">ريال يمني</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isLowStock ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'
                          }`}
                        />
                        <span>المخزون: {drug.stockCount} عبوة</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-1">
                      <button
                        id={`btn-add-interaction-${drug.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToInteractions(drug);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold transition-all ${
                          isInInteractions
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40'
                        }`}
                        title="إضافة لفاحص التداخلات الدوائية"
                      >
                        <ArrowLeftRight className="w-3.5 h-3.5" />
                      </button>

                      <button
                        id={`btn-add-rx-${drug.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onAddToPrescription(drug);
                        }}
                        className={`p-2 rounded-xl text-xs font-bold transition-all ${
                          isInRx
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-emerald-950/40'
                        }`}
                        title="إضافة للروشتة الطبية"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => onSelectDrug(drug)}
                        className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-bold transition-colors flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>تفاصيل</span>
                      </button>
                    </div>
                  </div>

                </div>
              );
            })}
          </div>
        ) : (
          /* Table / List View for Fast Pharmacy POS/Reference Scanning */
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-xs">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-100/70 dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-700 font-bold">
                <tr>
                  <th className="p-3">اسم الدواء (تجاري / علمي)</th>
                  <th className="p-3">الشكل والتركيز</th>
                  <th className="p-3">الشركة والمنشأ</th>
                  <th className="p-3">الحمل</th>
                  <th className="p-3">السعر (ريال)</th>
                  <th className="p-3">المخزون</th>
                  <th className="p-3 text-center">إجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                {sortedDrugs.map((drug) => (
                  <tr
                    key={drug.id}
                    onClick={() => onSelectDrug(drug)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="p-3">
                      <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                        {drug.tradeNameAr} <span className="font-normal text-slate-500">({drug.tradeNameEn})</span>
                      </div>
                      <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                        {drug.genericName}
                      </div>
                    </td>
                    <td className="p-3">
                      <div>{drug.form.split('(')[0]}</div>
                      <div className="text-slate-400 font-bold">{drug.strength}</div>
                    </td>
                    <td className="p-3">
                      <div>{drug.manufacturer.split('(')[0]}</div>
                      <div className="text-slate-400 text-[10px]">
                        {drug.isYemeniLocal ? '🇾🇪 إنتاج محلي' : drug.country}
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-lg border text-[10px] font-bold ${getPregnancyBadgeColor(drug.pregnancyCategory)}`}>
                        {drug.pregnancyCategory}
                      </span>
                    </td>
                    <td className="p-3 font-extrabold text-emerald-700 dark:text-emerald-400">
                      {drug.priceYER.toLocaleString()} YER
                    </td>
                    <td className="p-3 font-bold">
                      <span className={drug.stockCount <= drug.minStockAlert ? 'text-amber-600' : 'text-slate-600 dark:text-slate-400'}>
                        {drug.stockCount} عبوة
                      </span>
                    </td>
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => onAddToInteractions(drug)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-rose-600"
                          title="إضافة للفاحص"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onAddToPrescription(drug)}
                          className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-emerald-600"
                          title="إضافة للروشتة"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onSelectDrug(drug)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[11px]"
                        >
                          تفاصيل
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
