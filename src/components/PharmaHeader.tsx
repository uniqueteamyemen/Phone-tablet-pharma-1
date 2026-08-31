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
  Lock,
  MessageCircle,
  Phone
} from 'lucide-react';
import { PharmaEntity, PharmaUserRole } from '../types/pharmayemen';
import { PharmaLogo } from './PharmaLogo';

export type PharmaTab = 'overview' | 'catalog' | 'offers' | 'requests' | 'matches' | 'tickets' | 'entities' | 'alerts' | 'social' | 'clinical' | 'about';

interface PharmaHeaderProps {
  activeTab: PharmaTab;
  onSelectTab: (tab: PharmaTab) => void;
  entity: PharmaEntity;
  userRole: PharmaUserRole;
  onToggleRole: () => void;
  activeOffersCount: number;
  openRequestsCount: number;
  matchesCount: number;
  ticketsCount?: number;
  entitiesCount?: number;
  alertsCount?: number;
  onOpenCreateOffer: () => void;
  onOpenCreateRequest: () => void;
  onOpenUserManager: () => void;
  onOpenInstallModal: () => void;
  onOpenBarcodeScanner?: () => void;
  onOpenGoogleAutofill?: () => void;
  onOpenSocialBroadcast?: () => void;
  onOpenFAQ?: () => void;
  onOpenPhoneAuth?: () => void;
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
  ticketsCount = 0,
  entitiesCount = 6,
  alertsCount = 3,
  onOpenCreateOffer,
  onOpenCreateRequest,
  onOpenUserManager,
  onOpenInstallModal,
  onOpenBarcodeScanner,
  onOpenGoogleAutofill,
  onOpenSocialBroadcast,
  onOpenFAQ,
  onOpenPhoneAuth,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const isPro = entity.subscriptionPlan === 'pro' || entity.subscriptionPlan === 'enterprise';

  const navItems = [
    { id: 'overview', label: 'لوحة المؤشرات', icon: Activity, badge: null },
    { id: 'catalog', label: 'دليل الأدوية (NEML)', icon: Search, badge: '743' },
    { id: 'offers', label: userRole === 'admin' ? 'كافة العروض (فائض)' : 'عروضي والسوق', icon: FileText, badge: activeOffersCount },
    { id: 'requests', label: userRole === 'admin' ? 'كافة الطلبات (شح)' : 'طلباتي والاحتياج', icon: Building2, badge: openRequestsCount },
    { id: 'matches', label: 'المطابقات الذكية', icon: ArrowLeftRight, badge: matchesCount, badgeColor: 'bg-emerald-500 text-white' },
    { id: 'tickets', label: 'تذاكر التنسيق والشات', icon: MessageCircle, badge: ticketsCount > 0 ? ticketsCount : null, badgeColor: 'bg-purple-600 text-white font-bold' },
    { id: 'entities', label: 'الجهات والتجار المسجلين', icon: Users, badge: entitiesCount > 0 ? entitiesCount : null, badgeColor: 'bg-teal-600 text-white font-bold' },
    { id: 'alerts', label: 'تنبيهات المخزون PRO', icon: BellRing, badge: 'PRO', badgeColor: 'bg-amber-500 text-slate-950 font-black' },
    { id: 'social', label: userRole === 'admin' ? 'مركز البث والمراجعة' : 'مركز النشر والجدولة', icon: Share2, badge: userRole === 'admin' ? 'تحكم الإدارة' : null, badgeColor: 'bg-purple-600 text-white' },
    { id: 'clinical', label: 'أدوات الصيدلي', icon: Sparkles, badge: null },
    { id: 'about', label: 'عن المنصة', icon: HelpCircle, badge: null },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md" dir="rtl">
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
                <span className="text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  صيدلية: {entity.name.length > 20 ? entity.name.slice(0, 20) + '...' : entity.name}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400 hidden xl:block">سوق الدواء اليمني الموحد — تنظيم إشارات العرض والطلب والشات الآمن</p>
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

          {/* Quick OTP Verification Button */}
          {onOpenPhoneAuth && (
            <button
              onClick={onOpenPhoneAuth}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
              title="التحقق السريع برقم الهاتف عبر OTP"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>توثيق OTP</span>
            </button>
          )}

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
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 border border-indigo-500/40 text-xs font-bold transition shadow-xs cursor-pointer"
              title="تعبئة بيانات الصيدلية بنقرة واحدة من حساب Google"
            >
              <Zap className="w-3.5 h-3.5 text-indigo-400" />
              <span>تعبئة Google</span>
            </button>
          )}

          {/* FAQ & Quick User Guide */}
          {onOpenFAQ && (
            <button
              onClick={onOpenFAQ}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer"
              title="دليل استخدام المنصة والأسئلة الشائعة"
            >
              <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
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
                  className={`flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                    isActive
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-750'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-emerald-400" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && (
                    <span className="text-[9px] bg-slate-900 px-1.5 py-0.5 rounded-md text-slate-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Action Buttons */}
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCreateRequest();
              }}
              className="py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>طلب احتياج</span>
            </button>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenCreateOffer();
              }}
              className="py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center justify-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>عرض دواء</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
};
