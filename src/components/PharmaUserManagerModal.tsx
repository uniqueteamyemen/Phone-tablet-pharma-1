import React, { useState } from 'react';
import { 
  Building2, 
  UserPlus, 
  Edit3, 
  Check, 
  X, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  FileBadge, 
  Trash2,
  AlertCircle,
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { PharmaEntity } from '../types/pharmayemen';
import { 
  DEFAULT_GOOGLE_USER, 
  GOOGLE_PRESET_ENTITIES, 
  buildEntityFromGoogleProfile 
} from '../utils/googleAutoFill';

interface PharmaUserManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEntity: PharmaEntity;
  entitiesList: PharmaEntity[];
  onSelectEntity: (entity: PharmaEntity) => void;
  onSaveEntity: (entity: PharmaEntity) => void;
  onAddNewEntity: (entity: PharmaEntity) => void;
  onDeleteEntity: (entityId: string) => void;
}

export const PharmaUserManagerModal: React.FC<PharmaUserManagerModalProps> = ({
  isOpen,
  onClose,
  currentEntity,
  entitiesList,
  onSelectEntity,
  onSaveEntity,
  onAddNewEntity,
  onDeleteEntity,
}) => {
  const [mode, setMode] = useState<'list' | 'edit' | 'create'>('list');

  // Edit / Create Form State
  const [formData, setFormData] = useState<PharmaEntity>(currentEntity);
  const [formErrors, setFormErrors] = useState<string>('');
  const [showAutofillSuccess, setShowAutofillSuccess] = useState(false);

  if (!isOpen) return null;

  const handleStartEdit = (ent: PharmaEntity) => {
    setFormData(ent);
    setFormErrors('');
    setShowAutofillSuccess(false);
    setMode('edit');
  };

  const handleStartCreate = () => {
    setFormData({
      id: `ent-${Date.now()}`,
      name: '',
      type: 'pharmacy',
      licenseNumber: '',
      governorate: 'صنعاء',
      city: '',
      address: '',
      phone: '',
      status: 'verified',
      createdAt: new Date().toISOString(),
    });
    setFormErrors('');
    setShowAutofillSuccess(false);
    setMode('create');
  };

  // Google 1-Click Autofill Handlers
  const handleApplyGoogleProfile = (presetIdx: number = 0) => {
    const preset = GOOGLE_PRESET_ENTITIES[presetIdx] || DEFAULT_GOOGLE_USER;
    setFormData((prev) => ({
      ...prev,
      name: preset.facilityName,
      type: preset.facilityType,
      licenseNumber: preset.licenseNumber,
      governorate: preset.governorate,
      city: preset.city,
      address: preset.address,
      phone: preset.phone,
    }));
    setShowAutofillSuccess(true);
    setTimeout(() => setShowAutofillSuccess(false), 3000);
  };

  const handleInstantGoogleEntityAdd = (presetIdx: number = 0) => {
    const preset = GOOGLE_PRESET_ENTITIES[presetIdx] || DEFAULT_GOOGLE_USER;
    const newEnt = buildEntityFromGoogleProfile(preset);
    onAddNewEntity(newEnt);
    onSelectEntity(newEnt);
    setMode('list');
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setFormErrors('يرجى كتابة اسم المنشأة / الصيدلية');
      return;
    }

    if (mode === 'create') {
      onAddNewEntity(formData);
      onSelectEntity(formData);
    } else {
      onSaveEntity(formData);
      if (currentEntity.id === formData.id) {
        onSelectEntity(formData);
      }
    }
    setMode('list');
  };

  const yemeniGovernorates = [
    'صنعاء',
    'أمانة العاصمة',
    'عدن',
    'تعز',
    'الحديدة',
    'إب',
    'حضرموت (المكلا)',
    'حضرموت (سيئون)',
    'ذمار',
    'مأرب',
    'لحج',
    'أبين',
    'شبوة',
    'حجة',
    'صعدة',
    'البيضاء',
    'عمران',
    'الضالع',
    'المهرة',
    'ريمة',
    'الجوف',
    'سقطرى',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                {mode === 'list' && 'إدارة المستخدمين والمنشآت الصحية'}
                {mode === 'edit' && 'تعديل بيانات المنشأة / الصيدلية'}
                {mode === 'create' && 'إضافة صيدلية / منشأة صحية جديدة'}
              </h3>
              <p className="text-xs text-slate-400">
                {mode === 'list' && 'يمكنك تخصيص اسم صيدليتك، أو إنشاء وتبديل حسابات المنشآت بسهولة'}
                {mode === 'edit' && 'قم بتحديث الاسم والترخيص ورقم الهاتف المعتمد'}
                {mode === 'create' && 'أدخل بيانات صيدليتك أو مستودعك الجديد للبدء بنشر العروض والطلبات'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          
          {/* View Mode: List of Entities */}
          {mode === 'list' && (
            <div className="space-y-4">
              
              {/* Google 1-Tap Quick Autofill Account Banner */}
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-emerald-500/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-white flex items-center justify-center p-1 shadow-sm">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>تعبئة تلقائية وسريعة ببيانات Google</span>
                        <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                          1-Click AutoFill
                        </span>
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">qpjiu.sea@gmail.com</span>
                </div>
                
                <p className="text-[11px] text-slate-400">
                  هل تريد إضافة أو تعبئة بيانات صيدليتك فوراً دون كتابة يدوية؟ اختر أحد القوالب الذكية:
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <button
                    onClick={() => handleInstantGoogleEntityAdd(0)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-900/60 hover:border-emerald-500/50 border border-slate-700 text-right transition group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-emerald-300 flex items-center justify-between">
                      <span>صيدلية النور الحديثة</span>
                      <Zap className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-[9px] text-slate-400">صنعاء • صيدلية مجتمع</div>
                  </button>

                  <button
                    onClick={() => handleInstantGoogleEntityAdd(1)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-teal-900/60 hover:border-teal-500/50 border border-slate-700 text-right transition group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-teal-300 flex items-center justify-between">
                      <span>مستودع الشفاء للتوزيع</span>
                      <Zap className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-[9px] text-slate-400">عدن • توريد وتوزيع</div>
                  </button>

                  <button
                    onClick={() => handleInstantGoogleEntityAdd(2)}
                    className="p-2 rounded-xl bg-slate-800 hover:bg-blue-900/60 hover:border-blue-500/50 border border-slate-700 text-right transition group"
                  >
                    <div className="text-[11px] font-bold text-white group-hover:text-blue-300 flex items-center justify-between">
                      <span>مستشفى الأمل التخصصي</span>
                      <Zap className="w-3 h-3 text-amber-400" />
                    </div>
                    <div className="text-[9px] text-slate-400">تعز • مركز طبي</div>
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-xs font-bold text-slate-300">المنشآت المسجلة في التطبيق:</span>
                <button
                  onClick={handleStartCreate}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  + إضافة منشأة / صيدلية جديدة
                </button>
              </div>

              <div className="space-y-2.5">
                {entitiesList.map((ent) => {
                  const isCurrent = currentEntity.id === ent.id;
                  return (
                    <div
                      key={ent.id}
                      className={`p-3.5 rounded-xl border transition flex items-center justify-between ${
                        isCurrent
                          ? 'bg-emerald-950/40 border-emerald-500/60 ring-1 ring-emerald-500/30'
                          : 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600'
                      }`}
                    >
                      <div className="space-y-1 text-right flex-1 pr-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-sm text-white">{ent.name}</span>
                          {isCurrent && (
                            <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Check className="w-2.5 h-2.5" /> المنشأة النشطة
                            </span>
                          )}
                          <span className="bg-slate-700 text-slate-300 text-[10px] px-2 py-0.5 rounded-md font-medium">
                            {ent.type === 'pharmacy' && 'صيدلية'}
                            {ent.type === 'distributor' && 'مستودع أدوية'}
                            {ent.type === 'hospital' && 'مستشفى / مركز'}
                            {ent.type === 'wholesaler' && 'تاجر جملة'}
                            {ent.type === 'individual_supplier' && 'مورّد فردي'}
                            {ent.type === 'beauty_skincare' && 'تجميل وبشرة وشعر'}
                            {ent.type === 'supplements_nutrition' && 'مكملات وتغذية'}
                            {ent.type === 'clinic' && 'عيادة / مجمع'}
                          </span>
                        </div>

                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {ent.governorate} {ent.city ? `— ${ent.city}` : ''}
                          </span>
                          {ent.phone && (
                            <span className="flex items-center gap-1">
                              <Phone className="w-3 h-3 text-slate-500" />
                              {ent.phone}
                            </span>
                          )}
                          {ent.licenseNumber && (
                            <span className="flex items-center gap-1">
                              <FileBadge className="w-3 h-3 text-slate-500" />
                              {ent.licenseNumber}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-1.5 pl-1">
                        {!isCurrent && (
                          <button
                            onClick={() => onSelectEntity(ent)}
                            className="px-2.5 py-1.5 bg-slate-700 hover:bg-emerald-600 text-slate-200 hover:text-white rounded-lg text-xs font-semibold transition"
                          >
                            تفعيل
                          </button>
                        )}
                        <button
                          onClick={() => handleStartEdit(ent)}
                          className="p-1.5 bg-slate-700/80 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition"
                          title="تعديل بيانات المنشأة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        {entitiesList.length > 1 && !isCurrent && (
                          <button
                            onClick={() => onDeleteEntity(ent.id)}
                            className="p-1.5 bg-rose-950/40 hover:bg-rose-900/80 text-rose-400 rounded-lg transition"
                            title="حذف المنشأة"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Note */}
              <div className="p-3 bg-slate-800/40 border border-slate-700/60 rounded-xl text-xs text-slate-400 space-y-1">
                <span className="font-bold text-slate-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ملاحظة حول البيانات الأولية:
                </span>
                <p className="leading-relaxed">
                  تم وضع اسم "صيدلية النور" وبعض المنشآت كبيانات نموذجية افتراضية للمعاينة الأولى. يمكنك تعديل الاسم إلى اسم صيدليتك الفعلي أو إضافة صيدليات ومستودعات أخرى في أي وقت.
                </p>
              </div>
            </div>
          )}

          {/* Edit / Create Form */}
          {(mode === 'edit' || mode === 'create') && (
            <form onSubmit={handleFormSubmit} className="space-y-3.5">
              
              {/* Google 1-Click Fill Helper inside Form */}
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-md bg-white flex items-center justify-center p-0.5 shadow-sm">
                    <svg viewBox="0 0 24 24" className="w-full h-full">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                  </div>
                  <div>
                    <span className="text-[11px] font-bold text-slate-200">تعبئة الحقول ببيانات Google المعتمدة</span>
                    <span className="text-[10px] text-slate-400 block">لتفادي الكتابة اليدوية لاسم الصيدلية، الهاتف، والترخيص</span>
                  </div>
                </div>

                <div className="flex gap-1.5">
                  <button
                    type="button"
                    onClick={() => handleApplyGoogleProfile(0)}
                    className="px-2.5 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="تعبئة بيانات صيدلية نموذجية"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>تعبئة الصيدلية</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleApplyGoogleProfile(1)}
                    className="px-2.5 py-1.5 rounded-lg bg-teal-600/20 hover:bg-teal-600/30 text-teal-300 border border-teal-500/40 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                    title="تعبئة بيانات مستودع أدوية"
                  >
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>تعبئة المستودع</span>
                  </button>
                </div>
              </div>

              {showAutofillSuccess && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/50 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>تمت التعبئة التلقائية لجميع الفراغات والبيانات بنجاح! يمكنك تعديل أي حقل إذا أردت.</span>
                </div>
              )}

              {formErrors && (
                <div className="p-2.5 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formErrors}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  اسم الصيدلية / المنشأة الصحية <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="مثال: صيدلية المستقبل الحديثة، مستودع الشفاء، إلخ"
                  className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">نوع المنشأة / النشاط:</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    <option value="pharmacy">صيدلية (Community Pharmacy)</option>
                    <option value="wholesaler">تاجر جملة أدوية ومستلزمات (Wholesaler)</option>
                    <option value="individual_supplier">مورّد فردي / مندوب توريد (Individual Supplier)</option>
                    <option value="beauty_skincare">محل تجميل وعناية بالبشرة والشعر (Beauty & Skincare)</option>
                    <option value="supplements_nutrition">محل مكملات غذائية وتغذية علاجية (Supplements & Nutrition)</option>
                    <option value="distributor">مستودع / وكيل أدوية (Distributor)</option>
                    <option value="hospital">مستشفى / مركز صحي (Hospital)</option>
                    <option value="clinic">عيادة أو مجمع طبي (Clinic)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">المحافظة:</label>
                  <select
                    value={formData.governorate}
                    onChange={(e) => setFormData({ ...formData, governorate: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  >
                    {yemeniGovernorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">المدينة / المديرية:</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="مثال: أمانة العاصمة، صالة، المنصورة"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الهاتف / واتساب:</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="مثال: +967 770 000 000"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">رقم الترخيص / السجل:</label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="مثال: YE-SAN-2024-XXXX"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">العنوان التفصيلي:</label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="الشارع، المعلم الأقرب"
                    className="w-full p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                  />
                </div>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setMode('list')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 text-xs font-semibold transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                >
                  {mode === 'create' ? 'إضافة المنشأة وتفعيلها' : 'حفظ التعديلات'}
                </button>
              </div>
            </form>
          )}

        </div>

        {/* Footer */}
        {mode === 'list' && (
          <div className="px-5 py-3 border-t border-slate-800 flex justify-end bg-slate-950/60">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition"
            >
              إغلاق
            </button>
          </div>
        )}

      </div>
    </div>
  );
};
