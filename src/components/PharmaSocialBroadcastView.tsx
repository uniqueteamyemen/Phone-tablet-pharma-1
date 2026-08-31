import React, { useState, useRef, useEffect } from 'react';
import { 
  Share2, 
  Send, 
  Download, 
  Copy, 
  Check, 
  Sparkles, 
  Building2, 
  FileText, 
  Smartphone, 
  Camera, 
  Layers, 
  MessageCircle, 
  ExternalLink,
  Crown,
  CheckCircle2
} from 'lucide-react';
import { PharmaEntity, PharmaOffer, PharmaRequest, SocialBroadcastPayload } from '../types/pharmayemen';

interface PharmaSocialBroadcastViewProps {
  entity: PharmaEntity;
  offers: PharmaOffer[];
  requests: PharmaRequest[];
  initialPayload?: SocialBroadcastPayload | null;
}

export const PharmaSocialBroadcastView: React.FC<PharmaSocialBroadcastViewProps> = ({
  entity,
  offers,
  requests,
  initialPayload,
}) => {
  const [broadcastMode, setBroadcastMode] = useState<'active' | 'fulfilled'>('active');
  const [selectedType, setSelectedType] = useState<'offer' | 'request'>('offer');
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offers[0]?.id || '');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requests[0]?.id || '');
  const [targetGovernorate, setTargetGovernorate] = useState<string>(entity.governorate || 'صنعاء');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'instagram' | 'facebook' | 'telegram'>('telegram');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Determine current active item data
  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];
  const currentRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  const payload: SocialBroadcastPayload = initialPayload || (
    selectedType === 'offer' && currentOffer
      ? {
          type: 'offer',
          drugName: currentOffer.genericName || currentOffer.freeTextName || 'صنف دوائي',
          genericName: currentOffer.genericName,
          brandName: currentOffer.brandName,
          quantity: currentOffer.quantity,
          unit: currentOffer.unit,
          price: currentOffer.price,
          currency: currentOffer.currency,
          entityName: currentOffer.entityName,
          governorate: targetGovernorate,
          phone: entity.phone || '+967 777 000 000',
          expiryDate: currentOffer.expiryDate,
          notes: currentOffer.notes,
        }
      : {
          type: 'request',
          drugName: currentRequest?.genericName || currentRequest?.freeTextName || 'دواء مطلوب',
          genericName: currentRequest?.genericName,
          quantity: currentRequest?.quantity || 10,
          unit: currentRequest?.unit || 'باكت',
          entityName: currentRequest?.entityName || entity.name,
          governorate: targetGovernorate,
          phone: entity.phone || '+967 777 000 000',
          urgency: currentRequest?.urgency || 'عاجل',
          notes: currentRequest?.notes,
        }
  );

  // Generate Instagram Canvas Graphic
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions (9:16 Instagram Story format: 720x1280)
    canvas.width = 720;
    canvas.height = 1280;

    // Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 720, 1280);
    if (payload.type === 'offer') {
      bgGradient.addColorStop(0, '#064e3b'); // Dark Emerald
      bgGradient.addColorStop(0.5, '#0f172a'); // Dark Slate
      bgGradient.addColorStop(1, '#022c22'); // Deep Teal
    } else {
      bgGradient.addColorStop(0, '#78350f'); // Dark Amber
      bgGradient.addColorStop(0.5, '#0f172a');
      bgGradient.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 720, 1280);

    // Subtle decorative grid / circles
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 720; i += 60) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 1280);
      ctx.stroke();
    }
    for (let j = 0; j < 1280; j += 60) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(720, j);
      ctx.stroke();
    }

    // Top Brand Badge
    ctx.fillStyle = payload.type === 'offer' ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(60, 80, 260, 60, 16);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('PharmaYemen سوق الدواء', 300, 118);

    // Pill header: "إعلان عرض فائض" / "إعلان طلب احتياج"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
    ctx.beginPath();
    ctx.roundRect(60, 180, 600, 50, 25);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    const headerTitle = payload.type === 'offer' ? '⚡ إشعار توفر دواء (عرض فائض فوري)' : '🚨 إشعار طلب دواء عاجل (شح ونقص)';
    ctx.fillText(headerTitle, 360, 213);

    // Main Drug Name Box
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    ctx.strokeStyle = payload.type === 'offer' ? 'rgba(16, 185, 129, 0.5)' : 'rgba(245, 158, 11, 0.5)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(60, 260, 600, 360, 24);
    ctx.fill();
    ctx.stroke();

    // Generic Name
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.textAlign = 'center';
    const drugNameFormatted = payload.drugName.length > 28 ? payload.drugName.slice(0, 28) + '...' : payload.drugName;
    ctx.fillText(drugNameFormatted, 360, 340);

    if (payload.brandName) {
      ctx.fillStyle = payload.type === 'offer' ? '#34d399' : '#fbbf24';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText(`الاسم التجاري: ${payload.brandName}`, 360, 395);
    }

    // Divider
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 430);
    ctx.lineTo(620, 430);
    ctx.stroke();

    // Key Stats inside box
    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('الكمية المتاحة/المطلوبة:', 600, 480);
    ctx.fillText('المحافظة المستهدفة:', 600, 530);
    if (payload.expiryDate) {
      ctx.fillText('تاريخ الصلاحية:', 600, 580);
    }

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${payload.quantity} ${payload.unit}`, 100, 480);
    ctx.fillText(payload.governorate, 100, 530);
    if (payload.expiryDate) {
      ctx.fillText(payload.expiryDate, 100, 580);
    }

    // Entity & Coordination Guarantee Box (Replaces private entity/phone with platform guarantee)
    ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.beginPath();
    ctx.roundRect(60, 650, 600, 200, 20);
    ctx.fill();

    ctx.fillStyle = payload.type === 'offer' ? '#34d399' : '#fbbf24';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(payload.type === 'offer' ? '🟢 حالة الصنف: معروض للتوريد والتسليم' : '🔴 حالة الصنف: مطلوب لاحتياج علاجي عاجل', 360, 705);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🔒 التفاصيل، الكمية، والتنسيق المباشر عبر منصة PharmaYemen', 360, 755);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '20px sans-serif';
    ctx.fillText('ادخل المنصة واضغط "تلبية الاحتياج" أو "حجز العرض" للربط الفوري', 360, 805);

    // Call to Action Box at Bottom
    ctx.fillStyle = payload.type === 'offer' ? '#059669' : '#d97706';
    ctx.beginPath();
    ctx.roundRect(60, 880, 600, 180, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('للمطابقة الفورية وحجز الصنف:', 360, 945);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 24px sans-serif';
    ctx.fillText('🌐 https://pharmayemen.app', 360, 995);
    ctx.font = '20px sans-serif';
    ctx.fillText('منصة سوق الدواء الوطني الموحد في اليمن', 360, 1030);

    // Footer Copyright
    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('صادر عبر منصة PharmaYemen الرسمية • شبكة الأطباء والصيادلة في اليمن', 360, 1220);

  }, [payload]);

  // Copy helper
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Download Story Image
  const handleDownloadStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `PharmaYemen-${payload.drugName.replace(/\s+/g, '_')}-Story.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // Pre-formatted Facebook Text (Anonymous Drug Ad driving traffic to platform)
  const facebookPostText = broadcastMode === 'active' 
    ? `📢 [إشعار سوق الدواء اليمني | منصة PharmaYemen]
${payload.type === 'offer' ? '🟢 【دواء معروض】 متوفر عرض دواء جاهز للتوريد والتسليم الفوري' : '🔴 【دواء مطلوب】 مطلوب دواء بصورة عاجلة لتغطية احتياج صيدلاني'}

💊 الصنف الدوائي: ${payload.drugName} ${payload.brandName ? `(${payload.brandName})` : ''}
📍 النطاق الجغرافي: ${payload.governorate}
${payload.expiryDate ? `⏳ الصلاحية: ${payload.expiryDate}\n` : ''}
🔒 لمعرفة الكمية المتوفرة/المطلوبة، وبدء التنسيق والمطابقة المباشرة:
👉 ادخل عبر منصة PharmaYemen واضغط زر "${payload.type === 'offer' ? 'حجز واستلام العرض' : 'متوفر لدي / تلبية الاحتياج'}"

🔗 رابط المنصة والمطابقة الفورية:
https://pharmayemen.app

---
#سوق_الدواء_اليمني #صيدليات_${payload.governorate.replace(/\s+/g, '_')} #أدوية_اليمن #PharmaYemen #نقابة_الصيادلة #أطباء_اليمن`
    : `🎉 [إشعار نجاح | تم تلبية الاحتياج بنجاح عبر منصة PharmaYemen]
✅ نعلن للأخوة الأطباء والصيادلة في محافظة ${payload.governorate} أنه تم تلبية ${payload.type === 'offer' ? 'عرض' : 'طلب'} الدواء التالي بنجاح والربط بين الطرفين:

💊 الصنف: ${payload.drugName} ${payload.brandName ? `(${payload.brandName})` : ''}
📍 المحافظة: ${payload.governorate}

📢 هل لديكم أدوية راكدة ترغبون بتدويرها أو أدوية مقطوعة تبحثون عنها؟
سجلوا عروضكم وطلباتكم الآن لتتم المطابقة الذكية فوراً عبر المنصة:
🔗 https://pharmayemen.app

#PharmaYemen #سوق_الدواء_اليمني #صيادلة_اليمن`;

  // Pre-formatted Telegram Text (Anonymous Drug Ad driving traffic to platform)
  const telegramPostText = broadcastMode === 'active'
    ? `⚡ *[سوق الدواء اليمني - PharmaYemen]*
${payload.type === 'offer' ? '🟢 *【دواء معروض للتوريد】*' : '🔴 *【دواء مطلوب بشكل عاجل】*'}

💊 *الصنف:* ${payload.drugName} ${payload.brandName ? `(${payload.brandName})` : ''}
📍 *المحافظة:* ${payload.governorate}
${payload.expiryDate ? `⏳ *الصلاحية:* ${payload.expiryDate}\n` : ''}
🔒 *الكميات والتنسيق المباشر:*
_للحصول على الصنف أو تلبية الطلب، ادخل المنصة واضغط زر التنسيق ليتم ربطك مباشرة:_

🔗 *رابط المنصة:* https://pharmayemen.app`
    : `🎉 *[تمت التلبية بنجاح - PharmaYemen]*
✅ *تم بنجاح توفير ومطابقة:*
💊 *${payload.drugName}* ${payload.brandName ? `(${payload.brandName})` : ''}
📍 *محافظة:* ${payload.governorate}

_هل تبحث عن أدوية ناقصة أو لديك فائض تريد تدويره؟_
👉 *سجل عرضك أو طلبك الآن مجاناً عبر المنصة:*
🔗 https://pharmayemen.app`;

  // Direct share to Telegram URL
  const handleOpenTelegramShare = () => {
    const encoded = encodeURIComponent(telegramPostText);
    window.open(`https://t.me/share/url?url=https://pharmayemen.app&text=${encoded}`, '_blank');
  };

  // Direct share to Facebook
  const handleOpenFacebookShare = () => {
    const encoded = encodeURIComponent('https://pharmayemen.app');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}&quote=${encodeURIComponent(facebookPostText)}`, '_blank');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/50 text-slate-100">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-sky-950/70 to-indigo-950/80 border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-500/30 text-sky-400 flex items-center justify-center shadow-inner">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                مركز البث التسويقي ومجاميع السوشيال ميديا
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Instagram • Facebook • Telegram
              </span>
            </div>
            <p className="text-xs text-slate-400">
              النشر الآلي الفوري لإعلانات الأدوية على مجاميع وقنوات الأطباء والصيادلة في اليمن
            </p>
          </div>
        </div>

        {/* Mode Selector & Action Type Selector */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active vs Fulfilled Status Toggle */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setBroadcastMode('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                broadcastMode === 'active'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>إعلان نشط</span>
            </button>
            <button
              onClick={() => setBroadcastMode('fulfilled')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                broadcastMode === 'fulfilled'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>🎉 تمت التلبية</span>
            </button>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setSelectedType('offer')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedType === 'offer'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>عرض فائض</span>
            </button>
            <button
              onClick={() => setSelectedType('request')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                selectedType === 'request'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>طلب احتياج</span>
            </button>
          </div>
        </div>
      </div>

      {/* Item & Governorate Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300 block">
            {selectedType === 'offer' ? 'اختر العرض المراد نشره:' : 'اختر الطلب المراد نشره:'}
          </label>
          {selectedType === 'offer' ? (
            <select
              value={selectedOfferId}
              onChange={(e) => setSelectedOfferId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {offers.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.genericName || o.freeTextName} ({o.quantity} {o.unit}) - {o.entityName}
                </option>
              ))}
            </select>
          ) : (
            <select
              value={selectedRequestId}
              onChange={(e) => setSelectedRequestId(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
            >
              {requests.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.genericName || r.freeTextName} ({r.quantity} {r.unit}) - {r.entityName}
                </option>
              ))}
            </select>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="font-semibold text-slate-300 block">
            المحافظة المستهدفة بالبث والإعلان:
          </label>
          <select
            value={targetGovernorate}
            onChange={(e) => setTargetGovernorate(e.target.value)}
            className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white focus:ring-2 focus:ring-sky-500 focus:outline-none"
          >
            <option value="صنعاء">صنعاء وأمانة العاصمة</option>
            <option value="عدن">عدن والمحافظات المجاورة</option>
            <option value="تعز">تعز والتربة والمخا</option>
            <option value="حضرموت">حضرموت (المكلا وسيئون)</option>
            <option value="إب">إب ويريم والقاعدة</option>
            <option value="الحديدة">الحديدة وباجل</option>
            <option value="مأرب">مأرب والجوف</option>
            <option value="ذمار">ذمار ورداع</option>
            <option value="كافة المحافظات">كافة محافظات الجمهورية اليمنية</option>
          </select>
        </div>
      </div>

      {/* Main Tabs: Telegram vs Instagram vs Facebook */}
      <div className="space-y-4">
        
        <div className="flex bg-slate-900 p-1 rounded-2xl border border-slate-800 max-w-md">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'telegram'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>بوت ومجاميع Telegram</span>
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-4 h-4" />
            <span>بطاقة Instagram Story</span>
          </button>
          <button
            onClick={() => setActiveTab('facebook')}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'facebook'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-4 h-4" />
            <span>منشور Facebook</span>
          </button>
        </div>

        {/* 1. TELEGRAM BROADCAST SECTION */}
        {activeTab === 'telegram' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm text-sky-400 flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  قالب النشر الفوري لقروبات الأطباء والصيادلة (Telegram)
                </h3>
                <button
                  onClick={() => handleCopy(telegramPostText, 'telegram')}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
                >
                  {copiedKey === 'telegram' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'telegram' ? 'تم النسخ!' : 'نسخ النص'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed">
                {telegramPostText}
              </div>

              <div className="flex flex-wrap gap-3 pt-2">
                <button
                  onClick={handleOpenTelegramShare}
                  className="flex-1 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>فتح تطبيق Telegram للإرسال المباشر للمجاميع</span>
                </button>
              </div>
            </div>

            {/* Target Groups & Channels Guide */}
            <div className="space-y-3 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <h4 className="font-bold text-slate-200 flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-sky-400" />
                المجموعات الطبية والصيدلانية المرتبطة:
              </h4>
              <ul className="space-y-2 text-slate-400">
                <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span>ملتقى صيادلة {targetGovernorate}</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">متصل بالبوت</span>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span>شبكة التبادل الدوائي الطارئ</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded">نشط</span>
                </li>
                <li className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between">
                  <span>مستوردي وموزعي الأدوية في اليمن</span>
                  <span className="text-[10px] font-bold text-sky-400 bg-sky-950 px-2 py-0.5 rounded">تلقائي</span>
                </li>
              </ul>
              <p className="text-[11px] text-slate-500 pt-1 leading-relaxed">
                💡 يتم إرسال إشارات العرض والطلب المشفرة عبر Webhook تلقائياً لسرعة استجابة الصيادلة في نفس المدينة.
              </p>
            </div>
          </div>
        )}

        {/* 2. INSTAGRAM STORY BANNER GENERATOR */}
        {activeTab === 'instagram' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="space-y-4 p-5 rounded-2xl bg-slate-900 border border-slate-800 text-xs">
              <h3 className="font-bold text-sm text-pink-400 flex items-center gap-2">
                <Camera className="w-4 h-4" />
                بطاقة Instagram Story / WhatsApp Status المصممة تلقائياً
              </h3>
              <p className="text-slate-400 leading-relaxed">
                يتم توليد بطاقة مرئية احترافية عالية الدقة مناسبة لمقاس ستوري إنستغرام وحالات واتساب لجذب انتباه الأطباء والموزعين فوراً.
              </p>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleDownloadStory}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>تحميل بطاقة Story كصورة عالية الدقة (PNG)</span>
                </button>
                <p className="text-[11px] text-center text-slate-500">
                  جاهزة للرفع مباشرة على Instagram Story أو WhatsApp Status بنقرة واحدة
                </p>
              </div>
            </div>

            {/* Live Canvas Preview */}
            <div className="flex flex-col items-center justify-center p-4 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-full max-w-[270px] aspect-[9/16] rounded-2xl overflow-hidden shadow-2xl border border-slate-800">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] text-slate-500 mt-2">معاينة حية للملصق الإعلاني</span>
            </div>
          </div>
        )}

        {/* 3. FACEBOOK POST SECTION */}
        {activeTab === 'facebook' && (
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm text-blue-400 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                منشور Facebook للمجموعات والصفحات الطبية
              </h3>
              <button
                onClick={() => handleCopy(facebookPostText, 'facebook')}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1 transition"
              >
                {copiedKey === 'facebook' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'facebook' ? 'تم النسخ!' : 'نسخ المنشور'}</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed">
              {facebookPostText}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleOpenFacebookShare}
                className="flex-1 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة في مجموعات فيسبوك الصيدلانية</span>
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
};
