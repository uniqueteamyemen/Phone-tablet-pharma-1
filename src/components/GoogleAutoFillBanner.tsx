import React, { useState } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  X, 
  ShieldCheck, 
  Building2, 
  ArrowLeft,
  UserCheck,
  Zap
} from 'lucide-react';
import { PharmaEntity } from '../types/pharmayemen';
import { 
  DEFAULT_GOOGLE_USER, 
  GOOGLE_PRESET_ENTITIES, 
  buildEntityFromGoogleProfile, 
  GoogleUserProfile,
  markGoogleAutofillPromptAsSeen 
} from '../utils/googleAutoFill';

interface GoogleAutoFillBannerProps {
  onApplyAutofill: (entity: PharmaEntity) => void;
  onDismiss: () => void;
}

export const GoogleAutoFillBanner: React.FC<GoogleAutoFillBannerProps> = ({
  onApplyAutofill,
  onDismiss,
}) => {
  const [selectedProfileIndex, setSelectedProfileIndex] = useState(0);
  const currentProfile = GOOGLE_PRESET_ENTITIES[selectedProfileIndex] || DEFAULT_GOOGLE_USER;

  const handleApply = () => {
    markGoogleAutofillPromptAsSeen();
    const newEntity = buildEntityFromGoogleProfile(currentProfile);
    onApplyAutofill(newEntity);
  };

  const handleClose = () => {
    markGoogleAutofillPromptAsSeen();
    onDismiss();
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:max-w-md z-50 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-slate-900/95 border-2 border-emerald-500/50 text-white rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-xl space-y-3.5 relative overflow-hidden">
        
        {/* Glow Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Top Header & Dismiss */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Google G Logo SVG */}
            <div className="w-7 h-7 rounded-xl bg-white flex items-center justify-center p-1.5 shadow-sm">
              <svg viewBox="0 0 24 24" className="w-full h-full">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.25 21.37 7.33 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.97 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.25 2.63 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                <span>المساعد الذكي للتعبئة ببيانات Google</span>
                <span className="text-[9px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.2 rounded-full font-bold">
                  1-Tap Fill
                </span>
              </span>
            </div>
          </div>

          <button
            onClick={handleClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* User Account Card */}
        <div className="bg-slate-950/70 p-3 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-emerald-500/40 shrink-0 bg-slate-800">
              <img
                src={currentProfile.avatarUrl}
                alt={currentProfile.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-xs text-white truncate">{currentProfile.name}</div>
              <div className="text-[11px] text-slate-400 truncate">{currentProfile.email}</div>
            </div>
            <span className="p-1 rounded-full bg-emerald-500/20 text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
            </span>
          </div>

          {/* Preset Profile Selector (Pharmacy, Distributor, Hospital) */}
          <div className="flex gap-1.5 pt-1">
            {GOOGLE_PRESET_ENTITIES.map((p, idx) => (
              <button
                key={p.facilityType}
                onClick={() => setSelectedProfileIndex(idx)}
                className={`flex-1 py-1 px-1.5 rounded-lg text-[10px] font-bold transition truncate ${
                  selectedProfileIndex === idx
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {p.facilityType === 'pharmacy' && 'صيدلية'}
                {p.facilityType === 'distributor' && 'مستودع'}
                {p.facilityType === 'hospital' && 'مستشفى'}
              </button>
            ))}
          </div>

          {/* Auto-filled details snippet */}
          <div className="text-[11px] text-slate-300 pt-1 border-t border-slate-800/80 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">اسم المنشأة:</span>
              <span className="font-semibold text-emerald-300">{currentProfile.facilityName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">الموقع / المدينة:</span>
              <span>{currentProfile.governorate} - {currentProfile.city}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">رقم الهاتف المرتبط:</span>
              <span className="font-mono text-slate-300">{currentProfile.phone}</span>
            </div>
          </div>
        </div>

        {/* Action Button: 1-Click AutoFill */}
        <div className="flex gap-2">
          <button
            onClick={handleApply}
            className="flex-1 py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-xl text-xs font-black shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
            <span>تعبئة وتأكيد البيانات بضغطة واحدة</span>
          </button>
          <button
            onClick={handleClose}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold transition"
          >
            تخطي
          </button>
        </div>

      </div>
    </div>
  );
};
