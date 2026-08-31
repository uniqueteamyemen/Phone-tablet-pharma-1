import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  CheckCircle2,
  ShieldCheck,
  AlertTriangle,
  Filter,
  ListOrdered,
  Calendar,
  Eye,
  Edit3,
  RefreshCw,
  Clock,
  MapPin,
  Flame,
  CheckCheck
} from 'lucide-react';
import { 
  PharmaEntity, 
  PharmaOffer, 
  PharmaRequest, 
  PharmaUserRole, 
  SocialBroadcastPayload 
} from '../types/pharmayemen';

interface PharmaSocialBroadcastViewProps {
  entity: PharmaEntity;
  offers: PharmaOffer[];
  requests: PharmaRequest[];
  userRole?: PharmaUserRole;
  initialPayload?: SocialBroadcastPayload | null;
}

export const PharmaSocialBroadcastView: React.FC<PharmaSocialBroadcastViewProps> = ({
  entity,
  offers,
  requests,
  userRole = 'visitor',
  initialPayload,
}) => {
  // State for Admin Review & Moderation
  const [broadcastMode, setBroadcastMode] = useState<'single' | 'batch'>('single');
  const [selectedType, setSelectedType] = useState<'request' | 'offer'>('request');
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');
  
  // Single active item selection
  const [selectedOfferId, setSelectedOfferId] = useState<string>(offers[0]?.id || '');
  const [selectedRequestId, setSelectedRequestId] = useState<string>(requests[0]?.id || '');
  
  // Batch Multi-Select for Aggregated Bulletins
  const [selectedBatchIds, setSelectedBatchIds] = useState<string[]>(() => {
    return requests.slice(0, 3).map((r) => r.id);
  });

  // Target Channel Format Tab
  const [activeChannel, setActiveChannel] = useState<'telegram' | 'facebook' | 'instagram' | 'batch'>('telegram');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Editable fields for live moderation
  const [customTitle, setCustomTitle] = useState<string>('');
  const [customNotes, setCustomNotes] = useState<string>('');
  const [isEditingNotes, setIsEditingNotes] = useState<boolean>(false);

  // Broadcast History Tracking (Persisted in localStorage)
  const [broadcastedIds, setBroadcastedIds] = useState<Record<string, string>>(() => {
    try {
      const stored = localStorage.getItem('pharmayemen_broadcasted_history');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Filter lists based on governorate & urgency
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const matchesGov = selectedGovernorate === 'all' || r.governorate === selectedGovernorate;
      const matchesUrg = selectedUrgency === 'all' || r.urgency === selectedUrgency;
      return matchesGov && matchesUrg;
    });
  }, [requests, selectedGovernorate, selectedUrgency]);

  const filteredOffers = useMemo(() => {
    return offers.filter((o) => {
      return selectedGovernorate === 'all' || (entity.governorate === selectedGovernorate);
    });
  }, [offers, selectedGovernorate, entity.governorate]);

  // Current active item
  const currentOffer = offers.find((o) => o.id === selectedOfferId) || offers[0];
  const currentRequest = requests.find((r) => r.id === selectedRequestId) || requests[0];

  // Derive payload
  const activePayload: SocialBroadcastPayload = useMemo(() => {
    if (initialPayload && !selectedOfferId && !selectedRequestId) {
      return initialPayload;
    }
    if (selectedType === 'offer' && currentOffer) {
      return {
        id: currentOffer.id,
        type: 'offer',
        drugName: currentOffer.genericName || currentOffer.freeTextName || 'صنف دوائي',
        genericName: currentOffer.genericName,
        brandName: currentOffer.brandName,
        strength: currentOffer.strength,
        quantity: currentOffer.quantity,
        unit: currentOffer.unit,
        price: currentOffer.price,
        currency: currentOffer.currency,
        entityName: currentOffer.entityName,
        governorate: entity.governorate || 'صنعاء',
        phone: entity.phone || '+967 777 000 000',
        expiryDate: currentOffer.expiryDate,
        notes: customNotes || currentOffer.notes,
        createdAt: currentOffer.createdAt,
      };
    }
    return {
      id: currentRequest?.id || 'req-default',
      type: 'request',
      drugName: currentRequest?.genericName || currentRequest?.freeTextName || 'دواء مطلوب',
      genericName: currentRequest?.genericName,
      strength: currentRequest?.strength,
      quantity: currentRequest?.quantity || 1,
      unit: currentRequest?.unit || 'باكت',
      entityName: currentRequest?.entityName || entity.name,
      governorate: currentRequest?.governorate || entity.governorate || 'صنعاء',
      phone: entity.phone || '+967 777 000 000',
      urgency: currentRequest?.urgency || 'high',
      notes: customNotes || currentRequest?.notes,
      createdAt: currentRequest?.createdAt,
    };
  }, [selectedType, currentOffer, currentRequest, entity, initialPayload, customNotes, selectedOfferId, selectedRequestId]);

  // Sync custom notes when selected item changes
  useEffect(() => {
    if (selectedType === 'offer' && currentOffer) {
      setCustomNotes(currentOffer.notes || '');
    } else if (selectedType === 'request' && currentRequest) {
      setCustomNotes(currentRequest.notes || '');
    }
  }, [selectedOfferId, selectedRequestId, selectedType]);

  // Moderation Analysis for Ethics and Decorum (فحص ومطابقة الأعراف والتقاليد)
  const moderationCheck = useMemo(() => {
    const rawText = `${activePayload.drugName} ${activePayload.brandName || ''} ${activePayload.notes || ''}`.toLowerCase();
    
    // Check for sensitive or slang or inappropriate terms
    const inappropriateTerms = ['ممنوع', 'سوق سوداء', 'تهريب', 'منتهي', 'شمة', 'قات'];
    const foundWarnings = inappropriateTerms.filter((term) => rawText.includes(term));

    return {
      isSafe: foundWarnings.length === 0,
      warnings: foundWarnings,
      hasNotes: Boolean(activePayload.notes),
      isUrgent: activePayload.urgency === 'critical' || activePayload.urgency === 'high',
    };
  }, [activePayload]);

  // Mark item as published in social media
  const handleMarkAsBroadcasted = (id: string) => {
    const nowStr = new Date().toLocaleDateString('ar-YE', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const updated = { ...broadcastedIds, [id]: nowStr };
    setBroadcastedIds(updated);
    try {
      localStorage.setItem('pharmayemen_broadcasted_history', JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  // Toggle Batch Item
  const handleToggleBatchId = (id: string) => {
    setSelectedBatchIds((prev) => {
      if (prev.includes(id)) {
        return prev.filter((i) => i !== id);
      }
      if (prev.length >= 6) {
        return prev;
      }
      return [...prev, id];
    });
  };

  // Generate Instagram Story Canvas Graphic (9:16 format: 720x1280)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = 720;
    canvas.height = 1280;

    // Background Gradient
    const bgGradient = ctx.createLinearGradient(0, 0, 720, 1280);
    if (activePayload.type === 'offer') {
      bgGradient.addColorStop(0, '#064e3b'); // Dark Emerald
      bgGradient.addColorStop(0.4, '#0f172a'); // Dark Slate
      bgGradient.addColorStop(1, '#022c22'); // Deep Teal
    } else {
      bgGradient.addColorStop(0, '#78350f'); // Dark Amber
      bgGradient.addColorStop(0.4, '#0f172a');
      bgGradient.addColorStop(1, '#451a03');
    }
    ctx.fillStyle = bgGradient;
    ctx.fillRect(0, 0, 720, 1280);

    // Subtle background grid
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
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

    // Top Platform Brand Badge
    ctx.fillStyle = activePayload.type === 'offer' ? '#10b981' : '#f59e0b';
    ctx.beginPath();
    ctx.roundRect(60, 70, 280, 56, 16);
    ctx.fill();

    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('سوق الدواء اليمني | PharmaYemen', 315, 106);

    // Pill header: "إعلان عرض فائض" / "إعلان طلب احتياج"
    ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
    ctx.beginPath();
    ctx.roundRect(60, 160, 600, 52, 26);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.textAlign = 'center';
    const headerTitle = activePayload.type === 'offer' 
      ? '🟢 إشعار توفر صنف دوائي (عرض توريد متاح)' 
      : '🚨 إشعار طلب احتياج عاجل (نقص وشح دوائي)';
    ctx.fillText(headerTitle, 360, 194);

    // Main Drug Name Card Container
    ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
    ctx.strokeStyle = activePayload.type === 'offer' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(245, 158, 11, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(60, 240, 600, 380, 24);
    ctx.fill();
    ctx.stroke();

    // Generic Name Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 34px sans-serif';
    ctx.textAlign = 'center';
    const drugNameFormatted = activePayload.drugName.length > 26 ? activePayload.drugName.slice(0, 26) + '...' : activePayload.drugName;
    ctx.fillText(drugNameFormatted, 360, 315);

    if (activePayload.brandName || activePayload.strength) {
      ctx.fillStyle = activePayload.type === 'offer' ? '#34d399' : '#fbbf24';
      ctx.font = 'bold 24px sans-serif';
      const sub = [activePayload.brandName, activePayload.strength].filter(Boolean).join(' • ');
      ctx.fillText(sub, 360, 365);
    }

    // Divider Line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(100, 400);
    ctx.lineTo(620, 400);
    ctx.stroke();

    // Data Stats inside Card
    ctx.fillStyle = '#94a3b8';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('الكمية المطلوبة/المتاحة:', 600, 450);
    ctx.fillText('النطاق الجغرافي:', 600, 500);
    ctx.fillText(activePayload.type === 'offer' ? 'تاريخ الصلاحية:' : 'درجة الاستعجال:', 600, 550);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText(`${activePayload.quantity} ${activePayload.unit}`, 100, 450);
    ctx.fillText(activePayload.governorate || 'صنعاء', 100, 500);
    ctx.fillText(
      activePayload.type === 'offer' 
        ? (activePayload.expiryDate || 'ساري ومطابق') 
        : (activePayload.urgency === 'critical' ? '🔴 حرج جداً لإنقاذ حياة' : '🟡 عاجل للتغطية'), 
      100, 
      550
    );

    // Protected Platform Guarantee Box
    ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
    ctx.beginPath();
    ctx.roundRect(60, 650, 600, 210, 20);
    ctx.fill();

    ctx.fillStyle = activePayload.type === 'offer' ? '#34d399' : '#fbbf24';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(activePayload.type === 'offer' ? '🟢 متاح للتنسيق المباشر بين الصيدليات' : '🔴 مطلوب فوراً من أي صيدلية أو مستودع', 360, 705);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 20px sans-serif';
    ctx.fillText('🔒 التنسيق والربط المشفر عبر شبكة سوق الدواء اليمني', 360, 755);

    ctx.fillStyle = '#38bdf8';
    ctx.font = '18px sans-serif';
    ctx.fillText('افتح المنصة واضغط "تلبية الاحتياج" للتواصل مع الجهة الطالبة', 360, 800);

    // Call to Action Banner
    ctx.fillStyle = activePayload.type === 'offer' ? '#059669' : '#d97706';
    ctx.beginPath();
    ctx.roundRect(60, 890, 600, 180, 24);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 26px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('للمطابقة الفورية وتلبية الطلب:', 360, 955);

    ctx.fillStyle = '#f8fafc';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('🌐 https://pharmayemen.app', 360, 1005);
    ctx.font = '18px sans-serif';
    ctx.fillText('المنصة الوطنية لتنظيم إشارات الدواء في اليمن', 360, 1040);

    // Footer
    ctx.fillStyle = '#64748b';
    ctx.font = '16px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('نشر معتمد عبر إدارة PharmaYemen • مجتمع الأطباء والصيادلة', 360, 1220);

  }, [activePayload]);

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
    link.download = `PharmaYemen-${activePayload.drugName.replace(/\s+/g, '_')}-Story.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  // ---------------- FORMATTED TEXT GENERATORS ----------------

  // 1. Telegram (تخصصي ومهني للأطباء والصيادلة)
  const telegramPostText = useMemo(() => {
    const isOffer = activePayload.type === 'offer';
    const urgencyBadge = activePayload.urgency === 'critical' ? '🚨 [حرج جداً لإنقاذ حياة]' : '⚡ [احتياج عاجل]';
    
    return `⚡ *[سوق الدواء اليمني | PharmaYemen]*
${isOffer ? '🟢 *【إشعار توفر صنف دوائي - عرض فائض】*' : `🔴 *【إشعار طلب دواء - ${urgencyBadge}】*`}

💊 *الصنف الدوائي:* ${activePayload.drugName}
${activePayload.brandName ? `🏷️ *الاسم التجاري / الشركة:* ${activePayload.brandName}\n` : ''}${activePayload.strength ? `⚖️ *التركيز / الشكل:* ${activePayload.strength}\n` : ''}📦 *الكمية:* ${activePayload.quantity} ${activePayload.unit}
📍 *المحافظة:* ${activePayload.governorate}
${activePayload.expiryDate ? `⏳ *الصلاحية:* ${activePayload.expiryDate}\n` : ''}${activePayload.notes ? `📝 *ملاحظات التنسيق:* ${activePayload.notes}\n` : ''}
🔒 *آلية التواصل وتلبية الطلب:*
_حفاظاً على سرية وحماية المنشآت الصيدلانية، يتم التنسيق بالدخول عبر رابط المنصة والضغط على زر "${isOffer ? 'حجز واستلام العرض' : 'متوفر لدي / تلبية الاحتياج'}":_

🔗 *رابط المنصة المباشر:*
https://pharmayemen.app`;
  }, [activePayload]);

  // 2. Facebook (منشور عام للمجموعات والصفحات)
  const facebookPostText = useMemo(() => {
    const isOffer = activePayload.type === 'offer';
    return `📢 [إشعار دوائي موحد | منصة PharmaYemen - سوق الدواء اليمني]
${isOffer ? '🟢 متوفر عرض دوائي جاهز للتسليم والتوزيع الصيدلاني' : '🔴 مطلوب دواء بصورة عاجلة لتغطية احتياج مريض وصيدلية'}

💊 الصنف: ${activePayload.drugName} ${activePayload.brandName ? `(${activePayload.brandName})` : ''}
📍 المحافظة: ${activePayload.governorate}
📦 الكمية: ${activePayload.quantity} ${activePayload.unit}
${activePayload.expiryDate ? `⏳ تاريخ الصلاحية: ${activePayload.expiryDate}\n` : ''}${activePayload.notes ? `💬 ملاحظة: ${activePayload.notes}\n` : ''}
🔒 للإخوة الصيادلة والأطباء ومسؤولي التموين الدوائي الراغبين بالمطابقة وتلبية الطلب:
👉 ادخلوا عبر منصة PharmaYemen واضغطوا زر "${isOffer ? 'حجز العرض' : 'تلبية الاحتياج'}" للتواصل المباشر.

🔗 رابط المطابقة الفورية:
https://pharmayemen.app

#سوق_الدواء_اليمني #أدوية_اليمن #صيادلة_${activePayload.governorate.replace(/\s+/g, '_')} #PharmaYemen #صحة_اليمن`;
  }, [activePayload]);

  // 3. Instagram Caption (مقتضب وعام للستوري والبوست)
  const instagramCaptionText = useMemo(() => {
    return `🚨 إشعار ${activePayload.type === 'offer' ? 'توفر صنف' : 'طلب دواء عاجل'} في محافظة ${activePayload.governorate}
💊 ${activePayload.drugName} ${activePayload.brandName ? `(${activePayload.brandName})` : ''}
📦 ${activePayload.quantity} ${activePayload.unit}

🔗 التفاصيل والمطابقة المباشرة عبر الرابط في البايو أو الموقع:
https://pharmayemen.app

#أدوية_اليمن #صيدليات_اليمن #PharmaYemen #صنعاء #عدن #تعز`;
  }, [activePayload]);

  // 4. Batch Digest (النشرة المجمعة لعدة أصناف)
  const batchDigestText = useMemo(() => {
    const selectedItems = requests.filter((r) => selectedBatchIds.includes(r.id));
    if (selectedItems.length === 0) return 'الرجاء تحديد صنفين أو أكثر لتوليد النشرة المجمعة.';

    const govTitle = selectedGovernorate === 'all' ? 'محافظات الجمهورية' : selectedGovernorate;
    const itemsList = selectedItems.map((item, idx) => {
      const urgencyIcon = item.urgency === 'critical' ? '🔴' : '🟡';
      return `${idx + 1}. ${urgencyIcon} *${item.genericName || item.freeTextName}* (${item.quantity} ${item.unit}) — [${item.governorate}]`;
    }).join('\n');

    return `📋 *[نشرة الاحتياجات والأدوية المقطوعة المجمعة - ${govTitle}]*
تاريخ النشرة: ${new Date().toLocaleDateString('ar-YE')}

إلى الإخوة الصيادلة ومستوردي وموزعي الأدوية، مطلوب توفير الأصناف التالية بصورة عاجلة:

${itemsList}

🔒 *للتواصل وتلبية أي من الأصناف أعلاه:*
_ادخلوا عبر منصة PharmaYemen وابحثوا عن اسم الصنف للربط المباشر مع الصيدلية الطالبة:_
🔗 https://pharmayemen.app

---
#نشرة_الأدوية_المجمعة #سوق_الدواء_اليمني #PharmaYemen`;
  }, [requests, selectedBatchIds, selectedGovernorate]);

  // Direct share URLs
  const handleOpenTelegramShare = () => {
    const textToShare = activeChannel === 'batch' ? batchDigestText : telegramPostText;
    const encoded = encodeURIComponent(textToShare);
    window.open(`https://t.me/share/url?url=https://pharmayemen.app&text=${encoded}`, '_blank');
    if (activePayload.id) {
      handleMarkAsBroadcasted(activePayload.id);
    }
  };

  const handleOpenFacebookShare = () => {
    const textToShare = activeChannel === 'batch' ? batchDigestText : facebookPostText;
    const encoded = encodeURIComponent('https://pharmayemen.app');
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encoded}&quote=${encodeURIComponent(textToShare)}`, '_blank');
    if (activePayload.id) {
      handleMarkAsBroadcasted(activePayload.id);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-5 bg-slate-950 text-slate-100" dir="rtl">
      
      {/* Header Banner */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/60 to-slate-900 border border-purple-900/40 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-500/30 text-purple-300 flex items-center justify-center shadow-inner shrink-0">
            <Crown className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
                مركز المراجعة والجدولة الإدارية للنشر بالسوشيال ميديا
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                إدارة المنصة المعتمدة
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              تجميع ومراجعة المنشورات، تدقيق المحتوى وفق الأعراف والتقاليد، والبث التخصصي على المنصات الثلاث.
            </p>
          </div>
        </div>

        {/* Action Channel Buttons Tabs */}
        <div className="flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveChannel('telegram')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChannel === 'telegram'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>Telegram (تخصصي)</span>
          </button>

          <button
            onClick={() => setActiveChannel('facebook')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChannel === 'facebook'
                ? 'bg-blue-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Facebook (عام)</span>
          </button>

          <button
            onClick={() => setActiveChannel('instagram')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChannel === 'instagram'
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Instagram (ستوري)</span>
          </button>

          <button
            onClick={() => setActiveChannel('batch')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
              activeChannel === 'batch'
                ? 'bg-amber-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ListOrdered className="w-3.5 h-3.5" />
            <span>النشرة المجمعة</span>
          </button>
        </div>
      </div>

      {/* Filter & Moderation Queue Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left Column: Moderation Queue & Item Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-purple-400" />
                <span>طابور المراجعة والتدقيق</span>
              </h3>
              
              {/* Type Switcher */}
              <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800 text-[11px]">
                <button
                  onClick={() => {
                    setSelectedType('request');
                    setCustomNotes('');
                  }}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    selectedType === 'request'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  الطلبات ({requests.length})
                </button>
                <button
                  onClick={() => {
                    setSelectedType('offer');
                    setCustomNotes('');
                  }}
                  className={`px-2.5 py-1 rounded-md font-bold transition ${
                    selectedType === 'offer'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  العروض ({offers.length})
                </button>
              </div>
            </div>

            {/* Sub Filters */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <select
                value={selectedGovernorate}
                onChange={(e) => setSelectedGovernorate(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[11px] focus:outline-none"
              >
                <option value="all">كافة المحافظات</option>
                <option value="صنعاء">صنعاء</option>
                <option value="عدن">عدن</option>
                <option value="تعز">تعز</option>
                <option value="حضرموت">حضرموت</option>
                <option value="إب">إب</option>
                <option value="الحديدة">الحديدة</option>
                <option value="مأرب">مأرب</option>
              </select>

              <select
                value={selectedUrgency}
                onChange={(e) => setSelectedUrgency(e.target.value)}
                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-200 text-[11px] focus:outline-none"
              >
                <option value="all">كافة درجات الاحتياج</option>
                <option value="critical">حرج جداً (إنقاذ حياة)</option>
                <option value="high">عاجل (24-48 ساعة)</option>
                <option value="medium">متوسط</option>
              </select>
            </div>

            {/* List of items */}
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
              {selectedType === 'request' ? (
                filteredRequests.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-6">لا توجد طلبات مطابقة للفلتر</p>
                ) : (
                  filteredRequests.map((req) => {
                    const isSelected = selectedRequestId === req.id;
                    const isBatchChecked = selectedBatchIds.includes(req.id);
                    const isBroadcasted = Boolean(broadcastedIds[req.id]);

                    return (
                      <div
                        key={req.id}
                        onClick={() => setSelectedRequestId(req.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-amber-950/30 border-amber-500/50 shadow-sm'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          {activeChannel === 'batch' && (
                            <input
                              type="checkbox"
                              checked={isBatchChecked}
                              onChange={(e) => {
                                e.stopPropagation();
                                handleToggleBatchId(req.id);
                              }}
                              className="w-4 h-4 rounded text-amber-500 cursor-pointer"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h4 className="text-xs font-bold text-white truncate">
                                {req.genericName || req.freeTextName}
                              </h4>
                              {req.urgency === 'critical' && (
                                <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                                  حرج
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {req.quantity} {req.unit} • {req.governorate} • {req.entityName}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isBroadcasted ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                              <CheckCheck className="w-2.5 h-2.5" />
                              <span>نُشر</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              بانتظار النشر
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              ) : (
                filteredOffers.length === 0 ? (
                  <p className="text-center text-xs text-slate-500 py-6">لا توجد عروض مطابقة للفلتر</p>
                ) : (
                  filteredOffers.map((off) => {
                    const isSelected = selectedOfferId === off.id;
                    const isBroadcasted = Boolean(broadcastedIds[off.id]);

                    return (
                      <div
                        key={off.id}
                        onClick={() => setSelectedOfferId(off.id)}
                        className={`p-3 rounded-xl border transition cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'bg-emerald-950/30 border-emerald-500/50 shadow-sm'
                            : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-white truncate">
                            {off.genericName || off.freeTextName}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                            {off.quantity} {off.unit} • {off.brandName || 'بدون تجاري'} • {off.entityName}
                          </p>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {isBroadcasted ? (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-0.5">
                              <CheckCheck className="w-2.5 h-2.5" />
                              <span>نُشر</span>
                            </span>
                          ) : (
                            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                              بانتظار النشر
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })
                )
              )}
            </div>
          </div>

          {/* Ethics & Moderation Status Box */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>فحص وضبط الأعراف والتقاليد الصيدلانية:</span>
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                moderationCheck.isSafe
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              }`}>
                {moderationCheck.isSafe ? '✅ مطابق للضوابط' : '⚠️ يحتوي ملاحظات تدقيق'}
              </span>
            </div>

            <p className="text-[11px] text-slate-400 leading-relaxed">
              تحرص المنصة على عدم نشر أي ألفاظ عامية خارجة، أو ادعاءات غير طبية، وتضمن توجيه كل طلب لمنصته المناسبة لحفظ كرامة وخصوصية الصيدليات والمجتمع.
            </p>

            {/* Editable Notes for Admin */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>تعديل الملاحظات المنشورة (قبل البث):</span>
                <span className="text-[10px] text-purple-400">تعديل مؤقت للمنشور</span>
              </div>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="أضف أو صحح الملاحظات قبل نسخ النص..."
                rows={2}
                className="w-full p-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:ring-1 focus:ring-purple-500 focus:outline-none"
              />
            </div>
          </div>

        </div>

        {/* Right Column: Output Previews & Single/Batch Broadcasters (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* 1. TELEGRAM VIEW */}
          {activeChannel === 'telegram' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-sky-400 flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    قالب Telegram (تخصصي للأطباء والصيادلة)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    منسق بتفاصيل التركيزات والبدائل وروابط التنسيق المباشرة.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(telegramPostText, 'tg')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'tg' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'tg' ? 'تم النسخ!' : 'نسخ الرسالة'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed select-all">
                {telegramPostText}
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={handleOpenTelegramShare}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>فتح تطبيق Telegram للإرسال المباشر</span>
                </button>

                <button
                  onClick={() => activePayload.id && handleMarkAsBroadcasted(activePayload.id)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تعليم كـ تم البث</span>
                </button>
              </div>
            </div>
          )}

          {/* 2. FACEBOOK VIEW */}
          {activeChannel === 'facebook' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-blue-400 flex items-center gap-2">
                    <Share2 className="w-4 h-4" />
                    منشور Facebook (عام ومجتمعي للمجموعات)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    صياغة مجتمعية عامة تناسب منشورات الفيسبوك دون تفاصيل شخصية حساسة.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(facebookPostText, 'fb')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'fb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'fb' ? 'تم النسخ!' : 'نسخ المنشور'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed select-all">
                {facebookPostText}
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={handleOpenFacebookShare}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>مشاركة مباشرة على مجموعات فيسبوك</span>
                </button>

                <button
                  onClick={() => activePayload.id && handleMarkAsBroadcasted(activePayload.id)}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>تعليم كـ تم البث</span>
                </button>
              </div>
            </div>
          )}

          {/* 3. INSTAGRAM STORY BANNER VIEW */}
          {activeChannel === 'instagram' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-pink-400 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    بطاقة Instagram Story (تصميم 9:16 فوري)
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    توليد بطاقة مصممة تلقائياً لمقاس ستوري إنستغرام وحالات واتساب.
                  </p>
                </div>

                <button
                  onClick={handleDownloadStory}
                  className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 hover:opacity-90 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>تنزيل الصورة PNG</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                {/* Canvas Display */}
                <div className="flex flex-col items-center justify-center p-3 bg-slate-950 rounded-2xl border border-slate-800">
                  <div className="w-full max-w-[210px] aspect-[9/16] rounded-xl overflow-hidden shadow-2xl border border-slate-800">
                    <canvas ref={canvasRef} className="w-full h-full object-contain" />
                  </div>
                  <span className="text-[10px] text-slate-500 mt-2">معاينة جرافيك الستوري</span>
                </div>

                {/* Caption Text Box */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300">نص الكابشن المرفق:</span>
                    <button
                      onClick={() => handleCopy(instagramCaptionText, 'ig_cap')}
                      className="text-pink-400 hover:text-pink-300 font-bold text-[11px] flex items-center gap-1"
                    >
                      {copiedKey === 'ig_cap' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>{copiedKey === 'ig_cap' ? 'تم النسخ' : 'نسخ الكابشن'}</span>
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 text-[11px] font-mono text-slate-300 border border-slate-800 whitespace-pre-line leading-relaxed">
                    {instagramCaptionText}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 4. BATCH AGGREGATED BULLETIN VIEW */}
          {activeChannel === 'batch' && (
            <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 shadow-md">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-amber-400 flex items-center gap-2">
                    <ListOrdered className="w-4 h-4" />
                    النشرة المجمعة للأدوية والاحتياجات الحرجة
                  </h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    تجميع عدة طلبات مقطوعة في منشور موحد دوري لمنع التشتت.
                  </p>
                </div>

                <button
                  onClick={() => handleCopy(batchDigestText, 'batch')}
                  className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                >
                  {copiedKey === 'batch' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'batch' ? 'تم النسخ!' : 'نسخ النشرة'}</span>
                </button>
              </div>

              <div className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-slate-200 border border-slate-800 whitespace-pre-line leading-relaxed select-all">
                {batchDigestText}
              </div>

              <div className="flex flex-wrap gap-2.5 pt-2">
                <button
                  onClick={handleOpenTelegramShare}
                  className="flex-1 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>بث النشرة المجمعة عبر Telegram</span>
                </button>

                <button
                  onClick={handleOpenFacebookShare}
                  className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Share2 className="w-4 h-4" />
                  <span>نشر في مجموعات فيسبوك</span>
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
};
