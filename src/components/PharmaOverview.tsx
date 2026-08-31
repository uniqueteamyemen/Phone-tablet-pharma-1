import React, { useState } from 'react';
import { 
  Building2, 
  FileText, 
  ArrowLeftRight, 
  AlertCircle, 
  TrendingUp, 
  Plus, 
  ShieldCheck, 
  Calendar,
  Sparkles,
  MapPin,
  CheckCircle2,
  Phone,
  FlaskConical,
  Pill,
  Truck,
  ImageIcon,
  AlertTriangle,
  Flame,
  Clock
} from 'lucide-react';
import { PharmaEntity, PharmaOffer, PharmaRequest, PharmaMatch, CATEGORY_TYPE_LABELS } from '../types/pharmayemen';
import { PharmaLogo } from './PharmaLogo';
import { Pharma24hActivityWidget } from './Pharma24hActivityWidget';
import { INITIAL_EARLY_WARNING_ALERTS } from '../utils/pharmaStorage';

interface PharmaOverviewProps {
  entity: PharmaEntity;
  entitiesList?: PharmaEntity[];
  offers: PharmaOffer[];
  requests: PharmaRequest[];
  matches: PharmaMatch[];
  userRole?: 'admin' | 'pharmacy' | 'visitor';
  autoExpiryEnabled?: boolean;
  onToggleAutoExpiry?: () => void;
  onNavigateTab: (tab: 'catalog' | 'offers' | 'requests' | 'matches' | 'clinical' | 'entities') => void;
  onOpenCreateOffer: () => void;
  onOpenCreateRequest: () => void;
  onOpenUserManager?: () => void;
  onSelectEntity?: (entity: PharmaEntity) => void;
}

