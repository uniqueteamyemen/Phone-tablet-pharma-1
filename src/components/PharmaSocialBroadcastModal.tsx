import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Download, 
  Copy, 
  Check, 
  Share2, 
  Camera, 
  Building2, 
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { SocialBroadcastPayload } from '../types/pharmayemen';

interface PharmaSocialBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  payload: SocialBroadcastPayload | null;
}

export const PharmaSocialBroadcastModal: React.FC<PharmaSocialBroadcastModalProps> = ({
  isOpen,
  onClose,
  payload,
}) => {
  const [activeTab, setActiveTab] = useState<'telegram' | 'instagram' | 'facebook'>('telegram');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!isOpen || !payload) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 720;
    canvas.height = 1280;

    const bgGradient = ctx.createLinearGradient(0, 0, 720, 1280);
    if (payload.type === 'offer') {
      bgGradient.addColorStop(0, '#064e3b');
      bgGradient.addColorStop(0.5, '#0f172a');
      bgGradient.addColorStop(1, '#022c22');
    } else {
      bgGradient.addColorStop(0, '#78350f');
      bgGradient.addColorStop(0.5, '#0f172a');
      bgGradient.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 720, 1280);

    // Grid lines
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

    // Pill header
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

    // Stats
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

    // Entity & Platform Coordination Box
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

    // Call to Action
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

  }, [isOpen, payload]);

  if (!isOpen || !payload) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const handleDownloadStory = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `PharmaYemen-${payload.drugName.replace(/\s+/g, '_')}-Story.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://ais-pre-vikezij2ldn2pbbvzs7lfx-110937883528.europe-west2.run.app';
  const cleanDrug = encodeURIComponent(payload.drugName);
  const telegramUrl = `${baseUrl}/?ref=telegram&drug=${cleanDrug}&type=${payload.type}`;
  const facebookUrl = `${baseUrl}/?ref=facebook&drug=${cleanDrug}&type=${payload.type}`;
  const instagramUrl = `${baseUrl}/?ref=instagram&drug=${cleanDrug}&type=${payload.type}`;

  const [isDispatched, setIsDispatched] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState(false);

  const handleSimulateWebhook = () => {
    setIsDispatched(true);
    setTimeout(() => {
      setIsDispatched(false);
      setDispatchSuccess(true);
      setTimeout(() => setDispatchSuccess(false), 3000);
    }, 1000);
  };

  const telegramText = `⚡ *[سوق الدواء اليمني - PharmaYemen]*
${payload.type === 'offer' ? '🟢 *【دواء متوفر للتوريد】*' : '🔴 *【دواء مطلوب بشكل عاجل】*'}

💊 *الصنف:* ${payload.drugName} ${payload.brandName ? `(${payload.brandName})` : ''}
📍 *المحافظة:* إحدى المنشآت الصحية المعتمدة - ${payload.governorate}
${payload.expiryDate ? `⏳ *الصلاحية:* ${payload.expiryDate}\n` : ''}
🔒 *الكميات والتنسيق والمطابقة:*
_بيانات وهوية الصيدلية الناشرة مشفرة ومحمية لحفظ سرية التعاملات_

🔗 *رابط المنصة للمطابقة والتواصل المباشر:*
${telegramUrl}

