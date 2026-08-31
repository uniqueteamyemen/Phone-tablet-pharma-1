import React from 'react';
import { 
  Building2, 
  ArrowLeftRight, 
  FileText, 
  Search, 
  Activity, 
  ShieldCheck, 
  PlusCircle, 
  HelpCircle,
  Menu,
  X,
  Sparkles,
  Smartphone,
  Users,
  Camera,
  Scan,
  Zap,
  BellRing,
  Share2,
  Crown,
  UserCheck,
  Lock
} from 'lucide-react';
import { PharmaEntity, PharmaUserRole } from '../types/pharmayemen';
import { PharmaLogo } from './PharmaLogo';

export type PharmaTab = 'overview' | 'catalog' | 'offers' | 'requests' | 'matches' | 'alerts' | 'social' | 'clinical' | 'about';

interface PharmaHeaderProps {
  activeTab: PharmaTab;
  onSelectTab: (tab: PharmaTab) => void;
  entity: PharmaEntity;
  userRole: PharmaUserRole;
  onToggleRole: () => void;
  activeOffersCount: number;
  openRequestsCount: number;
  matchesCount: number;
  alertsCount?: number;
  onOpenCreateOffer: () => void;
  onOpenCreateRequest: () => void;
  onOpenUserManager: () => void;
  onOpenInstallModal: () => void;
  onOpenBarcodeScanner?: () => void;
  onOpenGoogleAutofill?: () => void;
  onOpenSocialBroadcast?: () => void;
  onOpenFAQ?: () => void;
}

