import React, { useState } from 'react';
import { 
  BellRing, 
  Sparkles, 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  ShieldAlert, 
  Zap, 
  CheckCircle2, 
  Send, 
  Share2, 
  Lock, 
  Crown,
  Smartphone,
  Check,
  ChevronRight,
  Filter,
  ArrowRightLeft
} from 'lucide-react';
import { PharmaEntity, PharmaOffer, PharmaRequest, PharmaStockAlert } from '../types/pharmayemen';
import { generateSmartStockAlerts } from '../utils/pharmaAlerts';

interface PharmaStockAlertsViewProps {
  entity: PharmaEntity;
  offers: PharmaOffer[];
  requests: PharmaRequest[];
  onUpgradePlan: (plan: 'pro' | 'enterprise') => void;
  onOpenCreateOfferWithDrug?: (drugName: string, quantity: number, unit: string) => void;
  onOpenSocialBroadcast?: (alert: PharmaStockAlert) => void;
}

export const PharmaStockAlertsView: React.FC<PharmaStockAlertsViewProps> = ({
  entity,
  offers,
  requests,
  onUpgradePlan,
  onOpenCreateOfferWithDrug,
  onOpenSocialBroadcast,
}) => {
  const isPro = entity.subscriptionPlan === 'pro' || entity.subscriptionPlan === 'enterprise';
  const [filterType, setFilterType] = useState<'all' | 'near_expiry' | 'stagnant_stock' | 'market_shortage'>('all');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [activeChannel, setActiveChannel] = useState<'telegram' | 'whatsapp' | 'push'>('telegram');

  const alerts = generateSmartStockAlerts(offers, requests, entity);

  const filteredAlerts = alerts.filter((a) => {
    if (filterType === 'all') return true;
    return a.type === filterType;
  });

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/50 text-slate-100">
      
      {/* Header Banner with Pro Badge */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-850 to-indigo-950/70 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="space-y-1.5 z-10">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-inner">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                  نظام تنبيهات المخزون ورادار الرواكد
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 flex items-center gap-1 shadow-xs">
                  <Crown className="w-3 h-3" />
                  خدمة PRO المدفوعة
                </span>
              </div>
              <p className="text-xs text-slate-400">
                الرصد التلقائي للأدوية قبل فوات الصلاحية، تحريك الرواكد، وكشف نقص السوق في المحافظات
              </p>
            </div>
          </div>
        </div>

        {/* Pro Status & Upgrade Trigger */}
        <div className="flex items-center gap-3 z-10">
          {isPro ? (
            <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-500/40 px-3.5 py-2 rounded-xl text-emerald-300 text-xs font-bold">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>باقتك مفعلة: PharmaYemen PRO ⚡</span>
            </div>
          ) : (
            <button
              onClick={() => setShowUpgradeModal(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-black shadow-lg hover:shadow-amber-500/20 transition flex items-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-slate-950" />
              <span>ترقية أو بدء تجربة مجانية (14 يوماً)</span>
            </button>
          )}
        </div>
      </div>

      {/* Subscription Features Overview Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-amber-400 font-bold">
            <Clock className="w-4 h-4" />
            <span>رادار الصلاحية الاستباقي</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            فحص صلاحية الأصناف قبل 3 إلى 6 أشهر وتوليد إشارات تدوير للعيادات والمستشفيات لتجنب التلف.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-indigo-400 font-bold">
            <TrendingDown className="w-4 h-4" />
            <span>تسييل الرواكد والمخزون الراكد</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            ربط الأصناف بطيئة الحركة مع صيدليات المحافظات الأخرى التي تشهد طلباً نشطاً عليها فوراً.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800/80 space-y-2">
          <div className="flex items-center gap-2 text-rose-400 font-bold">
            <ShieldAlert className="w-4 h-4" />
            <span>رصد انقطاع وشح الأدوية</span>
          </div>
          <p className="text-slate-400 text-[11px] leading-relaxed">
            تنبيهات فورية عند نفاد صنف حيوي في نطاقك الجغرافي لتوفيره أو إيجاد بدائله السريرية.
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              filterType === 'all'
                ? 'bg-slate-800 text-white border border-slate-700'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            جميع التنبيهات ({alerts.length})
          </button>
          <button
            onClick={() => setFilterType('near_expiry')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'near_expiry'
                ? 'bg-amber-950/80 text-amber-300 border border-amber-500/40'
                : 'text-slate-400 hover:text-amber-300'
            }`}
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>وشيك الانتهاء</span>
          </button>
          <button
            onClick={() => setFilterType('stagnant_stock')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'stagnant_stock'
                ? 'bg-indigo-950/80 text-indigo-300 border border-indigo-500/40'
                : 'text-slate-400 hover:text-indigo-300'
            }`}
          >
            <TrendingDown className="w-3.5 h-3.5 text-indigo-400" />
            <span>رواكد ومخزون بطيء</span>
          </button>
          <button
            onClick={() => setFilterType('market_shortage')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              filterType === 'market_shortage'
                ? 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                : 'text-slate-400 hover:text-rose-300'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            <span>شح السوق الحرج</span>
          </button>
        </div>

        {/* Multi-Channel Push Toggle */}
        <div className="flex items-center gap-2 text-xs bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          <span className="text-[11px] text-slate-400 px-2">قناة الإرسال:</span>
          <button
            onClick={() => setActiveChannel('telegram')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              activeChannel === 'telegram' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            بوت Telegram
          </button>
          <button
            onClick={() => setActiveChannel('whatsapp')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              activeChannel === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-400'
            }`}
          >
            WhatsApp
          </button>
          <button
            onClick={() => setActiveChannel('push')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition ${
              activeChannel === 'push' ? 'bg-amber-600 text-white' : 'text-slate-400'
            }`}
          >
            إشعارات الويب
          </button>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-12 text-center text-slate-400 bg-slate-900/40 rounded-2xl border border-dashed border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">مخزونك في حالة ممتازة ومستقرة</p>
            <p className="text-xs text-slate-500 mt-1">لا توجد تنبيهات عاجلة للصلاحية أو الركود حالياً.</p>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            return (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-slate-700 transition space-y-3 relative overflow-hidden"
              >
                {/* Free plan watermark blur lock if non-pro */}
                {!isPro && (
                  <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-20 flex items-center justify-between p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                        <Lock className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white text-sm">تنبيه ذكي مقفل (ميزة باقة PRO)</h4>
                        <p className="text-xs text-slate-400">
                          تم رصد إشارة حرجة تتعلق بصنف «{alert.drugName}» — قم بالترقية لفتح التوصيات والإشعارات الفورية
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setShowUpgradeModal(true)}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-black transition cursor-pointer shrink-0"
                    >
                      فتح التنبيه الآن
                    </button>
                  </div>
                )}

                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        alert.type === 'near_expiry'
                          ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30'
                          : alert.type === 'stagnant_stock'
                          ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {alert.type === 'near_expiry' && <Clock className="w-4 h-4" />}
                      {alert.type === 'stagnant_stock' && <TrendingDown className="w-4 h-4" />}
                      {alert.type === 'market_shortage' && <ShieldAlert className="w-4 h-4" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-white text-sm uppercase">{alert.drugName}</h3>
                        {alert.daysUntilExpiry && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                            متبقي {alert.daysUntilExpiry} يوماً
                          </span>
                        )}
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            alert.severity === 'critical'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {alert.severity === 'critical' ? 'حرج' : 'متوسط'}
                        </span>
                      </div>

                      <p className="text-xs text-slate-400 mt-1">
                        الكمية المرصودة: <strong className="text-slate-200">{alert.quantity} {alert.unit}</strong> • المنشأة: <span className="text-slate-300">{alert.entityName}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Recommendation Box */}
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>الإجراء الموصى به:</strong> {alert.recommendedAction}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {onOpenSocialBroadcast && (
                      <button
                        onClick={() => onOpenSocialBroadcast(alert)}
                        className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 border border-sky-500/30 text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                        title="بث إعلان فوري على مجموعات تليجرام وفيسبوك"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>بث تليجرام وسوشيال</span>
                      </button>
                    )}

                    {onOpenCreateOfferWithDrug && (
                      <button
                        onClick={() => onOpenCreateOfferWithDrug(alert.drugName, alert.quantity, alert.unit)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold flex items-center gap-1 transition cursor-pointer"
                      >
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                        <span>طرح عرض فوري</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Upgrade to Pro Modal */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-500/40 rounded-3xl max-w-lg w-full p-6 space-y-5 text-white shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">ترقية الصيدلية لباقة PharmaYemen PRO ⚡</h3>
                  <p className="text-xs text-slate-400">حماية المخزون، البث الآلي، ورادار الصلاحية</p>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-2">
                <h4 className="font-bold text-amber-300 text-sm flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  ماذا تقدم لك باقة المحترفين؟
                </h4>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>تنبيهات استباقية بالصلاحية قبل 3-6 أشهر لمنع تلف الأدوية.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>ربط آلي وبث فوري لإعلانات الأدوية على مجموعات التيليجرام وفيسبوك.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>كشف أسعار السوق وفروقات الصرف في مختلف المحافظات.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>شارة التوثيق والاعتماد المهني الذهبي (Verified Pro Entity).</span>
                  </li>
                </ul>
              </div>

              {/* Activation action */}
              <div className="space-y-2 pt-2">
                <button
                  onClick={() => {
                    onUpgradePlan('pro');
                    setShowUpgradeModal(false);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 text-slate-950 font-black text-xs shadow-lg hover:shadow-amber-500/30 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 fill-slate-950" />
                  <span>تفعيل التجربة المجانية الكاملة (14 يوماً) الآن</span>
                </button>
                <p className="text-[11px] text-center text-slate-400">
                  لا يتطلب بطاقة بنكية • إمكانية التفعيل المباشر للصيادلة في اليمن
                </p>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