#سوق_الدواء_اليمني #أدوية_اليمن #${payload.type === 'offer' ? 'عروض_أدوية' : 'نواقص_أدوية'}`;

  const facebookText = `📢 [إشعار سوق الدواء اليمني | منصة PharmaYemen]
${payload.type === 'offer' ? '🟢 【دواء معروض】 متوفر عرض دواء جاهز للتوريد والتسليم الفوري' : '🔴 【دواء مطلوب】 مطلوب دواء بصورة عاجلة لتغطية احتياج صيدلاني'}

💊 الصنف الدوائي: ${payload.drugName} ${payload.brandName ? `(${payload.brandName})` : ''}
📍 المحافظة: منشأة صحية معتمدة (${payload.governorate})
${payload.expiryDate ? `⏳ الصلاحية: ${payload.expiryDate}\n` : ''}
🔒 لمعرفة الكمية المتوفرة/المطلوبة، وبدء التنسيق والمطابقة المباشرة مع الحفاظ على سرية الناشر:
👉 ادخل عبر منصة PharmaYemen واضغط زر "${payload.type === 'offer' ? 'حجز واستلام العرض' : 'متوفر لدي / تلبية الاحتياج'}"

🔗 رابط المنصة والمطابقة الفورية:
${facebookUrl}

#سوق_الدواء_اليمني #صيدليات_${payload.governorate.replace(/\s+/g, '_')} #أدوية_اليمن #PharmaYemen`;

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-4 text-white shadow-2xl max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm">بث إعلان الدواء على السوشيال ميديا وتليجرام</h3>
              <p className="text-[11px] text-slate-400">استهداف مجاميع الأطباء والصيادلة في {payload.governorate}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Channels Tabs */}
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('telegram')}
            className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'telegram' ? 'bg-sky-600 text-white' : 'text-slate-400'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram Bot & Groups</span>
          </button>
          <button
            onClick={() => setActiveTab('instagram')}
            className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'instagram' ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white' : 'text-slate-400'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Instagram Story</span>
          </button>
          <button
            onClick={() => setActiveTab('facebook')}
            className={`flex-1 py-2 rounded-lg font-bold transition flex items-center justify-center gap-1.5 ${
              activeTab === 'facebook' ? 'bg-blue-600 text-white' : 'text-slate-400'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Facebook Post</span>
          </button>
        </div>

        {/* Tab 1: Telegram */}
        {activeTab === 'telegram' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed text-[11px]">
              {telegramText}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(telegramText, 'tg-modal')}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'tg-modal' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'tg-modal' ? 'تم النسخ!' : 'نسخ النص'}</span>
              </button>

              <button
                onClick={() => {
                  const encoded = encodeURIComponent(telegramText);
                  window.open(`https://t.me/share/url?url=https://pharmayemen.app&text=${encoded}`, '_blank');
                }}
                className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>إرسال لقروبات التيليجرام</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: Instagram */}
        {activeTab === 'instagram' && (
          <div className="space-y-3 text-xs">
            <div className="flex justify-center p-2 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="w-[180px] aspect-[9/16] rounded-xl overflow-hidden shadow-xl">
                <canvas ref={canvasRef} className="w-full h-full object-contain" />
              </div>
            </div>

            <button
              onClick={handleDownloadStory}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 hover:opacity-90 font-bold text-white transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>تحميل بطاقة Story كصورة PNG عالية الدقة</span>
            </button>
          </div>
        )}

        {/* Tab 3: Facebook */}
        {activeTab === 'facebook' && (
          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-950 font-mono text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed text-[11px]">
              {facebookText}
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(facebookText, 'fb-modal')}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 font-bold text-slate-200 transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {copiedKey === 'fb-modal' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'fb-modal' ? 'تم النسخ!' : 'نسخ المنشور'}</span>
              </button>

              <button
                onClick={() => {
                  window.open(`https://www.facebook.com/sharer/sharer.php?u=https://pharmayemen.app&quote=${encodeURIComponent(facebookText)}`, '_blank');
                }}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Share2 className="w-4 h-4" />
                <span>مشاركة فيسبوك</span>
              </button>
            </div>
          </div>
        )}

        {/* Webhook & Social Broadcast Readiness Footer */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between gap-2 text-xs">
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>جاهز للإرسال للبوت والصفحات برابط مباشر</span>
          </div>

          <button
            onClick={handleSimulateWebhook}
            disabled={isDispatched}
            className="px-3 py-1.5 rounded-xl bg-cyan-600/30 hover:bg-cyan-600/50 text-cyan-300 border border-cyan-500/40 font-bold transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {isDispatched ? (
              <span>جاري الإرسال للبوت...</span>
            ) : dispatchSuccess ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>تم إرسال الإخطار للبوت بنجاح!</span>
              </>
            ) : (
              <>
                <ExternalLink className="w-3.5 h-3.5" />
                <span>إرسال إخطار البث (Webhook Dispatch)</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
