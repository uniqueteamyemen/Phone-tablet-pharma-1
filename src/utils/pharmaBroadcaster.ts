import { PharmaOffer, PharmaRequest, PharmaEntity, SocialBroadcastPayload } from '../types/pharmayemen';

const BROADCAST_QUEUE_KEY = 'pharmayemen_broadcast_queue_v1';

/**
 * Builds an anonymous social media broadcast payload without revealing publisher identity
 */
export const buildSocialBroadcastPayload = (
  item: PharmaOffer | PharmaRequest,
  type: 'offer' | 'request',
  publisherEntity?: PharmaEntity
): SocialBroadcastPayload => {
  const drugName = item.genericName || item.brandName || item.freeTextName || 'صنف دوائي';
  const strength = item.strength || '';
  const quantity = item.quantity;
  const unit = item.unit || 'عبوة';
  const governorate = publisherEntity?.governorate || 'اليمن';

  // Current App Base URL
  const baseUrl = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://ais-pre-vikezij2ldn2pbbvzs7lfx-110937883528.europe-west2.run.app';

  const cleanDrugParam = encodeURIComponent(drugName);
  const directTelegramUrl = `${baseUrl}/?ref=telegram&type=${type}&drug=${cleanDrugParam}`;
  const directFacebookUrl = `${baseUrl}/?ref=facebook&type=${type}&drug=${cleanDrugParam}`;
  const directInstagramUrl = `${baseUrl}/?ref=instagram&type=${type}&drug=${cleanDrugParam}`;
  const directWhatsappUrl = `${baseUrl}/?ref=whatsapp&type=${type}&drug=${cleanDrugParam}`;

  const actionTitle = type === 'offer' ? '🟢 توفر دواء / عرض فائض' : '🔴 طلب دواء عاجل / احتياج';
  const typeText = type === 'offer' ? 'متوفر الآن' : 'مطلوب بصورة عاجلة';

  // 1. Telegram formatted markdown
  const telegram = `
${actionTitle}
━━━━━━━━━━━━━━━━━━
💊 *الصنف:* ${drugName} ${strength ? `(${strength})` : ''}
📦 *الكمية:* ${quantity} ${unit}
📍 *النطاق:* إحدى الصيدليات/المنشآت المعتمدة - ${governorate}
🔒 *الخصوصية:* هوية الناشر مشفرة ومحمية عبر المنصة

🔗 *للتواصل وإتمام المطابقة مباشرة:*
${directTelegramUrl}

#سوق_الدواء_اليمني #أدوية_اليمن #${type === 'offer' ? 'عروض_أدوية' : 'نواقص_أدوية'}
`.trim();

  // 2. Facebook formatted text
  const facebook = `
${actionTitle} - شبكة سوق الدواء اليمني
${typeText}: ${drugName} ${strength ? `(${strength})` : ''}
الكمية: ${quantity} ${unit}
النطاق الجغرافي: منشأة صحية معتمدة (${governorate})

لحماية خصوصية الصيدليات والموردين، يتم التواصل والمطابقة الآلية حصرياً عبر الرابط التالي:
👉 ${directFacebookUrl}
`.trim();

  // 3. Instagram formatted caption
  const instagram = `
${actionTitle}
الصنف: ${drugName} ${strength}
الكمية: ${quantity} ${unit}
المحافظة: ${governorate}

📲 الرابط في البايو أو عبر: ${directInstagramUrl}
#أدوية_اليمن #صيدليات_اليمن #صنعاء #عدن #تعز #سوق_الدواء
`.trim();

  // 4. WhatsApp formatted message
  const whatsapp = `
*${actionTitle}*
الصنف: *${drugName}* ${strength}
الكمية: ${quantity} ${unit}
المحافظة: ${governorate}
_بيانات الناشر محمية عبر المنصة_

للتواصل والمطابقة الفورية عبر المنصة:
${directWhatsappUrl}
`.trim();

  const payload: SocialBroadcastPayload = {
    id: `broadcast-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
    type,
    drugName,
    strength,
    quantity,
    unit,
    governorate,
    directUrl: directTelegramUrl,
    formattedText: {
      telegram,
      facebook,
      instagram,
      whatsapp,
    },
    createdAt: new Date().toISOString(),
    status: 'queued',
  };

  // Persist into Queue for future Webhook Bot dispatch & Admin audit
  try {
    const raw = localStorage.getItem(BROADCAST_QUEUE_KEY);
    const list: SocialBroadcastPayload[] = raw ? JSON.parse(raw) : [];
    list.unshift(payload);
    localStorage.setItem(BROADCAST_QUEUE_KEY, JSON.stringify(list.slice(0, 50)));
  } catch (err) {
    console.error('Failed to queue social broadcast', err);
  }

  return payload;
};

export const getBroadcastQueue = (): SocialBroadcastPayload[] => {
  try {
    const raw = localStorage.getItem(BROADCAST_QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};
