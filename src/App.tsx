import React, { useState, useEffect, useMemo } from 'react';
import { 
  PharmaEntity, 
  PharmaOffer, 
  PharmaRequest, 
  PharmaMatch, 
  PharmaCatalogDrug, 
  PharmaUserRole,
  SocialBroadcastPayload,
  PharmaMatchTicket,
  INITIAL_NEML_CATALOG 
} from './types/pharmayemen';
import { 
  loadPharmaEntity, 
  savePharmaEntity, 
  loadPharmaEntitiesList,
  savePharmaEntitiesList,
  loadPharmaOffers, 
  savePharmaOffers, 
  loadPharmaRequests, 
  savePharmaRequests, 
  calculateMarketMatches,
  checkAndApply7DaysExpiry 
} from './utils/pharmaStorage';

import { PharmaHeader, PharmaTab } from './components/PharmaHeader';
import { PharmaOverview } from './components/PharmaOverview';
import { PharmaCatalogView } from './components/PharmaCatalogView';
import { PharmaOffersView, PharmaRequestsView, PharmaMatchesView } from './components/PharmaViews';
import { PharmaTicketsView } from './components/PharmaTicketsView';
import { PharmaEntitiesView } from './components/PharmaEntitiesView';
import { PharmaStockAlertsView } from './components/PharmaStockAlertsView';
import { PharmaSocialBroadcastView } from './components/PharmaSocialBroadcastView';
import { PharmaSocialBroadcastModal } from './components/PharmaSocialBroadcastModal';
import { PharmaClinicalTools } from './components/PharmaClinicalTools';
import { PharmaAboutView } from './components/PharmaAboutView';
import { PharmaFAQModal } from './components/PharmaFAQModal';
import { CreateOfferModal, CreateRequestModal } from './components/PharmaModals';
import { PharmaUserManagerModal } from './components/PharmaUserManagerModal';
import { PharmaInstallModal } from './components/PharmaInstallModal';
import { PharmaBarcodeScannerModal } from './components/PharmaBarcodeScannerModal';
import { PharmaMatchActionModal, MatchActionTarget } from './components/PharmaMatchActionModal';
import { PharmaMatchChatModal } from './components/PharmaMatchChatModal';
import { PharmaPhoneAuthModal } from './components/PharmaPhoneAuthModal';
import { useTouchSwipe } from './hooks/useTouchSwipe';
import { CheckCircle2, Bell, X, Sparkles, MessageCircle } from 'lucide-react';

const TAB_ORDER: PharmaTab[] = ['overview', 'catalog', 'offers', 'requests', 'matches', 'tickets', 'entities', 'alerts', 'social', 'clinical', 'about'];

const STORAGE_KEY_TICKETS = 'pharmayemen_match_tickets_v1';

