import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Download, 
  Share2, 
  PlusSquare, 
  CheckCircle, 
  HelpCircle, 
  X, 
  Laptop, 
  Zap, 
  WifiOff, 
  ShieldCheck 
} from 'lucide-react';

interface PharmaInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onInstalled: () => void;
}

export const PharmaInstallModal: React.FC<PharmaInstallModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onInstalled,
}) => {
  const [activeDeviceTab, setActiveDeviceTab] = useState<'android' | 'ios' | 'pc'>('android');
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    // Detect OS if possible
    const ua = navigator.userAgent || '';
    if (/iPhone|iPad|iPod/i.test(ua)) {
      setActiveDeviceTab('ios');
    } else if (/Android/i.test(ua)) {
      setActiveDeviceTab('android');
    } else {
      setActiveDeviceTab('pc');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNativeInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setInstallSuccess(true);
        onInstalled();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div className="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                تثبيت PharmaYemen على هاتفك (تطبيق مستقل)
              </h3>
              <p className="text-xs text-slate-400">
                يعمل كأي تطبيق أصيل على الشاشة الرئيسية بدون الحاجة لفتح المتصفح
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
          
          {/* Native Install Button if prompt is ready */}
          {deferredPrompt && !installSuccess && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-emerald-950/80 to-teal-950/80 border border-emerald-500/40 text-center space-y-2">
              <span className="text-xs font-bold text-emerald-300 block">
                الهاتف جاهز للتثبيت الفوري بنقرة واحدة:
              </span>
              <button
                onClick={handleNativeInstall}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition"
              >
                <Download className="w-4 h-4" />
                تثبيت التطبيق على الشاشة الرئيسية الآن
              </button>
            </div>
          )}

          {installSuccess && (
            <div className="p-4 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300 text-center text-xs space-y-1">
              <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto" />
              <p className="font-bold text-sm">تم التثبيت بنجاح!</p>
              <p>ستجد أيقونة التطبيق الآن في شاشة هاتفك الرئيسية كبرنامج مستقل.</p>
            </div>
          )}

          {/* Device Tabs */}
          <div className="flex bg-slate-800/80 p-1 rounded-xl">
            <button
              onClick={() => setActiveDeviceTab('android')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'android' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              هواتف أندرويد (Android / Chrome)
            </button>
            <button
              onClick={() => setActiveDeviceTab('ios')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'ios' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              آيفون وآيباد (iPhone / Safari)
            </button>
            <button
              onClick={() => setActiveDeviceTab('pc')}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition flex items-center justify-center gap-1.5 ${
                activeDeviceTab === 'pc' ? 'bg-emerald-600 text-white shadow' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Laptop className="w-3.5 h-3.5" />
              الكمبيوتر (Chrome/Edge)
            </button>
          </div>

          {/* Instructions for Android */}
          {activeDeviceTab === 'android' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-slate-200 block text-sm">طريقة التثبيت على هواتف أندرويد (Google Chrome):</span>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pr-1">
                <li>
                  اضغط على أيقونة <strong>الخيارات / النقاط الثلاث (⋮)</strong> في أعلى أو أسفل متصفح Chrome.
                </li>
                <li>
                  اختر <strong>"تثبيت التطبيق"</strong> (Install app) أو <strong>"الإضافة إلى الشاشة الرئيسية"</strong> (Add to Home screen).
                </li>
                <li>
                  اضغط على <strong>"تثبيت / إضافة"</strong> (Install).
                </li>
                <li>
                  سيظهر التطبيق كبرنامج مستقل على شاشة هاتفك بأيقونة <strong>PharmaYemen</strong> وبدون شريط المتصفح!
                </li>
              </ol>
            </div>
          )}

          {/* Instructions for iOS */}
          {activeDeviceTab === 'ios' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-slate-200 block text-sm">طريقة التثبيت على آيفون وآيباد (Safari):</span>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed pr-1">
                <li className="flex items-center gap-2">
                  <span>1. اضغط على زر <strong>المشاركة</strong></span>
                  <Share2 className="w-4 h-4 text-blue-400 inline" />
                  <span>في أسفل شاشة متصفح Safari.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span>2. مرر للأسفل واختر <strong>"إضافة إلى الصفحة الرئيسية"</strong></span>
                  <PlusSquare className="w-4 h-4 text-emerald-400 inline" />
                  <span>(Add to Home Screen).</span>
                </li>
                <li>
                  3. اضغط على <strong>"إضافة" (Add)</strong> في أعلى الزاوية.
                </li>
                <li>
                  4. ستتم إضافة أيقونة PharmaYemen إلى شاشتك الرئيسية ويعمل بملء الشاشة فائق السرعة!
                </li>
              </ol>
            </div>
          )}

          {/* Instructions for PC */}
          {activeDeviceTab === 'pc' && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-xl p-4 space-y-3 text-xs">
              <span className="font-bold text-slate-200 block text-sm">التثبيت على الحاسوب المكتبي واللابتوب:</span>
              <p className="text-slate-300 leading-relaxed">
                في شريط العنوان بمتصفح Chrome أو Edge، اضغط على أيقونة الشاشة الصغيرة ذات السهم <strong>(تثبيت التطبيق / Install PharmaYemen)</strong>، وسيعمل كنافذة برنامج مستقل وخفيف.
              </p>
            </div>
          )}

          {/* Features of Installing */}
          <div className="grid grid-cols-3 gap-2 pt-2 text-center text-[11px]">
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
              <Zap className="w-4 h-4 text-amber-400 mx-auto" />
              <div className="font-bold text-white">سرعة فائقة</div>
              <div className="text-[10px] text-slate-400">فتح فوري بملء الشاشة</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
              <WifiOff className="w-4 h-4 text-blue-400 mx-auto" />
              <div className="font-bold text-white">تخزين محلي</div>
              <div className="text-[10px] text-slate-400">حفظ العروض والطلبات</div>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/80 space-y-1">
              <ShieldCheck className="w-4 h-4 text-emerald-400 mx-auto" />
              <div className="font-bold text-white">حماية وخصوصية</div>
              <div className="text-[10px] text-slate-400">بياناتك على جهازك</div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-800 flex justify-end bg-slate-950/60">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-slate-200 hover:bg-slate-700 text-xs font-semibold transition"
          >
            إغلاق
          </button>
        </div>

      </div>
    </div>
  );
};
