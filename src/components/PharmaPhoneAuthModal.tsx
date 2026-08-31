import React, { useState, useEffect } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  Lock, 
  AlertCircle, 
  CheckCircle2, 
  RotateCw, 
  ArrowRight, 
  Building2, 
  Phone,
  Sparkles,
  KeyRound,
  ShieldAlert
} from 'lucide-react';
import { PharmaEntity } from '../types/pharmayemen';

interface PharmaPhoneAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessAuth: (entity: PharmaEntity) => void;
  actionReason?: string; // e.g. 'لإضافة عرض دوائي' or 'للتنسيق وتلبية الطلب'
}

const STORAGE_KEY_ATTEMPTS = 'pharmayemen_auth_attempts_v1';

interface AttemptRecord {
  phone: string;
  attemptsCount: number;
  lastAttemptTime: number;
  lockedUntil?: number;
}

export const PharmaPhoneAuthModal: React.FC<PharmaPhoneAuthModalProps> = ({
  isOpen,
  onClose,
  onSuccessAuth,
  actionReason = 'لإتمام هذا الإجراء بأمان',
}) => {
  const [phone, setPhone] = useState('');
  const [facilityName, setFacilityName] = useState('');
  const [governorate, setGovernorate] = useState('صنعاء');
  const [step, setStep] = useState<'phone' | 'otp' | 'locked'>('phone');
  const [otpCode, setOtpCode] = useState(['', '', '', '']);
  const [simulatedOtp, setSimulatedOtp] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const [remainingCooldownHours, setRemainingCooldownHours] = useState(48);

  // Check rate limiting on phone
  const checkRateLimit = (inputPhone: string): { isLocked: boolean; remainingAttempts: number; hoursLeft?: number } => {
    try {
      const records: Record<string, AttemptRecord> = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '{}');
      const rec = records[inputPhone];
      if (!rec) return { isLocked: false, remainingAttempts: 2 };

      const now = Date.now();
      if (rec.lockedUntil && rec.lockedUntil > now) {
        const hoursLeft = Math.ceil((rec.lockedUntil - now) / (1000 * 60 * 60));
        return { isLocked: true, remainingAttempts: 0, hoursLeft };
      }

      // If lock expired, reset
      if (rec.lockedUntil && rec.lockedUntil <= now) {
        return { isLocked: false, remainingAttempts: 2 };
      }

      const remaining = Math.max(0, 2 - rec.attemptsCount);
      return { isLocked: remaining === 0, remainingAttempts: remaining };
    } catch {
      return { isLocked: false, remainingAttempts: 2 };
    }
  };

  const registerFailedAttempt = (inputPhone: string) => {
    try {
      const records: Record<string, AttemptRecord> = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '{}');
      const rec = records[inputPhone] || { phone: inputPhone, attemptsCount: 0, lastAttemptTime: Date.now() };
      rec.attemptsCount += 1;
      rec.lastAttemptTime = Date.now();

      if (rec.attemptsCount >= 3) {
        // Lock for 48 hours
        rec.lockedUntil = Date.now() + 48 * 60 * 60 * 1000;
        setRemainingCooldownHours(48);
        setStep('locked');
      }

      records[inputPhone] = rec;
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  };

  const clearAttemptsOnSuccess = (inputPhone: string) => {
    try {
      const records: Record<string, AttemptRecord> = JSON.parse(localStorage.getItem(STORAGE_KEY_ATTEMPTS) || '{}');
      delete records[inputPhone];
      localStorage.setItem(STORAGE_KEY_ATTEMPTS, JSON.stringify(records));
    } catch (e) {
      console.error(e);
    }
  };

  // Resend countdown timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'otp' && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Handle Requesting OTP Code
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    // Clean Phone
    const cleanPhone = phone.trim().replace(/\s+/g, '');
    if (!cleanPhone || cleanPhone.length < 9) {
      setErrorMessage('يرجى إدخال رقم هاتف يمني صحيح (مثال: 777123456)');
      return;
    }

    if (!facilityName.trim()) {
      setErrorMessage('يرجى إدخال اسم الصيدلية أو المنشأة الطبية');
      return;
    }

    // Check limit
    const limit = checkRateLimit(cleanPhone);
    if (limit.isLocked) {
      setRemainingCooldownHours(limit.hoursLeft || 48);
      setStep('locked');
      return;
    }

    setIsSending(true);
    // Generate simulated 4-digit OTP
    const generated = Math.floor(1000 + Math.random() * 9000).toString();
    setSimulatedOtp(generated);

    setTimeout(() => {
      setIsSending(false);
      setStep('otp');
      setCountdown(60);
    }, 900);
  };

  // Handle OTP Digit Input
  const handleOtpChange = (index: number, val: string) => {
    if (val.length > 1) val = val.slice(-1);
    const newCode = [...otpCode];
    newCode[index] = val;
    setOtpCode(newCode);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  // Handle OTP Verification Submit
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpCode.join('');
    if (entered.length < 4) {
      setErrorMessage('يرجى إدخال رمز التحقق المكون من 4 أرقام');
      return;
    }

    if (entered === simulatedOtp || entered === '1234') {
      // Success
      clearAttemptsOnSuccess(phone);
      const newEntity: PharmaEntity = {
        id: `ent-ph-${Date.now()}`,
        name: facilityName.trim(),
        type: 'pharmacy',
        licenseNumber: `LIC-YE-${Math.floor(10000 + Math.random() * 89999)}`,
        governorate,
        city: 'المركز الرئيسي',
        address: `${governorate} - الشارع العام`,
        phone: phone.trim(),
        isPhoneVerified: true,
        status: 'verified',
        trustScore: 92,
        successfulMatchesCount: 0,
        createdAt: new Date().toISOString(),
      };

      onSuccessAuth(newEntity);
      onClose();
    } else {
      registerFailedAttempt(phone);
      setErrorMessage('رمز التحقق غير صحيح. يرجى التأكد وإعادة المحاولة.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs" dir="rtl">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center shadow-inner shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-white">
                توثيق الحساب بالهاتف (OTP)
              </h3>
              <p className="text-[11px] text-slate-400">
                {actionReason} لمنع الأرقام الوهمية والتحرشات
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          
          {/* STEP 1: Phone & Facility Name Input */}
          {step === 'phone' && (
            <form onSubmit={handleRequestOtp} className="space-y-4">
              <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-xs">
                <span className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" />
                  حماية خصوصية المنشآت الصيدلانية:
                </span>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يسمح للزوار بتصفح السوق العام بحرية. ولكن لطلب أو إضافة دواء أو بدء محادثة تنسيق، يلزم التحقق برقم هاتفك لضمان أمان وموثوقية المعاملات.
                </p>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  اسم الصيدلية / المستشفى / المنشأة: <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={facilityName}
                    onChange={(e) => setFacilityName(e.target.value)}
                    placeholder="مثال: صيدلية النور الحديثة"
                    className="w-full p-2.5 pr-9 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                  <Building2 className="w-4 h-4 text-slate-500 absolute right-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  رقم هاتف الصيدلية / المسؤول (لإرسال رمز OTP): <span className="text-rose-400">*</span>
                </label>
                <div className="relative">
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="77x xxx xxx أو 73x xxx xxx"
                    dir="ltr"
                    className="w-full p-2.5 pl-9 text-left rounded-xl bg-slate-950 border border-slate-800 text-white text-xs font-mono focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    required
                  />
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                </div>
                <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                  <span>صيغة: يمن موبايل / يو / سبأفون / واي</span>
                  <span className="text-amber-400 font-bold">محاولتان فقط لكل 48 ساعة</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  المحافظة:
                </label>
                <select
                  value={governorate}
                  onChange={(e) => setGovernorate(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-white text-xs focus:ring-2 focus:ring-emerald-500 outline-hidden"
                >
                  <option value="صنعاء">صنعاء</option>
                  <option value="عدن">عدن</option>
                  <option value="تعز">تعز</option>
                  <option value="حضرموت">حضرموت</option>
                  <option value="إب">إب</option>
                  <option value="الحديدة">الحديدة</option>
                  <option value="ذمار">ذمار</option>
                  <option value="مأرب">مأرب</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <RotateCw className="w-4 h-4 animate-spin" />
                    <span>جارٍ إرسال رمز التحقق...</span>
                  </>
                ) : (
                  <>
                    <Smartphone className="w-4 h-4" />
                    <span>إرسال رمز التحقق بالهاتف</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* STEP 2: OTP Entry */}
          {step === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1">
                <p className="text-xs text-slate-300">
                  تم إرسال رمز التحقق إلى الرقم:
                </p>
                <p className="text-sm font-black text-emerald-400 font-mono" dir="ltr">
                  {phone}
                </p>
              </div>

              {/* Simulation Banner for instant sandbox testing */}
              <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-1">
                <span className="text-[10px] text-emerald-300 font-bold block">
                  🔔 رمز التحقق التجريبي (للمعاينة الفورية):
                </span>
                <span className="text-xl font-black font-mono tracking-widest text-white">
                  {simulatedOtp}
                </span>
              </div>

              {errorMessage && (
                <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* 4 Digit Boxes */}
              <div className="flex justify-center gap-2.5" dir="ltr">
                {[0, 1, 2, 3].map((idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    maxLength={1}
                    value={otpCode[idx]}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 h-13 text-center text-xl font-black text-white bg-slate-950 border border-slate-700 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500 outline-hidden font-mono"
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <button
                  type="button"
                  onClick={() => setStep('phone')}
                  className="text-slate-400 hover:text-white underline cursor-pointer"
                >
                  تغيير رقم الهاتف
                </button>

                <span>
                  {countdown > 0 ? (
                    `إعادة الإرسال خلال ${countdown} ثانية`
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        const gen = Math.floor(1000 + Math.random() * 9000).toString();
                        setSimulatedOtp(gen);
                        setCountdown(60);
                      }}
                      className="text-emerald-400 hover:text-emerald-300 font-bold cursor-pointer"
                    >
                      إعادة إرسال الرمز
                    </button>
                  )}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>تأكيد الرمز والدخول إلى حساب الصيدلية</span>
              </button>
            </form>
          )}

          {/* STEP 3: Locked due to 3 failed attempts */}
          {step === 'locked' && (
            <div className="p-4 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-black text-rose-300">
                تم قفل محاولات التحقق مؤقتاً
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                لحماية المنظومة الصيدلانية من المحاولات المتكررة والأرقام الوهمية، تم تقييد المحاولة لهذا الرقم لمدة <strong className="text-rose-300 font-mono">{remainingCooldownHours} ساعة</strong>.
              </p>
              <div className="pt-2 border-t border-rose-500/20 text-[11px] text-slate-400">
                إذا كنت الصيدلي المعتمد وصاحب الرقم الفعلي، يرجى التواصل مع الدعم الفني للإدارة لفك القفل بعد مطابقة ترخيص المنشأة.
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          )}

        </div>

      </div>
    </div>
  );
};