export const PharmaHeader: React.FC<PharmaHeaderProps> = ({
  activeTab,
  onSelectTab,
  entity,
  userRole,
  onToggleRole,
  activeOffersCount,
  openRequestsCount,
  matchesCount,
  alertsCount = 3,
  onOpenCreateOffer,
  onOpenCreateRequest,
  onOpenUserManager,
  onOpenInstallModal,
  onOpenBarcodeScanner,
  onOpenGoogleAutofill,
  onOpenSocialBroadcast,
  onOpenFAQ,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isPro = entity.subscriptionPlan === 'pro' || entity.subscriptionPlan === 'enterprise';

  const navItems = [
    { id: 'overview', label: 'لوحة المؤشرات', icon: Activity, badge: null },
    { id: 'catalog', label: 'دليل الأدوية (NEML)', icon: Search, badge: '743' },
    { id: 'offers', label: userRole === 'admin' ? 'كافة العروض (فائض)' : 'عروضي والسوق', icon: FileText, badge: activeOffersCount },
    { id: 'requests', label: userRole === 'admin' ? 'كافة الطلبات (شح)' : 'طلباتي والاحتياج', icon: Building2, badge: openRequestsCount },
    { id: 'matches', label: 'المطابقات الذكية', icon: ArrowLeftRight, badge: matchesCount, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'alerts', label: 'تنبيهات المخزون PRO', icon: BellRing, badge: 'PRO', badgeColor: 'bg-amber-500 text-slate-950 font-black' },
    { id: 'social', label: 'البث وتيليجرام', icon: Share2, badge: 'جديد' },
    { id: 'clinical', label: 'أدوات الصيدلي', icon: Sparkles, badge: null },
    { id: 'about', label: 'عن المنصة', icon: HelpCircle, badge: null },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md">
      {/* Top Banner */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between">
        {/* Brand Lockup with Official Logo */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => onSelectTab('overview')}>
          <PharmaLogo variant="full" size="md" theme="dark" />
          <div className="hidden md:flex flex-col border-r border-slate-800 pr-3 mr-1">
            <div className="flex items-center gap-2">
              {userRole === 'admin' ? (
                <span className="text-[10px] font-black bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-2 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                  <Crown className="w-3 h-3 text-amber-300" />
                  وضع المشرف العام (Admin Mode)
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                  صيدلية: {entity.name.length > 20 ? entity.name.slice(0, 20) + '...' : entity.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden xl:block">سوق الدواء اليمني الموحد — تنظيم إشارات العرض والطلب</p>
          </div>
        </div>

        {/* Action Buttons for Desktop */}
        <div className="hidden lg:flex items-center gap-2">
          
          {/* Admin vs Pharmacy vs Visitor Role Switcher */}
          <button
            onClick={onToggleRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs cursor-pointer border ${
              userRole === 'admin'
                ? 'bg-purple-950/80 text-purple-200 border-purple-500/50 hover:bg-purple-900'
                : userRole === 'pharmacy'
                ? 'bg-emerald-950/80 text-emerald-200 border-emerald-500/50 hover:bg-emerald-900'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:text-white'
            }`}
            title="تبديل وضع العرض (زائر / صيدلية / مشرف عام)"
          >
            {userRole === 'admin' ? (
              <>
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>المشرف (Admin)</span>
              </>
            ) : userRole === 'pharmacy' ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>صيدلية مسجلة</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>وضع الزائر (محمي)</span>
              </>
            )}
          </button>

          {/* Social Broadcast Quick Action */}
          <button
            onClick={() => onSelectTab('social')}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-sky-500/15 hover:bg-sky-500/25 text-sky-300 border border-sky-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
            title="فتح مركز البث على مجموعات التيليجرام وإنستغرام وفيسبوك"
          >
            <Share2 className="w-3.5 h-3.5 text-sky-400" />
            <span>بث السوشيال</span>
          </button>

          {/* Barcode Camera Scanner Button */}
          {onOpenBarcodeScanner && (
            <button
              onClick={onOpenBarcodeScanner}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-950/80 hover:bg-emerald-900/90 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-xs cursor-pointer group"
              title="فتح ماسح الباركود بالكاميرا لقراءة علب الأدوية فوراً"
            >
              <Camera className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
              <span>ماسح الباركود</span>
            </button>
          )}

          {/* Google Autofill Quick Button */}
          {onOpenGoogleAutofill && (
            <button
              onClick={onOpenGoogleAutofill}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 text-xs font-semibold transition cursor-pointer"
              title="التعبئة السريعة ببيانات Google"
            >
              <div className="w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center p-0.5">
                <svg viewBox="0 0 24 24" className="w-full h-full">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
              </div>
              <span>تعبئة Google</span>
            </button>
          )}

          {/* FAQ Modal Quick Action */}
          {onOpenFAQ && (
            <button
              onClick={onOpenFAQ}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
              title="الأسئلة الشائعة ودليل عمل المنصة"
            >
              <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>دليل الاستخدام وFAQ</span>
            </button>
          )}

          {/* Install on Mobile Button */}
          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-teal-500/15 hover:bg-teal-500/25 text-teal-300 border border-teal-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
            title="تثبيت التطبيق على هاتفك أو جهازك اللوحي"
          >
            <Smartphone className="w-3.5 h-3.5 text-teal-400" />
            <span>تثبيت PWA</span>
          </button>

          <button
            onClick={onOpenCreateRequest}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-semibold transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            طلب احتياج
          </button>
          <button
            onClick={onOpenCreateOffer}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            عرض دواء
          </button>
          
          <div className="h-6 w-px bg-slate-700 mx-0.5" />

          {/* Current Entity / User Manager Trigger */}
          <button
            onClick={onOpenUserManager}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 hover:border-emerald-500/50 rounded-xl px-3 py-1.5 text-xs transition text-right group cursor-pointer"
            title="انقر لتعديل بيانات صيدليتك، أو إضافة وتبديل المستخدمين والمنشآت"
          >
            <div className="p-1 rounded-md bg-emerald-950/60 text-emerald-400 group-hover:bg-emerald-600 group-hover:text-white transition">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="font-bold text-slate-200 group-hover:text-emerald-300 text-xs max-w-[130px] truncate">
                {entity.name}
              </div>
              <div className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span>{isPro ? 'باقتك PRO ⚡' : 'إدارة المنشأة'}</span>
              </div>
            </div>
          </button>
        </div>

        {/* Mobile top actions */}
        <div className="lg:hidden flex items-center gap-1.5">
          <button
            onClick={onToggleRole}
            className={`p-2 rounded-lg text-xs font-bold border ${
              userRole === 'admin'
                ? 'bg-purple-900 text-purple-200 border-purple-500'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
            title="تبديل الصلاحية"
          >
            {userRole === 'admin' ? <Crown className="w-4 h-4 text-amber-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
          </button>

          {onOpenBarcodeScanner && (
            <button
              onClick={onOpenBarcodeScanner}
              className="p-2 rounded-lg bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 text-xs font-bold"
              title="ماسح الباركود بالكاميرا"
            >
              <Camera className="w-4 h-4" />
            </button>
          )}

          <button
            onClick={onOpenInstallModal}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-teal-500/20 text-teal-300 border border-teal-500/40 text-xs font-bold"
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>تثبيت</span>
          </button>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Navigation Tabs Bar (Desktop) */}
      <nav className="hidden md:block bg-slate-950/80 border-t border-slate-800/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto py-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as PharmaTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-inner'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-3">
          
          {/* Active entity info banner */}
          <div 
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenUserManager();
            }}
            className="p-3 bg-slate-800/90 rounded-xl border border-emerald-500/30 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 text-right">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-bold text-xs text-white">{entity.name}</div>
                <div className="text-[11px] text-slate-400">{entity.governorate} • {isPro ? 'باقة PRO ⚡' : 'مجاني'}</div>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">تغيير</span>
          </div>

          {/* Nav Links in Mobile */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onSelectTab(item.id as PharmaTab);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50'
                      : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-slate-700 text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-2 border-t border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCreateOffer();
              }}
              className="flex-1 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>عرض دواء</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCreateRequest();
              }}
              className="flex-1 py-2 bg-amber-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>طلب احتياج</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
