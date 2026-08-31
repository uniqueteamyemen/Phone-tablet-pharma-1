import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Building2, 
  ArrowLeftRight, 
  Plus, 
  Search, 
  CheckCircle, 
  Trash2, 
  Clock, 
  AlertCircle,
  Phone,
  MessageSquare,
  ShieldCheck, 
  CheckCircle2,
  Share2,
  Send,
  Lock,
  Crown,
  Filter,
  UserCheck,
  Zap,
  Sparkles,
  Handshake,
  PackageCheck,
  FlaskConical,
  Pill
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { PharmaOffer, PharmaRequest, PharmaMatch, PharmaEntity, PharmaUserRole, SocialBroadcastPayload } from '../types/pharmayemen';
import { MatchActionTarget } from './PharmaMatchActionModal';
import { PharmaSupplyDemandChart } from './PharmaSupplyDemandChart';

// ---------------- OFFERS VIEW ----------------
interface PharmaOffersViewProps {
  offers: PharmaOffer[];
  requests?: PharmaRequest[];
  entity: PharmaEntity;
  userRole: PharmaUserRole;
  onOpenCreateOffer: () => void;
  onCloseOffer: (id: string) => void;
  onOpenSocialBroadcast?: (payload: SocialBroadcastPayload) => void;
  onOpenMatchAction?: (target: MatchActionTarget) => void;
}

