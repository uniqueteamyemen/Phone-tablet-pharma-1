import { PharmaOffer, PharmaRequest, PharmaStockAlert, PharmaEntity } from '../types/pharmayemen';

export const generateSmartStockAlerts = (
  offers: PharmaOffer[],
  requests: PharmaRequest[],
  entity?: PharmaEntity
): PharmaStockAlert[] => {
  const alerts: PharmaStockAlert[] = [];
  const now = new Date();

  // 1. Near-Expiry Alerts (اقتراب الصلاحية)
  offers.forEach((offer) => {
    if (offer.status !== 'active' || !offer.expiryDate) return;
    const expDate = new Date(offer.expiryDate);
    const diffTime = expDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays <= 180 && diffDays > 0) {
      const severity = diffDays <= 60 ? 'critical' : diffDays <= 120 ? 'high' : 'medium';
      alerts.push({
        id: `alert-exp-${offer.id}`,
        entityId: offer.entityId,
        entityName: offer.entityName,
        drugName: offer.genericName || offer.brandName || offer.freeTextName || 'صنف دوائي',
        genericName: offer.genericName,
        brandName: offer.brandName,
        type: 'near_expiry',
        severity,
        quantity: offer.quantity,
        unit: offer.unit,
        expiryDate: offer.expiryDate,
        daysUntilExpiry: diffDays,
        recommendedAction: diffDays <= 60
          ? 'عرض فوري بسعر مخفض أو تبرع لمستشفى طوارئ لتجنب الإتلاف وتدوير السيولة'
          : 'طرح في شبكة التبادل السريع للصيدليات لتسريع تصريف الكمية',
        isProOnly: true,
        createdAt: new Date().toISOString(),
      });
    }
  });

  // 2. Stagnant / Stored Stock Alert (ركود المخزون)
  offers.forEach((offer) => {
    if (offer.status === 'active' && offer.quantity >= 30) {
      alerts.push({
        id: `alert-stag-${offer.id}`,
        entityId: offer.entityId,
        entityName: offer.entityName,
        drugName: offer.genericName || offer.brandName || offer.freeTextName || 'دواء راكد',
        genericName: offer.genericName,
        brandName: offer.brandName,
        type: 'stagnant_stock',
        severity: 'medium',
        quantity: offer.quantity,
        unit: offer.unit,
        recommendedAction: 'تنشيط البث الإعلاني عبر قنوات تيليجرام للأطباء والصيادلة لرفع معدل الدوران',
        isProOnly: true,
        createdAt: new Date().toISOString(),
      });
    }
  });

  // 3. Critical Market Shortages (نقص حرج في السوق)
  requests.forEach((req) => {
    if (req.status === 'open' && (req.urgency === 'critical' || req.urgency === 'high')) {
      alerts.push({
        id: `alert-shortage-${req.id}`,
        entityId: req.entityId,
        entityName: req.entityName,
        drugName: req.genericName || req.freeTextName || 'دواء شحيح',
        genericName: req.genericName,
        type: 'market_shortage',
        severity: req.urgency === 'critical' ? 'critical' : 'high',
        quantity: req.quantity,
        unit: req.unit,
        recommendedAction: `طلب حرج من ${req.entityName} — فرصة لتوفير الصنف وتغطية احتياج المرضى`,
        isProOnly: true,
        createdAt: new Date().toISOString(),
      });
    }
  });

  // 4. Fallback default alerts for demo showcase
  if (alerts.length === 0) {
    alerts.push({
      id: 'demo-alert-1',
      entityId: entity?.id || 'ent-101',
      entityName: entity?.name || 'صيدليتك',
      drugName: 'Ceftriaxone 1g Vial',
      genericName: 'Ceftriaxone',
      type: 'market_shortage',
      severity: 'critical',
      quantity: 40,
      unit: 'فيال (Vial)',
      recommendedAction: 'إشعار فوري لمستوردي وموزعي الأدوية لتوفير بدائل معتمدة',
      isProOnly: true,
      createdAt: new Date().toISOString(),
    });
  }

  return alerts;
};