export default function App() {
  // 1. Core Platform State & Entities
  const [entitiesList, setEntitiesList] = useState<PharmaEntity[]>(() => loadPharmaEntitiesList());
  const [entity, setEntity] = useState<PharmaEntity>(() => loadPharmaEntity());
  
  // Default to 'visitor' mode to protect sensitive entities & quantities
  const [userRole, setUserRole] = useState<PharmaUserRole>('visitor');
  const [catalog, setCatalog] = useState<PharmaCatalogDrug[]>(() => {
    try {
      const stored = localStorage.getItem('pharmayemen_approved_custom_drugs');
      const customApproved: PharmaCatalogDrug[] = stored ? JSON.parse(stored) : [];
      return [...customApproved, ...INITIAL_NEML_CATALOG];
    } catch {
      return INITIAL_NEML_CATALOG;
    }
  });

  const [offers, setOffers] = useState<PharmaOffer[]>(() => loadPharmaOffers());
  const [requests, setRequests] = useState<PharmaRequest[]>(() => loadPharmaRequests());

  // Coordination Tickets & In-App Chat State
  const [tickets, setTickets] = useState<PharmaMatchTicket[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_TICKETS);
      if (stored) return JSON.parse(stored);
      // Sample starter ticket
      const sample: PharmaMatchTicket = {
        id: 'ticket-sample-1',
        matchId: 'match-sample-1',
        targetType: 'offer',
        targetItemId: 'off-1',
        drugName: 'Augmentin 1g (Amoxicillin + Clavulanic Acid)',
        quantity: 50,
        unit: 'Tab',
        governorate: 'صنعاء',
        initiatorEntityId: 'ent-2',
        initiatorName: 'صيدلية النور الحديثة',
        initiatorPhone: '+967 777 123 456',
        ownerEntityId: 'ent-1',
        ownerName: 'مستشفى الثورة العام',
        ownerPhone: '+967 771 987 654',
        coordinationStatus: 'approved_open',
        phoneExchanged: true,
        messages: [
          {
            id: 'm1',
            senderEntityId: 'ent-2',
            senderName: 'صيدلية النور الحديثة',
            senderRole: 'sender',
            text: 'السلام عليكم ورحمة الله، بخصوص كمية الأوجمنتين 1g المعروضة، هل جاهزة للاستلام اليوم في صنعاء؟',
            timestamp: '10:30 ص',
          },
          {
            id: 'm2',
            senderEntityId: 'ent-1',
            senderName: 'مستشفى الثورة العام',
            senderRole: 'receiver',
            text: 'وعليكم السلام، نعم الصنف متاح ومحفوظ في درجة حرارة ملائمة، الصلاحية حتى 2026/06.',
            timestamp: '10:35 ص',
          },
          {
            id: 'm3',
            senderEntityId: 'system',
            senderName: 'نظام المنصة',
            senderRole: 'admin',
            text: '🤝 تم قبول التنسيق وتبادل أرقام الهواتف بنجاح.',
            timestamp: '10:36 ص',
          },
        ],
        lastActivityAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
      };
      return [sample];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_TICKETS, JSON.stringify(tickets));
    } catch (e) {
      console.error(e);
    }
  }, [tickets]);

  // 7-day Auto Expiry Enforcement Feature
  const [autoExpiryEnabled, setAutoExpiryEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('pharmayemen_auto_expiry_enabled');
    return saved !== null ? saved === 'true' : true;
  });

  const handleToggleAutoExpiry = () => {
    const nextVal = !autoExpiryEnabled;
    setAutoExpiryEnabled(nextVal);
    localStorage.setItem('pharmayemen_auto_expiry_enabled', String(nextVal));
    if (nextVal) {
      const checkedOff = checkAndApply7DaysExpiry(offers);
      const checkedReq = checkAndApply7DaysExpiry(requests);
      setOffers(checkedOff.items);
      setRequests(checkedReq.items);
    }
  };
  
  const [activeTab, setActiveTab] = useState<PharmaTab>('overview');

  // Modals state
  const [isOfferModalOpen, setIsOfferModalOpen] = useState(false);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [isFAQModalOpen, setIsFAQModalOpen] = useState(false);
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [isPhoneAuthModalOpen, setIsPhoneAuthModalOpen] = useState(false);
  const [phoneAuthReason, setPhoneAuthReason] = useState<string>('لإتمام هذا الإجراء بأمان');
  const [selectedDrugForAction, setSelectedDrugForAction] = useState<PharmaCatalogDrug | null>(null);
  const [scannedDrugDetails, setScannedDrugDetails] = useState<any>(null);

  // Active Chat Modal State
  const [activeChatTicket, setActiveChatTicket] = useState<PharmaMatchTicket | null>(null);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);

  // Social Broadcast State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [broadcastPayload, setBroadcastPayload] = useState<SocialBroadcastPayload | null>(null);

  // Status & Notification Toast Banner
  const [toastNotification, setToastNotification] = useState<{
    id: string;
    title: string;
    message: string;
    type: 'success' | 'amber' | 'info';
  } | null>(null);

  // Auto dismiss toast after 7 seconds
  useEffect(() => {
    if (!toastNotification) return;
    const timer = setTimeout(() => {
      setToastNotification(null);
    }, 7000);
    return () => clearTimeout(timer);
  }, [toastNotification]);

  // Match Action (Fulfill / Reserve) Modal State
  const [isMatchActionModalOpen, setIsMatchActionModalOpen] = useState(false);
  const [matchActionTarget, setMatchActionTarget] = useState<MatchActionTarget | null>(null);

  // Ad-hoc user confirmed matches
  const [userConfirmedMatches, setUserConfirmedMatches] = useState<PharmaMatch[]>([]);

  // PWA Install prompt listener
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Compute dynamic market matches combined with user manual matches
  const matches = useMemo(() => {
    const autoMatches = calculateMarketMatches(offers, requests);
    return [...userConfirmedMatches, ...autoMatches];
  }, [offers, requests, userConfirmedMatches]);

  // Persist state changes
  useEffect(() => {
    savePharmaEntity(entity);
  }, [entity]);

  useEffect(() => {
    savePharmaEntitiesList(entitiesList);
  }, [entitiesList]);

  useEffect(() => {
    savePharmaOffers(offers);
  }, [offers]);

  useEffect(() => {
    savePharmaRequests(requests);
  }, [requests]);

  // Touch Swipe Gesture support for Tablet & Mobile tab navigation
  const handleSwipeLeft = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex < TAB_ORDER.length - 1) {
      setActiveTab(TAB_ORDER[currentIndex + 1]);
    }
  };

  const handleSwipeRight = () => {
    const currentIndex = TAB_ORDER.indexOf(activeTab);
    if (currentIndex > 0) {
      setActiveTab(TAB_ORDER[currentIndex - 1]);
    }
  };

  const mainContainerRef = useTouchSwipe<HTMLElement>({
    onSwipeLeft: handleSwipeLeft,
    onSwipeRight: handleSwipeRight,
    minDistance: 50,
  });

  // Actions for Entities & Roles (Visitor -> Pharmacy -> Admin -> Visitor)
  const handleToggleRole = () => {
    setUserRole((prev) => {
      if (prev === 'visitor') return 'pharmacy';
      if (prev === 'pharmacy') return 'admin';
      return 'visitor';
    });
  };

  const handleSelectEntity = (selected: PharmaEntity) => {
    setEntity(selected);
    setToastNotification({
      id: `toast-${Date.now()}`,
      title: 'تم التبديل بنجاح',
      message: `أنت تعمل الآن بهوية المنشأة: (${selected.name}) - ${selected.governorate}`,
      type: 'success',
    });
  };

  const handleSaveEntity = (updated: PharmaEntity) => {
    setEntitiesList((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    if (entity.id === updated.id) {
      setEntity(updated);
    }
  };

  const handleAddNewEntity = (newEnt: PharmaEntity) => {
    setEntitiesList((prev) => [newEnt, ...prev]);
    setEntity(newEnt);
  };

  const handleDeleteEntity = (entityId: string) => {
    setEntitiesList((prev) => {
      const filtered = prev.filter((item) => item.id !== entityId);
      if (entity.id === entityId && filtered.length > 0) {
        setEntity(filtered[0]);
      }
      return filtered;
    });
  };

  const handleUpgradePlan = (plan: 'pro' | 'enterprise') => {
    const updated = { ...entity, subscriptionPlan: plan };
    handleSaveEntity(updated);
  };

  // Actions for Offers & Requests
  const handleAddOffer = (newOfferData: Omit<PharmaOffer, 'id' | 'createdAt'>) => {
    const newOffer: PharmaOffer = {
      ...newOfferData,
      id: `off-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setOffers((prev) => [newOffer, ...prev]);
    setActiveTab('offers');

    setToastNotification({
      id: `toast-${Date.now()}`,
      title: 'تم تسجيل ونشر العرض الدوائي بنجاح',
      message: '🔔 ملاحظة: إشارة الفائض فعالة الآن في شبكة المنصة، وتخضع العروض للمراجعة والجدولة للنشر في قنوات ومواقع التواصل الاجتماعي التابعة للمنصة بحسب الأولوية.',
      type: 'success',
    });
  };

  const handleCloseOffer = (id: string) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'closed' } : o)));
  };

  const handleApproveDrugToCatalog = (newDrug: PharmaCatalogDrug) => {
    setCatalog((prev) => {
      const updated = [newDrug, ...prev];
      const customOnly = updated.filter((d) => !d.id?.startsWith('neml-'));
      localStorage.setItem('pharmayemen_approved_custom_drugs', JSON.stringify(customOnly));
      return updated;
    });
  };

  const handleAddRequest = (newRequestData: Omit<PharmaRequest, 'id' | 'createdAt'>) => {
    const newReq: PharmaRequest = {
      ...newRequestData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    setActiveTab('requests');

    setToastNotification({
      id: `toast-${Date.now()}`,
      title: 'تم تسجيل ونشر طلب الاحتياج بنجاح',
      message: '🔔 ملاحظة: إشارة الاحتياج فعالة الآن في شبكة المنصة، وتخضع الطلبات للمراجعة والجدولة للنشر في قنوات ومواقع التواصل الاجتماعي التابعة للمنصة بحسب الأولوية ودرجة الاستعجال.',
      type: 'amber',
    });
  };

  const handleCloseRequest = (id: string) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'closed' } : r)));
  };

  const handleSelectDrugForOffer = (drug: PharmaCatalogDrug) => {
    setSelectedDrugForAction(drug);
    setIsOfferModalOpen(true);
  };

  const handleSelectDrugForRequest = (drug: PharmaCatalogDrug) => {
    setSelectedDrugForAction(drug);
    setIsRequestModalOpen(true);
  };

  const handleBarcodeScanned = (scannedInfo: any) => {
    setScannedDrugDetails(scannedInfo);
    if (scannedInfo.drug) {
      setSelectedDrugForAction(scannedInfo.drug);
    }
    setIsOfferModalOpen(true);
  };

  // Social Broadcast Trigger
  const handleOpenSocialBroadcast = (payload: SocialBroadcastPayload) => {
    setBroadcastPayload(payload);
    setIsSocialModalOpen(true);
  };

  // Match / Fulfill Trigger
  const handleOpenMatchAction = (target: MatchActionTarget) => {
    // If visitor, prompt for phone auth first
    if (userRole === 'visitor' && !entity.isPhoneVerified) {
      setPhoneAuthReason(target.type === 'offer' ? 'لحجز واستلام العرض الدوائي' : 'لتلبية احتياج الدواء');
      setIsPhoneAuthModalOpen(true);
      return;
    }
    setMatchActionTarget(target);
    setIsMatchActionModalOpen(true);
  };

  const handleConfirmMatch = (newMatch: PharmaMatch, newTicket: PharmaMatchTicket) => {
    setUserConfirmedMatches((prev) => [newMatch, ...prev]);
    setTickets((prev) => [newTicket, ...prev]);
  };

  const handleOpenDirectChat = (ticket: PharmaMatchTicket) => {
    setActiveChatTicket(ticket);
    setIsChatModalOpen(true);
  };

  const handleUpdateTicket = (updated: PharmaMatchTicket) => {
    setTickets((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    if (activeChatTicket && activeChatTicket.id === updated.id) {
      setActiveChatTicket(updated);
    }
  };

  const handlePhoneAuthSuccess = (authenticatedEntity: PharmaEntity) => {
    handleAddNewEntity(authenticatedEntity);
    setUserRole('pharmacy');
    setToastNotification({
      id: `toast-${Date.now()}`,
      title: 'تم توثيق الحساب بنجاح',
      message: `أهلاً بك (${authenticatedEntity.name})! تم تفعيل وضع الصيدلية المعتمدة.`,
      type: 'success',
    });
  };

  return (
    <div className="h-screen w-screen flex flex-col bg-slate-950 font-sans antialiased overflow-hidden select-none" dir="rtl">
      
      {/* Platform Navigation Header */}
      <PharmaHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        entity={entity}
        userRole={userRole}
        onToggleRole={handleToggleRole}
        activeOffersCount={offers.filter((o) => o.status === 'active').length}
        openRequestsCount={requests.filter((r) => r.status === 'open').length}
        matchesCount={matches.length}
        ticketsCount={tickets.filter((t) => t.coordinationStatus === 'approved_open' || t.coordinationStatus === 'pending_approval').length}
        entitiesCount={entitiesList.length}
        onOpenCreateOffer={() => {
          if (userRole === 'visitor' && !entity.isPhoneVerified) {
            setPhoneAuthReason('لإضافة وتوثيق عرض دوائي');
            setIsPhoneAuthModalOpen(true);
            return;
          }
          setSelectedDrugForAction(null);
          setScannedDrugDetails(null);
          setIsOfferModalOpen(true);
        }}
        onOpenCreateRequest={() => {
          if (userRole === 'visitor' && !entity.isPhoneVerified) {
            setPhoneAuthReason('لتسجيل ونشر طلب احتياج دوائي');
            setIsPhoneAuthModalOpen(true);
            return;
          }
          setSelectedDrugForAction(null);
          setScannedDrugDetails(null);
          setIsRequestModalOpen(true);
        }}
        onOpenUserManager={() => setIsUserManagerOpen(true)}
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenGoogleAutofill={() => setIsUserManagerOpen(true)}
        onOpenSocialBroadcast={() => setActiveTab('social')}
        onOpenFAQ={() => setIsFAQModalOpen(true)}
        onOpenPhoneAuth={() => {
          setPhoneAuthReason('لتوثيق المنشأة بالهاتف عبر OTP');
          setIsPhoneAuthModalOpen(true);
        }}
      />

      {/* Floating Informative Toast Notification Banner */}
      {toastNotification && (
        <div className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 shadow-xl relative z-30 transition-all duration-300">
          <div className="max-w-7xl mx-auto flex items-start sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                  toastNotification.type === 'success'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                {toastNotification.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4" />
                ) : (
                  <Bell className="w-4 h-4" />
                )}
              </div>
              <div className="text-xs">
                <p className="font-black text-white flex items-center gap-2">
                  <span>{toastNotification.title}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 font-normal">
                    إشعار نظام
                  </span>
                </p>
                <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
                  {toastNotification.message}
                </p>
              </div>
            </div>
            <button
              onClick={() => setToastNotification(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer shrink-0"
              title="إغلاق الإشعار"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area with Touch Gestures Ref */}
      <main ref={mainContainerRef as any} className="flex-1 flex flex-col overflow-hidden relative touch-pan-y">
        
        {activeTab === 'overview' && (
          <PharmaOverview
            entity={entity}
            entitiesList={entitiesList}
            offers={offers}
            requests={requests}
            matches={matches}
            userRole={userRole}
            autoExpiryEnabled={autoExpiryEnabled}
            onToggleAutoExpiry={handleToggleAutoExpiry}
            onNavigateTab={(tab) => setActiveTab(tab as PharmaTab)}
            onOpenCreateOffer={() => {
              setSelectedDrugForAction(null);
              setScannedDrugDetails(null);
              setIsOfferModalOpen(true);
            }}
            onOpenCreateRequest={() => {
              setSelectedDrugForAction(null);
              setScannedDrugDetails(null);
              setIsRequestModalOpen(true);
            }}
            onOpenUserManager={() => setIsUserManagerOpen(true)}
            onSelectEntity={handleSelectEntity}
          />
        )}

        {activeTab === 'entities' && (
          <PharmaEntitiesView
            entitiesList={entitiesList}
            currentEntity={entity}
            userRole={userRole}
            onSelectEntity={handleSelectEntity}
            onOpenUserManager={() => setIsUserManagerOpen(true)}
            onAddNewEntity={handleAddNewEntity}
          />
        )}

        {activeTab === 'catalog' && (
          <PharmaCatalogView
            catalog={catalog}
            userRole={userRole}
            onSelectDrugForOffer={handleSelectDrugForOffer}
            onSelectDrugForRequest={handleSelectDrugForRequest}
            onApproveDrug={handleApproveDrugToCatalog}
          />
        )}

        {activeTab === 'offers' && (
          <PharmaOffersView
            offers={offers}
            requests={requests}
            entity={entity}
            userRole={userRole}
            onOpenCreateOffer={() => {
              setSelectedDrugForAction(null);
              setScannedDrugDetails(null);
              setIsOfferModalOpen(true);
            }}
            onCloseOffer={handleCloseOffer}
            onOpenSocialBroadcast={handleOpenSocialBroadcast}
            onOpenMatchAction={handleOpenMatchAction}
          />
        )}

        {activeTab === 'requests' && (
          <PharmaRequestsView
            requests={requests}
            offers={offers}
            entity={entity}
            userRole={userRole}
            onOpenCreateRequest={() => {
              setSelectedDrugForAction(null);
              setScannedDrugDetails(null);
              setIsRequestModalOpen(true);
            }}
            onCloseRequest={handleCloseRequest}
            onOpenSocialBroadcast={handleOpenSocialBroadcast}
            onOpenMatchAction={handleOpenMatchAction}
          />
        )}

        {activeTab === 'matches' && (
          <PharmaMatchesView 
            matches={matches} 
            entity={entity} 
            userRole={userRole}
            offers={offers} 
            requests={requests} 
          />
        )}

        {activeTab === 'tickets' && (
          <PharmaTicketsView
            tickets={tickets}
            entity={entity}
            userRole={userRole}
            onOpenChat={(t) => {
              setActiveChatTicket(t);
              setIsChatModalOpen(true);
            }}
            onUpdateTicket={handleUpdateTicket}
          />
        )}

        {activeTab === 'alerts' && (
          <PharmaStockAlertsView
            entity={entity}
            offers={offers}
            requests={requests}
            onUpgradePlan={handleUpgradePlan}
            onOpenCreateOfferWithDrug={(drugName, quantity, unit) => {
              setSelectedDrugForAction({
                code: 'ALERT-DRUG',
                genericName: drugName,
                dosageForm: unit || 'Tab',
                strength: '',
                category: 'مخزون حرج',
                therapeuticClass: 'أصناف ذات أولوية',
                route: 'Oral',
                isEssential: true,
                prescribingLevel: 'PH',
              });
              setIsOfferModalOpen(true);
            }}
            onOpenSocialBroadcast={handleOpenSocialBroadcast}
          />
        )}

        {activeTab === 'social' && (
          <PharmaSocialBroadcastView
            entity={entity}
            offers={offers}
            requests={requests}
            userRole={userRole}
            initialPayload={broadcastPayload}
          />
        )}

        {activeTab === 'clinical' && (
          <PharmaClinicalTools catalog={catalog} />
        )}

        {activeTab === 'about' && (
          <PharmaAboutView />
        )}
      </main>

      {/* Modals */}
      <CreateOfferModal
        isOpen={isOfferModalOpen}
        onClose={() => {
          setIsOfferModalOpen(false);
          setScannedDrugDetails(null);
        }}
        entity={entity}
        catalog={catalog}
        initialDrug={selectedDrugForAction}
        scannedDetails={scannedDrugDetails}
        onSubmitOffer={handleAddOffer}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
      />

      <CreateRequestModal
        isOpen={isRequestModalOpen}
        onClose={() => {
          setIsRequestModalOpen(false);
          setScannedDrugDetails(null);
        }}
        entity={entity}
        catalog={catalog}
        initialDrug={selectedDrugForAction}
        scannedDetails={scannedDrugDetails}
        onSubmitRequest={handleAddRequest}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
      />

      {/* User / Pharmacy Entity Manager Modal */}
      <PharmaUserManagerModal
        isOpen={isUserManagerOpen}
        onClose={() => setIsUserManagerOpen(false)}
        currentEntity={entity}
        entitiesList={entitiesList}
        onSelectEntity={handleSelectEntity}
        onSaveEntity={handleSaveEntity}
        onAddNewEntity={handleAddNewEntity}
        onDeleteEntity={handleDeleteEntity}
      />

      {/* Mobile / PWA App Install Modal */}
      <PharmaInstallModal
        isOpen={isInstallModalOpen}
        onClose={() => setIsInstallModalOpen(false)}
        deferredPrompt={deferredPrompt}
        onInstalled={() => setDeferredPrompt(null)}
      />

      {/* Barcode Camera Scanner Modal */}
      <PharmaBarcodeScannerModal
        isOpen={isBarcodeScannerOpen}
        onClose={() => setIsBarcodeScannerOpen(false)}
        catalog={catalog}
        onScanComplete={handleBarcodeScanned}
      />

      {/* Social Media & Telegram Broadcast Modal */}
      <PharmaSocialBroadcastModal
        isOpen={isSocialModalOpen}
        onClose={() => setIsSocialModalOpen(false)}
        payload={broadcastPayload}
      />

      {/* Pharma Match / Fulfill Action Modal */}
      <PharmaMatchActionModal
        isOpen={isMatchActionModalOpen}
        onClose={() => {
          setIsMatchActionModalOpen(false);
          setMatchActionTarget(null);
        }}
        target={matchActionTarget}
        currentEntity={entity}
        onConfirmMatch={handleConfirmMatch}
        onOpenDirectChat={handleOpenDirectChat}
      />

      {/* In-App Coordination Chat Modal */}
      <PharmaMatchChatModal
        isOpen={isChatModalOpen}
        onClose={() => {
          setIsChatModalOpen(false);
          setActiveChatTicket(null);
        }}
        ticket={activeChatTicket}
        currentEntity={entity}
        onUpdateTicket={handleUpdateTicket}
      />

      {/* Phone OTP Verification Modal */}
      <PharmaPhoneAuthModal
        isOpen={isPhoneAuthModalOpen}
        onClose={() => setIsPhoneAuthModalOpen(false)}
        onSuccessAuth={handlePhoneAuthSuccess}
        actionReason={phoneAuthReason}
      />

      {/* Platform FAQ & Workflow Guide Modal */}
      <PharmaFAQModal
        isOpen={isFAQModalOpen}
        onClose={() => setIsFAQModalOpen(false)}
      />

    </div>
  );
}
