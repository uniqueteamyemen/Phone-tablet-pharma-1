import React, { useState, useEffect, useRef } from 'react';
import { 
  Building2, 
  FileText, 
  Search, 
  X, 
  CheckCircle2, 
  Camera,
  Scan,
  Zap,
  Sparkles,
  Image as ImageIcon,
  Truck,
  ShieldCheck,
  AlertTriangle,
  UploadCloud,
  Trash2
} from 'lucide-react';
import { 
  PharmaEntity, 
  PharmaCatalogDrug, 
  PharmaOffer, 
  PharmaRequest,
  PharmaItemCategoryType,
  CATEGORY_TYPE_LABELS
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
  const [categoryType, setCategoryType] = useState<PharmaItemCategoryType>('medicine');
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
  const [imageUrl, setImageUrl] = useState<string>('');
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [acknowledgedResponsibility, setAcknowledgedResponsibility] = useState(false);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setFormError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 3 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setFormError(null);
      };
      reader.readAsDataURL(file);
    }
  };

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
    setAcknowledgedResponsibility(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isFreeText && !selectedDrug && !drugSearch.trim()) {
      setFormError('يرجى اختيار الدواء من الكتالوج أو التبديل لإدخال اسم حر.');
      return;
    }
    if (isFreeText && !freeTextName.trim()) {
      setFormError('يرجى كتابة اسم الصنف أو الجهاز أو المستحضر.');
      return;
    }
    if (!acknowledgedResponsibility) {
      setFormError('يرجى الموافقة على إقرار المسؤولية وتعهد التحديث قبل النشر.');
      return;
    }

    onSubmitOffer({
      entityId: entity.id,
      entityName: entity.name,
      drugId: selectedDrug?.id,
      isFreeText,
      freeTextName: isFreeText ? freeTextName.trim() : undefined,
      genericName: selectedDrug ? selectedDrug.genericName : (isFreeText ? freeTextName.trim() : drugSearch.trim()),
      brandName: brandName.trim() || selectedDrug?.brandName || undefined,
      category: selectedDrug?.category || CATEGORY_TYPE_LABELS[categoryType]?.label || 'عام',
      categoryType,
      imageUrl: imageUrl || undefined,
      quantity: Number(quantity) || 1,
      unit,
      price: price ? Number(price) : undefined,
      currency,
      batchNumber: batchNumber.trim() || undefined,
      expiryDate,
      needsDelivery,
      deliveryNotes: needsDelivery ? deliveryNotes.trim() || undefined : undefined,
      acknowledgedResponsibility: true,
      status: 'active',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">تسجيل عرض فائض (دواء / أجهزة / مستحضرات)</h3>
              <p className="text-[11px] text-slate-500">طرح إشارة وفرة لتأمين الاحتياج ومنع التلف والرواكد</p>
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

        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Category Classification */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              تصنيف الصنف أو المادة:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_TYPE_LABELS) as PharmaItemCategoryType[]).map((catKey) => {
                const item = CATEGORY_TYPE_LABELS[catKey];
                const isSelected = categoryType === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setCategoryType(catKey);
                      if (catKey !== 'medicine') {
                        setIsFreeText(true);
                      }
                    }}
                    className={`p-2 rounded-xl border text-right transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[11px] font-bold mt-1 line-clamp-2">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mode Switcher: Catalog vs Free Text */}
          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
            <button
              type="button"
              onClick={() => setIsFreeText(false)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                !isFreeText ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              اختيار من قائمة الأدوية الأساسية (NEML)
            </button>
            <button
              type="button"
              onClick={() => setIsFreeText(true)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition ${
                isFreeText ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500'
              }`}
            >
              كتابة حرة (أورام، أجهزة، لاصقات سكر، تجميل) ✍️
            </button>
          </div>

          {!isFreeText ? (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">
                  البحث التنبؤي عن الصنف الدوائي:
                </label>
                {onOpenBarcodeScanner && (
                  <button
                    type="button"
                    onClick={onOpenBarcodeScanner}
                    className="text-emerald-500 hover:text-emerald-400 text-[11px] font-bold flex items-center gap-1"
                  >
                    <Scan className="w-3 h-3" />
                    <span>مسح باركود</span>
                  </button>
                )}
              </div>

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
                اسم الصنف بالتفصيل (أدوية نادرة، لاصقات سكر، أجهزة، مستحضرات):
              </label>
              <input
                type="text"
                value={freeTextName}
                onChange={(e) => setFreeTextName(e.target.value)}
                placeholder="مثال: FreeStyle Libre 2 Sensors، حقن ترازتوزوماب للأورام، كبسولات أورليستات..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          )}

          {/* Trade / Brand Name */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              الاسم التجاري أو الشركة المصنعة أو الوكيل (اختياري):
            </label>
            <input
              type="text"
              value={brandName}
              onChange={(e) => setBrandName(e.target.value)}
              placeholder="مثال: Abbott, The Ordinary, Roche, Yedco..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Image Upload / Camera Photo */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-4 h-4 text-emerald-600" />
                <span>إرفاق صورة للصنف / العلبة / تاريخ الصلاحية (اختياري):</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-rose-500 hover:text-rose-600 text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف الصورة</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-emerald-300 dark:border-emerald-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <img src={imageUrl} alt="صورة الصنف" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-emerald-500" />
                  <span>اختر صورة من الجهاز أو التقط بكاميرا الهاتف</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
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
                <option value="قطعة / لاصقة (Sensor/Piece)">قطعة / مجس / لاصقة</option>
                <option value="فيال / أمبول (Vial/Ampoule)">فيال / أمبول حقن</option>
                <option value="علبة / عبوة (Bottle)">علبة / عبوة تجميل أو شراب</option>
                <option value="كرتون (Carton)">كرتون (Carton)</option>
                <option value="جهاز طبي (Unit)">جهاز طبي متكامل</option>
              </select>
            </div>
          </div>

          {/* Price (Optional) & Expiry */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="font-semibold text-slate-700 dark:text-slate-300 block">السعر التقديري (اختياري):</label>
                <span className="text-[10px] text-slate-400">بدون إلزام مالي</span>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder="السعر (اختياري تماماً)"
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

          {/* Inter-city Delivery Support */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsDelivery}
                onChange={(e) => setNeedsDelivery(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Truck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>توفير أو طلب ربط مع سعاة الشحن والنقل المبرد بين المحافظات</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  إتاحة شحن الصنف للصيدليات أو المستشفيات في المحافظات الأخرى عبر شبكة الشركاء المعتمدين.
                </p>
              </div>
            </label>
            {needsDelivery && (
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="ملاحظات الشحن: مثل يحتاج تبريد 2-8°C أو جاهز للإرسال فوراً..."
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">ملاحظات التوريد أو التخزين:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: الصنف محفوظ في بيئة مكيفة ومطابق للمواصفات الصيدلانية..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          {/* Responsibility & Liability Disclaimer Checkbox */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedResponsibility}
                onChange={(e) => setAcknowledgedResponsibility(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                <span className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>إقرار المسؤولية والتعهد القانوني بالتحديث:</span>
                </span>
                أقر بأنني مسؤول مسؤولية كاملة عن صحة وسلامة وتخزين البيانات والصنف المعروض، وأعلم أن المنصة لا تبيع ولا تشتري ولا تفحص الأدوية بل تربط الإشارات فقط، وأتعهد بحذف أو تحديث هذا العرض فور تلبيته أو في حالة تلف الصنف.
              </div>
            </label>
          </div>

          {/* Platform Moderation & Social Publishing Info */}
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="text-emerald-500 font-bold">ℹ️ معلومة:</span>
            <span>يُنشر عرضك فوراً في المنصة، وتتولى الإدارة مراجعة المنشورات وجدولتها في قنوات التواصل الاجتماعي الرسمية بحسب أولوية السوق.</span>
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
              disabled={!acknowledgedResponsibility}
              className={`flex-1 py-2.5 rounded-xl font-bold shadow transition cursor-pointer ${
                acknowledgedResponsibility
                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              طرح العرض في شبكة السوق
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
  const [categoryType, setCategoryType] = useState<PharmaItemCategoryType>('medicine');
  const [selectedDrug, setSelectedDrug] = useState<PharmaCatalogDrug | null>(initialDrug || null);
  const [drugSearch, setDrugSearch] = useState(initialDrug?.genericName || scannedDetails?.genericName || '');
  const [freeTextName, setFreeTextName] = useState(scannedDetails?.brandName || '');
  const [quantity, setQuantity] = useState('20');
  const [unit, setUnit] = useState('باكت (Box)');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high' | 'critical'>('high');
  const [imageUrl, setImageUrl] = useState<string>('');
  const [needsDelivery, setNeedsDelivery] = useState(false);
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [acknowledgedResponsibility, setAcknowledgedResponsibility] = useState(false);
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setFormError('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 3 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageUrl(reader.result as string);
        setFormError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleQuickSmartFill = () => {
    if (!selectedDrug && catalog.length > 1) {
      const sample = catalog[1];
      setSelectedDrug(sample);
      setDrugSearch(sample.genericName);
    }
    setQuantity('50');
    setUrgency('high');
    setNotes('طلب عاجل لتغطية عجز في قسم الطوارئ والعناية');
    setAcknowledgedResponsibility(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!isFreeText && !selectedDrug && !drugSearch.trim()) {
      setFormError('يرجى اختيار الدواء من الكتالوج أو التبديل لإدخال اسم حر.');
      return;
    }
    if (isFreeText && !freeTextName.trim()) {
      setFormError('يرجى كتابة اسم الصنف أو الجهاز أو المستحضر المطلوب.');
      return;
    }
    if (!acknowledgedResponsibility) {
      setFormError('يرجى الموافقة على إقرار وتعهد حذف الطلب فور تلبيته.');
      return;
    }

    onSubmitRequest({
      entityId: entity.id,
      entityName: entity.name,
      drugId: selectedDrug?.id,
      isFreeText,
      freeTextName: isFreeText ? freeTextName.trim() : undefined,
      genericName: selectedDrug ? selectedDrug.genericName : (isFreeText ? freeTextName.trim() : drugSearch.trim()),
      category: selectedDrug?.category || CATEGORY_TYPE_LABELS[categoryType]?.label || 'عام',
      categoryType,
      imageUrl: imageUrl || undefined,
      quantity: Number(quantity) || 1,
      unit,
      urgency,
      needsDelivery,
      deliveryNotes: needsDelivery ? deliveryNotes.trim() || undefined : undefined,
      acknowledgedResponsibility: true,
      status: 'open',
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 max-w-xl w-full rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto">
        
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">تسجيل طلب احتياج (دواء / أجهزة / مستلزمات)</h3>
              <p className="text-[11px] text-slate-500">إشعار شبكة الصيدليات والموزعين بالنقص لتأمين الصنف فوراً</p>
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

        {formError && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{formError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          
          {/* Category Classification */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">
              تصنيف الصنف المطلوب:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {(Object.keys(CATEGORY_TYPE_LABELS) as PharmaItemCategoryType[]).map((catKey) => {
                const item = CATEGORY_TYPE_LABELS[catKey];
                const isSelected = categoryType === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => {
                      setCategoryType(catKey);
                      if (catKey !== 'medicine') {
                        setIsFreeText(true);
                      }
                    }}
                    className={`p-2 rounded-xl border text-right transition flex flex-col justify-between cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[11px] font-bold mt-1 line-clamp-2">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

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
              كتابة حرة (أورام، أجهزة، لاصقات سكر، تجميل) ✍️
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
                    <span>مسح باركود</span>
                  </button>
                )}
              </div>

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
                اسم الصنف أو الوصفة الطبية المطلوبة:
              </label>
              <input
                type="text"
                value={freeTextName}
                onChange={(e) => setFreeTextName(e.target.value)}
                placeholder="مثال: لاصقات FreeStyle Libre 2، حقن Herceptin للأورام، شراب مضاد..."
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>
          )}

          {/* Prescription / Box Photo Upload */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 text-xs">
                <ImageIcon className="w-4 h-4 text-amber-600" />
                <span>إرفاق صورة للروشتة أو علبة الدواء القديمة (اختياري):</span>
              </label>
              {imageUrl && (
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="text-rose-500 hover:text-rose-600 text-[11px] flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>حذف الصورة</span>
                </button>
              )}
            </div>

            {imageUrl ? (
              <div className="relative w-full h-32 rounded-xl overflow-hidden border border-amber-300 dark:border-amber-700 bg-slate-100 dark:bg-slate-900 flex items-center justify-center">
                <img src={imageUrl} alt="صورة الطلب / الروشتة" className="max-h-full max-w-full object-contain" />
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-dashed border-slate-300 dark:border-slate-600 hover:border-amber-500 text-slate-600 dark:text-slate-300 text-xs flex items-center gap-2 transition cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-amber-500" />
                  <span>اختر صورة الروشتة أو التقط صورة بكاميرا الهاتف</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
            )}
          </div>

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
                <option value="critical">حرج جداً (طارئ لإنقاذ حياة مريض)</option>
                <option value="high">عاجل (خلال 24-48 ساعة)</option>
                <option value="medium">متوسط (تغطية دورية)</option>
                <option value="low">منخفض (استطلاع سوق)</option>
              </select>
            </div>
          </div>

          {/* Inter-city Delivery Support */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700/80 space-y-2">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={needsDelivery}
                onChange={(e) => setNeedsDelivery(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div>
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 text-xs">
                  <Truck className="w-3.5 h-3.5 text-amber-600" />
                  <span>نقبل الشحن من محافظات أخرى ونطلب ربطاً مع خدمة توصيل</span>
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  تفعيل إمكانية استلام الشحنة من صنعاء أو عدن أو تعز عبر السعاة المعتمدين.
                </p>
              </div>
            </label>
            {needsDelivery && (
              <input
                type="text"
                value={deliveryNotes}
                onChange={(e) => setDeliveryNotes(e.target.value)}
                placeholder="عنوان الاستلام الدقيق أو المحطة المفضلة..."
                className="w-full p-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            )}
          </div>

          {/* Notes */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-700 dark:text-slate-300 block">ملاحظات إضافية عن الاحتياج:</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="مثال: نقبل أي بديل علمي بنفس التركيز والمادة الفعالة..."
              className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
            />
          </div>

          {/* Responsibility & Cleanup Checkbox */}
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 rounded-xl space-y-2">
            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={acknowledgedResponsibility}
                onChange={(e) => setAcknowledgedResponsibility(e.target.checked)}
                className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
              />
              <div className="text-[11px] text-amber-900 dark:text-amber-200 leading-relaxed">
                <span className="font-bold flex items-center gap-1 text-amber-800 dark:text-amber-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  <span>إقرار المسؤولية وتعهد حذف الطلب:</span>
                </span>
                أقر بصحة احتياجي للصنف المذكور، وأتعهد بالدخول للمنصة وحذف هذا الطلب فور توفره أو إلغائه لمنع إرباك الموردين والسوق.
              </div>
            </label>
          </div>

          {/* Platform Moderation & Social Publishing Info */}
          <div className="p-2.5 bg-slate-100 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700/60 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
            <span className="text-amber-500 font-bold">ℹ️ معلومة:</span>
            <span>يتم تسجيل طلبك فوراً في المنصة، وتتولى الإدارة مراجعة وتجميع الطلبات وجدولتها للنشر في قنوات التواصل الاجتماعي بحسب الأولوية ودرجة الاستعجال.</span>
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
              disabled={!acknowledgedResponsibility}
              className={`flex-1 py-2.5 rounded-xl font-bold shadow transition cursor-pointer ${
                acknowledgedResponsibility
                  ? 'bg-amber-600 hover:bg-amber-500 text-white'
                  : 'bg-slate-300 dark:bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              نشر إشارة الاحتياج في شبكة السوق
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

