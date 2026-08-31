import React from 'react';
import { 
  BookOpen, 
  ArrowLeftRight, 
  Calculator, 
  FileText, 
  Repeat, 
  Package, 
  Baby, 
  Sparkles,
  Heart
} from 'lucide-react';
import { ActiveTab } from '../types';

interface TabletSidebarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  interactionCount: number;
  lowStockCount: number;
  prescriptionItemCount: number;
  favoritesCount: number;
  showOnlyFavorites: boolean;
  onToggleShowFavorites: () => void;
}

export const TabletSidebar: React.FC<TabletSidebarProps> = ({
  activeTab,
  onSelectTab,
  interactionCount,
  lowStockCount,
  prescriptionItemCount,
  favoritesCount,
  showOnlyFavorites,
  onToggleShowFavorites,
}) => {
  const tabs = [
    {
      id: 'formulary' as ActiveTab,
      label: 'دليل الأدوية',
      sublabel: 'فهرس الأصناف',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'interactions' as ActiveTab,
      label: 'فاحص التداخلات',
      sublabel: 'فحص التعارضات',
      icon: ArrowLeftRight,
      badge: interactionCount > 0 ? interactionCount : null,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'calculator' as ActiveTab,
      label: 'حاسبة الجرعات',
      sublabel: 'جرعات الأطفال والبالغين',
      icon: Calculator,
      badge: null,
    },
    {
      id: 'prescription' as ActiveTab,
      label: 'مراجع الروشتة',
      sublabel: 'فحص وتدقيق الوصفة',
      icon: FileText,
      badge: prescriptionItemCount > 0 ? prescriptionItemCount : null,
      badgeColor: 'bg-emerald-600 text-white',
    },
    {
      id: 'alternatives' as ActiveTab,
      label: 'البدائل والمثائل',
      sublabel: 'البديل اليمني والعلمي',
      icon: Repeat,
      badge: null,
    },
    {
      id: 'inventory' as ActiveTab,
      label: 'المخزون والأسعار',
      sublabel: 'النواقص ونقاط البيع',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'pregnancy' as ActiveTab,
      label: 'الحمل والرضاعة',
      sublabel: 'تصنيفات السلامة',
      icon: Baby,
      badge: null,
    },
    {
      id: 'ai-assistant' as ActiveTab,
      label: 'المستشار الذكي',
      sublabel: 'استشارات سريرية AI',
      icon: Sparkles,
      badge: 'جديد',
      badgeColor: 'bg-violet-600 text-white',
    },
  ];

  return (
    <aside className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 w-full md:w-64 lg:w-72 select-none">
      <div className="p-3 sm:p-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 py-1.5 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase">
          الأقسام الصيدلانية
        </div>

        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              id={`sidebar-tab-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl font-medium transition-all group ${
                isActive
                  ? 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800 shadow-xs'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`p-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="text-sm leading-tight">{tab.label}</div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
                    {tab.sublabel}
                  </div>
                </div>
              </div>

              {tab.badge !== null && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    tab.badgeColor || 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Favorites Quick Filter in Formulary */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-2">
          <button
            id="sidebar-toggle-favorites"
            onClick={onToggleShowFavorites}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              showOnlyFavorites
                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <Heart
                className={`w-4 h-4 ${
                  showOnlyFavorites ? 'fill-amber-500 text-amber-500' : 'text-slate-400'
                }`}
              />
              <span>الأدوية المفضلة</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-[11px] font-bold text-slate-700 dark:text-slate-300">
              {favoritesCount}
            </span>
          </button>
        </div>
      </div>

      {/* Footer Info / Unique Team Yemen Badge */}
      <div className="p-3 sm:p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div className="p-3 rounded-xl bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-850 border border-slate-200 dark:border-slate-700/60 text-center">
          <div className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
            تطوير: Unique Team Yemen 🇾🇪
          </div>
          <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
            نسخة مخصصة للمشافي والصيادلة والتابلت
          </div>
        </div>
      </div>
    </aside>
  );
};
