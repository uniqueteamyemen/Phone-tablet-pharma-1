import React, { useState } from 'react';
import { Drug, TherapeuticCategory, DrugForm, PregnancyCategory } from '../types';
import { 
  PlusCircle, 
  X, 
  Pill, 
  Check, 
  Building2, 
  ShieldCheck, 
  DollarSign, 
  Package 
} from 'lucide-react';

interface AddDrugModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveDrug: (drug: Drug) => void;
  categories: TherapeuticCategory[];
}

export const AddDrugModal: React.FC<AddDrugModalProps> = ({
  isOpen,
  onClose,
  onSaveDrug,
  categories,
}) => {
  const [tradeNameAr, setTradeNameAr] = useState('');
  const [tradeNameEn, setTradeNameEn] = useState('');
  const [genericName, setGenericName] = useState('');
  const [category, setCategory] = useState<TherapeuticCategory>(categories[0]);
  const [form, setForm] = useState<DrugForm>('أقراص (Tablets)');
  const [strength, setStrength] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [countryOfOrigin, setCountryOfOrigin] = useState('اليمن');
  const [isYemeniLocal, setIsYemeniLocal] = useState(true);
  const [pregnancyCategory, setPregnancyCategory] = useState<PregnancyCategory>('B');
  const [indicationsAr, setIndicationsAr] = useState('');
  const [dosageAdult, setDosageAdult] = useState('');
  const [dosagePediatric, setDosagePediatric] = useState('');
  const [sideEffectsAr, setSideEffectsAr] = useState('');
  const [contraindicationsAr, setContraindicationsAr] = useState('');
  const [priceYER, setPriceYER] = useState<number>(1500);
  const [stockCount, setStockCount] = useState<number>(50);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tradeNameAr.trim() || !genericName.trim()) return;

    const newDrug: Drug = {
      id: `custom_${Date.now()}`,
      tradeNameAr: tradeNameAr.trim(),
      tradeNameEn: tradeNameEn.trim() || tradeNameAr.trim(),
      genericName: genericName.trim(),
      category,
      form,
      strength: strength.trim() || 'معيار قياسي',
      manufacturer: manufacturer.trim() || 'شركة دوائية',
      country: countryOfOrigin.trim() || 'اليمن',
      isYemeniLocal,
      pregnancyCategory,
      lactationSafety: 'آمن نسبياً مع استشارة الطبيب',
      indications: indicationsAr.trim() ? indicationsAr.split('،').map((s) => s.trim()) : ['علاج سريري عام'],
      dosageAdult: dosageAdult.trim() || 'قرص مرتين يومياً بعد الأكل',
      dosagePediatric: dosagePediatric.trim(),
      sideEffects: sideEffectsAr.trim() ? sideEffectsAr.split('،').map((s) => s.trim()) : ['غثيان خفيف'],
      contraindications: contraindicationsAr.trim() ? contraindicationsAr.split('،').map((s) => s.trim()) : ['الحساسية المفرطة للمركب'],
      interactionsSummary: 'مراجعة التداخلات الدوائية المعتادة',
      storage: 'يحفظ في مكان جاف وبارد تحت 25 درجة مئوية',
      priceYER: Math.max(0, priceYER),
      stockCount: Math.max(0, stockCount),
      minStockAlert: 10,
    };

    onSaveDrug(newDrug);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900 dark:text-white">
                إضافة دواء جديد لقاعدة البيانات
              </h3>
              <p className="text-xs text-slate-400">
                تسجيل صنف محلي أو مستورد ببياناته السريرية والجرعات
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4 text-xs font-semibold">
          
          {/* Names Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                الاسم التجاري بالعربي: *
              </label>
              <input
                type="text"
                required
                value={tradeNameAr}
                onChange={(e) => setTradeNameAr(e.target.value)}
                placeholder="مثال: أوجمنتين، أدول، سيفامكس"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                الاسم التجاري بالإنجليزية:
              </label>
              <input
                type="text"
                value={tradeNameEn}
                onChange={(e) => setTradeNameEn(e.target.value)}
                placeholder="e.g. Augmentin, Adol"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Generic Molecule & Strength */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                المادة الفعالة (الاسم العلمي): *
              </label>
              <input
                type="text"
                required
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
                placeholder="e.g. Amoxicillin / Clavulanic Acid"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                التركيز الصيدلاني:
              </label>
              <input
                type="text"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                placeholder="مثال: 1000 mg, 500 mg, 250 mg/5ml"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Category & Form */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                التصنيف العلاجي:
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TherapeuticCategory)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                الشكل الصيدلاني:
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as DrugForm)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              >
                <option value="أقراص (Tablets)">أقراص (Tablets)</option>
                <option value="كبسولات (Capsules)">كبسولات (Capsules)</option>
                <option value="شراب ومعلق فموي (Syrup / Suspension)">شراب ومعلق فموي (Syrup / Suspension)</option>
                <option value="حقن وريدية وعضلية (Injections / Vials)">حقن وريدية وعضلية (Injections / Vials)</option>
                <option value="مرهم وكريم موضعي (Ointment / Cream)">مرهم وكريم موضعي (Ointment / Cream)</option>
                <option value="قطرات (Drops - Eye/Ear)">قطرات (Drops - Eye/Ear)</option>
                <option value="بخاخ استنشاق (Inhaler / Respules)">بخاخ استنشاق (Inhaler / Respules)</option>
                <option value="تحاميل شرجية (Suppositories)">تحاميل شرجية (Suppositories)</option>
              </select>
            </div>
          </div>

          {/* Manufacturer & Yemeni Flag */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                الشركة المصنعة:
              </label>
              <input
                type="text"
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="مثال: سبأ فارما، شفا فارما، يدكو، GSK"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              />
            </div>

            <div className="flex items-center gap-3 pt-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isYemeniLocal}
                  onChange={(e) => setIsYemeniLocal(e.target.checked)}
                  className="w-4 h-4 rounded text-emerald-600 accent-emerald-600"
                />
                <span className="text-slate-900 dark:text-white font-bold">
                  🇾🇪 منتج ومصنع محلياً في اليمن
                </span>
              </label>
            </div>
          </div>

          {/* Pregnancy Safety & Dosages */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                فئة أمان الحمل (FDA):
              </label>
              <select
                value={pregnancyCategory}
                onChange={(e) => setPregnancyCategory(e.target.value as PregnancyCategory)}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold"
              >
                <option value="A">Category A (آمن تماماً)</option>
                <option value="B">Category B (آمن)</option>
                <option value="C">Category C (بحذر عند الضرورة)</option>
                <option value="D">Category D (خطر محتمل)</option>
                <option value="X">Category X (محظور وممنوع تماماً)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                سعر العبوة (ريال يمني YER):
              </label>
              <input
                type="number"
                value={priceYER}
                onChange={(e) => setPriceYER(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold text-emerald-600"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                الكمية بالمخزن (عبوات):
              </label>
              <input
                type="number"
                value={stockCount}
                onChange={(e) => setStockCount(Number(e.target.value))}
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white font-bold"
              />
            </div>
          </div>

          {/* Adult & Pediatric Dosage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                جرعة البالغين القياسية:
              </label>
              <input
                type="text"
                value={dosageAdult}
                onChange={(e) => setDosageAdult(e.target.value)}
                placeholder="مثال: قرص 1 جم كل 12 ساعة بعد الوجبات"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
                جرعة الأطفال (حسب الوزن أو العمر):
              </label>
              <input
                type="text"
                value={dosagePediatric}
                onChange={(e) => setDosagePediatric(e.target.value)}
                placeholder="مثال: 30-50 مجم/كجم/يوم مقسمة كل 8 ساعات"
                className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
              />
            </div>
          </div>

          {/* Indications & Side Effects */}
          <div>
            <label className="block text-slate-700 dark:text-slate-300 mb-1 font-bold">
              دواعي الاستعمال (افصل بينها بفواصل):
            </label>
            <input
              type="text"
              value={indicationsAr}
              onChange={(e) => setIndicationsAr(e.target.value)}
              placeholder="مثال: التهاب اللوزتين، التهاب الجيوب الأنفية، عدوى المسالك البولية"
              className="w-full p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border text-slate-900 dark:text-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 text-xs font-bold"
            >
              إلغاء
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>حفظ الصنف بالدليل</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
