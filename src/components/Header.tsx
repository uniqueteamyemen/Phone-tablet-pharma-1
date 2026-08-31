import React from 'react';
import { 
  Pill, 
  Search, 
  PlusCircle, 
  Download, 
  RotateCcw, 
  AlertTriangle, 
  Moon, 
  Sun,
  ShieldCheck
} from 'lucide-react';
import { TherapeuticCategory } from '../types';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  categories: TherapeuticCategory[];
  totalDrugsCount: number;
  lowStockCount: number;
  onOpenAddModal: () => void;
  onExport: () => void;
  onReset: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  categories,
  totalDrugsCount,
  lowStockCount,
  onOpenAddModal,
  onExport,
  onReset,
  darkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-30 shadow-xs transition-colors">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3.5">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          
          {/* Brand & Logo */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
                <Pill className="w-6 h-6 rotate-45" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold text-lg sm:text-xl text-slate-900 dark:text-white tracking-tight">
                    دليل الأدوية الشامل
                  </h1>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    نسخة التابلت 🇾🇪
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  المرجع الدوائي والصيدلاني التفاعلي • {totalDrugsCount} صنف دوائي مسجل
                </p>
              </div>
            </div>

            {/* Mobile / Quick Action buttons */}
            <div className="flex md:hidden items-center gap-1.5">
              <button
                id="header-dark-mode-toggle-mobile"
                onClick={onToggleDarkMode}
                className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700"
                title="تبديل الوضع الليلي"
              >
                {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
              <button
                id="header-add-drug-mobile"
                onClick={onOpenAddModal}
                className="p-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm"
                title="إضافة دواء جديد"
              >
                <PlusCircle className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-1 max-w-2xl items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                id="global-drug-search-input"
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="ابحث بالاسم التجاري أو العلمي (عربي/En)، الشركة، أو دواعي الاستعمال..."
                className="w-full pl-3 pr-9 py-2 rounded-xl text-sm bg-slate-100 dark:bg-slate-800 border border-transparent focus:border-emerald-500 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden text-slate-900 dark:text-white placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              id="global-category-filter-select"
              value={selectedCategory}
              onChange={(e) => onSelectCategory(e.target.value)}
              className="hidden lg:block max-w-[200px] py-2 px-3 rounded-xl text-xs sm:text-sm bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-emerald-500"
            >
              <option value="ALL">جميع التصنيفات الدوائية</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat.split('(')[0].trim()}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action Icons (Tablet & Desktop) */}
          <div className="hidden md:flex items-center gap-2">
            {lowStockCount > 0 && (
              <div 
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300 text-xs font-semibold"
                title="تنبيه: يوجد أدوية قاربت على النفاد بالمخزون"
              >
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                <span>{lowStockCount} نواقص</span>
              </div>
            )}

            <button
              id="header-btn-add-drug"
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors"
            >
              <PlusCircle className="w-4 h-4" />
              <span>إضافة دواء</span>
            </button>

            <button
              id="header-btn-export-backup"
              onClick={onExport}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-colors"
              title="تصدير نسخة احتياطية من قاعدة البيانات JSON"
            >
              <Download className="w-3.5 h-3.5" />
              <span>نسخ احتياطي</span>
            </button>

            <button
              id="header-btn-reset-db"
              onClick={onReset}
              className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-slate-200 dark:border-slate-700 transition-colors"
              title="استعادة قاعدة البيانات الافتراضية"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            <button
              id="header-btn-theme-toggle"
              onClick={onToggleDarkMode}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors"
              title="تبديل الوضع الليلي / الفاتح"
            >
              {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
