import React, { useState, useMemo } from 'react';
import { Search, Pill, Filter, CheckCircle2, BookmarkPlus, PlusCircle, X, Send, Sparkles } from 'lucide-react';
import { PharmaCatalogDrug, CATEGORY_TRANSLATIONS } from '../types/pharmayemen';
import { rankMedicinesBySearch, getMedicineSearchMatch } from '../medicineSearch';

interface PharmaCatalogViewProps {
  catalog: PharmaCatalogDrug[];
  userRole?: 'admin' | 'pharmacy' | 'visitor';
  onSelectDrugForOffer: (drug: PharmaCatalogDrug) => void;
  onSelectDrugForRequest: (drug: PharmaCatalogDrug) => void;
  onApproveDrug?: (drug: PharmaCatalogDrug) => void;
}

export const PharmaCatalogView: React.FC<PharmaCatalogViewProps> = ({
  catalog,
  userRole = 'visitor',
  onSelectDrugForOffer,
  onSelectDrugForRequest,
  onApproveDrug,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDrug, setSelectedDrug] = useState<PharmaCatalogDrug | null>(catalog[0] || null);

  // Request drug addition modal state (Improvement #5)
  const [showRequestDrugModal, setShowRequestDrugModal] = useState(false);
  const [newDrugGeneric, setNewDrugGeneric] = useState('');
  const [newDrugBrand, setNewDrugBrand] = useState('');
  const [newDrugStrength, setNewDrugStrength] = useState('');
  const [newDrugCategory, setNewDrugCategory] = useState('');
  const [newDrugNotes, setNewDrugNotes] = useState('');
  const [requestSubmitted, setRequestSubmitted] = useState(false);

  // Pending requests for Admin Review & Approval
  const [pendingRequests, setPendingRequests] = useState<any[]>(() => {
    try {
      const stored = localStorage.getItem('pharmayemen_requested_drugs');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  const [showAdminReviewModal, setShowAdminReviewModal] = useState(false);

  const handleOpenRequestDrug = (initialName?: string) => {
    setNewDrugGeneric(initialName || searchQuery || '');
    setRequestSubmitted(false);
    setShowRequestDrugModal(true);
  };

  const handleSubmitDrugRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDrugGeneric.trim()) return;

    const newReq = {
      id: `req-drug-${Date.now()}`,
      genericName: newDrugGeneric.trim(),
      brandName: newDrugBrand.trim(),
      strength: newDrugStrength.trim(),
      category: newDrugCategory.trim() || 'عام / مستلزمات وتجميل',
      notes: newDrugNotes.trim(),
      requestedAt: new Date().toISOString(),
    };

    // Persist pending addition in localStorage
    try {
      const stored = localStorage.getItem('pharmayemen_requested_drugs');
      const list = stored ? JSON.parse(stored) : [];
      list.push(newReq);
      localStorage.setItem('pharmayemen_requested_drugs', JSON.stringify(list));
      setPendingRequests(list);
    } catch (err) {
      console.error('Failed to save drug request', err);
    }

    setRequestSubmitted(true);
    setTimeout(() => {
      setShowRequestDrugModal(false);
      setRequestSubmitted(false);
      setNewDrugGeneric('');
      setNewDrugBrand('');
      setNewDrugStrength('');
      setNewDrugNotes('');
    }, 1600);
  };

  const handleApprovePendingDrug = (item: any) => {
    if (onApproveDrug) {
      const newCatalogDrug: PharmaCatalogDrug = {
        id: `custom-${Date.now()}`,
        genericName: item.genericName,
        genericNameAr: item.genericName,
        brandName: item.brandName || item.genericName,
        brandNameAr: item.brandName || item.genericName,
        strength: item.strength || '',
        category: item.category || 'أدوية مضافة معتمدة',
        nemlCategory: 'معتمد بطلب المستخدمين',
        isYemeniLocal: true,
        manufacturer: item.notes || 'معتمد من إدارة المنصة',
      };
      onApproveDrug(newCatalogDrug);
    }
    // Remove from pending
    const remaining = pendingRequests.filter((p) => p.id !== item.id);
    setPendingRequests(remaining);
    localStorage.setItem('pharmayemen_requested_drugs', JSON.stringify(remaining));
  };

  const handleRejectPendingDrug = (id: string) => {
    const remaining = pendingRequests.filter((p) => p.id !== id);
    setPendingRequests(remaining);
    localStorage.setItem('pharmayemen_requested_drugs', JSON.stringify(remaining));
  };

  // Filter and Rank with PharmaYemen's fuzzy matching engine
  const filteredCatalog = useMemo(() => {
    let list = catalog;

    if (selectedCategory !== 'all') {
      list = list.filter((item) => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      list = rankMedicinesBySearch(list, searchQuery.trim());
    }

    return list;
  }, [catalog, selectedCategory, searchQuery]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    catalog.forEach((item) => {
      if (item.category) cats.add(item.category);
    });
    return Array.from(cats);
  }, [catalog]);

  return (
    <div className="flex-1 flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50 dark:bg-slate-900">
      
      {/* Left List Pane */}
      <div className="w-full lg:w-[460px] flex flex-col border-b lg:border-b-0 lg:border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/60 overflow-hidden">
        
        {/* Search and Category Filter Toolbar */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                <Pill className="w-4 h-4 text-emerald-600" />
                دليل الأدوية الأساسية الموحد (NEML)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                كتالوج الأدوية الوطني المعتمد في الجمهورية اليمنية ({catalog.length} صنف علمي)
              </p>
            </div>
            
            {/* Improvement #5: Request Drug Addition Button & Admin Review */}
            <div className="flex items-center gap-1.5 shrink-0">
              {userRole === 'admin' && (
                <button
                  onClick={() => setShowAdminReviewModal(true)}
                  className="relative px-2.5 py-1.5 rounded-xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                  title="مراجعة طلبات إضافة الأدوية المقدمة من المستخدمين"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                  <span>طلبات الإضافة</span>
                  {pendingRequests.length > 0 && (
                    <span className="w-4 h-4 rounded-full bg-purple-500 text-white text-[10px] font-black flex items-center justify-center">
                      {pendingRequests.length}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={() => handleOpenRequestDrug()}
                className="px-2.5 py-1.5 rounded-xl bg-emerald-600/15 hover:bg-emerald-600/25 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
                title="طلب إضافة صنف دوائي جديد غير موجود في الكتالوج"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>طلب إضافة دواء</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم العلمي، التجاري، أو التركيز (بحث مرن)..."
              className="w-full pl-3 pr-9 py-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="flex-1 py-1.5 px-2 text-xs rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            >
              <option value="all">جميع الفئات العلاجية ({catalog.length})</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_TRANSLATIONS[cat] || cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="px-4 py-2 bg-slate-100 dark:bg-slate-800/40 text-[11px] font-medium text-slate-600 dark:text-slate-400 flex items-center justify-between">
          <span>نتائج البحث: {filteredCatalog.length} صنف</span>
          {searchQuery && (
            <span className="text-emerald-600 font-semibold">مطابقة محرك البحث الدوائي</span>
          )}
        </div>

        {/* List of Drugs */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
          {filteredCatalog.length === 0 ? (
            <div className="p-8 text-center text-slate-400 space-y-3">
              <p className="text-sm font-medium">لم يتم العثور على أدوية مطابقة في الكتالوج</p>
              <p className="text-xs">هل تبحث عن صنف تجاري أو غير مدرج؟ يمكنك رفع طلب إدراجه للإدارة أو تسجيله كـ نص حر.</p>
              <button
                onClick={() => handleOpenRequestDrug(searchQuery)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                <PlusCircle className="w-4 h-4" />
                <span>طلب إضافة الصنف "{searchQuery}" للكتالوج</span>
              </button>
            </div>
          ) : (
            filteredCatalog.map((drug) => {
              const isSelected = selectedDrug?.id === drug.id;
              return (
                <div
                  key={drug.id}
                  onClick={() => setSelectedDrug(drug)}
                  className={`p-3.5 cursor-pointer transition flex items-start justify-between gap-2 ${
                    isSelected
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 border-r-4 border-emerald-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight truncate">
                        {drug.genericName}
                      </h3>
                      {drug.dosageForm && (
                        <span className="text-[10px] bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-medium">
                          {drug.dosageForm}
                        </span>
                      )}
                    </div>
                    {drug.strength && (
                      <p className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold mt-0.5">
                        التركيز: {drug.strength}
                      </p>
                    )}
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                      {CATEGORY_TRANSLATIONS[drug.category] || drug.category}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Detail / Monograph Pane */}
      <div className="flex-1 flex flex-col overflow-y-auto p-6 bg-white dark:bg-slate-900">
        {selectedDrug ? (
          <div className="max-w-2xl space-y-6">
            
            {/* Header */}
            <div className="border-b border-slate-200 dark:border-slate-800 pb-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-600 bg-emerald-100 dark:bg-emerald-900/50 px-2.5 py-1 rounded-md">
                  مسجل في القائمة الوطنية NEML
                </span>
                <span className="text-xs text-slate-400 font-mono">ID: {selectedDrug.id}</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white uppercase mt-2">
                {selectedDrug.genericName}
              </h2>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mt-1">
                {CATEGORY_TRANSLATIONS[selectedDrug.category] || selectedDrug.category}
              </p>
            </div>

            {/* Quick Details Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  الشكل الصيدلاني (Dosage Form)
                </span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                  {selectedDrug.dosageForm || 'غير محدد'}
                </span>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">
                  التركيز المعياري (Strength)
                </span>
                <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">
                  {selectedDrug.strength || 'معيار قياسي'}
                </span>
              </div>
            </div>

            {/* Market Intelligence Actions */}
            <div className="bg-gradient-to-br from-emerald-500/10 via-teal-500/5 to-slate-900/10 p-5 rounded-2xl border border-emerald-500/20 space-y-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  إشارات السوق الذكية لهذا الصنف
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  يمكنك استخدام هذا الصنف المعياري فوراً لتسجيل فائض صيدليتك (عرض) أو تسجيل نقص واحتياج عاجل (طلب) ليتم مطابقته آلياً عبر المنصة.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-1">
                <button
                  onClick={() => onSelectDrugForOffer(selectedDrug)}
                  className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold text-center shadow transition flex items-center justify-center gap-2"
                >
                  <BookmarkPlus className="w-4 h-4" />
                  تسجيل عرض فائض لهذا الدواء
                </button>
                <button
                  onClick={() => onSelectDrugForRequest(selectedDrug)}
                  className="flex-1 py-2.5 px-4 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-bold text-center shadow transition flex items-center justify-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  تسجيل طلب احتياج لهذا الدواء
                </button>
              </div>
            </div>

            {/* Note & Policy */}
            <div className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed border-t border-slate-200 dark:border-slate-800 pt-4">
              📌 <strong>ضابط المنصة:</strong> هذا الكتالوج مأخوذ من القائمة الوطنية للأدوية الأساسية في اليمن (NEML). ظهور الصنف في الكتالوج لا يعني بالضرورة توفره الفعلي في مخازن المنصة، وإنما يُستخدم للتعرف المنضبط والمطابقة بين إشارات المنشآت الصحية.
            </div>

          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-slate-400">
            اختر دواء من القائمة لعرض تفاصيله وإجراءات السوق.
          </div>
        )}
      </div>

      {/* Improvement #5: Request Drug Addition Modal Popup */}
      {showRequestDrugModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
            
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-white">طلب إضافة صنف للكتالوج الدوائي</h3>
              </div>
              <button
                onClick={() => setShowRequestDrugModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {requestSubmitted ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                <h4 className="text-sm font-bold text-white">تم إرسال طلب إضافة الصنف بنجاح!</h4>
                <p className="text-xs text-slate-400">
                  تم حفظ الطلب وإرساله لمراجعة مشرفي المنصة لاعتماده ضمن الكتالوج الوطني الموحد.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitDrugRequest} className="space-y-3.5 text-xs text-right" dir="rtl">
                <p className="text-slate-400 text-[11px]">
                  إذا كان الدواء غير متوفر في قائمة NEML الموحدة، يمكنك رفعه هنا ليتم إدراجه فور تدقيقه:
                </p>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    الاسم العلمي للدواء (Generic Name) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={newDrugGeneric}
                    onChange={(e) => setNewDrugGeneric(e.target.value)}
                    placeholder="مثال: Meropenem أو Paracetamol"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      الاسم التجاري الشائع (Brand)
                    </label>
                    <input
                      type="text"
                      value={newDrugBrand}
                      onChange={(e) => setNewDrugBrand(e.target.value)}
                      placeholder="مثال: Meronem أو Panadol"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-300 mb-1">
                      التركيز والشكل (Strength/Form)
                    </label>
                    <input
                      type="text"
                      value={newDrugStrength}
                      onChange={(e) => setNewDrugStrength(e.target.value)}
                      placeholder="مثال: 1g IV Vial أو 500mg Tab"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    ملاحظات أو الشركة المصنعة (اختياري)
                  </label>
                  <textarea
                    rows={2}
                    value={newDrugNotes}
                    onChange={(e) => setNewDrugNotes(e.target.value)}
                    placeholder="ملاحظات تفصيلية لمشرف الكتالوج..."
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 resize-none"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowRequestDrugModal(false)}
                    className="px-3 py-2 rounded-xl text-slate-400 hover:text-white transition"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center gap-1.5 transition shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>إرسال الطلب للاعتماد</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      )}

      {/* Admin Review and Approval Modal */}
      {showAdminReviewModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 text-right" dir="rtl">
            
            <div className="flex items-center justify-between border-b border-slate-800 p-4 bg-slate-950/80">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white">سجل مراجعة واعتماد الأدوية المطلوبة (Admin Review)</h3>
                  <p className="text-xs text-slate-400">تدقيق طلبات الأصناف المرفوعة من الصيدليات واعتمادها يدوياً لتنضم للكتالوج الموحد</p>
                </div>
              </div>
              <button
                onClick={() => setShowAdminReviewModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-3">
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-slate-400 space-y-2">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-70" />
                  <p className="text-sm font-bold text-slate-300">لا توجد طلبات أدوية جديدة معلقة للمراجعة</p>
                  <p className="text-xs text-slate-500">تم اعتماد أو معالجة جميع الأصناف المرفوعة سابقاً.</p>
                </div>
              ) : (
                pendingRequests.map((reqItem) => (
                  <div key={reqItem.id} className="p-3.5 rounded-xl bg-slate-800/70 border border-slate-700/80 space-y-2 hover:border-purple-500/40 transition">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white uppercase tracking-tight">{reqItem.genericName}</h4>
                          {reqItem.brandName && (
                            <span className="text-xs bg-slate-700 text-slate-200 px-2 py-0.5 rounded font-medium">
                              تجاري: {reqItem.brandName}
                            </span>
                          )}
                          {reqItem.strength && (
                            <span className="text-xs bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded font-bold">
                              {reqItem.strength}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-1">
                          التصنيف المقترح: <span className="text-slate-300 font-medium">{reqItem.category}</span> • تاريخ الطلب: {new Date(reqItem.requestedAt).toLocaleDateString('ar-YE')}
                        </p>
                        {reqItem.notes && (
                          <p className="text-[11px] bg-slate-900/90 text-slate-300 p-2 rounded-lg mt-1.5 border border-slate-800">
                            💬 ملاحظات الصيدلية/المستخدم: {reqItem.notes}
                          </p>
                        )}
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleRejectPendingDrug(reqItem.id)}
                          className="px-2.5 py-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/60 text-rose-300 border border-rose-800/60 text-xs font-bold transition cursor-pointer"
                        >
                          رفض
                        </button>
                        <button
                          onClick={() => handleApprovePendingDrug(reqItem)}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm cursor-pointer"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>اعتماد وإدراج في الكتالوج</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 border-t border-slate-800 bg-slate-950 flex justify-between items-center text-xs text-slate-400">
              <span>إجمالي الطلبات المعلقة: {pendingRequests.length}</span>
              <button
                onClick={() => setShowAdminReviewModal(false)}
                className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium transition"
              >
                إغلاق
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
