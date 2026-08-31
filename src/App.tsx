import React, { useState, useEffect, useMemo } from 'react';
import { 
  PharmaEntity, 
  PharmaOffer, 
  PharmaRequest, 
  PharmaMatch, 
  PharmaCatalogDrug, 
  PharmaUserRole,
  SocialBroadcastPayload,
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
import { PharmaStockAlertsView } from './components/PharmaStockAlertsView';
import { PharmaSocialBroadcastView } from './components/PharmaSocialBroadcastView';
import { PharmaSocialBroadcastModal } from './components/PharmaSocialBroadcastModal';
import { PharmaClinicalTools } from './components/PharmaClinicalTools';
import { PharmaAboutView } from './components/PharmaAboutView';
import { CreateOfferModal, CreateRequestModal } from './components/PharmaModals';
import { PharmaUserManagerModal } from './components/PharmaUserManagerModal';
import { PharmaInstallModal } from './components/PharmaInstallModal';
import { PharmaBarcodeScannerModal } from './components/PharmaBarcodeScannerModal';
import { PharmaMatchActionModal, MatchActionTarget } from './components/PharmaMatchActionModal';
import { useTouchSwipe } from './hooks/useTouchSwipe';

const TAB_ORDER: PharmaTab[] = ['overview', 'catalog', 'offers', 'requests', 'matches', 'alerts', 'social', 'clinical', 'about'];

export default function App() {
  // 1. Core Platform State & Entities
  const [entitiesList, setEntitiesList] = useState<PharmaEntity[]>(() => loadPharmaEntitiesList());
  const [entity, setEntity] = useState<PharmaEntity>(() => loadPharmaEntity());
  
  // Improvement #1: Default to 'visitor' mode to protect sensitive entities & quantities
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

  const handleApproveDrugToCatalog = (newDrug: PharmaCatalogDrug) => {
    setCatalog((prev) => [newDrug, ...prev]);
    try {
      const stored = localStorage.getItem('pharmayemen_approved_custom_drugs');
      const customApproved: PharmaCatalogDrug[] = stored ? JSON.parse(stored) : [];
      customApproved.unshift(newDrug);
      localStorage.setItem('pharmayemen_approved_custom_drugs', JSON.stringify(customApproved));
    } catch (e) {
      console.error(e);
    }
  };
  
  // Retain all offers & requests by default to activate market liquidity and growth (no forced auto-expiry)
  const [autoExpiryEnabled, setAutoExpiryEnabled] = useState<boolean>(() => {
    return localStorage.getItem('pharmayemen_auto_expiry_enabled') === 'true';
  });

  const [offers, setOffers] = useState<PharmaOffer[]>(() => {
    return loadPharmaOffers();
  });
  
  const [requests, setRequests] = useState<PharmaRequest[]>(() => {
    return loadPharmaRequests();
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
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState(false);
  const [isBarcodeScannerOpen, setIsBarcodeScannerOpen] = useState(false);
  const [selectedDrugForAction, setSelectedDrugForAction] = useState<PharmaCatalogDrug | null>(null);
  const [scannedDrugDetails, setScannedDrugDetails] = useState<any>(null);

  // Social Broadcast State
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [broadcastPayload, setBroadcastPayload] = useState<SocialBroadcastPayload | null>(null);

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

  // 2. Compute dynamic market matches combined with user manual matches
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

    // Auto-prepare social broadcast payload with protected anonymous publisher identity
    const payload: SocialBroadcastPayload = {
      id: `broadcast-${Date.now()}`,
      type: 'offer',
      drugName: newOffer.genericName || newOffer.brandName || newOffer.freeTextName || 'دواء معروض',
      brandName: newOffer.brandName,
      strength: newOffer.strength,
      quantity: newOffer.quantity,
      unit: newOffer.unit,
      governorate: entity.governorate || 'اليمن',
      expiryDate: newOffer.expiryDate,
      price: newOffer.price,
      currency: newOffer.currency,
      notes: newOffer.notes,
      createdAt: new Date().toISOString(),
    };
    setBroadcastPayload(payload);
    setIsSocialModalOpen(true);
  };

  const handleCloseOffer = (id: string) => {
    setOffers((prev) => prev.map((o) => (o.id === id ? { ...o, status: 'closed' } : o)));
  };

  const handleAddRequest = (newReqData: Omit<PharmaRequest, 'id' | 'createdAt'>) => {
    const newReq: PharmaRequest = {
      ...newReqData,
      id: `req-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setRequests((prev) => [newReq, ...prev]);
    setActiveTab('requests');

    // Auto-prepare social broadcast payload with protected anonymous publisher identity
    const payload: SocialBroadcastPayload = {
      id: `broadcast-${Date.now()}`,
      type: 'request',
      drugName: newReq.genericName || newReq.freeTextName || 'دواء مطلوب',
      strength: newReq.strength,
      quantity: newReq.quantity,
      unit: newReq.unit,
      governorate: entity.governorate || 'اليمن',
      urgency: newReq.urgency,
      notes: newReq.notes,
      createdAt: new Date().toISOString(),
    };
    setBroadcastPayload(payload);
    setIsSocialModalOpen(true);
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
    setMatchActionTarget(target);
    setIsMatchActionModalOpen(true);
  };

  const handleConfirmMatch = (newMatch: PharmaMatch) => {
    setUserConfirmedMatches((prev) => [newMatch, ...prev]);
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
        onOpenInstallModal={() => setIsInstallModalOpen(true)}
        onOpenBarcodeScanner={() => setIsBarcodeScannerOpen(true)}
        onOpenGoogleAutofill={() => setIsUserManagerOpen(true)}
        onOpenSocialBroadcast={() => setActiveTab('social')}
      />

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
      />

    </div>
  );
}
