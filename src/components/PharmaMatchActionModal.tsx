import React, { useState, useEffect } from 'react';
import { 
  X, 
  Handshake, 
  CheckCircle2, 
  Phone, 
  Building2, 
  MapPin, 
  Sparkles, 
  Send, 
  ShieldCheck, 
  ArrowLeftRight,
  MessageCircle,
  PackageCheck,
  Lock,
  Clock
} from 'lucide-react';
import { PharmaEntity, PharmaOffer, PharmaRequest, PharmaMatch, PharmaMatchTicket } from '../types/pharmayemen';

export type MatchActionTarget = 
  | { type: 'offer'; item: PharmaOffer }
  | { type: 'request'; item: PharmaRequest };

interface PharmaMatchActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: MatchActionTarget | null;
  currentEntity: PharmaEntity;
  onConfirmMatch: (newMatch: PharmaMatch, newTicket: PharmaMatchTicket) => void;
  onOpenDirectChat?: (ticket: PharmaMatchTicket) => void;
}

export const PharmaMatchActionModal: React.FC<PharmaMatchActionModalProps> = ({
  isOpen,
  onClose,
  target,
  currentEntity,
  onConfirmMatch,
  onOpenDirectChat,
}) => {
  const [responderName, setResponderName] = useState(currentEntity.name || '');
  const [responderPhone, setResponderPhone] = useState(currentEntity.phone || '');
  const [responderCity, setResponderCity] = useState(
    currentEntity.city ? `${currentEntity.governorate} - ${currentEntity.city}` : currentEntity.governorate
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [initialMessage, setInitialMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdTicket, setCreatedTicket] = useState<PharmaMatchTicket | null>(null);

  useEffect(() => {
    if (isOpen && target) {
      setResponderName(currentEntity.name || '');
      setResponderPhone(currentEntity.phone || '');
      setResponderCity(
        currentEntity.city ? `${currentEntity.governorate} - ${currentEntity.city}` : currentEntity.governorate
      );
      setQuantity(target.item.quantity || 1);
      setInitialMessage(
        target.type === 'offer' 
          ? `السلام عليكم، أود حجز كمية (${target.item.quantity} ${target.item.unit}) من هذا الصنف المتاح.` 
          : `السلام عليكم، الصنف متوفر لدينا وبإمكاننا تغطية احتياجكم بالكمية المطلوبة.`
      );
      setIsSuccess(false);
      setCreatedTicket(null);
    }
  }, [isOpen, target, currentEntity]);

  if (!isOpen || !target) return null;

  const isTargetOffer = target.type === 'offer';
  const offerItem = isTargetOffer ? (target.item as PharmaOffer) : null;
  const requestItem = !isTargetOffer ? (target.item as PharmaRequest) : null;

  const drugName = isTargetOffer 
    ? (offerItem?.genericName || offerItem?.brandName || offerItem?.freeTextName || 'صنف دوائي')
    : (requestItem?.genericName || requestItem?.freeTextName || 'صنف دوائي');

  const unit = isTargetOffer ? (offerItem?.unit || 'وحدة') : (requestItem?.unit || 'وحدة');
  const targetEntityName = isTargetOffer ? offerItem?.entityName : requestItem?.entityName;
  const targetEntityId = isTargetOffer ? offerItem?.entityId : requestItem?.entityId;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const ticketId = `ticket-${Date.now()}`;
    const matchId = `match-action-${Date.now()}`;

    const newTicket: PharmaMatchTicket = {
      id: ticketId,
      matchId,
      targetType: target.type,
      targetItemId: target.item.id,
      drugName,
      quantity,
      unit,
      governorate: currentEntity.governorate || 'اليمن',
      initiatorEntityId: currentEntity.id,
      initiatorName: responderName,
      initiatorPhone: responderPhone,
      ownerEntityId: targetEntityId || 'owner-ent',
      ownerName: targetEntityName || 'الصيدلية المعلنة',
      ownerPhone: '+967 77x xxx xxx (محمي)',
      coordinationStatus: 'pending_approval',
      phoneExchanged: false,
      messages: [
        {
          id: `msg-init-${Date.now()}`,
          senderEntityId: currentEntity.id,
          senderName: responderName,
          senderRole: 'sender',
          text: initialMessage.trim() || `أرغب بالتنسيق بخصوص صنف (${drugName}) بالكمية (${quantity} ${unit}).`,
          timestamp: new Date().toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' }),
        },
      ],
      lastActivityAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
    };

    const match: PharmaMatch = {
      id: matchId,
      ticketId,
      offerId: isTargetOffer ? offerItem!.id : `off-adhoc-${Date.now()}`,
      requestId: !isTargetOffer ? requestItem!.id : `req-adhoc-${Date.now()}`,
      drugName,
      activeIngredient: drugName,
      activeIngredientAr: drugName,
      offeringEntity: isTargetOffer ? offerItem!.entityName : responderName,
      requestingEntity: !isTargetOffer ? requestItem!.entityName : responderName,
      offerQuantity: isTargetOffer ? offerItem!.quantity : quantity,
      requestQuantity: !isTargetOffer ? requestItem!.quantity : quantity,
      matchType: 'clinical',
      createdAt: new Date().toISOString(),
      status: 'connected',
      isSameStrength: true,
      isSameDosageForm: true,
      clinicalMatchKind: 'exact_clinical',
      clinicalMatchLabel: 'تنسيق داخلي آمن وموثق',
    };

    setCreatedTicket(newTicket);
    setIsSuccess(true);
    onConfirmMatch(match, newTicket);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl border ${
              isTargetOffer 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' 
                : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
            }`}>
              <Handshake className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {isTargetOffer ? 'طلب حجز وتنسيق استلام العرض' : 'تلبية الاحتياج (فتح محادثة آمنة)'}
              </h3>
              <p className="text-xs text-slate-400">
                {isTargetOffer 
                  ? 'إرسال طلب رسمي لصاحب العرض لفتح محادثة تنسيق خاصة ومحمية' 
                  : 'إشعار الصيدلية الطالبة بتوفر الصنف وبدء المحادثة داخل المنصة'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          
          {/* Target Drug Summary Card */}
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                isTargetOffer 
                  ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
              }`}>
                {isTargetOffer ? '🟢 صنف معروض متاح' : '🔴 صنف مطلوب بصورة عاجلة'}
              </span>
              <span className="text-xs text-slate-400 font-mono">
                الكمية المسجلة: <strong className="text-white">{target.item.quantity} {unit}</strong>
              </span>
            </div>

            <div className="pt-1">
              <h4 className="text-base font-black text-white uppercase">{drugName}</h4>
              {isTargetOffer && offerItem?.brandName && (
                <p className="text-xs text-emerald-400 font-semibold">{offerItem.brandName}</p>
              )}
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2">
              <span>الجهة المعلنة: <strong className="text-slate-200">{targetEntityName}</strong></span>
              <span className="flex items-center gap-1 text-slate-500">
                <Lock className="w-3 h-3" />
                <span>الهاتف محمي لحين الموافقة</span>
              </span>
            </div>
          </div>

          {!isSuccess ? (
            /* Input Form to start coordination ticket */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  بروتوكول حماية الصيدليات والمنشآت:
                </span>
                <p className="leading-relaxed text-[11px] text-slate-400">
                  لا يتم كشف أرقام الهواتف أو إتاحة الاتصال المباشر إلا بعد إرسال رسالة التنسيق وقبول الطرفين للمطابقة داخل مربع الحوار الآمن.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    اسم صيدليتك / منشأتك: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={responderName}
                    onChange={(e) => setResponderName(e.target.value)}
                    placeholder="مثال: صيدلية النور"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الكمية المنسقة: <span className="text-rose-400">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                      required
                    />
                    <span className="text-xs text-slate-400 whitespace-nowrap">{unit}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  رسالة التنسيق الأولية في الشات الداخلي:
                </label>
                <textarea
                  value={initialMessage}
                  onChange={(e) => setInitialMessage(e.target.value)}
                  rows={2}
                  placeholder="أدخل رسالتك الموجهة للصيدلية الأخرى..."
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl text-white text-xs font-bold shadow-lg transition flex items-center gap-1.5 cursor-pointer ${
                    isTargetOffer
                      ? 'bg-emerald-600 hover:bg-emerald-500'
                      : 'bg-amber-600 hover:bg-amber-500'
                  }`}
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>{isTargetOffer ? 'إرسال طلب الحجز وفتح الشات' : 'إرسال إشعار التوفر وفتح الشات'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Success & Action Box */
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white">
                  تم فتح تذكرة التنسيق والمحادثة بنجاح!
                </h4>
                <p className="text-xs text-slate-400">
                  تم إرسال إشعار إلى <strong className="text-white">{targetEntityName}</strong>. يمكنك الآن متابعة المحادثة الآمنة مباشرة داخل المنصة.
                </p>
              </div>

              {/* Direct Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={() => {
                    onClose();
                    if (createdTicket && onOpenDirectChat) {
                      onOpenDirectChat(createdTicket);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>فتح مربع الحوار الآمن الآن</span>
                </button>

                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  إغلاق ومتابعة التصفح
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
