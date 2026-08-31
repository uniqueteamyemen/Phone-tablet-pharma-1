import React, { useState, useRef, useEffect } from 'react';
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
  Share2,
  Crown,
  UserCheck,
  Lock,
  MessageCircle,
  Phone,
  ChevronDown,
  LogOut,
  SlidersHorizontal,
  BellRing
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);

  const isPro = entity.subscriptionPlan === 'pro' || entity.subscriptionPlan === 'enterprise';

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(event.target as Node)) {
        setToolsDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter navigation items strictly based on role to prevent visual noise
  const getNavItems = () => {
    if (userRole === 'visitor') {
      return [
        { id: 'overview', label: 'الرئيسية', icon: Activity, badge: null },
        { id: 'offers', label: 'سوق العروض والفائض', icon: FileText, badge: activeOffersCount },
        { id: 'requests', label: 'طلبات الاحتياج', icon: Building2, badge: openRequestsCount },
        { id: 'catalog', label: 'دليل الأدوية (NEML)', icon: Search, badge: '743' },
        { id: 'about', label: 'عن المنصة والشروط', icon: HelpCircle, badge: null },
      ];
    }

    if (userRole === 'admin') {
      return [
        { id: 'overview', label: 'لوحة التحكم', icon: Activity, badge: null },
        { id: 'offers', label: 'كافة العروض', icon: FileText, badge: activeOffersCount },
        { id: 'requests', label: 'كافة الطلبات', icon: Building2, badge: openRequestsCount },
        { id: 'matches', label: 'المطابقات الذكية', icon: ArrowLeftRight, badge: matchesCount, badgeColor: 'bg-emerald-500 text-white' },
        { id: 'tickets', label: 'تذاكر التنسيق والشات', icon: MessageCircle, badge: ticketsCount > 0 ? ticketsCount : null, badgeColor: 'bg-purple-600 text-white font-bold' },
        { id: 'entities', label: 'سجل الجهات والتجار', icon: Users, badge: entitiesCount > 0 ? entitiesCount : null, badgeColor: 'bg-teal-600 text-white font-bold' },
        { id: 'social', label: 'مركز البث والمراجعة', icon: Share2, badge: 'إدارة', badgeColor: 'bg-purple-600 text-white' },
        { id: 'alerts', label: 'تنبيهات المخزون PRO', icon: BellRing, badge: 'PRO', badgeColor: 'bg-amber-500 text-slate-950 font-black' },
      ];
    }

    // Standard Logged-in Merchant / Pharmacy User
    return [
      { id: 'overview', label: 'لوحة المؤشرات', icon: Activity, badge: null },
      { id: 'offers', label: 'عروضي والسوق', icon: FileText, badge: activeOffersCount },
      { id: 'requests', label: 'طلباتي والاحتياج', icon: Building2, badge: openRequestsCount },
      { id: 'matches', label: 'المطابقات الذكية', icon: ArrowLeftRight, badge: matchesCount, badgeColor: 'bg-emerald-500 text-white' },
      { id: 'tickets', label: 'الشات وتذاكر التنسيق', icon: MessageCircle, badge: ticketsCount > 0 ? ticketsCount : null, badgeColor: 'bg-purple-600 text-white font-bold' },
      { id: 'catalog', label: 'دليل الأدوية', icon: Search, badge: '743' },
      { id: 'alerts', label: 'تنبيهات الشح (PRO)', icon: BellRing, badge: isPro ? 'مفعل' : 'PRO', badgeColor: 'bg-amber-500 text-slate-950 font-bold' },
    ];
  };

  const navItems = getNavItems();

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-40 shadow-md" dir="rtl">
      
      {/* Top Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        
        {/* Right: Brand Logo & Identity */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="cursor-pointer" onClick={() => onSelectTab('overview')}>
            <PharmaLogo variant="full" size="md" theme="dark" />
          </div>

          {/* Current Role Tag */}
          <div className="hidden sm:flex items-center">
            {userRole === 'admin' ? (
              <span className="text-[11px] font-black bg-purple-950 text-purple-200 border border-purple-500/50 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                <Crown className="w-3 h-3 text-amber-400" />
                <span>المشرف العام</span>
              </span>
            ) : userRole === 'visitor' ? (
              <span className="text-[11px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>وضع الزائر</span>
              </span>
            ) : (
              <span className="text-[11px] font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <UserCheck className="w-3 h-3 text-emerald-400" />
                <span>مستخدم موثق</span>
              </span>
            )}
          </div>
        </div>

        {/* Left: Clean Action Buttons & Profile (Desktop) */}
        <div className="hidden lg:flex items-center gap-2.5">
          
          {/* Primary Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={onOpenCreateRequest}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 text-xs font-bold transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>طلب احتياج</span>
            </button>
            <button
              onClick={onOpenCreateOffer}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>تسجيل عرض</span>
            </button>
          </div>

          <div className="h-5 w-px bg-slate-800 mx-1" />

          {/* Secondary Tools Dropdown (Cleans up 5 separate clutter buttons) */}
          <div className="relative" ref={toolsRef}>
            <button
              onClick={() => setToolsDropdownOpen(!toolsDropdownOpen)}
              className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 text-xs font-medium transition cursor-pointer"
              title="أدوات إضافية ومساعدة"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
              <span>الأدوات</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute left-0 mt-2 w-56 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-right">
                {onOpenBarcodeScanner && (
                  <button
                    onClick={() => {
                      setToolsDropdownOpen(false);
                      onOpenBarcodeScanner();
                    }}
                    className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition text-right"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>ماسح الباركود بالكاميرا</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setToolsDropdownOpen(false);
                    onOpenInstallModal();
                  }}
                  className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition text-right"
                >
                  <Smartphone className="w-4 h-4 text-teal-400" />
                  <span>تثبيت التطبيق (PWA)</span>
                </button>

                {onOpenFAQ && (
                  <button
                    onClick={() => {
                      setToolsDropdownOpen(false);
                      onOpenFAQ();
                    }}
                    className="w-full px-3.5 py-2 text-xs text-slate-200 hover:bg-slate-800 flex items-center gap-2.5 transition text-right"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>دليل الاستخدام والأسئلة الشائعة</span>
                  </button>
                )}

                {userRole === 'admin' && (
                  <>
                    <div className="my-1 border-t border-slate-800" />
                    <div className="px-3.5 py-1 text-[10px] text-slate-500 font-bold">أدوات المشرف</div>
                    {onOpenSocialBroadcast && (
                      <button
                        onClick={() => {
                          setToolsDropdownOpen(false);
                          onOpenSocialBroadcast();
                        }}
                        className="w-full px-3.5 py-2 text-xs text-purple-300 hover:bg-purple-950/50 flex items-center gap-2.5 transition text-right"
                      >
                        <Share2 className="w-4 h-4 text-purple-400" />
                        <span>مركز بث السوشيال</span>
                      </button>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* User Account / Entity Selector Pill */}
          <div className="relative" ref={userRef}>
            <button
              onClick={() => setUserDropdownOpen(!userDropdownOpen)}
              className="flex items-center gap-2 bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-emerald-500/40 rounded-xl px-3 py-1.5 text-xs transition text-right cursor-pointer"
            >
              <div className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs">
                {entity.name.slice(0, 1)}
              </div>
              <div className="text-right">
                <div className="font-bold text-slate-200 text-xs max-w-[130px] truncate">
                  {entity.name}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <span>{entity.governorate}</span>
                  {isPro && <span className="text-amber-400 font-bold">PRO</span>}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
            </button>

            {userDropdownOpen && (
              <div className="absolute left-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-2 z-50 text-right">
                <div className="p-2.5 bg-slate-950 rounded-xl mb-2 border border-slate-800/80">
                  <div className="font-black text-white text-xs">{entity.name}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">{entity.city} - {entity.governorate}</div>
                  <div className="text-[10px] text-emerald-400 mt-1 font-mono">{entity.phone || 'بدون هاتف'}</div>
                </div>

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onOpenUserManager();
                  }}
                  className="w-full px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 rounded-lg flex items-center gap-2 transition text-right"
                >
                  <Building2 className="w-4 h-4 text-emerald-400" />
                  <span>إدارة وتبديل الحسابات</span>
                </button>

                {onOpenPhoneAuth && !entity.isPhoneVerified && (
                  <button
                    onClick={() => {
                      setUserDropdownOpen(false);
                      onOpenPhoneAuth();
                    }}
                    className="w-full px-3 py-2 text-xs text-amber-300 hover:bg-amber-950/40 rounded-lg flex items-center gap-2 transition text-right"
                  >
                    <Phone className="w-4 h-4 text-amber-400" />
                    <span>توثيق رقم الهاتف برمز OTP</span>
                  </button>
                )}

                <div className="my-1.5 border-t border-slate-800" />

                <button
                  onClick={() => {
                    setUserDropdownOpen(false);
                    onToggleRole();
                  }}
                  className="w-full px-3 py-2 text-xs text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg flex items-center justify-between transition"
                >
                  <span>تبديل الصلاحية (مشرف / مستخدم / زائر)</span>
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Mobile menu toggle */}
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

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg bg-slate-800 text-slate-200 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

      </div>

      {/* Navigation Tabs Bar (Desktop) - Clean & Proportional */}
      <nav className="hidden md:block bg-slate-950/90 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 py-1.5 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id as PharmaTab)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600/20 text-emerald-300 border border-emerald-500/40 shadow-inner font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                <span>{item.label}</span>
                {item.badge !== null && (
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                      item.badgeColor || 'bg-slate-800 text-slate-400 border border-slate-700'
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

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-t border-slate-800 p-4 space-y-3">
          
          {/* Active Entity Info */}
          <div 
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenUserManager();
            }}
            className="p-3 bg-slate-800 rounded-xl border border-emerald-500/30 flex items-center justify-between cursor-pointer"
          >
            <div className="flex items-center gap-2 text-right">
              <Building2 className="w-4 h-4 text-emerald-400" />
              <div>
                <div className="font-bold text-xs text-white">{entity.name}</div>
                <div className="text-[11px] text-slate-400">{entity.governorate}</div>
              </div>
            </div>
            <span className="text-[11px] text-emerald-400 font-bold">تبديل</span>
          </div>

          {/* Navigation Links */}
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

          {/* Mobile Action Buttons */}
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