export const PharmaOffersView: React.FC<PharmaOffersViewProps> = ({
  offers,
  requests = [],
  entity,
  userRole,
  onOpenCreateOffer,
  onCloseOffer,
  onOpenSocialBroadcast,
  onOpenMatchAction,
}) => {
  const [search, setSearch] = useState('');
  
  // Check if visitor entered via social referral link (Instagram, Facebook, Telegram campaign)
  const isSocialReferred = useMemo(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || urlParams.get('utm_source') || urlParams.get('source');
      return Boolean(ref && ['instagram', 'facebook', 'telegram', 'social', 'meta', 'tg', 'fb', 'ig'].includes(ref.toLowerCase()));
    } catch {
      return false;
    }
  }, []);

  const [viewScope, setViewScope] = useState<'all' | 'mine' | 'matched_only'>(() => {
    if (userRole === 'admin') return 'all';
    if (isSocialReferred) return 'all';
    return 'matched_only';
  });

  // Calculate my active requested drug names to show only matching offers when in matched_only mode
  const myRequestDrugNames = useMemo(() => {
    return requests
      .filter((r) => r.entityId === entity.id || r.entityName.toLowerCase() === entity.name.toLowerCase())
      .map((r) => (r.genericName || r.freeTextName || '').toLowerCase().trim())
      .filter(Boolean);
  }, [requests, entity]);

  // Filter based on scope & userRole
  const scopedOffers = offers.filter((o) => {
    if (userRole === 'admin' || viewScope === 'all') return true;
    if (viewScope === 'mine') {
      return o.entityId === entity.id || o.entityName.toLowerCase() === entity.name.toLowerCase();
    }
    if (viewScope === 'matched_only') {
      // Show my own offers OR offers matching my active requests
      const isMine = o.entityId === entity.id || o.entityName.toLowerCase() === entity.name.toLowerCase();
      if (isMine) return true;
      const offerDrug = (o.genericName || o.brandName || o.freeTextName || '').toLowerCase();
      return myRequestDrugNames.some((reqName) => offerDrug.includes(reqName) || reqName.includes(offerDrug));
    }
    return true;
  });

  const filtered = scopedOffers.filter((o) => {
    const name = o.genericName || o.brandName || o.freeTextName || '';
    return name.toLowerCase().includes(search.toLowerCase()) || o.entityName.toLowerCase().includes(search.toLowerCase());
  });

  const myOffersCount = offers.filter(
    (o) => o.entityId === entity.id || o.entityName.toLowerCase() === entity.name.toLowerCase()
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-900/50 text-slate-100">
      
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                عروض السوق الدوائي (إشارات الفائض)
                {userRole === 'admin' && (
                  <span className="text-[10px] bg-purple-900/80 text-purple-200 border border-purple-500/40 px-2 py-0.5 rounded-full">
                    رؤية الآدمن الشاملة
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                سجل عروض الأدوية المتوفرة لدى الصيدليات والمستودعات في عموم اليمن
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scopes Filter: Matched Only vs My Offers vs All Market Offers */}
          {userRole !== 'admin' && (
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1">
              <button
                onClick={() => setViewScope('matched_only')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  viewScope === 'matched_only'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="إظهار العروض المطابقة لاحتياجاتي فقط لحماية السوق"
              >
                <Handshake className="w-3.5 h-3.5 text-amber-300" />
                <span>المطابقة لاحتياجي ({scopedOffers.length})</span>
              </button>
              
              <button
                onClick={() => setViewScope('mine')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                  viewScope === 'mine'
                    ? 'bg-emerald-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                عروضي ({myOffersCount})
              </button>
              
              <button
                onClick={() => setViewScope('all')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  viewScope === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>السوق العام ({offers.length})</span>
                {isSocialReferred && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="دخول عبر رابط حملة تسويقية" />
                )}
              </button>
            </div>
          )}

          <button
            onClick={onOpenCreateOffer}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            تسجيل عرض دواء
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في العروض بالاسم الدوائي أو الصيدلية المعروض منها..."
          className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Offers Grid with Framer Motion Swipe support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <p className="text-sm font-semibold">لا توجد عروض مسجلة في هذا النطاق</p>
            <p className="text-xs text-slate-500 mt-1">اضغط على زر "تسجيل عرض دواء" لإضافة أول عرض في صيدليتك.</p>
          </div>
        ) : (
          filtered.map((offer) => {
            const isMine = offer.entityId === entity.id || offer.entityName.toLowerCase() === entity.name.toLowerCase();
            return (
              <motion.div
                key={offer.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-slate-900/90 rounded-2xl border p-4 shadow-sm transition flex flex-col justify-between relative overflow-hidden ${
                  isMine ? 'border-emerald-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-white uppercase">
                          {offer.genericName || offer.freeTextName}
                        </h3>
                        {isMine && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                            خاص بك
                          </span>
                        )}
                      </div>
                      {offer.brandName && (
                        <p className="text-xs font-semibold text-emerald-400 mt-0.5">
                          {offer.brandName}
                        </p>
                      )}
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        offer.status === 'active'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {offer.status === 'active' ? 'نشط ومتاح' : 'مغلق'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">الكمية المعروضة:</span>
                      {userRole === 'visitor' ? (
                        <span className="font-medium text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>كمية متوفرة (سجل لرؤية الرقم)</span>
                        </span>
                      ) : (
                        <span className="font-bold text-white">{offer.quantity} {offer.unit}</span>
                      )}
                    </div>
                    {offer.price && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">السعر:</span>
                        {userRole === 'visitor' ? (
                          <span className="text-slate-500 font-mono">سعر خاص للمنشآت</span>
                        ) : (
                          <span className="font-bold text-emerald-400">{offer.price} {offer.currency}</span>
                        )}
                      </div>
                    )}
                    {offer.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">تاريخ الصلاحية:</span>
                        <span className="font-medium text-amber-300 font-mono">{offer.expiryDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between pt-1 text-[11px] text-slate-400">
                      <span>المنشأة:</span>
                      {userRole === 'visitor' ? (
                        <span className="font-semibold text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>منشأة صحية معتمدة ({offer.entityName.includes('صنعاء') ? 'صنعاء' : offer.entityName.includes('عدن') ? 'عدن' : 'اليمن'})</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-200 truncate max-w-[150px]">{offer.entityName}</span>
                      )}
                    </div>
                    {offer.notes && (
                      <p className="text-[11px] bg-slate-950 p-2 rounded-lg text-slate-400 mt-2 border border-slate-800">
                        💡 {offer.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Fulfill / Match Action Button for other users */}
                  {!isMine && offer.status === 'active' && onOpenMatchAction && (
                    <button
                      onClick={() => onOpenMatchAction({ type: 'offer', item: offer })}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <PackageCheck className="w-3.5 h-3.5" />
                      <span>حجز واستلام العرض</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 mr-auto">
                    {/* Quick Social Broadcast Button */}
                    {onOpenSocialBroadcast && (
                      <button
                        onClick={() =>
                          onOpenSocialBroadcast({
                            type: 'offer',
                            drugName: offer.genericName || offer.freeTextName || 'صنف دوائي',
                            genericName: offer.genericName,
                            brandName: offer.brandName,
                            quantity: offer.quantity,
                            unit: offer.unit,
                            price: offer.price,
                            currency: offer.currency,
                            entityName: offer.entityName,
                            governorate: entity.governorate || 'صنعاء',
                            phone: entity.phone || '+967 777 000 000',
                            expiryDate: offer.expiryDate,
                            notes: offer.notes,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="بث هذا العرض على مجموعات التيليجرام وسوشيال ميديا"
                      >
                        <Send className="w-3 h-3" />
                        <span>بث تليجرام</span>
                      </button>
                    )}

                    {(userRole === 'admin' || isMine) && offer.status === 'active' && (
                      <button
                        onClick={() => onCloseOffer(offer.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer p-1"
                        title="إغلاق العرض"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ---------------- REQUESTS VIEW ----------------
interface PharmaRequestsViewProps {
  requests: PharmaRequest[];
  offers?: PharmaOffer[];
  entity: PharmaEntity;
  userRole: PharmaUserRole;
  onOpenCreateRequest: () => void;
  onCloseRequest: (id: string) => void;
  onOpenSocialBroadcast?: (payload: SocialBroadcastPayload) => void;
  onOpenMatchAction?: (target: MatchActionTarget) => void;
}

export const PharmaRequestsView: React.FC<PharmaRequestsViewProps> = ({
  requests,
  offers = [],
  entity,
  userRole,
  onOpenCreateRequest,
  onCloseRequest,
  onOpenSocialBroadcast,
  onOpenMatchAction,
}) => {
  const [search, setSearch] = useState('');
  
  // Check if visitor entered via social campaign link (Instagram, Facebook, Telegram)
  const isSocialReferred = useMemo(() => {
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || urlParams.get('utm_source') || urlParams.get('source');
      return Boolean(ref && ['instagram', 'facebook', 'telegram', 'social', 'meta', 'tg', 'fb', 'ig'].includes(ref.toLowerCase()));
    } catch {
      return false;
    }
  }, []);

  const [viewScope, setViewScope] = useState<'all' | 'mine' | 'matched_only'>(() => {
    if (userRole === 'admin') return 'all';
    if (isSocialReferred) return 'all';
    return 'matched_only';
  });

  // Calculate my active offered drug names to show only matching requests when in matched_only mode
  const myOfferedDrugNames = useMemo(() => {
    return offers
      .filter((o) => o.entityId === entity.id || o.entityName.toLowerCase() === entity.name.toLowerCase())
      .map((o) => (o.genericName || o.brandName || o.freeTextName || '').toLowerCase().trim())
      .filter(Boolean);
  }, [offers, entity]);

  // Filter based on scope & userRole
  const scopedRequests = requests.filter((r) => {
    if (userRole === 'admin' || viewScope === 'all') return true;
    if (viewScope === 'mine') {
      return r.entityId === entity.id || r.entityName.toLowerCase() === entity.name.toLowerCase();
    }
    if (viewScope === 'matched_only') {
      const isMine = r.entityId === entity.id || r.entityName.toLowerCase() === entity.name.toLowerCase();
      if (isMine) return true;
      const reqDrug = (r.genericName || r.freeTextName || '').toLowerCase();
      return myOfferedDrugNames.some((offName) => reqDrug.includes(offName) || offName.includes(reqDrug));
    }
    return true;
  });

  const filtered = scopedRequests.filter((r) => {
    const name = r.genericName || r.freeTextName || '';
    return name.toLowerCase().includes(search.toLowerCase()) || r.entityName.toLowerCase().includes(search.toLowerCase());
  });

  const myRequestsCount = requests.filter(
    (r) => r.entityId === entity.id || r.entityName.toLowerCase() === entity.name.toLowerCase()
  ).length;

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-900/50 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                طلبات الاحتياج الدوائي (إشارات الشح والنقص)
                {userRole === 'admin' && (
                  <span className="text-[10px] bg-purple-900/80 text-purple-200 border border-purple-500/40 px-2 py-0.5 rounded-full">
                    رؤية الآدمن الشاملة
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400">
                رصد احتياجات الصيدليات والمستشفيات في المحافظات لتسريع الاستجابة
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Scopes Filter: Matched Only vs My Requests vs Market Demands */}
          {userRole !== 'admin' && (
            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1">
              <button
                onClick={() => setViewScope('matched_only')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  viewScope === 'matched_only'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
                title="إظهار الطلبات المطابقة لعروضي فقط لحماية سرية السوق"
              >
                <Handshake className="w-3.5 h-3.5 text-emerald-300" />
                <span>المطابقة لعروضي ({scopedRequests.length})</span>
              </button>
              
              <button
                onClick={() => setViewScope('mine')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition ${
                  viewScope === 'mine'
                    ? 'bg-amber-700 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                طلباتي ({myRequestsCount})
              </button>
              
              <button
                onClick={() => setViewScope('all')}
                className={`px-2.5 py-1.5 rounded-lg font-bold transition flex items-center gap-1 ${
                  viewScope === 'all'
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <span>السوق العام ({requests.length})</span>
                {isSocialReferred && (
                  <span className="w-2 h-2 rounded-full bg-emerald-400" title="دخول عبر رابط حملة تسويقية" />
                )}
              </button>
            </div>
          )}

          <button
            onClick={onOpenCreateRequest}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold shadow-lg transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            تسجيل طلب احتياج
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث في الطلبات بالاسم الدوائي أو الجهة الطالبة..."
          className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
        />
      </div>

      {/* Requests Grid with Framer Motion Swipe support */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <p className="text-sm font-semibold">لا توجد طلبات احتياج مسجلة في هذا النطاق</p>
            <p className="text-xs text-slate-500 mt-1">اضغط على زر "تسجيل طلب احتياج" لنشر احتياج صيدليتك فوراً.</p>
          </div>
        ) : (
          filtered.map((req) => {
            const isMine = req.entityId === entity.id || req.entityName.toLowerCase() === entity.name.toLowerCase();
            return (
              <motion.div
                key={req.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className={`bg-slate-900/90 rounded-2xl border p-4 shadow-sm transition flex flex-col justify-between relative overflow-hidden ${
                  isMine ? 'border-amber-500/40' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <h3 className="text-sm font-black text-white uppercase">
                          {req.genericName || req.freeTextName}
                        </h3>
                        {isMine && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            خاص بك
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                        req.urgency === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-500/40'
                          : req.urgency === 'high'
                          ? 'bg-amber-950 text-amber-300 border border-amber-500/40'
                          : 'bg-slate-800 text-slate-300'
                      }`}
                    >
                      {req.urgency === 'critical' ? 'حرج جداً' : req.urgency === 'high' ? 'عاجل' : 'عادي'}
                    </span>
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800 space-y-1.5 text-xs text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400">الكمية المطلوبة:</span>
                      {userRole === 'visitor' ? (
                        <span className="font-medium text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-amber-400" />
                          <span>احتياج مطلوب (سجل لرؤية الكمية)</span>
                        </span>
                      ) : (
                        <span className="font-bold text-white">{req.quantity} {req.unit}</span>
                      )}
                    </div>
                    <div className="flex justify-between pt-1 text-[11px] text-slate-400">
                      <span>الجهة الطالبة:</span>
                      {userRole === 'visitor' ? (
                        <span className="font-semibold text-slate-400 flex items-center gap-1">
                          <Lock className="w-3 h-3 text-slate-500" />
                          <span>صيدلية/مستشفى مرخص ({req.entityName.includes('صنعاء') ? 'صنعاء' : req.entityName.includes('عدن') ? 'عدن' : 'اليمن'})</span>
                        </span>
                      ) : (
                        <span className="font-semibold text-slate-200 truncate max-w-[150px]">{req.entityName}</span>
                      )}
                    </div>
                    {req.notes && (
                      <p className="text-[11px] bg-slate-950 p-2 rounded-lg text-slate-400 mt-2 border border-slate-800">
                        📌 {req.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between gap-2">
                  
                  {/* Fulfill Action Button for other users */}
                  {!isMine && req.status === 'open' && onOpenMatchAction && (
                    <button
                      onClick={() => onOpenMatchAction({ type: 'request', item: req })}
                      className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                    >
                      <Handshake className="w-3.5 h-3.5" />
                      <span>متوفر لدي / تلبية الاحتياج</span>
                    </button>
                  )}

                  <div className="flex items-center gap-1.5 mr-auto">
                    {/* Quick Social Broadcast Button */}
                    {onOpenSocialBroadcast && (
                      <button
                        onClick={() =>
                          onOpenSocialBroadcast({
                            type: 'request',
                            drugName: req.genericName || req.freeTextName || 'دواء مطلوب',
                            genericName: req.genericName,
                            quantity: req.quantity,
                            unit: req.unit,
                            entityName: req.entityName,
                            governorate: entity.governorate || 'صنعاء',
                            phone: entity.phone || '+967 777 000 000',
                            urgency: req.urgency,
                            notes: req.notes,
                          })
                        }
                        className="px-2.5 py-1 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="بث هذا الطلب على مجموعات التيليجرام وسوشيال ميديا"
                      >
                        <Send className="w-3 h-3" />
                        <span>بث تليجرام</span>
                      </button>
                    )}

                    {(userRole === 'admin' || isMine) && req.status === 'open' && (
                      <button
                        onClick={() => onCloseRequest(req.id)}
                        className="text-xs text-rose-400 hover:text-rose-300 font-semibold flex items-center gap-1 cursor-pointer p-1"
                        title="إلغاء الطلب"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
};

// ---------------- MATCHES VIEW (With Admin vs Pharmacy Role Separation) ----------------
interface PharmaMatchesViewProps {
  matches: PharmaMatch[];
  entity: PharmaEntity;
  userRole: PharmaUserRole;
  offers?: PharmaOffer[];
  requests?: PharmaRequest[];
}

export const PharmaMatchesView: React.FC<PharmaMatchesViewProps> = ({ 
  matches,
  entity,
  userRole,
  offers = [],
  requests = [],
}) => {
  const [selectedMatch, setSelectedMatch] = useState<PharmaMatch | null>(null);

  // PRIVACY FILTER:
  // - If userRole === 'admin': Super Admin sees ALL matches across Yemen.
  // - If userRole === 'pharmacy': User sees ONLY matches involving their active entity (either offering or requesting).
  const visibleMatches = matches.filter((m) => {
    if (userRole === 'admin') return true;
    const entName = entity.name.toLowerCase();
    return (
      m.offeringEntity.toLowerCase().includes(entName) ||
      m.requestingEntity.toLowerCase().includes(entName) ||
      m.offeringEntity === entity.name ||
      m.requestingEntity === entity.name
    );
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5 bg-slate-900/50 text-slate-100">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ArrowLeftRight className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                محرك المطابقة اللحظية وتحليل الفجوات الدوائية
                {userRole === 'admin' ? (
                  <span className="text-[10px] bg-purple-900/80 text-purple-200 border border-purple-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="w-3 h-3 text-amber-400" />
                    رؤية الآدمن (كافة المطابقات في اليمن)
                  </span>
                ) : (
                  <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    وضع الخصوصية: مطابقات صيدليتك فقط
                  </span>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                الربط التلقائي بين عروض الفائض وطلبات الشح المتقاربة بالاعتماد على الذكاء الدوائي
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Supply vs Demand Recharts Visualization (Admin / Pro Gated) */}
      <PharmaSupplyDemandChart
        entity={entity}
        offers={offers}
        requests={requests}
        matches={matches}
      />

      <div className="pt-2 flex items-center justify-between">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <span>نتائج المطابقات المتاحة لك ({visibleMatches.length})</span>
        </h3>
        {userRole === 'pharmacy' && (
          <span className="text-xs text-slate-400">
            🔒 تم حجب عروض ومطابقات المنشآت الأخرى حفاظاً على سرية العمليات التجارية.
          </span>
        )}
      </div>

      {/* Matches Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {visibleMatches.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">
              {userRole === 'pharmacy'
                ? 'لا توجد مطابقات مباشرة تخص صيدليتك حالياً'
                : 'لا توجد مطابقات مكتشفة في النظام حالياً'}
            </p>
            <p className="text-xs text-slate-500 mt-1">
              {userRole === 'pharmacy'
                ? 'قم بإضافة عروض فائض أو طلبات احتياج لتقوم الخوارزمية بربطها فوراً مع الصيدليات والمستشفيات المطابقة.'
                : 'سيقوم المحرك بالربط تلقائياً بمجرد تسجيل عروض وطلبات متوافقة.'}
            </p>
          </div>
        ) : (
          visibleMatches.map((match) => (
            <div
              key={match.id}
              className="bg-slate-900/90 rounded-2xl border border-emerald-500/30 p-5 shadow-sm space-y-4 hover:border-emerald-500 transition relative overflow-hidden"
            >
              {/* Header: Drug Name & Clinical Match Status Pill */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-1.5">
                    <FlaskConical className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase">المادة الفعالة / الصنف</span>
                  </div>
                  <h3 className="text-base font-black text-white uppercase mt-0.5 flex items-center gap-2">
                    <span>{match.activeIngredientAr || match.activeIngredient || match.drugName}</span>
                    {match.activeIngredient && match.activeIngredientAr && (
                      <span className="text-xs font-normal text-slate-400 font-mono">({match.activeIngredient})</span>
                    )}
                  </h3>
                </div>

                <div className="shrink-0">
                  {match.clinicalMatchKind === 'exact_clinical' ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-950 text-emerald-300 border border-emerald-500/40 text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                      <Sparkles className="w-3 h-3" />
                      تطابق سريري تام
                    </span>
                  ) : match.clinicalMatchKind === 'alt_strength' ? (
                    <span className="inline-flex items-center gap-1 bg-amber-950/90 text-amber-300 border border-amber-500/40 text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                      <AlertCircle className="w-3 h-3" />
                      تطابق المادة (جرعة بديلة)
                    </span>
                  ) : match.clinicalMatchKind === 'alt_form' ? (
                    <span className="inline-flex items-center gap-1 bg-purple-950/90 text-purple-300 border border-purple-500/40 text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                      <Pill className="w-3 h-3" />
                      تطابق المادة (هيئة بديلة)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 bg-orange-950/90 text-orange-300 border border-orange-500/40 text-xs font-black px-2.5 py-1 rounded-full shadow-xs">
                      <AlertCircle className="w-3 h-3" />
                      تطابق المادة (جرعة/هيئة بديلة)
                    </span>
                  )}
                </div>
              </div>

              {/* Unified Pharmacological & Dosage Analysis Box */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                
                {/* 1. Strength / Dose Box (Highlights in Amber/Orange if different) */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 transition ${
                  match.isSameStrength
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                    : 'bg-amber-950/30 border-amber-500/50 text-amber-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">الجرعة / التركيز</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      match.isSameStrength
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    }`}>
                      {match.isSameStrength ? 'نفس الجرعة' : 'جرعة مختلفة ⚠️'}
                    </span>
                  </div>
                  <div className="text-xs font-bold font-mono">
                    {match.isSameStrength ? (
                      <span className="text-emerald-300">{match.offerStrength || 'متوافقة'}</span>
                    ) : (
                      <div className="flex items-center justify-between text-[11px]">
                        <span>العرض: <strong className="text-amber-300">{match.offerStrength || 'غير محدد'}</strong></span>
                        <span className="text-slate-500">↔️</span>
                        <span>الطلب: <strong className="text-amber-300">{match.requestStrength || 'غير محدد'}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Dosage Form Box (Highlights in Purple/Amber if different) */}
                <div className={`p-3 rounded-xl border flex flex-col justify-between gap-1.5 transition ${
                  match.isSameDosageForm
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                    : 'bg-purple-950/30 border-purple-500/50 text-purple-100'
                }`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-400">الهيئة / الشكل الدوائي</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      match.isSameDosageForm
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                    }`}>
                      {match.isSameDosageForm ? 'نفس الهيئة' : 'شكل بديل 🔄'}
                    </span>
                  </div>
                  <div className="text-xs font-bold">
                    {match.isSameDosageForm ? (
                      <span className="text-emerald-300">{match.offerDosageForm || 'متطابقة'}</span>
                    ) : (
                      <div className="flex items-center justify-between text-[11px]">
                        <span>العرض: <strong className="text-purple-300">{match.offerDosageForm || 'غير محدد'}</strong></span>
                        <span className="text-slate-500">↔️</span>
                        <span>الطلب: <strong className="text-purple-300">{match.requestDosageForm || 'غير محدد'}</strong></span>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Match Parties & Quantities Box */}
              <div className="bg-slate-950/80 p-3.5 rounded-xl space-y-2.5 text-xs border border-slate-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span className="font-semibold text-slate-300">الجهة العارضة (الفائض):</span>
                  </div>
                  <span className="font-bold text-white">{match.offeringEntity}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>الكمية المعروضة:</span>
                  <span className="font-semibold text-slate-200">{match.offerQuantity}</span>
                </div>

                <div className="h-px bg-slate-800 my-1" />

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span className="font-semibold text-slate-300">الجهة الطالبة (الاحتياج):</span>
                  </div>
                  <span className="font-bold text-white">{match.requestingEntity}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>الكمية المطلوبة:</span>
                  <span className="font-semibold text-slate-200">{match.requestQuantity}</span>
                </div>

                {/* Clinical Notes & Pharmacological Guidance */}
                {match.clinicalNotes && (
                  <div className="mt-2 pt-2 border-t border-slate-800/80 bg-slate-900/60 p-2.5 rounded-lg text-[11px] text-slate-300 space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>التقييم الدوائي السريري:</span>
                    </div>
                    <p className="text-slate-300 leading-snug">
                      {match.clinicalNotes}
                    </p>
                  </div>
                )}
              </div>

              {/* Action */}
              <div className="pt-2 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  تم الرصد: {new Date(match.createdAt).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => setSelectedMatch(match)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Phone className="w-3.5 h-3.5" />
                  بدء التنسيق والتواصل
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Coordinate Modal */}
      {selectedMatch && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 max-w-md w-full rounded-2xl p-6 border border-slate-800 shadow-2xl space-y-4 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                تنسيق ربط العرض والطلب
              </h3>
              <button
                onClick={() => setSelectedMatch(null)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-300">
              <p>
                تمت المطابقة بنجاح للصنف: <strong className="text-white uppercase">{selectedMatch.drugName}</strong>
              </p>
              <div className="bg-emerald-950/40 p-3.5 rounded-xl border border-emerald-500/20 space-y-2">
                <div>
                  <span className="text-slate-400 block text-[11px]">الطرف الأول (العارض):</span>
                  <span className="font-bold text-white">{selectedMatch.offeringEntity}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">الطرف الثاني (الطالب):</span>
                  <span className="font-bold text-white">{selectedMatch.requestingEntity}</span>
                </div>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                📌 تتيح المنصة تبادل إشارات التوفر وتوثيق حركة السوق الدوائي بين المنشآت الصحية المرخصة في اليمن. يتم التنسيق المباشر بين مسؤولي التوريد لإتمام إجراءات الاستلام والتسليم المعتمدة نظاماً.
              </p>
            </div>

            <button
              onClick={() => setSelectedMatch(null)}
              className="w-full py-2.5 bg-emerald-600 text-white rounded-xl font-bold text-xs shadow hover:bg-emerald-500 transition cursor-pointer"
            >
              تم استعراض بيانات التنسيق
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