export const PharmaOverview: React.FC<PharmaOverviewProps> = ({
  entity,
  entitiesList = [],
  offers,
  requests,
  matches,
  userRole = 'visitor',
  autoExpiryEnabled = false,
  onToggleAutoExpiry,
  onNavigateTab,
  onOpenCreateOffer,
  onOpenCreateRequest,
  onOpenUserManager,
  onSelectEntity,
}) => {
  const activeOffers = offers.filter((o) => o.status === 'active');
  const openRequests = requests.filter((r) => r.status === 'open');
  const criticalRequests = openRequests.filter((r) => r.urgency === 'critical' || r.urgency === 'high');

  // Suppliers, Wholesalers, Beauty & Supplements Breakdown
  const supplierCount = entitiesList.filter((e) => e.type === 'distributor' || e.type === 'wholesaler' || e.type === 'individual_supplier').length || 2;
  const healthAndCareCount = entitiesList.filter((e) => e.type === 'beauty_skincare' || e.type === 'supplements_nutrition').length || 1;
  const hospitalCount = entitiesList.filter((e) => e.type === 'hospital' || e.type === 'clinic').length || 1;
  const pharmacyCount = entitiesList.filter((e) => e.type === 'pharmacy').length || 2;
  const totalRegisteredEntities = entitiesList.length > 0 ? entitiesList.length : 6;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100" dir="rtl">
      
      {/* Welcome Banner with Official Logo */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-5 sm:p-6 rounded-3xl shadow-lg border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-5 relative overflow-hidden">
        <div className="flex items-start sm:items-center gap-4 relative z-10">
          <div className="p-2.5 rounded-2xl bg-slate-950/80 border border-teal-500/30 shadow-inner shrink-0 hidden sm:flex">
            <PharmaLogo variant="icon" size="lg" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                لوحة ذكاء سوق الدواء الوطني
              </span>
              <span className="text-slate-400 text-xs flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-teal-400" />
                {entity.city} - {entity.governorate}
              </span>
              {entity.trustScore && (
                <span className="text-amber-300 bg-amber-950/60 border border-amber-500/40 text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-amber-400" />
                  موثوقية {entity.trustScore}%
                </span>
              )}
            </div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="sm:hidden">
                <PharmaLogo variant="icon" size="sm" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2 flex-wrap">
                {userRole === 'visitor' ? (
                  <>
                    <span>مرحباً بك في سوق الدواء اليمني</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      وضع الزائر
                    </span>
                  </>
                ) : userRole === 'admin' ? (
                  <>
                    <span>لوحة تحكم المشرف العام</span>
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-purple-500/30 text-purple-200 border border-purple-500/40">
                      الحساب النشط: {entity.name}
                    </span>
                  </>
                ) : (
                  <span>أهلاً بك، {entity.name}</span>
                )}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              منظومة الرصد والتوريد الصيدلاني الموحدة في اليمن. تنظيم إشارات العرض والطلب، تدوير الفائض، وتأمين الاحتياجات العلاجية والتجميلية.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 relative z-10 shrink-0 self-stretch sm:self-auto justify-end flex-wrap sm:flex-nowrap">
          <button
            onClick={onOpenCreateRequest}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            تسجيل احتياج (طلب)
          </button>
          <button
            onClick={onOpenCreateOffer}
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            تسجيل فائض (عرض)
          </button>
        </div>
      </div>

      {/* Early Warning Shortage Intelligence Banner - High Contrast & Clean Styling */}
      {INITIAL_EARLY_WARNING_ALERTS && INITIAL_EARLY_WARNING_ALERTS.length > 0 && (
        <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-rose-200 dark:border-rose-900/60 shadow-xs space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center gap-2.5">
              <span className="p-2 rounded-xl bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400">
                <Flame className="w-5 h-5" />
              </span>
              <div>
                <h4 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-rose-100">
                  رادار الإنذار المبكر للأدوية الحرجة
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                  Early Warning Shortage Radar — رصد مؤشرات الشح المتكرر
                </p>
              </div>
            </div>
            <span className="text-xs bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 px-3 py-1 rounded-full font-bold border border-rose-200 dark:border-rose-800">
              إشارات طلب متكررة خلال 48 ساعة
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            {INITIAL_EARLY_WARNING_ALERTS.map((alert) => (
              <div
                key={alert.id}
                className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 flex items-start justify-between gap-3 text-xs shadow-xs hover:border-rose-300 dark:hover:border-rose-500/50 transition"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-black text-slate-900 dark:text-white text-sm">
                      {alert.drugName}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 bg-rose-100 dark:bg-rose-900/50 text-rose-800 dark:text-rose-200 rounded-md font-bold">
                      {alert.governorate}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-medium">
                    {alert.estimatedPatientNeed}
                  </p>
                  <div className="text-xs text-emerald-800 dark:text-emerald-300 font-bold flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-950/50 px-2.5 py-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800/60">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>الإجراء: {alert.recommendedAction}</span>
                  </div>
                </div>
                <div className="text-center shrink-0 bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-rose-100 dark:border-rose-900/40 min-w-[70px]">
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400">+{alert.requestsCountIn48h}</div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400 font-bold">طلبات عاجلة</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 24-Hour Market Activity & Growth Indicator Widget */}
      <Pharma24hActivityWidget
        offers={offers}
        requests={requests}
        matches={matches}
        onNavigateTab={onNavigateTab}
      />

      {/* 4 Main Metrics + 5th Registered Network Entities Card */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        
        {/* Metric 1 */}
        <div 
          onClick={() => onNavigateTab('offers')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm cursor-pointer hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">العروض النشطة</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{activeOffers.length}</span>
            <span className="text-[11px] text-emerald-600 font-bold">صنف معروض</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">توفير أصناف للمنشآت الأخرى</p>
        </div>

        {/* Metric 2 */}
        <div 
          onClick={() => onNavigateTab('requests')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm cursor-pointer hover:border-amber-500/50 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">طلبات الاحتياج</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 flex items-center justify-center text-amber-600">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">{openRequests.length}</span>
            <span className="text-[11px] text-amber-600 font-bold">{criticalRequests.length} عاجل</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">إشارات نقص دوائي مسجلة</p>
        </div>

        {/* Metric 3 */}
        <div 
          onClick={() => onNavigateTab('matches')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm cursor-pointer hover:border-emerald-500/50 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">المطابقات الذكية</span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 flex items-center justify-center text-teal-600">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{matches.length}</span>
            <span className="text-[11px] text-emerald-600 font-bold">فرصة ربط</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">مطابقة العرض مع الطلب آلياً</p>
        </div>

        {/* Metric 4: Registered Health Entities Counter (Suppliers & Hospitals) */}
        <div 
          onClick={onOpenUserManager}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm cursor-pointer hover:border-purple-500/50 transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">المنشآت المسجلة</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 flex items-center justify-center text-purple-400">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-300">{totalRegisteredEntities}</span>
            <span className="text-[11px] text-purple-500 font-bold">منشأة معتمدة</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">
            {supplierCount} موردين/جملة • {healthAndCareCount} تجميل/مكملات • {pharmacyCount} صيدلية
          </p>
        </div>

        {/* Metric 5 */}
        <div 
          onClick={() => onNavigateTab('catalog')}
          className="bg-white dark:bg-slate-800 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/70 shadow-sm cursor-pointer hover:border-blue-500/50 transition group col-span-2 sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">دليل الأدوية NEML</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">743</span>
            <span className="text-[11px] text-blue-600 font-bold">صنف معتمد</span>
          </div>
          <p className="text-[10px] text-slate-400 mt-1">القائمة الوطنية الموحدة</p>
        </div>

      </div>

      {/* Admin Market Liquidity & Auto-Expiry Policy Controller */}
      {userRole === 'admin' && (
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-700/80 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl border ${autoExpiryEnabled ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs font-bold text-white">سياسة بقاء الإشارات وتنشيط السوق الدوائي</h4>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${autoExpiryEnabled ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'}`}>
                  {autoExpiryEnabled ? 'الإخفاء التلقائي بعد 7 أيام مفعل' : 'تنشيط دائم (الاحتفاظ بكافة الإشارات)'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {autoExpiryEnabled 
                  ? 'يتم إغلاق العروض والطلبات بعد 7 أيام من إنشائها.' 
                  : 'الوضع الحالي: بقاء كافة العروض والطلبات مفتوحة بدون انتهاء صلاحية لبناء كثافة البيانات وزيادة حركة السوق.'}
              </p>
            </div>
          </div>

          <button
            onClick={onToggleAutoExpiry}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 shrink-0 cursor-pointer shadow-sm ${
              autoExpiryEnabled 
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600' 
                : 'bg-emerald-600 hover:bg-emerald-500 text-white'
            }`}
          >
            <span>{autoExpiryEnabled ? 'إلغاء الإخفاء التلقائي (تنشيط دائم)' : 'تفعيل سياسة الـ 7 أيام'}</span>
          </button>
        </div>
      )}

      {/* Smart Matches Spotlight Section */}
      {matches.length > 0 && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/50 dark:from-emerald-950/20 dark:to-slate-800/80 p-5 rounded-2xl border border-emerald-500/30">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                أحدث المطابقات المكتشفة بين المنشآت ({matches.length})
              </h3>
            </div>
            <button
              onClick={() => onNavigateTab('matches')}
              className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline"
            >
              عرض كافة المطابقات ←
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {matches.slice(0, 2).map((match) => (
              <div
                key={match.id}
                className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60 shadow-sm flex flex-col justify-between space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <FlaskConical className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 truncate">
                        {match.activeIngredientAr || match.activeIngredient || match.drugName}
                      </span>
                    </div>
                    
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${
                      match.clinicalMatchKind === 'exact_clinical'
                        ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                        : match.clinicalMatchKind === 'alt_strength'
                        ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                        : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800'
                    }`}>
                      {match.clinicalMatchKind === 'exact_clinical' ? 'تطابق تام ✨' : match.clinicalMatchKind === 'alt_strength' ? 'جرعة بديلة ⚠️' : 'هيئة بديلة 🔄'}
                    </span>
                  </div>

                  {/* Dose & Form Badges */}
                  <div className="grid grid-cols-2 gap-2 mt-2 text-[11px]">
                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      match.isSameStrength
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300'
                    }`}>
                      <span>الجرعة:</span>
                      <span className="font-bold">{match.isSameStrength ? (match.offerStrength || 'متطابقة') : 'مختلفة ⚠️'}</span>
                    </div>
                    <div className={`p-1.5 rounded-lg border flex items-center justify-between ${
                      match.isSameDosageForm
                        ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                        : 'bg-purple-50 dark:bg-purple-950/40 border-purple-300 dark:border-purple-700 text-purple-800 dark:text-purple-300'
                    }`}>
                      <span>الهيئة:</span>
                      <span className="font-bold">{match.isSameDosageForm ? (match.offerDosageForm || 'متطابقة') : 'مختلفة 🔄'}</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-400 mt-2.5 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">العارض (فائض):</span>
                      <span className="truncate max-w-[140px]">{match.offeringEntity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">الطالب (احتياج):</span>
                      <span className="truncate max-w-[140px]">{match.requestingEntity}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                  <button
                    onClick={() => onNavigateTab('matches')}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
                  >
                    تنسيق الربط والاتصال ←
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Split Grid: Recent Offers & Recent Requests */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Recent Offers */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">أحدث عروض السوق (فائض)</h3>
            </div>
            <button
              onClick={() => onNavigateTab('offers')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3">
            {offers.slice(0, 3).map((offer) => {
              const catInfo = offer.categoryType ? CATEGORY_TYPE_LABELS[offer.categoryType] : null;
              return (
                <div
                  key={offer.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {offer.imageUrl ? (
                      <img
                        src={offer.imageUrl}
                        alt="صورة الصنف"
                        className="w-10 h-10 rounded-lg object-cover border border-emerald-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 shrink-0 text-base">
                        {catInfo?.icon || '💊'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {offer.genericName || offer.brandName || offer.freeTextName}
                        </h4>
                        {catInfo && (
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                            {catInfo.label}
                          </span>
                        )}
                        {offer.needsDelivery && (
                          <span className="text-[9px] bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Truck className="w-2.5 h-2.5" />
                            شحن متاح
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        الكمية: <span className="font-semibold text-slate-800 dark:text-slate-200">{offer.quantity} {offer.unit}</span>
                        {offer.price ? ` • السعر: ${offer.price} ${offer.currency}` : ''}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {offer.entityName}
                      </p>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold px-2 py-0.5 rounded shrink-0">
                    {offer.status === 'active' ? 'نشط' : offer.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Requests */}
        <div className="bg-white dark:bg-slate-800/90 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">أحدث طلبات الاحتياج (شح)</h3>
            </div>
            <button
              onClick={() => onNavigateTab('requests')}
              className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              عرض الكل
            </button>
          </div>

          <div className="space-y-3">
            {requests.slice(0, 3).map((req) => {
              const catInfo = req.categoryType ? CATEGORY_TYPE_LABELS[req.categoryType] : null;
              return (
                <div
                  key={req.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    {req.imageUrl ? (
                      <img
                        src={req.imageUrl}
                        alt="صورة الروشتة/الصنف"
                        className="w-10 h-10 rounded-lg object-cover border border-amber-500/30 shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600 shrink-0 text-base">
                        {catInfo?.icon || '🔍'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                          {req.genericName || req.freeTextName}
                        </h4>
                        {catInfo && (
                          <span className="text-[9px] bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                            {catInfo.label}
                          </span>
                        )}
                        {req.needsDelivery && (
                          <span className="text-[9px] bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                            <Truck className="w-2.5 h-2.5" />
                            شحن مطلوب
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        الكمية المطلوبة: <span className="font-semibold text-slate-800 dark:text-slate-200">{req.quantity} {req.unit}</span>
                      </p>
                      <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
                        <Building2 className="w-3 h-3" />
                        {req.entityName}
                      </p>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded shrink-0 ${
                      req.urgency === 'critical'
                        ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        : req.urgency === 'high'
                        ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300'
                    }`}
                  >
                    {req.urgency === 'critical' ? 'حرج جداً' : req.urgency === 'high' ? 'عاجل' : 'عادي'}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

