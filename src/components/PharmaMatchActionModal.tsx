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
  PackageCheck
} from 'lucide-react';
import { PharmaEntity, PharmaOffer, PharmaRequest, PharmaMatch } from '../types/pharmayemen';

export type MatchActionTarget = 
  | { type: 'offer'; item: PharmaOffer }
  | { type: 'request'; item: PharmaRequest };

interface PharmaMatchActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  target: MatchActionTarget | null;
  currentEntity: PharmaEntity;
  onConfirmMatch: (newMatch: PharmaMatch) => void;
}

export const PharmaMatchActionModal: React.FC<PharmaMatchActionModalProps> = ({
  isOpen,
  onClose,
  target,
  currentEntity,
  onConfirmMatch,
}) => {
  const [responderName, setResponderName] = useState(currentEntity.name || '');
  const [responderPhone, setResponderPhone] = useState(currentEntity.phone || '');
  const [responderCity, setResponderCity] = useState(
    currentEntity.city ? `${currentEntity.governorate} - ${currentEntity.city}` : currentEntity.governorate
  );
  const [quantity, setQuantity] = useState<number>(1);
  const [notes, setNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdMatch, setCreatedMatch] = useState<PharmaMatch | null>(null);

  useEffect(() => {
    if (isOpen && target) {
      setResponderName(currentEntity.name || '');
      setResponderPhone(currentEntity.phone || '');
      setResponderCity(
        currentEntity.city ? `${currentEntity.governorate} - ${currentEntity.city}` : currentEntity.governorate
      );
      setQuantity(target.item.quantity || 1);
      setNotes('');
      setIsSuccess(false);
      setCreatedMatch(null);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const match: PharmaMatch = {
      id: `match-action-${Date.now()}`,
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
      clinicalMatchLabel: 'تنسيق مباشر لتلبية الصنف',
    };

    setCreatedMatch(match);
    setIsSuccess(true);
    onConfirmMatch(match);
  };

  const handleOpenWhatsApp = () => {
    const text = encodeURIComponent(
      `السلام عليكم، بخصوص صنف (${drugName}) المسجل في منصة PharmaYemen.\nأنا ${responderName}، أود التنسيق بشأن مطابقة الكمية (${quantity} ${unit}).`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
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
                {isTargetOffer ? 'حجز وتنسيق استلام العرض' : 'تلبية الاحتياج (متوفر لدي)'}
              </h3>
              <p className="text-xs text-slate-400">
                {isTargetOffer 
                  ? 'إبداء الرغبة في استلام الصنف المعروض والربط الآمن عبر المنصة' 
                  : 'تأكيد توفر الصنف لديك لتلبية احتياج الصيدلية أو المستشفى الطالب'}
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

            {target.item.notes && (
              <p className="text-[11px] text-slate-400 bg-slate-900/80 p-2 rounded-lg border border-slate-800/80">
                📌 {target.item.notes}
              </p>
            )}
          </div>

          {!isSuccess ? (
            /* Input Form to register intent */
            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              <div className="p-3 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  حماية الخصوصية والتنسيق الموثق:
                </span>
                <p className="leading-relaxed text-[11px] text-slate-400">
                  لا تظهر أرقام الهواتف بشكل عشوائي. بمجرد إدخال بياناتك وتأكيد الكمية، سيتم فتح قناة التواصل المباشر بينكما وتوثيق المطابقة في المنصة.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم منشأتك (صيدلية / مستودع / مستشفى): <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={responderName}
                  onChange={(e) => setResponderName(e.target.value)}
                  placeholder="مثال: صيدلية النور، مستودع الأمل..."
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    رقم الهاتف / واتساب للتنسيق: <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={responderPhone}
                    onChange={(e) => setResponderPhone(e.target.value)}
                    placeholder="مثال: +967 777 000 000"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    الكمية التي {isTargetOffer ? 'ترغب بحجزها' : 'تستطيع توفيرها'}: <span className="text-rose-400">*</span>
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
                  المحافظة والمدينة:
                </label>
                <input
                  type="text"
                  value={responderCity}
                  onChange={(e) => setResponderCity(e.target.value)}
                  placeholder="مثال: صنعاء - شارع الزبيري"
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  ملاحظات إضافية للتنسيق (اختياري):
                </label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="مثال: جاهز للاستلام فوراً، أو خصم متفق عليه..."
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
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
                  <PackageCheck className="w-4 h-4" />
                  <span>{isTargetOffer ? 'تأكيد حجز واستلام العرض' : 'تأكيد تلبية الاحتياج والربط'}</span>
                </button>
              </div>
            </form>
          ) : (
            /* Success & Direct Coordination Screen */
            <div className="space-y-4 text-center py-2 animate-in fade-in">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h4 className="text-base font-black text-white">
                  تم تسجيل المطابقة والتنسيق بنجاح!
                </h4>
                <p className="text-xs text-slate-400">
                  تم توثيق رغبتك بالربط في سجل مطابقات منصة PharmaYemen للصنف «{drugName}».
                </p>
              </div>

              {/* Revealed Contact Data */}
              <div className="p-4 rounded-2xl bg-slate-950 border border-emerald-500/40 text-right space-y-2.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">الجهة المطابقة:</span>
                  <span className="font-bold text-white">{targetEntityName}</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">الكمية المنسقة:</span>
                  <span className="font-bold text-emerald-400">{quantity} {unit}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">حالة الربط:</span>
                  <span className="bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded font-bold text-[11px]">
                    جاهز للتواصل المباشر
                  </span>
                </div>
              </div>

              {/* Direct Actions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                <button
                  onClick={handleOpenWhatsApp}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>تواصل عبر WhatsApp</span>
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition cursor-pointer"
                >
                  إغلاق والانتقال للمطابقات
                </button>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
