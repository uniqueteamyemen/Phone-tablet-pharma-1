import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Search, Pill, Sparkles, Check, ChevronDown, Layers, Building, AlertCircle } from 'lucide-react';
import { PharmaCatalogDrug } from '../types/pharmayemen';
import { rankMedicinesBySearch } from '../medicineSearch';
import { resolveActiveIngredient } from '../utils/pharmaClinicalMatcher';

interface DrugSearchComboboxProps {
  catalog: PharmaCatalogDrug[];
  value: string;
  selectedDrug: PharmaCatalogDrug | null;
  onChangeQuery: (text: string) => void;
  onSelectDrug: (drug: PharmaCatalogDrug) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

export const DrugSearchCombobox: React.FC<DrugSearchComboboxProps> = ({
  catalog,
  value,
  selectedDrug,
  onChangeQuery,
  onSelectDrug,
  placeholder = "اكتب اسم الدواء تجارياً أو علمياً (مثل: اوجم، augmentin، panadol...)",
  autoFocus = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute suggestions with fuzzy + brand-to-generic + typo tolerance
  const searchResults = useMemo(() => {
    if (!value || !value.trim()) return [];
    return rankMedicinesBySearch(catalog, value.trim()).slice(0, 8);
  }, [catalog, value]);

  // Compute active ingredient info for the selected drug or typed text
  const clinicalInfo = useMemo(() => {
    if (selectedDrug) {
      return resolveActiveIngredient(selectedDrug.genericName, catalog);
    }
    if (value && value.trim().length >= 2) {
      return resolveActiveIngredient(value.trim(), catalog);
    }
    return null;
  }, [selectedDrug, value, catalog]);

  const handleSelect = (drug: PharmaCatalogDrug) => {
    onSelectDrug(drug);
    onChangeQuery(drug.genericName);
    setIsOpen(false);
  };

  return (
    <div className="relative w-full space-y-1.5" ref={containerRef}>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          autoFocus={autoFocus}
          onChange={(e) => {
            onChangeQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (value.trim().length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500 focus:border-teal-500 focus:outline-none transition shadow-xs"
        />

        {/* Start Icon (Pill / Search) */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-teal-600 dark:text-teal-400 pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        {/* End Actions / Indicator */}
        <div className="absolute left-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <button
              type="button"
              onClick={() => {
                onChangeQuery('');
                setIsOpen(false);
                inputRef.current?.focus();
              }}
              className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center text-[10px] transition cursor-pointer"
              title="مسح"
            >
              ✕
            </button>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 cursor-pointer ${
              isOpen ? 'rotate-180 text-teal-500' : ''
            }`}
            onClick={() => setIsOpen((prev) => !prev)}
          />
        </div>
      </div>

      {/* Auto-Suggest Dropdown */}
      {isOpen && searchResults.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xl overflow-hidden divide-y divide-slate-100 dark:divide-slate-800 max-h-64 overflow-y-auto animate-in fade-in-50 duration-150">
          <div className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span className="flex items-center gap-1 text-teal-700 dark:text-teal-300">
              <Sparkles className="w-3 h-3 text-amber-500" />
              النتائج المقترحة الذكية والبدائل ({searchResults.length}):
            </span>
            <span className="text-[10px] text-slate-400">اختر للتعبئة الفورية</span>
          </div>

          {searchResults.map((drug) => {
            const isCurrent = selectedDrug?.id === drug.id;
            return (
              <div
                key={drug.id}
                onClick={() => handleSelect(drug)}
                className={`p-3 text-right hover:bg-teal-50/70 dark:hover:bg-teal-950/40 cursor-pointer transition flex items-start justify-between gap-2 ${
                  isCurrent ? 'bg-teal-50 dark:bg-teal-950/60' : ''
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white uppercase tracking-wide">
                      {drug.genericName}
                    </span>
                    {drug.genericNameAr && drug.genericNameAr !== drug.genericName && (
                      <span className="text-xs text-teal-700 dark:text-teal-400 font-medium">
                        ({drug.genericNameAr})
                      </span>
                    )}
                    {drug.brandName && drug.brandName.toLowerCase() !== drug.genericName.toLowerCase() && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                        تجاري: {drug.brandName}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 flex-wrap">
                    {drug.dosageForm && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                        {drug.dosageForm}
                      </span>
                    )}
                    {drug.strength && (
                      <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300 font-semibold">
                        {drug.strength}
                      </span>
                    )}
                    {drug.category && (
                      <span className="text-[10px] text-slate-400">
                        • {drug.category}
                      </span>
                    )}
                  </div>
                </div>

                {isCurrent ? (
                  <div className="w-5 h-5 rounded-full bg-teal-600 text-white flex items-center justify-center shrink-0 mt-1">
                    <Check className="w-3 h-3" />
                  </div>
                ) : (
                  <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold hover:underline shrink-0 mt-1">
                    اختيار
                  </span>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Selected Drug Badge & Clinical Active Ingredient Confirmation */}
      {selectedDrug && (
        <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/40 border border-teal-500/30 text-teal-900 dark:text-teal-200 flex items-center justify-between gap-2 animate-in fade-in-50">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
              <Pill className="w-3.5 h-3.5" />
            </div>
            <div className="truncate text-xs">
              <span className="font-bold">{selectedDrug.genericName}</span>
              <span className="text-slate-500 dark:text-slate-400 text-[11px] mr-1.5">
                ({selectedDrug.dosageForm || 'هيئة عامة'} {selectedDrug.strength ? `• ${selectedDrug.strength}` : ''})
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold bg-teal-600 text-white px-2 py-0.5 rounded-full shrink-0">
            صنف معتمد
          </span>
        </div>
      )}

      {/* Smart Active Ingredient Hint if not selected from catalog */}
      {!selectedDrug && clinicalInfo && clinicalInfo.genericEn && value.trim().length >= 3 && (
        <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-[11px] flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>
              المادة الفعالة المعيارية المتوقعة للمطابقة: <strong>{clinicalInfo.genericEn}</strong> ({clinicalInfo.genericAr})
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
