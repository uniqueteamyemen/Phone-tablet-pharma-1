import React, { useState } from 'react';
import { 
  Building2, 
  ShieldCheck, 
  Plus, 
  MapPin, 
  Phone, 
  CheckCircle2, 
  Search, 
  UserCheck, 
  Sparkles, 
  Lock,
  Crown,
  Flame,
  Filter,
  Check,
  Edit2,
  Trash2,
  RefreshCw,
  ShoppingBag,
  HeartPulse,
  Leaf
} from 'lucide-react';
import { PharmaEntity, PharmaUserRole } from '../types/pharmayemen';

interface PharmaEntitiesViewProps {
  entitiesList: PharmaEntity[];
  currentEntity: PharmaEntity;
  userRole: PharmaUserRole;
  onSelectEntity: (entity: PharmaEntity) => void;
  onOpenUserManager: () => void;
  onAddNewEntity?: (entity: PharmaEntity) => void;
}

export const PharmaEntitiesView: React.FC<PharmaEntitiesViewProps> = ({
  entitiesList,
  currentEntity,
  userRole,
  onSelectEntity,
  onOpenUserManager,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'pharmacy' | 'distributor' | 'beauty_skincare' | 'supplements_nutrition' | 'hospital'>('all');

  const filteredEntities = entitiesList.filter((ent) => {
    if (filterType !== 'all') {
      if (filterType === 'pharmacy' && ent.type !== 'pharmacy') return false;
      if (filterType === 'distributor' && (ent.type !== 'distributor' && ent.type !== 'wholesaler' && ent.type !== 'individual_supplier')) return false;
      if (filterType === 'beauty_skincare' && ent.type !== 'beauty_skincare') return false;
      if (filterType === 'supplements_nutrition' && ent.type !== 'supplements_nutrition') return false;
      if (filterType === 'hospital' && (ent.type !== 'hospital' && ent.type !== 'clinic')) return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ent.name.toLowerCase().includes(q) ||
        ent.city.toLowerCase().includes(q) ||
        ent.governorate.toLowerCase().includes(q) ||
        (ent.phone && ent.phone.includes(q)) ||
        (ent.licenseNumber && ent.licenseNumber.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'pharmacy':
        return { label: 'صيدلية مجتمعية', bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', icon: Building2 };
      case 'distributor':
      case 'wholesaler':
      case 'individual_supplier':
        return { label: 'مورد / مستودع أدوية', bg: 'bg-blue-500/20 text-blue-300 border-blue-500/30', icon: Building2 };
      case 'beauty_skincare':
        return { label: 'مستحضرات بشرة وتجميل', bg: 'bg-pink-500/20 text-pink-300 border-pink-500/30', icon: Sparkles };
      case 'supplements_nutrition':
        return { label: 'مكملات وفيتامينات وأعشاب', bg: 'bg-amber-500/20 text-amber-300 border-amber-500/30', icon: Leaf };
      case 'hospital':
      case 'clinic':
        return { label: 'مستشفى / مركز طبي', bg: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30', icon: HeartPulse };
      default:
        return { label: 'منشأة تجارية / مورد', bg: 'bg-purple-500/20 text-purple-300 border-purple-500/30', icon: ShoppingBag };
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-900/50 text-slate-100" dir="rtl">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30 shadow-inner">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                دليل الجهات والتجار والمنشآت المسجلة
                <span className="text-xs bg-emerald-950 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full font-mono font-bold">
                  {entitiesList.length} جهة
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                استعراض كافة الحسابات المسجلة (صيدليات، موردين، تجار مكملات وبشرة) والتبديل بينها بنقرة واحدة
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={onOpenUserManager}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة / تعديل منشأة جديدة</span>
        </button>
      </div>

      {/* Active Selected Entity Highlight Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-emerald-950/70 border border-emerald-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold bg-emerald-500 text-slate-950 px-2 py-0.5 rounded-md">
                الحساب النشط حالياً في المنصة
              </span>
              <span className="text-xs text-slate-400">
                {currentEntity.governorate} - {currentEntity.city}
              </span>
            </div>
            <h3 className="text-lg font-black text-white mt-1">
              {currentEntity.name}
            </h3>
            <p className="text-xs text-slate-300 mt-0.5 flex items-center gap-2">
              <span>الهاتف: <strong className="text-emerald-300 font-mono" dir="ltr">{currentEntity.phone || 'غير محدد'}</strong></span>
              {currentEntity.licenseNumber && (
                <>
                  <span>•</span>
                  <span>الترخيص: <span className="font-mono text-slate-400">{currentEntity.licenseNumber}</span></span>
                </>
              )}
            </p>
          </div>
        </div>

        <button
          onClick={onOpenUserManager}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-bold transition flex items-center justify-center gap-1.5 shrink-0"
        >
          <Edit2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>تعديل بيانات الحساب النشط</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ابحث بالاسم (مثال: مهذب، صيدلية...) أو المحافظة..."
            className="w-full pl-4 pr-10 py-2.5 text-xs rounded-xl border border-slate-800 bg-slate-900 text-white placeholder-slate-500 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs gap-1 w-full md:w-auto">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'all' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            الكل ({entitiesList.length})
          </button>
          <button
            onClick={() => setFilterType('pharmacy')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'pharmacy' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            صيدليات
          </button>
          <button
            onClick={() => setFilterType('beauty_skincare')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'beauty_skincare' ? 'bg-pink-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            بشرة وتجميل
          </button>
          <button
            onClick={() => setFilterType('supplements_nutrition')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'supplements_nutrition' ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            مكملات وأعشاب
          </button>
          <button
            onClick={() => setFilterType('distributor')}
            className={`px-3 py-1.5 rounded-lg font-bold transition cursor-pointer ${
              filterType === 'distributor' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            مستودعات وموزعين
          </button>
        </div>
      </div>

      {/* Entities Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredEntities.map((ent) => {
          const isSelected = ent.id === currentEntity.id || ent.name === currentEntity.name;
          const badge = getTypeBadge(ent.type);
          const IconComp = badge.icon;

          return (
            <div
              key={ent.id}
              onClick={() => onSelectEntity(ent)}
              className={`p-4 rounded-2xl border transition relative flex flex-col justify-between gap-4 cursor-pointer group ${
                isSelected
                  ? 'bg-slate-900/95 border-emerald-500 ring-2 ring-emerald-500/30 shadow-xl'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                {/* Top badges */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1 ${badge.bg}`}>
                    <IconComp className="w-3 h-3" />
                    <span>{badge.label}</span>
                  </span>

                  {isSelected ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-bold px-2 py-0.5 rounded-md border border-emerald-500/40 flex items-center gap-1">
                      <Check className="w-3 h-3 text-emerald-400" />
                      مفعّل حالياً
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 group-hover:text-emerald-400 transition font-bold">
                      انقر للتبديل
                    </span>
                  )}
                </div>

                {/* Entity Name */}
                <h3 className="font-black text-base text-white group-hover:text-emerald-300 transition line-clamp-1">
                  {ent.name}
                </h3>

                <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                  <span>{ent.governorate} — {ent.city}</span>
                </p>

                {/* Phone and Details */}
                <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-300">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">رقم الهاتف:</span>
                    <span className="font-mono text-emerald-300" dir="ltr">{ent.phone || 'غير مسجل'}</span>
                  </div>
                  {ent.licenseNumber && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">الترخيص / القيد:</span>
                      <span className="font-mono text-slate-300">{ent.licenseNumber}</span>
                    </div>
                  )}
                  {ent.trustScore && (
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">نسبة الموثوقية:</span>
                      <span className="text-amber-400 font-bold">{ent.trustScore}%</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                {isSelected ? (
                  <div className="w-full py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 text-xs font-bold text-center flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>أنت تعمل بهذه الهوية الآن</span>
                  </div>
                ) : (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectEntity(ent);
                    }}
                    className="w-full py-2 rounded-xl bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-200 text-xs font-bold text-center transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                    <span>التبديل واستخدام هذا الحساب</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
