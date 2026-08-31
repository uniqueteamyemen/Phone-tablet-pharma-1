import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  FileText, 
  Search, 
  X, 
  CheckCircle2, 
  Camera,
  Scan,
  Zap,
  Sparkles
} from 'lucide-react';
import { 
  PharmaEntity, 
  PharmaCatalogDrug, 
  PharmaOffer, 
  PharmaRequest 
} from '../types/pharmayemen';
import { rankMedicinesBySearch } from '../medicineSearch';
import { DrugSearchCombobox } from './DrugSearchCombobox';

// ---------------- CREATE OFFER MODAL ----------------
interface CreateOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: PharmaEntity;
  catalog: PharmaCatalogDrug[];
  initialDrug?: PharmaCatalogDrug | null;
  scannedDetails?: any;
  onSubmitOffer: (offer: Omit<PharmaOffer, 'id' | 'createdAt'>) => void;
  onOpenBarcodeScanner?: () => void;
}

export const CreateOfferModal: React.FC<CreateOfferModalProps> = ({
  isOpen,
  onClose,
  entity,
  catalog,
  initialDrug,
  scannedDetails,
  onSubmitOffer,
  onOpenBarcodeScanner,
}) => {
  const [isFreeText, setIsFreeText] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<PharmaCatalogDrug | null>(initialDrug || null);
  const [drugSearch, setDrugSearch] = useState(initialDrug?.genericName || scannedDetails?.genericName || '');
  const [freeTextName, setFreeTextName] = useState(scannedDetails?.brandName || '');
  const [brandName, setBrandName] = useState(scannedDetails?.brandName || '');
  const [quantity, setQuantity] = useState('10');
  const [unit, setUnit] = useState('باكت (Box)');
  const [price, setPrice] = useState(scannedDetails?.suggestedPrice ? String(scannedDetails.suggestedPrice) : '');
  const [currency, setCurrency] = useState('YER');
  const [batchNumber, setBatchNumber] = useState(scannedDetails?.batchNumber || '');
  const [expiryDate, setExpiryDate] = useState(scannedDetails?.expiryDate || '2027-12-31');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialDrug) {
      setSelectedDrug(initialDrug);
      setDrugSearch(initialDrug.genericName);
    }
    if (scannedDetails) {
      if (scannedDetails.brandName) setBrandName(scannedDetails.brandName);
      if (scannedDetails.batchNumber) setBatchNumber(scannedDetails.batchNumber);
      if (scannedDetails.expiryDate) setExpiryDate(scannedDetails.expiryDate);
      if (scannedDetails.suggestedPrice) setPrice(String(scannedDetails.suggestedPrice));
      if (scannedDetails.drug) {
        setSelectedDrug(scannedDetails.drug);
        setDrugSearch(scannedDetails.drug.genericName);
      }
    }
  }, [initialDrug, scannedDetails]);

  if (!isOpen) return null;

  const handleQuickSmartFill = () => {
    if (!selectedDrug && catalog.length > 0) {
      const sample = catalog[0];
      setSelectedDrug(sample);
      setDrugSearch(sample.genericName);
    }
    setQuantity('25');
    setPrice('1800');
    setBatchNumber('BATCH-2026-YE');
    setExpiryDate('2028-06-30');
    setNotes('متوفر بكمية جيدة في مخزن مكيف معتمد ومطابق للمواصفات');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFreeText && !selectedDrug && !drugSearch.trim()) return;
    if (isFreeText && !freeTextName.trim()) return;

    onSubmitOffer({
      entityId: entity.id,
      entityName: entity.name,
      drugId: selectedDrug?.id,
      isFreeText,
      freeTextName: isFreeText ? freeTextName.trim() : undefined,
      genericName: selectedDrug ? selectedDrug.genericName : drugSearch.trim(),
      brandName: brandName.trim() || selectedDrug?.brandName || undefined,
      category: selectedDrug?.category || 'عام',
      quantity: Number(quantity) || 1,
      unit,
      price: price ? Number(price) : undefined,
      currency,
      batchNumber: batchNumber.trim() || undefined,
      expiryDate,
      status: 'active',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">تسجيل عرض فائض دواء (Supply Signal)</h3>
              <p className="text-[11px] text-slate-500">طرح كميات دواء متوفرة لخدمة المنشآت الشقيقة</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Quick Autofill & Barcode Trigger bar */}
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>تسريع الإدخال:</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBarcodeScanner && (
              <button
                type="button"
                onClick={onOpenBarcodeScanner}
                className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                title="مسح باركود علبة الدواء بالكاميرا"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>مسح باركود الكاميرا</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickSmartFill}
              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
              title="تعبئة حقول العرض ببيانات افتراضية ذكية"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>تعبئة ذكية</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Mode Switcher: Catalog vs Free Text */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsFreeText(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                !isFreeText ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              اختيار من الكتالوج الذكي (NEML + البدائل)
            </button>
            <button
              type="button"
              onClick={() => setIsFreeText(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                isFreeText ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              إدخال اسم حر (صنف تجاري أو غير مسجل)
            </button>
          </div>

          {!isFreeText ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  البحث التنبؤي عن الصنف (اسم تجاري أو علمي):
                </label>
                {onOpenBarcodeScanner && (
                  <button
                    type="button"
                    onClick={onOpenBarcodeScanner}
                    className="text-emerald-500 hover:text-emerald-400 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Scan className="w-3 h-3" />
                    <span>مسح باركود بالكاميرا</span>
                  </button>
                )}
              </div>

              {/* Enhanced Combobox with Instant Dropdown & Typo/Space tolerance */}
              <DrugSearchCombobox
                catalog={catalog}
                value={drugSearch}
                selectedDrug={selectedDrug}
                onChangeQuery={(query) => {
                  setDrugSearch(query);
                  if (selectedDrug && selectedDrug.genericName !== query) {
                    setSelectedDrug(null);
                  }
                }}
                onSelectDrug={(drug) => {
                  setSelectedDrug(drug);
                  setDrugSearch(drug.genericName);
                }}
                placeholder="ابحث: اوجم، augmentin، panadol، او ادخل نقط/فواصل..."
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                اسم الدواء / الصنف التجاري / التركيز:
              </label>
              <input
                type="text"
                value={freeTextName}
                onChange={(e) => setFreeTextName(e.target.value)}
                placeholder="مثال: أوغمنتين 1 جم حبوب، كبسولات أوميبرازول 20 ملغ..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {/* Trade / Brand Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              الاسم التجاري أو الشركة المصنعة (اختياري):
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="مثال: يدمول، شفاكلاف، ميدافارم..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Quantity & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">الكمية المتوفرة:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">الوحدة:</label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              >
                <option value="باكت (Box)">باكت (Box)</option>
                <option value="شريط (Strip)">شريط (Strip)</option>
                <option value="فيال / أمبول (Vial/Ampoule)">فيال / أمبول</option>
                <option value="علبة شراب (Bottle)">علبة شراب (Bottle)</option>
                <option value="كرتون (Carton)">كرتون (Carton)</option>
              </select>
            </div>
          </div>

          {/* Price & Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">السعر المقترح (YER):</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="السعر (اختياري)"
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">تاريخ انتهاء الصلاحية:</label>
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">ملاحظات التوريد أو التوزيع:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: الصنف سليم المخزن ومحفوظ بدرجة حرارة ملائمة..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold shadow transition"
            >
              حفظ وطرح العرض في السوق
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

// ---------------- CREATE REQUEST MODAL ----------------
interface CreateRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  entity: PharmaEntity;
  catalog: PharmaCatalogDrug[];
  initialDrug?: PharmaCatalogDrug | null;
  scannedDetails?: any;
  onSubmitRequest: (request: Omit<PharmaRequest, 'id' | 'createdAt'>) => void;
  onOpenBarcodeScanner?: () => void;
}

export const CreateRequestModal: React.FC<CreateRequestModalProps> = ({
  isOpen,
  onClose,
  entity,
  catalog,
  initialDrug,
  scannedDetails,
  onSubmitRequest,
  onOpenBarcodeScanner,
}) => {
  const [isFreeText, setIsFreeText] = useState(false);
  const [selectedDrug, setSelectedDrug] = useState<PharmaCatalogDrug | null>(initialDrug || null);
  const [drugSearch, setDrugSearch] = useState(initialDrug?.genericName || scannedDetails?.genericName || '');
  const [freeTextName, setFreeTextName] = useState(scannedDetails?.brandName || '');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('باكت (Box)');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (initialDrug) {
      setSelectedDrug(initialDrug);
      setDrugSearch(initialDrug.genericName);
    }
    if (scannedDetails) {
      if (scannedDetails.brandName) setFreeTextName(scannedDetails.brandName);
      if (scannedDetails.drug) {
        setSelectedDrug(scannedDetails.drug);
        setDrugSearch(scannedDetails.drug.genericName);
      }
    }
  }, [initialDrug, scannedDetails]);

  if (!isOpen) return null;

  const handleQuickSmartFill = () => {
    if (!selectedDrug && catalog.length > 1) {
      const sample = catalog[1];
      setSelectedDrug(sample);
      setDrugSearch(sample.genericName);
    }
    setQuantity('50');
    setUrgency('high');
    setNotes('طلب عاجل لتغطية عجز في قسم الطوارئ والعناية');
  };

  const searchResults = drugSearch.trim() && !isFreeText
    ? rankMedicinesBySearch(catalog, drugSearch.trim()).slice(0, 5)
    : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFreeText && !selectedDrug && !drugSearch.trim()) return;
    if (isFreeText && !freeTextName.trim()) return;

    onSubmitRequest({
      entityId: entity.id,
      entityName: entity.name,
      drugId: selectedDrug?.id,
      isFreeText,
      freeTextName: isFreeText ? freeTextName.trim() : undefined,
      genericName: selectedDrug ? selectedDrug.genericName : drugSearch.trim(),
      category: selectedDrug?.category || 'عام',
      quantity: Number(quantity) || 1,
      unit,
      urgency,
      status: 'open',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 max-w-lg w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">تسجيل طلب احتياج دواء (Demand Signal)</h3>
              <p className="text-[11px] text-slate-500">إشعار السوق بالنقص لتسريع المطابقة والتغطية</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-sm font-bold cursor-pointer">
            ✕
          </button>
        </div>

        {/* Quick Autofill & Barcode Trigger bar */}
        <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-[11px] text-slate-600 dark:text-slate-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>تسريع الإدخال:</span>
          </div>

          <div className="flex items-center gap-2">
            {onOpenBarcodeScanner && (
              <button
                type="button"
                onClick={onOpenBarcodeScanner}
                className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-[11px] font-bold shadow-xs transition flex items-center gap-1 cursor-pointer"
                title="مسح باركود علبة الدواء بالكاميرا"
              >
                <Camera className="w-3.5 h-3.5" />
                <span>مسح باركود الكاميرا</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleQuickSmartFill}
              className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-[11px] font-semibold transition flex items-center gap-1 cursor-pointer"
              title="تعبئة حقول الطلب ببيانات افتراضية ذكية"
            >
              <Zap className="w-3 h-3 text-amber-500" />
              <span>تعبئة ذكية</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Mode Switcher */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsFreeText(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                !isFreeText ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              اختيار من الكتالوج (NEML)
            </button>
            <button
              type="button"
              onClick={() => setIsFreeText(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                isFreeText ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              إدخال اسم حر أو تجاري
            </button>
          </div>

          {!isFreeText ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  الصنف المطلوب (اسم تجاري أو علمي مع البدائل):
                </label>
                {onOpenBarcodeScanner && (
                  <button
                    type="button"
                    onClick={onOpenBarcodeScanner}
                    className="text-amber-500 hover:text-amber-400 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Scan className="w-3 h-3" />
                    <span>مسح باركود بالكاميرا</span>
                  </button>
                )}
              </div>

              {/* Enhanced Combobox with Instant Dropdown & Typo/Space tolerance */}
              <DrugSearchCombobox
                catalog={catalog}
                value={drugSearch}
                selectedDrug={selectedDrug}
                onChangeQuery={(query) => {
                  setDrugSearch(query);
                  if (selectedDrug && selectedDrug.genericName !== query) {
                    setSelectedDrug(null);
                  }
                }}
                onSelectDrug={(drug) => {
                  setSelectedDrug(drug);
                  setDrugSearch(drug.genericName);
                }}
                placeholder="ابحث: اوجم، augmentin، panadol، او ادخل نقط/فواصل..."
              />
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                اسم الدواء المطلوب بالتفصيل:
              </label>
              <input
                type="text"
                value={freeTextName}
                onChange={(e) => setFreeTextName(e.target.value)}
                placeholder="مثال: حقن سيفترياكسون 1 جم، شراب كولد آند فلو للأطفال..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* Quantity & Urgency */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">الكمية المطلوبة:</label>
              <input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-700 dark:text-slate-300 block">درجة الاستعجال:</label>
              <select
                value={urgency}
                onChange={(e) => setUrgency(e.target.value as any)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="critical">حرج جداً (طارئ لحياة مريض)</option>
                <option value="high">عاجل (خلال 24-48 ساعة)</option>
                <option value="medium">متوسط (تغطية دورية)</option>
                <option value="low">منخفض (استطلاع سوق)</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">ملاحظات إضافية عن الاحتياج:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: يفضل إنتاج محلي إن وجد، أو بديل مساوٍ في التركيز..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-slate-300 dark:border-slate-700 rounded-xl text-slate-600 dark:text-slate-300 font-semibold"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl font-bold shadow transition"
            >
              نشر إشارة الاحتياج في السوق
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
